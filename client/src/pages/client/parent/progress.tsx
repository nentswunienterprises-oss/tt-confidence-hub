import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState } from "react";
import { Calendar, MessageSquare, Send, FileText } from "lucide-react";
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
  weekRange?: {
    start: string;
    end: string;
  } | null;
  monthRange?: {
    start: string;
    end: string;
  } | null;
  monthName?: string;
  sessionsCompleted?: number;
  totalSessionsCompleted?: number;
  topicsWorkedOn?: string[];
  conditioningProgress?: Array<{
    topic: string;
    startState: string;
    endState: string;
    drillCount?: number;
  }>;
  mainTopicsCovered?: string;
  whatImproved?: string;
  responsePattern?: string[];
  mainBreakdown?: string[];
  systemMovement?: string;
  mainMisunderstanding?: string;
  whatThisMeans?: string;
  nextFocus?: string;
  mainAreasCovered?: string;
  skillsStronger?: string;
  responsePatternTrend?: string;
  recurringChallenge?: string;
  mostEffectiveIntervention?: string;
  bossBattleTrend?: string;
  nextMonthPriority?: string;
  topicProgressRows?: Array<{
    topic: string;
    started?: string;
    start?: string;
    current?: string;
    end?: string;
    movement: string;
    nextAction?: string | null;
  }>;
  currentStateSnapshot?: Array<{ topic: string; phase: string; stability: string }>;
  parentFeedback?: string;
  parentFeedbackAt?: string;
  sentAt: string;
  tutor: {
    name: string;
  };
}

export default function ParentProgress() {
  useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<ParentReport | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { data: reports = [] } = useQuery<ParentReport[]>({
    queryKey: ["/api/parent/reports"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

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

  const weeklyReports = reports.filter((report) => report.reportType === "weekly");
  const monthlyReports = reports.filter((report) => report.reportType === "monthly");
  const defaultTab = monthlyReports.length > 0 ? "monthly" : "weekly";

  const formatRange = (start?: string, end?: string) => {
    if (!start || !end) return "Date range unavailable";
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const splitReportText = (value?: string | null) =>
    String(value || "")
      .split(/;\s+|\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const renderTextOrFallback = (value?: string | null) => {
    const items = splitReportText(value);

    if (items.length === 0) {
      return <p className="text-xs sm:text-sm text-muted-foreground">Not provided</p>;
    }

    if (items.length === 1) {
      return <p className="text-xs sm:text-sm text-muted-foreground">{items[0]}</p>;
    }

    return (
      <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="ml-4 list-disc">
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const renderListOrFallback = (items?: string[]) => {
    if (!items || items.length === 0) {
      return <p className="text-xs sm:text-sm text-muted-foreground">Not provided</p>;
    }

    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <p key={`${item}-${index}`} className="text-xs sm:text-sm text-muted-foreground">
            {item}
          </p>
        ))}
      </div>
    );
  };

  const isLegacyWeeklyReport = (report: ParentReport) => !report.weekRange?.start || !report.weekRange?.end;
  const isLegacyMonthlyReport = (report: ParentReport) => !report.monthRange?.start || !report.monthRange?.end;

  const renderFeedbackBlock = (report: ParentReport) => {
    if (!report.parentFeedback) return null;

    return (
      <div className="bg-muted/50 rounded-lg p-2 sm:p-3 border-l-2 border-l-primary">
        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Your Feedback</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">{report.parentFeedback}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
          Submitted {new Date(report.parentFeedbackAt!).toLocaleDateString()}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold">Progress Reports</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your child's learning journey through detailed reports</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <div>
                <p className="text-lg sm:text-2xl font-bold">{weeklyReports.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Weekly Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <div>
                <p className="text-lg sm:text-2xl font-bold">{monthlyReports.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly Reports</p>
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

      <Tabs defaultValue={defaultTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="weekly" className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm">
            <span>Weekly</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">{weeklyReports.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm">
            <span>Monthly</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">{monthlyReports.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-0 space-y-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">Weekly Reports</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Review week-by-week progress without scrolling through monthly summaries.</p>
          </div>

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
                          Weekly Report
                          {isLegacyWeeklyReport(report) && (
                            <Badge variant="outline" className="text-xs">
                              Legacy format
                            </Badge>
                          )}
                          {report.parentFeedback && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Feedback Given
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          {formatRange(report.weekRange?.start, report.weekRange?.end)}
                        </CardDescription>
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
                    <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Sessions Completed</p>
                      <p className="text-base sm:text-xl font-bold">{report.sessionsCompleted || 0}</p>
                    </div>

                    {isLegacyWeeklyReport(report) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3">
                        <p className="text-xs sm:text-sm text-amber-900">
                          This report was created before structured ranges were introduced. Some sections may have limited detail.
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Topics Worked On</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.mainTopicsCovered || "Not provided"}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">What Improved</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.whatImproved || "Not provided"}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">What This Means</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.whatThisMeans || "Not provided"}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Response Pattern</h4>
                      {renderListOrFallback(report.responsePattern)}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Challenges</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.mainMisunderstanding || "Not provided"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">System Movement</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.systemMovement || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Conditioning Progress</h4>
                      {report.conditioningProgress && report.conditioningProgress.length > 0 ? (
                        <div className="rounded-lg border overflow-hidden">
                          <table className="w-full text-xs sm:text-sm">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Topic</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Start</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Current</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium hidden sm:table-cell">Drills</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.conditioningProgress.map((row, i) => (
                                <tr key={`${row.topic}-${i}`} className="border-t">
                                  <td className="px-2 sm:px-3 py-1.5 font-medium">{row.topic}</td>
                                  <td className="px-2 sm:px-3 py-1.5 text-muted-foreground">{row.startState || "—"}</td>
                                  <td className="px-2 sm:px-3 py-1.5 text-muted-foreground">{row.endState || "—"}</td>
                                  <td className="px-2 sm:px-3 py-1.5 text-muted-foreground hidden sm:table-cell">{row.drillCount ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 sm:p-3">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Next Focus</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.nextFocus || "Not provided"}</p>
                    </div>

                    {report.topicProgressRows && report.topicProgressRows.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Conditioning Progress</h4>
                        <div className="rounded-lg border overflow-hidden">
                          <table className="w-full text-xs sm:text-sm">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Topic</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Started</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Current</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium hidden sm:table-cell">Next Focus</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.topicProgressRows.map((row, i) => (
                                <tr key={i} className="border-t">
                                  <td className="px-2 sm:px-3 py-1.5 font-medium">{row.topic}</td>
                                  <td className="px-2 sm:px-3 py-1.5 text-muted-foreground">{row.started || row.start || "—"}</td>
                                  <td className="px-2 sm:px-3 py-1.5">
                                    <span className={row.movement === "improved" ? "text-green-700 font-medium" : row.movement === "regressed" ? "text-red-600 font-medium" : "text-muted-foreground"}>
                                      {row.current || row.end || "—"}
                                    </span>
                                  </td>
                                  <td className="px-2 sm:px-3 py-1.5 text-muted-foreground hidden sm:table-cell">{row.nextAction || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {renderFeedbackBlock(report)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="mt-0 space-y-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">Monthly Reports</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Open monthly summaries directly without scrolling through weekly entries first.</p>
          </div>

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
                          {report.monthName || "Monthly"} Report
                          {isLegacyMonthlyReport(report) && (
                            <Badge variant="outline" className="text-xs">
                              Legacy format
                            </Badge>
                          )}
                          {report.parentFeedback && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Feedback Given
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          {formatRange(report.monthRange?.start, report.monthRange?.end)}
                        </CardDescription>
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
                    <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Sessions Completed</p>
                      <p className="text-base sm:text-xl font-bold">{report.totalSessionsCompleted || 0}</p>
                    </div>

                    {isLegacyMonthlyReport(report) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3">
                        <p className="text-xs sm:text-sm text-amber-900">
                          This report was created before structured ranges were introduced. Some sections may have limited detail.
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Topics Conditioned</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.mainAreasCovered || "Not provided"}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">What Became Stronger</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.skillsStronger || "Not provided"}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Recurring Challenge</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.recurringChallenge || "Not provided"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">System Outcome</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{report.systemOutcome || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Topic Progression</h4>
                      {report.topicProgressRows && report.topicProgressRows.length > 0 ? (
                        <div className="rounded-lg border overflow-hidden">
                          <table className="w-full text-xs sm:text-sm">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Topic</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">Start of Month</th>
                                <th className="text-left px-2 sm:px-3 py-1.5 font-medium">End of Month</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.topicProgressRows.map((row, i) => (
                                <tr key={i} className="border-t">
                                  <td className="px-2 sm:px-3 py-1.5 font-medium">{row.topic}</td>
                                  <td className="px-2 sm:px-3 py-1.5 text-muted-foreground">{row.started || row.start || "—"}</td>
                                  <td className="px-2 sm:px-3 py-1.5">
                                    <span className={row.movement === "improved" ? "text-green-700 font-medium" : row.movement === "regressed" ? "text-red-600 font-medium" : "text-muted-foreground"}>
                                      {row.current || row.end || "—"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 sm:p-3">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Next Month Focus</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.nextMonthPriority || "Not provided"}</p>
                    </div>

                    {report.currentStateSnapshot && report.currentStateSnapshot.length > 0 && (
                      <div className="bg-muted/20 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Current Conditioning State</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.currentStateSnapshot.map((snap, i) => (
                            <span key={i} className="text-xs bg-background border rounded px-2 py-1">
                              {snap.topic} - {snap.phase} ({snap.stability})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">What This Means</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{report.whatThisMeans || "Not provided"}</p>
                    </div>

                    {renderFeedbackBlock(report)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
