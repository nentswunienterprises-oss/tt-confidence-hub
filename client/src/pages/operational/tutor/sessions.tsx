import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronDown, Clock, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Session, Student } from "@shared/schema";
import { endOfMonth, endOfWeek, format, isWithinInterval, startOfMonth, startOfWeek } from "date-fns";
import TutorSessionLogForm from "@/components/tutor/TutorSessionLogForm";

interface ReportRecord {
  id: string;
  studentId: string;
  reportType: "weekly" | "monthly";
  sentAt: string;
  structuredData?: any;
  weekNumber?: number | null;
  monthName?: string | null;
  topicsLearned?: string | null;
  strengths?: string | null;
  areasForGrowth?: string | null;
  nextSteps?: string | null;
}

const formatDateInput = (date: Date) => format(date, "yyyy-MM-dd");

const initialSessionFormData = {
  studentId: "",
  duration: "120",
  notes: "",
  solutionPurpose: "",
  vocabularyNotes: "",
  methodNotes: "",
  reasonNotes: "",
  studentResponse: "",
  tutorGrowthReflection: "",
  bossBattlesDone: "",
  practiceProblems: "",
  whatMisunderstood: "",
  correctionHelped: "",
  needsReinforcement: "",
  techChallengeDescription: "",
  techChallengeResolution: "",
};

export default function TutorSessions() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasBossBattles, setHasBossBattles] = useState(false);
  const [assignPractice, setAssignPractice] = useState(false);
  const [has3LayerSolutions, setHas3LayerSolutions] = useState(false);
  const [hasChallenges, setHasChallenges] = useState(false);
  const [hasTechChallenges, setHasTechChallenges] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [weeklyDialogOpen, setWeeklyDialogOpen] = useState(false);
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);

  const [weeklyForm, setWeeklyForm] = useState({
    studentId: "",
    weekStartDate: formatDateInput(startOfWeek(new Date(), { weekStartsOn: 1 })),
    mainTopicsCovered: "",
    whatImproved: "",
    studentResponsePattern: "",
    mainMisunderstanding: "",
    mainCorrectionHelped: "",
    bossBattleSummary: "",
    reinforcementNextWeek: "",
    internalTutorNote: "",
  });

  const [monthlyForm, setMonthlyForm] = useState({
    studentId: "",
    monthStartDate: formatDateInput(startOfMonth(new Date())),
    mainAreasCovered: "",
    strongerSkills: "",
    responsePatternTrend: "",
    recurringChallenge: "",
    mostEffectiveIntervention: "",
    bossBattleTrend: "",
    nextMonthPriority: "",
    internalTutorNote: "",
  });

  const [formData, setFormData] = useState(initialSessionFormData);

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery<Session[]>({
    queryKey: ["/api/tutor/sessions"],
    enabled: isAuthenticated && !authLoading,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const {
    data: students,
    isLoading: studentsLoading,
  } = useQuery<Student[]>({
    queryKey: ["/api/tutor/students"],
    enabled: isAuthenticated && !authLoading,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: reports } = useQuery<ReportRecord[]>({
    queryKey: ["/api/tutor/reports"],
    enabled: isAuthenticated && !authLoading,
  });

  const resetSessionForm = () => {
    setFormData(initialSessionFormData);
    setHasBossBattles(false);
    setAssignPractice(false);
    setHas3LayerSolutions(false);
    setHasChallenges(false);
    setHasTechChallenges(false);
  };

  const weeklyStartDate = new Date(weeklyForm.weekStartDate || new Date().toISOString());
  const weeklyEndDate = endOfWeek(weeklyStartDate, { weekStartsOn: 1 });

  const selectedWeekSessions = (sessions || []).filter((session) => {
    if (!weeklyForm.studentId || session.studentId !== weeklyForm.studentId) {
      return false;
    }
    return isWithinInterval(new Date(session.date), { start: weeklyStartDate, end: weeklyEndDate });
  });

  const monthlyStartDate = new Date(monthlyForm.monthStartDate || new Date().toISOString());
  const monthlyEndDate = endOfMonth(monthlyStartDate);

  const selectedMonthSessionsCount = (sessions || []).filter((session) => {
    if (!monthlyForm.studentId || session.studentId !== monthlyForm.studentId) {
      return false;
    }
    return isWithinInterval(new Date(session.date), { start: monthlyStartDate, end: monthlyEndDate });
  }).length;

  const selectedMonthWeeklyReports = (reports || []).filter((report) => {
    if (report.reportType !== "weekly" || report.studentId !== monthlyForm.studentId) {
      return false;
    }
    const startDate = report.structuredData?.weekStartDate
      ? new Date(report.structuredData.weekStartDate)
      : new Date(report.sentAt);

    return isWithinInterval(startDate, { start: monthlyStartDate, end: monthlyEndDate });
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
    if (sessionsError && isUnauthorizedError(sessionsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [sessionsError, toast]);

  const createSession = useMutation({
    mutationFn: async (data: typeof formData) => {
      const durationValue = Number(data.duration);
      if (!Number.isFinite(durationValue) || durationValue < 30 || durationValue > 240) {
        throw new Error("Duration must be between 30 and 240 minutes.");
      }

      await apiRequest("POST", "/api/tutor/sessions", {
        studentId: data.studentId,
        duration: durationValue,
        notes: data.notes.trim() || null,
        solutionPurpose: data.solutionPurpose.trim() || null,
        vocabularyNotes: data.vocabularyNotes.trim() || null,
        methodNotes: data.methodNotes.trim() || null,
        reasonNotes: data.reasonNotes.trim() || null,
        studentResponse: data.studentResponse.trim() || null,
        tutorGrowthReflection: data.tutorGrowthReflection.trim() || null,
        bossBattlesDone: data.bossBattlesDone.trim() || null,
        practiceProblems: data.practiceProblems.trim() || null,
        whatMisunderstood: data.whatMisunderstood.trim() || null,
        correctionHelped: data.correctionHelped.trim() || null,
        needsReinforcement: data.needsReinforcement.trim() || null,
        techChallengeDescription: data.techChallengeDescription.trim() || null,
        techChallengeResolution: data.techChallengeResolution.trim() || null,
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students"] });
      setDialogOpen(false);
      resetSessionForm();
      toast({
        title: "Session logged",
        description: "Your session has been recorded successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createWeeklyReport = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/tutor/reports/weekly", {
        studentId: weeklyForm.studentId,
        weekStartDate: formatDateInput(weeklyStartDate),
        weekEndDate: formatDateInput(weeklyEndDate),
        sessionsCompletedThisWeek: selectedWeekSessions.length,
        mainTopicsCovered: weeklyForm.mainTopicsCovered,
        whatImprovedThisWeek: weeklyForm.whatImproved,
        studentResponsePatternThisWeek: weeklyForm.studentResponsePattern,
        mainMisunderstandingThisWeek: weeklyForm.mainMisunderstanding,
        mainCorrectionHelpedThisWeek: weeklyForm.mainCorrectionHelped,
        bossBattleSummaryThisWeek: weeklyForm.bossBattleSummary,
        reinforcementNextWeek: weeklyForm.reinforcementNextWeek,
        internalWeeklyTutorNote: weeklyForm.internalTutorNote,
        sourceSessionIds: selectedWeekSessions.map((s) => s.id),
        sourceSessionCount: selectedWeekSessions.length,
        bossBattlesCompletedThisWeek: selectedWeekSessions.filter((s) => !!s.bossBattlesDone).length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/reports"] });
      setWeeklyDialogOpen(false);
      setWeeklyForm({
        studentId: "",
        weekStartDate: formatDateInput(startOfWeek(new Date(), { weekStartsOn: 1 })),
        mainTopicsCovered: "",
        whatImproved: "",
        studentResponsePattern: "",
        mainMisunderstanding: "",
        mainCorrectionHelped: "",
        bossBattleSummary: "",
        reinforcementNextWeek: "",
        internalTutorNote: "",
      });
      toast({
        title: "Weekly report created",
        description: "Weekly report has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create weekly report.",
        variant: "destructive",
      });
    },
  });

  const createMonthlyReport = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/tutor/reports/monthly", {
        studentId: monthlyForm.studentId,
        monthStartDate: formatDateInput(monthlyStartDate),
        monthEndDate: formatDateInput(monthlyEndDate),
        totalSessionsCompletedThisMonth: selectedMonthSessionsCount,
        mainAreasCoveredThisMonth: monthlyForm.mainAreasCovered,
        strongerSkillsThisMonth: monthlyForm.strongerSkills,
        responsePatternTrendThisMonth: monthlyForm.responsePatternTrend,
        recurringChallengeThisMonth: monthlyForm.recurringChallenge,
        mostEffectiveInterventionThisMonth: monthlyForm.mostEffectiveIntervention,
        bossBattleTrendThisMonth: monthlyForm.bossBattleTrend,
        nextMonthPriority: monthlyForm.nextMonthPriority,
        internalMonthlyTutorNote: monthlyForm.internalTutorNote,
        sourceWeeklyReportIds: selectedMonthWeeklyReports.map((r) => r.id),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/reports"] });
      setMonthlyDialogOpen(false);
      setMonthlyForm({
        studentId: "",
        monthStartDate: formatDateInput(startOfMonth(new Date())),
        mainAreasCovered: "",
        strongerSkills: "",
        responsePatternTrend: "",
        recurringChallenge: "",
        mostEffectiveIntervention: "",
        bossBattleTrend: "",
        nextMonthPriority: "",
        internalTutorNote: "",
      });
      toast({
        title: "Monthly report created",
        description: "Monthly report has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create monthly report.",
        variant: "destructive",
      });
    },
  });

  const durationValue = Number(formData.duration);
  const hasValidDuration = Number.isFinite(durationValue) && durationValue >= 30 && durationValue <= 240;
  const isSessionFormValid = !!formData.studentId && hasValidDuration;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.duration) {
      toast({
        title: "Validation Error",
        description: "Please select a student and duration.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(durationValue) || durationValue < 30 || durationValue > 240) {
      toast({
        title: "Validation Error",
        description: "Duration must be between 30 and 240 minutes.",
        variant: "destructive",
      });
      return;
    }

    createSession.mutate(formData);
  };

  const handleWeeklyReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !weeklyForm.studentId ||
      !weeklyForm.mainTopicsCovered.trim() ||
      !weeklyForm.whatImproved.trim() ||
      !weeklyForm.studentResponsePattern.trim() ||
      !weeklyForm.mainMisunderstanding.trim() ||
      !weeklyForm.mainCorrectionHelped.trim() ||
      !weeklyForm.bossBattleSummary.trim() ||
      !weeklyForm.reinforcementNextWeek.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please complete all required weekly report fields.",
        variant: "destructive",
      });
      return;
    }

    createWeeklyReport.mutate();
  };

  const handleMonthlyReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !monthlyForm.studentId ||
      !monthlyForm.mainAreasCovered.trim() ||
      !monthlyForm.strongerSkills.trim() ||
      !monthlyForm.responsePatternTrend.trim() ||
      !monthlyForm.recurringChallenge.trim() ||
      !monthlyForm.mostEffectiveIntervention.trim() ||
      !monthlyForm.bossBattleTrend.trim() ||
      !monthlyForm.nextMonthPriority.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please complete all required monthly report fields.",
        variant: "destructive",
      });
      return;
    }

    createMonthlyReport.mutate();
  };

  if (authLoading || sessionsLoading || studentsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const getStudentName = (studentId: string) => {
    return students?.find((s) => s.id === studentId)?.name || "Unknown";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sessions</h1>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetSessionForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto" data-testid="button-log-session">
                  <Plus className="w-4 h-4" />
                  Log Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log New Session</DialogTitle>
                  <DialogDescription>
                    Record your session using the 3-Layer Lens Teaching Model
                  </DialogDescription>
                </DialogHeader>
                <TutorSessionLogForm
                  studentOptions={(students || []).map((student) => ({
                    id: student.id,
                    name: student.name,
                    grade: student.grade,
                  }))}
                  submitLabel="Log Session"
                  onSuccess={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <DropdownMenu open={reportsMenuOpen} onOpenChange={setReportsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                  data-testid="button-toggle-reports-menu"
                >
                  Create Report
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${reportsMenuOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  data-testid="button-create-weekly-report"
                  onSelect={(e) => {
                    e.preventDefault();
                    setWeeklyDialogOpen(true);
                  }}
                >
                  Create Weekly Report
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="button-create-monthly-report"
                  onSelect={(e) => {
                    e.preventDefault();
                    setMonthlyDialogOpen(true);
                  }}
                >
                  Create Monthly Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={weeklyDialogOpen} onOpenChange={setWeeklyDialogOpen}>
              <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
                <form onSubmit={handleWeeklyReportSubmit} className="space-y-5">
                  <DialogHeader>
                    <DialogTitle>Create Weekly Report</DialogTitle>
                    <DialogDescription>
                      Generate one weekly parent report by reviewing this week&apos;s session logs.
                    </DialogDescription>
                  </DialogHeader>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section A - Weekly Basics</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Student *</Label>
                        <Select
                          value={weeklyForm.studentId}
                          onValueChange={(value) => setWeeklyForm({ ...weeklyForm, studentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students?.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name} - {student.grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Week Start *</Label>
                        <Input
                          type="date"
                          value={weeklyForm.weekStartDate}
                          onChange={(e) => setWeeklyForm({ ...weeklyForm, weekStartDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sessions Completed This Week</Label>
                        <Input value={String(selectedWeekSessions.length)} readOnly />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Week range: {format(weeklyStartDate, "MMM d, yyyy")} - {format(weeklyEndDate, "MMM d, yyyy")}
                    </p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Source Review Panel (Read-only)</h3>
                      <Badge variant="outline">{selectedWeekSessions.length} sessions</Badge>
                    </div>
                    {!weeklyForm.studentId ? (
                      <p className="text-sm text-muted-foreground">Select a student to load source logs.</p>
                    ) : !selectedWeekSessions.length ? (
                      <p className="text-sm text-muted-foreground">No session logs found for the selected week.</p>
                    ) : (
                      <Accordion type="multiple" className="w-full">
                        {selectedWeekSessions.map((session) => (
                          <AccordionItem key={session.id} value={`weekly-source-${session.id}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>{format(new Date(session.date), "EEE, MMM d")}</span>
                                  <Badge variant="secondary">{session.duration} min</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 pr-4">
                                  {session.notes?.trim() || "No session notes"}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 text-sm">
                              <p><span className="font-medium">Session Notes:</span> {session.notes || "Not recorded"}</p>
                              <p><span className="font-medium">Solution Implemented:</span> {(session as any).solutionPurpose || "Not recorded"}</p>
                              <p><span className="font-medium">Vocabulary Notes:</span> {session.vocabularyNotes || "Not recorded"}</p>
                              <p><span className="font-medium">Method Notes:</span> {session.methodNotes || "Not recorded"}</p>
                              <p><span className="font-medium">Reason Notes:</span> {session.reasonNotes || "Not recorded"}</p>
                              <p><span className="font-medium">Student Response Tags:</span> {(session as any).studentResponseTags || session.studentResponse || "Not recorded"}</p>
                              <p><span className="font-medium">Student Response Notes:</span> {session.studentResponse || "Not recorded"}</p>
                              <p><span className="font-medium">What was misunderstood?</span> {(session as any).whatMisunderstood || "Not recorded"}</p>
                              <p><span className="font-medium">What correction helped?</span> {(session as any).correctionHelped || "Not recorded"}</p>
                              <p><span className="font-medium">What needs reinforcement?</span> {(session as any).needsReinforcement || "Not recorded"}</p>
                              <p><span className="font-medium">Boss Battle Type:</span> {(session as any).bossBattleType || session.bossBattlesDone || "Not recorded"}</p>
                              <p><span className="font-medium">Boss Battle Outcome:</span> {(session as any).bossBattleOutcome || "Not recorded"}</p>
                              <p><span className="font-medium">Boss Battle Notes:</span> {session.bossBattlesDone || "Not recorded"}</p>
                              <p><span className="font-medium">Practice assigned:</span> {session.practiceProblems || "Not recorded"}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section B - Main Topics Covered *</h3>
                    <p className="text-sm text-muted-foreground">Review this week&apos;s Session Notes, Vocabulary Notes, and Method Notes. What were the main concepts or skills trained this week?</p>
                    <Textarea rows={4} value={weeklyForm.mainTopicsCovered} onChange={(e) => setWeeklyForm({ ...weeklyForm, mainTopicsCovered: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Summarize the week&apos;s focus areas, not each individual session.</p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section C - What Improved *</h3>
                    <p className="text-sm text-muted-foreground">Review this week&apos;s Method Notes, Reason Notes, Session Notes, and Boss Battle records. What skill, method, or reasoning ability became stronger this week?</p>
                    <Textarea rows={4} value={weeklyForm.whatImproved} onChange={(e) => setWeeklyForm({ ...weeklyForm, whatImproved: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Focus on observable improvement.</p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section D - Student Response Pattern *</h3>
                    <p className="text-sm text-muted-foreground">Review this week&apos;s Student Response Tags, Student Response Notes, and Boss Battle Outcomes. Describe the student&apos;s typical response pattern when the work became difficult.</p>
                    <Textarea rows={4} value={weeklyForm.studentResponsePattern} onChange={(e) => setWeeklyForm({ ...weeklyForm, studentResponsePattern: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Describe the pattern across the week, not one moment.</p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section E - Main Breakdown *</h3>
                    <div className="space-y-2">
                      <Label>Main misunderstanding this week</Label>
                      <p className="text-sm text-muted-foreground">Review this week&apos;s "What was misunderstood?" entries. What misunderstanding or instability appeared most clearly this week?</p>
                      <Textarea rows={3} value={weeklyForm.mainMisunderstanding} onChange={(e) => setWeeklyForm({ ...weeklyForm, mainMisunderstanding: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Main correction that helped</Label>
                      <p className="text-sm text-muted-foreground">Review this week&apos;s "What correction helped?" entries and Solution Implemented fields. What correction or teaching move helped most this week?</p>
                      <Textarea rows={3} value={weeklyForm.mainCorrectionHelped} onChange={(e) => setWeeklyForm({ ...weeklyForm, mainCorrectionHelped: e.target.value })} />
                    </div>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section F - Boss Battle Summary *</h3>
                    <p className="text-sm text-muted-foreground">Review this week&apos;s Boss Battle records. What did the student&apos;s independent execution show this week?</p>
                    <Textarea rows={4} value={weeklyForm.bossBattleSummary} onChange={(e) => setWeeklyForm({ ...weeklyForm, bossBattleSummary: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Mention whether the student needed guidance, showed hesitation, or executed more independently.</p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section G - Next Reinforcement Priority *</h3>
                    <p className="text-sm text-muted-foreground">Review this week&apos;s "What needs reinforcement?" fields and assigned practice. What should be the main focus next week?</p>
                    <Textarea rows={4} value={weeklyForm.reinforcementNextWeek} onChange={(e) => setWeeklyForm({ ...weeklyForm, reinforcementNextWeek: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section H - Internal Weekly Tutor Note</h3>
                    <p className="text-sm text-muted-foreground">Based on this week&apos;s sessions, what should you watch, adjust, or strengthen next week? Internal only.</p>
                    <Textarea rows={3} value={weeklyForm.internalTutorNote} onChange={(e) => setWeeklyForm({ ...weeklyForm, internalTutorNote: e.target.value })} />
                  </Card>

                  <DialogFooter>
                    <Button type="submit" disabled={createWeeklyReport.isPending}>
                      {createWeeklyReport.isPending ? "Saving..." : "Create Weekly Report"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
              <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
                <form onSubmit={handleMonthlyReportSubmit} className="space-y-5">
                  <DialogHeader>
                    <DialogTitle>Create Monthly Report</DialogTitle>
                    <DialogDescription>
                      Generate one monthly parent report by reviewing this month&apos;s weekly reports.
                    </DialogDescription>
                  </DialogHeader>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section A - Monthly Basics</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Student *</Label>
                        <Select
                          value={monthlyForm.studentId}
                          onValueChange={(value) => setMonthlyForm({ ...monthlyForm, studentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students?.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name} - {student.grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Month Start *</Label>
                        <Input
                          type="date"
                          value={monthlyForm.monthStartDate}
                          onChange={(e) => setMonthlyForm({ ...monthlyForm, monthStartDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Sessions Completed This Month</Label>
                        <Input value={String(selectedMonthSessionsCount)} readOnly />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Month range: {format(monthlyStartDate, "MMM d, yyyy")} - {format(monthlyEndDate, "MMM d, yyyy")}
                    </p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Weekly Report Reference Panel (Read-only)</h3>
                      <Badge variant="outline">{selectedMonthWeeklyReports.length} weekly reports</Badge>
                    </div>
                    {!monthlyForm.studentId ? (
                      <p className="text-sm text-muted-foreground">Select a student to load weekly reports.</p>
                    ) : !selectedMonthWeeklyReports.length ? (
                      <p className="text-sm text-muted-foreground">No weekly reports found for the selected month.</p>
                    ) : (
                      <Accordion type="multiple" className="w-full">
                        {selectedMonthWeeklyReports.map((report) => {
                          const structured = report.structuredData || {};
                          return (
                            <AccordionItem key={report.id} value={`monthly-source-${report.id}`}>
                              <AccordionTrigger className="text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>
                                    {structured.weekStartDate && structured.weekEndDate
                                      ? `${format(new Date(structured.weekStartDate), "MMM d")} - ${format(new Date(structured.weekEndDate), "MMM d, yyyy")}`
                                      : `Week ${report.weekNumber || "-"}`}
                                  </span>
                                  <Badge variant="secondary">Weekly</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3 text-sm">
                                <p><span className="font-medium">Main Topics Covered:</span> {structured.mainTopicsCovered || report.topicsLearned || "Not recorded"}</p>
                                <p><span className="font-medium">What improved this week:</span> {structured.whatImprovedThisWeek || report.strengths || "Not recorded"}</p>
                                <p><span className="font-medium">Student response pattern this week:</span> {structured.studentResponsePatternThisWeek || "Not recorded"}</p>
                                <p><span className="font-medium">Main misunderstanding this week:</span> {structured.mainMisunderstandingThisWeek || report.areasForGrowth || "Not recorded"}</p>
                                <p><span className="font-medium">Main correction that helped:</span> {structured.mainCorrectionHelpedThisWeek || "Not recorded"}</p>
                                <p><span className="font-medium">Boss Battle summary this week:</span> {structured.bossBattleSummaryThisWeek || "Not recorded"}</p>
                                <p><span className="font-medium">What needs reinforcement next week:</span> {structured.reinforcementNextWeek || report.nextSteps || "Not recorded"}</p>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section B - Main Areas Covered *</h3>
                    <p className="text-sm text-muted-foreground">Review this month&apos;s weekly "Main Topics Covered" and "What improved this week" entries. What were the main skills or concepts trained this month?</p>
                    <Textarea rows={4} value={monthlyForm.mainAreasCovered} onChange={(e) => setMonthlyForm({ ...monthlyForm, mainAreasCovered: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section C - Monthly Skill Progression *</h3>
                    <p className="text-sm text-muted-foreground">Review the weekly reports from the start of the month to the end. What skills, methods, or reasoning abilities are clearly stronger now than earlier in the month?</p>
                    <Textarea rows={4} value={monthlyForm.strongerSkills} onChange={(e) => setMonthlyForm({ ...monthlyForm, strongerSkills: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Describe progression, not isolated moments.</p>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section D - Monthly Stability Trend *</h3>
                    <p className="text-sm text-muted-foreground">Review this month&apos;s weekly student response sections and Boss Battle summaries. Compare response under difficulty at the beginning of the month versus the end.</p>
                    <Textarea rows={4} value={monthlyForm.responsePatternTrend} onChange={(e) => setMonthlyForm({ ...monthlyForm, responsePatternTrend: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section E - Recurring Breakdown *</h3>
                    <p className="text-sm text-muted-foreground">Review this month&apos;s weekly misunderstanding and reinforcement sections. What misunderstanding, instability, or hesitation showed up more than once?</p>
                    <Textarea rows={4} value={monthlyForm.recurringChallenge} onChange={(e) => setMonthlyForm({ ...monthlyForm, recurringChallenge: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section F - Most Effective Intervention *</h3>
                    <p className="text-sm text-muted-foreground">Review this month&apos;s weekly corrections and underlying session solutions. What correction or teaching approach consistently helped the student move forward?</p>
                    <Textarea rows={4} value={monthlyForm.mostEffectiveIntervention} onChange={(e) => setMonthlyForm({ ...monthlyForm, mostEffectiveIntervention: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section G - Boss Battle / Execution Trend *</h3>
                    <p className="text-sm text-muted-foreground">Review Boss Battle summaries across the month. How did independent execution change over time?</p>
                    <Textarea rows={4} value={monthlyForm.bossBattleTrend} onChange={(e) => setMonthlyForm({ ...monthlyForm, bossBattleTrend: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section H - Next Month Priority *</h3>
                    <p className="text-sm text-muted-foreground">Based on the month as a whole, what should be the main priority for next month?</p>
                    <Textarea rows={4} value={monthlyForm.nextMonthPriority} onChange={(e) => setMonthlyForm({ ...monthlyForm, nextMonthPriority: e.target.value })} />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Section I - Internal Monthly Tutor Note</h3>
                    <p className="text-sm text-muted-foreground">What pattern matters most going into next month? Internal only.</p>
                    <Textarea rows={3} value={monthlyForm.internalTutorNote} onChange={(e) => setMonthlyForm({ ...monthlyForm, internalTutorNote: e.target.value })} />
                  </Card>

                  <DialogFooter>
                    <Button type="submit" disabled={createMonthlyReport.isPending}>
                      {createMonthlyReport.isPending ? "Saving..." : "Create Monthly Report"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sessions Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">{sessions?.length || 0}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">
                {sessions?.reduce((sum, s) => sum + s.duration, 0) || 0}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Minutes</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">
                {sessions && sessions.length > 0
                  ? (
                      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
                    ).toFixed(0)
                  : 0}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Avg. Duration</p>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Session History</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {!sessions || sessions.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No sessions logged yet</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 space-y-3"
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{getStudentName(session.studentId)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.duration} min</p>
                        {session.confidenceScoreDelta !== null &&
                          session.confidenceScoreDelta !== 0 && (
                            <p
                              className={`text-xs font-semibold ${
                                session.confidenceScoreDelta > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {session.confidenceScoreDelta > 0 ? "+" : ""}
                              {session.confidenceScoreDelta} confidence
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {session.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
