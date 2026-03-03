import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { CheckCircle2, Clock, XCircle, User, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
export default function HRApplications() {
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading, user = _a.user;
    var _b = useState(null), selectedApplication = _b[0], setSelectedApplication = _b[1];
    // Fetch tutor applications - use the same endpoint as COO
    var _c = useQuery({
        queryKey: ["/api/coo/tutor-applications"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !!user,
    }), applications = _c.data, applicationsLoading = _c.isLoading;
    if (authLoading) {
        return <div>Loading...</div>;
    }
    var userRole = user === null || user === void 0 ? void 0 : user.role;
    // Filter applications by status
    var pendingApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "pending"; })) || [];
    var approvedApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "approved"; })) || [];
    var rejectedApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "rejected"; })) || [];
    var statusColors = {
        pending: "bg-amber-100 text-amber-800 border-amber-200",
        approved: "bg-green-100 text-green-800 border-green-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
    };
    var ApplicationCard = function (_a) {
        var application = _a.application, onViewDetails = _a.onViewDetails;
        var app = application;
        var fullNames = app.full_names || app.fullNames;
        var email = app.email;
        var phoneNumber = app.phone_number || app.phoneNumber;
        var age = app.age;
        var city = app.city;
        var currentStatus = app.current_status || app.currentStatus || "N/A";
        var gradesEquipped = app.grades_equipped || app.gradesEquipped || [];
        return (<Card data-testid={"application-card-".concat(application.id)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{fullNames}</CardTitle>
              <CardDescription>
                {email} • {phoneNumber}
              </CardDescription>
            </div>
            <Badge className={statusColors[application.status]}>{application.status.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{age}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{currentStatus.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Grades</p>
              <p className="font-medium">{gradesEquipped.join(", ") || "N/A"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={onViewDetails}>
              <User className="w-4 h-4"/>
              View Full Application
            </Button>
          </div>
        </CardContent>
      </Card>);
    };
    return (<ExecutivePortalGuard role={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutor Applications</h1>
          <p className="text-muted-foreground">Review tutor applications (read-only)</p>
        </div>

        {applicationsLoading ? (<Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground"/>
            <p className="text-muted-foreground">Loading applications...</p>
          </Card>) : (<Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4"/>
                Pending ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle2 className="w-4 h-4"/>
                Approved ({approvedApplications.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="w-4 h-4"/>
                Rejected ({rejectedApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingApplications.length === 0 ? (<Card className="p-12 text-center">
                  <p className="text-muted-foreground">No pending applications</p>
                </Card>) : (pendingApplications.map(function (application) { return (<ApplicationCard key={application.id} application={application} onViewDetails={function () { return setSelectedApplication(application); }}/>); }))}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedApplications.length === 0 ? (<Card className="p-12 text-center">
                  <p className="text-muted-foreground">No approved applications</p>
                </Card>) : (approvedApplications.map(function (application) { return (<ApplicationCard key={application.id} application={application} onViewDetails={function () { return setSelectedApplication(application); }}/>); }))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedApplications.length === 0 ? (<Card className="p-12 text-center">
                  <p className="text-muted-foreground">No rejected applications</p>
                </Card>) : (rejectedApplications.map(function (application) { return (<ApplicationCard key={application.id} application={application} onViewDetails={function () { return setSelectedApplication(application); }}/>); }))}
            </TabsContent>
          </Tabs>)}

        {/* Application Details Dialog */}
        {selectedApplication && (<Dialog open={!!selectedApplication} onOpenChange={function () { return setSelectedApplication(null); }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedApplication.full_names || selectedApplication.fullNames}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedApplication.created_at || selectedApplication.createdAt), "PPP")}
                </DialogDescription>
              </DialogHeader>
              <ApplicationDetails application={selectedApplication}/>
            </DialogContent>
          </Dialog>)}
      </div>
    </ExecutivePortalGuard>);
}
// Helper components for application details
function Section(_a) {
    var title = _a.title, children = _a.children;
    return (<div className="space-y-2">
      <h3 className="font-semibold text-lg border-b pb-2">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </div>);
}
function InfoItem(_a) {
    var label = _a.label, value = _a.value;
    return (<div className="grid grid-cols-3 gap-2">
      <span className="text-muted-foreground text-sm">{label}:</span>
      <span className="col-span-2 text-sm">{value || "Not provided"}</span>
    </div>);
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

      <Section title="Vision & Long-term">
        <InfoItem label="Future Personality" value={(vision === null || vision === void 0 ? void 0 : vision.futurePersonality) || (vision === null || vision === void 0 ? void 0 : vision.future_personality)}/>
        <InfoItem label="Earnings Use" value={(vision === null || vision === void 0 ? void 0 : vision.earningsUse) || (vision === null || vision === void 0 ? void 0 : vision.earnings_use)}/>
        <InfoItem label="Student Remembrance" value={(vision === null || vision === void 0 ? void 0 : vision.studentRemembrance) || (vision === null || vision === void 0 ? void 0 : vision.student_remembrance)}/>
        <InfoItem label="Impact vs Scale" value={((vision === null || vision === void 0 ? void 0 : vision.impactVsScale) || (vision === null || vision === void 0 ? void 0 : vision.impact_vs_scale) || '').replace(/_/g, " ")}/>
        <InfoItem label="Reason for Choice" value={(vision === null || vision === void 0 ? void 0 : vision.impactVsScaleReason) || (vision === null || vision === void 0 ? void 0 : vision.impact_vs_scale_reason)}/>
      </Section>

      <Section title="Availability & Commitment">
        <InfoItem label="Video URL" value={getField('videoUrl', 'video_url') || "Not provided"}/>
        <InfoItem label="Bootcamp Available" value={getField('bootcampAvailable', 'bootcamp_available')}/>
        <InfoItem label="Commit to Trial" value={getField('commitToTrial', 'commit_to_trial') ? "Yes" : "No"}/>
        <InfoItem label="Referral Source" value={getField('referralSource', 'referral_source') || "Not provided"}/>
      </Section>
    </div>);
}
