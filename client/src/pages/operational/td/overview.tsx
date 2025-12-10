import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, TrendingUp, FolderKanban } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Pod, TutorAssignment, Student, User } from "@shared/schema";

interface PodOverviewData {
  pod: Pod;
  tutors: (User & { assignment: TutorAssignment })[];
  totalStudents: number;
  totalSessions: number;
  avgConfidence: number;
}

export default function TDOverview() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const {
    data: podsData,
    isLoading,
    error,
  } = useQuery<PodOverviewData[]>({
    queryKey: ["/api/td/pod-overview"],
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

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  if (!podsData || !Array.isArray(podsData) || podsData.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Pods</h1>
          <Card className="p-12 text-center">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">You are not assigned to any pods yet.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Pods</h1>
        <p className="text-muted-foreground">You are assigned to {podsData.length} pod{podsData.length !== 1 ? 's' : ''}</p>
        
        {podsData.map((podData: PodOverviewData) => {
          const { pod, tutors, totalStudents, totalSessions } = podData;
          const maxSessions = totalStudents * 9;
          const progress = maxSessions > 0 ? (totalSessions / maxSessions) * 100 : 0;

          return (
            <Card key={pod.id} className="border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{pod.podName}</h2>
                <p className="text-muted-foreground">
                  {pod.phase} Phase • {pod.status}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Pod Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="p-6 border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{tutors.length}</p>
                    <p className="text-sm text-muted-foreground">Active Tutors</p>
                  </Card>

                  <Card className="p-6 border">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </Card>

                  <Card className="p-6 border">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">
                      {totalSessions}/{maxSessions}
                    </p>
                    <p className="text-sm text-muted-foreground">Sessions Complete</p>
                  </Card>

                  <Card className="p-6 border">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                  </Card>
                </div>

                {/* Progress Bar */}
                <Card className="p-6 border">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pod Progress</h3>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {maxSessions - totalSessions} sessions remaining to complete pod
                    </p>
                  </div>
                </Card>

                {/* Tutors List */}
                <Card className="border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Tutors</h3>
                  </div>
                  <div className="divide-y">
                    {tutors.map((tutor: User & { assignment: TutorAssignment }) => {
                      const certStatus = tutor.assignment.certificationStatus;
                      const certColor =
                        certStatus === "passed"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : certStatus === "failed"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200";

                      return (
                        <div
                          key={tutor.id}
                          className="p-6 hover-elevate"
                          data-testid={`tutor-card-${tutor.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{tutor.name}</h4>
                              <p className="text-sm text-muted-foreground">{tutor.email}</p>
                              {tutor.grade && tutor.school && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {tutor.grade} • {tutor.school}
                                </p>
                              )}
                            </div>
                            <div className="text-right space-y-2">
                              <Badge className={`${certColor} border font-semibold uppercase text-2xs`}>
                                {certStatus}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {tutor.assignment.studentCount} students
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
