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
        <FieldRow label="Topic + Focus" value={log.topicFocus} />
        <FieldRow label="What Was Trained" value={log.whatWasTrained} />
        <FieldRow label="What Happened" value={log.behaviorSummary} />
        <FieldRow label="Performance Result" value={log.performanceResult} />
        <FieldRow label="State Movement" value={log.stateMovement} />
        <FieldRow label="What This Means" value={log.whatThisMeans} />
        <FieldRow label="Next Move" value={log.nextMove} />
        <FieldRow label="Constraint" value={log.constraint} />
        <FieldRow label="Tutor Prep For Next Session" value={log.practiceAssigned} />
      </div>
    </div>
  );
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
                                <span className="font-medium">{format(new Date(session.date), "MMM d, yyyy")}</span>
                                <Badge variant="secondary">{session.duration} min</Badge>
                              </div>
                              {(session.deterministicLog?.summaryText || session.autoSummary || session.notes) && (
                                <p className="text-sm text-muted-foreground line-clamp-2 pr-4">{session.deterministicLog?.summaryText || session.autoSummary || session.notes}</p>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            {session.deterministicLog ? (
                              <DeterministicSessionLog session={session} />
                            ) : (
                              <>
                                <FieldRow label="Session Notes" value={session.notes} />
                                <FieldRow label="Solution Implemented" value={session.solutionPurpose} />
                                <FieldRow label="Vocabulary Notes" value={session.vocabularyNotes} />
                                <FieldRow label="Method Notes" value={session.methodNotes} />
                                <FieldRow label="Reason Notes" value={session.reasonNotes} />
                                <FieldRow label="Student Response" value={session.studentResponse} />
                                <FieldRow label="What was misunderstood?" value={session.whatMisunderstood} />
                                <FieldRow label="What correction helped?" value={session.correctionHelped} />
                                <FieldRow label="What needs reinforcement?" value={session.needsReinforcement} />
                                <FieldRow label="Boss Battle" value={session.bossBattlesDone} />
                                <FieldRow label="Practice assigned" value={session.practiceProblems} />
                              </>
                            )}
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
                              <FieldRow label="Topics Worked On" value={structured.mainTopicsCovered || report.topicsLearned} />
                              <FieldRow label="What Improved" value={structured.whatImprovedThisWeek || report.strengths} />
                              <FieldRow label="Response Pattern" value={structured.studentResponsePatternThisWeek} />
                              <FieldRow label="Main Breakdown" value={structured.mainMisunderstandingThisWeek || report.areasForGrowth} />
                              <FieldRow label="System Movement" value={structured.mainCorrectionHelpedThisWeek} />
                              <FieldRow label="Conditioning Progress" value={structured.bossBattleSummaryThisWeek} />
                              <FieldRow label="Next Focus" value={structured.reinforcementNextWeek || report.nextSteps} />
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
                              <FieldRow label="Topics Conditioned" value={structured.mainAreasCoveredThisMonth || report.topicsLearned} />
                              <FieldRow label="What Became Stronger" value={structured.strongerSkillsThisMonth || report.strengths} />
                              <FieldRow label="Response Trend" value={structured.responsePatternTrendThisMonth} />
                              <FieldRow label="Recurring Challenge" value={structured.recurringChallengeThisMonth || report.areasForGrowth} />
                              <FieldRow label="System Outcome" value={structured.mostEffectiveInterventionThisMonth} />
                              <FieldRow label="Topic Progression" value={structured.bossBattleTrendThisMonth} />
                              <FieldRow label="Next Month Focus" value={structured.nextMonthPriority || report.nextSteps} />
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
