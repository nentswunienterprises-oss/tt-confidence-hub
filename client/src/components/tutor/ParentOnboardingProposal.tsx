import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const TOTAL_STEPS = 3;

const BREAKDOWN_OPTIONS = [
  "Vocabulary gaps",
  "Method inconsistency",
  "Weak reasoning",
  "Freezes under difficulty",
  "Rushes under pressure",
  "Depends on tutor",
  "Skips steps",
];

const RESPONSE_PATTERN_OPTIONS = [
  "Freezes",
  "Rushes",
  "Guesses",
  "Seeks help early",
  "Stays structured",
];

const PHASE_SEQUENCE = [
  "Clarity",
  "Structured Execution",
  "Controlled Discomfort",
  "Time Pressure Stability",
];

function parseTopics(rawValue: string): string[] {
  if (!rawValue) return [];
  return rawValue
    .split(/[\n,;|]+/)
    .map((item) => item.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function computePhasePriority(
  vocabulary: string,
  reason: string,
  followsSteps: string,
  startsIndependently: string,
  responsePatterns: string[],
  breakdownPatterns: string[]
): { phase: string; label: string }[] {
  const scores = [0, 0, 0, 0];

  // Clarity (index 0)
  if (["weak", "inconsistent"].includes(vocabulary)) scores[0] += 2;
  if (["partial", "unclear"].includes(reason)) scores[0] += 1;
  if (breakdownPatterns.includes("Vocabulary gaps")) scores[0] += 2;
  if (breakdownPatterns.includes("Weak reasoning")) scores[0] += 1;

  // Structured Execution (index 1)
  if (["partial", "skips-guesses"].includes(followsSteps)) scores[1] += 2;
  if (["delayed", "does-not-start"].includes(startsIndependently)) scores[1] += 1;
  if (breakdownPatterns.includes("Method inconsistency")) scores[1] += 2;
  if (breakdownPatterns.includes("Skips steps")) scores[1] += 2;
  if (breakdownPatterns.includes("Depends on tutor")) scores[1] += 1;

  // Controlled Discomfort (index 2)
  if (responsePatterns.includes("Freezes")) scores[2] += 2;
  if (breakdownPatterns.includes("Freezes under difficulty")) scores[2] += 2;

  // Time Pressure Stability (index 3)
  if (responsePatterns.includes("Rushes")) scores[3] += 2;
  if (breakdownPatterns.includes("Rushes under pressure")) scores[3] += 2;

  const maxScore = Math.max(...scores);
  return PHASE_SEQUENCE.map((phase, i) => ({
    phase,
    label:
      scores[i] === maxScore && maxScore > 0
        ? "Primary"
        : scores[i] > 0
        ? i <= 1
          ? "Secondary"
          : "Later"
        : "Later",
  }));
}

function computeExpectedProgress(
  vocabulary: string,
  startsIndependently: string,
  followsSteps: string,
  responsePatterns: string[],
  breakdownPatterns: string[]
): string[] {
  const items: string[] = [];
  if (
    ["weak", "inconsistent"].includes(vocabulary) ||
    breakdownPatterns.includes("Vocabulary gaps")
  )
    items.push("Better problem identification");
  if (
    ["delayed", "does-not-start"].includes(startsIndependently) ||
    breakdownPatterns.includes("Depends on tutor")
  )
    items.push("Earlier independent starts");
  if (
    responsePatterns.includes("Freezes") ||
    breakdownPatterns.includes("Freezes under difficulty")
  )
    items.push("Reduced hesitation under difficulty");
  if (
    ["partial", "skips-guesses"].includes(followsSteps) ||
    breakdownPatterns.includes("Skips steps")
  )
    items.push("More consistent step execution");
  if (
    responsePatterns.includes("Rushes") ||
    breakdownPatterns.includes("Rushes under pressure")
  )
    items.push("Improved stability under time pressure");
  if (breakdownPatterns.includes("Method inconsistency"))
    items.push("Increased method stability");
  // Ensure at least 3 items
  const defaults = [
    "Reduced hesitation under difficulty",
    "More consistent step execution",
    "Improved stability under time pressure",
  ];
  for (const d of defaults) {
    if (items.length >= 3) break;
    if (!items.includes(d)) items.push(d);
  }
  return items;
}

interface ParentOnboardingProposalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  tutorName?: string;
  identitySheetData?: unknown;
  parentTopics?: string;
}

export default function ParentOnboardingProposal({
  open,
  onOpenChange,
  studentName,
  studentId,
  tutorName = "Your Tutor",
  parentTopics = "",
}: ParentOnboardingProposalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const topicOptions = parseTopics(parentTopics);
  const studentFirstName = studentName.trim().split(/\s+/)[0] || "Your child";

  // Wizard state
  const [step, setStep] = useState(1);
  const [showOutput, setShowOutput] = useState(false);
  const [activeTopic, setActiveTopic] = useState("");
  const [topicStability, setTopicStability] = useState<"Low" | "Medium" | "High">("Low");

  useEffect(() => {
    if (open) {
      setActiveTopic(topicOptions[0] || parentTopics || "Current school focus topic");
      setTopicStability("Low");
    }
  }, [open, parentTopics]);

  // Step 1 — Baseline Capture
  const [vocabulary, setVocabulary] = useState<"strong" | "inconsistent" | "weak" | "">("");
  const [method, setMethod] = useState<"stable" | "inconsistent" | "unstable" | "">("");
  const [reason, setReason] = useState<"clear" | "partial" | "unclear" | "">("");
  const [startsIndependently, setStartsIndependently] = useState<
    "immediate" | "delayed" | "does-not-start" | ""
  >("");
  const [followsSteps, setFollowsSteps] = useState<
    "consistent" | "partial" | "skips-guesses" | ""
  >("");
  const [responsePatterns, setResponsePatterns] = useState<string[]>([]);

  // Step 2 — Breakdown Patterns
  const [breakdownPatterns, setBreakdownPatterns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Step 3 — Phase Priority (auto, tutor can toggle)
  const autoPhases = computePhasePriority(
    vocabulary,
    reason,
    followsSteps,
    startsIndependently,
    responsePatterns,
    breakdownPatterns
  );
  const [phasePriorityOverride, setPhasePriorityOverride] = useState<
    Record<number, string> | null
  >(null);
  const phasePriority =
    phasePriorityOverride !== null
      ? autoPhases.map((p, i) => ({
          ...p,
          label: phasePriorityOverride[i] ?? p.label,
        }))
      : autoPhases;

  // Expected Progress (auto)
  const expectedProgress = computeExpectedProgress(
    vocabulary,
    startsIndependently,
    followsSteps,
    responsePatterns,
    breakdownPatterns
  );

  const toggleMultiSelect = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const resetWizard = () => {
    setStep(1);
    setShowOutput(false);
    setActiveTopic(topicOptions[0] || parentTopics || "Current school focus topic");
    setTopicStability("Low");
    setVocabulary("");
    setMethod("");
    setReason("");
    setStartsIndependently("");
    setFollowsSteps("");
    setResponsePatterns([]);
    setBreakdownPatterns([]);
    setNotes("");
    setPhasePriorityOverride(null);
  };

  const canProceedStep1 =
    vocabulary !== "" &&
    method !== "" &&
    reason !== "" &&
    startsIndependently !== "" &&
    followsSteps !== "" &&
    responsePatterns.length > 0;

  const canProceedStep2 = breakdownPatterns.length > 0;

  const handleSendProposal = async () => {
    const primaryPhase = phasePriority.find((p) => p.label === "Primary")?.phase ?? "Clarity";
    const secondaryPhase = phasePriority.find((p) => p.label === "Secondary")?.phase ?? "Structured Execution";
    const planName = "Premium Response Training";
    const topicForConditioning = activeTopic || parentTopics || "Current school focus topic";
    const planJustification = `${studentName}'s current response profile requires a structured sequence: ${primaryPhase} first, ${secondaryPhase} second, followed by progressive stability work. Topic conditioning map: ${topicForConditioning} | Entry phase ${primaryPhase} | Stability ${topicStability}.`;

    const payload = {
      studentId,
      type: "training-plan",
      baselineCapture: { vocabulary, method, reason, startsIndependently, followsSteps, responsePatterns },
      breakdownPatterns,
      notes,
      phasePriority,
      expectedProgress,
      primaryIdentity: "Response-focused learner profile",
      mathRelationship: `${vocabulary} vocabulary, ${method} method, ${reason} reasoning`,
      confidenceTriggers: responsePatterns.includes("Stays structured")
        ? "Performs better with clear step structure"
        : "Needs explicit structure to sustain confidence",
      confidenceKillers: responsePatterns
        .filter((p) => ["Freezes", "Rushes", "Guesses"].includes(p))
        .join(", "),
      pressureResponse:
        responsePatterns.find((p) => ["Freezes", "Rushes", "Guesses"].includes(p)) ??
        "Seeks help early",
      growthDrivers: `Structured execution with attempt-first coaching; Topic arena: ${topicForConditioning}; Stability: ${topicStability}`,
      currentTopics: topicForConditioning,
      topicConditioningTopic: topicForConditioning,
      topicConditioningEntryPhase: primaryPhase,
      topicConditioningStability: topicStability,
      immediateStruggles: breakdownPatterns.join(", "),
      gapsIdentified: breakdownPatterns.join(", "),
      tutorNotes: `${notes ? `${notes}\n\n` : ""}Topic Conditioning Map:\n- Topic: ${topicForConditioning}\n- Entry Phase: ${primaryPhase}\n- Stability: ${topicStability}`,
      futureIdentity: "Independent and stable problem solver",
      wantToRemembered: "A student who attempts with structure before support",
      hiddenMotivations: "Not captured in onboarding template",
      internalConflict: "Not captured in onboarding template",
      recommendedPlan: planName,
      justification: planJustification,
      childWillWin: expectedProgress.slice(0, 2).join("; "),
    };
    try {
      const response = await fetch(`${API_URL}/api/tutor/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to send proposal" }));
        throw new Error(err.message || "Failed to send proposal");
      }
      toast({
        title: "Training Plan Sent!",
        description: `The training plan for ${studentFirstName} has been sent to their parent.`,
        duration: 5000,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      await queryClient.invalidateQueries({
        queryKey: ["/api/tutor/students", studentId, "workflow-state"],
      });
      onOpenChange(false);
      resetWizard();
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const RadioGroup = ({
    options,
    value,
    onSelect,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onSelect: (v: string) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onSelect(o.value)}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
            value === o.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
      {children}
    </p>
  );

  const getParentFacingBreakdown = (phase: string) => {
    switch (phase) {
      case "Clarity":
        return `${studentFirstName} is not yet consistently identifying what the problem is asking or what method to use first.`;
      case "Structured Execution":
        return `${studentFirstName} can begin work, but does not yet apply a stable method consistently without support.`;
      case "Controlled Discomfort":
        return `${studentFirstName} becomes less stable when the work feels unfamiliar or more difficult.`;
      case "Time Pressure Stability":
        return `${studentFirstName} loses structure when working under time pressure.`;
      default:
        return `${studentFirstName} needs a more stable starting structure inside the current topic.`;
    }
  };

  const getParentFacingPriority = (phase: string) => {
    switch (phase) {
      case "Clarity":
        return `We will first help ${studentFirstName} read problems more clearly, recognise what is being asked, and name the structure before solving.`;
      case "Structured Execution":
        return `We will first train ${studentFirstName} to start earlier and follow a repeatable method without waiting to be carried through each step.`;
      case "Controlled Discomfort":
        return `We will first train ${studentFirstName} to stay calm and structured when questions become less familiar or more demanding.`;
      case "Time Pressure Stability":
        return `We will first train ${studentFirstName} to keep the same structure and decision-making even when time pressure increases.`;
      default:
        return `We will first strengthen ${studentFirstName}'s consistency in the current topic before adding more difficulty.`;
    }
  };

  // ── Step content ─────────────────────────────────────────────────────────
  const stepContent = () => {
    if (showOutput) {
      const topicForConditioning = activeTopic || parentTopics || "Current school focus topic";
      const entryPhase = phasePriority.find((p) => p.label === "Primary")?.phase ?? "Clarity";
      const firstBreakdown = getParentFacingBreakdown(entryPhase);
      const firstPriority = getParentFacingPriority(entryPhase);
      return (
        <div className="space-y-4">
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <h3 className="font-bold text-sm text-center mb-0.5">Training Proposal Ready</h3>
            <p className="text-xs text-center text-muted-foreground">{studentName}</p>
          </div>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Focus Area
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground">
                We will start in <span className="text-foreground font-medium">{topicForConditioning}</span>. It gives us the clearest view of how {studentFirstName} responds when the work pushes back.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Where {studentFirstName} Currently Gets Stuck
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground">{firstBreakdown}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What We Will Work On First
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground">{firstPriority}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Student Starting Point
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <p className="text-xs font-semibold mb-1">Clarity</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>Vocabulary: <span className="text-foreground capitalize">{vocabulary}</span></li>
                  <li>Method: <span className="text-foreground capitalize">{method}</span></li>
                  <li>Reason: <span className="text-foreground capitalize">{reason}</span></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Execution</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>
                    Starts:{" "}
                    <span className="text-foreground capitalize">
                      {startsIndependently.replace("-", " ")}
                    </span>
                  </li>
                  <li>
                    Follows Steps:{" "}
                    <span className="text-foreground capitalize">
                      {followsSteps.replace("-", " ")}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Response Pattern</p>
                <ul className="text-xs text-muted-foreground ml-2 space-y-0.5">
                  {responsePatterns.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Identified Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                {breakdownPatterns.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">Note: {notes}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Training Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="text-xs space-y-0.5 ml-2">
                {phasePriority.map((p, i) => (
                  <li key={p.phase} className="text-muted-foreground">
                    <span className="text-foreground font-medium">Priority {i + 1}: {p.phase}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How Sessions Will Be Structured
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                <li>Cadence: 2 sessions per week (8 sessions per month)</li>
                <li>Clear explanation of the problem structure</li>
                <li>Guided practice with immediate correction</li>
                <li>Repeated method-building in the same topic</li>
                <li>Gradual increase in difficulty when readiness improves</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How You Will Know It Is Improving
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                {expectedProgress.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-4 py-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Important Note</strong> - This training focuses
                on how the student responds under difficulty, not only on correct answers.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Commitment</strong> - Consistency and active
                participation are required. Cadence is fixed at 2 sessions per week (8 sessions per month).
                Students are expected to attempt before receiving guidance.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowOutput(false); setStep(3); }}
              className="gap-1"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </Button>
            <Button onClick={handleSendProposal} className="flex-1 gap-2" size="sm">
              <Send className="w-3 h-3" /> Send to Parent
            </Button>
          </div>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <SectionLabel>Topic Conditioning</SectionLabel>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Active Topic Arena</Label>
                  {topicOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {topicOptions.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setActiveTopic(topic)}
                          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                            activeTopic === topic
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      value={activeTopic}
                      onChange={(e) => setActiveTopic(e.target.value)}
                      className="min-h-[56px] text-xs"
                      placeholder="Enter current school topic to condition"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Current Stability in Topic</Label>
                  <RadioGroup
                    options={[
                      { value: "Low", label: "Low" },
                      { value: "Medium", label: "Medium" },
                      { value: "High", label: "High" },
                    ]}
                    value={topicStability}
                    onSelect={(v) => setTopicStability(v as typeof topicStability)}
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Clarity</SectionLabel>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Vocabulary</Label>
                  <RadioGroup
                    options={[
                      { value: "strong", label: "Strong" },
                      { value: "inconsistent", label: "Inconsistent" },
                      { value: "weak", label: "Weak" },
                    ]}
                    value={vocabulary}
                    onSelect={(v) => setVocabulary(v as typeof vocabulary)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Method</Label>
                  <RadioGroup
                    options={[
                      { value: "stable", label: "Stable" },
                      { value: "inconsistent", label: "Inconsistent" },
                      { value: "unstable", label: "Unstable" },
                    ]}
                    value={method}
                    onSelect={(v) => setMethod(v as typeof method)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Reason</Label>
                  <RadioGroup
                    options={[
                      { value: "clear", label: "Clear" },
                      { value: "partial", label: "Partial" },
                      { value: "unclear", label: "Unclear" },
                    ]}
                    value={reason}
                    onSelect={(v) => setReason(v as typeof reason)}
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Execution</SectionLabel>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Starts Independently</Label>
                  <RadioGroup
                    options={[
                      { value: "immediate", label: "Immediate" },
                      { value: "delayed", label: "Delayed" },
                      { value: "does-not-start", label: "Does not start" },
                    ]}
                    value={startsIndependently}
                    onSelect={(v) => setStartsIndependently(v as typeof startsIndependently)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Follows Steps</Label>
                  <RadioGroup
                    options={[
                      { value: "consistent", label: "Consistent" },
                      { value: "partial", label: "Partial" },
                      { value: "skips-guesses", label: "Skips / guesses" },
                    ]}
                    value={followsSteps}
                    onSelect={(v) => setFollowsSteps(v as typeof followsSteps)}
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Response Pattern - select all that apply</SectionLabel>
              <div className="flex flex-col gap-2">
                {RESPONSE_PATTERN_OPTIONS.map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <Checkbox
                      id={`rp-${opt}`}
                      checked={responsePatterns.includes(opt)}
                      onCheckedChange={() =>
                        toggleMultiSelect(responsePatterns, setResponsePatterns, opt)
                      }
                    />
                    <label htmlFor={`rp-${opt}`} className="text-xs cursor-pointer">
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <SectionLabel>Breakdown Patterns - select all that apply</SectionLabel>
              <div className="flex flex-col gap-2">
                {BREAKDOWN_OPTIONS.map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <Checkbox
                      id={`bp-${opt}`}
                      checked={breakdownPatterns.includes(opt)}
                      onCheckedChange={() =>
                        toggleMultiSelect(breakdownPatterns, setBreakdownPatterns, opt)
                      }
                    />
                    <label htmlFor={`bp-${opt}`} className="text-xs cursor-pointer">
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Note</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief observation..."
                className="min-h-[60px] text-xs"
                maxLength={200}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
              Auto-suggested based on your inputs. You can adjust labels.
            </div>
            <div className="space-y-2">
              {phasePriority.map((p, i) => (
                <div key={p.phase} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <span className="text-xs font-medium">Phase {i + 1}: {p.phase}</span>
                  <div className="flex gap-1">
                    {["Primary", "Secondary", "Later"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() =>
                          setPhasePriorityOverride((prev) => ({ ...(prev ?? {}), [i]: lbl }))
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                          p.label === lbl
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepLabels = [
    "Baseline Capture",
    "Breakdown Patterns",
    "Training Phase Priority",
  ];

  const canProceed =
    step === 1 ? canProceedStep1 :
    step === 2 ? canProceedStep2 :
    true;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetWizard();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base sm:text-lg">Generate Training Plan</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">{studentName}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        {!showOutput && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Step {step} of {TOTAL_STEPS} — {stepLabels[step - 1]}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round((step / TOTAL_STEPS) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="py-2">{stepContent()}</div>

        {/* Navigation */}
        {!showOutput && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </Button>
            <div className="flex-1" />
            {step < TOTAL_STEPS ? (
              <Button
                size="sm"
                disabled={!canProceed}
                onClick={() => setStep((s) => s + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowOutput(true)}
                className="gap-1"
              >
                Generate Proposal <ChevronRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
