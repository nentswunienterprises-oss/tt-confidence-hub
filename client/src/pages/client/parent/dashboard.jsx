import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Target, FileText, Trophy, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProposalView from "@/components/parent/ProposalView";
export default function ParentDashboard() {
    var _a;
    var user = useAuth().user;
    var _b = useState(false), proposalDialogOpen = _b[0], setProposalDialogOpen = _b[1];
    console.log("👨‍👩‍👧 Parent Dashboard - User:", user);
    // Fetch proposal if available
    var _c = useQuery({
        queryKey: ["/api/parent/proposal"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
    }), proposal = _c.data, proposalLoading = _c.isLoading, proposalError = _c.error;
    console.log("📋 Proposal:", { proposal: proposal, proposalLoading: proposalLoading, proposalError: proposalError });
    // Fetch student stats (real-time metrics)
    var _d = useQuery({
        queryKey: ["/api/parent/student-stats"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
    }), stats = _d.data, statsLoading = _d.isLoading, statsError = _d.error;
    console.log("📊 Stats:", { stats: stats, statsLoading: statsLoading, statsError: statsError });
    // Fetch assigned student info
    var _e = useQuery({
        queryKey: ["/api/parent/student-info"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
    }), studentInfo = _e.data, studentInfoLoading = _e.isLoading, studentInfoError = _e.error;
    console.log("🎓 Student Info:", { studentInfo: studentInfo, studentInfoLoading: studentInfoLoading, studentInfoError: studentInfoError });
    // Show loading state
    if (proposalLoading || statsLoading || studentInfoLoading) {
        return (<div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>);
    }
    // Show error state
    if (proposalError || statsError || studentInfoError) {
        return (<Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Dashboard Loading</CardTitle>
        </CardHeader>
        <CardContent className="text-orange-800">
          <p>Some features are still loading. Please ensure:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The database migration has been run</li>
            <li>The server has been restarted</li>
            <li>Your tutor has logged at least one session</li>
          </ul>
          <p className="mt-4 text-sm">Error details: {(proposalError === null || proposalError === void 0 ? void 0 : proposalError.message) || (statsError === null || statsError === void 0 ? void 0 : statsError.message) || (studentInfoError === null || studentInfoError === void 0 ? void 0 : studentInfoError.message)}</p>
        </CardContent>
      </Card>);
    }
    return (<div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {(_a = user === null || user === void 0 ? void 0 : user.email) === null || _a === void 0 ? void 0 : _a.split("@")[0]}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your child's confidence journey</p>
          {studentInfo && (<p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Student: <span className="font-medium">{studentInfo.name}</span> • {studentInfo.grade}
            </p>)}
        </div>

        {/* Real-Time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-1 sm:mb-2"/>
                <p className="text-xl sm:text-2xl font-bold">{(stats === null || stats === void 0 ? void 0 : stats.bossBattlesCompleted) || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Boss Battles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2"/>
                <p className="text-xl sm:text-2xl font-bold">{(stats === null || stats === void 0 ? void 0 : stats.solutionsUnlocked) || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Solutions Unlocked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2"/>
                <p className="text-xl sm:text-2xl font-bold">+{(stats === null || stats === void 0 ? void 0 : stats.confidenceGrowth) || 0}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Confidence Growth</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1 sm:mb-2"/>
                <p className="text-xl sm:text-2xl font-bold">{(stats === null || stats === void 0 ? void 0 : stats.sessionsCompleted) || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Sessions Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Commitments Overview */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5"/>
                Student Commitments
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your child's active goals and habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Active Commitments</span>
                  <span className="text-xl sm:text-2xl font-bold">{(stats === null || stats === void 0 ? void 0 : stats.totalCommitments) || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Current Streak</span>
                  <span className="text-xl sm:text-2xl font-bold text-orange-600">{(stats === null || stats === void 0 ? void 0 : stats.currentStreak) || 0} days</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-4">
                  These are personal goals your child is tracking daily
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5"/>
                Academic Progress
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Session-based learning metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">3-Layer Solutions</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Your tutor tracks vocabulary, method, and reasoning for each concept mastered
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Boss Battles</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Challenging problems your child has conquered
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Sections */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Learning Proposal */}
          {proposal && (<Card className="md:col-span-2 border-primary/30">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5"/>
                  Your Personalized Learning Proposal
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  A comprehensive plan designed specifically for your child's success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 sm:p-4 mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Your tutor has created a detailed proposal outlining your child's learning identity, 
                    strengths, growth areas, and recommended plan.
                  </p>
                  <div className="flex gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <span>📋 Recommended Plan: <strong>{proposal.recommendedPlan}</strong></span>
                  </div>
                </div>
                <Button onClick={function () { return setProposalDialogOpen(true); }} className="w-full text-sm sm:text-base">
                  View Full Proposal
                </Button>
              </CardContent>
            </Card>)}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Common tasks and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                <Calendar className="w-4 h-4"/>
                View Progress Reports
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                <TrendingUp className="w-4 h-4"/>
                See Latest Updates
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                <FileText className="w-4 h-4"/>
                Message Tutor
              </Button>
            </CardContent>
          </Card>

          {/* How Stats Update */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-slate-900 text-base sm:text-lg">How Stats Update</CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm text-slate-700 space-y-2">
              <p><strong>Real-Time Tracking:</strong> Stats update automatically when your tutor logs a session</p>
              <p><strong>Boss Battles:</strong> Counted when tutor marks challenging problems completed</p>
              <p><strong>Solutions:</strong> Incremented based on 3-layer teaching model (vocabulary + method + reasoning)</p>
              <p><strong>Confidence:</strong> Measured through session feedback and student response patterns</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Dialog */}
        {proposal && (<Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Your Personalized Learning Proposal</DialogTitle>
              </DialogHeader>
              <ProposalView proposal={proposal}/>
            </DialogContent>
          </Dialog>)}
      </div>);
}
