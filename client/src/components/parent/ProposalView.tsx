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

  const focusTopics = splitList(proposal.currentTopics);
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
  const trainingPath = [
    `Build ${entryPoint.toLowerCase()} first through structured repetition`,
    "Reinforce method through immediate execution and layer correction",
    "Introduce controlled difficulty once execution becomes stable",
    "Progress to timed pressure only after structured stability",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-2">TT Training Plan</h2>
        <p className="text-muted-foreground">
          Structured response-conditioning plan for {studentName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Focus Topic</CardTitle>
        </CardHeader>
        <CardContent>
          {focusTopics.length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {focusTopics.map((topic) => (
                <li key={topic}>- {topic}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Current focus topic selected during onboarding diagnostic.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observed Response</CardTitle>
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
          <CardTitle>Entry Point</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>{entryPoint}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Path</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            {trainingPath.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditioning Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Cadence: 2 sessions per week (8 sessions per month)</li>
            <li>- Clarity</li>
            <li>- Structured execution</li>
            <li>- Layer correction</li>
            <li>- Controlled difficulty (when ready)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected Behavioral Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {expectedChanges.length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {expectedChanges.map((item) => (
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onDecline}
                disabled={isProcessing}
                className="flex-1 gap-2"
                size="lg"
              >
                <X className="w-4 h-4" />
                Decline
              </Button>
              <Button
                onClick={onAccept}
                disabled={isProcessing}
                className="flex-1 gap-2"
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
