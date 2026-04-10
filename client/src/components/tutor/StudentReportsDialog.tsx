import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { getQueryFn } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText } from "lucide-react";

function getSessionDayLabel(value: string): string {
  const sessionDate = new Date(value);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfSessionDay = new Date(
    sessionDate.getFullYear(),
    sessionDate.getMonth(),
    sessionDate.getDate()
  );
  const diffMs = startOfToday.getTime() - startOfSessionDay.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays >= 2 && diffDays <= 4) {
    return sessionDate.toLocaleDateString("en-US", { weekday: "long" });
  }
  return format(sessionDate, "MMM d, yyyy");
}

function getSessionTimeLabel(value: string): string {
  const sessionDate = new Date(value);
  if (Number.isNaN(sessionDate.getTime())) return "Time unavailable";
  return format(sessionDate, "h:mm a");
}

function formatMovementSummary(value?: string | null): string {
  const text = String(value || "").trim();
  if (!text) return "";

  const stripped = text
    .replace(/^Across sessions, the system:\s*/i, "")
    .replace(/^Across this week, the system:\s*/i, "")
    .trim();

  const normalized = stripped.replace(/- volatility:/i, "||VOL||");
  const [movementPart, volatilityPart] = normalized.split("||VOL||");
  const movementLines = (movementPart || "")
    .split("|")
    .map((line) =>
      line
        .replace(/^Topic\s+Movement\s+Summary:\s*/i, "")
        .replace(/^Topic\s+Movement:\s*/i, "")
        .trim()
    )
    .filter(Boolean);

  const sections: string[] = [];
  if (movementLines.length > 0) {
    sections.push(`Topic Movement Summary:\n${movementLines.join("\n")}`);
  }
  if (volatilityPart && volatilityPart.trim()) {
    sections.push(`Volatility:\n${volatilityPart.trim()}`);
  }

  return sections.length > 0 ? sections.join("\n\n") : stripped;
}

function formatWeeklyNextFocus(value?: string | null): string {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.replace(/\bRun\s+/g, "Running ");
}

function formatReportValue(value: any): string {
  if (Array.isArray(value)) {
    const formatted = value
      .map((item) => {
        if (!item) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "object") {
          if ("topic" in item && "startState" in item && "endState" in item) {
            return `${item.topic}: ${item.startState} -> ${item.endState}`;
          }
          if ("topic" in item && "currentState" in item) {
            return `${item.topic}: ${item.currentState}`;
          }
        }
        return String(item).trim();
      })
      .filter(Boolean);
    return formatted.join("\n");
  }

  return String(value || "").trim();
}

interface SessionRecord {
  id: string;
  date: string;
  duration: number;
  autoSummary?: string | null;
  autoSummaryTopic?: string | null;
  deterministicLog?: {
    topicFocus: string;
    whatWasTrained: string;
    behaviorSummary: string;
    performanceResult: string;
    stateMovement: string;
    whatThisMeans: string;
    nextMove: string;
    summaryText: string;
    drillLabel?: string | null;
    score?: number | null;
    stability?: string | null;
    constraint?: string | null;
    practiceAssigned?: string | null;
  } | null;
  notes?: string | null;
  vocabularyNotes?: string | null;
  methodNotes?: string | null;
  reasonNotes?: string | null;
  studentResponse?: string | null;
  whatMisunderstood?: string | null;
  correctionHelped?: string | null;
  needsReinforcement?: string | null;
  bossBattlesDone?: string | null;
  practiceProblems?: string | null;
  solutionPurpose?: string | null;
}

interface ReportRecord {
  id: string;
  reportType: "weekly" | "monthly";
  weekNumber?: number | null;
  monthName?: string | null;
  sentAt: string;
  structuredData?: any;
  topicsLearned?: string | null;
  strengths?: string | null;
  areasForGrowth?: string | null;
  nextSteps?: string | null;
}

interface ReportsCenterData {
  sessions: SessionRecord[];
  reports: ReportRecord[];
}

interface StudentReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] gap-2 md:gap-3 text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground whitespace-pre-wrap">{value.trim()}</p>
    </div>
  );
}

function getTopicFocusDisplay(log: NonNullable<SessionRecord["deterministicLog"]>): string {
  const summaryText = log.summaryText?.trim();
  if (summaryText && /^this session\b/i.test(summaryText)) {
    return summaryText;
  }
  return log.topicFocus;
}

function DeterministicSessionLog({ session }: { session: SessionRecord }) {
  const log = session.deterministicLog;
  if (!log) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border border-primary/15 bg-muted/20 p-3 shadow-none">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Drill</p>
          <p className="mt-1 font-medium">{log.drillLabel || "Session Drill"}</p>
        </Card>
        <Card className="rounded-xl border border-primary/15 bg-muted/20 p-3 shadow-none">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Session Score</p>
          <p className="mt-1 font-medium">{typeof log.score === "number" ? `${log.score}/100` : "Not scored"}</p>
        </Card>
        <Card className="rounded-xl border border-primary/15 bg-muted/20 p-3 shadow-none">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">State</p>
          <p className="mt-1 font-medium">{log.stability || "Unknown"}</p>
        </Card>
      </div>

      <div className="space-y-3 rounded-xl border border-primary/15 bg-background p-4">
        <FieldRow label="Session Summary" value={getTopicFocusDisplay(log)} />
        <FieldRow label="What Was Trained" value={log.whatWasTrained} />
        <FieldRow label="Observed Response" value={log.behaviorSummary} />
        <FieldRow label="Performance Result" value={log.performanceResult} />
        <FieldRow label="State Update" value={log.stateMovement} />
        <FieldRow label="What This Means" value={log.whatThisMeans} />
        <FieldRow label="Next Drill" value={log.nextMove} />
        <FieldRow label="Constraint" value={log.constraint} />
      </div>
    </div>
  );
}

function getSessionPreview(session: SessionRecord) {
  if (session.deterministicLog) {
    const log = session.deterministicLog;
    return [log.whatWasTrained, log.behaviorSummary, log.performanceResult].filter(Boolean).join(" ");
  }
  return "";
}

export default function StudentReportsDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: StudentReportsDialogProps) {
  const { data, isLoading, refetch } = useQuery<ReportsCenterData>({
    queryKey: [`/api/tutor/students/${studentId}/reports-center`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: open && !!studentId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (open && studentId) {
      void refetch();
    }
  }, [open, studentId, refetch]);

  const weeklyReports = useMemo(
    () => (data?.reports || []).filter((r) => r.reportType === "weekly"),
    [data?.reports]
  );

  const monthlyReports = useMemo(
    () => (data?.reports || []).filter((r) => r.reportType === "monthly"),
    [data?.reports]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-primary/15 bg-background p-0 shadow-sm">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Reports Center</p>
            <DialogTitle className="mt-2 flex items-center gap-2 text-xl tracking-[-0.01em]">
              <FileText className="w-4 h-4" />
              {studentName} Reports
            </DialogTitle>
            <DialogDescription className="mt-1">
              Review all session logs, weekly reports, and monthly reports for this student.
            </DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 px-6 py-5">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <div className="space-y-6 px-6 py-5">
            <Tabs defaultValue="session-logs" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-3 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1 gap-1">
                <TabsTrigger value="session-logs" className="text-xs sm:text-sm py-2 px-2">Session Logs</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs sm:text-sm py-2 px-2">Weekly Reports</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs sm:text-sm py-2 px-2">Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value="session-logs" className="mt-0">
                <Card className="rounded-2xl border border-primary/15 bg-background p-4 md:p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Session Logs</h3>
                    <Badge variant="outline">{data?.sessions?.length || 0}</Badge>
                  </div>
                  {!data?.sessions?.length ? (
                    <p className="text-sm text-muted-foreground">No session logs found for this student.</p>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {data.sessions.map((session) => (
                        <AccordionItem key={session.id} value={`session-${session.id}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{getSessionDayLabel(session.date)}</span>
                                <span className="text-xs text-muted-foreground">{getSessionTimeLabel(session.date)}</span>
                              </div>
                              {getSessionPreview(session) && (
                                <p className="text-sm text-muted-foreground line-clamp-2 pr-4">{getSessionPreview(session)}</p>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            <DeterministicSessionLog session={session} />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="weekly" className="mt-0">
                <Card className="rounded-2xl border border-primary/15 bg-background p-4 md:p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Weekly Reports</h3>
                    <Badge variant="outline">{weeklyReports.length}</Badge>
                  </div>
                  {!weeklyReports.length ? (
                    <p className="text-sm text-muted-foreground">No weekly reports created yet.</p>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {weeklyReports.map((report) => {
                        const structured = report.structuredData || {};
                        return (
                          <AccordionItem key={report.id} value={`weekly-${report.id}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span>
                                  {structured.weekStartDate && structured.weekEndDate
                                    ? `${format(new Date(structured.weekStartDate), "MMM d")} - ${format(new Date(structured.weekEndDate), "MMM d, yyyy")}`
                                    : `Week ${report.weekNumber || "-"}`}
                                </span>
                                <Badge variant="secondary">Sent {format(new Date(report.sentAt), "MMM d")}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                              <FieldRow label="Topics Worked On" value={formatReportValue(structured.topicsWorkedOn || structured.mainTopicsCovered || report.topicsLearned)} />
                              <FieldRow label="Conditioning Progress" value={formatReportValue(structured.conditioningProgress || structured.bossBattleSummaryThisWeek)} />
                              <FieldRow label="What Improved" value={formatReportValue(structured.whatImproved || structured.whatImprovedThisWeek || report.strengths)} />
                              <FieldRow label="Response Pattern" value={formatReportValue(structured.responsePattern || structured.studentResponsePatternThisWeek)} />
                              <FieldRow label="Main Breakdown" value={formatReportValue(structured.mainBreakdown || structured.mainMisunderstandingThisWeek || report.areasForGrowth)} />
                              <FieldRow label="Movement Summary" value={formatMovementSummary(formatReportValue(structured.systemMovement || structured.mainCorrectionHelpedThisWeek))} />
                              <FieldRow label="Next Focus" value={formatWeeklyNextFocus(formatReportValue(structured.nextFocus || structured.reinforcementNextWeek || report.nextSteps))} />
                              <FieldRow label="Parent Feedback" value={formatReportValue(report.parentFeedback)} />
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="mt-0">
                <Card className="rounded-2xl border border-primary/15 bg-background p-4 md:p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Monthly Reports</h3>
                    <Badge variant="outline">{monthlyReports.length}</Badge>
                  </div>
                  {!monthlyReports.length ? (
                    <p className="text-sm text-muted-foreground">No monthly reports created yet.</p>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {monthlyReports.map((report) => {
                        const structured = report.structuredData || {};
                        return (
                          <AccordionItem key={report.id} value={`monthly-${report.id}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span>{report.monthName || "Monthly report"}</span>
                                <Badge variant="secondary">Sent {format(new Date(report.sentAt), "MMM d")}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                              <FieldRow label="Topics Conditioned" value={formatReportValue(structured.topicsConditioned || structured.mainAreasCoveredThisMonth || report.topicsLearned)} />
                              <FieldRow label="Topic Progression" value={formatReportValue(structured.topicProgression || structured.bossBattleTrendThisMonth)} />
                              <FieldRow label="What Became Stronger" value={formatReportValue(structured.whatBecameStronger || structured.strongerSkillsThisMonth || report.strengths)} />
                              <FieldRow label="Response Trend" value={formatReportValue(structured.responseTrend || structured.responsePatternTrendThisMonth)} />
                              <FieldRow label="Recurring Challenge" value={formatReportValue(structured.recurringChallenge || structured.recurringChallengeThisMonth || report.areasForGrowth)} />
                              <FieldRow label="System Outcome" value={formatReportValue(structured.systemOutcome || structured.mostEffectiveInterventionThisMonth)} />
                              <FieldRow label="Next Month Focus" value={formatReportValue(structured.nextMonthFocus || structured.nextMonthPriority || report.nextSteps)} />
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Internal tutor notes are stored but remain hidden from parent-facing output.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
