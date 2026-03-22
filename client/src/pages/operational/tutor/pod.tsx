import { useEffect, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentCard } from "@/components/tutor/StudentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Target, Calendar, TrendingUp, AlertCircle, FileText, Send, Lock, Check, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ApplicationForm } from "@/components/tutor/application-form";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import ParentOnboardingProposal from "@/components/tutor/ParentOnboardingProposal";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
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
  const [studentIdentitySheets, setStudentIdentitySheets] = useState<Record<string, any>>({});
  // Force refresh - identity sheet integration

  const {
    data: podData,
    isLoading,
    error,
  } = useQuery<PodData>({
    queryKey: ["/api/tutor/pod"],
    enabled: isAuthenticated && !authLoading,
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

  if (!podData || !podData.assignment) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Tutor"}.
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to start your journey? Let's condition responses together.
            </p>
          </div>
          
          <Card className="p-12 text-center border shadow-sm">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {hasPendingApplication ? "Application Pending" : "No Pod Assignment Yet"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {hasPendingApplication 
                ? "Your application is being reviewed. You'll be notified once it's approved and you're assigned to a pod."
                : "You don't have any students assigned yet. Apply here to get started with your first pod."}
            </p>
            {!hasPendingApplication && (
              <Button 
                onClick={() => setShowApplicationForm(true)} 
                size="lg"
                className="gap-2"
                data-testid="button-apply"
              >
                <FileText className="w-5 h-5" />
                Apply Now
              </Button>
            )}
          </Card>

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
  const totalSessions = students.reduce((sum: number, s: any) => sum + s.sessionProgress, 0);
  const remainingSessions = students.reduce((sum: number, s: any) => sum + (16 - s.sessionProgress), 0);
  const maxSessions = students.length * 16;
  const progress = maxSessions > 0 ? (totalSessions / maxSessions) * 100 : 0;
  const studentsImpacted = students.filter((s: any) => s.sessionProgress > 0).length;

  const firstName = user?.name?.split(" ")[0] || "Tutor";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <Badge
              className="bg-primary text-primary-foreground border-primary font-semibold uppercase tracking-wide text-xs px-4 py-1.5 rounded-full"
              data-testid="badge-pod-name"
            >
              {assignment.pod.podName}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            You're training calm execution, one session at a time. Keep showing up!
          </p>
        </div>

        {/* Key Metrics - Prominent Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <p className="text-2xl sm:text-5xl font-bold text-foreground" data-testid="text-sessions-done">
                {totalSessions}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Sessions Done
              </p>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <p className="text-2xl sm:text-5xl font-bold text-foreground" data-testid="text-remaining">
                {remainingSessions}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Remaining
              </p>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <p className="text-2xl sm:text-5xl font-bold text-foreground" data-testid="text-students-impacted">
                {studentsImpacted}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Students Impacted
              </p>
            </div>
          </Card>
        </div>

        {/* Pod Team & Transformation Formula Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Territory Director & Pod Team */}
          <Card className="p-6 border shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Territory Director & Pod Team</h2>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="w-5 h-5" />
                <p>View your TD and fellow tutors in the pod</p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Pod Members (0/12)</span>
                  <br />
                  
                </p>
              </div>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View Team
              </Button>
            </div>
          </Card>

          {/* Right: Transformation Formula */}
          <Card className="p-6 border shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Transformation Formula</h2>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Target className="w-5 h-5" />
                <p>Your personalized roadmap to tutoring excellence</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Blueprint Ready</span>
                  <br />
                  Access your step-by-step formula for transforming student confidence.
                </p>
              </div>
              <Button className="w-full" asChild>
                <Link to="/tutor/blueprint">
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Blueprint
                </Link>
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                asChild
              >
                <Link to="/responseconditioningsystem">
                  <Lock className="w-4 h-4 mr-2" />
                  View TT-OS
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Today's Sessions */}
        <Card className="border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Today's Sessions</h2>
              <span className="text-sm text-muted-foreground">0 scheduled</span>
            </div>
          </div>
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No sessions scheduled today. Take a breather!</p>
          </div>
        </Card>

        {/* Students Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Assigned Students</h2>
          {students.length === 0 ? (
            <Card className="p-12 text-center border shadow-sm">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Students Assigned</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Manage identity sheets and track student progress
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {students.map((student: any) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  studentIdentitySheets={studentIdentitySheets}
                  setSelectedStudentId={setSelectedStudentId}
                  setSelectedStudentName={setSelectedStudentName}
                  setIdentitySheetOpen={setIdentitySheetOpen}
                  setTrackingDialogOpen={setTrackingDialogOpen}
                  setAssignmentsDialogOpen={setAssignmentsDialogOpen}
                  setProposalOpen={setProposalOpen}
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
      </div>
    </DashboardLayout>
  );
}

