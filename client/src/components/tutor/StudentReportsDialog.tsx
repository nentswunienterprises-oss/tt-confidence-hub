import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Calendar, FileText } from "lucide-react";

interface SessionRecord {
  id: string;
  date: string;
  duration: number;
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] gap-2 md:gap-3 text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground whitespace-pre-wrap">{value?.trim() ? value : "Not recorded"}</p>
    </div>
  );
}

export default function StudentReportsDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: StudentReportsDialogProps) {
  const { data, isLoading } = useQuery<ReportsCenterData>({
    queryKey: [`/api/tutor/students/${studentId}/reports-center`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: open && !!studentId,
  });

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {studentName} Reports
          </DialogTitle>
          <DialogDescription>
            Review all session logs, weekly reports, and monthly reports for this student.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-4 md:p-5 space-y-4">
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
                          {session.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2 pr-4">{session.notes}</p>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <FieldRow label="Session Notes" value={session.notes} />
                        <FieldRow label="Solution Implemented" value={session.solutionPurpose} />
                        <FieldRow label="Vocabulary Notes" value={session.vocabularyNotes} />
                        <FieldRow label="Method Notes" value={session.methodNotes} />
                        <FieldRow label="Reason Notes" value={session.reasonNotes} />
                        <FieldRow label="Student Response Tags" value={session.studentResponse} />
                        <FieldRow label="Student Response Notes" value={session.studentResponse} />
                        <FieldRow label="What was misunderstood?" value={session.whatMisunderstood} />
                        <FieldRow label="What correction helped?" value={session.correctionHelped} />
                        <FieldRow label="What needs reinforcement?" value={session.needsReinforcement} />
                        <FieldRow label="Boss Battle Type" value={session.bossBattlesDone} />
                        <FieldRow label="Boss Battle Outcome" value={session.bossBattlesDone} />
                        <FieldRow label="Boss Battle Notes" value={session.bossBattlesDone} />
                        <FieldRow label="Practice assigned" value={session.practiceProblems} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </Card>

            <Card className="p-4 md:p-5 space-y-4">
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
                          <FieldRow label="Main Topics Covered" value={structured.mainTopicsCovered || report.topicsLearned} />
                          <FieldRow label="What improved this week" value={structured.whatImprovedThisWeek || report.strengths} />
                          <FieldRow label="Student response pattern this week" value={structured.studentResponsePatternThisWeek} />
                          <FieldRow label="Main misunderstanding this week" value={structured.mainMisunderstandingThisWeek || report.areasForGrowth} />
                          <FieldRow label="Main correction that helped" value={structured.mainCorrectionHelpedThisWeek} />
                          <FieldRow label="Boss Battle summary this week" value={structured.bossBattleSummaryThisWeek} />
                          <FieldRow label="What needs reinforcement next week" value={structured.reinforcementNextWeek || report.nextSteps} />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </Card>

            <Card className="p-4 md:p-5 space-y-4">
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
                          <FieldRow label="Main areas covered this month" value={structured.mainAreasCoveredThisMonth || report.topicsLearned} />
                          <FieldRow label="What skills became stronger" value={structured.strongerSkillsThisMonth || report.strengths} />
                          <FieldRow label="Response pattern trend" value={structured.responsePatternTrendThisMonth} />
                          <FieldRow label="Recurring challenge" value={structured.recurringChallengeThisMonth || report.areasForGrowth} />
                          <FieldRow label="Most effective intervention" value={structured.mostEffectiveInterventionThisMonth} />
                          <FieldRow label="Boss Battle trend" value={structured.bossBattleTrendThisMonth} />
                          <FieldRow label="Next month priority" value={structured.nextMonthPriority || report.nextSteps} />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </Card>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Internal tutor notes are stored but remain hidden from parent-facing output.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
