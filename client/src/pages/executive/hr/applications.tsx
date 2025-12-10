import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { CheckCircle2, Clock, XCircle, User, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TutorApplication } from "@shared/schema";

export default function HRApplications() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

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

  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const ApplicationCard = ({ application }: { application: TutorApplication }) => {
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
            <Button variant="outline" className="gap-2">
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
          <p className="text-muted-foreground">Review and manage tutor applications</p>
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
                  <ApplicationCard key={application.id} application={application} />
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
                  <ApplicationCard key={application.id} application={application} />
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
                  <ApplicationCard key={application.id} application={application} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ExecutivePortalGuard>
  );
}
