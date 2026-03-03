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
import { CheckCircle, XCircle, FileText, Clock, User, ExternalLink, FileCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
export default function TutorApplicationsPage() {
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(null), selectedApplication = _b[0], setSelectedApplication = _b[1];
    var _c = useState(false), showRejectDialog = _c[0], setShowRejectDialog = _c[1];
    var _d = useState(""), rejectionReason = _d[0], setRejectionReason = _d[1];
    var _e = useQuery({
        queryKey: ["/api/coo/tutor-applications"],
        enabled: isAuthenticated && !authLoading,
    }), applications = _e.data, isLoading = _e.isLoading, error = _e.error;
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [isAuthenticated, authLoading, toast]);
    useEffect(function () {
        if (error && isUnauthorizedError(error)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [error, toast]);
    var approveMutation = useMutation({
        mutationFn: function (id) { return apiRequest("POST", "/api/coo/tutor-applications/".concat(id, "/approve"), {}); },
        onSuccess: function () {
            toast({
                title: "Application Approved",
                description: "The tutor application has been approved successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
            setSelectedApplication(null);
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to approve application",
                variant: "destructive",
            });
        },
    });
    var verifyDocMutation = useMutation({
        mutationFn: function (_a) {
            var applicationId = _a.applicationId, documentType = _a.documentType;
            return apiRequest("POST", "/api/coo/verify-tutor-document", { applicationId: applicationId, documentType: documentType });
        },
        onSuccess: function () {
            toast({
                title: "Document Verified",
                description: "The document has been verified successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to verify document",
                variant: "destructive",
            });
        },
    });
    var rejectMutation = useMutation({
        mutationFn: function (_a) {
            var id = _a.id, reason = _a.reason;
            return apiRequest("POST", "/api/coo/tutor-applications/".concat(id, "/reject"), { reason: reason });
        },
        onSuccess: function () {
            toast({
                title: "Application Rejected",
                description: "The tutor application has been rejected.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
            setSelectedApplication(null);
            setShowRejectDialog(false);
            setRejectionReason("");
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to reject application",
                variant: "destructive",
            });
        },
    });
    var handleApprove = function (application) {
        approveMutation.mutate(application.id);
    };
    var handleReject = function () {
        if (selectedApplication && rejectionReason.trim()) {
            rejectMutation.mutate({ id: selectedApplication.id, reason: rejectionReason });
        }
    };
    var pendingApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "pending"; })) || [];
    var approvedApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "approved"; })) || [];
    // Verification tab: approved tutors who have uploaded docs but not fully verified yet
    var verificationApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) {
        if (app.status !== "approved")
            return false;
        var a = app;
        var hasTrialAgreement = !!(a.trial_agreement_url || a.trialAgreementUrl);
        var trialVerified = !!(a.trial_agreement_verified || a.trialAgreementVerified);
        var isUnder18 = (a.age || 0) < 18;
        var hasParentConsent = !!(a.parent_consent_url || a.parentConsentUrl);
        var parentVerified = !!(a.parent_consent_verified || a.parentConsentVerified);
        // Show in verification if: has docs uploaded but not all verified
        if (isUnder18) {
            return (hasTrialAgreement || hasParentConsent) && (!trialVerified || !parentVerified);
        }
        return hasTrialAgreement && !trialVerified;
    })) || [];
    var rejectedApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "rejected"; })) || [];
    if (isLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64"/>
          <Skeleton className="h-96"/>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tutor Applications</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and manage tutor applications</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="pending" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-pending">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
              <span className="truncate">Pending ({pendingApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-verification">
              <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
              <span className="truncate">Verification ({verificationApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-approved">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
              <span className="truncate">Approved ({approvedApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 min-w-0 gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-rejected">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
              <span className="truncate">Rejected ({rejectedApplications.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.length === 0 ? (<Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No pending applications</p>
              </Card>) : (pendingApplications.map(function (application) { return (<ApplicationCard key={application.id} application={application} onApprove={function () { return handleApprove(application); }} onReject={function () {
                setSelectedApplication(application);
                setShowRejectDialog(true);
            }} onViewDetails={function () { return setSelectedApplication(application); }}/>); }))}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {verificationApplications.length === 0 ? (<Card className="p-12 text-center">
                <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No documents awaiting verification</p>
              </Card>) : (verificationApplications.map(function (application) { return (<VerificationCard key={application.id} application={application} onVerifyDocument={function (documentType) { return verifyDocMutation.mutate({ applicationId: application.id, documentType: documentType }); }} isVerifying={verifyDocMutation.isPending}/>); }))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedApplications.length === 0 ? (<Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No approved applications</p>
              </Card>) : (approvedApplications.map(function (application) { return (<ApplicationCard key={application.id} application={application} onViewDetails={function () { return setSelectedApplication(application); }} showActions={false}/>); }))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApplications.length === 0 ? (<Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No rejected applications</p>
              </Card>) : (rejectedApplications.map(function (application) { return (<ApplicationCard key={application.id} application={application} onViewDetails={function () { return setSelectedApplication(application); }} showActions={false}/>); }))}
          </TabsContent>
        </Tabs>

        {/* Application Details Dialog */}
        {selectedApplication && !showRejectDialog && (<Dialog open={!!selectedApplication} onOpenChange={function () { return setSelectedApplication(null); }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedApplication.full_names || selectedApplication.fullNames}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedApplication.created_at || selectedApplication.createdAt), "PPP")}
                </DialogDescription>
              </DialogHeader>
              <ApplicationDetails application={selectedApplication}/>
              {selectedApplication.status === "pending" && (<DialogFooter className="gap-2">
                  <Button variant="outline" onClick={function () {
                    setShowRejectDialog(true);
                }} data-testid="button-reject-application">
                    <XCircle className="w-4 h-4 mr-2"/>
                    Reject
                  </Button>
                  <Button onClick={function () { return handleApprove(selectedApplication); }} disabled={approveMutation.isPending} data-testid="button-approve-application">
                    <CheckCircle className="w-4 h-4 mr-2"/>
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </DialogFooter>)}
            </DialogContent>
          </Dialog>)}

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
                <Textarea id="reason" value={rejectionReason} onChange={function (e) { return setRejectionReason(e.target.value); }} placeholder="Enter the reason for rejection..." rows={4} data-testid="input-rejection-reason"/>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={function () { return setShowRejectDialog(false); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || rejectMutation.isPending} data-testid="button-confirm-reject">
                {rejectMutation.isPending ? "Rejecting..." : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>);
}
function ApplicationCard(_a) {
    var application = _a.application, onApprove = _a.onApprove, onReject = _a.onReject, onViewDetails = _a.onViewDetails, _b = _a.showActions, showActions = _b === void 0 ? true : _b;
    var statusColors = {
        pending: "bg-amber-100 text-amber-800 border-amber-200",
        approved: "bg-green-100 text-green-800 border-green-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
    };
    // Handle both camelCase and snake_case
    var app = application;
    var fullNames = app.full_names || app.fullNames;
    var email = app.email;
    var phoneNumber = app.phone_number || app.phoneNumber;
    var age = app.age;
    var city = app.city;
    var currentStatus = app.current_status || app.currentStatus || "N/A";
    var gradesEquipped = app.grades_equipped || app.gradesEquipped || [];
    var rejectionReason = app.rejection_reason || app.rejectionReason;
    return (<Card data-testid={"application-card-".concat(application.id)}>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{fullNames}</CardTitle>
            <CardDescription className="text-xs sm:text-sm break-all">
              {email} • {phoneNumber}
            </CardDescription>
          </div>
          <Badge className={"".concat(statusColors[application.status], " shrink-0 text-xs")}>{application.status.toUpperCase()}</Badge>
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
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
            <span className="hidden sm:inline">View Full </span>Application
          </Button>
          {showActions && onApprove && onReject && (<>
              <Button variant="outline" size="sm" onClick={onReject} className="text-xs sm:text-sm" data-testid="button-reject">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
                Reject
              </Button>
              <Button size="sm" onClick={onApprove} className="text-xs sm:text-sm" data-testid="button-approve">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
                Approve
              </Button>
            </>)}
        </div>

        {application.status === "rejected" && rejectionReason && (<div className="bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Rejection Reason:</p>
            <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
          </div>)}
      </CardContent>
    </Card>);
}
function ApplicationDetails(_a) {
    var application = _a.application;
    // Handle both camelCase and snake_case from database
    var app = application;
    var mindset = (app.mindsetData || app.mindset_data);
    var psychological = (app.psychologicalData || app.psychological_data);
    var vision = (app.visionData || app.vision_data);
    var toolConfidence = (app.toolConfidence || app.tool_confidence);
    // Helper to get field value (handles both camelCase and snake_case)
    var getField = function (camelCase, snake_case) { return app[camelCase] || app[snake_case]; };
    return (<div className="space-y-6">
      <Section title="Personal Information">
        <InfoItem label="Full Names" value={getField('fullNames', 'full_names')}/>
        <InfoItem label="Age" value={(getField('age', 'age') || 0).toString()}/>
        <InfoItem label="Email" value={getField('email', 'email')}/>
        <InfoItem label="Phone" value={getField('phoneNumber', 'phone_number')}/>
        <InfoItem label="City" value={getField('city', 'city')}/>
        <InfoItem label="Current Status" value={(getField('currentStatus', 'current_status') || '').replace(/_/g, " ")}/>
        <InfoItem label="Who Influences You" value={getField('whoInfluences', 'who_influences') || "Not provided"}/>
        <InfoItem label="Environment" value={getField('environment', 'environment') || "Not provided"}/>
      </Section>

      <Section title="Mindset & Mission">
        <InfoItem label="Why Tutor?" value={(mindset === null || mindset === void 0 ? void 0 : mindset.whyTutor) || (mindset === null || mindset === void 0 ? void 0 : mindset.why_tutor)}/>
        <InfoItem label="Confidence Mentor Understanding" value={(mindset === null || mindset === void 0 ? void 0 : mindset.whatIsConfidenceMentor) || (mindset === null || mindset === void 0 ? void 0 : mindset.what_is_confidence_mentor)}/>
        <InfoItem label="Resilience Story" value={(mindset === null || mindset === void 0 ? void 0 : mindset.resilienceStory) || (mindset === null || mindset === void 0 ? void 0 : mindset.resilience_story)}/>
        <InfoItem label="Reaction to Struggling Student" value={(mindset === null || mindset === void 0 ? void 0 : mindset.reactionToStudent) || (mindset === null || mindset === void 0 ? void 0 : mindset.reaction_to_student)}/>
        <InfoItem label="Belief in Confidence" value={(mindset === null || mindset === void 0 ? void 0 : mindset.beliefInConfidence) || (mindset === null || mindset === void 0 ? void 0 : mindset.belief_in_confidence)}/>
        <InfoItem label="Pressure Weakness" value={(mindset === null || mindset === void 0 ? void 0 : mindset.pressureWeak) || (mindset === null || mindset === void 0 ? void 0 : mindset.pressure_weak)}/>
        <InfoItem label="Motivation Type" value={(mindset === null || mindset === void 0 ? void 0 : mindset.motivationQuote) || (mindset === null || mindset === void 0 ? void 0 : mindset.motivation_quote)}/>
      </Section>

      <Section title="Academic Confidence">
        <InfoItem label="Grades Equipped" value={(getField('gradesEquipped', 'grades_equipped') || []).join(", ")}/>
        <InfoItem label="Can Explain Clearly" value={(getField('canExplainClearly', 'can_explain_clearly') || '').replace(/_/g, " ")}/>
        <InfoItem label="Google Meet Confidence" value={"".concat((toolConfidence === null || toolConfidence === void 0 ? void 0 : toolConfidence.googleMeet) || (toolConfidence === null || toolConfidence === void 0 ? void 0 : toolConfidence.google_meet) || 0, "/5")}/>
        <InfoItem label="OneNote Confidence" value={"".concat((toolConfidence === null || toolConfidence === void 0 ? void 0 : toolConfidence.onenote) || 0, "/5")}/>
        <InfoItem label="Screen Share Confidence" value={"".concat((toolConfidence === null || toolConfidence === void 0 ? void 0 : toolConfidence.screenShare) || (toolConfidence === null || toolConfidence === void 0 ? void 0 : toolConfidence.screen_share) || 0, "/5")}/>
        <InfoItem label="Student Not Improving Response" value={(getField('studentNotImproving', 'student_not_improving') || '').replace(/_/g, " ")}/>
      </Section>

      <Section title="Psychological Fit">
        <InfoItem label="Statement That Hits Hardest" value={((psychological === null || psychological === void 0 ? void 0 : psychological.statementHits) || (psychological === null || psychological === void 0 ? void 0 : psychological.statement_hits) || '').replace(/_/g, " ")}/>
        <InfoItem label="Feedback Response" value={((psychological === null || psychological === void 0 ? void 0 : psychological.feedbackResponse) || (psychological === null || psychological === void 0 ? void 0 : psychological.feedback_response) || '').replace(/_/g, " ")}/>
        <InfoItem label="Quit Reason" value={((psychological === null || psychological === void 0 ? void 0 : psychological.quitReason) || (psychological === null || psychological === void 0 ? void 0 : psychological.quit_reason) || '').replace(/_/g, " ")}/>
        <InfoItem label="Team Meaning" value={((psychological === null || psychological === void 0 ? void 0 : psychological.teamMeaning) || (psychological === null || psychological === void 0 ? void 0 : psychological.team_meaning) || '').replace(/_/g, " ")}/>
        <InfoItem label="What Scares You" value={(psychological === null || psychological === void 0 ? void 0 : psychological.whatScares) || (psychological === null || psychological === void 0 ? void 0 : psychological.what_scares)}/>
      </Section>

      <Section title="Vision & Long-Term">
        <InfoItem label="Future Personality" value={(vision === null || vision === void 0 ? void 0 : vision.futurePersonality) || (vision === null || vision === void 0 ? void 0 : vision.future_personality)}/>
        <InfoItem label="Earnings Use" value={(vision === null || vision === void 0 ? void 0 : vision.earningsUse) || (vision === null || vision === void 0 ? void 0 : vision.earnings_use)}/>
        <InfoItem label="Student Remembrance" value={(vision === null || vision === void 0 ? void 0 : vision.studentRemembrance) || (vision === null || vision === void 0 ? void 0 : vision.student_remembrance)}/>
        <InfoItem label="Impact vs Scale" value={((vision === null || vision === void 0 ? void 0 : vision.impactVsScale) || (vision === null || vision === void 0 ? void 0 : vision.impact_vs_scale) || '').replace(/_/g, " ")}/>
        <InfoItem label="Reasoning" value={(vision === null || vision === void 0 ? void 0 : vision.impactVsScaleReason) || (vision === null || vision === void 0 ? void 0 : vision.impact_vs_scale_reason)}/>
      </Section>

      <Section title="Availability & Commitment">
        <InfoItem label="Bootcamp Available" value={getField('bootcampAvailable', 'bootcamp_available')}/>
        <InfoItem label="Commit to Trial" value={(getField('commitToTrial', 'commit_to_trial')) ? "Yes" : "No"}/>
        <InfoItem label="Referral Source" value={getField('referralSource', 'referral_source') || "Not provided"}/>
        {(getField('videoUrl', 'video_url')) && <InfoItem label="Video URL" value={getField('videoUrl', 'video_url')} link/>}
      </Section>
    </div>);
}
function Section(_a) {
    var title = _a.title, children = _a.children;
    return (<div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2 pl-4 border-l-2 border-primary/20">{children}</div>
    </div>);
}
function InfoItem(_a) {
    var label = _a.label, value = _a.value, link = _a.link;
    if (!value)
        return null;
    return (<div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {link ? (<a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
          {value}
        </a>) : (<p className="text-sm">{value}</p>)}
    </div>);
}
function VerificationCard(_a) {
    var application = _a.application, onVerifyDocument = _a.onVerifyDocument, isVerifying = _a.isVerifying;
    var app = application;
    var fullNames = app.full_names || app.fullNames;
    var email = app.email;
    var age = app.age;
    var isUnder18 = age < 18;
    // Document status
    var trialAgreementUrl = app.trial_agreement_url || app.trialAgreementUrl;
    var trialVerified = app.trial_agreement_verified || app.trialAgreementVerified;
    var parentConsentUrl = app.parent_consent_url || app.parentConsentUrl;
    var parentVerified = app.parent_consent_verified || app.parentConsentVerified;
    return (<Card data-testid={"verification-card-".concat(application.id)}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{fullNames}</CardTitle>
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
              {trialVerified ? (<CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>) : trialAgreementUrl ? (<Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>) : (<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>)}
              <div>
                <h4 className="font-semibold text-sm">Trial Tutor Agreement</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {trialVerified ? "Verified ✓" : trialAgreementUrl ? "Uploaded - Review and verify" : "Not yet uploaded"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {trialAgreementUrl && (<a href={trialAgreementUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1"/>
                    View
                  </Button>
                </a>)}
              {trialAgreementUrl && !trialVerified && (<Button size="sm" onClick={function () { return onVerifyDocument("trial_agreement"); }} disabled={isVerifying}>
                  <CheckCircle className="w-3 h-3 mr-1"/>
                  Verify
                </Button>)}
            </div>
          </div>
        </div>

        {/* Parent Consent (if under 18) */}
        {isUnder18 && (<div className="p-4 rounded-lg border" style={{
                backgroundColor: parentVerified ? "#F0FDF4" : parentConsentUrl ? "#FEF3C7" : "#FFF0F0",
                borderColor: parentVerified ? "#86EFAC" : parentConsentUrl ? "#FCD34D" : "#FECACA"
            }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {parentVerified ? (<CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>) : parentConsentUrl ? (<Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>) : (<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>)}
                <div>
                  <h4 className="font-semibold text-sm">Parent/Guardian Consent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parentVerified ? "Verified - Parent contacted ✓" : parentConsentUrl ? "Uploaded - Contact parent to verify" : "Not yet uploaded"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {parentConsentUrl && (<a href={parentConsentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1"/>
                      View
                    </Button>
                  </a>)}
                {parentConsentUrl && !parentVerified && (<Button size="sm" onClick={function () { return onVerifyDocument("parent_consent"); }} disabled={isVerifying}>
                    <CheckCircle className="w-3 h-3 mr-1"/>
                    Verify
                  </Button>)}
              </div>
            </div>
          </div>)}

        {isUnder18 && !parentConsentUrl && (<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> This tutor is under 18 and hasn't uploaded parent consent yet.
            </p>
          </div>)}
      </CardContent>
    </Card>);
}
