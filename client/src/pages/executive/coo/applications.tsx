import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, Check, X, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User, VerificationDoc } from "@shared/schema";

interface ApplicationData {
  user: User;
  verificationDoc?: VerificationDoc;
}

export default function COOApplications() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const {
    data: applications,
    isLoading,
    error,
  } = useQuery<ApplicationData[]>({
    queryKey: ["/api/coo/applications"],
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

  const verifyTutor = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/coo/verify-tutor/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/stats"] });
      toast({
        title: "Tutor verified",
        description: "The tutor has been verified and can now be assigned to pods.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to verify tutor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectTutor = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/coo/reject-tutor/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
      toast({
        title: "Application rejected",
        description: "The tutor application has been rejected.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const pendingApplications = applications?.filter((app) => !app.user.verified) || [];
  const verifiedApplications = applications?.filter((app) => app.user.verified) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Applications</h1>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 border font-semibold px-3 py-1">
            {pendingApplications.length} Pending
          </Badge>
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <Card className="border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Pending Verification</h2>
            </div>
            <div className="divide-y">
              {pendingApplications.map((app) => (
                <div
                  key={app.user.id}
                  className="p-6 space-y-4"
                  data-testid={`application-${app.user.id}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={app.user.profileImageUrl || undefined} alt={app.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(app.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{app.user.name}</h3>
                      <p className="text-sm text-muted-foreground">{app.user.email}</p>
                      {app.user.grade && app.user.school && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Grade {app.user.grade} • {app.user.school}
                        </p>
                      )}
                    </div>
                  </div>

                  {app.verificationDoc && (
                    <div className="space-y-2 pt-2">
                      <p className="text-sm font-medium">Submitted Documents:</p>
                      <div className="flex gap-2">
                        {app.verificationDoc.fileUrlAgreement && (
                          <Badge variant="outline" className="font-normal">
                            Agreement ✓
                          </Badge>
                        )}
                        {app.verificationDoc.fileUrlConsent && (
                          <Badge variant="outline" className="font-normal">
                            Consent ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => verifyTutor.mutate(app.user.id)}
                      disabled={verifyTutor.isPending}
                      data-testid={`button-verify-${app.user.id}`}
                    >
                      <Check className="w-4 h-4" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive"
                      onClick={() => rejectTutor.mutate(app.user.id)}
                      disabled={rejectTutor.isPending}
                      data-testid={`button-reject-${app.user.id}`}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Verified Tutors */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Verified Tutors</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {verifiedApplications.length === 0 ? (
              <div className="p-12 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No verified tutors yet</p>
              </div>
            ) : (
              verifiedApplications.map((app) => (
                <div
                  key={app.user.id}
                  className="p-6 hover-elevate"
                  data-testid={`verified-tutor-${app.user.id}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={app.user.profileImageUrl || undefined} alt={app.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(app.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{app.user.name}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200 border text-2xs font-semibold uppercase">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{app.user.email}</p>
                      {app.user.grade && app.user.school && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.user.grade} • {app.user.school}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
