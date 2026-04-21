import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sessionRules = [
  "Intro is for placement verification, not teaching volume.",
  "Use one phase verification block at a time.",
  "Let the score band decide whether to move up, move down, or stop.",
  "Do not turn the intro into a full training lesson.",
];

const scoreBands = [
  { range: "0-44", meaning: "Too weak for this phase. De-escalate and verify the earlier phase." },
  { range: "45-79", meaning: "This phase is the match. Place here and stop diagnosis." },
  { range: "80-100", meaning: "Too strong for this phase. Escalate and verify the next phase." },
];

const sessionFlow = [
  "Review the recommended starting phase and the parent signal before the session begins.",
  "Choose one topic that represents the student's real friction point.",
  "Run the verification block for the starting phase only.",
  "Score that phase block out of 100.",
  "Move up, move down, or stop based on the score band.",
  "End the intro as soon as the correct entry point is found.",
];

const tutorWatchpoints = [
  "The student may be clear in a topic but unstable when working alone.",
  "The student may execute calmly until discomfort appears.",
  "The student may stay stable until a timer is introduced.",
  "A high score does not mean the session should become training. It means verify the next phase.",
];

export default function ResponseConditioningIntroSessionStructure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/responseconditioningsystem")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Response Conditioning System
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Intro Session Structure
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4 border-2 border-primary/20 bg-primary/5">
          <h2 className="text-2xl font-bold">What Intro Is Now</h2>
          <p className="text-muted-foreground">
            The intro session is now an adaptive placement session. Its job is to verify the
            student's starting phase, not to run a full teaching cycle.
          </p>
          <p className="font-medium">The intro session must answer one question:</p>
          <p className="text-lg font-semibold">
            Where should this student's training begin in this topic?
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Primary Purpose</h2>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            <li>Verify the student's entry phase in a real topic.</li>
            <li>Confirm whether the recommended starting phase is too low, correct, or too high.</li>
            <li>Lock the entry point with the least friction possible.</li>
          </ul>
          <p className="font-semibold">Intro is diagnostic verification, not intensive teaching.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">What The Tutor Brings In</h2>
          <p className="text-muted-foreground">
            The tutor does not start from a blank slate anymore. The tutor starts with:
          </p>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            <li>parent-reported topic friction</li>
            <li>parent-reported response symptoms</li>
            <li>system-recommended starting phase</li>
          </ul>
          <p className="font-medium">
            That recommendation is a starting hypothesis, not the final answer.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Live Intro Flow</h2>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {sessionFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Score Bands</h2>
          <p className="text-muted-foreground">
            Each phase verification block resolves to a score out of 100. That score decides the next move.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {scoreBands.map((band) => (
              <div key={band.range} className="rounded-xl border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Band</p>
                <p className="mt-2 text-xl font-semibold">{band.range}</p>
                <p className="mt-2 text-sm text-muted-foreground">{band.meaning}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">What The Tutor Must Not Do</h2>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            {sessionRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">How To Think About Phase vs Concept</h2>
          <p className="text-muted-foreground">
            The intro is deciding the student's <span className="font-medium text-foreground">phase</span>, not
            just identifying a weak concept explanation.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border p-4">
              <p className="font-semibold">Phase</p>
              <p className="text-sm text-muted-foreground">
                The response stage where the student breaks: Clarity, Structured Execution,
                Controlled Discomfort, or Time Pressure Stability.
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">Concept Lens</p>
              <p className="text-sm text-muted-foreground">
                Vocabulary, method, and reason. This lens helps the tutor understand the concept work
                inside a problem, but it is not the same thing as the placement phase.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Tutor Watchpoints</h2>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            {tutorWatchpoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">Intro Outcome</h2>
          <p className="font-medium">By the end of intro, the system should know:</p>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            <li>the topic used for verification</li>
            <li>the student's entry phase in that topic</li>
            <li>the student's starting stability in that phase</li>
          </ul>
          <p className="font-semibold">
            Once the entry point is locked, intro stops and active training begins later.
          </p>
        </Card>
      </div>
    </div>
  );
}
