import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Target, FileText, Trophy, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProposalView from "@/components/parent/ProposalView";

interface StudentStats {
  bossBattlesCompleted: number;
  solutionsUnlocked: number;
  confidenceGrowth: number;
  sessionsCompleted: number;
  currentStreak: number;
  totalCommitments: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);

  console.log("👨‍👩‍👧 Parent Dashboard - User:", user);

  // Fetch proposal if available
  const { data: proposal, isLoading: proposalLoading, error: proposalError } = useQuery<any>({
    queryKey: ["/api/parent/proposal"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  console.log("📋 Proposal:", { proposal, proposalLoading, proposalError });

  // Fetch student stats (real-time metrics)
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StudentStats>({
    queryKey: ["/api/parent/student-stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  console.log("📊 Stats:", { stats, statsLoading, statsError });

  // Fetch assigned student info
  const { data: studentInfo, isLoading: studentInfoLoading, error: studentInfoError } = useQuery<any>({
    queryKey: ["/api/parent/student-info"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  console.log("🎓 Student Info:", { studentInfo, studentInfoLoading, studentInfoError });

  // Show loading state
  if (proposalLoading || statsLoading || studentInfoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (proposalError || statsError || studentInfoError) {
    return (
      <Card className="border-orange-200 bg-orange-50">
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
          <p className="mt-4 text-sm">Error details: {proposalError?.message || statsError?.message || studentInfoError?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.email?.split("@")[0]}!</h1>
          <p className="text-muted-foreground">Track your child's confidence journey</p>
          {studentInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              Student: <span className="font-medium">{studentInfo.name}</span> • {studentInfo.grade}
            </p>
          )}
        </div>

        {/* Real-Time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.bossBattlesCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">Boss Battles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.solutionsUnlocked || 0}</p>
                <p className="text-xs text-muted-foreground">Solutions Unlocked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">+{stats?.confidenceGrowth || 0}%</p>
                <p className="text-xs text-muted-foreground">Confidence Growth</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.sessionsCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">Sessions Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Commitments Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Student Commitments
              </CardTitle>
              <CardDescription>Your child's active goals and habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Commitments</span>
                  <span className="text-2xl font-bold">{stats?.totalCommitments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <span className="text-2xl font-bold text-orange-600">{stats?.currentStreak || 0} days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  These are personal goals your child is tracking daily
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Academic Progress
              </CardTitle>
              <CardDescription>Session-based learning metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">3-Layer Solutions</p>
                <p className="text-xs text-muted-foreground">
                  Your tutor tracks vocabulary, method, and reasoning for each concept mastered
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Boss Battles</p>
                <p className="text-xs text-muted-foreground">
                  Challenging problems your child has conquered
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Proposal */}
          {proposal && (
            <Card className="md:col-span-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Personalized Learning Proposal
                </CardTitle>
                <CardDescription>
                  A comprehensive plan designed specifically for your child's success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your tutor has created a detailed proposal outlining your child's learning identity, 
                    strengths, growth areas, and recommended plan.
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>📋 Recommended Plan: <strong>{proposal.recommendedPlan}</strong></span>
                  </div>
                </div>
                <Button 
                  onClick={() => setProposalDialogOpen(true)}
                  className="w-full"
                >
                  View Full Proposal
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="w-4 h-4" />
                View Progress Reports
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="w-4 h-4" />
                See Latest Updates
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Message Tutor
              </Button>
            </CardContent>
          </Card>

          {/* How Stats Update */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">How Stats Update</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <p><strong>Real-Time Tracking:</strong> Stats update automatically when your tutor logs a session</p>
              <p><strong>Boss Battles:</strong> Counted when tutor marks challenging problems completed</p>
              <p><strong>Solutions:</strong> Incremented based on 3-layer teaching model (vocabulary + method + reasoning)</p>
              <p><strong>Confidence:</strong> Measured through session feedback and student response patterns</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Dialog */}
        {proposal && (
          <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Your Personalized Learning Proposal</DialogTitle>
              </DialogHeader>
              <ProposalView proposal={proposal} />
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
}
