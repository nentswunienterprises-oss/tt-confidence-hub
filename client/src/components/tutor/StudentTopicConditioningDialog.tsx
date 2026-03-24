import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getQueryFn } from "@/lib/queryClient";
import { AlertCircle, Info, Target } from "lucide-react";
import TutorSessionLogForm from "@/components/tutor/TutorSessionLogForm";

const PHASES = [
  "Clarity",
  "Structured Execution",
  "Controlled Discomfort",
  "Time Pressure Stability",
] as const;

type PhaseLabel = (typeof PHASES)[number];
type StabilityLabel = "Low" | "Medium" | "High";

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
  trend: "Improving" | "Holding" | "Regressing" | "Stable";
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

function normalizePhase(value?: string | null): PhaseLabel {
  const v = String(value || "").toLowerCase();
  if (v.includes("clarity")) return "Clarity";
  if (v.includes("structured")) return "Structured Execution";
  if (v.includes("discomfort")) return "Controlled Discomfort";
  if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
  return "Structured Execution";
}

function normalizeStability(value?: string | null): StabilityLabel {
  const v = String(value || "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("medium")) return "Medium";
  return "Low";
}

function sanitizeTopic(value?: string | null): string | null {
  const cleaned = String(value || "").trim();
  if (!cleaned) return null;
  if (cleaned.toLowerCase() === "onboarding baseline diagnostic") return null;
  return cleaned;
}

function phaseIndex(phase: PhaseLabel): number {
  return PHASES.indexOf(phase);
}

type NextActionData = {
  primaryAction: string;
  nextActions: string[];
  rules: string[];
  advanceTo?: PhaseLabel;
};

const NEXT_ACTION_ENGINE: Record<PhaseLabel, Record<StabilityLabel, NextActionData>> = {
  Clarity: {
    Low: {
      primaryAction: "Reinforce Vocabulary",
      nextActions: [
        "Reinforce Vocabulary",
        "Reinforce Method (step sequence)",
        "Reinforce Reason (why it works)",
        "Re-model same concept",
        "Immediate Apply after each model",
      ],
      rules: ["No Boss Battles", "No time pressure", "No skipping layers"],
    },
    Medium: {
      primaryAction: "Continue 3-Layer Lens",
      nextActions: [
        "Continue 3-Layer Lens",
        "Increase Apply volume (more reps)",
        "Start light execution checks (can they repeat without help?)",
      ],
      rules: ["No Boss Battles as primary", "No time pressure", "Reduce explanation, increase execution"],
    },
    High: {
      primaryAction: "Transition to Structured Execution",
      nextActions: [
        "Transition to Structured Execution",
        "Reduce modeling",
        "Increase independent attempts",
      ],
      rules: ["Do NOT stay in teaching mode", "Move forward"],
      advanceTo: "Structured Execution",
    },
  },
  "Structured Execution": {
    Low: {
      primaryAction: "Run strict Model → Apply → Guide loops",
      nextActions: [
        "Run strict Model → Apply → Guide loops",
        "Enforce step-by-step execution",
        "Correct every skipped step",
        "Force student to start every problem",
      ],
      rules: ["No time pressure", "Boss Battles only if student can start", "No over-explaining"],
    },
    Medium: {
      primaryAction: "Increase independent problem volume",
      nextActions: [
        "Increase independent problem volume",
        "Reduce modeling",
        "Strengthen consistency across multiple problems",
        "Introduce light Boss Battles",
      ],
      rules: ["Do not rush to time pressure", "Still reinforce structure every time"],
    },
    High: {
      primaryAction: "Transition to Controlled Discomfort",
      nextActions: [
        "Transition to Controlled Discomfort",
        "Introduce Boss Battles consistently",
        "Focus on response under uncertainty",
      ],
      rules: ["Do NOT keep repeating basic problems", "Move forward"],
      advanceTo: "Controlled Discomfort",
    },
  },
  "Controlled Discomfort": {
    Low: {
      primaryAction: "Introduce Boss Battles carefully",
      nextActions: [
        "Introduce Boss Battles carefully",
        "Enforce 10-15 second pause",
        "Guide only to first step",
        "Reinforce \"start despite uncertainty\"",
      ],
      rules: ["No rescuing", "No full explanations mid-struggle", "No time pressure yet"],
    },
    Medium: {
      primaryAction: "Increase frequency of Boss Battles",
      nextActions: [
        "Increase frequency of Boss Battles",
        "Reduce hesitation time",
        "Push independent starts",
        "Reinforce calm execution",
      ],
      rules: ["Do not remove difficulty", "Do not over-guide"],
    },
    High: {
      primaryAction: "Transition to Time Pressure Stability",
      nextActions: [
        "Transition to Time Pressure Stability",
        "Introduce timed Boss Battles",
        "Maintain structure under constraint",
      ],
      rules: ["Do NOT stay in comfort zone", "Move forward"],
      advanceTo: "Time Pressure Stability",
    },
  },
  "Time Pressure Stability": {
    Low: {
      primaryAction: "Introduce short timed problems",
      nextActions: [
        "Introduce short timed problems",
        "Reinforce \"process over speed\"",
        "Debrief after every attempt",
        "Re-anchor structure",
      ],
      rules: ["Do not push speed", "Do not increase time pressure aggressively"],
    },
    Medium: {
      primaryAction: "Increase timed repetitions",
      nextActions: [
        "Increase timed repetitions",
        "Reduce breakdown frequency",
        "Strengthen full execution within time",
      ],
      rules: ["Do not sacrifice structure for speed", "Maintain method discipline"],
    },
    High: {
      primaryAction: "Maintain with mixed practice",
      nextActions: [
        "Maintain with mixed practice",
        "Introduce new variations of topic",
        "Prepare for transfer to new topics",
      ],
      rules: ["Do not over-train same pattern", "Begin cross-topic conditioning"],
    },
  },
};

function getNextActionData(phase: PhaseLabel, stability: StabilityLabel): NextActionData {
  return NEXT_ACTION_ENGINE[phase][stability];
}

function nextActionFor(phase: PhaseLabel, stability: StabilityLabel): string {
  return NEXT_ACTION_ENGINE[phase][stability].primaryAction;
}

function actionGuidanceFor(phase: PhaseLabel, stability: StabilityLabel): { doItems: string[]; avoidItems: string[] } {
  const data = NEXT_ACTION_ENGINE[phase][stability];
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

function trendByStability(stability: StabilityLabel): TopicRow["trend"] {
  if (stability === "High") return "Stable";
  if (stability === "Medium") return "Improving";
  return "Holding";
}

function trendFromHistory(history: StabilityLabel[]): TopicRow["trend"] {
  if (history.length < 2) return trendByStability(history[history.length - 1] || "Low");
  const score = (s: StabilityLabel) => (s === "Low" ? 1 : s === "Medium" ? 2 : 3);
  const prev = score(history[history.length - 2]);
  const curr = score(history[history.length - 1]);
  if (curr > prev) return "Improving";
  if (curr < prev) return "Regressing";
  return curr === 3 ? "Stable" : "Holding";
}

function parseObservation(session: TutorSessionRecord): {
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

function formatLastUpdatedLabel(dateText?: string): string {
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

  const validSeedTopic = sanitizeTopic(map?.topic) || sanitizeTopic(splitTopics(parentTopics)[0]) || null;
  if (validSeedTopic) {
    byTopic.set(validSeedTopic, {
      history: [],
      seeded: {
        phase: normalizePhase(map?.entry_phase),
        stability: normalizeStability(map?.stability),
      },
    });
  }

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

  observations.forEach((obs) => {
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

    const recentLogs = history
      .slice(-3)
      .reverse()
      .map((h, index) => {
        const noteLine = h.note
          .split(/\n+/)
          .find((line) => /Observation Notes:/i.test(line))
          ?.replace(/Observation Notes:\s*/i, "")
          .trim();
        return noteLine && noteLine.length > 0
          ? `Session ${index + 1}: ${noteLine}`
          : `Session ${index + 1}: ${h.phase}, ${h.stability} stability observed`;
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

function nextMoveRecommendation(phase: PhaseLabel, stability: StabilityLabel): string {
  const idx = phaseIndex(phase);
  if (stability === "High") {
    if (idx === PHASES.length - 1) return "Maintain and transfer to new topics";
    return `Advance to ${PHASES[idx + 1]}`;
  }
  if (stability === "Low") {
    if (idx === 0) return "Hold at Clarity — reinforce foundations";
    return `Reinforce ${PHASES[idx - 1]} — stability too low to advance`;
  }
  return "Hold current phase — build stability before advancing";
}

const phaseDefinition: Record<PhaseLabel, string> = {
  Clarity:
    "Student cannot yet see the topic clearly. Vocabulary, recognition, steps, or reasoning are still unstable.",
  "Structured Execution":
    "Student understands enough to begin, but cannot yet execute reliably without being carried.",
  "Controlled Discomfort":
    "Student can execute the topic, but difficulty spikes still destabilize response. Boss Battles belong here.",
  "Time Pressure Stability":
    "Student can handle the topic, but time pressure still tests whether structure survives urgency. Timed execution belongs here.",
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
  const { data: sessions } = useQuery<TutorSessionRecord[]>({
    queryKey: ["/api/tutor/sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: open && !!studentId,
  });

  const studentSessions = useMemo(
    () => (sessions || []).filter((session) => session.studentId === studentId),
    [sessions, studentId],
  );

  const topics = useMemo(
    () => buildTopics(parentTopics, topicConditioning, persistedTopicStates, studentSessions),
    [parentTopics, topicConditioning, persistedTopicStates, studentSessions],
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0]?.topic || "");

  const [activeTopicField, setActiveTopicField] = useState("");
  const [manualTopicField, setManualTopicField] = useState("");
  const [phaseObservedField, setPhaseObservedField] = useState("");
  const [stabilityObservedField, setStabilityObservedField] = useState("");
  const [observationNotes, setObservationNotes] = useState("");

  useEffect(() => {
    if (topics.length === 0) return;
    if (!selectedTopic || !topics.some((t) => t.topic === selectedTopic)) {
      setSelectedTopic(topics[0].topic);
    }
  }, [topics, selectedTopic]);

  useEffect(() => {
    if (!open) return;
    const firstTopic = topics[0]?.topic || sanitizeTopic(splitTopics(parentTopics)[0]) || "";
    setActiveTopicField(firstTopic);
    setManualTopicField("");
    setPhaseObservedField(topics[0]?.phase || normalizePhase(topicConditioning?.entry_phase));
    setStabilityObservedField(topics[0]?.stability || normalizeStability(topicConditioning?.stability));
    setObservationNotes("");
  }, [open, topics, parentTopics, topicConditioning]);

  const topicChoices = useMemo(() => {
    const fromCards = topics.map((t) => t.topic);
    const fromParent = splitTopics(parentTopics).map((t) => sanitizeTopic(t)).filter((t): t is string => !!t);
    return Array.from(new Set([...fromCards, ...fromParent]));
  }, [topics, parentTopics]);

  const selectedRow = topics.find((row) => row.topic === selectedTopic) || topics[0];
  const phaseIx = selectedRow ? phaseIndex(selectedRow.phase) : 0;
  const guidance = selectedRow
    ? actionGuidanceFor(selectedRow.phase, selectedRow.stability)
    : { doItems: [], avoidItems: [] };
  const effectiveTopicForLog = topics.length > 0
    ? activeTopicField || selectedRow?.topic || ""
    : sanitizeTopic(manualTopicField) || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-7xl max-h-[92vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {studentName} Topic x Phase Dashboard
          </DialogTitle>
          <DialogDescription>
            One glance = full understanding of the student. Semi-automatic recommendations require tutor approval before phase movement.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="session-form">Topic Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="p-4 md:p-5 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold">Active Conditioning Map</h3>
                <Badge variant="outline" className="w-fit">Student ID: {studentId || "-"}</Badge>
              </div>

              {topics.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No topic observations logged yet. Use Session Log Form to add Active Topic, Phase Observed, and Stability Observed.
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Current Phase</TableHead>
                        <TableHead>Stability</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Next Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topics.map((row) => (
                        <TableRow key={row.topic}>
                          <TableCell className="font-medium">{row.topic}</TableCell>
                          <TableCell>{row.phase}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>{row.lastSession}</TableCell>
                          <TableCell>{nextActionFor(row.phase, row.stability)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-4 md:p-5 space-y-4">
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

              <Card className="p-4 md:p-5 space-y-4">
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
                            ? "bg-muted/60 border-muted text-foreground/50"
                            : state === "current"
                            ? "bg-primary/10 border-primary/30 text-foreground font-medium"
                            : "bg-muted/30 border-muted text-muted-foreground"
                        }
                      >
                        {phase}
                      </Badge>
                    );
                  })}
                </div>

                <div className="rounded-md border bg-muted/40 p-3 space-y-2">
                  <p className="text-sm font-medium">Semi-automatic recommendation</p>
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

            <Card className="p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Phase Definitions</h3>
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <TooltipProvider>
                <div className="grid md:grid-cols-2 gap-3">
                  {PHASES.map((phase) => (
                    <div key={phase} className="rounded-md border p-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{phase}</p>
                        <p className="text-xs text-muted-foreground mt-1">Hover info for full meaning</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground" aria-label={`About ${phase}`}>
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {phaseDefinition[phase]}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </Card>

            <Card className="p-4 md:p-5 space-y-4">
              <h3 className="font-semibold">Topic Conditioning Grid</h3>
              <p className="text-sm text-muted-foreground">Click a topic card to open the active topic focus panel.</p>
              {topics.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No active topics yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((row) => (
                    <button
                      key={row.topic}
                      className={`rounded-md border p-3 text-left transition-colors ${
                        selectedRow?.topic === row.topic
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/40"
                      }`}
                      onClick={() => setSelectedTopic(row.topic)}
                    >
                      <p className="font-medium">{row.topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">Current Phase: {row.phase}</p>
                      <p className="text-xs text-muted-foreground">Stability: {row.stability}</p>
                      <p className="text-xs text-muted-foreground">Last Updated: {row.lastSession}</p>
                      <p className="text-xs font-medium mt-2">Next Action: {nextActionFor(row.phase, row.stability)}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {selectedRow && (
              <Card className="p-4 md:p-5 space-y-4">
                <h3 className="font-semibold">Active Topics</h3>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Topic Name:</span> {selectedRow.topic}</p>
                    <p><span className="font-medium">Current Phase:</span> {selectedRow.phase}</p>
                    <p><span className="font-medium">Current Stability:</span> {selectedRow.stability}</p>
                    <p><span className="font-medium">Trend:</span> {selectedRow.trend}</p>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Topic Progress Timeline</p>
                  <div className="rounded-md border overflow-x-auto">
                    {(selectedRow.timeline || []).map((point) => (
                      <div key={`${point.date}-${point.phase}`} className="grid min-w-[420px] grid-cols-3 gap-3 text-sm px-3 py-2 border-b last:border-b-0">
                        <span>{point.date}</span>
                        <span>{point.phase}</span>
                        <span>{point.stability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4 md:p-5 space-y-3">
              <h3 className="font-semibold">Cross-topic Matrix (Executive View)</h3>
              {topics.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Matrix will appear after first topic observation is logged.
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Stability</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Next Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topics.map((row) => (
                        <TableRow key={`matrix-${row.topic}`}>
                          <TableCell className="font-medium">{row.topic}</TableCell>
                          <TableCell>{row.phase}</TableCell>
                          <TableCell>{row.stability}</TableCell>
                          <TableCell>{row.trend}</TableCell>
                          <TableCell>{row.lastSession}</TableCell>
                          <TableCell>{nextActionFor(row.phase, row.stability)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="session-form" className="space-y-6">
            <Card className="p-4 md:p-5 space-y-4">
              <h3 className="font-semibold">Topic-first Session Logging</h3>
              <p className="text-sm text-muted-foreground">
                Select a topic card, review current phase and stability, then use the full session log form for that topic.
              </p>

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
                        const row = topics.find((t) => t.topic === topic);
                        if (row) {
                          setPhaseObservedField(row.phase);
                          setStabilityObservedField(row.stability);
                        }
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
                  <p className="text-muted-foreground mt-1">{effectiveTopicForLog || "Select a topic card above"}</p>
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

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Phase Observed in Session</p>
                  <Select value={phaseObservedField} onValueChange={setPhaseObservedField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select observed phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASES.map((phase) => (
                        <SelectItem key={`phase-${phase}`} value={phase}>{phase}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Stability Observed in Session</p>
                  <Select value={stabilityObservedField} onValueChange={setStabilityObservedField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select observed stability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Observation Notes</p>
                <Textarea
                  value={observationNotes}
                  onChange={(e) => setObservationNotes(e.target.value)}
                  placeholder="Example: delayed start, guessing in first attempt, improved after guided correction"
                  className="min-h-[120px]"
                />
              </div>

              <TutorSessionLogForm
                studentOptions={[{ id: studentId, name: studentName }]}
                defaultStudentId={studentId}
                lockStudent
                submitLabel="Log Session for Topic"
                topicState={
                  effectiveTopicForLog && phaseObservedField && stabilityObservedField
                    ? {
                        topic: effectiveTopicForLog,
                        phase: phaseObservedField,
                        stability: stabilityObservedField,
                        observationNotes,
                      }
                    : null
                }
                onSuccess={() => setObservationNotes("")}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
