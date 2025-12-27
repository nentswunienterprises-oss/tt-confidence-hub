import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";

interface HRStats {
  totalApplications: number;
  pendingApplications: number;
  approvedTutors: number;
  availableForPods: number;
  studentEnrollments: number;
}

export default function HRDashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  // Fetch HR stats - refetch every 10 seconds to stay updated
  const { data: stats, isLoading: statsLoading } = useQuery<HRStats>({
    queryKey: ["/api/hr/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchIntervalInBackground: true, // Keep refetching even if tab is not focused
  });

  if (authLoading) {
    return <div>Loading...</div>;
  }

  const userRole = user?.role;

  return (
    <ExecutivePortalGuard role={userRole}>
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Head of Human Resources</h1>
          <p className="text-muted-foreground">Tutor Management & Student Enrollment</p>
        </div>

        {/* Traffic Metrics */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {/* Tutor Applications - Split Card */}
          <Card className="p-4 md:p-6">
            <p className="text-sm text-muted-foreground mb-3">Tutor Applications</p>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : stats?.totalApplications ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="w-px h-12 bg-border mx-3" />
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : stats?.pendingApplications ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
            </div>
          </Card>

          {/* Approved Tutors - Split Card */}
          <Card className="p-4 md:p-6">
            <p className="text-sm text-muted-foreground mb-3">Approved Tutors</p>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : stats?.approvedTutors ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="w-px h-12 bg-border mx-3" />
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : stats?.availableForPods ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Available</p>
              </div>
            </div>
          </Card>

          {/* Student Enrollments */}
          <Card className="p-4 md:p-6">
            <p className="text-sm text-muted-foreground mb-3">Student Enrollments</p>
            <div className="flex items-center justify-center h-12">
              <div className="text-center">
                <p className="text-3xl font-bold">{statsLoading ? "-" : stats?.studentEnrollments ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Functions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tutor Applications</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Review pending tutor applications and make approval decisions
            </p>
            <Button className="w-full">View Applications</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pod Assignments</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Assign approved tutors to pods and manage placements
            </p>
            <Button className="w-full">Manage Assignments</Button>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Enrollment Pipeline</h2>
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </Card>
      </div>
    </ExecutivePortalGuard>
  );
}
