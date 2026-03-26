import { useEffect, useState } from "react";
import "./pod.mobile.css";
import { useIntroSessionStatus } from "@/hooks/useIntroSessionStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import { authorizedGetJson } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentCard } from "@/components/tutor/StudentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ApplicationForm } from "@/components/tutor/application-form";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import ParentOnboardingProposal from "@/components/tutor/ParentOnboardingProposal";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
import StudentReportsDialog from "@/components/tutor/StudentReportsDialog";
import StudentTopicConditioningDialog from "@/components/tutor/StudentTopicConditioningDialog";
import type { Student, TutorAssignment, Pod } from "@shared/schema";

interface PodData {
  assignment: TutorAssignment & { pod: Pod };
  students: Student[];
}

export default function TutorPod() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [identitySheetOpen, setIdentitySheetOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [assignmentsDialogOpen, setAssignmentsDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [topicConditioningDialogOpen, setTopicConditioningDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [studentIdentitySheets, setStudentIdentitySheets] = useState<Record<string, any>>({});
  // Force refresh - identity sheet integration

  const {
    data: podData,
    isLoading,
    error,
  } = useQuery<PodData>({
    queryKey: ["/api/tutor/pod"],
    enabled: isAuthenticated && !authLoading,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const {
    data: applications,
    isLoading: applicationsLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/tutor/applications"],
    enabled: isAuthenticated && !authLoading,
  });

  const hasSubmittedApplication = applications && applications.length > 0;
  const hasPendingApplication = applications && applications.some((app: any) => app.status === "pending");
  const hasApprovedApplication = applications && applications.some((app: any) => app.status === "approved");
  const onboardingCompleted = applications && applications.some((app: any) => !!app.onboardingCompletedAt);

  // Redirect to gateway if tutor hasn't completed onboarding (no approved application or no pod assignment)
  useEffect(() => {
    if (!authLoading && !isLoading && !applicationsLoading && isAuthenticated) {
      // If onboarding not completed and no approved application or no pod assignment, redirect to gateway
      if (!onboardingCompleted && (!hasApprovedApplication || !podData?.assignment)) {
        navigate("/operational/tutor/gateway");
      }
    }
  }, [authLoading, isLoading, applicationsLoading, isAuthenticated, hasApprovedApplication, podData, navigate]);

  // Fetch identity sheets for all students
  useEffect(() => {
    if (podData?.students && podData.students.length > 0) {
      const fetchIdentitySheets = async () => {
        const sheets: Record<string, any> = {};
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
          console.log("🔐 Auth token found, adding to headers");
        } else {
          console.warn("⚠️ No Supabase session token - requests may fail on cross-origin");
        }
        console.log("🔍 Fetching identity sheets, API_URL:", API_URL, "hostname:", window.location.hostname);
        for (const student of podData.students) {
          try {
            const path = `/api/tutor/students/${student.id}/identity-sheet`;
            const data = await authorizedGetJson(path);
            if (data && (data.identitySheet || data.personalProfile || data.emotionalInsights || data.academicDiagnosis)) {
              sheets[student.id] = data;
            }
          } catch (error) {
            console.error(`Failed to fetch identity sheet for student ${student.id}:`, error);
          }
        }
        setStudentIdentitySheets(sheets);
      };
      fetchIdentitySheets();
    }
  }, [podData?.students]);

  // Authentication is handled by route protection, no need for manual redirects

  if (authLoading || isLoading || applicationsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  // Show loading/sync state if user is confirmed and pod assignment is expected but not yet loaded
  if (!podData || !podData.assignment) {
    // Check if user is confirmed and should have a pod assignment
    const expectingPodAssignment = applications && applications.some((app: any) => app.status === "confirmed");
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="rounded-2xl border border-primary/15 bg-background p-5 shadow-sm sm:p-7">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Tutor Pod</p>
              <h1 className="text-3xl font-semibold tracking-[-0.01em] md:text-4xl">
                Welcome back, {user?.name?.split(" ")[0] || "Tutor"}.
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Your pod assignment will unlock the live operating layer for students, onboarding, conditioning, and reports.
              </p>
            </div>
          </div>

          {expectingPodAssignment ? (
            <Card className="border-primary/15 bg-background shadow-sm">
              <div className="space-y-5 p-8 text-center sm:p-12">
                <div className="mx-auto max-w-2xl space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Syncing Assignment</p>
                  <h2 className="text-2xl font-semibold tracking-[-0.01em] text-foreground">Pod Assignment Syncing...</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Your pod assignment is being prepared. This may take a few seconds. If this persists, please refresh.
                  </p>
                </div>
                <div className="flex justify-center mt-6">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-primary/15 bg-background shadow-sm">
              <div className="space-y-5 p-8 text-center sm:p-12">
                <div className="mx-auto max-w-2xl space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {hasPendingApplication ? "Application Status" : "Assignment Status"}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.01em] text-foreground">
                    {hasPendingApplication ? "Application Pending" : "No Pod Assignment Yet"}
                  </h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {hasPendingApplication
                      ? "Your application is under review. Once approved, this space becomes your operating view for student training and pod work."
                      : "You do not have any students assigned yet. Pod assignment will unlock your live tutor operating view."}
                  </p>
                </div>

                <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Roster</p>
                    <p className="mt-2 text-sm font-medium text-foreground">Students appear here after pod assignment.</p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Systems</p>
                    <p className="mt-2 text-sm font-medium text-foreground">Identity sheets, conditioning, and reports unlock here.</p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Pod</p>
                    <p className="mt-2 text-sm font-medium text-foreground">Your territory director and pod context live here.</p>
                  </div>
                </div>
                {/* No Apply Now button if user is confirmed or has an application */}
              </div>
            </Card>
          )}

          <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Territorial Tutoring - Founding Team Application</DialogTitle>
              </DialogHeader>
              <ApplicationForm
                onSuccess={() => {
                  setShowApplicationForm(false);
                  toast({
                    title: "Application Submitted!",
                    description: "Thank you for applying. We'll review your application soon.",
                  });
                }}
                onCancel={() => setShowApplicationForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    );
  }

  const { assignment, students } = podData;
  const totalSessions = students.reduce((sum: number, s: any) => sum + (s.sessionProgress || 0), 0);
  const remainingSessions = students.reduce((sum: number, s: any) => {
    const progressTotal = s.parentInfo?.onboarding_type === 'pilot' ? 9 : 8;
    return sum + Math.max(0, progressTotal - (s.sessionProgress || 0));
  }, 0);
  const maxSessions = students.reduce((sum: number, s: any) => {
    return sum + (s.parentInfo?.onboarding_type === 'pilot' ? 9 : 8);
  }, 0);
  const studentsImpacted = students.filter((s: any) => s.sessionProgress > 0).length;
  const selectedStudent = (students as any[]).find((s: any) => s.id === selectedStudentId) || null;

  const firstName = user?.name?.split(" ")[0] || "Tutor";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-2xl border border-primary/15 bg-background p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Tutor Pod</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.01em] md:text-4xl">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                You are training calm execution, response structure, and stability across your active students.
              </p>
            </div>
            <Badge
              className="tutor-pod-badge-mobile bg-primary/20 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-primary border border-primary/30 rounded-md sm:bg-primary/90 sm:text-primary-foreground sm:px-4 sm:py-1.5 sm:font-semibold"
              data-testid="badge-pod-name"
            >
              {assignment.pod.podName}
            </Badge>
          </div>
        </div>

        <div className="tutor-pod-stats">
          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Sessions Done</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl" data-testid="text-sessions-done">
                {totalSessions}
              </p>
            </div>
          </Card>

          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Remaining</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl" data-testid="text-remaining">
                {remainingSessions}
              </p>
            </div>
          </Card>

          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Students Impacted</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl" data-testid="text-students-impacted">
                {studentsImpacted}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Pod Team</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em]">Territory Director and Pod</h2>
              </div>
              <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Team Capacity</p>
                <p className="mt-2 text-sm text-foreground">Pod Members (0/12)</p>
              </div>
              <p className="text-sm text-muted-foreground">Use this to review the TD layer and the tutors operating in your pod.</p>
              <Button className="w-full justify-start text-sm" variant="outline">
                View Team
              </Button>
            </div>
          </Card>

          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Protocol</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em]">Transformation Process</h2>
              </div>
              <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">TT-OS Protocol</p>
                <p className="mt-2 text-sm text-foreground">3-Layer Lens + Boss Battles + Timed Execution = Conditioned Response.</p>
              </div>
              <Button className="w-full justify-start text-sm" variant="outline" asChild>
                <Link to="/responseconditioningsystem">
                  View TT-OS Protocol
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        <Card className="border-primary/15 bg-background shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Today</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em]">Today's Sessions</h2>
              <p className="mt-1 text-sm text-muted-foreground">The live operating window for today’s delivery load.</p>
            </div>
            <div className="rounded-xl border border-primary/15 bg-muted/20 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Scheduled</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">0</p>
            </div>
          </div>
          <div className="border-t border-border/60 px-5 py-10 text-center sm:px-6 sm:py-12">
            <p className="text-base font-medium text-foreground">No sessions scheduled today.</p>
            <p className="mt-2 text-sm text-muted-foreground">Use the time to review identity sheets, proposals, and topic conditioning before the next student block.</p>
          </div>
        </Card>

        {/* Students Cards */}
        <div className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Student Roster</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.01em]">My Assigned Students</h2>
              <p className="mt-1 text-sm text-muted-foreground">Active students, onboarding status, and training systems in one operating view.</p>
            </div>
            <div className="rounded-xl border border-primary/15 bg-muted/20 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Active Students</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{students.length}</p>
            </div>
          </div>

          {students.length === 0 ? (
            <Card className="rounded-2xl border border-primary/15 bg-background p-10 text-center shadow-sm sm:p-12">
              <div className="mx-auto max-w-xl space-y-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Roster Empty</p>
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-foreground">No Students Assigned</h3>
                <p className="text-sm text-muted-foreground">
                  Once students are assigned, this roster becomes the operating layer for onboarding, conditioning, reports, and progress review.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2 2xl:gap-6 tutor-pod-student-cards">
              {students.map((student: any) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  setSelectedStudentId={setSelectedStudentId}
                  setSelectedStudentName={setSelectedStudentName}
                  setIdentitySheetOpen={setIdentitySheetOpen}
                  setTrackingDialogOpen={setTrackingDialogOpen}
                  setAssignmentsDialogOpen={setAssignmentsDialogOpen}
                  setProposalOpen={setProposalOpen}
                  setTopicConditioningDialogOpen={setTopicConditioningDialogOpen}
                  setReportsDialogOpen={setReportsDialogOpen}
                />
              ))}
            </div>
          )}
        </div>

        <StudentIdentitySheet
          open={identitySheetOpen}
          onOpenChange={setIdentitySheetOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          onSaved={async () => {
            // Refresh identity sheet data
            if (selectedStudentId) {
              const { data: { session } } = await supabase.auth.getSession();
              const headers: HeadersInit = {};
              if (session?.access_token) {
                headers.Authorization = `Bearer ${session.access_token}`;
              }
              try {
                const data = await authorizedGetJson(`/api/tutor/students/${selectedStudentId}/identity-sheet`);
                console.log("🔍 Data received after save:", data);
                console.log("🔍 Has any data?", !!(data && (data.identitySheet || data.personalProfile || data.emotionalInsights || data.academicDiagnosis)));
                if (data && (data.identitySheet || data.personalProfile || data.emotionalInsights || data.academicDiagnosis)) {
                  console.log("✅ Setting studentIdentitySheets for:", selectedStudentId);
                  setStudentIdentitySheets((prev) => {
                    const newState = {
                      ...prev,
                      [selectedStudentId]: data,
                    };
                    console.log("📊 New state:", newState);
                    return newState;
                  });
                } else {
                  console.error("❌ No valid data in response");
                }
              } catch (err) {
                console.error("❌ Failed to fetch after save:", err);
              }
            }
            
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
            if (selectedStudentId) {
              queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", selectedStudentId, "workflow-state"] });
            }

            toast({
              title: "Success",
              description: "Identity sheet saved successfully",
            });
          }}
        />

        <ParentOnboardingProposal
          open={proposalOpen}
          onOpenChange={setProposalOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          tutorName={user?.name || "Your Tutor"}
          identitySheetData={studentIdentitySheets[selectedStudentId]}
          parentTopics={((podData?.students as any[]) ?? []).find((s: any) => s.id === selectedStudentId)?.parentInfo?.math_struggle_areas || ""}
        />

        <ViewAssignmentsDialog
          open={assignmentsDialogOpen}
          onOpenChange={setAssignmentsDialogOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
        />

        <ViewTrackingSystemsDialog
          open={trackingDialogOpen}
          onOpenChange={setTrackingDialogOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
        />

        <StudentReportsDialog
          open={reportsDialogOpen}
          onOpenChange={setReportsDialogOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
        />

        <StudentTopicConditioningDialog
          open={topicConditioningDialogOpen}
          onOpenChange={setTopicConditioningDialogOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          parentTopics={selectedStudent?.parentInfo?.math_struggle_areas || ""}
          topicConditioning={selectedStudent?.topicConditioning || null}
          persistedTopicStates={((selectedStudent as any)?.conceptMastery?.topicConditioning?.topics as Record<string, any>) || null}
        />
      </div>
    </DashboardLayout>
  );
}

