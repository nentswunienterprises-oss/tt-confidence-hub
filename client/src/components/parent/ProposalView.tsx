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
  const tutorName = proposal.tutor?.name || "Your Tutor";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Response Development Plan
        </h2>
        <p className="text-muted-foreground">
          A comprehensive plan designed specifically for {studentName}'s success
        </p>
      </div>

      {/* Tutor Introduction */}
      {proposal.tutor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Your Assigned Tutor</span>
              <Badge variant="outline">{tutorName}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposal.tutor.bio && (
              <p className="text-sm text-muted-foreground">{proposal.tutor.bio}</p>
            )}
            <div className="flex gap-4 text-sm">
              {proposal.tutor.email && (
                <div>📧 {proposal.tutor.email}</div>
              )}
              {proposal.tutor.phone && (
                <div>📱 {proposal.tutor.phone}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identity Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Emotional Map & Confidence Blueprint</CardTitle>
          <p className="text-sm text-muted-foreground">
            Understanding {studentName}'s unique learning identity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposal.primaryIdentity && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Primary Identity Detected</h4>
              <p className="text-muted-foreground">{proposal.primaryIdentity}</p>
            </div>
          )}
          {proposal.mathRelationship && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Relationship With Math</h4>
              <p className="text-muted-foreground">{proposal.mathRelationship}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {proposal.confidenceTriggers && (
              <div>
                <h4 className="font-semibold text-sm mb-1 text-green-600">Confidence Triggers</h4>
                <p className="text-sm text-muted-foreground">{proposal.confidenceTriggers}</p>
              </div>
            )}
            {proposal.confidenceKillers && (
              <div>
                <h4 className="font-semibold text-sm mb-1 text-red-600">Confidence Killers</h4>
                <p className="text-sm text-muted-foreground">{proposal.confidenceKillers}</p>
              </div>
            )}
          </div>
          {proposal.pressureResponse && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Response to Pressure</h4>
              <p className="text-muted-foreground">{proposal.pressureResponse}</p>
            </div>
          )}
          {proposal.growthDrivers && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Growth Drivers</h4>
              <p className="text-muted-foreground">{proposal.growthDrivers}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Diagnosis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Current standing and areas for growth
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposal.currentTopics && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Current Topics</h4>
              <p className="text-muted-foreground">{proposal.currentTopics}</p>
            </div>
          )}
          {proposal.immediateStruggles && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Immediate Struggles</h4>
              <p className="text-muted-foreground">{proposal.immediateStruggles}</p>
            </div>
          )}
          {proposal.gapsIdentified && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Gaps Identified</h4>
              <p className="text-muted-foreground">{proposal.gapsIdentified}</p>
            </div>
          )}
          {proposal.tutorNotes && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Tutor Observations</h4>
              <p className="text-sm text-muted-foreground italic">{proposal.tutorNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identity Sheet - The Heart */}
      {(proposal.futureIdentity || proposal.wantToRemembered || proposal.hiddenMotivations || proposal.internalConflict) && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Identity Sheet</span>
              <Badge>Psychological Anchor</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The deeper "why" behind {studentName}'s learning journey
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.futureIdentity && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Who {studentName} Wants To Be</h4>
                <p className="text-muted-foreground">{proposal.futureIdentity}</p>
              </div>
            )}
            {proposal.wantToRemembered && (
              <div>
                <h4 className="font-semibold text-sm mb-1">How {studentName} Wants To Be Remembered</h4>
                <p className="text-muted-foreground">{proposal.wantToRemembered}</p>
              </div>
            )}
            {proposal.hiddenMotivations && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Hidden Motivations</h4>
                <p className="text-muted-foreground">{proposal.hiddenMotivations}</p>
              </div>
            )}
            {proposal.internalConflict && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Internal Conflict</h4>
                <p className="text-muted-foreground">{proposal.internalConflict}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Recommended Plan */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-xl">TT Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message */}
          <div className="space-y-3">
            <p className="text-base font-medium">
              Based on the assessment, Territorial Tutoring recommends <strong>Premium Response Training</strong>.
            </p>
            <p className="text-muted-foreground">
              This program focuses on building stable problem-solving responses under pressure through structured repetition.
            </p>
          </div>

          {/* What's Included */}
          <div>
            <h4 className="font-semibold mb-3">What's Included</h4>
            <div className="space-y-2">
              {[
                "Weekly 1-on-1 session",
                "Response-first problem training",
                "Monthly pressure simulation",
                "Neutral progress reporting"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Not Included */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What is not included</h4>
            <p className="text-sm text-muted-foreground">
              Motivation, encouragement, or emotional coaching.
            </p>
          </div>

          {/* Note */}
          <div className="text-xs text-muted-foreground italic text-center border-t pt-4">
            No psychology theatre, no identity probing, no motivational leakage.
          </div>
        </CardContent>
      </Card>

      {/* Next Steps CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-2">What Happens Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Review this proposal at your own pace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Begin your child's response training journey</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Accept/Decline Actions */}
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
