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
import { CheckCircle, XCircle, FileText, Clock, User, Upload, ExternalLink, FileCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { TutorDocumentReview } from "@/components/tutor/TutorDocumentReview";
import type { TutorApplication } from "@shared/schema";
import { format } from "date-fns";

export default function TutorApplicationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verificationSubTab, setVerificationSubTab] = useState<"pending" | "verified">("pending");

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
  // Verification tab pending: approved tutors with at least one document pending COO review
  const verificationPendingApplications = applications?.filter((app) => {
    if (app.status !== "approved") return false;
    const a = app as any;
    const documentsStatus = a.documentsStatus || a.documents_status || {};
    return Object.values(documentsStatus).some((status) => status === "pending_review");
  }) || [];
  // Verification tab verified: approved tutors with all 5 sequential docs approved
  const verificationVerifiedApplications = applications?.filter((app) => {
    if (app.status !== "approved") return false;
    const a = app as any;
    const documentsStatus = a.documentsStatus || a.documents_status || {};
    return ["1", "2", "3", "4", "5"].every((step) => documentsStatus[step] === "approved");
  }) || [];
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
            <TabsTrigger value="verification" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-verification">
              <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Verification ({verificationPendingApplications.length})</span>
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

          <TabsContent value="verification" className="space-y-4">
            <Tabs value={verificationSubTab} onValueChange={(value) => setVerificationSubTab(value as "pending" | "verified")}>
              <TabsList className="w-full sm:w-auto grid grid-cols-2 h-auto">
                <TabsTrigger value="pending" data-testid="tab-verification-pending" className="text-xs sm:text-sm px-2 sm:px-4">
                  Pending ({verificationPendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="verified" data-testid="tab-verification-verified" className="text-xs sm:text-sm px-2 sm:px-4">
                  Verified ({verificationVerifiedApplications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {verificationPendingApplications.length === 0 ? (
                  <Card className="p-12 text-center">
                    <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No documents awaiting verification</p>
                  </Card>
                ) : (
                  verificationPendingApplications.map((application) => (
                    <TutorDocumentReview
                      key={application.id}
                      application={application}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="verified" className="space-y-4 mt-4">
                {verificationVerifiedApplications.length === 0 ? (
                  <Card className="p-12 text-center">
                    <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No fully verified document sets yet</p>
                  </Card>
                ) : (
                  verificationVerifiedApplications.map((application) => (
                    <VerifiedSubmissionCard key={application.id} application={application} />
                  ))
                )}
              </TabsContent>
            </Tabs>
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
                <DialogTitle>{(selectedApplication as any).fullName || (selectedApplication as any).fullNames || (selectedApplication as any).full_name || (selectedApplication as any).full_names}</DialogTitle>
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

  // Handle new column names, old column names, and raw snake_case from DB
  const app = application as any;
  const fullName = app.fullName || app.fullNames || app.full_name || app.full_names || "-";
  const email = app.email || "-";
  const phone = app.phone || app.phoneNumber || app.phone_number || "-";
  const age = app.age;
  const city = app.city || "-";
  const currentSituation = (app.currentSituation || app.currentStatus || app.current_situation || app.current_status || "N/A").replace(/_/g, " ");
  const rejectionReason = app.rejectionReason || app.rejection_reason;

  return (
    <Card data-testid={`application-card-${application.id}`}>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{fullName}</CardTitle>
            <CardDescription className="text-xs sm:text-sm break-all">
              {email} • {phone}
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
            <p className="text-xs sm:text-sm text-muted-foreground">Situation</p>
            <p className="font-medium text-sm sm:text-base">{currentSituation}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Commitment</p>
            <p className="font-medium text-sm sm:text-base">{app.commitment === "yes" ? "Yes" : "No"}</p>
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
  const app = application as any;
  // g() tries new camelCase, old camelCase, new snake_case, old snake_case
  const g = (newCamel: string, newSnake: string, oldCamel?: string, oldSnake?: string) =>
    app[newCamel] ?? (oldCamel ? app[oldCamel] : undefined) ?? app[newSnake] ?? (oldSnake ? app[oldSnake] : undefined);

  return (
    <div className="space-y-6">
      <Section title="Section 1 – Basic Information">
        <InfoItem label="Full Name" value={g('fullName', 'full_name', 'fullNames', 'full_names')} />
        <InfoItem label="Age" value={String(app.age ?? '')} />
        <InfoItem label="Email" value={app.email} />
        <InfoItem label="Phone" value={g('phone', 'phone', 'phoneNumber', 'phone_number')} />
        <InfoItem label="City" value={app.city} />
      </Section>

      <Section title="Section 2 – Academic Background">
        <InfoItem label="Completed Matric" value={g('completedMatric', 'completed_matric')} />
        <InfoItem label="Matric Year" value={g('matricYear', 'matric_year')} />
        <InfoItem label="Math Level" value={g('mathLevel', 'math_level')} />
        <InfoItem label="Math Result" value={g('mathResult', 'math_result')} />
        <InfoItem label="Other Subjects" value={g('otherSubjects', 'other_subjects')} />
      </Section>

      <Section title="Section 3 – Current Situation">
        <InfoItem label="Current Situation" value={(g('currentSituation', 'current_situation', 'currentStatus', 'current_status') || '').replace(/_/g, ' ')} />
        <InfoItem label="Other (if applicable)" value={g('currentSituationOther', 'current_situation_other')} />
        <InfoItem label="Why interested?" value={g('interestReason', 'interest_reason')} />
      </Section>

      <Section title="Section 4 – Teaching & Communication">
        <InfoItem label="Helped someone before?" value={g('helpedBefore', 'helped_before')} />
        <InfoItem label="Explanation" value={g('helpExplanation', 'help_explanation')} />
        <InfoItem label="Student says 'I don't get this'" value={g('studentDontGet', 'student_dont_get')} />
      </Section>

      <Section title="Section 5 – Response Under Pressure">
        <InfoItem label="Pressure Story" value={g('pressureStory', 'pressure_story')} />
        <InfoItem label="Pressure Response" value={(g('pressureResponse', 'pressure_response') || []).join(', ')} />
        <InfoItem label="Panic Cause" value={g('panicCause', 'panic_cause')} />
      </Section>

      <Section title="Section 6 – Discipline & Responsibility">
        <InfoItem label="Discipline Reason" value={g('disciplineReason', 'discipline_reason')} />
        <InfoItem label="Repeat Mistake Response" value={g('repeatMistakeResponse', 'repeat_mistake_response')} />
      </Section>

      <Section title="Section 7 – Alignment With TT">
        <InfoItem label="TT Meaning" value={g('ttMeaning', 'tt_meaning')} />
        <InfoItem label="Structure Preference" value={g('structurePreference', 'structure_preference')} />
      </Section>

      <Section title="Section 8 – Availability">
        <InfoItem label="Hours Per Week" value={g('hoursPerWeek', 'hours_per_week')} />
        <InfoItem label="Available Afternoons?" value={g('availableAfternoon', 'available_afternoon', 'bootcampAvailable', 'bootcamp_available')} />
      </Section>

      <Section title="Section 9 – Final Filter">
        <InfoItem label="Why should you be considered?" value={g('finalReason', 'final_reason')} />
      </Section>

      <Section title="Section 10 – Commitment">
        <InfoItem label="Committed to training & protocols?" value={g('commitment', 'commitment', 'commitToTrial', 'commit_to_trial') === true ? 'yes' : g('commitment', 'commitment', 'commitToTrial', 'commit_to_trial')} />
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

function VerificationCard({
  application,
  onVerifyDocument,
  isVerifying,
}: {
  application: TutorApplication;
  onVerifyDocument: (documentType: "trial_agreement" | "parent_consent") => void;
  isVerifying: boolean;
}) {
  const app = application as any;
  const fullName = app.fullName || app.fullNames || app.full_name || app.full_names || "-";
  const email = app.email || "-";
  const age = app.age;
  const isUnder18 = age < 18;
  
  // Document status
  const trialAgreementUrl = app.trial_agreement_url || app.trialAgreementUrl;
  const trialVerified = app.trial_agreement_verified || app.trialAgreementVerified;
  const parentConsentUrl = app.parent_consent_url || app.parentConsentUrl;
  const parentVerified = app.parent_consent_verified || app.parentConsentVerified;

  return (
    <Card data-testid={`verification-card-${application.id}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{fullName}</CardTitle>
            <CardDescription className="text-xs sm:text-sm break-all">
              {email} • Age: {age} {isUnder18 && "(Under 18)"}
            </CardDescription>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 shrink-0 text-xs">
            AWAITING VERIFICATION
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trial Agreement */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: trialVerified ? "#F0FDF4" : trialAgreementUrl ? "#FEF3C7" : "#FFF0F0",
          borderColor: trialVerified ? "#86EFAC" : trialAgreementUrl ? "#FCD34D" : "#FECACA"
        }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {trialVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : trialAgreementUrl ? (
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold text-sm">Trial Tutor Agreement</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {trialVerified ? "Verified ✓" : trialAgreementUrl ? "Uploaded - Review and verify" : "Not yet uploaded"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {trialAgreementUrl && (
                <a
                  href={trialAgreementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </a>
              )}
              {trialAgreementUrl && !trialVerified && (
                <Button
                  size="sm"
                  onClick={() => onVerifyDocument("trial_agreement")}
                  disabled={isVerifying}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verify
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Parent Consent (if under 18) */}
        {isUnder18 && (
          <div className="p-4 rounded-lg border" style={{ 
            backgroundColor: parentVerified ? "#F0FDF4" : parentConsentUrl ? "#FEF3C7" : "#FFF0F0",
            borderColor: parentVerified ? "#86EFAC" : parentConsentUrl ? "#FCD34D" : "#FECACA"
          }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {parentVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : parentConsentUrl ? (
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">Parent/Guardian Consent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parentVerified ? "Verified - Parent contacted ✓" : parentConsentUrl ? "Uploaded - Contact parent to verify" : "Not yet uploaded"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {parentConsentUrl && (
                  <a
                    href={parentConsentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </a>
                )}
                {parentConsentUrl && !parentVerified && (
                  <Button
                    size="sm"
                    onClick={() => onVerifyDocument("parent_consent")}
                    disabled={isVerifying}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verify
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {isUnder18 && !parentConsentUrl && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> This tutor is under 18 and hasn't uploaded parent consent yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VerifiedSubmissionCard({ application }: { application: TutorApplication }) {
  const app = application as any;
  const fullName = app.fullName || app.fullNames || app.full_name || app.full_names || "-";
  const email = app.email || "-";

  const submittedDocs: Array<{ step: number; name: string; url?: string }> = [
    {
      step: 1,
      name: "Consent Form (Adult)",
      url: app.doc1TutorAgreementUrl || app.doc_1_tutor_agreement_url,
    },
    {
      step: 2,
      name: "Independent Contractor Agreement (Adult)",
      url: app.doc2CodeOfConductUrl || app.doc_2_code_of_conduct_url,
    },
    {
      step: 3,
      name: "Safeguarding and Conduct Policy (Adult)",
      url: app.doc3EmergencyWaiverUrl || app.doc_3_emergency_waiver_url,
    },
    {
      step: 4,
      name: "Data Protection Consent (Adult)",
      url: app.doc4BackgroundAuthUrl || app.doc_4_background_auth_url,
    },
    {
      step: 5,
      name: "Matric Entry Qualification Verification",
      url: app.doc5TaxInfoUrl || app.doc_5_tax_info_url,
    },
  ];

  return (
    <Card data-testid={`verified-submissions-${application.id}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{fullName}</CardTitle>
            <CardDescription className="text-xs sm:text-sm break-all">{email}</CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200 shrink-0 text-xs">
            5 DOCS VERIFIED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {submittedDocs.map((doc) => (
          <div key={doc.step} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Step {doc.step}: {doc.name}</p>
              <p className="text-xs text-muted-foreground">Signed submission</p>
            </div>
            {doc.url ? (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                <Button size="sm" variant="outline" className="gap-1">
                  View
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Missing URL</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
