import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
export default function TDReports() {
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useQuery({
        queryKey: ["/api/td/tutor-check-ins"],
        enabled: isAuthenticated && !authLoading,
    }), checkIns = _b.data, isLoading = _b.isLoading, error = _b.error;
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
    if (authLoading || isLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-96"/>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports & Check-Ins</h1>
          <p className="text-muted-foreground">
            View all tutor weekly check-ins and student updates from your pod
          </p>
        </div>

        {!checkIns || checkIns.length === 0 ? (<Card className="p-12 text-center border">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
            <p className="text-muted-foreground mb-2">No check-ins yet</p>
            <p className="text-sm text-muted-foreground">
              Tutors haven't submitted their weekly check-ins yet
            </p>
          </Card>) : (<div className="grid gap-6">
            {checkIns.map(function (checkIn) {
                var _a, _b;
                return (<Card key={checkIn.id} className="border overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        {((_a = checkIn.tutor) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Tutor"}
                      </h3>
                      <p className="text-sm text-muted-foreground">{(_b = checkIn.tutor) === null || _b === void 0 ? void 0 : _b.email}</p>
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap">
                      <Calendar className="w-3 h-3 mr-1"/>
                      {format(new Date(checkIn.weekStartDate), "MMM d, yyyy")}
                    </Badge>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Sessions Summary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">📅 Sessions Summary</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{checkIn.sessionsSummary}</p>
                  </div>

                  {/* Wins */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-green-700">🎉 Wins</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{checkIn.wins}</p>
                  </div>

                  {/* Challenges */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-orange-700">⚠️ Challenges</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{checkIn.challenges}</p>
                  </div>

                  {/* Emotions */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-purple-700">💭 Emotions & Thoughts</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{checkIn.emotions}</p>
                  </div>

                  {/* Skill Improvement */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-indigo-700">🎯 Skill Improvement Focus</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{checkIn.skillImprovement}</p>
                  </div>

                  {/* Next Week Goals */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-700">🚀 Next Week Goals</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{checkIn.nextWeekGoals}</p>
                  </div>

                  {/* Help Needed - if present */}
                  {checkIn.helpNeeded && (<div className="md:col-span-2 space-y-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-sm text-yellow-900">🤝 Help Needed</h4>
                      <p className="text-sm text-yellow-800 leading-relaxed">{checkIn.helpNeeded}</p>
                    </div>)}
                </div>

                {/* Footer with timestamp */}
                <div className="px-6 py-3 bg-gray-50 border-t text-xs text-muted-foreground">
                  Submitted: {format(new Date(checkIn.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                </div>
              </Card>);
            })}
          </div>)}
      </div>
    </DashboardLayout>);
}
