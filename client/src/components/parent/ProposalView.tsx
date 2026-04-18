import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ProposalData {
  id: string;
  primaryIdentity?: string;
  mathRelationship?: string;
  confidenceTriggers?: string;
  confidenceKillers?: string;
  pressureResponse?: string;
  growthDrivers?: string;
  currentTopics?: string;
  immediateStruggles?: string;
  gapsIdentified?: string;
  tutorNotes?: string;
  futureIdentity?: string;
  wantToRemembered?: string;
  hiddenMotivations?: string;
  internalConflict?: string;
  recommendedPlan: string;
  justification: string;
  childWillWin?: string;
  topicConditioning?: {
    topic?: string | null;
    entryPhase?: string | null;
    stability?: string | null;
  };
  student?: {
    name: string;
    grade: string;
  };
  tutor?: {
    name: string;
    bio?: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
}

interface ProposalTopicState {
  topic: string;
  phase?: string | null;
  stability?: string | null;
  lastUpdated?: string | null;
  movement?: "none" | "improved" | "regressed" | "changed";
  bucket?: "active" | "recent" | "older";
}

interface ProposalViewProps {
  proposal: ProposalData;
  topicStates?: ProposalTopicState[];
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  isProcessing?: boolean;
}

export default function ProposalView({ 
  proposal, 
  topicStates = [],
  showActions = false,
  onAccept,
  onDecline,
  isProcessing = false 
}: ProposalViewProps) {
  console.log("📋 ProposalView rendering with data:", proposal);

  const studentName = proposal.student?.name || "Your Child";
  const studentFirstName = studentName.trim().split(/\s+/)[0] || "Your child";

  const splitList = (value?: string): string[] => {
    if (!value) return [];
    return value
      .split(/[\n,;|]+/)
      .map((item) => item.replace(/^[-*\u2022\s]+/, "").trim())
      .filter(Boolean);
  };

  const formatListWithAnd = (items: string[]) => {
    const cleaned = Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
    if (cleaned.length === 0) return "";
    if (cleaned.length === 1) return cleaned[0];
    if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
    return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
  };

  const extractDiagnosisPhase = (): PhaseLabel | null => {
    const text = [proposal.tutorNotes || "", proposal.justification || ""].join("\n");
    const fromNotes = text.match(/Diagnosis Phase:\s*(Clarity|Structured Execution|Controlled Discomfort|Time Pressure Stability)/i)?.[1];
    if (fromNotes) {
      const normalized = normalizePhaseLabel(fromNotes);
      if (normalized) return normalized;
    }

    const legacyFromNotes = text.match(/\nPhase:\s*(Clarity|Structured Execution|Controlled Discomfort|Time Pressure Stability)/i)?.[1];
    if (legacyFromNotes) {
      const normalized = normalizePhaseLabel(legacyFromNotes);
      if (normalized) return normalized;
    }

    const explicit = text.match(/Diagnosed at\s*(Clarity|Structured Execution|Controlled Discomfort|Time Pressure Stability)/i)?.[1];
    if (explicit) {
      const normalized = normalizePhaseLabel(explicit);
      if (normalized) return normalized;
    }

    const scoredAt = text.match(/scored\s*\d+\/?\d*\s*at\s*(Clarity|Structured Execution|Controlled Discomfort|Time Pressure Stability)\s*phase/i)?.[1];
    if (scoredAt) {
      const normalized = normalizePhaseLabel(scoredAt);
      if (normalized) return normalized;
    }

    return null;
  };

  const extractTopicConditioning = () => {
    if (proposal.topicConditioning) {
      return {
        topic: proposal.topicConditioning.topic?.trim() || null,
        entryPhase: proposal.topicConditioning.entryPhase?.trim() || null,
        stability: proposal.topicConditioning.stability?.trim() || null,
      };
    }

    const noteText = proposal.tutorNotes || "";
    const justificationText = proposal.justification || "";
    const topic = (proposal.currentTopics || "").trim() || null;

    const phaseFromNotes = noteText.match(/Entry Phase:\s*([^\n\r]+)/i)?.[1]?.trim();
    const phaseFromJustification = justificationText.match(/Entry phase\s*([^|\.]+)/i)?.[1]?.trim();
    const stabilityFromNotes = noteText.match(/Stability:\s*([^\n\r]+)/i)?.[1]?.trim();
    const stabilityFromJustification = justificationText.match(/Stability\s*([^|\.]+)/i)?.[1]?.trim();

    return {
      topic,
      entryPhase: phaseFromNotes || phaseFromJustification || null,
      stability: stabilityFromNotes || stabilityFromJustification || null,
    };
  };

  const placeholderTopic = "Onboarding baseline diagnostic";
  const focusTopics =
    proposal.currentTopics && proposal.currentTopics.trim() !== "" && proposal.currentTopics !== placeholderTopic
      ? splitList(proposal.currentTopics)
      : splitList(proposal.immediateStruggles);

  const topicConditioning = extractTopicConditioning();

  const PHASE_SEQUENCE = ["Clarity", "Structured Execution", "Controlled Discomfort", "Time Pressure Stability"] as const;
  const STABILITY_SEQUENCE = ["Low", "Medium", "High", "High Maintenance"] as const;
  type PhaseLabel = (typeof PHASE_SEQUENCE)[number];
  type StabilityLabel = (typeof STABILITY_SEQUENCE)[number];

  const deriveTrainingEntryPhase = (diagnosisPhase: PhaseLabel, _stability: StabilityLabel): PhaseLabel => {
    return diagnosisPhase;
  };

  const PARENT_STATE_ENGINE: Record<PhaseLabel, Record<StabilityLabel, { status: string; meaning: string }>> = {
    Clarity: {
      Low: {
        status: `${studentFirstName} did not consistently identify terms, problem type, or starting structure during diagnosis.`,
        meaning: `${studentFirstName} needs clearer recognition before independent execution can be trained.`,
      },
      Medium: {
        status: `${studentFirstName} showed partial recognition of terms and structure across the diagnosis sets.`,
        meaning: `${studentFirstName} can follow parts of the method but still needs reinforcement for consistent clarity.`,
      },
      High: {
        status: `${studentFirstName} demonstrated clear recognition and explanation patterns in the diagnosis topic.`,
        meaning: `${studentFirstName} begins training in Clarity with system scoring determining remain, regress, or advance.`,
      },
      "High Maintenance": {
        status: `${studentFirstName} has shown repeated high consistency in Clarity across strong sessions.`,
        meaning: `${studentFirstName} is at the gate where one more strong session can trigger progression to Structured Execution.`,
      },
    },
    "Structured Execution": {
      Low: {
        status: `${studentFirstName} did not execute the method consistently without support.`,
        meaning: `${studentFirstName} needs repetition of start behavior and step order to stabilize execution.`,
      },
      Medium: {
        status: `${studentFirstName} executed parts of the method correctly but showed inconsistency across attempts.`,
        meaning: `${studentFirstName} needs stronger independent repetition before phase pressure increases.`,
      },
      High: {
        status: `${studentFirstName} maintained method execution consistently across attempts.`,
        meaning: `${studentFirstName} begins training in Structured Execution with transitions handled by session scoring.`,
      },
      "High Maintenance": {
        status: `${studentFirstName} has repeatedly sustained stable independent execution across sets.`,
        meaning: `${studentFirstName} is at the gate where one more strong session can trigger progression to Controlled Discomfort.`,
      },
    },
    "Controlled Discomfort": {
      Low: {
        status: `${studentFirstName} destabilized when problems became less familiar or more difficult.`,
        meaning: `${studentFirstName} needs structured exposure to difficulty while preserving method control.`,
      },
      Medium: {
        status: `${studentFirstName} stayed structured in some higher-friction prompts but not consistently.`,
        meaning: `${studentFirstName} needs more discomfort reps before timed pressure is introduced.`,
      },
      High: {
        status: `${studentFirstName} stayed structured during challenge-heavy prompts.`,
        meaning: `${studentFirstName} begins training in Controlled Discomfort with transitions handled by session scoring.`,
      },
      "High Maintenance": {
        status: `${studentFirstName} has repeatedly held structure under discomfort across strong sessions.`,
        meaning: `${studentFirstName} is at the gate where one more strong session can trigger progression to Time Pressure Stability.`,
      },
    },
    "Time Pressure Stability": {
      Low: {
        status: `${studentFirstName} lost structure when time pressure increased.`,
        meaning: `${studentFirstName} needs controlled timed reps to stabilize pace and method integrity.`,
      },
      Medium: {
        status: `${studentFirstName} retained structure in parts of timed work but showed instability across attempts.`,
        meaning: `${studentFirstName} needs continued timed conditioning for consistent performance.`,
      },
      High: {
        status: `${studentFirstName} maintained structured execution under timed conditions.`,
        meaning: `${studentFirstName} can now sustain method integrity under pressure.`,
      },
      "High Maintenance": {
        status: `${studentFirstName} has repeatedly sustained structured execution under timed pressure.`,
        meaning: `${studentFirstName} is in maintenance mode and will continue with mixed practice to preserve transfer-ready stability.`,
      },
    },
  };

  const normalizePhaseLabel = (phase?: string | null): PhaseLabel | null => {
    if (!phase) return null;
    const normalized = phase.trim().toLowerCase();
    return PHASE_SEQUENCE.find((item) => item.toLowerCase() === normalized) || null;
  };

  const normalizeStabilityLabel = (stability?: string | null): StabilityLabel => {
    const value = String(stability || "").toLowerCase();
    if (value.includes("high maintenance")) return "High Maintenance";
    if (value.includes("high")) return "High";
    if (value.includes("medium")) return "Medium";
    return "Low";
  };

  const normalizedDiagnosisPhase =
    extractDiagnosisPhase() ||
    normalizePhaseLabel(topicConditioning.entryPhase) ||
    "Clarity";
  const normalizedStability = normalizeStabilityLabel(topicConditioning.stability);
  const trainingStartPhase = deriveTrainingEntryPhase(normalizedDiagnosisPhase, normalizedStability);

  const normalizedLiveTopicStates = Array.from(
    topicStates
      .filter((item) => String(item.topic || "").trim().length > 0)
      .reduce((map, item) => {
        const key = String(item.topic || "").trim().toLowerCase();
        const existing = map.get(key);

        if (!existing) {
          map.set(key, item);
          return map;
        }

        const existingDate = new Date(existing.lastUpdated || 0).getTime();
        const itemDate = new Date(item.lastUpdated || 0).getTime();

        if (itemDate >= existingDate) {
          map.set(key, item);
        }

        return map;
      }, new Map<string, ProposalTopicState>())
      .values()
  );

  const activeLiveTopicStates = normalizedLiveTopicStates.filter((item) => item.bucket === "active");
  const currentLiveTopicStates = activeLiveTopicStates.length > 0 ? activeLiveTopicStates : normalizedLiveTopicStates;
  const isLiveTrainingView = currentLiveTopicStates.length > 0;

  const formatTrainingStateSummary = (items: ProposalTopicState[]) => {
    const groups = Array.from(
      items.reduce((map, item) => {
        const phase = normalizePhaseLabel(item.phase) || "Unknown";
        const stability = item.stability ? normalizeStabilityLabel(item.stability) : null;
        const key = `${phase}__${stability}`;
        const existing = map.get(key) || { phase, stability, topics: [] as string[] };
        existing.topics.push(item.topic);
        map.set(key, existing);
        return map;
      }, new Map<string, { phase: string; stability: string | null; topics: string[] }>())
      .values()
    );

    return formatListWithAnd(
      groups.map((group) => `${group.phase} with ${group.stability || "Unknown"} stability in ${formatListWithAnd(group.topics)}`)
    );
  };

  const currentTopicNames = currentLiveTopicStates.map((item) => item.topic);
  const currentTopicSummary = formatListWithAnd(currentTopicNames);
  const liveTrainingStateSummary = formatTrainingStateSummary(currentLiveTopicStates);

  const getCurrentBreakdown = (phase: PhaseLabel) => {
    switch (phase) {
      case "Clarity":
        return `${studentFirstName} is still stabilizing recognition of what the question is asking and what structure belongs first.`;
      case "Structured Execution":
        return `${studentFirstName} can see the path, but still needs stronger independent execution without being carried through the method.`;
      case "Controlled Discomfort":
        return `${studentFirstName} is being pushed into harder or less familiar work and needs to hold structure when the question pushes back.`;
      case "Time Pressure Stability":
        return `${studentFirstName} is now training to preserve method and decision quality while pace pressure is introduced.`;
      default:
        return `${studentFirstName} needs more stable topic conditioning before the next pressure layer is added.`;
    }
  };

  const getLiveProgressSignals = (topic: string, phase: PhaseLabel, stability: StabilityLabel) => {
    const phaseSignals: Record<PhaseLabel, string[]> = {
      Clarity: [
        `Clearer recognition of what ${topic} questions are asking`,
        `Earlier correct method selection in ${topic}`,
      ],
      "Structured Execution": [
        `Earlier independent starts in ${topic}`,
        `More consistent step order in ${topic}`,
      ],
      "Controlled Discomfort": [
        `Calmer starts when ${topic} questions become unfamiliar`,
        `More stable structure in harder ${topic} work`,
      ],
      "Time Pressure Stability": [
        `Stronger structure while ${topic} work is timed`,
        `Fewer rushed breakdowns in ${topic}`,
      ],
    };

    const stabilitySignal =
      stability === "High" || stability === "High Maintenance"
        ? `Sustained consistency across repeated ${topic} sessions`
        : `Less volatility from one ${topic} session to the next`;

    return [...phaseSignals[phase], stabilitySignal];
  };

  const stateCopy = PARENT_STATE_ENGINE[trainingStartPhase][normalizedStability];
  const derivedObserved = [stateCopy.status, stateCopy.meaning];

  const observedResponse = [
    proposal.mathRelationship,
    proposal.pressureResponse,
    proposal.confidenceKillers,
    proposal.confidenceTriggers,
    proposal.immediateStruggles,
    proposal.gapsIdentified,
    ...derivedObserved,
  ]
    .filter(Boolean)
    .flatMap((item) => splitList(item));

  const expectedChanges = splitList(proposal.childWillWin);
  const diagnosisTopic = topicConditioning.topic || focusTopics[0] || "Current school topic";

  const getFocusAreaText = () => {
    const trainingPhase = trainingStartPhase;
    const diagnosisPhase = normalizedDiagnosisPhase;
    const stability = normalizedStability;
    const diagnosisContext = `Diagnosis result: ${diagnosisPhase} with ${stability} stability.`;

    switch (trainingPhase) {
      case "Clarity":
        return `${diagnosisContext} Training starts at Clarity to strengthen vocabulary precision, method recognition, and reason understanding.`;
      case "Structured Execution":
        return `${diagnosisContext} Training starts at Structured Execution because Clarity-level recognition is present and execution consistency now needs to be stabilized.`;
      case "Controlled Discomfort":
        return `${diagnosisContext} Training starts at Controlled Discomfort because baseline execution is present and ${studentFirstName} now needs stability when difficulty increases.`;
      case "Time Pressure Stability":
        return `${diagnosisContext} Training starts at Time Pressure Stability because method structure is present and ${studentFirstName} now needs to retain it under timed pressure.`;
      default:
        return `${diagnosisContext} Training starts in the current phase to stabilize response patterns before progression.`;
    }
  };

  const getFirstBreakdown = () => {
    switch (trainingStartPhase) {
      case "Clarity":
        return `${studentFirstName} is not yet consistently identifying what the question is asking or what structure to use first.`;
      case "Structured Execution":
        return `${studentFirstName} can begin work, but does not yet apply a stable method consistently without support.`;
      case "Controlled Discomfort":
        return `${studentFirstName} becomes less stable when the work feels unfamiliar or more difficult.`;
      case "Time Pressure Stability":
        return `${studentFirstName} loses structure when working under time pressure.`;
      default:
        return `${studentFirstName} needs more stability in the current topic before more pressure is added.`;
    }
  };

  const getFirstPriority = () => {
    switch (trainingStartPhase) {
      case "Clarity":
        return `We will first help ${studentFirstName} read problems more clearly, recognise what is being asked, and identify the structure before solving.`;
      case "Structured Execution":
        return `We will first train ${studentFirstName} to start earlier and follow a repeatable method without waiting to be carried through each step.`;
      case "Controlled Discomfort":
        return `We will first train ${studentFirstName} to stay calm and structured when questions become less familiar or more difficult.`;
      case "Time Pressure Stability":
        return `We will first train ${studentFirstName} to keep the same structure and decision-making even when time pressure increases.`;
      default:
        return `We will first strengthen ${studentFirstName}'s consistency inside the current topic.`;
    }
  };

  const progressSignals = expectedChanges.length > 0
    ? expectedChanges
    : [
        "Earlier independent starts",
        "Less hesitation when beginning problems",
        "More consistent method use",
        "Better calm under difficulty",
      ];

  const liveObservedResponse = Array.from(
    new Set(
      currentLiveTopicStates.flatMap((item) => {
        const phase = normalizePhaseLabel(item.phase);
        const stability = item.stability ? normalizeStabilityLabel(item.stability) : null;
        if (!phase || !stability) {
          return [`${item.topic} is active in training and the next scored session will confirm its current breakpoint more precisely.`];
        }

        const copy = PARENT_STATE_ENGINE[phase][stability];
        return [`In ${item.topic}, ${copy.status}`, `In ${item.topic}, ${copy.meaning}`];
      })
    )
  );

  const liveTrainingPath = Array.from(
    new Set(
      currentLiveTopicStates.flatMap((item) => {
        const phase = normalizePhaseLabel(item.phase);
        const stability = item.stability ? normalizeStabilityLabel(item.stability) : null;
        if (!phase || !stability) {
          return [`TT is using the next scored session to confirm the right operating point in ${item.topic}.`];
        }

        const copy = PARENT_STATE_ENGINE[phase][stability];
        return [`In ${item.topic}, ${copy.focus}`];
      })
    )
  );

  const liveProgressMarkers = Array.from(
    new Set(
      currentLiveTopicStates.flatMap((item) => {
        const phase = normalizePhaseLabel(item.phase);
        const stability = item.stability ? normalizeStabilityLabel(item.stability) : null;
        if (!phase || !stability) {
          return [`A scored session confirms the current phase and stability in ${item.topic}`];
        }

        return getLiveProgressSignals(item.topic, phase, stability);
      })
    )
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-2">Training Plan</h2>
        <p className="text-muted-foreground">
          {isLiveTrainingView ? `Live operating plan for ${studentName}` : `Structured plan for ${studentName}`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isLiveTrainingView ? "Current Training Context" : "Diagnosis Context"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLiveTrainingView ? (
            <p className="text-sm text-muted-foreground">
              TT is currently conditioning <span className="text-foreground font-medium">{currentTopicSummary}</span> based on the latest active topic-conditioning state.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Diagnosis ran on: <span className="text-foreground font-medium">{diagnosisTopic}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Focus Area</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground font-medium mb-2">
            {isLiveTrainingView ? `Training Is At: ${liveTrainingStateSummary}` : `Training Starts At: ${trainingStartPhase}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {isLiveTrainingView
              ? `TT is operating from ${studentFirstName}'s current breakpoint inside ${currentTopicSummary}. Current session decisions now follow the live topic-conditioning state rather than the original intro-only entry point.`
              : getFocusAreaText()}
          </p>
        </CardContent>
      </Card>

      {(isLiveTrainingView || normalizedStability === "Low" || normalizedStability === "Medium") && (
        <Card>
          <CardHeader>
            <CardTitle>Where {studentFirstName} Currently Gets Stuck</CardTitle>
          </CardHeader>
          <CardContent>
            {isLiveTrainingView ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentLiveTopicStates.map((item) => {
                  const phase = normalizePhaseLabel(item.phase);
                  return (
                    <li key={`${item.topic}-${item.phase}-${item.stability}`}>- In {item.topic}, {getCurrentBreakdown(phase || "Clarity")}</li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{getFirstBreakdown()}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What We Have Observed</CardTitle>
        </CardHeader>
        <CardContent>
          {(isLiveTrainingView ? liveObservedResponse : observedResponse).length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {(isLiveTrainingView ? liveObservedResponse : Array.from(new Set(observedResponse))).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isLiveTrainingView ? "Live topic-conditioning observations will appear here as the current state updates." : "Observed response patterns captured during intro session."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Path</CardTitle>
        </CardHeader>
        <CardContent>
          {isLiveTrainingView ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {liveTrainingPath.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{getFirstPriority()}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditioning Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Cadence: 2 sessions per week (8 sessions per month)</li>
            <li>- Clear explanation of the problem structure</li>
            <li>- Guided practice with immediate correction</li>
            <li>- Repeated method-building in the active topic-conditioning set</li>
            <li>- Gradual increase in difficulty when readiness improves</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How We Will Know It Is Improving</CardTitle>
        </CardHeader>
        <CardContent>
          {(isLiveTrainingView ? liveProgressMarkers : progressSignals).length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {(isLiveTrainingView ? liveProgressMarkers : progressSignals).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          ) : (
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Earlier independent starts</li>
              <li>- Reduced hesitation</li>
              <li>- More consistent step execution</li>
              <li>- Improved stability under difficulty</li>
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-2">Parent Alignment</h3>
          <p className="text-sm text-muted-foreground">
            {isLiveTrainingView
              ? `This training plan now reflects ${studentFirstName}'s live topic-conditioning state. TT is working from the current breakpoint in ${currentTopicSummary}, and the plan updates its meaning from that active state.`
              : `This training focuses on how ${studentFirstName} responds when work becomes difficult.
            The goal is to build structured thinking, independent execution, and stability
            under pressure.`}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Progress is measured through behavior and response, not only marks.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commitment</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Cadence is fixed: 2 sessions weekly (8 sessions monthly)</li>
            <li>- Consistent sessions are required</li>
            <li>- Student is expected to attempt before receiving guidance</li>
            <li>- Discomfort during learning is part of the process</li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      {showActions && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-3 text-center">Ready to Begin?</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Accept this program to move forward with {studentName}'s training
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onDecline}
                disabled={isProcessing}
                className="w-full sm:flex-1 gap-2"
                size="lg"
              >
                <X className="w-4 h-4" />
                Decline
              </Button>
              <Button
                onClick={onAccept}
                disabled={isProcessing}
                className="w-full sm:flex-1 gap-2"
                size="lg"
              >
                <Check className="w-4 h-4" />
                {isProcessing ? "Processing..." : "Accept Program"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
