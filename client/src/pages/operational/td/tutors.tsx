import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User, TutorAssignment, Student, Session } from "@shared/schema";

interface TutorProfile {
  tutor: User;
  assignment: TutorAssignment;
  students: Student[];
  sessions: Session[];
  reflectionCount: number;
}

export default function TDTutors() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const {
    data: tutorProfiles,
    isLoading,
    error,
  } = useQuery<TutorProfile[]>({
    queryKey: ["/api/td/tutors"],
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
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tutor Profiles</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {!tutorProfiles || tutorProfiles.length === 0 ? (
            <Card className="md:col-span-2 p-12 text-center border">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tutors in your pod yet</p>
            </Card>
          ) : (
            tutorProfiles.map((profile) => {
              const totalSessions = profile.students.reduce(
                (sum, s) => sum + s.sessionProgress,
                0
              );
              const maxSessions = profile.students.length * 9;
              const progress = maxSessions > 0 ? (totalSessions / maxSessions) * 100 : 0;

              const certColor =
                profile.assignment.certificationStatus === "passed"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : profile.assignment.certificationStatus === "failed"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200";

              return (
                <Card
                  key={profile.tutor.id}
                  className="p-6 border space-y-6"
                  data-testid={`tutor-profile-${profile.tutor.id}`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={profile.tutor.profileImageUrl || undefined}
                        alt={profile.tutor.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {getInitials(profile.tutor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{profile.tutor.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.tutor.email}</p>
                      {profile.tutor.grade && profile.tutor.school && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.tutor.grade} • {profile.tutor.school}
                        </p>
                      )}
                    </div>
                    {profile.assignment.certificationStatus && profile.assignment.certificationStatus !== "pending" && (
                      <Badge className={`${certColor} border font-semibold uppercase text-2xs`}>
                        {profile.assignment.certificationStatus}
                      </Badge>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.students.length}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.sessions.length}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.reflectionCount}</p>
                      <p className="text-xs text-muted-foreground">Reflections</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pod Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
