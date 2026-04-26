import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderKanban,
  Mail,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import BattleTestHistoryDialog from "@/components/battle-testing/BattleTestHistoryDialog";
import BattleTestRunnerDialog from "@/components/battle-testing/BattleTestRunnerDialog";
import StudentCommunicationDialog from "@/components/communications/StudentCommunicationDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import StudentTopicConditioningDialog from "@/components/tutor/StudentTopicConditioningDialog";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { API_URL } from "@/lib/config";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  getBattleTestStateLabel,
  type BattleTestPhaseDefinition,
  type BattleTestState,
  type BattleTestResponseInput,
  type PodBattleTestingSummary,
} from "@shared/battleTesting";
import type { Pod, TutorAssignment, User } from "@shared/schema";

interface PodOverviewData {
  pod: Pod;
  tutors: (User & { assignment: TutorAssignment })[];
  totalStudents: number;
  totalSessions: number;
  battleTestingSummary: PodBattleTestingSummary;
}

interface ActiveTutorRunContext {
  podId: string;
  podName: string;
  assignmentId: string;
  tutorId: string;
  tutorName: string;
}

interface ActiveTutorHistoryContext {
  podId: string;
  tutorName: string;
  assignmentId: string;
}

interface StudentActionRecord {
  id: string;
  name: string;
  grade?: string | null;
  parentInfo?: any;
  struggleAreas?: string | null;
  topicConditioning?: any;
  topic_conditioning?: any;
  conceptMastery?: any;
  concept_mastery?: any;
}

const EMPTY_BATTLE_TESTING_SUMMARY: PodBattleTestingSummary = {
  podId: "",
  weeklyAlignmentPercent: null,
  driftIncidents: 0,
  lockedTutors: 0,
  watchlistTutors: 0,
  failTutors: 0,
  phaseWeaknesses: [],
  phaseScores: [],
  tutorSummaries: [],
  tdSummary: null,
};

function getTutorInitials(name?: string | null) {
  return String(name || "TD")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getOperationalModeBadge(mode?: string | null) {
  return String(mode || "").toLowerCase() === "certified_live" ? "default" : "secondary";
}

export default function TDOverview() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTutorRun, setActiveTutorRun] = useState<ActiveTutorRunContext | null>(null);
  const [activeTutorHistory, setActiveTutorHistory] = useState<ActiveTutorHistoryContext | null>(null);
  const [identitySheetOpen, setIdentitySheetOpen] = useState(false);
  const [assignmentsDialogOpen, setAssignmentsDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [topicConditioningDialogOpen, setTopicConditioningDialogOpen] = useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentRecord, setSelectedStudentRecord] = useState<StudentActionRecord | null>(null);
  const [expandedTutors, setExpandedTutors] = useState<Record<string, boolean>>({});

  const {
    data: podsData,
    isLoading,
    error,
  } = useQuery<PodOverviewData[]>({
    queryKey: ["/api/td/pod-overview"],
    enabled: isAuthenticated && !authLoading,
  });

  const { data: tutorBattleTestPhases = [] } = useQuery<BattleTestPhaseDefinition[]>({
    queryKey: ["/api/battle-tests/banks/tutor"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/battle-tests/banks/tutor`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load tutor battle-testing banks");
      return response.json();
    },
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
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [error, toast]);

  const activePhaseOptions = useMemo<BattleTestPhaseDefinition[]>(() => tutorBattleTestPhases, [tutorBattleTestPhases]);

  const submitTutorBattleTestMutation = useMutation({
    mutationFn: async ({
      podId,
      tutorAssignmentId,
      tutorId,
      phaseKeys,
      responses,
    }: {
      podId: string;
      tutorAssignmentId: string;
      tutorId: string;
      phaseKeys: string[];
      responses: BattleTestResponseInput[];
    }) => {
      await apiRequest("POST", `/api/td/pods/${podId}/tutor-battle-tests`, {
        tutorAssignmentId,
        tutorId,
        phaseKeys,
        responses,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/td/pod-overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battle-tests/pods", variables.podId, "summary"] });
      toast({
        title: "Battle test saved",
        description: "Tutor alignment results were logged successfully.",
      });
      setActiveTutorRun(null);
    },
    onError: (mutationError: any) => {
      toast({
        title: "Battle test failed",
        description: mutationError?.message || "Unable to save the tutor battle test.",
        variant: "destructive",
      });
    },
  });

  const openStudentRecord = (student: StudentActionRecord) => {
    setSelectedStudentId(student.id);
    setSelectedStudentName(student.name);
    setSelectedStudentRecord(student);
  };

  const toggleTutorExpanded = (assignmentId: string) => {
    setExpandedTutors((current) => ({
      ...current,
      [assignmentId]: !current[assignmentId],
    }));
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40" />
          <Skeleton className="h-72" />
        </div>
      </DashboardLayout>
    );
  }

  if (!podsData || !Array.isArray(podsData) || podsData.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Pods</h1>
          <Card className="p-12 text-center">
            <FolderKanban className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">You are not assigned to any pods yet.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Pods</h1>
          <p className="text-muted-foreground">
            Run battle tests, inspect tutor student cards, and review topic conditioning, tracking systems, and communication flows.
          </p>
        </div>

        {podsData.map((podData) => {
          const { pod, tutors, totalStudents, totalSessions } = podData;
          const battleTestingSummary: PodBattleTestingSummary = podData?.battleTestingSummary
            ? {
                ...EMPTY_BATTLE_TESTING_SUMMARY,
                ...podData.battleTestingSummary,
                podId: podData.battleTestingSummary.podId || pod.id,
                tutorSummaries: Array.isArray(podData.battleTestingSummary.tutorSummaries)
                  ? podData.battleTestingSummary.tutorSummaries
                  : [],
                phaseWeaknesses: Array.isArray(podData.battleTestingSummary.phaseWeaknesses)
                  ? podData.battleTestingSummary.phaseWeaknesses
                  : [],
                phaseScores: Array.isArray(podData.battleTestingSummary.phaseScores)
                  ? podData.battleTestingSummary.phaseScores
                  : [],
              }
            : {
                ...EMPTY_BATTLE_TESTING_SUMMARY,
                podId: pod.id,
              };
          return (
            <Card key={pod.id} className="border p-6">
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{pod.podName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {pod.phase} phase - {pod.status}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[420px]">
                  <Card className="border-border/60 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Tutors
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{tutors.length}</p>
                  </Card>
                  <Card className="border-border/60 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Students
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{totalStudents}</p>
                  </Card>
                  <Card className="border-border/60 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Sessions Logged
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{totalSessions}</p>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <BattleTestingMetricCard
                      icon={<Activity className="h-5 w-5" />}
                      tintClassName="bg-blue-50 text-blue-700"
                      label="Weekly Alignment"
                      value={
                        battleTestingSummary.weeklyAlignmentPercent == null
                          ? "N/A"
                          : `${Math.round(battleTestingSummary.weeklyAlignmentPercent)}%`
                      }
                    />
                    <BattleTestingMetricCard
                      icon={<ShieldAlert className="h-5 w-5" />}
                      tintClassName="bg-rose-50 text-rose-700"
                      label="Violation Spikes"
                      value={String(battleTestingSummary.driftIncidents)}
                    />
                    <BattleTestingMetricCard
                      icon={<CheckCircle2 className="h-5 w-5" />}
                      tintClassName="bg-emerald-50 text-emerald-700"
                      label="Locked Tutors"
                      value={String(battleTestingSummary.lockedTutors)}
                    />
                    <BattleTestingMetricCard
                      icon={<AlertTriangle className="h-5 w-5" />}
                      tintClassName="bg-amber-50 text-amber-700"
                      label="At Risk"
                      value={String(
                        battleTestingSummary.watchlistTutors + battleTestingSummary.failTutors
                      )}
                    />
                  </div>

                  {tutors.length === 0 ? (
                    <Card className="border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No tutors are assigned to this pod yet.
                    </Card>
                  ) : (
                    tutors.map((tutor) => {
                      const tutorName = tutor.name || tutor.firstName || "Unknown Tutor";
                      const operationalMode =
                        (tutor.assignment as any)?.operational_mode ||
                        (tutor.assignment as any)?.operationalMode ||
                        "training";
                      const tutorAudit = battleTestingSummary.tutorSummaries.find(
                        (entry) => entry.assignmentId === tutor.assignment.id
                      );
                      const isExpanded = !!expandedTutors[tutor.assignment.id];

                      return (
                        <Card key={tutor.assignment.id} className="border border-border/60 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-11 w-11 border border-primary/20">
                                <AvatarFallback className="bg-accent text-foreground font-bold">
                                  {getTutorInitials(tutorName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground">{tutorName}</p>
                                <p className="text-sm text-muted-foreground">{tutor.email || "No email"}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge variant="outline">
                                    {(tutor.assignment as any)?.certification_status || "pending"}
                                  </Badge>
                                  <Badge variant={getOperationalModeBadge(operationalMode)}>
                                    {operationalMode === "certified_live" ? "Certified Live" : "Training Mode"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              <Badge className={getBattleTestStateBadgeClass(tutorAudit?.state)}>
                                {getBattleTestStateLabel(tutorAudit?.state)}
                              </Badge>
                              <Badge variant="outline">
                                {tutorAudit?.alignmentPercent == null
                                  ? "Audit N/A"
                                  : `Audit ${Math.round(tutorAudit.alignmentPercent)}%`}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setActiveTutorHistory({
                                    podId: pod.id,
                                    tutorName,
                                    assignmentId: tutor.assignment.id,
                                  })
                                }
                              >
                                Audit History
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setActiveTutorRun({
                                    podId: pod.id,
                                    podName: pod.podName,
                                    assignmentId: tutor.assignment.id,
                                    tutorId: tutor.id,
                                    tutorName,
                                  })
                                }
                              >
                                Run Tutor Audit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleTutorExpanded(tutor.assignment.id)}
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="mr-1.5 h-4 w-4" />
                                    Hide Students
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="mr-1.5 h-4 w-4" />
                                    View Students
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                Tutor Audit
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {tutorAudit?.phaseScores?.length ? (
                                  tutorAudit.phaseScores.map((phase) => (
                                    <Badge
                                      key={`${tutor.assignment.id}-${phase.phaseKey}`}
                                      variant="outline"
                                    >
                                      {phase.title}: {Math.round(phase.percent)}%
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    No tutor audit has been logged yet.
                                  </span>
                                )}
                              </div>
                              {tutorAudit?.actionRequired ? (
                                <p className="mt-3 text-sm text-muted-foreground">
                                  {tutorAudit.actionRequired}
                                </p>
                              ) : null}
                              {tutorAudit?.lastAuditAt ? (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Last audit: {formatAuditTimestamp(tutorAudit.lastAuditAt)}
                                </p>
                              ) : null}
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                Student Visibility
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {tutorName} is currently in {operationalMode === "certified_live" ? "certified live" : "training"} mode.
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  {tutorAudit?.studentCount ?? (tutor.assignment as any)?.student_count ?? 0} assigned students
                                </Badge>
                                {tutorAudit?.hasCriticalFail ? (
                                  <Badge className="bg-rose-100 text-rose-800 border-rose-200">
                                    Critical fail logged
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {isExpanded ? (
                            <TDTutorStudentsSection
                              tutorId={tutor.id}
                              tutorName={tutorName}
                              operationalMode={operationalMode}
                              fallbackStudentCount={(tutor.assignment as any)?.student_count || 0}
                              onViewIdentitySheet={(student) => {
                                openStudentRecord(student);
                                setIdentitySheetOpen(true);
                              }}
                              onViewAssignments={(student) => {
                                openStudentRecord(student);
                                setAssignmentsDialogOpen(true);
                              }}
                              onViewTrackingSystems={(student) => {
                                openStudentRecord(student);
                                setTrackingDialogOpen(true);
                              }}
                              onViewTopicConditioning={(student) => {
                                openStudentRecord(student);
                                setTopicConditioningDialogOpen(true);
                              }}
                              onViewCommunication={(student) => {
                                openStudentRecord(student);
                                setCommunicationDialogOpen(true);
                              }}
                            />
                          ) : null}
                        </Card>
                      );
                    })
                  )}
              </div>
            </Card>
          );
        })}
      </div>

      <BattleTestRunnerDialog
        open={!!activeTutorRun}
        onOpenChange={(open) => {
          if (!open) setActiveTutorRun(null);
        }}
        title={
          activeTutorRun
            ? `Tutor Battle Test - ${activeTutorRun.tutorName}`
            : "Tutor Battle Test"
        }
        description={
          activeTutorRun
            ? `Run the TT Tutor Alignment Engine for ${activeTutorRun.tutorName} inside ${activeTutorRun.podName}.`
            : "Run the TT Tutor Alignment Engine."
        }
        phaseOptions={activePhaseOptions}
        submitLabel="Save Tutor Battle Test"
        onSubmit={async ({ selectedPhases, responses }) => {
          if (!activeTutorRun) return;
          await submitTutorBattleTestMutation.mutateAsync({
            podId: activeTutorRun.podId,
            tutorAssignmentId: activeTutorRun.assignmentId,
            tutorId: activeTutorRun.tutorId,
            phaseKeys: selectedPhases.map((phase) => phase.key),
            responses,
          });
        }}
      />

      <BattleTestHistoryDialog
        open={!!activeTutorHistory}
        onOpenChange={(open) => {
          if (!open) setActiveTutorHistory(null);
        }}
        title={
          activeTutorHistory
            ? `Tutor Audit History - ${activeTutorHistory.tutorName}`
            : "Tutor Audit History"
        }
        description="Stored tutor battle-test runs and rep-level logging."
        historyQueryKey={
          activeTutorHistory
            ? `battle-test-runs-${activeTutorHistory.podId}`
            : "battle-test-runs"
        }
        historyEndpoint={
          activeTutorHistory
            ? `/api/battle-tests/pods/${activeTutorHistory.podId}/runs`
            : "/api/battle-tests/pods/unknown/runs"
        }
        filter={(run) =>
          !!activeTutorHistory && run.subjectType === "tutor" && run.tutorAssignmentId === activeTutorHistory.assignmentId
        }
      />

      <StudentIdentitySheet
        open={identitySheetOpen}
        onOpenChange={setIdentitySheetOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        readOnly={true}
        apiBasePath="/api/td"
      />

      <ViewAssignmentsDialog
        open={assignmentsDialogOpen}
        onOpenChange={setAssignmentsDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        apiBasePath="/api/td"
      />

      <ViewTrackingSystemsDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        apiBasePath="/api/td"
      />

      <StudentTopicConditioningDialog
        open={topicConditioningDialogOpen}
        onOpenChange={setTopicConditioningDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        studentGrade={selectedStudentRecord?.grade || null}
        parentTopics={
          (selectedStudentRecord?.parentInfo?.response_topics as string) ||
          (selectedStudentRecord?.parentInfo?.math_struggle_areas as string) ||
          (selectedStudentRecord?.struggleAreas as string) ||
          null
        }
        parentTopicSymptoms={
          selectedStudentRecord?.parentInfo?.topic_response_symptoms &&
          typeof selectedStudentRecord.parentInfo.topic_response_symptoms === "object"
            ? selectedStudentRecord.parentInfo.topic_response_symptoms
            : null
        }
        parentTopicRecommendations={
          selectedStudentRecord?.parentInfo?.topic_recommended_starting_phases &&
          typeof selectedStudentRecord.parentInfo.topic_recommended_starting_phases === "object"
            ? selectedStudentRecord.parentInfo.topic_recommended_starting_phases
            : null
        }
        topicConditioning={
          selectedStudentRecord?.topicConditioning ||
          selectedStudentRecord?.topic_conditioning ||
          null
        }
        persistedTopicStates={
          selectedStudentRecord?.conceptMastery?.topicConditioning?.topics ||
          selectedStudentRecord?.concept_mastery?.topicConditioning?.topics ||
          null
        }
        readOnly={true}
        mapOnly={true}
        apiBasePath="/api/td"
      />

      <StudentCommunicationDialog
        open={communicationDialogOpen}
        onOpenChange={setCommunicationDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        readOnly={true}
        apiBasePath="/api/td"
      />
    </DashboardLayout>
  );
}

function getBattleTestStateBadgeClass(state: BattleTestState | string | null | undefined) {
  if (state === "locked") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (state === "watchlist") return "bg-amber-100 text-amber-900 border-amber-200";
  if (state === "fail") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatAuditTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BattleTestingMetricCard({
  icon,
  tintClassName,
  label,
  value,
}: {
  icon: ReactNode;
  tintClassName: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="border p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-3 ${tintClassName}`}>{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}

interface TDTutorStudentsSectionProps {
  tutorId: string;
  tutorName: string;
  operationalMode: string;
  fallbackStudentCount: number;
  onViewIdentitySheet: (student: StudentActionRecord) => void;
  onViewAssignments: (student: StudentActionRecord) => void;
  onViewTrackingSystems: (student: StudentActionRecord) => void;
  onViewTopicConditioning: (student: StudentActionRecord) => void;
  onViewCommunication: (student: StudentActionRecord) => void;
}

function TDTutorStudentsSection({
  tutorId,
  tutorName,
  operationalMode,
  fallbackStudentCount,
  onViewIdentitySheet,
  onViewAssignments,
  onViewTrackingSystems,
  onViewTopicConditioning,
  onViewCommunication,
}: TDTutorStudentsSectionProps) {
  const { data: students, isLoading } = useQuery<StudentActionRecord[]>({
    queryKey: [`/api/td/tutors/${tutorId}/students`],
    enabled: !!tutorId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const activeStudentCount = students?.length || fallbackStudentCount || 0;

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Student Visibility</p>
          <p className="text-sm text-muted-foreground">
            {tutorName} is currently in {operationalMode === "certified_live" ? "certified live" : "training"} mode.
          </p>
        </div>
        <Badge variant="outline">{activeStudentCount} active students</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !students || students.length === 0 ? (
        <p className="rounded-lg bg-muted/30 py-3 text-center text-sm text-muted-foreground">
          No students assigned to this tutor yet.
        </p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => {
            const initials = String(student.name || "ST")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={student.id} className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarFallback className="bg-accent text-foreground font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{student.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {student.grade || "No grade"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onViewIdentitySheet(student)}
                  >
                    <FileText className="mr-1.5 h-3 w-3" />
                    Identity Sheet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onViewAssignments(student)}
                  >
                    <FileText className="mr-1.5 h-3 w-3" />
                    Assignments
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onViewTopicConditioning(student)}
                  >
                    <Settings className="mr-1.5 h-3 w-3" />
                    Topic Conditioning
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onViewTrackingSystems(student)}
                  >
                    <Calendar className="mr-1.5 h-3 w-3" />
                    Tracking Systems
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onViewCommunication(student)}
                  >
                    <Mail className="mr-1.5 h-3 w-3" />
                    Communication
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
