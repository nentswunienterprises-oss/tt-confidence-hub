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
import {
  PHASES,
  getNextActionData,
  getPriorityReason,
  nextActionFor,
  nextMoveRecommendation,
  phaseIndex,
  topicPriorityScore,
  trendFromHistory,
} from "@/components/tutor/topicConditioningEngine";
import type { PhaseLabel, StabilityLabel, TopicTrend } from "@/components/tutor/topicConditioningEngine";

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
    setPhaseObservedField(topics[0]?.phase || normalizePhase(topicConditioning?.entry_phase));
    setStabilityObservedField(topics[0]?.stability || normalizeStability(topicConditioning?.stability));
    setObservationNotes("");
  }, [open, topics, parentTopics, topicConditioning]);

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
    ? actionGuidanceFor(selectedRow.phase, selectedRow.stability)
    : { doItems: [], avoidItems: [] };
  const effectiveTopicForLog = topics.length > 0
    ? activeTopicField || selectedRow?.topic || ""
    : sanitizeTopic(manualTopicField) || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-0.5rem)] sm:w-full sm:max-w-7xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-primary/15 bg-background p-2 shadow-sm sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 text-base sm:text-lg leading-tight pr-6 break-words">
            <Target className="w-4 h-4 shrink-0 mt-0.5" />
            {studentName} Topic x Phase Dashboard
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm leading-snug pr-6">
            One glance = full understanding of the student. Semi-automatic recommendations require tutor approval before phase movement.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-x-hidden">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1">
            <TabsTrigger value="dashboard" className="h-auto whitespace-normal text-xs sm:text-sm py-2">Dashboard</TabsTrigger>
            <TabsTrigger value="session-form" className="h-auto whitespace-normal text-xs sm:text-sm py-2">Topic Management</TabsTrigger>
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
                <div className="space-y-3">
                  <div className="space-y-3 md:hidden">
                    {prioritizedTopics.map((row) => (
                      <button
                        key={`mobile-map-${row.topic}`}
                        type="button"
                        className={`w-full rounded-md border p-3 space-y-2 text-left transition-colors ${
                          selectedRow?.topic === row.topic ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                        }`}
                        onClick={() => setSelectedTopic(row.topic)}
                      >
                        <p className="font-medium break-words">{row.topic}</p>
                        <p className="text-xs text-muted-foreground">Current Phase: {row.phase}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Stability:</span>
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
                        <p className="text-xs text-muted-foreground">Last Updated: {row.lastSession}</p>
                        <p className="text-xs"><span className="font-medium">Next Action:</span> {nextActionFor(row.phase, row.stability)}</p>
                      </button>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
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
                        {prioritizedTopics.map((row) => (
                          <TableRow
                            key={row.topic}
                            className={`cursor-pointer ${selectedRow?.topic === row.topic ? "bg-primary/5" : "hover:bg-muted/30"}`}
                            onClick={() => setSelectedTopic(row.topic)}
                          >
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
                </div>
              )}
            </Card>

            <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Tutor Priority Queue</h3>
                <p className="text-xs text-muted-foreground">Decision-first snapshot</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Topics Tracked</p>
                  <p className="mt-1 text-lg font-semibold">{prioritizedTopics.length}</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Needs Stabilization</p>
                  <p className="mt-1 text-lg font-semibold">{needsStabilizationCount}</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Ready To Advance</p>
                  <p className="mt-1 text-lg font-semibold">{readyToAdvanceCount}</p>
                </div>
              </div>

              {attentionQueue.length > 0 && (
                <div className="space-y-2">
                  {attentionQueue.map((row, index) => (
                    <button
                      key={`priority-${row.topic}`}
                      type="button"
                      onClick={() => setSelectedTopic(row.topic)}
                      className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <p className="text-sm font-medium">#{index + 1} {row.topic}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.phase} | {row.stability} stability | {row.trend} trend
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Why now: {getPriorityReason(row.stability, row.trend)}</p>
                      <p className="mt-1 text-xs text-foreground">Next action: {nextActionFor(row.phase, row.stability)}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

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

            {selectedRow && (
              <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
                <h3 className="font-semibold">Selected Topic Intelligence</h3>
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
            <Card className="rounded-2xl border border-primary/15 bg-background p-3 sm:p-4 md:p-5 shadow-sm space-y-4">
              <h3 className="font-semibold">Topic Session Record</h3>
              <p className="text-sm text-muted-foreground">
                Each session record should lock three things first: the topic worked, the phase observed, and the stability observed. Weekly and monthly reports should be written from this evidence.
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">1. Topic</p>
                  <p className="mt-1 text-sm text-foreground">What exact topic did this session train?</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">2. Phase + Stability</p>
                  <p className="mt-1 text-sm text-foreground">What phase was observed, and how stable was the student inside that phase?</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">3. Session Evidence</p>
                  <p className="mt-1 text-sm text-foreground">What breakdown, intervention, and next reinforcement should feed reports later?</p>
                </div>
              </div>

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
                  <p className="text-muted-foreground mt-1 break-words">{effectiveTopicForLog || "Select a topic card above"}</p>
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
                <p className="text-sm font-medium">Source Evidence for Phase + Stability</p>
                <Textarea
                  value={observationNotes}
                  onChange={(e) => setObservationNotes(e.target.value)}
                  placeholder="Example: delayed start, guessed first attempt, stabilized after guided correction"
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Write the actual evidence that justified this phase and stability call. This is the cleanest bridge into later reporting.
                </p>
              </div>

              <TutorSessionLogForm
                studentOptions={[{ id: studentId, name: studentName }]}
                defaultStudentId={studentId}
                lockStudent
                submitLabel="Save Topic Session Record"
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
