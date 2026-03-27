import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getQueryFn } from "@/lib/queryClient";
import { Target, AlertCircle, Info } from "lucide-react";
import TutorSessionLogForm from "./TutorSessionLogForm";
import {
  PHASES,
  getNextActionData,
  nextActionFor,
  phaseIndex,
  topicPriorityScore,
  trendFromHistory,
  getPriorityReason,
  nextMoveRecommendation,
} from "./topicConditioningEngine";
import { Progress } from "../ui/progress";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import type { PhaseLabel, StabilityLabel, TopicTrend } from "./topicConditioningEngine";

type TopicConditioningMap = {
  topic?: string | null;
  entry_phase?: string | null;
  stability?: string | null;
};

type TopicRow = {
  topic: string;
  phase: PhaseLabel;
  stability: StabilityLabel;
  lastSession: string;
  trend: TopicTrend;
  entryDiagnosis: string;
  recentLogs: string[];
  timeline: Array<{ date: string; phase: PhaseLabel; stability: StabilityLabel }>;
};

type TutorSessionRecord = {
  id: string;
  studentId?: string;
  date: string;
  notes?: string | null;
  methodNotes?: string | null;
  studentResponse?: string | null;
};

type ObservationOption = { label: string; score: number };
type ObservationCategory = { key: string; label: string; options: ObservationOption[] };

type StabilityThresholds = {
  low: { remainMax: number; mediumMax: number; highMin: number };
  medium: { regressMax: number; remainMax: number; highMin: number };
  high: { regressMax: number; remainMax: number; advanceReadyMin: number };
};

const PHASE_OBSERVATION_CONFIG: Record<
  PhaseLabel,
  {
    categories: ObservationCategory[];
    interventions: string[];
    thresholds: StabilityThresholds;
    highGate: (selections: Record<string, string>) => boolean;
  }
> = {
  Clarity: {
    categories: [
      {
        key: "vocabulary_precision",
        label: "A. Vocabulary Precision",
        options: [
          { label: "Correctly named key terms without help", score: 30 },
          { label: "Named some terms but needed prompting", score: 20 },
          { label: "Used vague language often", score: 10 },
          { label: "Could not identify key terms", score: 0 },
        ],
      },
      {
        key: "method_recognition",
        label: "B. Method Recognition",
        options: [
          { label: "Identified full method correctly", score: 30 },
          { label: "Identified method partially", score: 18 },
          { label: "Confused the method sequence", score: 8 },
          { label: "Could not identify what to do", score: 0 },
        ],
      },
      {
        key: "reason_clarity",
        label: "C. Reason Clarity",
        options: [
          { label: "Explained why the method works clearly", score: 20 },
          { label: "Gave partial reason", score: 12 },
          { label: "Knew steps but not why", score: 6 },
          { label: "Could not explain why at all", score: 0 },
        ],
      },
      {
        key: "immediate_apply_response",
        label: "D. Immediate Apply Response",
        options: [
          { label: "Repeated modeled process independently", score: 20 },
          { label: "Repeated with minor prompting", score: 14 },
          { label: "Repeated with heavy prompting", score: 6 },
          { label: "Could not repeat after modeling", score: 0 },
        ],
      },
    ],
    interventions: [
      "Re-modeled vocabulary",
      "Re-modeled method",
      "Re-modeled reason",
      "Increased apply repetition",
    ],
    thresholds: {
      low: { remainMax: 49, mediumMax: 69, highMin: 70 },
      medium: { regressMax: 44, remainMax: 74, highMin: 75 },
      high: { regressMax: 49, remainMax: 79, advanceReadyMin: 80 },
    },
    highGate: (selections) => !Object.values(selections).some((value) => {
      if (!value) return true;
      return value.toLowerCase().includes("could not") || value.toLowerCase().includes("0");
    }),
  },
  "Structured Execution": {
    categories: [
      {
        key: "start_behavior",
        label: "A. Start Behavior",
        options: [
          { label: "Started immediately", score: 25 },
          { label: "Delayed briefly but started alone", score: 18 },
          { label: "Needed prompting to start", score: 8 },
          { label: "Avoided / waited for help", score: 0 },
        ],
      },
      {
        key: "step_execution",
        label: "B. Step Execution",
        options: [
          { label: "Followed all steps in correct order", score: 30 },
          { label: "Minor step skips", score: 20 },
          { label: "Frequent step skips", score: 8 },
          { label: "Guessed instead of following steps", score: 0 },
        ],
      },
      {
        key: "repeatability",
        label: "C. Repeatability Across Problems",
        options: [
          { label: "Consistent across all problems", score: 25 },
          { label: "Mostly consistent", score: 18 },
          { label: "Inconsistent from problem to problem", score: 8 },
          { label: "Could not sustain method", score: 0 },
        ],
      },
      {
        key: "independence_level",
        label: "D. Independence Level",
        options: [
          { label: "Executed without support", score: 20 },
          { label: "Needed light reminders", score: 14 },
          { label: "Needed repeated guidance", score: 6 },
          { label: "Could not continue without being carried", score: 0 },
        ],
      },
    ],
    interventions: [
      "Model -> Apply -> Guide loop",
      "Corrected skipped step",
      "Forced independent start",
      "Re-modeled method",
    ],
    thresholds: {
      low: { remainMax: 49, mediumMax: 69, highMin: 70 },
      medium: { regressMax: 44, remainMax: 74, highMin: 75 },
      high: { regressMax: 49, remainMax: 79, advanceReadyMin: 80 },
    },
    highGate: (selections) => {
      const step = selections.step_execution || "";
      const start = selections.start_behavior || "";
      return !step.toLowerCase().includes("guessed") && !start.toLowerCase().includes("avoided");
    },
  },
  "Controlled Discomfort": {
    categories: [
      {
        key: "initial_boss_response",
        label: "A. Initial Response to Boss Battle",
        options: [
          { label: "Calmly attempted", score: 30 },
          { label: "Hesitated but attempted", score: 20 },
          { label: "Froze before starting", score: 8 },
          { label: "Asked for help immediately", score: 6 },
          { label: "Rushed into random attempt", score: 5 },
        ],
      },
      {
        key: "first_step_control",
        label: "B. First-Step Control",
        options: [
          { label: "Identified first step independently", score: 25 },
          { label: "Identified first step after pause", score: 18 },
          { label: "Needed prompting to identify first step", score: 8 },
          { label: "Could not identify first step", score: 0 },
        ],
      },
      {
        key: "discomfort_tolerance",
        label: "C. Discomfort Tolerance",
        options: [
          { label: "Stayed inside difficulty without collapse", score: 25 },
          { label: "Showed tension but continued", score: 18 },
          { label: "Broke structure under difficulty", score: 8 },
          { label: "Avoided the problem", score: 0 },
        ],
      },
      {
        key: "rescue_dependence",
        label: "D. Rescue Dependence",
        options: [
          { label: "Did not seek rescue", score: 20 },
          { label: "Sought reassurance only", score: 14 },
          { label: "Asked for help early", score: 6 },
          { label: "Needed tutor to carry response", score: 0 },
        ],
      },
    ],
    interventions: [
      "Introduced Boss Battle",
      "Held 10-15 second pause",
      "Guided first step only",
      "Debriefed response pattern",
    ],
    thresholds: {
      low: { remainMax: 49, mediumMax: 69, highMin: 70 },
      medium: { regressMax: 44, remainMax: 74, highMin: 75 },
      high: { regressMax: 49, remainMax: 79, advanceReadyMin: 80 },
    },
    highGate: (selections) => {
      const initial = selections.initial_boss_response || "";
      const firstStep = selections.first_step_control || "";
      return !initial.toLowerCase().includes("froze") && !initial.toLowerCase().includes("avoid") && !firstStep.toLowerCase().includes("could not");
    },
  },
  "Time Pressure Stability": {
    categories: [
      {
        key: "start_under_time",
        label: "A. Start Under Time",
        options: [
          { label: "Started calmly", score: 20 },
          { label: "Slight delay but started", score: 14 },
          { label: "Started with visible panic", score: 6 },
          { label: "Froze under timer", score: 0 },
        ],
      },
      {
        key: "structure_under_time",
        label: "B. Structure Under Time",
        options: [
          { label: "Maintained full method", score: 35 },
          { label: "Minor loss of structure", score: 24 },
          { label: "Frequent loss of steps", score: 10 },
          { label: "Abandoned process", score: 0 },
        ],
      },
      {
        key: "pace_control",
        label: "C. Pace Control",
        options: [
          { label: "Controlled pace", score: 20 },
          { label: "Slight rush", score: 14 },
          { label: "Significant rushing", score: 6 },
          { label: "Panic-driven speed / shutdown", score: 0 },
        ],
      },
      {
        key: "completion_integrity",
        label: "D. Completion Integrity",
        options: [
          { label: "Completed with structure", score: 25 },
          { label: "Completed with instability", score: 16 },
          { label: "Partial completion due to breakdown", score: 8 },
          { label: "Could not complete due to collapse", score: 0 },
        ],
      },
    ],
    interventions: [
      "Ran timed attempt",
      "Debriefed process under pressure",
      "Re-anchored structure",
      "Reduced time intensity appropriately",
    ],
    thresholds: {
      low: { remainMax: 49, mediumMax: 69, highMin: 70 },
      medium: { regressMax: 44, remainMax: 74, highMin: 75 },
      high: { regressMax: 49, remainMax: 79, advanceReadyMin: 80 },
    },
    highGate: (selections) => {
      const structure = selections.structure_under_time || "";
      const pace = selections.pace_control || "";
      return structure.toLowerCase().includes("maintained") && pace.toLowerCase().includes("controlled");
    },
  },
};

interface StudentTopicConditioningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  parentTopics?: string | null;
  topicConditioning?: TopicConditioningMap | null;
  persistedTopicStates?: Record<
    string,
    {
      topic?: string | null;
      phase?: string | null;
      stability?: string | null;
      lastUpdated?: string | null;
      observationNotes?: string | null;
      history?: Array<{
        date?: string | null;
        phase?: string | null;
        stability?: string | null;
        nextAction?: string | null;
        observationNotes?: string | null;
      }>;
    }
  > | null;
}

function splitTopics(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;|]+/)
    .map((s) => s.replace(/^[-*\s]+/, "").trim())
    .filter(Boolean);
}

export function normalizePhase(value?: string | null): PhaseLabel {
  const v = String(value || "").toLowerCase();
  if (v.includes("clarity")) return "Clarity";
  if (v.includes("structured")) return "Structured Execution";
  if (v.includes("discomfort")) return "Controlled Discomfort";
  if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
  return "Structured Execution";
}

export function normalizeStability(value?: string | null): StabilityLabel {
  const v = String(value || "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("medium")) return "Medium";
  return "Low";
}

export function sanitizeTopic(value?: string | null): string | null {
  const cleaned = String(value || "").trim();
  if (!cleaned) return null;
  if (cleaned.toLowerCase() === "onboarding baseline diagnostic") return null;
  return cleaned;
}

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function stabilityToScore(stability: StabilityLabel): number {
  if (stability === "High") return 3;
  if (stability === "Medium") return 2;
  return 1;
}

function scoreToStability(score: number): StabilityLabel {
  if (score >= 3) return "High";
  if (score === 2) return "Medium";
  return "Low";
}

function deriveTransitionStatus(phase: PhaseLabel, stability: StabilityLabel, trend?: TopicTrend) {
  const advanceTo = getNextActionData(phase, stability).advanceTo;
  if (trend === "Regressing") return "Regressed" as const;
  if (phase === "Time Pressure Stability" && stability === "High") return "Transfer Ready" as const;
  if (stability === "High" && advanceTo) return "Ready to Advance" as const;
  if (stability === "High") return "Maintain" as const;
  if (stability === "Medium") return "Building" as const;
  return "Reinforce" as const;
}

function interpretTopicState(phase: PhaseLabel, stability: StabilityLabel, trend?: TopicTrend) {
  const nextAction = nextActionFor(phase, stability);
  const rules = getNextActionData(phase, stability).rules;

  const tutorMeaningByPhase: Record<PhaseLabel, string> = {
    Clarity: "Student still needs foundational clarity before independent execution.",
    "Structured Execution": "Student can begin but still needs consistency without tutor carry.",
    "Controlled Discomfort": "Student executes, but destabilizes when challenge spikes.",
    "Time Pressure Stability": "Student can solve, but urgency still tests structure retention.",
  };

  // Use 'Their child...' phrasing for parent UI (Map view)
  const parentMeaningByPhase: Record<PhaseLabel, string> = {
    Clarity: "Their child is building core understanding before speed or pressure work.",
    "Structured Execution": "Their child is becoming more consistent and independent with method.",
    "Controlled Discomfort": "Their child is learning to stay composed when work becomes difficult.",
    "Time Pressure Stability": "Their child is strengthening performance under time pressure.",
  };

  const transitionStatus = deriveTransitionStatus(phase, stability, trend);

  return {
    nextAction,
    rules,
    transitionStatus,
    tutorMeaning: tutorMeaningByPhase[phase],
    parentMeaning: parentMeaningByPhase[phase],
    direction: `${nextAction}`,
  };
}

function actionGuidanceFor(phase: PhaseLabel, stability: StabilityLabel): { doItems: string[]; avoidItems: string[] } {
  const data = getNextActionData(phase, stability);
  return { doItems: data.nextActions, avoidItems: data.rules };
}

function stabilityPercent(stability: StabilityLabel): number {
  if (stability === "High") return 90;
  if (stability === "Medium") return 64;
  return 32;
}

function stabilityTone(stability: StabilityLabel): string {
  if (stability === "High") return "bg-green-50 text-green-700 border-green-200";
  if (stability === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-600 border-red-200";
}

export function parseObservation(session: TutorSessionRecord): {
  topic: string;
  phase: PhaseLabel;
  stability: StabilityLabel;
  date: string;
  rawNote: string;
} | null {
  const noteText = String(session.notes || "");
  const methodText = String(session.methodNotes || "");
  const responseText = String(session.studentResponse || "");

  const topicFromNotes = noteText.match(/Active Topic:\s*([^\n\r]+)/i)?.[1]?.trim();
  const topicFromMethod = methodText.match(/Active Topic:\s*(.+)$/i)?.[1]?.trim();

  const phaseFromNotes = noteText.match(/Phase Observed in Session:\s*([^\n\r]+)/i)?.[1]?.trim();
  const phaseFromResponse = responseText.match(/Phase:\s*([^|\n\r]+)/i)?.[1]?.trim();

  const stabilityFromNotes = noteText.match(/Stability Observed in Session:\s*([^\n\r]+)/i)?.[1]?.trim();
  const stabilityFromResponse = responseText.match(/Stability:\s*([^|\n\r]+)/i)?.[1]?.trim();

  const topic = sanitizeTopic(topicFromNotes || topicFromMethod);
  const phase = normalizePhase(phaseFromNotes || phaseFromResponse || "Structured Execution");
  const stability = normalizeStability(stabilityFromNotes || stabilityFromResponse || "Low");

  if (!topic) return null;

  return {
    topic,
    phase,
    stability,
    date: session.date,
    rawNote: noteText,
  };
}

export function formatLastUpdatedLabel(dateText?: string): string {
  if (!dateText) return "Not updated";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "Not updated";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildTopics(
  parentTopics: string | null | undefined,
  map: TopicConditioningMap | null | undefined,
  persistedTopicStates: StudentTopicConditioningDialogProps["persistedTopicStates"],
  sessions: TutorSessionRecord[] | undefined,
): TopicRow[] {
  const byTopic = new Map<
    string,
    {
      history: Array<{ date: string; phase: PhaseLabel; stability: StabilityLabel; note: string }>;
      seeded?: { phase: PhaseLabel; stability: StabilityLabel };
    }
  >();


  const persistedEntries = persistedTopicStates && typeof persistedTopicStates === "object"
    ? Object.values(persistedTopicStates)
    : [];

  persistedEntries.forEach((entry: any) => {
    const persistedTopic = sanitizeTopic(entry?.topic || "");
    if (!persistedTopic) return;

    const existing = byTopic.get(persistedTopic) || { history: [] as any[] };
    const mergedHistory = [...(existing.history || [])];

    const persistedHistory = Array.isArray(entry?.history) ? entry.history : [];
    persistedHistory.forEach((h: any) => {
      if (!h?.date) return;
      mergedHistory.push({
        date: String(h.date),
        phase: normalizePhase(h.phase),
        stability: normalizeStability(h.stability),
        note: h?.observationNotes ? `Observation Notes: ${String(h.observationNotes)}` : "",
      });
    });

    byTopic.set(persistedTopic, {
      history: mergedHistory,
      seeded: {
        phase: normalizePhase(entry?.phase || map?.entry_phase),
        stability: normalizeStability(entry?.stability || map?.stability),
      },
    });
  });

  const observations = (sessions || [])
    .map(parseObservation)
    .filter((item): item is NonNullable<ReturnType<typeof parseObservation>> => !!item)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const hasPersistedHistory = persistedEntries.some(
    (entry: any) => Array.isArray(entry?.history) && entry.history.length > 0,
  );

  observations.forEach((obs) => {
    // Prefer persisted topic history; only parse raw notes as fallback for unseen topics
    if (hasPersistedHistory && byTopic.has(obs.topic)) return;

    if (!byTopic.has(obs.topic)) {
      byTopic.set(obs.topic, { history: [] });
    }
    byTopic.get(obs.topic)?.history.push({
      date: obs.date,
      phase: obs.phase,
      stability: obs.stability,
      note: obs.rawNote,
    });
  });

  const rows: TopicRow[] = [];

  byTopic.forEach((entry, topic) => {
    const history = entry.history;
    const latest = history[history.length - 1];
    const phase = latest?.phase || entry.seeded?.phase || "Structured Execution";
    const stability = latest?.stability || entry.seeded?.stability || "Low";
    const lastSessionDate = latest?.date;

    const stabilityLabels = [
      "Last session",
      "2nd last session",
      "3rd last session"
    ];
    const recentLogs = history
      .slice(-3)
      .reverse()
      .map((h, index) => {
        const label = stabilityLabels[index] || `Session ${index + 1}`;
        return `${label}: ${h.stability} stability`;
      });

    rows.push({
      topic,
      phase,
      stability,
      lastSession: formatLastUpdatedLabel(lastSessionDate),
      trend: trendFromHistory(history.map((h) => h.stability)),
      entryDiagnosis:
        history.length > 0
          ? `Entered based on observed response pattern in logged sessions for ${topic.toLowerCase()}.`
          : `Seeded from enrollment/proposal focus for ${topic.toLowerCase()}.`,
      recentLogs,
      timeline: history.map((h) => ({
        date: new Date(h.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
        phase: h.phase,
        stability: h.stability,
      })),
    });
  });

  return rows.sort((a, b) => a.topic.localeCompare(b.topic));
}
export { trendFromHistory };
const phaseDefinition: Record<PhaseLabel, string> = {
  Clarity:
    [
      "Description: The student learns to see the topic clearly. This means: naming the correct terms (Vocabulary), recognizing the problem type, knowing the steps (Method), knowing why the steps work (Reason).",
      "Tool: Teach 3-Layer Lens.",
      "Question: Can the student clearly see what they are dealing with in this topic? If no, this topic starts at Clarity."
    ].join("\n\n"),
  "Structured Execution":
    [
      "Description: The student must now execute inside the topic. This means: starting without delay, following steps in order, reducing guessing, repeating the method reliably.",
      "Tool: Use Model → Apply → Guide, 3-Layer Lens correction.",
      "Question: Can the student act reliably in this topic without being carried? If no, this topic sits in Structured Execution."
    ].join("\n\n"),
  "Controlled Discomfort":
    [
      "Description: Now difficulty is introduced inside the topic. This means: harder questions, unfamiliar forms, no rescue, first-step guidance only.",
      "Tool: Boss Battles.",
      "Question: Can the student stay stable in this topic when certainty disappears? If no, this topic sits in Controlled Discomfort."
    ].join("\n\n"),
  "Time Pressure Stability":
    [
      "Description: Now the same topic is tested under time. This means: timed attempts, process under pressure, structure maintained under urgency.",
      "Tool: Timed Execution.",
      "Question: Can the student stay structured in this topic when time pressure appears? If no, this topic stays in Time Pressure Stability."
    ].join("\n\n"),
};

export default function StudentTopicConditioningDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  parentTopics,
  topicConditioning,
  persistedTopicStates,
}: StudentTopicConditioningDialogProps) {
  // Fetch topic activations for this student (must be inside component to access studentId)
  const { data: activationsData, refetch: refetchActivations } = useQuery({
    queryKey: ["/api/tutor/students", studentId, "topic-conditioning-activations"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/tutor/students/${studentId}/topic-conditioning-activations`
      );
      return res.json();
    },
    enabled: !!studentId,
  });
  const queryClient = useQueryClient();
  // Mutation to add topic
  const addTopicMutation = useMutation({
    mutationFn: async ({ topic, reason }: { topic: string; reason: string }) => {

      const res = await apiRequest(
        "POST",
        `/api/tutor/students/${studentId}/topic-conditioning`,
        { topic, reason }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "workflow-state"] });
    },
  });
  // Activation reasons for dropdown
  const ACTIVATION_REASONS = [
    "Observed breakdown in class",
    "Parent reported struggle",
    "Exam/test focus",
    "School topic requirement",
    "Other (enter note)"
  ];

  // State for Activate Topic dialog
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [activationReason, setActivationReason] = useState("");
  const [activationNote, setActivationNote] = useState("");
  const [activateError, setActivateError] = useState("");

  // Add topic handler
  const handleActivateTopic = async () => {
    if (!newTopic.trim()) {
      setActivateError("Topic is required");
      return;
    }
    if (!activationReason) {
      setActivateError("Reason is required");
      return;
    }
    const activationReasonFinal = activationReason === "Other (enter note)" ? activationNote.trim() : activationReason;
    if (activationReason === "Other (enter note)" && !activationNote.trim()) {
      setActivateError("Please enter a note for 'Other'");
      return;
    }
    try {
      await addTopicMutation.mutateAsync({ topic: newTopic.trim(), reason: activationReasonFinal });
      await refetchActivations();
      setActivateDialogOpen(false);
      setNewTopic("");
      setActivationReason("");
      setActivationNote("");
      setActivateError("");
    } catch (err: any) {
      if (err instanceof Error) {
        setActivateError(err.message);
      } else if (typeof err === "string") {
        setActivateError(err);
      } else {
        setActivateError("Failed to activate topic (unknown error)");
      }
      alert("Topic activation failed: " + (err?.message || JSON.stringify(err)));
    }
  };
  const { data: sessions } = useQuery<TutorSessionRecord[]>({
    queryKey: ["/api/tutor/sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: open && !!studentId,
  });

  const studentSessions = useMemo(
    () => (sessions || []).filter((session) => session.studentId === studentId),
    [sessions, studentId],
  );

  // Merge activations into the topic list
  const activationTopics = useMemo(() => {
    if (!activationsData?.activations) return [];
    // Only include unique topic names
    const seen = new Set<string>();
    return activationsData.activations.filter((a: any) => {
      if (!a.topic) return false;
      const t = String(a.topic).trim();
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    }).map((a: any) => ({ topic: a.topic, activatedAt: a.created_at }));
  }, [activationsData]);

  const topics = useMemo(
    () => {
      // Build the normal topics
      const baseTopics = buildTopics(parentTopics, topicConditioning, persistedTopicStates, studentSessions);
      // Add any activation topics not already present
      const baseTopicNames = new Set(baseTopics.map(t => t.topic));
      const merged = [...baseTopics];
      activationTopics.forEach(({ topic, activatedAt }) => {
        if (!baseTopicNames.has(topic)) {
          merged.push({
            topic,
            phase: "Clarity",
            stability: "Low",
            lastSession: activatedAt ? formatLastUpdatedLabel(activatedAt) : "Activated",
            trend: "Stable",
            entryDiagnosis: "Activated by tutor.",
            recentLogs: [],
            timeline: [],
          });
        }
      });
      return merged;
    },
    [parentTopics, topicConditioning, persistedTopicStates, studentSessions, activationTopics],
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0]?.topic || "");

  const [activeTopicField, setActiveTopicField] = useState("");
  const [manualTopicField, setManualTopicField] = useState("");
  const [phaseObservedField, setPhaseObservedField] = useState("");
  const [stabilityObservedField, setStabilityObservedField] = useState("");
  // Persist in-progress selections per topic/phase for better UX
  const [phaseSelectionsMap, setPhaseSelectionsMap] = useState<Record<string, Record<string, string>>>({});
  const [phaseSelections, setPhaseSelections] = useState<Record<string, string>>({});
  const [interventionUsed, setInterventionUsed] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (topics.length === 0) return;
    if (!selectedTopic || !topics.some((t) => t.topic === selectedTopic)) {
      setSelectedTopic(topics[0].topic);
    }
  }, [topics, selectedTopic]);

  useEffect(() => {
    if (!open) return;
    const firstTopic = topics[0]?.topic || sanitizeTopic(splitTopics(parentTopics)[0]) || "";
    setActiveTab("dashboard");
    setActiveTopicField(firstTopic);
    setManualTopicField("");
    setPhaseSelections({});
    setInterventionUsed("");
    // Set phase and stability fields to match first topic
    setPhaseObservedField(topics[0]?.phase || normalizePhase(topicConditioning?.entry_phase));
    setStabilityObservedField(topics[0]?.stability || normalizeStability(topicConditioning?.stability));
  }, [open, topics, parentTopics, topicConditioning]);

  // When selectedTopic changes (Map tab), sync phase and stability fields
  useEffect(() => {
    const found = topics.find((t) => t.topic === selectedTopic);
    if (found) {
      setPhaseObservedField(found.phase);
      setStabilityObservedField(found.stability);
    }
  }, [selectedTopic, topics]);

  // When activeTopicField changes (Topic Management tab), sync phase and stability fields
  useEffect(() => {
    if (!activeTopicField) return;
    const found = topics.find((t) => t.topic === activeTopicField);
    if (found) {
      setPhaseObservedField(found.phase);
      setStabilityObservedField(found.stability);
      // Reset phaseSelections to last in-progress for this topic/phase, or empty
      const phaseKey = `${found.topic}::${found.phase}`;
      setPhaseSelections(phaseSelectionsMap[phaseKey] || {});
    }
  }, [activeTopicField, topics]);

  // Always use activeTopicField as the source of truth for Topic Management tab
  // When switching to session-form tab, ensure activeTopicField is set and in sync
  useEffect(() => {
    if (activeTab === "session-form") {
      // If no topic is selected, default to first topic
      if (!activeTopicField && topics.length > 0) {
        setActiveTopicField(topics[0].topic);
      }
    }
  }, [activeTab, activeTopicField, topics]);

  const topicChoices = useMemo(() => {
    const fromCards = topics.map((t) => t.topic);
    const fromParent = splitTopics(parentTopics).map((t) => sanitizeTopic(t)).filter((t): t is string => !!t);
    return Array.from(new Set([...fromCards, ...fromParent]));
  }, [topics, parentTopics]);

  const prioritizedTopics = useMemo(
    () => [...topics].sort((a, b) => topicPriorityScore(b) - topicPriorityScore(a) || a.topic.localeCompare(b.topic)),
    [topics],
  );

  const attentionQueue = useMemo(() => {
    const needsAttention = prioritizedTopics.filter(
      (row) => row.stability !== "High" || row.trend === "Regressing",
    );
    return (needsAttention.length > 0 ? needsAttention : prioritizedTopics).slice(0, 3);
  }, [prioritizedTopics]);

  const needsStabilizationCount = prioritizedTopics.filter((row) => row.stability === "Low").length;
  const readyToAdvanceCount = prioritizedTopics.filter(
    (row) => !!getNextActionData(row.phase, row.stability).advanceTo,
  ).length;

  const selectedRow = topics.find((row) => row.topic === selectedTopic) || prioritizedTopics[0];
  const phaseIx = selectedRow ? phaseIndex(selectedRow.phase) : 0;
  const guidance = selectedRow
    ? actionGuidanceFor(selectedRow.phase, selectedRow.stability) : { doItems: [], avoidItems: [] };
  const effectiveTopicForLog = topics.length > 0
    ? activeTopicField || selectedRow?.topic || ""
    : sanitizeTopic(manualTopicField) || "";

  const selectedInterpretation = selectedRow
    ? interpretTopicState(selectedRow.phase, selectedRow.stability)
    : null;

  // Always use selectedRow for observedPhase and previousStability, fallback to safe defaults
  const observedPhase = (selectedRow && selectedRow.phase ? selectedRow.phase : "Clarity") as PhaseLabel;
  const previousStability = (selectedRow && selectedRow.stability ? selectedRow.stability : "Low") as StabilityLabel;
  const phaseConfig = PHASE_OBSERVATION_CONFIG[observedPhase] || PHASE_OBSERVATION_CONFIG["Clarity"];

  const sessionScore = clamp(
    0,
    phaseConfig.categories.reduce((sum, category) => {
      const selectedLabel = phaseSelections[category.key];
      const selectedOption = category.options.find((option) => option.label === selectedLabel);
      return sum + (selectedOption?.score ?? 0);
    }, 0),
    100
  );

  const highGatePasses = phaseConfig.highGate(phaseSelections);

  let projectedStability: StabilityLabel = previousStability;
  let advanceReady = false;

  if (previousStability === "Low") {
    if (sessionScore <= phaseConfig.thresholds.low.remainMax) projectedStability = "Low";
    else if (sessionScore <= phaseConfig.thresholds.low.mediumMax) projectedStability = "Medium";
    else projectedStability = highGatePasses ? "High" : "Medium";
  }

  if (previousStability === "Medium") {
    if (sessionScore <= phaseConfig.thresholds.medium.regressMax) projectedStability = "Low";
    else if (sessionScore <= phaseConfig.thresholds.medium.remainMax) projectedStability = "Medium";
    else projectedStability = "High";
  }

  if (previousStability === "High") {
    if (sessionScore <= phaseConfig.thresholds.high.regressMax) projectedStability = "Medium";
    else if (sessionScore <= phaseConfig.thresholds.high.remainMax) projectedStability = "High";
    else {
      projectedStability = "High";
      advanceReady = true;
    }
  }

  const nextPhase = getNextActionData(observedPhase, projectedStability).advanceTo;
  const projectedPhase: PhaseLabel =
    advanceReady && !!nextPhase
      ? (nextPhase as PhaseLabel)
      : observedPhase;

  let phaseDecision: "remain" | "advance" | "regress" | "improve" = "remain";
  if (projectedPhase !== observedPhase) {
    phaseDecision = "advance";
  } else if (observedPhase === "Clarity") {
    // For Clarity, never show regress, show improve/remain only
    if (stabilityToScore(projectedStability) > stabilityToScore(previousStability)) {
      phaseDecision = "improve";
    } else if (stabilityToScore(projectedStability) < stabilityToScore(previousStability)) {
      phaseDecision = "remain"; // Never regress in Clarity
    } else {
      phaseDecision = "remain";
    }
  } else {
    if (stabilityToScore(projectedStability) < stabilityToScore(previousStability)) {
      phaseDecision = "regress";
    } else if (stabilityToScore(projectedStability) > stabilityToScore(previousStability)) {
      phaseDecision = "improve";
    } else {
      phaseDecision = "remain";
    }
  }

  const projectedInterpretation = interpretTopicState(projectedPhase, projectedStability);
  const livePreviewConstraint = projectedInterpretation.rules[0] || "Follow phase rules and preserve structure.";

  // Block submission if any observation category is missing or mismatched for the current phase
  const foundTopic = topics.find(t => t.topic === activeTopicField);
  const phaseForValidation = foundTopic?.phase && PHASE_OBSERVATION_CONFIG[foundTopic.phase as PhaseLabel] ? foundTopic.phase as PhaseLabel : "Clarity";
  const configForValidation = PHASE_OBSERVATION_CONFIG[phaseForValidation];
  const canSubmitStructuredRecord =
    !!effectiveTopicForLog &&
    configForValidation.categories.every((category) => !!phaseSelections[category.key] && configForValidation.categories.some(c => c.key === category.key)) &&
    !!interventionUsed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-0.5rem)] sm:w-full sm:max-w-7xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-primary/15 bg-background p-2 shadow-sm sm:p-6">
        <DialogHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-x-hidden">
          <TabsList className="flex w-full flex-row sm:grid sm:grid-cols-2 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1 gap-1">
            <TabsTrigger value="dashboard" className="flex-1 h-auto whitespace-normal text-xs sm:text-sm py-2 px-2">Map</TabsTrigger>
            <TabsTrigger value="session-form" className="flex-1 h-auto whitespace-normal text-xs sm:text-sm py-2 px-2">Topic Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 overflow-x-hidden">
            <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-3">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold">Active Conditioning Map</h3>
                <Badge variant="outline" className="w-full sm:w-fit max-w-full break-all">Student ID: {studentId || "-"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Select a topic to drive the Stability Tracker and Phase Progression panels below.
              </p>

              {topics.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No topic observations logged yet. Use Session Log Form to add Active Topic, Phase Observed, and Stability Observed.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {prioritizedTopics.map((row) => {
                    const topicIntel = interpretTopicState(row.phase, row.stability, row.trend);
                    return (
                      <button
                        key={`topic-card-${row.topic}`}
                        type="button"
                        className={`w-full rounded-xl border p-4 text-left transition-colors space-y-3 ${
                          selectedRow?.topic === row.topic
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() => setSelectedTopic(row.topic)}
                      >
                        <p className="text-base font-semibold break-words">{row.topic}</p>

                        <p className="text-sm font-semibold text-foreground">
                          {row.phase} · {row.stability} Stability
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {PHASES.map((phase) => {
                            const stepIndex = phaseIndex(phase);
                            const currentIndex = phaseIndex(row.phase);
                            const done = stepIndex < currentIndex;
                            const active = stepIndex === currentIndex;
                            const label = done ? `✓ ${phase}` : active ? `ACTIVE ${phase}` : `Locked ${phase}`;
                            return (
                              <span
                                key={`${row.topic}-${phase}`}
                                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] ${
                                  done
                                    ? "border-muted text-foreground/60 bg-muted/40"
                                    : active
                                    ? "border-primary/30 bg-primary/10 text-foreground"
                                    : "border-muted text-muted-foreground bg-muted/20"
                                }`}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">State Progression Timeline</p>
                          {(row.timeline || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {row.timeline.slice(-6).map((point) => (
                                <span
                                  key={`${row.topic}-${point.date}-${point.phase}`}
                                  className="rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground"
                                >
                                  {point.date} · {point.phase} · {point.stability}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No timeline events yet.</p>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Tutor Meaning:</span> {topicIntel.tutorMeaning}
                        </p>

                        <p className="text-sm text-foreground font-medium">
                          Next Move: {topicIntel.nextAction}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Constraint: {topicIntel.rules[0] || "Follow phase constraints"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-primary/20 bg-muted/20 text-foreground">
                            {topicIntel.transitionStatus}
                          </Badge>
                          <Badge className={stabilityTone(row.stability)}>
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                                row.stability === "High"
                                  ? "bg-green-500"
                                  : row.stability === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-red-400"
                              }`}
                            />
                            {row.stability}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Removed Topics Tracked, Needs Stabilization, Ready To Advance cards as requested */}

            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
                <h3 className="font-semibold">Stability Tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Stability: {selectedRow?.stability || "Low"}
                </p>
                <Progress value={stabilityPercent(selectedRow?.stability || "Low")} />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Recent Logs (Last 3 Sessions)</p>
                  {(selectedRow?.recentLogs || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No observations recorded yet for this topic.</p>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {(selectedRow?.recentLogs || []).map((log) => (
                        <li key={log}>{log}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-md border p-3 bg-primary/5 border-primary/20">
                    <p className="text-xs uppercase font-semibold text-primary mb-2">Do</p>
                    <ul className="text-sm text-foreground space-y-1">
                      {guidance.doItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-md border p-3 bg-muted/50 border-muted">
                    <p className="text-xs uppercase font-semibold text-foreground/60 mb-2">Do Not</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {guidance.avoidItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
                <h3 className="font-semibold">Phase Progression</h3>
                <p className="text-sm text-muted-foreground">Clarity to Structured Execution to Controlled Discomfort to Time Pressure Stability</p>
                <div className="flex flex-wrap gap-2">
                  {PHASES.map((phase, idx) => {
                    const state = idx < phaseIx ? "completed" : idx === phaseIx ? "current" : "locked";
                    return (
                      <Badge
                        key={phase}
                        variant="outline"
                        className={
                          state === "completed"
                            ? "bg-muted/60 border-muted text-foreground/50 text-[11px] sm:text-xs whitespace-normal"
                            : state === "current"
                            ? "bg-primary/10 border-primary/30 text-foreground font-medium text-[11px] sm:text-xs whitespace-normal"
                            : "bg-muted/30 border-muted text-muted-foreground text-[11px] sm:text-xs whitespace-normal"
                        }
                      >
                        {phase}
                      </Badge>
                    );
                  })}
                </div>

                <div className="rounded-md border bg-muted/40 p-3 space-y-2">
                  <p className="text-sm font-medium">Recommended movement</p>
                  <p className="text-sm text-muted-foreground">
                    System recommendation: {selectedRow ? nextMoveRecommendation(selectedRow.phase, selectedRow.stability) : "Hold current phase"}
                  </p>
                  <p className="text-xs text-muted-foreground">Tutor approval is required before movement between phases.</p>
                </div>

                <div className="rounded-md border p-3 space-y-3">
                  <p className="text-sm font-medium">NEXT ACTION</p>
                  {selectedRow ? (
                    <>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {getNextActionData(selectedRow.phase, selectedRow.stability).nextActions.map((a) => (
                          <li key={a} className="flex items-start gap-1.5">
                            <span className="mt-0.5 shrink-0 text-foreground/40">›</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rules</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {getNextActionData(selectedRow.phase, selectedRow.stability).rules.map((r) => (
                            <li key={r} className="flex items-start gap-1.5">
                              <span className="shrink-0 text-foreground/40">—</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a topic to see engine output.</p>
                  )}
                </div>
              </Card>
            </div>

            <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Phase Definitions</h3>
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {PHASES.map((phase) => {
                  // Split the definition into Description, Tool, Question
                  const [desc, tool, question] = phaseDefinition[phase].split(/\n\n/);
                  const phaseNumber = PHASES.indexOf(phase) + 1;
                  return (
                    <div key={phase} className="rounded-md border p-3 flex flex-col items-start gap-2 bg-muted/10">
                      <p className="font-medium text-sm mb-1">{phaseNumber}. {phase}</p>
                      <div className="w-full flex flex-col gap-2">
                        <div className="bg-background rounded px-2 py-1 border border-primary/10">
                          <span className="font-semibold text-foreground text-xs">Description:</span>
                          <span className="ml-1 text-muted-foreground text-[11px]">{desc?.replace('Description: ', '')}</span>
                        </div>
                        <div className="bg-background rounded px-2 py-1 border border-primary/10">
                          <span className="font-semibold text-foreground text-xs">Tool:</span>
                          <span className="ml-1 text-muted-foreground text-[11px]">{tool?.replace('Tool: ', '')}</span>
                        </div>
                        <div className="bg-background rounded px-2 py-1 border border-primary/10">
                          <span className="font-semibold text-foreground text-xs">Question:</span>
                          <span className="ml-1 text-muted-foreground text-[11px]">{question?.replace('Question: ', '')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {selectedRow && (
              <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
                <h3 className="font-semibold">Selected Topic Intelligence</h3>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Topic Name:</span> {selectedRow.topic}</p>
                    <p><span className="font-medium">Current Phase:</span> {selectedRow.phase}</p>
                    <p><span className="font-medium">Current Stability:</span> {selectedRow.stability}</p>
                    <p><span className="font-medium">Trend:</span> {selectedRow.trend}</p>
                    <p><span className="font-medium">Transition Status:</span> {selectedInterpretation?.transitionStatus || "Reinforce"}</p>
                    <p><span className="font-medium">Tutor Meaning:</span> {selectedInterpretation?.tutorMeaning}</p>
                    <p><span className="font-medium">Parent Meaning:</span> {selectedInterpretation?.parentMeaning}</p>
                    <p><span className="font-medium">Direction:</span> {selectedInterpretation?.direction}</p>
                    <p><span className="font-medium">Constraint:</span> {selectedInterpretation?.rules[0] || "Follow phase constraints"}</p>
                    <p><span className="font-medium">Entry Diagnosis:</span> {selectedRow.entryDiagnosis}</p>
                  </div>
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
                    <p className="text-sm font-medium">Next Tutor Move</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {getNextActionData(selectedRow.phase, selectedRow.stability).nextActions.map((a) => (
                        <li key={a} className="flex items-start gap-1.5">
                          <span className="mt-0.5 shrink-0 text-foreground/40">›</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                    {getNextActionData(selectedRow.phase, selectedRow.stability).advanceTo && (
                      <p className="text-xs font-medium text-primary">
                        Advance condition met - recommend move to {getNextActionData(selectedRow.phase, selectedRow.stability).advanceTo}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground border-t pt-2">Tutor approves all phase movement. System flags - tutor decides.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTopicField(selectedRow.topic);
                        setPhaseObservedField(selectedRow.phase);
                        setStabilityObservedField(selectedRow.stability);
                        setActiveTab("session-form");
                      }}
                    >
                      Log update for this topic
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Topic Progress Timeline</p>
                  <div className="rounded-md border p-2 space-y-2">
                    {(selectedRow.timeline || []).map((point) => (
                      <div key={`${point.date}-${point.phase}`} className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
                        <p><span className="font-medium">Date:</span> {point.date}</p>
                        <p><span className="font-medium">Phase:</span> {point.phase}</p>
                        <p><span className="font-medium">Stability:</span> {point.stability}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="session-form" className="space-y-4 sm:space-y-6">
            {/* Topic selector for session log */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Select Topic to Log</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={activeTopicField || topics[0]?.topic || ""}
                onChange={e => {
                  const topic = e.target.value;
                  setActiveTopicField(topic);
                  // phase/stability fields now sync via useEffect
                }}
              >
                {topics.map(t => (
                  <option key={t.topic} value={t.topic}>{t.topic}</option>
                ))}
              </select>
            </div>
                        <div className="flex justify-end mb-2">
                          <Button variant="outline" onClick={() => setActivateDialogOpen(true)}>
                            Activate Topic
                          </Button>
                        </div>
                        {/* Activate Topic Dialog */}
                        <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Activate New Topic</DialogTitle>
                              <DialogDescription>
                                Select a topic and provide a reason for activation. This will add the topic to the active list and log the reason.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 mt-2">
                              <Input
                                placeholder="Topic name (e.g. Linear equations)"
                                value={newTopic}
                                onChange={e => setNewTopic(e.target.value)}
                              />
                              <Select value={activationReason} onValueChange={setActivationReason}>
                                <SelectTrigger className="w-full">{activationReason || "Select reason"}</SelectTrigger>
                                <SelectContent>
                                  {ACTIVATION_REASONS.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {activationReason === "Other (enter note)" && (
                                <Textarea
                                  placeholder="Enter activation note"
                                  value={activationNote}
                                  onChange={e => setActivationNote(e.target.value)}
                                />
                              )}
                              {activateError && <p className="text-xs text-red-500">{activateError}</p>}
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setActivateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleActivateTopic}>Activate</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

            <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">

              {topicChoices.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topicChoices.map((topic) => (
                    <button
                      key={`manage-topic-${topic}`}
                      className={`rounded-md border p-3 text-left transition-colors ${
                        activeTopicField === topic ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                      }`}
                      onClick={() => {
                        setActiveTopicField(topic);
                        // phase/stability fields now sync via useEffect
                      }}
                    >
                      <p className="font-medium">{topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(() => {
                          const row = topics.find((t) => t.topic === topic);
                          return row ? `${row.phase} | ${row.stability}` : "No state yet";
                        })()}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {topics.length > 0 ? (
                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-medium text-foreground">Selected Topic</p>
                  <p className="text-muted-foreground mt-1 break-words">{activeTopicField || "Select a topic card above"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    This session record will update the topic conditioning map and become source evidence for weekly and monthly reports.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">First Topic</p>
                  <Input
                    value={manualTopicField}
                    onChange={(e) => setManualTopicField(e.target.value)}
                    placeholder="Type first topic, e.g. Linear equations"
                  />
                  <p className="text-xs text-muted-foreground">Use this only when the student has no topic cards yet.</p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Current Phase</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{topics.find(t => t.topic === activeTopicField)?.phase || "-"}</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Previous Stability</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{topics.find(t => t.topic === activeTopicField)?.stability || "-"}</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Transition Strictness</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Stability-aware</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Phase-Specific Observation Block</p>

                {(() => {
                  // Strictly derive phase and validate
                  const found = topics.find(t => t.topic === activeTopicField);
                  const phase = found?.phase && PHASE_OBSERVATION_CONFIG[found.phase as PhaseLabel] ? found.phase as PhaseLabel : "Clarity";
                  const config = PHASE_OBSERVATION_CONFIG[phase];
                  if (!found?.phase || !PHASE_OBSERVATION_CONFIG[found.phase as PhaseLabel]) {
                    return <div className="text-red-500 text-xs font-semibold">Phase missing or invalid for this topic. Please correct before logging.</div>;
                  }
                  return config.categories.map((category) => (
                    <div key={category.key} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{category.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {category.options.map((option) => (
                          <Button
                            key={`${category.key}-${option.label}`}
                            type="button"
                            variant={phaseSelections[category.key] === option.label ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newSelections = { ...phaseSelections, [category.key]: option.label };
                              setPhaseSelections(newSelections);
                              // Persist per topic/phase
                              const found = topics.find(t => t.topic === activeTopicField);
                              if (found) {
                                const phaseKey = `${found.topic}::${found.phase}`;
                                setPhaseSelectionsMap(prev => ({ ...prev, [phaseKey]: newSelections }));
                              }
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ));
                })()}

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">E. Tutor Intervention Used</p>
                  <div className="flex flex-wrap gap-2">
                    {phaseConfig.interventions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={interventionUsed === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInterventionUsed(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="rounded-xl border border-primary/20 bg-muted/20 p-4 space-y-2">
                <p className="text-sm font-semibold">Live Interpretation Preview</p>
                <p className="text-sm text-muted-foreground">System Interpretation: {projectedInterpretation.tutorMeaning}</p>
                <p className="text-sm text-muted-foreground">Decision: {phaseDecision.toUpperCase()} ({observedPhase} {"->"} {projectedPhase})</p>
                <p className="text-sm text-muted-foreground">Updated Stability: {projectedStability}</p>
                <p className="text-sm text-muted-foreground">Session Score: {sessionScore}</p>
                <p className="text-sm text-muted-foreground">Next Move: {projectedInterpretation.nextAction}</p>
                <p className="text-sm text-muted-foreground">Constraint: {livePreviewConstraint}</p>
                <p className="text-sm text-muted-foreground">Parent Meaning: {projectedInterpretation.parentMeaning}</p>
              </Card>

              <TutorSessionLogForm
                studentOptions={[{ id: studentId, name: studentName }]}
                defaultStudentId={studentId}
                lockStudent
                submitLabel="Save Topic Session Record"
                topicState={
                  canSubmitStructuredRecord
                    ? {
                        topic: effectiveTopicForLog,
                        phase: projectedPhase,
                        stability: projectedStability,
                        observationNotes: [
                          ...phaseConfig.categories.map(
                            (category) => `${category.label}: ${phaseSelections[category.key] || "Not selected"}`
                          ),
                          `Intervention Used: ${interventionUsed}`,
                          `Session Score: ${sessionScore}`,
                          `Phase Decision: ${phaseDecision}`,
                          `Constraint: ${livePreviewConstraint}`,
                        ].join(" | "),
                        structuredObservation: {
                          observedPhase,
                          previousStability,
                          categories: phaseConfig.categories.map((category) => ({
                            key: category.key,
                            label: category.label,
                            value: phaseSelections[category.key] || "Not selected",
                          })),
                          interventionUsed,
                          sessionScore,
                          phaseDecision,
                          tutorExplanation: projectedInterpretation.tutorMeaning,
                          parentMeaning: projectedInterpretation.parentMeaning,
                          nextAction: projectedInterpretation.nextAction,
                          constraint: livePreviewConstraint,
                        },
                      }
                    : null
                }
                onSuccess={() => {
                  setPhaseSelections({});
                  setInterventionUsed("");
                }}
              />
              {!canSubmitStructuredRecord ? (
                <p className="text-xs text-muted-foreground">
                  Complete all observation sections before saving this topic record.
                </p>
              ) : null}
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
