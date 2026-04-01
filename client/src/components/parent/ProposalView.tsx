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

interface ProposalViewProps {
  proposal: ProposalData;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  isProcessing?: boolean;
}

export default function ProposalView({ 
  proposal, 
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
  const STABILITY_SEQUENCE = ["Low", "Medium", "High"] as const;
  type PhaseLabel = (typeof PHASE_SEQUENCE)[number];
  type StabilityLabel = (typeof STABILITY_SEQUENCE)[number];

  const UNKNOWN_STATE_COPY = {
    status: `${studentFirstName}'s diagnosis topic has been identified, but the phase label is not yet confirmed here.`,
    meaning: `TT has the topic in scope, but the phase and stability fields need a confirmed scored label before this view can describe them precisely.`,
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
    },
  };

  const normalizePhaseLabel = (phase?: string | null): PhaseLabel | null => {
    if (!phase) return null;
    const normalized = phase.trim().toLowerCase();
    return PHASE_SEQUENCE.find((item) => item.toLowerCase() === normalized) || null;
  };

  const normalizeStabilityLabel = (stability?: string | null): StabilityLabel | null => {
    const value = String(stability || "").toLowerCase();
    if (value.includes("high")) return "High";
    if (value.includes("medium")) return "Medium";
    if (value.includes("low")) return "Low";
    return null;
  };

  const normalizedDiagnosisPhase =
    extractDiagnosisPhase() ||
    normalizePhaseLabel(topicConditioning.entryPhase);
  const normalizedStability = normalizeStabilityLabel(topicConditioning.stability);
  const trainingStartPhase = normalizedDiagnosisPhase;

  const stateCopy =
    trainingStartPhase && normalizedStability
      ? PARENT_STATE_ENGINE[trainingStartPhase][normalizedStability]
      : UNKNOWN_STATE_COPY;
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

    if (!diagnosisPhase || !stability) {
      return `The diagnosis topic has been identified, but the scored phase and stability labels are not yet available in this view. Training begins from the confirmed diagnosed phase once that label is present.`;
    }

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
    if (!trainingStartPhase) {
      return `${studentFirstName} needs a confirmed phase label before this view can describe the first breakdown precisely.`;
    }

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
    if (!trainingStartPhase) {
      return `We will use the confirmed diagnosis result to anchor the first training priority for ${studentFirstName}.`;
    }

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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-2">Training Plan</h2>
        <p className="text-muted-foreground">
          Structured plan for {studentName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnosis Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Diagnosis ran on: <span className="text-foreground font-medium">{diagnosisTopic}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Focus Area</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground font-medium mb-2">
            Training Starts At: {trainingStartPhase || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">
            {getFocusAreaText()}
          </p>
        </CardContent>
      </Card>

      {normalizedStability !== "High" && (
        <Card>
          <CardHeader>
            <CardTitle>Where {studentFirstName} Currently Gets Stuck</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{getFirstBreakdown()}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What We Have Observed</CardTitle>
        </CardHeader>
        <CardContent>
          {observedResponse.length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {Array.from(new Set(observedResponse)).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Observed response patterns captured during intro session.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Path</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{getFirstPriority()}</p>
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
            <li>- Repeated method-building in the same topic</li>
            <li>- Gradual increase in difficulty when readiness improves</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How We Will Know It Is Improving</CardTitle>
        </CardHeader>
        <CardContent>
          {progressSignals.length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {progressSignals.map((item) => (
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
            This training focuses on how {studentFirstName} responds when work becomes difficult.
            The goal is to build structured thinking, independent execution, and stability
            under pressure.
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
