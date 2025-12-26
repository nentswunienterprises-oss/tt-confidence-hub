import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { TrendingUp, Users, Link2, BarChart3, User2, Copy, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function OutreachDirectorDashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();

  // Fetch affiliate performance data
  const { data: affiliateData = {}, isLoading: dataLoading, error: dataError } = useQuery<any>({
    queryKey: ["/api/affiliate/performance"],
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch referral metrics
  const { data: referralMetrics = {}, error: referralError } = useQuery<any>({
    queryKey: ["/api/affiliate/referrals"],
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
    if (dataError && isUnauthorizedError(dataError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [dataError, toast]);

  useEffect(() => {
    if (referralError && isUnauthorizedError(referralError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [referralError, toast]);

  if (authLoading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
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

  const firstName = user?.name?.split(" ")[0] || "Affiliate";

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Track your referrals and earnings in real-time.
          </p>
        </div>

        {/* Key Metrics - Prominent Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <Users className="w-5 h-5 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-4xl font-bold text-foreground">
                  {referralMetrics.totalReferrals || 0}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Encounters
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-4xl font-bold text-foreground">
                  {referralMetrics.conversions || 0}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Leads
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <BarChart3 className="w-5 h-5 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-4xl font-bold text-foreground">
                  {referralMetrics.conversionRate || "0"}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Closes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Your Unique Affiliate Code */}
        <Card className="p-4 sm:p-6 border shadow-sm">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Your Unique Affiliate Code</h2>
              <p className="text-xs sm:text-base text-muted-foreground">
                Share this code with parents so you get credited when they sign up.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border rounded-lg p-3 sm:p-4 text-center font-mono font-bold text-sm sm:text-base">
                AFIXYY1LLX
              </div>
              <Button 
                variant="default"
                size="default"
                className="gap-2 px-3 sm:px-4"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Referral Dashboard */}
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">My Referrals</h2>
          {dataLoading ? (
            <Card className="p-6 sm:p-12 text-center border shadow-sm">
              <p className="text-sm sm:text-base text-muted-foreground">Loading referrals...</p>
            </Card>
          ) : affiliateData?.referrals && affiliateData.referrals.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {affiliateData.referrals.map((referral: any) => (
                <Card key={referral.id} className="p-3 sm:p-6 border shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-lg truncate">{referral.name || referral.email}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{referral.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={referral.status === 'converted' ? 'default' : 'secondary'} className="text-xs">
                        {referral.status || 'pending'}
                      </Badge>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                        {referral.referralDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 sm:p-12 text-center border shadow-sm">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Referrals Yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Start sharing your affiliate link to get your first referrals!
              </p>
            </Card>
          )}
        </div>

        {/* Log Encounter Button */}
        <Button 
          size="default"
          className="w-full h-12 sm:h-14 text-sm sm:text-lg gap-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Log Encounter
        </Button>
      </div>
    </DashboardLayout>
  );
}
