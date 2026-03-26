import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  problems_assigned: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  student_result: string | null;
  student_work: string | null;
  created_at: string;
}

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

interface ViewTrackingSystemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

function formatDate(value: string | Date, withYear = true): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
  });
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] gap-2 md:gap-3 text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground whitespace-pre-wrap">{value?.trim() ? value : "Not recorded"}</p>
    </div>
  );
}

export default function ViewTrackingSystemsDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: ViewTrackingSystemsDialogProps) {
  const { data: reportsCenter, isLoading: reportsLoading } = useQuery<ReportsCenterData>({
    queryKey: [`/api/tutor/students/${studentId}/reports-center`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: open && !!studentId,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: [`/api/tutor/students/${studentId}/assignments`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open && !!studentId,
  });

  const weeklyReports = useMemo(
    () => (reportsCenter?.reports || []).filter((r) => r.reportType === "weekly"),
    [reportsCenter?.reports]
  );

  const monthlyReports = useMemo(
    () => (reportsCenter?.reports || []).filter((r) => r.reportType === "monthly"),
    [reportsCenter?.reports]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-primary/15 bg-background p-0 shadow-sm">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">View Tracking Systems</p>
            <DialogTitle className="mt-2 flex items-center gap-2 text-xl tracking-[-0.01em]">
              <FileText className="w-4 h-4" />
              {studentName}
            </DialogTitle>
            <DialogDescription className="mt-1">
              Reports and student assignments in one operating view.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue="reports" className="w-full px-6 py-5">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1">
            <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              Reports
            </TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              Student Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6 mt-4">
            {reportsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : (
              <>
                <Card className="rounded-2xl border border-primary/15 bg-background p-4 md:p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Session Logs</h3>
                    <Badge variant="outline">{reportsCenter?.sessions?.length || 0}</Badge>
                  </div>
                  {!reportsCenter?.sessions?.length ? (
                    <p className="text-sm text-muted-foreground">No session logs found for this student.</p>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {reportsCenter.sessions.map((session) => (
                        <AccordionItem key={session.id} value={`session-${session.id}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{formatDate(session.date, true)}</span>
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
                            <FieldRow label="Student Response" value={session.studentResponse} />
                            <FieldRow label="What was misunderstood?" value={session.whatMisunderstood} />
                            <FieldRow label="What correction helped?" value={session.correctionHelped} />
                            <FieldRow label="What needs reinforcement?" value={session.needsReinforcement} />
                            <FieldRow label="Boss Battle" value={session.bossBattlesDone} />
                            <FieldRow label="Practice assigned" value={session.practiceProblems} />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </Card>

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
                                    ? `${formatDate(structured.weekStartDate, false)} - ${formatDate(structured.weekEndDate, true)}`
                                    : `Week ${report.weekNumber || "-"}`}
                                </span>
                                <Badge variant="secondary">Sent {formatDate(report.sentAt, false)}</Badge>
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
                                <Badge variant="secondary">Sent {formatDate(report.sentAt, false)}</Badge>
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

                <div className="rounded-xl border border-primary/15 bg-muted/20 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Internal tutor notes are stored but remain hidden from parent-facing output.
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4 mt-4">
            {assignmentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : !assignments || assignments.length === 0 ? (
              <Card className="rounded-2xl border border-primary/15 bg-muted/20 p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                <p className="text-muted-foreground">
                  No assignments have been created for this student.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="rounded-2xl border border-primary/15 bg-background shadow-sm p-4 md:p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-base">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(assignment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-primary/20 bg-muted/20 text-foreground">
                        {assignment.is_completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>

                    {assignment.description && (
                      <FieldRow label="Description" value={assignment.description} />
                    )}
                    {assignment.problems_assigned && (
                      <FieldRow label="Problems Assigned" value={assignment.problems_assigned} />
                    )}
                    {assignment.student_work && (
                      <FieldRow label="Student Work" value={assignment.student_work} />
                    )}
                    {assignment.student_result && (
                      <FieldRow label="Result" value={assignment.student_result} />
                    )}
                    {assignment.due_date && (
                      <FieldRow label="Due Date" value={new Date(assignment.due_date).toLocaleDateString()} />
                    )}
                    {assignment.completed_at && (
                      <FieldRow
                        label="Submitted"
                        value={`${new Date(assignment.completed_at).toLocaleDateString()} ${new Date(assignment.completed_at).toLocaleTimeString()}`}
                      />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

