import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, User, Phone, MapPin, BookOpen, Users, GraduationCap, CheckCircle2, Clock, XCircle, FileCheck, ShieldCheck, FileText } from "lucide-react";

interface TrafficStats {
  totalApplications: number;
  pendingApplications: number;
  approvedTutors: number;
  availableForPods: number;
  totalEnrollments: number;
  studentEnrollments: number;
}
import { format } from "date-fns";
import AssignTutorModal from "@/components/executive/AssignTutorModal";
import type { TutorApplication } from "@shared/schema";

interface ParentEnrollment {
  id: string;
  user_id: string;
  parent_full_name: string;
  parent_email: string;
  parent_phone: string;
  parent_city: string;
  student_full_name: string;
  student_grade: string;
  school_name: string;
  math_struggle_areas: string;
  previous_tutoring: string;
  confidence_level: string;
  internet_access: string;
  parent_motivation?: string;
  status: "not_enrolled" | "awaiting_assignment" | "assigned" | "session_booked" | "report_received" | "confirmed";
  current_step?: string;
  created_at: string;
}

export default function ExecutiveHRTraffic() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [assignTutorOpen, setAssignTutorOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [tutorAppSubTab, setTutorAppSubTab] = useState("pending");
  const [verifyingTutorId, setVerifyingTutorId] = useState<string | null>(null);
  const [rejectingTutorId, setRejectingTutorId] = useState<string | null>(null);
  // Fetch tutor verification docs (from /api/coo/applications)
  const { data: tutorVerificationData = [], refetch: refetchVerificationData } = useQuery<{ user: any; verificationDoc: any }[]>({
    queryKey: ["/api/coo/applications"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    refetchInterval: 10000,
  });

  const normalizeStatus = (value: unknown) => String(value || "").toLowerCase().trim();
  const hasAnyDocUrl = (doc: any) =>
    !!(
      doc?.file_url_agreement ||
      doc?.file_url_consent ||
      doc?.fileUrlAgreement ||
      doc?.fileUrlConsent
    );

  const pendingVerificationTutors = tutorVerificationData.filter(
    (t) => {
      const status = normalizeStatus(t?.verificationDoc?.status);
      return !!t.verificationDoc && status === "pending";
    }
  );
  const verifiedDocTutors = tutorVerificationData.filter(
    (t) => {
      const status = normalizeStatus(t?.verificationDoc?.status);
      const isVerified = status === "verified" || t?.user?.isVerified === true;
      return isVerified && hasAnyDocUrl(t?.verificationDoc);
    }
  );

  const handleVerifyTutor = async (userId: string) => {
    setVerifyingTutorId(userId);
    try {
      await fetch(`/api/coo/verify-tutor/${userId}`, { method: "POST", credentials: "include" });
      refetchVerificationData();
      queryClient.invalidateQueries({ queryKey: ["/api/hr/stats"] });
    } finally {
      setVerifyingTutorId(null);
    }
  };

  const handleRejectTutor = async (userId: string) => {
    setRejectingTutorId(userId);
    try {
      await fetch(`/api/coo/reject-tutor/${userId}`, { method: "POST", credentials: "include" });
      refetchVerificationData();
    } finally {
      setRejectingTutorId(null);
    }
  };


  // Fetch traffic stats
  const { data: stats, isLoading: statsLoading } = useQuery<TrafficStats>({
    queryKey: ["/api/hr/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  // Fetch all parent enrollments - refetch every 5 seconds
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<ParentEnrollment[]>({
    queryKey: ["/api/hr/enrollments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Fetch tutor applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery<TutorApplication[]>({
    queryKey: ["/api/coo/tutor-applications"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    refetchInterval: 5000,
  });

  // Filter enrollments by status (normalize strings to avoid casing/whitespace issues)
  const normalize = (s: any) => (s ? String(s).toLowerCase().trim() : "");
  const awaitingAssignment = enrollments.filter((e: ParentEnrollment) => normalize(e.status) === "awaiting_assignment");
  // Treat 'session_booked' as assigned for HR display so booked sessions are visible under Assigned
  const assigned = enrollments.filter((e: ParentEnrollment) => {
    const s = normalize(e.status);
    return s === "assigned" || s === "session_booked";
  });
  const confirmed = enrollments.filter((e: ParentEnrollment) => normalize(e.status) === "confirmed");

  // Filter tutor applications by status
  const pendingApplications = applications.filter((app: any) => app.status === "pending");
  const approvedApplications = applications.filter((app: any) => app.status === "approved");
  const rejectedApplications = applications.filter((app: any) => app.status === "rejected");

  const handleOpenAssignModal = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setAssignTutorOpen(true);
  };

  const handleTutorAssigned = () => {
    // Refetch enrollments after assignment
    queryClient.invalidateQueries({ queryKey: ["/api/hr/enrollments"] });
  };

  

  const getStatusBadge = (status: ParentEnrollment["status"]) => {
    const statusConfig = {
      awaiting_assignment: { label: "Awaiting Assignment", color: "bg-yellow-100 text-yellow-800" },
      assigned: { label: "Assigned", color: "bg-blue-100 text-blue-800" },
      session_booked: { label: "Session Booked", color: "bg-purple-100 text-purple-800" },
      report_received: { label: "Report Received", color: "bg-orange-100 text-orange-800" },
      confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
      not_enrolled: { label: "Not Enrolled", color: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const EnrollmentCard = ({ enrollment }: { enrollment: ParentEnrollment }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{enrollment.student_full_name}</CardTitle>
            <CardDescription>
              Parent: {enrollment.parent_full_name}
            </CardDescription>
          </div>
          {getStatusBadge(enrollment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{enrollment.parent_email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{enrollment.parent_phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{enrollment.parent_city}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Grade</p>
              <p className="font-medium">{enrollment.student_grade}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">School</p>
            <p className="font-medium">{enrollment.school_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Math Struggle Areas</p>
            <p className="font-medium">{enrollment.math_struggle_areas || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Previous Tutoring</p>
            <p className="font-medium">{enrollment.previous_tutoring || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Confidence Level</p>
            <p className="font-medium">{enrollment.confidence_level || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Internet Access</p>
            <p className="font-medium">{enrollment.internet_access || "Not provided"}</p>
          </div>
          {enrollment.parent_motivation && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Parent Motivation</p>
              <p className="font-medium">{enrollment.parent_motivation}</p>
            </div>
          )}
          <div className="pt-2 border-t">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Submitted</p>
            <p className="text-xs">{format(new Date(enrollment.created_at), "PPp")}</p>
          </div>
        </div>

        {enrollment.status === "awaiting_assignment" && (
          <Button 
            className="w-full mt-4"
            onClick={() => handleOpenAssignModal(enrollment.id)}
          >
            Assign Tutor
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Traffic</h1>
        <p className="text-muted-foreground">Manage tutor applications and parent enrollments</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Tutor Applications</p>
          <div className="flex items-center gap-3">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalApplications ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.pendingApplications ?? 0}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Approved Tutors</p>
          <div className="flex items-center gap-3">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.approvedTutors ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.availableForPods ?? 0}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-muted-foreground mb-2">Student Enrollments</p>
          <div className="flex items-center gap-3">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalEnrollments ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.studentEnrollments ?? 0}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="tutor-applications" className="w-full">
        
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tutor-applications" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Tutor Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="parent-enrollments" className="gap-2">
            <Users className="w-4 h-4" />
            Parent Enrollments ({enrollments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tutor Applications Tab */}
        <TabsContent value="tutor-applications" className="space-y-4">
          {applicationsLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading applications...</p>
            </Card>
          ) : (
            <Tabs value={tutorAppSubTab} onValueChange={setTutorAppSubTab} className="w-full">
              <TabsList className="flex w-full overflow-x-auto h-auto rounded-xl border border-primary/15 bg-muted/20 p-1 gap-1">
                <TabsTrigger value="pending" className="flex-1 gap-1.5 text-xs sm:text-sm py-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  Pending ({pendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex-1 gap-1.5 text-xs sm:text-sm py-2">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  Approved ({approvedApplications.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1 gap-1.5 text-xs sm:text-sm py-2">
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  Rejected ({rejectedApplications.length})
                </TabsTrigger>
                  <TabsTrigger value="verification" className="flex-1 gap-1.5 text-xs sm:text-sm py-2">
                    <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    Verification ({pendingVerificationTutors.length})
                  </TabsTrigger>
                  <TabsTrigger value="verified-docs" className="flex-1 gap-1.5 text-xs sm:text-sm py-2">
                    <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    Verified Docs ({verifiedDocTutors.length})
                  </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingApplications.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No pending applications</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {pendingApplications.map((application: any) => (
                      <TutorApplicationCard
                        key={application.id}
                        application={application}
                        onViewDetails={() => setSelectedApplication(application)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 mt-4">
                {approvedApplications.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No approved applications</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {approvedApplications.map((application: any) => (
                      <TutorApplicationCard
                        key={application.id}
                        application={application}
                        onViewDetails={() => setSelectedApplication(application)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedApplications.length === 0 ? (
                  <Card className="p-12 text-center">
                    <XCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No rejected applications</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {rejectedApplications.map((application: any) => (
                      <TutorApplicationCard
                        key={application.id}
                        application={application}
                        onViewDetails={() => setSelectedApplication(application)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

                <TabsContent value="verification" className="space-y-4 mt-4">
                  {pendingVerificationTutors.length === 0 ? (
                    <Card className="p-12 text-center">
                      <FileCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No documents pending verification</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {pendingVerificationTutors.map(({ user: t, verificationDoc }) => (
                        <Card key={t.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{t.full_names || t.fullNames || t.username}</CardTitle>
                                <CardDescription>{t.email}</CardDescription>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-3">
                              {verificationDoc.file_url_agreement && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Trial Agreement</span>
                                  </div>
                                  <a
                                    href={verificationDoc.file_url_agreement}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary underline"
                                  >
                                    View Document
                                  </a>
                                </div>
                              )}
                              {verificationDoc.file_url_consent && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Parent Consent</span>
                                  </div>
                                  <a
                                    href={verificationDoc.file_url_consent}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary underline"
                                  >
                                    View Document
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                disabled={verifyingTutorId === t.id}
                                onClick={() => handleVerifyTutor(t.id)}
                              >
                                {verifyingTutorId === t.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                Approve & Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                disabled={rejectingTutorId === t.id}
                                onClick={() => handleRejectTutor(t.id)}
                              >
                                {rejectingTutorId === t.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-2" />
                                )}
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="verified-docs" className="space-y-4 mt-4">
                  {verifiedDocTutors.length === 0 ? (
                    <Card className="p-12 text-center">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No verified docs yet</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {verifiedDocTutors.map(({ user: t, verificationDoc }) => (
                        <Card key={t.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{t.full_names || t.fullNames || t.username}</CardTitle>
                                <CardDescription>{t.email}</CardDescription>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {verificationDoc.file_url_agreement && (
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Trial Agreement</span>
                                </div>
                                <a
                                  href={verificationDoc.file_url_agreement}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary underline"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                            {verificationDoc.file_url_consent && (
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Parent Consent</span>
                                </div>
                                <a
                                  href={verificationDoc.file_url_consent}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary underline"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                            {verificationDoc.updated_at && (
                              <p className="text-xs text-muted-foreground">
                                Verified on {format(new Date(verificationDoc.updated_at), "PPP")}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* Parent Enrollments Tab */}
        <TabsContent value="parent-enrollments" className="space-y-6">
          {enrollmentsLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading enrollments...</p>
            </Card>
          ) : enrollments.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No enrollments yet</p>
            </Card>
          ) : (
            <>
              {/* Awaiting Assignment */}
              {awaitingAssignment.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <h2 className="text-xl font-semibold">Awaiting Assignment ({awaitingAssignment.length})</h2>
                  </div>
                  <div className="grid gap-4">
                    {awaitingAssignment.map((enrollment: ParentEnrollment) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned */}
              {assigned.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h2 className="text-xl font-semibold">Assigned ({assigned.length})</h2>
                  </div>
                  <div className="grid gap-4">
                    {assigned.map((enrollment: ParentEnrollment) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmed */}
              {confirmed.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <h2 className="text-xl font-semibold">Confirmed ({confirmed.length})</h2>
                  </div>
                  <div className="grid gap-4">
                    {confirmed.map((enrollment: ParentEnrollment) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Tutor Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{(selectedApplication as any).full_names || (selectedApplication as any).fullNames}</DialogTitle>
              <DialogDescription>
                Submitted on {format(new Date((selectedApplication as any).created_at || (selectedApplication as any).createdAt), "PPP")}
              </DialogDescription>
            </DialogHeader>
            <ApplicationDetails application={selectedApplication} />
          </DialogContent>
        </Dialog>
      )}

      <AssignTutorModal
        open={assignTutorOpen}
        onOpenChange={setAssignTutorOpen}
        enrollmentId={selectedEnrollmentId}
        onAssigned={handleTutorAssigned}
      />
    </div>
  );
}

// Tutor Application Card Component
function TutorApplicationCard({ application, onViewDetails }: { application: any; onViewDetails: () => void }) {
  const fullNames = application.full_names || application.fullNames;
  const email = application.email;
  const phoneNumber = application.phone_number || application.phoneNumber;
  const age = application.age;
  const city = application.city;
  const currentStatus = application.current_status || application.currentStatus || "N/A";
  const gradesEquipped = application.grades_equipped || application.gradesEquipped || [];
  const status = application.status;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{fullNames}</CardTitle>
            <CardDescription>{email} • {phoneNumber}</CardDescription>
          </div>
          <Badge className={statusColors[status]}>{status.toUpperCase()}</Badge>
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
        <Button variant="outline" className="gap-2" onClick={onViewDetails}>
          <User className="w-4 h-4" />
          View Full Application
        </Button>
      </CardContent>
    </Card>
  );
}

// Application Details Component
function ApplicationDetails({ application }: { application: TutorApplication }) {
  const app = application as any;
  const mindset = (app.mindsetData || app.mindset_data) as any;
  const psychological = (app.psychologicalData || app.psychological_data) as any;
  const vision = (app.visionData || app.vision_data) as any;
  const toolConfidence = (app.toolConfidence || app.tool_confidence) as any;
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
      </Section>

      <Section title="Mindset & Mission">
        <InfoItem label="Why Tutor?" value={mindset?.whyTutor || mindset?.why_tutor} />
        <InfoItem label="Confidence Mentor Understanding" value={mindset?.whatIsConfidenceMentor || mindset?.what_is_confidence_mentor} />
        <InfoItem label="Resilience Story" value={mindset?.resilienceStory || mindset?.resilience_story} />
        <InfoItem label="Belief in Confidence" value={mindset?.beliefInConfidence || mindset?.belief_in_confidence} />
      </Section>

      <Section title="Academic Confidence">
        <InfoItem label="Grades Equipped" value={(getField('gradesEquipped', 'grades_equipped') || []).join(", ")} />
        <InfoItem label="Can Explain Clearly" value={(getField('canExplainClearly', 'can_explain_clearly') || '').replace(/_/g, " ")} />
        <InfoItem label="Google Meet Confidence" value={`${toolConfidence?.googleMeet || toolConfidence?.google_meet || 0}/5`} />
      </Section>

      <Section title="Psychological Fit">
        <InfoItem label="Feedback Response" value={(psychological?.feedbackResponse || psychological?.feedback_response || '').replace(/_/g, " ")} />
        <InfoItem label="Team Meaning" value={(psychological?.teamMeaning || psychological?.team_meaning || '').replace(/_/g, " ")} />
        <InfoItem label="What Scares You" value={psychological?.whatScares || psychological?.what_scares} />
      </Section>

      <Section title="Vision & Availability">
        <InfoItem label="Future Personality" value={vision?.futurePersonality || vision?.future_personality} />
        <InfoItem label="Impact vs Scale" value={(vision?.impactVsScale || vision?.impact_vs_scale || '').replace(/_/g, " ")} />
        <InfoItem label="Bootcamp Available" value={getField('bootcampAvailable', 'bootcamp_available')} />
        <InfoItem label="Commit to Trial" value={getField('commitToTrial', 'commit_to_trial') ? "Yes" : "No"} />
      </Section>
    </div>
  );
}

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

