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

  const extractEntryPoint = (): string => {
    const justification = proposal.justification || "";
    const match = justification.match(/sequence:\s*([^,\.]+)\s*first/i);
    if (match?.[1]) return match[1].trim();

    const immediate = (proposal.immediateStruggles || "").toLowerCase();
    if (immediate.includes("vocabulary") || immediate.includes("reason")) return "Clarity";
    if (immediate.includes("method") || immediate.includes("skip") || immediate.includes("tutor")) {
      return "Structured Execution";
    }
    if (immediate.includes("freeze")) return "Controlled Discomfort";
    if (immediate.includes("rush") || immediate.includes("time")) return "Time Pressure Stability";
    return "Structured Execution";
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
  const observedResponse = [
    proposal.mathRelationship,
    proposal.pressureResponse,
    proposal.confidenceKillers,
    proposal.confidenceTriggers,
  ]
    .filter(Boolean)
    .flatMap((item) => splitList(item));

  const expectedChanges = splitList(proposal.childWillWin);
  const entryPoint = extractEntryPoint();
  const topicConditioning = extractTopicConditioning();
  const focusArea = topicConditioning.topic || focusTopics[0] || "Current school topic";

  const getFirstBreakdown = () => {
    switch (topicConditioning.entryPhase || entryPoint) {
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
    switch (topicConditioning.entryPhase || entryPoint) {
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
          <CardTitle>Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We will start in <span className="text-foreground font-medium">{focusArea}</span>. It gives us the clearest view of how {studentFirstName} responds when the work pushes back.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where {studentFirstName} Currently Gets Stuck</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{getFirstBreakdown()}</p>
        </CardContent>
      </Card>

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
            This training focuses on how your child responds when work becomes difficult.
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
