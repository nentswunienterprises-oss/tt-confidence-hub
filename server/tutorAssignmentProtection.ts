import type { TutorTrainingMode } from "@shared/battleTesting";
import { storage, supabase } from "./storage";

export const ACTIVE_PARENT_ENROLLMENT_STATUSES = [
  "awaiting_tutor_acceptance",
  "assigned",
  "proposal_sent",
  "session_booked",
  "report_received",
  "confirmed",
] as const;

const REASSIGNMENT_RESUME_PREFIX = "reassignment_resume:";

function buildReassignmentResumeStep(status: string | null | undefined): string {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) return `${REASSIGNMENT_RESUME_PREFIX}assigned`;
  return `${REASSIGNMENT_RESUME_PREFIX}${normalized}`;
}

export async function safelyUnassignEnrollmentFromTutor(enrollment: any, previousTutorId: string) {
  const studentName = String(enrollment?.student_full_name || "Student").trim() || "Student";
  const parentName = String(enrollment?.parent_full_name || "Parent").trim() || "Parent";
  const nowIso = new Date().toISOString();
  const preserveTrainingProgress = !!enrollment?.proposal_id;
  const preservedCurrentStep = preserveTrainingProgress
    ? buildReassignmentResumeStep(enrollment?.status || enrollment?.current_step || "assigned")
    : "awaiting_assignment";

  let { error: unassignError } = await supabase
    .from("parent_enrollments")
    .update({
      assigned_tutor_id: null,
      status: "awaiting_assignment",
      current_step: preservedCurrentStep,
      proposal_id: preserveTrainingProgress ? enrollment?.proposal_id : null,
      updated_at: nowIso,
    })
    .eq("id", enrollment.id);

  if (unassignError) {
    const message = String((unassignError as any)?.message || "").toLowerCase();
    const missingOptionalColumn = message.includes("current_step") || message.includes("proposal_id");

    if (missingOptionalColumn) {
      const fallback = await supabase
        .from("parent_enrollments")
        .update({
          assigned_tutor_id: null,
          status: "awaiting_assignment",
          proposal_id: preserveTrainingProgress ? enrollment?.proposal_id : null,
          updated_at: nowIso,
        })
        .eq("id", enrollment.id);

      unassignError = fallback.error as any;
    }
  }

  if (unassignError) {
    throw new Error(`Failed to unassign tutor from enrollment ${enrollment.id}: ${unassignError.message}`);
  }

  const clearWorkflow = async (studentId: string) => {
    const student = await storage.getStudent(studentId);
    if (!student) return;

    const existingProfile = (student.personalProfile as any) || {};
    const updatedProfile = {
      ...existingProfile,
      workflow: {
        ...(existingProfile.workflow || {}),
        assignmentAcceptedAt: null,
        assignmentDeclinedAt: null,
      },
    };

    const parentId = (student as any).parentId || null;
    const staleSessionIds = new Set<string>();

    const { data: tutorStudentSessions } = await supabase
      .from("scheduled_sessions")
      .select("id, status")
      .eq("tutor_id", previousTutorId)
      .eq("student_id", studentId)
      .in("type", ["intro", "training"]);

    for (const row of tutorStudentSessions || []) {
      if (String(row.status || "").toLowerCase() !== "completed") {
        staleSessionIds.add(String(row.id));
      }
    }

    if (parentId) {
      const { data: parentOnlyIntroSessions } = await supabase
        .from("scheduled_sessions")
        .select("id, status")
        .eq("tutor_id", previousTutorId)
        .eq("parent_id", parentId)
        .is("student_id", null)
        .eq("type", "intro");

      for (const row of parentOnlyIntroSessions || []) {
        if (String(row.status || "").toLowerCase() !== "completed") {
          staleSessionIds.add(String(row.id));
        }
      }
    }

    if (staleSessionIds.size > 0) {
      await supabase
        .from("scheduled_sessions")
        .delete()
        .in("id", Array.from(staleSessionIds));
    }

    await storage.updateStudent(studentId, {
      personalProfile: updatedProfile,
      tutorId: null,
      updatedAt: nowIso,
    } as any);
  };

  if (enrollment.assigned_student_id) {
    try {
      await clearWorkflow(enrollment.assigned_student_id);
    } catch (error) {
      console.error("Failed to clear workflow for assigned student:", error);
    }
  }

  const { data: linkedStudents } = await supabase
    .from("students")
    .select("id")
    .eq("tutor_id", previousTutorId)
    .eq("parent_enrollment_id", enrollment.id);

  for (const linkedStudent of linkedStudents || []) {
    try {
      await clearWorkflow(linkedStudent.id);
    } catch (error) {
      console.error("Failed to clear workflow for linked student:", linkedStudent.id, error);
    }
  }

  const { data: fallbackStudents } = await supabase
    .from("students")
    .select("id")
    .eq("tutor_id", previousTutorId)
    .eq("parent_id", enrollment.user_id)
    .eq("name", enrollment.student_full_name);

  for (const fallbackStudent of fallbackStudents || []) {
    if (!linkedStudents?.some((ls) => ls.id === fallbackStudent.id)) {
      try {
        await clearWorkflow(fallbackStudent.id);
      } catch (error) {
        console.error("Failed to clear workflow for fallback student:", fallbackStudent.id, error);
      }
    }
  }

  try {
    await storage.createNotification({
      recipientUserId: previousTutorId,
      channel: "informational",
      title: "Assignment Unassigned",
      message: `${studentName} from ${parentName} has been unassigned from your active tutor view. This happened because your current certification mode does not allow live parent assignments. The enrollment has been preserved for reassignment.`,
      link: "/operational/tutor/updates",
      entityType: "assignment_unassigned",
      entityId: String(enrollment.id),
    });
  } catch (error) {
    console.error("Failed to create tutor unassignment notification:", error);
  }
}

export async function cleanupLegacyLiveEnrollmentsForNonLiveTutor(
  tutorId: string,
  certificationMode: TutorTrainingMode
) {
  if (certificationMode === "certified_live") {
    return { detachedCount: 0, detachedEnrollments: [] as any[] };
  }

  let { data: liveEnrollments, error: liveEnrollmentsError } = await supabase
    .from("parent_enrollments")
    .select("id, user_id, student_full_name, assigned_tutor_id, assigned_student_id, status, proposal_id, current_step, is_sandbox_account, parent_full_name, parent_email, student_grade, school_name, math_struggle_areas, previous_tutoring, internet_access, parent_motivation")
    .eq("assigned_tutor_id", tutorId)
    .eq("is_sandbox_account", false)
    .in("status", [...ACTIVE_PARENT_ENROLLMENT_STATUSES]);

  if (liveEnrollmentsError) {
    const message = String((liveEnrollmentsError as any)?.message || "").toLowerCase();
    const missingOptionalColumn =
      message.includes("assigned_student_id") ||
      message.includes("current_step") ||
      message.includes("proposal_id") ||
      message.includes("is_sandbox_account");

    if (missingOptionalColumn) {
      const fallback = await supabase
        .from("parent_enrollments")
        .select("id, user_id, student_full_name, assigned_tutor_id, status, parent_full_name, parent_email, student_grade, school_name, math_struggle_areas, previous_tutoring, internet_access, parent_motivation")
        .eq("assigned_tutor_id", tutorId)
        .in("status", [...ACTIVE_PARENT_ENROLLMENT_STATUSES]);

      liveEnrollments = (fallback.data || []).filter(
        (enrollment: any) => !Boolean(enrollment?.is_sandbox_account)
      );
      liveEnrollmentsError = fallback.error as any;
    }
  }

  if (liveEnrollmentsError) {
    throw new Error(`Failed to load live enrollments for tutor cleanup: ${liveEnrollmentsError.message}`);
  }

  const detachedEnrollments: any[] = [];
  for (const enrollment of liveEnrollments || []) {
    await safelyUnassignEnrollmentFromTutor(enrollment, tutorId);
    detachedEnrollments.push(enrollment);
  }

  return { detachedCount: detachedEnrollments.length, detachedEnrollments };
}
