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
import type { TutorApplication } from "@shared/schema";
import { format } from "date-fns";

export default function HRApplications() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);

  // Fetch tutor applications - use the same endpoint as COO
  const { data: applications, isLoading: applicationsLoading } = useQuery<TutorApplication[]>({
    queryKey: ["/api/coo/tutor-applications"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
  });

  if (authLoading) {
    return <div>Loading...</div>;
  }

  const userRole = user?.role;

  // Filter applications by status
  const pendingApplications = applications?.filter((app) => app.status === "pending") || [];
  const approvedApplications = applications?.filter((app) => app.status === "approved") || [];
  const rejectedApplications = applications?.filter((app) => app.status === "rejected") || [];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const ApplicationCard = ({ application, onViewDetails }: { application: TutorApplication; onViewDetails: () => void }) => {
    const app = application as any;
    const fullNames = app.full_names || app.fullNames;
    const email = app.email;
    const phoneNumber = app.phone_number || app.phoneNumber;
    const age = app.age;
    const city = app.city;
    const currentStatus = app.current_status || app.currentStatus || "N/A";
    const gradesEquipped = app.grades_equipped || app.gradesEquipped || [];

    return (
      <Card data-testid={`application-card-${application.id}`}>
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
              <User className="w-4 h-4" />
              View Full Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ExecutivePortalGuard role={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutor Applications</h1>
          <p className="text-muted-foreground">Review tutor applications (read-only)</p>
        </div>

        {applicationsLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applications...</p>
          </Card>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approved ({approvedApplications.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="w-4 h-4" />
                Rejected ({rejectedApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingApplications.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No pending applications</p>
                </Card>
              ) : (
                pendingApplications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                    onViewDetails={() => setSelectedApplication(application)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedApplications.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No approved applications</p>
                </Card>
              ) : (
                approvedApplications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                    onViewDetails={() => setSelectedApplication(application)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedApplications.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No rejected applications</p>
                </Card>
              ) : (
                rejectedApplications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                    onViewDetails={() => setSelectedApplication(application)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Application Details Dialog */}
        {selectedApplication && (
          <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{(selectedApplication as any).full_names || selectedApplication.fullNames}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date((selectedApplication as any).created_at || selectedApplication.createdAt), "PPP")}
                </DialogDescription>
              </DialogHeader>
              <ApplicationDetails application={selectedApplication} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ExecutivePortalGuard>
  );
}

// Helper components for application details
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg border-b pb-2">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="text-muted-foreground text-sm">{label}:</span>
      <span className="col-span-2 text-sm">{value || "Not provided"}</span>
    </div>
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

      <Section title="Vision & Long-term">
        <InfoItem label="Future Personality" value={vision?.futurePersonality || vision?.future_personality} />
        <InfoItem label="Earnings Use" value={vision?.earningsUse || vision?.earnings_use} />
        <InfoItem label="Student Remembrance" value={vision?.studentRemembrance || vision?.student_remembrance} />
        <InfoItem label="Impact vs Scale" value={(vision?.impactVsScale || vision?.impact_vs_scale || '').replace(/_/g, " ")} />
        <InfoItem label="Reason for Choice" value={vision?.impactVsScaleReason || vision?.impact_vs_scale_reason} />
      </Section>

      <Section title="Availability & Commitment">
        <InfoItem label="Video URL" value={getField('videoUrl', 'video_url') || "Not provided"} />
        <InfoItem label="Bootcamp Available" value={getField('bootcampAvailable', 'bootcamp_available')} />
        <InfoItem label="Commit to Trial" value={getField('commitToTrial', 'commit_to_trial') ? "Yes" : "No"} />
        <InfoItem label="Referral Source" value={getField('referralSource', 'referral_source') || "Not provided"} />
      </Section>
    </div>
  );
}
