import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, FileText, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TutorApplication } from "@shared/schema";
import { format } from "date-fns";

export default function TutorApplicationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: applications, isLoading, error } = useQuery<TutorApplication[]>({
    queryKey: ["/api/coo/tutor-applications"],
    enabled: isAuthenticated && !authLoading,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [error, toast]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/coo/tutor-applications/${id}/approve`, {}),
    onSuccess: () => {
      toast({
        title: "Application Approved",
        description: "The tutor application has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest("POST", `/api/coo/tutor-applications/${id}/reject`, { reason }),
    onSuccess: () => {
      toast({
        title: "Application Rejected",
        description: "The tutor application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      setSelectedApplication(null);
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (application: TutorApplication) => {
    approveMutation.mutate(application.id);
  };

  const handleReject = () => {
    if (selectedApplication && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedApplication.id, reason: rejectionReason });
    }
  };

  const pendingApplications = applications?.filter((app) => app.status === "pending") || [];
  const approvedApplications = applications?.filter((app) => app.status === "approved") || [];
  const rejectedApplications = applications?.filter((app) => app.status === "rejected") || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tutor Applications</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and manage tutor applications</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="pending" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-pending">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Pending ({pendingApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-approved">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Approved ({approvedApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-rejected">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Rejected ({rejectedApplications.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pending applications</p>
              </Card>
            ) : (
              pendingApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onApprove={() => handleApprove(application)}
                  onReject={() => {
                    setSelectedApplication(application);
                    setShowRejectDialog(true);
                  }}
                  onViewDetails={() => setSelectedApplication(application)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No approved applications</p>
              </Card>
            ) : (
              approvedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onViewDetails={() => setSelectedApplication(application)}
                  showActions={false}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No rejected applications</p>
              </Card>
            ) : (
              rejectedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onViewDetails={() => setSelectedApplication(application)}
                  showActions={false}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Application Details Dialog */}
        {selectedApplication && !showRejectDialog && (
          <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{(selectedApplication as any).full_names || selectedApplication.fullNames}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date((selectedApplication as any).created_at || selectedApplication.createdAt), "PPP")}
                </DialogDescription>
              </DialogHeader>
              <ApplicationDetails application={selectedApplication} />
              {selectedApplication.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(true);
                    }}
                    data-testid="button-reject-application"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedApplication)}
                    disabled={approveMutation.isPending}
                    data-testid="button-approve-application"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this application.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  data-testid="input-rejection-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                data-testid="button-confirm-reject"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
  onViewDetails,
  showActions = true,
}: {
  application: TutorApplication;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails: () => void;
  showActions?: boolean;
}) {
  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  // Handle both camelCase and snake_case
  const app = application as any;
  const fullNames = app.full_names || app.fullNames;
  const email = app.email;
  const phoneNumber = app.phone_number || app.phoneNumber;
  const age = app.age;
  const city = app.city;
  const currentStatus = app.current_status || app.currentStatus || "N/A";
  const gradesEquipped = app.grades_equipped || app.gradesEquipped || [];
  const rejectionReason = app.rejection_reason || app.rejectionReason;

  return (
    <Card data-testid={`application-card-${application.id}`}>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{fullNames}</CardTitle>
            <CardDescription className="text-xs sm:text-sm break-all">
              {email} • {phoneNumber}
            </CardDescription>
          </div>
          <Badge className={`${statusColors[application.status]} shrink-0 text-xs`}>{application.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Age</p>
            <p className="font-medium text-sm sm:text-base">{age}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
            <p className="font-medium text-sm sm:text-base truncate">{city}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
            <p className="font-medium text-sm sm:text-base">{currentStatus.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Grades</p>
            <p className="font-medium text-sm sm:text-base truncate">{gradesEquipped.join(", ")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="text-xs sm:text-sm" data-testid="button-view-details">
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">View Full </span>Application
          </Button>
          {showActions && onApprove && onReject && (
            <>
              <Button variant="outline" size="sm" onClick={onReject} className="text-xs sm:text-sm" data-testid="button-reject">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Reject
              </Button>
              <Button size="sm" onClick={onApprove} className="text-xs sm:text-sm" data-testid="button-approve">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>

        {application.status === "rejected" && rejectionReason && (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Rejection Reason:</p>
            <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationDetails({ application }: { application: TutorApplication }) {
  // Handle both camelCase and snake_case from database
  const app = application as any;
  const mindset = (app.mindsetData || app.mindset_data) as any;
  const psychological = (app.psychologicalData || app.psychological_data) as any;
  const vision = (app.visionData || app.vision_data) as any;
  const toolConfidence = (app.toolConfidence || app.tool_confidence) as any;

  // Helper to get field value (handles both camelCase and snake_case)
  const getField = (camelCase: string, snake_case: string) => app[camelCase] || app[snake_case];

  return (
    <div className="space-y-6">
      <Section title="Personal Information">
        <InfoItem label="Full Names" value={getField('fullNames', 'full_names')} />
        <InfoItem label="Age" value={(getField('age', 'age') || 0).toString()} />
        <InfoItem label="Email" value={getField('email', 'email')} />
        <InfoItem label="Phone" value={getField('phoneNumber', 'phone_number')} />
        <InfoItem label="City" value={getField('city', 'city')} />
        <InfoItem label="Current Status" value={(getField('currentStatus', 'current_status') || '').replace(/_/g, " ")} />
        <InfoItem label="Who Influences You" value={getField('whoInfluences', 'who_influences') || "Not provided"} />
        <InfoItem label="Environment" value={getField('environment', 'environment') || "Not provided"} />
      </Section>

      <Section title="Mindset & Mission">
        <InfoItem label="Why Tutor?" value={mindset?.whyTutor || mindset?.why_tutor} />
        <InfoItem label="Confidence Mentor Understanding" value={mindset?.whatIsConfidenceMentor || mindset?.what_is_confidence_mentor} />
        <InfoItem label="Resilience Story" value={mindset?.resilienceStory || mindset?.resilience_story} />
        <InfoItem label="Reaction to Struggling Student" value={mindset?.reactionToStudent || mindset?.reaction_to_student} />
        <InfoItem label="Belief in Confidence" value={mindset?.beliefInConfidence || mindset?.belief_in_confidence} />
        <InfoItem label="Pressure Weakness" value={mindset?.pressureWeak || mindset?.pressure_weak} />
        <InfoItem label="Motivation Type" value={mindset?.motivationQuote || mindset?.motivation_quote} />
      </Section>

      <Section title="Academic Confidence">
        <InfoItem label="Grades Equipped" value={(getField('gradesEquipped', 'grades_equipped') || []).join(", ")} />
        <InfoItem label="Can Explain Clearly" value={(getField('canExplainClearly', 'can_explain_clearly') || '').replace(/_/g, " ")} />
        <InfoItem label="Google Meet Confidence" value={`${toolConfidence?.googleMeet || toolConfidence?.google_meet || 0}/5`} />
        <InfoItem label="OneNote Confidence" value={`${toolConfidence?.onenote || 0}/5`} />
        <InfoItem label="Screen Share Confidence" value={`${toolConfidence?.screenShare || toolConfidence?.screen_share || 0}/5`} />
        <InfoItem label="Student Not Improving Response" value={(getField('studentNotImproving', 'student_not_improving') || '').replace(/_/g, " ")} />
      </Section>

      <Section title="Psychological Fit">
        <InfoItem label="Statement That Hits Hardest" value={(psychological?.statementHits || psychological?.statement_hits || '').replace(/_/g, " ")} />
        <InfoItem label="Feedback Response" value={(psychological?.feedbackResponse || psychological?.feedback_response || '').replace(/_/g, " ")} />
        <InfoItem label="Quit Reason" value={(psychological?.quitReason || psychological?.quit_reason || '').replace(/_/g, " ")} />
        <InfoItem label="Team Meaning" value={(psychological?.teamMeaning || psychological?.team_meaning || '').replace(/_/g, " ")} />
        <InfoItem label="What Scares You" value={psychological?.whatScares || psychological?.what_scares} />
      </Section>

      <Section title="Vision & Long-Term">
        <InfoItem label="Future Personality" value={vision?.futurePersonality || vision?.future_personality} />
        <InfoItem label="Earnings Use" value={vision?.earningsUse || vision?.earnings_use} />
        <InfoItem label="Student Remembrance" value={vision?.studentRemembrance || vision?.student_remembrance} />
        <InfoItem label="Impact vs Scale" value={(vision?.impactVsScale || vision?.impact_vs_scale || '').replace(/_/g, " ")} />
        <InfoItem label="Reasoning" value={vision?.impactVsScaleReason || vision?.impact_vs_scale_reason} />
      </Section>

      <Section title="Availability & Commitment">
        <InfoItem label="Bootcamp Available" value={getField('bootcampAvailable', 'bootcamp_available')} />
        <InfoItem label="Commit to Trial" value={(getField('commitToTrial', 'commit_to_trial')) ? "Yes" : "No"} />
        <InfoItem label="Referral Source" value={getField('referralSource', 'referral_source') || "Not provided"} />
        {(getField('videoUrl', 'video_url')) && <InfoItem label="Video URL" value={getField('videoUrl', 'video_url')} link />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2 pl-4 border-l-2 border-primary/20">{children}</div>
    </div>
  );
}

function InfoItem({ label, value, link }: { label: string; value?: string; link?: boolean }) {
  if (!value) return null;
  
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
