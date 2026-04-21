import { useNavigate } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sessionTypes = [
  {
    title: "Adaptive Intro Diagnosis",
    purpose: "Verify starting phase and stop when placement is found.",
    notFor: "Do not turn this into a full teaching session.",
  },
  {
    title: "Active Training",
    purpose: "Build stability inside the student's current topic and phase.",
    notFor: "Do not use training flow to re-place the student every session.",
  },
  {
    title: "Tutor Handover Verification",
    purpose: "Verify inherited topic-state after tutor reassignment.",
    notFor: "Do not treat this like a fresh intro or a reset.",
  },
];

const activeTrainingFlow = [
  "Prepare using the student's current topic-state and recent evidence.",
  "Model only what the student needs next.",
  "Let the student apply independently.",
  "Guide tightly where the response breaks.",
  "Use challenge work only when the student's current phase allows it.",
];

const introFlow = [
  "Start from the recommended phase.",
  "Run one verification block.",
  "Score the block.",
  "Escalate, de-escalate, or stop.",
];

const handoverFlow = [
  "Review inherited topic, phase, and stability.",
  "Run the continuity check.",
  "Verify whether the carry-over state still holds.",
  "Either continue, adjust, or trigger more targeted verification.",
];

const guardrails = [
  "Model -> Apply -> Guide is not a universal law for every TT session type.",
  "Boss Battles are not used in every training drill and not used in every session type.",
  "Timed pressure belongs only when the student's phase and current drill design support it.",
  "Verification sessions should stay light. Training sessions can be more developmental.",
];

export default function ResponseConditioningSessionFlowControl() {
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
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Session Flow Control
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4 border-2 border-primary/20 bg-primary/5">
          <h2 className="text-2xl font-bold">Start With Session Type</h2>
          <p className="text-muted-foreground">
            Session flow is no longer one universal loop. The first question is always:
          </p>
          <p className="text-lg font-semibold">What kind of session is this?</p>
          <p className="text-muted-foreground">
            Once that is clear, the correct flow becomes obvious.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Three Live Session Types</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sessionTypes.map((session) => (
              <div key={session.title} className="rounded-xl border bg-card p-4 space-y-2">
                <h3 className="text-lg font-semibold">{session.title}</h3>
                <p className="text-sm text-muted-foreground">{session.purpose}</p>
                <p className="text-sm font-medium">{session.notFor}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Adaptive Intro Diagnosis Flow</h2>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {introFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <p className="font-semibold">
            Intro is verification. It should end when placement is found.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Active Training Flow</h2>
          <p className="text-muted-foreground">
            This is where the tutor uses teaching structure more fully. Even here, the tutor must
            still respect the student's current phase and the drill's actual design.
          </p>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {activeTrainingFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <p className="font-semibold">
            `Model -> Apply -> Guide` is a training tool, not a universal session law.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Tutor Handover Verification Flow</h2>
          <p className="text-muted-foreground">
            When a tutor is reassigned, the system should preserve continuity. The new tutor verifies
            inherited state before normal training resumes.
          </p>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {handoverFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <p className="font-semibold">Handover is verification, not re-onboarding.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Guardrails</h2>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            {guardrails.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Simple Tutor Mental Model</h2>
          <div className="space-y-3">
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is intro:</p>
              <p className="text-sm text-muted-foreground">verify starting phase</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is active training:</p>
              <p className="text-sm text-muted-foreground">build stability inside the current phase</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is handover:</p>
              <p className="text-sm text-muted-foreground">verify inherited state and continue</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">Operational Standard</h2>
          <p className="text-muted-foreground">
            Tutors should not memorize one dramatic universal flow. Tutors should identify the
            session type, respect that session's purpose, and execute the correct evidence path.
          </p>
          <p className="font-semibold">
            The cleaner the session purpose, the cleaner the tutor execution.
          </p>
        </Card>
      </div>
    </div>
  );
}
