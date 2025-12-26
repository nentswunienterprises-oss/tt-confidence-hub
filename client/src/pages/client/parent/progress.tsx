import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState } from "react";
import { Calendar, TrendingUp, Target, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ParentReport {
  id: string;
  reportType: "weekly" | "monthly";
  weekNumber?: number;
  monthName?: string;
  summary: string;
  topicsLearned: string;
  strengths: string;
  areasForGrowth: string;
  bossBattlesCompleted: number;
  solutionsUnlocked: number;
  confidenceGrowth: number;
  nextSteps: string;
  parentFeedback?: string;
  parentFeedbackAt?: string;
  sentAt: string;
  tutor: {
    name: string;
  };
}

export default function ParentProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<ParentReport | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Fetch reports
  const { data: reports = [] } = useQuery<ParentReport[]>({
    queryKey: ["/api/parent/reports"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ reportId, feedback }: { reportId: string; feedback: string }) => {
      const response = await fetch(`/api/parent/reports/${reportId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ feedback }),
      });
      if (!response.ok) throw new Error("Failed to submit feedback");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been sent to the tutor.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/reports"] });
      setFeedbackDialogOpen(false);
      setFeedback("");
      setSelectedReport(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGiveFeedback = (report: ParentReport) => {
    setSelectedReport(report);
    setFeedback(report.parentFeedback || "");
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = () => {
    if (!selectedReport) return;
    submitFeedbackMutation.mutate({
      reportId: selectedReport.id,
      feedback,
    });
  };

  // Separate weekly and monthly reports
  const weeklyReports = reports.filter(r => r.reportType === "weekly");
  const monthlyReports = reports.filter(r => r.reportType === "monthly");

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold">Progress Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your child's learning journey through detailed reports</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <div>
                  <p className="text-lg sm:text-2xl font-bold">
                    {reports.reduce((sum, r) => sum + (r.bossBattlesCompleted || 0), 0)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Battles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <div>
                  <p className="text-lg sm:text-2xl font-bold">
                    {reports.reduce((sum, r) => sum + (r.solutionsUnlocked || 0), 0)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Solutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{reports.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Reports Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Weekly Reports</h2>
          {weeklyReports.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:pt-6 text-center text-sm sm:text-base text-muted-foreground">
                No weekly reports yet. Your tutor will send reports after each week of sessions.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {weeklyReports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-primary">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          Week {report.weekNumber} Report
                          {report.parentFeedback && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Feedback Given
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          Sent {new Date(report.sentAt).toLocaleDateString()} by {report.tutor.name}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant={report.parentFeedback ? "outline" : "default"}
                        onClick={() => handleGiveFeedback(report)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
                        {report.parentFeedback ? "Update" : "Feedback"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {/* Progress Metrics */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Battles</p>
                        <p className="text-base sm:text-xl font-bold">{report.bossBattlesCompleted}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Solutions</p>
                        <p className="text-base sm:text-xl font-bold">{report.solutionsUnlocked}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Growth</p>
                        <p className="text-base sm:text-xl font-bold text-green-600">+{report.confidenceGrowth}%</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Summary</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.summary}</p>
                    </div>

                    {/* Topics Learned */}
                    {report.topicsLearned && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Topics Learned</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.topicsLearned}</p>
                      </div>
                    )}

                    {/* Strengths & Areas for Growth */}
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {report.strengths && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-green-900 mb-1 sm:mb-2">Strengths</h4>
                          <p className="text-xs sm:text-sm text-green-800">{report.strengths}</p>
                        </div>
                      )}
                      {report.areasForGrowth && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-blue-900 mb-1 sm:mb-2">Areas for Growth</h4>
                          <p className="text-xs sm:text-sm text-blue-800">{report.areasForGrowth}</p>
                        </div>
                      )}
                    </div>

                    {/* Next Steps */}
                    {report.nextSteps && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Next Steps</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.nextSteps}</p>
                      </div>
                    )}

                    {/* Parent Feedback Display */}
                    {report.parentFeedback && (
                      <div className="bg-muted/50 rounded-lg p-2 sm:p-3 border-l-2 border-l-primary">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Your Feedback</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.parentFeedback}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                          Submitted {new Date(report.parentFeedbackAt!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Reports Section */}
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Monthly Reports</h2>
          {monthlyReports.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:pt-6 text-center text-sm sm:text-base text-muted-foreground">
                No monthly reports yet. Your tutor will send comprehensive monthly summaries.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {monthlyReports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-purple-500">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          {report.monthName} Monthly Report
                          {report.parentFeedback && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Feedback Given
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          Sent {new Date(report.sentAt).toLocaleDateString()} by {report.tutor.name}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant={report.parentFeedback ? "outline" : "default"}
                        onClick={() => handleGiveFeedback(report)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
                        {report.parentFeedback ? "Update" : "Feedback"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {/* Progress Metrics */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Battles</p>
                        <p className="text-base sm:text-xl font-bold">{report.bossBattlesCompleted}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Solutions</p>
                        <p className="text-base sm:text-xl font-bold">{report.solutionsUnlocked}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Growth</p>
                        <p className="text-base sm:text-xl font-bold text-green-600">+{report.confidenceGrowth}%</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Summary</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.summary}</p>
                    </div>

                    {report.topicsLearned && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Topics Learned</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.topicsLearned}</p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {report.strengths && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-green-900 mb-1 sm:mb-2">Strengths</h4>
                          <p className="text-xs sm:text-sm text-green-800">{report.strengths}</p>
                        </div>
                      )}
                      {report.areasForGrowth && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-blue-900 mb-1 sm:mb-2">Areas for Growth</h4>
                          <p className="text-xs sm:text-sm text-blue-800">{report.areasForGrowth}</p>
                        </div>
                      )}
                    </div>

                    {report.nextSteps && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Next Steps</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.nextSteps}</p>
                      </div>
                    )}

                    {report.parentFeedback && (
                      <div className="bg-muted/50 rounded-lg p-2 sm:p-3 border-l-2 border-l-primary">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Your Feedback</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.parentFeedback}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                          Submitted {new Date(report.parentFeedbackAt!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="mx-2 sm:mx-auto max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Give Feedback on Report</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Share your thoughts, questions, or concerns with your child's tutor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <Textarea
                placeholder="Write your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-24 sm:min-h-32 text-sm"
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFeedbackDialogOpen(false);
                    setFeedback("");
                    setSelectedReport(null);
                  }}
                  className="flex-1 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={!feedback.trim() || submitFeedbackMutation.isPending}
                  className="flex-1 gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  {submitFeedbackMutation.isPending ? "Sending..." : "Submit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
