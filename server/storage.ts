import { createClient } from "@supabase/supabase-js";
import { db } from "./db";
import {
  User, UpsertUser,
  Pod, InsertPod,
  TutorAssignment, InsertTutorAssignment,
  Student, InsertStudent,
  Session, InsertSession,
  Reflection, InsertReflection,
  AcademicProfile, InsertAcademicProfile,
  StruggleTarget, InsertStruggleTarget,
  VerificationDoc, InsertVerificationDoc,
  TutorApplication, InsertTutorApplication,
  Broadcast, InsertBroadcast,
  RolePermission,
  affiliateCodes,
  weeklyCheckIns,
} from "@shared/schema";

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL!;
// Use service role key if available (bypasses RLS), fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create affiliate code (used by routes.ts)
export async function createAffiliateCode({ affiliateId, code, type, personName, entityName, schoolType }: {
  affiliateId: string;
  code: string;
  type?: string;
  personName?: string;
  entityName?: string;
  schoolType?: string;
}) {
  const text = `
    INSERT INTO affiliate_codes
      (affiliate_id, code, type, person_name, entity_name, school_type, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [affiliateId, code, type, personName, entityName, schoolType, new Date()];
  const result = await (await import('./db')).pool.query(text, values);
  return result.rows[0];
}

// Helper function to transform snake_case to camelCase
export function transformSnakeToCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(transformSnakeToCamel);
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
      result[camelKey] = transformSnakeToCamel(obj[key]);
    }
  }
  return result;
}

type SequentialDocumentStatus =
  | "not_started"
  | "pending_upload"
  | "pending_review"
  | "approved"
  | "rejected";

const INITIAL_TUTOR_DOCUMENT_STATUSES: Record<string, SequentialDocumentStatus> = {
  "1": "pending_upload",
  "2": "not_started",
  "3": "not_started",
  "4": "not_started",
  "5": "not_started",
};

const SEQUENTIAL_TUTOR_DOCUMENT_FIELDS: Record<
  number,
  {
    url: string;
    uploadedAt: string;
    verified: string;
    verifiedBy: string;
    verifiedAt: string;
    rejectionReason: string;
  }
> = {
  1: {
    url: "doc_1_tutor_agreement_url",
    uploadedAt: "doc_1_tutor_agreement_uploaded_at",
    verified: "doc_1_tutor_agreement_verified",
    verifiedBy: "doc_1_tutor_agreement_verified_by",
    verifiedAt: "doc_1_tutor_agreement_verified_at",
    rejectionReason: "doc_1_tutor_agreement_rejection_reason",
  },
  2: {
    url: "doc_2_code_of_conduct_url",
    uploadedAt: "doc_2_code_of_conduct_uploaded_at",
    verified: "doc_2_code_of_conduct_verified",
    verifiedBy: "doc_2_code_of_conduct_verified_by",
    verifiedAt: "doc_2_code_of_conduct_verified_at",
    rejectionReason: "doc_2_code_of_conduct_rejection_reason",
  },
  3: {
    url: "doc_3_emergency_waiver_url",
    uploadedAt: "doc_3_emergency_waiver_uploaded_at",
    verified: "doc_3_emergency_waiver_verified",
    verifiedBy: "doc_3_emergency_waiver_verified_by",
    verifiedAt: "doc_3_emergency_waiver_verified_at",
    rejectionReason: "doc_3_emergency_waiver_rejection_reason",
  },
  4: {
    url: "doc_4_background_auth_url",
    uploadedAt: "doc_4_background_auth_uploaded_at",
    verified: "doc_4_background_auth_verified",
    verifiedBy: "doc_4_background_auth_verified_by",
    verifiedAt: "doc_4_background_auth_verified_at",
    rejectionReason: "doc_4_background_auth_rejection_reason",
  },
  5: {
    url: "doc_5_tax_info_url",
    uploadedAt: "doc_5_tax_info_uploaded_at",
    verified: "doc_5_tax_info_verified",
    verifiedBy: "doc_5_tax_info_verified_by",
    verifiedAt: "doc_5_tax_info_verified_at",
    rejectionReason: "doc_5_tax_info_rejection_reason",
  },
};

function normalizeTutorDocumentStatuses(statuses: any): Record<string, SequentialDocumentStatus> {
  return {
    ...INITIAL_TUTOR_DOCUMENT_STATUSES,
    ...(statuses && typeof statuses === "object" ? statuses : {}),
  };
}

function getSequentialTutorDocumentFields(docStep: number) {
  const fields = SEQUENTIAL_TUTOR_DOCUMENT_FIELDS[docStep];
  if (!fields) {
    throw new Error(`Invalid sequential tutor document step: ${docStep}`);
  }

  return fields;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserVerification(id: string, verified: boolean): Promise<User | undefined>;
  updateUserProfile(id: string, data: { phone?: string | null; bio?: string | null; profileImageUrl?: string | null }): Promise<User | undefined>;

  createPod(pod: InsertPod): Promise<Pod>;
  getPod(id: string): Promise<Pod | undefined>;
  getPods(): Promise<Pod[]>;
  getPodByTD(tdId: string): Promise<Pod | undefined>;
  getPodsByTD(tdId: string): Promise<Pod[]>;
  updatePodTD(podId: string, tdId: string): Promise<void>;

  createTutorAssignment(assignment: InsertTutorAssignment): Promise<TutorAssignment>;
  getTutorAssignment(tutorId: string): Promise<(TutorAssignment & { pod: Pod }) | undefined>;
  getTutorAssignmentsByPod(podId: string): Promise<TutorAssignment[]>;
  updateCertificationStatus(id: string, status: string): Promise<void>;
  deleteTutorAssignment(id: string): Promise<void>;

  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentsByTutor(tutorId: string): Promise<Student[]>;
  updateStudent(id: string, data: Partial<Student>): Promise<Student | undefined>;
  updateStudentProgress(id: string, sessionCount: number, confidenceDelta: number): Promise<void>;

  createSession(session: InsertSession): Promise<Session>;
  getSessionsByTutor(tutorId: string): Promise<Session[]>;
  getSessionsByStudent(studentId: string): Promise<Session[]>;
  getSessionsByPod(podId: string): Promise<Session[]>;

  createReflection(reflection: InsertReflection): Promise<Reflection>;
  getReflectionsByTutor(tutorId: string): Promise<Reflection[]>;

  getAcademicProfile(studentId: string): Promise<AcademicProfile | undefined>;
  upsertAcademicProfile(profile: InsertAcademicProfile): Promise<AcademicProfile>;

  getStruggleTargets(studentId: string): Promise<StruggleTarget[]>;
  createStruggleTarget(target: InsertStruggleTarget): Promise<StruggleTarget>;
  updateStruggleTarget(id: string, data: Partial<InsertStruggleTarget>): Promise<StruggleTarget | undefined>;
  deleteStruggleTarget(id: string): Promise<void>;

  createVerificationDoc(doc: InsertVerificationDoc): Promise<VerificationDoc>;
  getVerificationDocByTutor(tutorId: string): Promise<VerificationDoc | undefined>;
  updateVerificationStatus(tutorId: string, status: string): Promise<void>;

  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  getBroadcasts(userCreatedAt?: string): Promise<Broadcast[]>;
  
  markBroadcastAsRead(userId: string, broadcastId: string): Promise<void>;
  getUnreadBroadcastCount(userId: string, userCreatedAt?: string): Promise<number>;
  getUserBroadcastReads(userId: string): Promise<string[]>; // Returns array of read broadcast IDs

  createTutorApplication(application: InsertTutorApplication): Promise<TutorApplication>;
  getTutorApplicationsByUser(userId: string): Promise<TutorApplication[]>;
  getTutorApplications(): Promise<TutorApplication[]>;
  getTutorApplicationsByStatus(status: "pending" | "approved" | "rejected"): Promise<TutorApplication[]>;
  approveTutorApplication(id: string, reviewedBy: string): Promise<TutorApplication | undefined>;
  rejectTutorApplication(id: string, reviewedBy: string, reason: string): Promise<TutorApplication | undefined>;
  getApprovedTutors(): Promise<User[]>;
  
  // Tutor onboarding document tracking
  updateTutorOnboardingDocument(
    applicationId: string,
    documentType: "trial_agreement" | "parent_consent",
    documentUrl: string
  ): Promise<TutorApplication | undefined>;
  updateTutorSequentialDocument(
    applicationId: string,
    docStep: number,
    documentUrl: string
  ): Promise<TutorApplication | undefined>;
  verifyTutorOnboardingDocument(
    applicationId: string,
    documentType: "trial_agreement" | "parent_consent",
    verifiedBy: string
  ): Promise<TutorApplication | undefined>;
  reviewTutorSequentialDocument(
    applicationId: string,
    docStep: number,
    approved: boolean,
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<TutorApplication | undefined>;
  completeTutorOnboarding(applicationId: string): Promise<TutorApplication | undefined>;

  checkRoleAuthorization(email: string, role: "tutor" | "td" | "coo"): Promise<boolean>;
  addRolePermission(permission: RolePermission): Promise<void>;
  getRolePermissions(): Promise<RolePermission[]>;
  checkTDPodAssignment(email: string): Promise<string | null>;
}

export class SupabaseStorage implements IStorage {
  // Drizzle DB instance for direct queries (used for weekly check-ins, etc.)
  db = db;
  weeklyCheckIns = weeklyCheckIns;

  // Users
  // In-memory cache for the duration of a request (keyed by userId)
  __userCache: Record<string, User | undefined> = {};

  async getUser(id: string): Promise<User | undefined> {
    // Check in-memory cache first
    if (this.__userCache[id]) {
      console.log(`[getUser] Returning cached user for id: ${id}`);
      return this.__userCache[id];
    }
    const start = Date.now();
    try {
      // Explicitly select only user columns to avoid any relationship pollution
      const { data, error } = await supabase
        .from("users")
        .select("id,email,first_name,last_name,phone,bio,profile_image_url,password,role,name,grade,school,verified,created_at,updated_at")
        .eq("id", id)
        .maybeSingle();
      const elapsed = Date.now() - start;
      console.log(`[getUser] DB query for id: ${id} took ${elapsed}ms`);
      if (error) {
        console.error("❌ Error fetching user:", error);
        return undefined;
      }
      if (!data) {
        return undefined;
      }
      // Transform snake_case to camelCase
      const user = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        bio: data.bio,
        profileImageUrl: data.profile_image_url,
        password: data.password,
        role: data.role,
        name: data.name,
        grade: data.grade,
        school: data.school,
        verified: data.verified,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      // Validate role is one of the expected values
      const validRoles = ["parent", "student", "tutor", "td", "affiliate", "od", "coo", "hr", "ceo"];
      if (!validRoles.includes(data.role as string)) {
        console.error("❌ INVALID ROLE DETECTED:", data.role, "for user", id);
        console.error("   Full user data:", JSON.stringify(data));
      }
      // Store in cache for this request
      this.__userCache[id] = user as User;
      return user as User;
    } catch (err) {
      console.error("Exception in getUser:", err);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Explicitly select only user columns to avoid any relationship pollution
      const { data, error } = await supabase
        .from("users")
        .select("id,email,first_name,last_name,phone,bio,profile_image_url,password,role,name,grade,school,verified,created_at,updated_at")
        .eq("email", email)
        .maybeSingle();
      
      if (error) {
        console.error("❌ Error fetching user by email:", error);
        return undefined;
      }
      
      if (!data) {
        return undefined;
      }
      
      // Transform snake_case to camelCase
      const user = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        bio: data.bio,
        profileImageUrl: data.profile_image_url,
        password: data.password,
        role: data.role,
        name: data.name,
        grade: data.grade,
        school: data.school,
        verified: data.verified,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      // Validate role is one of the expected values
      const validRoles = ["parent", "student", "tutor", "td", "affiliate", "od", "coo", "hr", "ceo"];
      if (!validRoles.includes(data.role as string)) {
        console.error("❌ INVALID ROLE DETECTED:", data.role, "for email", email);
        console.error("   Full user data:", JSON.stringify(data));
      }
      
      return user as User;
    } catch (err) {
      console.error("Exception in getUserByEmail:", err);
      return undefined;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const { data } = await supabase.from("users").select("id,email,first_name,last_name,phone,bio,profile_image_url,password,role,name,grade,school,verified,created_at,updated_at").eq("role", role);
    if (!data) return [];
    
    // Transform snake_case to camelCase
    return data.map(d => ({
      id: d.id,
      email: d.email,
      firstName: d.first_name,
      lastName: d.last_name,
      phone: d.phone,
      bio: d.bio,
      profileImageUrl: d.profile_image_url,
      password: d.password,
      role: d.role,
      name: d.name,
      grade: d.grade,
      school: d.school,
      verified: d.verified,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async upsertUser(user: any): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        bio: user.bio,
        profile_image_url: user.profileImageUrl,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "User",
      })
      .select("id,email,first_name,last_name,phone,bio,profile_image_url,password,role,name,grade,school,verified,created_at,updated_at")
      .single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!data) throw new Error("Failed to upsert user");
    
    // Transform snake_case to camelCase
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      bio: data.bio,
      profileImageUrl: data.profile_image_url,
      password: data.password,
      role: data.role,
      name: data.name,
      grade: data.grade,
      school: data.school,
      verified: data.verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as User;
  }

  async updateUserVerification(id: string, verified: boolean): Promise<User | undefined> {
    const { data } = await supabase.from("users").update({ verified, updated_at: new Date() }).eq("id", id).select("id,email,first_name,last_name,phone,bio,profile_image_url,password,role,name,grade,school,verified,created_at,updated_at").single();
    if (!data) return undefined;
    
    // Transform snake_case to camelCase
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      bio: data.bio,
      profileImageUrl: data.profile_image_url,
      password: data.password,
      role: data.role,
      name: data.name,
      grade: data.grade,
      school: data.school,
      verified: data.verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as User;
  }

  async updateUserProfile(id: string, data: { phone?: string | null; bio?: string | null; profileImageUrl?: string | null }): Promise<User | undefined> {
    const updateData: any = { updated_at: new Date() };
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profileImageUrl !== undefined) updateData.profile_image_url = data.profileImageUrl;

    const { data: result } = await supabase.from("users").update(updateData).eq("id", id).select("id,email,first_name,last_name,phone,bio,profile_image_url,password,role,name,grade,school,verified,created_at,updated_at").single();
    if (!result) return undefined;
    
    // Transform snake_case to camelCase
    return {
      id: result.id,
      email: result.email,
      firstName: result.first_name,
      lastName: result.last_name,
      phone: result.phone,
      bio: result.bio,
      profileImageUrl: result.profile_image_url,
      password: result.password,
      role: result.role,
      name: result.name,
      grade: result.grade,
      school: result.school,
      verified: result.verified,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    } as User;
  }

  // Pods
  async createPod(pod: any): Promise<Pod> {
    console.log("💾 Inserting pod into database:", pod);
    const dbPod = {
      pod_name: pod.podName,
      pod_type: pod.podType,
      phase: pod.phase,
      td_id: pod.tdId,
      status: pod.status,
      start_date: pod.startDate,
      end_date: pod.endDate,
    };
    const { data, error } = await supabase.from("pods").insert(dbPod).select().single();
    if (error) {
      console.error("❌ Supabase error creating pod:", error);
      throw new Error(`Failed to create pod: ${error.message}`);
    }
    if (!data) {
      console.error("❌ No data returned from pod creation");
      throw new Error("Failed to create pod: No data returned");
    }
    console.log("✅ Pod created in database:", data);
    return data;
  }

  async getPod(id: string): Promise<Pod | undefined> {
    const { data } = await supabase.from("pods").select("*").eq("id", id).maybeSingle();
    if (!data) return undefined;
    // Transform snake_case to camelCase
    return {
      id: data.id,
      podName: data.pod_name,
      podType: data.pod_type,
      vehicle: data.vehicle,
      phase: data.phase,
      tdId: data.td_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      deletedAt: data.deleted_at,
      createdAt: data.created_at,
    };
  }

  async getPods(): Promise<Pod[]> {
    const { data } = await supabase.from("pods").select("*").is("deleted_at", null);
    if (!data) return [];
    // Transform snake_case to camelCase
    return data.map((pod: any) => ({
      id: pod.id,
      podName: pod.pod_name,
      podType: pod.pod_type,
      vehicle: pod.vehicle,
      phase: pod.phase,
      tdId: pod.td_id,
      status: pod.status,
      startDate: pod.start_date,
      endDate: pod.end_date,
      deletedAt: pod.deleted_at,
      createdAt: pod.created_at,
    }));
  }

  async getDeletedPods(): Promise<Pod[]> {
    const { data } = await supabase.from("pods").select("*").not("deleted_at", "is", null);
    if (!data) return [];
    // Transform snake_case to camelCase
    return data.map((pod: any) => ({
      id: pod.id,
      podName: pod.pod_name,
      podType: pod.pod_type,
      vehicle: pod.vehicle,
      phase: pod.phase,
      tdId: pod.td_id,
      status: pod.status,
      startDate: pod.start_date,
      endDate: pod.end_date,
      deletedAt: pod.deleted_at,
      createdAt: pod.created_at,
    }));
  }

  async deletePod(podId: string): Promise<void> {
    // Soft delete: set deleted_at timestamp and clear td_id
    await supabase
      .from("pods")
      .update({ deleted_at: new Date().toISOString(), td_id: null })
      .eq("id", podId);
  }

  async getPodByTD(tdId: string): Promise<Pod | undefined> {
    const { data } = await supabase
      .from("pods")
      .select("*")
      .eq("td_id", tdId)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    if (!data) return undefined;
    // Transform snake_case to camelCase
    return {
      id: data.id,
      podName: data.pod_name,
      podType: data.pod_type,
      vehicle: data.vehicle,
      phase: data.phase,
      tdId: data.td_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      deletedAt: data.deleted_at,
      createdAt: data.created_at,
    };
  }

  async getPodsByTD(tdId: string): Promise<Pod[]> {
    const { data } = await supabase
      .from("pods")
      .select("*")
      .eq("td_id", tdId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (!data) return [];
    // Transform snake_case to camelCase
    return data.map(pod => ({
      id: pod.id,
      podName: pod.pod_name,
      podType: pod.pod_type,
      vehicle: pod.vehicle,
      phase: pod.phase,
      tdId: pod.td_id,
      status: pod.status,
      startDate: pod.start_date,
      endDate: pod.end_date,
      deletedAt: pod.deleted_at,
      createdAt: pod.created_at,
    }));
  }

  async updatePodTD(podId: string, tdId: string): Promise<void> {
    await supabase.from("pods").update({ td_id: tdId }).eq("id", podId);
  }

  // Tutor Assignments
  async createTutorAssignment(assignment: any): Promise<TutorAssignment> {
    const dbAssignment = {
      tutor_id: assignment.tutorId,
      pod_id: assignment.podId,
      student_count: assignment.studentCount || 0,
      certification_status: assignment.certificationStatus,
    };
    const { data } = await supabase.from("tutor_assignments").insert(dbAssignment).select().single();
    if (!data) throw new Error("Failed to create tutor assignment");
    // Transform snake_case to camelCase
    return {
      id: data.id,
      tutorId: data.tutor_id,
      podId: data.pod_id,
      studentCount: data.student_count,
      certificationStatus: data.certification_status,
      createdAt: data.created_at,
    };
  }

  async getTutorAssignment(tutorId: string): Promise<(TutorAssignment & { pod: Pod }) | undefined> {
    console.log("🔍 Looking for tutor assignment for tutorId:", tutorId);
    const { data, error } = await supabase.from("tutor_assignments").select("*").eq("tutor_id", tutorId).maybeSingle();
    if (error) {
      console.log("ℹ️ No assignment found (expected for single()):", error.message);
    }
    if (!data) {
      console.log("❌ No assignment data returned");
      return undefined;
    }
    console.log("✅ Found assignment:", JSON.stringify(data, null, 2));
    const pod = await this.getPod(data.pod_id);
    if (!pod) {
      console.log("❌ Pod not found for pod_id:", data.pod_id);
      return undefined;
    }
    // Transform snake_case to camelCase
    return {
      id: data.id,
      tutorId: data.tutor_id,
      podId: data.pod_id,
      studentCount: data.student_count,
      certificationStatus: data.certification_status,
      createdAt: data.created_at,
      pod,
    };
  }

  async getTutorAssignmentsByPod(podId: string): Promise<TutorAssignment[]> {
    const { data } = await supabase.from("tutor_assignments").select("*").eq("pod_id", podId);
    if (!data) return [];
    // Transform snake_case to camelCase
    return data.map((assignment: any) => ({
      id: assignment.id,
      tutorId: assignment.tutor_id,
      podId: assignment.pod_id,
      studentCount: assignment.student_count,
      certificationStatus: assignment.certification_status,
      createdAt: assignment.created_at,
    }));
  }

  async updateCertificationStatus(id: string, status: string): Promise<void> {
    await supabase.from("tutor_assignments").update({ certification_status: status }).eq("id", id);
  }

  async deleteTutorAssignment(id: string): Promise<void> {
    await supabase.from("tutor_assignments").delete().eq("id", id);
  }

  // Students
  async createStudent(student: any): Promise<Student> {
    // Bulletproof parent_id assignment with explicit logging
    let parentId: string | null = (student as any).parent_id || null;
    if (!parentId && student.parentContact) {
      const { data: parentRow, error: parentLookupError } = await supabase
        .from("parent_enrollments")
        .select("user_id")
        .eq("parent_email", student.parentContact)
        .maybeSingle();
      if (parentLookupError) {
        console.error("[createStudent] Error looking up parent_enrollments:", parentLookupError);
      }
      if (parentRow && parentRow.user_id) {
        parentId = parentRow.user_id;
      } else {
        console.error("[createStudent] No parent_enrollments row found for parentContact:", student.parentContact);
      }
    }
    if (!parentId) {
      console.error("[createStudent] Failed to resolve parent_id for student:", student);
      throw new Error("Cannot create student without parent_id. Provide parent_id or valid parentContact.");
    }
    // Ensure all required fields are present
    if (!student.name || !student.grade || !student.tutorId) {
      console.error("[createStudent] Missing required student fields:", student);
      throw new Error("Missing required student fields (name, grade, tutorId)");
    }
    const dbStudent = {
      name: student.name,
      grade: student.grade,
      tutor_id: student.tutorId,
      session_progress: student.sessionProgress ?? 0,
      concept_mastery: student.conceptMastery ?? {},
      confidence_score: student.confidenceScore ?? 5,
      parent_contact: student.parentContact,
      parent_id: parentId,
    };
    const { data, error: insertError } = await supabase.from("students").insert(dbStudent).select().single();
    if (insertError) {
      console.error("[createStudent] Supabase insert error:", insertError, dbStudent);
      throw new Error("Failed to create student: " + insertError.message);
    }
    if (!data) {
      console.error("[createStudent] Supabase insert returned no data:", dbStudent);
      throw new Error("Failed to create student: No data returned");
    }
    return transformSnakeToCamel(data);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const { data } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
    if (!data) return undefined;
    return transformSnakeToCamel(data);
  }

  async getStudentsByTutor(tutorId: string): Promise<Student[]> {
    const { data } = await supabase.from("students").select("*").eq("tutor_id", tutorId);
    if (!data) return [];
    return (data ?? [])
      .filter(student => student.id && student.id.trim() !== "")
      .map(student => transformSnakeToCamel(student));
  }

  async updateStudentProgress(id: string, sessionCount: number, confidenceDelta: number): Promise<void> {
    const student = await this.getStudent(id);
    if (!student) return;
    const confidenceScore = Math.max(0, Math.min(10, (student.confidenceScore ?? 5) + confidenceDelta));
    await supabase.from("students").update({ session_progress: sessionCount, confidence_score: confidenceScore, updated_at: new Date() }).eq("id", id);
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student | undefined> {
    // Convert camelCase keys to snake_case for database
    const dbData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt') continue; // Skip readonly fields
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      dbData[snakeKey] = value;
    }

    const { data: updated, error } = await supabase
      .from("students")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating student:", error);
      return undefined;
    }

    return transformSnakeToCamel(updated);
  }

  // Session
  async createSession(session: any): Promise<Session> {
    const dbSession = {
      tutor_id: session.tutorId,
      student_id: session.studentId,
      date: session.date,
      duration: session.duration,
      notes: session.notes,
      vocabulary_notes: session.vocabularyNotes,
      method_notes: session.methodNotes,
      reason_notes: session.reasonNotes,
      student_response: session.studentResponse,
      confidence_change: session.confidenceChange,
      tutor_growth_reflection: session.tutorGrowthReflection,
      boss_battles_done: session.bossBattlesDone,
      practice_problems: session.practiceProblems,
      confidence_score_delta: session.confidenceScoreDelta,
    };
    const { data } = await supabase.from("tutoring_sessions").insert(dbSession).select().single();
    if (!data) throw new Error("Failed to create session");
    return transformSnakeToCamel(data) as Session;
  }

  async getSessionsByTutor(tutorId: string): Promise<Session[]> {
    const { data } = await supabase.from("tutoring_sessions").select("*").eq("tutor_id", tutorId).order("date", { ascending: false });
    return (data ?? []).map(transformSnakeToCamel) as Session[];
  }

  async getSessionsByStudent(studentId: string): Promise<Session[]> {
    const { data } = await supabase.from("tutoring_sessions").select("*").eq("student_id", studentId).order("date", { ascending: false });
    return (data ?? []).map(transformSnakeToCamel) as Session[];
  }

  async getSessionsByPod(podId: string): Promise<Session[]> {
    // Get all tutors in this pod, then get all their sessions
    const { data: assignments } = await supabase
      .from("tutor_assignments")
      .select("tutor_id")
      .eq("pod_id", podId);
    
    if (!assignments || assignments.length === 0) {
      return [];
    }

    const tutorIds = assignments.map((a: any) => a.tutor_id);
    
    // Get all sessions for these tutors
    const { data } = await supabase
      .from("tutoring_sessions")
      .select("*")
      .in("tutor_id", tutorIds)
      .order("date", { ascending: false });
    
    return (data ?? []).map(transformSnakeToCamel) as Session[];
  }

  // Reflections
  async createReflection(reflection: any): Promise<Reflection> {
    const { data } = await supabase.from("reflections").insert({
      tutor_id: reflection.tutorId,
      date: reflection.date,
      reflection_text: reflection.reflectionText,
      habit_score: reflection.habitScore,
    }).select("id, tutor_id, date, reflection_text, habit_score, created_at");
    
    if (!data || data.length === 0) throw new Error("Failed to create reflection");
    
    const row = data[0];
    return {
      id: row.id,
      tutorId: row.tutor_id,
      reflectionText: row.reflection_text,
      habitScore: row.habit_score,
      date: row.date,
      createdAt: row.created_at,
    } as Reflection;
  }

  async getReflectionsByTutor(tutorId: string): Promise<Reflection[]> {
    const { data } = await supabase
      .from("reflections")
      .select("id, tutor_id, date, reflection_text, habit_score, created_at")
      .eq("tutor_id", tutorId)
      .order("date", { ascending: false });
    
    if (!data) return [];
    
    return data.map(row => ({
      id: row.id,
      tutorId: row.tutor_id,
      reflectionText: row.reflection_text,
      habitScore: row.habit_score,
      date: row.date,
      createdAt: row.created_at,
    } as Reflection));
  }

  // Academic Profiles (School Tracker)
  async getAcademicProfile(studentId: string): Promise<AcademicProfile | undefined> {
    const { data } = await supabase
      .from("academic_profiles")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();
    
    if (!data) return undefined;
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      studentId: data.student_id,
      fullName: data.full_name,
      grade: data.grade,
      school: data.school,
      latestTermReport: data.latest_term_report,
      myThoughts: data.my_thoughts,
      currentChallenges: data.current_challenges,
      recentWins: data.recent_wins,
      upcomingExamsProjects: data.upcoming_exams_projects,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async upsertAcademicProfile(profile: any): Promise<AcademicProfile> {
    const dbProfile = {
      student_id: profile.studentId,
      full_name: profile.fullName,
      grade: profile.grade,
      school: profile.school,
      latest_term_report: profile.latestTermReport,
      my_thoughts: profile.myThoughts,
      current_challenges: profile.currentChallenges,
      recent_wins: profile.recentWins,
      upcoming_exams_projects: profile.upcomingExamsProjects,
    };
    const { data, error } = await supabase
      .from("academic_profiles")
      .upsert(dbProfile, { onConflict: "student_id" })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("Supabase upsert error:", error);
      throw new Error(`Failed to save academic profile: ${error.message}`);
    }
    if (!data) throw new Error("Failed to save academic profile");
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      studentId: data.student_id,
      fullName: data.full_name,
      grade: data.grade,
      school: data.school,
      latestTermReport: data.latest_term_report,
      myThoughts: data.my_thoughts,
      currentChallenges: data.current_challenges,
      recentWins: data.recent_wins,
      upcomingExamsProjects: data.upcoming_exams_projects,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // Struggle Targets (Target Center)
  async getStruggleTargets(studentId: string): Promise<StruggleTarget[]> {
    const { data } = await supabase
      .from("struggle_targets")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    
    // Map snake_case to camelCase
    return (data ?? []).map((item: any) => ({
      id: item.id,
      studentId: item.student_id,
      subject: item.subject,
      topicConcept: item.topic_concept,
      myStruggle: item.my_struggle,
      strategy: item.strategy,
      consolidationDate: item.consolidation_date,
      overcame: item.overcame,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async createStruggleTarget(target: any): Promise<StruggleTarget> {
    const dbTarget = {
      student_id: target.studentId,
      subject: target.subject,
      topic_concept: target.topicConcept,
      my_struggle: target.myStruggle,
      strategy: target.strategy,
      consolidation_date: target.consolidationDate,
    };
    const { data, error } = await supabase
      .from("struggle_targets")
      .insert(dbTarget)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Failed to create struggle target: ${error.message}`);
    }
    if (!data) throw new Error("Failed to create struggle target - no data returned");
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      studentId: data.student_id,
      subject: data.subject,
      topicConcept: data.topic_concept,
      myStruggle: data.my_struggle,
      strategy: data.strategy,
      consolidationDate: data.consolidation_date,
      overcame: data.overcame,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateStruggleTarget(
    id: string,
    updates: any
  ): Promise<StruggleTarget | undefined> {
    const dbUpdates: any = { updated_at: new Date() };
    if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
    if (updates.topicConcept !== undefined) dbUpdates.topic_concept = updates.topicConcept;
    if (updates.myStruggle !== undefined) dbUpdates.my_struggle = updates.myStruggle;
    if (updates.strategy !== undefined) dbUpdates.strategy = updates.strategy;
    if (updates.consolidationDate !== undefined) dbUpdates.consolidation_date = updates.consolidationDate;
    if ((updates as any).overcame !== undefined) dbUpdates.overcame = (updates as any).overcame;

    const { data, error } = await supabase
      .from("struggle_targets")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase update error:", error);
      throw new Error(`Failed to update struggle target: ${error.message}`);
    }
    
    if (!data) return undefined;
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      studentId: data.student_id,
      subject: data.subject,
      topicConcept: data.topic_concept,
      myStruggle: data.my_struggle,
      strategy: data.strategy,
      consolidationDate: data.consolidation_date,
      overcame: data.overcame,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteStruggleTarget(id: string): Promise<void> {
    await supabase.from("struggle_targets").delete().eq("id", id);
  }

  // Verification Docs
  async createVerificationDoc(doc: any): Promise<VerificationDoc> {
    const dbDoc = {
      tutor_id: doc.tutorId,
      file_url_agreement: doc.fileUrlAgreement,
      file_url_consent: doc.fileUrlConsent,
      status: doc.status,
    };
    const { data } = await supabase.from("verification_docs").insert(dbDoc).select().single();
    if (!data) throw new Error("Failed to create verification doc");
    return data;
  }

  async getVerificationDocByTutor(tutorId: string): Promise<VerificationDoc | undefined> {
    const { data } = await supabase.from("verification_docs").select("*").eq("tutor_id", tutorId).maybeSingle();
    return data ?? undefined;
  }

  async updateVerificationStatus(tutorId: string, status: string): Promise<void> {
    await supabase.from("verification_docs").update({ status, updated_at: new Date() }).eq("tutor_id", tutorId);
  }

  // Broadcasts
  async createBroadcast(broadcast: any): Promise<Broadcast> {
    const dbBroadcast = {
      subject: broadcast.subject,
      message: broadcast.message,
      sender_role: broadcast.senderRole,
      visibility: broadcast.visibility,
    };
    console.log("📝 Inserting broadcast:", JSON.stringify(dbBroadcast, null, 2));
    const { data, error } = await supabase.from("broadcasts").insert(dbBroadcast).select().single();
    if (error) {
      console.error("❌ Supabase insert error:", error);
      throw new Error(`Failed to create broadcast: ${error.message}`);
    }
    if (!data) {
      console.error("❌ No data returned from insert");
      throw new Error("Failed to create broadcast: no data returned");
    }
    
    console.log("✅ Created broadcast data from DB:", JSON.stringify(data, null, 2));
    
    // Transform snake_case to camelCase
    return {
      id: data.id,
      subject: data.subject || "(No Subject)",
      message: data.message,
      senderRole: data.sender_role,
      visibility: data.visibility,
      createdAt: data.created_at,
    };
  }

  async getBroadcasts(userCreatedAt?: string): Promise<Broadcast[]> {
    let query = supabase.from("broadcasts").select("*").order("created_at", { ascending: false });
    
    // Filter broadcasts to only show those created after user's account was created
    if (userCreatedAt) {
      query = query.gte("created_at", userCreatedAt);
    }
    
    const { data } = await query;
    if (!data) return [];
    
    console.log("📊 Total broadcasts fetched:", data.length);
    
    // Transform snake_case to camelCase
    const transformed = data.map((broadcast: any) => {
      const result = {
        id: broadcast.id,
        subject: broadcast.subject || "(No Subject)",
        message: broadcast.message,
        senderRole: broadcast.sender_role,
        visibility: broadcast.visibility,
        createdAt: broadcast.created_at,
      };
      return result;
    });
    
    return transformed;
  }

  // Broadcast Reads (Track which broadcasts users have read)
  async markBroadcastAsRead(userId: string, broadcastId: string): Promise<void> {
    try {
      // Validate broadcast exists
      const { data: broadcast, error: broadcastError } = await supabase
        .from("broadcasts")
        .select("id")
        .eq("id", broadcastId)
        .single();
      
      if (broadcastError || !broadcast) {
        console.error("Broadcast not found:", broadcastId);
        throw new Error("Broadcast not found");
      }
      
      // Validate user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();
      
      if (userError || !user) {
        console.error("User not found:", userId);
        throw new Error("User not found");
      }
      
      // Check if already marked as read
      const { data: existing, error: existingError } = await supabase
        .from("broadcast_reads")
        .select("id")
        .eq("user_id", userId)
        .eq("broadcast_id", broadcastId)
        .single();
      
      // If table doesn't exist, the existingError will have a code
      if (existingError && existingError.code === 'PGRST205') {
        console.warn("⚠️  broadcast_reads table not found. Please run BROADCAST_READS_TABLE.sql in Supabase");
        return;
      }
      
      // Only insert if not already read
      if (!existing) {
        const { error } = await supabase.from("broadcast_reads").insert({
          user_id: userId,
          broadcast_id: broadcastId,
        });
        if (error) {
          // If table doesn't exist, log warning but don't throw
          if (error.code === 'PGRST205') {
            console.warn("⚠️  broadcast_reads table not found. Please run BROADCAST_READS_TABLE.sql in Supabase");
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      // If table doesn't exist (PGRST205), log warning but don't crash
      if (error?.code === 'PGRST205') {
        console.warn("⚠️  broadcast_reads table not found. Please run BROADCAST_READS_TABLE.sql in Supabase");
      } else {
        throw error;
      }
    }
  }

  async getUnreadBroadcastCount(userId: string, userCreatedAt?: string): Promise<number> {
    try {
      // Use direct query to filter by user creation date
      let broadcastQuery = supabase
        .from("broadcasts")
        .select("id, created_at");
      
      // Only show broadcasts created after user's account was created
      if (userCreatedAt) {
        broadcastQuery = broadcastQuery.gte("created_at", userCreatedAt);
      }
      
      const { data: broadcasts } = await broadcastQuery;
      
      if (!broadcasts || broadcasts.length === 0) return 0;

      const broadcastIds = broadcasts.map((b: any) => b.id);
      
      const { data: reads } = await supabase
        .from("broadcast_reads")
        .select("broadcast_id")
        .eq("user_id", userId)
        .in("broadcast_id", broadcastIds);

      const readIds = new Set((reads || []).map((r: any) => r.broadcast_id));
      const unreadCount = broadcastIds.filter((id: string) => !readIds.has(id)).length;
      
      return unreadCount;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  async getUserBroadcastReads(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from("broadcast_reads")
      .select("broadcast_id")
      .eq("user_id", userId);
    
    return (data || []).map((r: any) => r.broadcast_id);
  }

  // Tutor Applications
  async createTutorApplication(application: any): Promise<TutorApplication> {
    const dbApplication = {
      user_id: application.userId,
      full_name: application.fullName,
      age: application.age,
      phone: application.phone,
      email: application.email,
      city: application.city,
      completed_matric: application.completedMatric,
      matric_year: application.matricYear,
      math_level: application.mathLevel,
      math_result: application.mathResult,
      other_subjects: application.otherSubjects,
      current_situation: application.currentSituation,
      current_situation_other: application.currentSituationOther,
      interest_reason: application.interestReason,
      helped_before: application.helpedBefore,
      help_explanation: application.helpExplanation,
      student_dont_get: application.studentDontGet,
      pressure_story: application.pressureStory,
      pressure_response: application.pressureResponse,
      panic_cause: application.panicCause,
      discipline_reason: application.disciplineReason,
      repeat_mistake_response: application.repeatMistakeResponse,
      tt_meaning: application.ttMeaning,
      structure_preference: application.structurePreference,
      hours_per_week: application.hoursPerWeek,
      available_afternoon: application.availableAfternoon,
      final_reason: application.finalReason,
      commitment: application.commitment,
      status: application.status,
    };
    const { data, error } = await supabase
      .from("tutor_applications")
      .insert(dbApplication)
      .select()
      .single();
    if (error) throw new Error(`Failed to create tutor application: ${error.message}`);
    if (!data) throw new Error("Failed to create tutor application: No data returned");
    return data;
  }

  async getTutorApplicationsByUser(userId: string): Promise<TutorApplication[]> {
    const { data } = await supabase
      .from("tutor_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(transformSnakeToCamel) as TutorApplication[];
  }

  async getTutorApplications(): Promise<TutorApplication[]> {
    const { data, error } = await supabase
      .from("tutor_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching tutor applications:", error);
      throw new Error(`Failed to fetch tutor applications: ${error.message}`);
    }
    return (data ?? []).map(transformSnakeToCamel) as TutorApplication[];
  }

  async getTutorApplicationsByStatus(status: "pending" | "approved" | "rejected"): Promise<TutorApplication[]> {
    const { data, error } = await supabase
      .from("tutor_applications")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(`Error fetching tutor applications by status ${status}:`, error);
      throw new Error(`Failed to fetch tutor applications: ${error.message}`);
    }
    return (data ?? []).map(transformSnakeToCamel) as TutorApplication[];
  }

  async approveTutorApplication(id: string, reviewedBy: string): Promise<TutorApplication | undefined> {
    const { data, error } = await supabase
      .from("tutor_applications")
      .update({
        status: "approved",
        reviewed_by: reviewedBy,
        reviewed_at: new Date(),
        document_submission_step: 1,
        documents_status: INITIAL_TUTOR_DOCUMENT_STATUSES,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error approving tutor application:", error);
      return undefined;
    }
    return data ? (transformSnakeToCamel(data) as TutorApplication) : undefined;
  }

  async rejectTutorApplication(id: string, reviewedBy: string, reason: string): Promise<TutorApplication | undefined> {
    const { data } = await supabase
      .from("tutor_applications")
      .update({
        status: "rejected",
        reviewed_by: reviewedBy,
        reviewed_at: new Date(),
        rejection_reason: reason,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();
    return data ?? undefined;
  }

  async getApprovedTutors(): Promise<User[]> {
    const { data: approvedApplications } = await supabase
      .from("tutor_applications")
      .select("user_id")
      .eq("status", "approved");

    if (!approvedApplications || approvedApplications.length === 0) {
      return [];
    }

    const approvedUserIds = approvedApplications.map((app) => app.user_id);

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", approvedUserIds)
      .eq("role", "tutor");

    return users ?? [];
  }

  // Tutor onboarding document methods
  async updateTutorOnboardingDocument(
    applicationId: string,
    documentType: "trial_agreement" | "parent_consent",
    documentUrl: string
  ): Promise<TutorApplication | undefined> {
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };
    
    if (documentType === "trial_agreement") {
      updateData.trial_agreement_url = documentUrl;
      updateData.trial_agreement_uploaded_at = new Date();
    } else {
      updateData.parent_consent_url = documentUrl;
      updateData.parent_consent_uploaded_at = new Date();
    }
    
    const { data, error } = await supabase
      .from("tutor_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating onboarding document:", error);
      return undefined;
    }
    return data ? (transformSnakeToCamel(data) as TutorApplication) : undefined;
  }

  async updateTutorSequentialDocument(
    applicationId: string,
    docStep: number,
    documentUrl: string
  ): Promise<TutorApplication | undefined> {
    const fields = getSequentialTutorDocumentFields(docStep);
    const { data: existing, error: existingError } = await supabase
      .from("tutor_applications")
      .select("documents_status")
      .eq("id", applicationId)
      .single();

    if (existingError) {
      console.error("Error fetching sequential document status:", existingError);
      return undefined;
    }

    const documentsStatus = normalizeTutorDocumentStatuses(existing?.documents_status);
    documentsStatus[docStep.toString()] = "pending_review";

    const updateData: Record<string, any> = {
      document_submission_step: docStep,
      documents_status: documentsStatus,
      updated_at: new Date(),
      [fields.url]: documentUrl,
      [fields.uploadedAt]: new Date(),
      [fields.verified]: false,
      [fields.verifiedBy]: null,
      [fields.verifiedAt]: null,
      [fields.rejectionReason]: null,
    };

    const { data, error } = await supabase
      .from("tutor_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating sequential onboarding document:", error);
      return undefined;
    }

    return data ? (transformSnakeToCamel(data) as TutorApplication) : undefined;
  }

  async verifyTutorOnboardingDocument(
    applicationId: string,
    documentType: "trial_agreement" | "parent_consent",
    verifiedBy: string
  ): Promise<TutorApplication | undefined> {
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };
    
    if (documentType === "trial_agreement") {
      updateData.trial_agreement_verified = true;
      updateData.trial_agreement_verified_by = verifiedBy;
      updateData.trial_agreement_verified_at = new Date();
    } else {
      updateData.parent_consent_verified = true;
      updateData.parent_consent_verified_by = verifiedBy;
      updateData.parent_consent_verified_at = new Date();
    }
    
    const { data, error } = await supabase
      .from("tutor_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();
    
    if (error) {
      console.error("Error verifying onboarding document:", error);
      return undefined;
    }
    return data ? (transformSnakeToCamel(data) as TutorApplication) : undefined;
  }

  async reviewTutorSequentialDocument(
    applicationId: string,
    docStep: number,
    approved: boolean,
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<TutorApplication | undefined> {
    const fields = getSequentialTutorDocumentFields(docStep);
    const { data: existing, error: existingError } = await supabase
      .from("tutor_applications")
      .select("documents_status")
      .eq("id", applicationId)
      .single();

    if (existingError) {
      console.error("Error fetching sequential review state:", existingError);
      return undefined;
    }

    const documentsStatus = normalizeTutorDocumentStatuses(existing?.documents_status);
    const updateData: Record<string, any> = {
      updated_at: new Date(),
      [fields.verified]: approved,
      [fields.verifiedBy]: approved ? reviewedBy : null,
      [fields.verifiedAt]: approved ? new Date() : null,
      [fields.rejectionReason]: approved ? null : (rejectionReason || "Please review and resubmit"),
    };

    if (approved) {
      documentsStatus[docStep.toString()] = "approved";

      if (docStep < 5) {
        const nextStep = (docStep + 1).toString();
        if (documentsStatus[nextStep] !== "approved") {
          documentsStatus[nextStep] = "pending_upload";
        }
        updateData.document_submission_step = docStep + 1;
      } else {
        updateData.document_submission_step = 5;
      }

      if (Object.values(documentsStatus).every((status) => status === "approved")) {
        updateData.status = "confirmed";
      }
    } else {
      documentsStatus[docStep.toString()] = "rejected";
      updateData.document_submission_step = docStep;
    }

    updateData.documents_status = documentsStatus;

    const { data, error } = await supabase
      .from("tutor_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error reviewing sequential onboarding document:", error);
      return undefined;
    }

    return data ? (transformSnakeToCamel(data) as TutorApplication) : undefined;
  }

  async completeTutorOnboarding(applicationId: string): Promise<TutorApplication | undefined> {
    const { data, error } = await supabase
      .from("tutor_applications")
      .update({
        onboarding_completed_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", applicationId)
      .select()
      .single();
    
    if (error) {
      console.error("Error completing onboarding:", error);
      return undefined;
    }
    return data ? (transformSnakeToCamel(data) as TutorApplication) : undefined;
  }

  // Roles
  async checkRoleAuthorization(email: string, role: "tutor" | "td" | "coo"): Promise<boolean> {
    if (role === "tutor") return true;
    const { data } = await supabase.from("role_permissions").select("*").eq("email", email).maybeSingle();
    return data ? data.role === role : false;
  }

  async addRolePermission(permission: RolePermission): Promise<void> {
    await supabase.from("role_permissions").upsert(permission);
  }

  async getRolePermissions(): Promise<RolePermission[]> {
    const { data } = await supabase.from("role_permissions").select("*");
    return data ?? [];
  }

  async checkTDPodAssignment(email: string): Promise<string | null> {
    // First get the user ID from email
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (!user) return null;
    
    // Check if this TD has any assigned pods in the pods table
    const { data: pod } = await supabase
      .from("pods")
      .select("id")
      .eq("td_id", user.id)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    
    return pod?.id ?? null;
  }

  // ============================================
  // AFFILIATE PROSPECTING SYSTEM
  // ============================================

  async getOrCreateAffiliateCode(affiliateId: string): Promise<any> {
    // Check if affiliate already has a code
    const { data: existing } = await supabase
      .from("affiliate_codes")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .maybeSingle();
    
    if (existing) return existing;
    
    // Generate unique code (e.g., AFIX001)
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `AFIX${randomSuffix}`;
    
    const { data: newCode, error } = await supabase
      .from("affiliate_codes")
      .insert({
        affiliate_id: affiliateId,
        code: code,
      })
      .select()
      .single();
    
    if (error) throw error;
    return newCode;
  }

  async getAffiliateCode(affiliateId: string): Promise<any | null> {
    const { data } = await supabase
      .from("affiliate_codes")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .maybeSingle();
    
    return data || null;
  }

  async getAffiliateByCode(code: string): Promise<any | null> {
    const { data } = await supabase
      .from("affiliate_codes")
      .select("affiliate_id, type, person_name, entity_name")
      .eq("code", code)
      .maybeSingle();
    if (!data) return null;
    // Compose affiliate_name: prefer person_name, fallback to entity_name, fallback to null
    let affiliate_name = data.person_name || data.entity_name || null;
    return {
      affiliate_id: data.affiliate_id,
      affiliate_type: data.type || null,
      affiliate_name,
    };
  }

  async logEncounter(affiliateId: string, encounter: any): Promise<any> {
    const { data, error } = await supabase
      .from("encounters")
      .insert({
        affiliate_id: affiliateId,
        parent_name: encounter.parentName,
        parent_email: encounter.parentEmail || null,
        parent_phone: encounter.parentPhone || null,
        child_name: encounter.childName || null,
        child_grade: encounter.childGrade || null,
        date_met: encounter.dateMet || null,
        contact_method: encounter.contactMethod || null,
        discovery_outcome: encounter.discoveryOutcome || null,
        delivery_notes: encounter.deliveryNotes || null,
        final_outcome: encounter.finalOutcome || null,
        result: encounter.result || null,
        confidence_rating: encounter.confidenceRating || null,
        my_thoughts: encounter.myThoughts || null,
        notes: encounter.notes || null,
        status: encounter.finalOutcome === "enrolled" ? "prospect" : encounter.finalOutcome === "objected" ? "objected" : "prospect",
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getEncounters(affiliateId: string): Promise<any[]> {
    const { data } = await supabase
      .from("encounters")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false });
    
    return data || [];
  }

  async updateEncounterStatus(encounterId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from("encounters")
      .update({ status })
      .eq("id", encounterId);
    
    if (error) throw error;
  }

  /**
   * Create a lead for a user/affiliate/encounter, but prevent duplicates.
   * If a lead already exists for the user (and encounter, if provided), return it instead of inserting.
   * Optionally supports leadType for future extensibility.
   */
  async createLead(
    affiliateId: string,
    parentId: string,
    encounterId?: string,
    trackingData?: { trackingSource?: string; trackingCampaign?: string; leadType?: string; affiliateType?: string; affiliateName?: string }
  ): Promise<any> {
    // Use null for organic leads (no affiliate)
    let query = supabase
      .from("leads")
      .select("*")
      .eq("user_id", parentId);
    if (affiliateId) {
      query = query.eq("affiliate_id", affiliateId);
    } else {
      query = query.is("affiliate_id", null);
    }
    if (encounterId) {
      query = query.eq("encounter_id", encounterId);
    }
    const { data: existingLead, error: findError } = await query.maybeSingle();
    if (findError) {
      console.error("[createLead] Error finding existing lead:", findError);
      throw findError;
    }
    if (existingLead) {
      console.log("[createLead] Lead already exists:", existingLead);
      return existingLead;
    }

    // Insert new lead
    const insertObj: any = {
      affiliate_id: affiliateId || null,
      user_id: parentId,
      encounter_id: encounterId || null,
      tracking_source: trackingData?.trackingSource || 'affiliate',
      tracking_campaign: trackingData?.trackingCampaign || null,
      onboarding_type: trackingData?.onboardingType || 'pilot',
      full_name: trackingData?.fullName || '',
    };
    if (trackingData?.leadType) {
      insertObj.lead_type = trackingData.leadType;
    }
    if (trackingData?.affiliateType) {
      insertObj.affiliate_type = trackingData.affiliateType;
    }
    if (trackingData?.affiliateName) {
      insertObj.affiliate_name = trackingData.affiliateName;
    }

    console.log("[createLead] Inserting new lead:", insertObj);
    const { data, error } = await supabase
      .from("leads")
      .insert(insertObj)
      .select()
      .single();
    if (error) {
      console.error("[createLead] Error inserting lead:", error, "Insert object:", insertObj);
      throw error;
    }
    console.log("[createLead] Lead inserted successfully:", data);
    return data;
  }

  async getLeads(affiliateId: string): Promise<any[]> {
    // Get all leads for this affiliate
    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false });
    
    if (!leads) return [];
    
    console.log("📊 Raw leads data from DB:", leads.length, "leads");
    
    // For each lead, get parent and encounter info
    const enriched = await Promise.all(leads.map(async (lead: any) => {
      // Get user info
      const { data: user } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, name")
        .eq("id", lead.user_id)
        .maybeSingle();
      
      // Get encounter info if exists
      let encounterData = null;
      if (lead.encounter_id) {
        const { data: encounter } = await supabase
          .from("encounters")
          .select("*")
          .eq("id", lead.encounter_id)
          .maybeSingle();
        encounterData = encounter;
      }
      
      return {
        lead_id: lead.id,
        encounter_id: lead.encounter_id,
        parent_name: encounterData?.parent_name || user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || null,
        parent_email: encounterData?.parent_email || user?.email || null,
        created_at: lead.created_at,
      };
    }));
    
    console.log("📊 Enriched leads count:", enriched.length);
    return enriched;
  }

  async recordClose(affiliateId: string, parentId: string, studentId: string, podId?: string): Promise<any> {
    // First get the lead
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("affiliate_id", affiliateId)
      .eq("user_id", parentId)
      .maybeSingle();
    
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    const { data, error } = await supabase
      .from("closes")
      .insert({
        affiliate_id: affiliateId,
        parent_id: parentId,
        lead_id: lead.id,
        student_id: studentId,
        pod_id: podId || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getCloses(affiliateId: string): Promise<any[]> {
    // Get all closes for this affiliate
    const { data: closes } = await supabase
      .from("closes")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .order("closed_at", { ascending: false });
    
    if (!closes) return [];
    
    console.log("📊 Raw closes data from DB:", closes.length, "closes");
    
    // For each close, get parent and lead info
    const enriched = await Promise.all(closes.map(async (close: any) => {
      // Get lead info
      const { data: lead } = await supabase
        .from("leads")
        .select("*")
        .eq("id", close.lead_id)
        .maybeSingle();
      
      // Get user info
      const { data: user } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, name")
        .eq("id", close.parent_id)
        .maybeSingle();
      
      // Get encounter info if lead has one
      let encounterData = null;
      if (lead?.encounter_id) {
        const { data: encounter } = await supabase
          .from("encounters")
          .select("*")
          .eq("id", lead.encounter_id)
          .maybeSingle();
        encounterData = encounter;
      }
      
      return {
        close_id: close.id,
        lead_id: close.lead_id,
        encounter_id: lead?.encounter_id || null,
        parent_name: encounterData?.parent_name || user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || null,
        parent_email: encounterData?.parent_email || user?.email || null,
        commission_amount: close.commission_amount,
        commission_status: close.commission_status,
        closed_at: close.closed_at,
        created_at: close.created_at,
      };
    }));
    
    console.log("📊 Enriched closes count:", enriched.length);
    return enriched;
  }

  async getAffiliateStats(affiliateId: string): Promise<any> {
    // Get counts for all statuses
    const [encounters, leads, closes, objected] = await Promise.all([
      supabase
        .from("encounters")
        .select("id", { count: "exact" })
        .eq("affiliate_id", affiliateId),
      supabase
        .from("leads")
        .select("id", { count: "exact" })
        .eq("affiliate_id", affiliateId),
      supabase
        .from("closes")
        .select("id", { count: "exact" })
        .eq("affiliate_id", affiliateId),
      supabase
        .from("encounters")
        .select("id", { count: "exact" })
        .eq("affiliate_id", affiliateId)
        .eq("status", "objected"),
    ]);
    
    return {
      encounters: encounters.count || 0,
      leads: leads.count || 0,
      closes: closes.count || 0,
      objected: objected.count || 0,
    };
  }

  async saveAffiliateReflection(affiliateId: string, reflectionText: string): Promise<any> {
    const { data, error } = await supabase
      .from("affiliate_reflections")
      .upsert({
        affiliate_id: affiliateId,
        reflection_text: reflectionText,
      }, { onConflict: "affiliate_id" })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAffiliateReflection(affiliateId: string): Promise<any | null> {
    const { data } = await supabase
      .from("affiliate_reflections")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .maybeSingle();
    
    return data || null;
  }

  async getAffiliateLeadsByStatus(affiliateId: string): Promise<any> {
    const leads = await this.getLeads(affiliateId);
    const closes = await this.getCloses(affiliateId);
    const encounters = await this.getEncounters(affiliateId);

    const objected = encounters.filter((e: any) => e.status === "objected");
    
    console.log("🔍 DEBUGGING getAffiliateLeadsByStatus for affiliate:", affiliateId);
    console.log("📊 Encounters count:", encounters.length, "Encounters:", encounters.map((e: any) => ({ id: e.id, status: e.status, parent_email: e.parent_email })));
    console.log("📊 Leads count:", leads.length, "Leads:", leads.map((l: any) => ({ lead_id: l.lead_id, encounter_id: l.encounter_id, parent_email: l.parent_email })));
    console.log("📊 Closes count:", closes.length);
    console.log("📊 Objections count:", objected.length);
    
    const breakdown = {
      all: encounters.length,
      leads: leads.length,
      closes: closes.length,
      objections: objected.length,
    };
    
    console.log("📈 Final breakdown:", breakdown);
    return breakdown;
  }

  // Initialize affiliate tables if they don't exist
  async initializeAffiliateTables(): Promise<void> {
    try {
      // Check if affiliate_codes table exists
      const { data, error } = await supabase
        .from("affiliate_codes")
        .select("1")
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, create all affiliate tables
        console.log('📋 Creating affiliate tables...');
        
        const sql = `
          -- Affiliate Codes Table
          CREATE TABLE IF NOT EXISTS affiliate_codes (
            id BIGSERIAL PRIMARY KEY,
            affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            code VARCHAR(20) NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_affiliate_codes_affiliate_id ON affiliate_codes(affiliate_id);
          CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
          
          -- Encounters Table
          CREATE TABLE IF NOT EXISTS encounters (
            id BIGSERIAL PRIMARY KEY,
            affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            parent_name VARCHAR(255) NOT NULL,
            parent_email VARCHAR(255),
            parent_phone VARCHAR(20),
            child_name VARCHAR(255),
            child_grade VARCHAR(50),
            status VARCHAR(50) DEFAULT 'prospect',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_encounters_affiliate_id ON encounters(affiliate_id);
          CREATE INDEX IF NOT EXISTS idx_encounters_status ON encounters(status);
          
          -- Leads Table
          CREATE TABLE IF NOT EXISTS leads (
            id BIGSERIAL PRIMARY KEY,
            affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            encounter_id BIGINT REFERENCES encounters(id) ON DELETE SET NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            lead_type VARCHAR(50),
            status VARCHAR(50) DEFAULT 'open',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_leads_affiliate_id ON leads(affiliate_id);
          CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
          
          -- Closes Table
          CREATE TABLE IF NOT EXISTS closes (
            id BIGSERIAL PRIMARY KEY,
            affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
            parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            commission_amount DECIMAL(10, 2),
            commission_status VARCHAR(50) DEFAULT 'pending',
            closed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_closes_affiliate_id ON closes(affiliate_id);
          CREATE INDEX IF NOT EXISTS idx_closes_commission_status ON closes(commission_status);
          
          -- Affiliate Reflections Table
          CREATE TABLE IF NOT EXISTS affiliate_reflections (
            id BIGSERIAL PRIMARY KEY,
            affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            reflection_type VARCHAR(50),
            content TEXT,
            key_wins TEXT,
            challenges TEXT,
            next_steps TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_affiliate_reflections_affiliate_id ON affiliate_reflections(affiliate_id);
        `;
        
        // Use the Neon SQL client to execute raw SQL
        try {
          const { neon } = await import("@neondatabase/serverless");
          const sqlClient = neon(process.env.DATABASE_URL!);
          // Split and execute statements individually
          const statements = sql.split(';').filter(stmt => stmt.trim());
          for (const statement of statements) {
            if (statement.trim()) {
              await sqlClient(statement);
            }
          }
          console.log('✅ Affiliate tables created successfully');
        } catch (dbError) {
          console.warn('⚠️  Could not create tables via Neon client, tables may need manual creation:', dbError);
        }
      } else if (!error) {
        console.log('✅ Affiliate tables already exist');
      }
    } catch (error) {
      console.error('Error initializing affiliate tables:', error);
    }
  }
}

export const storage = new SupabaseStorage();

// Initialize affiliate tables on startup
storage.initializeAffiliateTables().catch(err => {
  console.error('Failed to initialize affiliate tables:', err);
});

// Re-export db and tables for direct access in routes
export { db };
export { weeklyCheckIns } from "@shared/schema";
