import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sessionTypes = [
  {
    title: "Adaptive Intro Diagnosis",
    purpose: "This is how the training journey begins. The system verifies starting phase and stops when placement is found.",
    notFor: "Do not turn this into a teaching session.",
  },
  {
    title: "Active Training",
    purpose: "The system runs a drill matched to the student's current topic, phase, and stability. The tutor prepares exactly what the drill requires and records observations.",
    notFor: "Do not choose drills from tutor judgment. Do not re-place the student every session.",
  },
  {
    title: "Tutor Handover Verification",
    purpose: "This is what happens if a tutor is replaced and a new tutor is assigned. The system verifies inherited topic-state before training continues.",
    notFor: "Do not treat this like a fresh intro or a reset.",
  },
];

const activeTrainingFlow = [
  "The system selects the drill based on the student's topic, phase, and stability.",
  "The tutor reviews the session instructions and prepares the required problem type and count.",
  "The tutor runs the drill exactly as written.",
  "The tutor records only what the student actually does.",
  "The system uses those observations to determine the next step.",
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

const phaseTrainingNotes = [
  {
    title: "Clarity training",
    detail:
      "Clarity is where vocabulary, method, reason, and the main MAG-style teaching loop are most visible. This is the phase where teaching structure is most explicit.",
  },
  {
    title: "Execution phases",
    detail:
      "Structured Execution, Controlled Discomfort, and Time Pressure Stability are execution training phases. The tutor is mainly running the drill conditions, holding the rules, and logging what happens.",
  },
];

const guardrails = [
  "The system chooses the drill. The tutor does not pick drills from preference or instinct.",
  "Model -> Apply -> Guide is mainly a Clarity teaching structure, not a universal law for every phase.",
  "Boss Battles are not used in every training drill and not used in every session type.",
  "Timed pressure belongs only when the current phase and drill design require it.",
  "Verification sessions stay light. Training sessions follow the drill rules for that phase.",
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
            The first question is always:
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
          <p className="text-sm text-muted-foreground">
            See <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/intro-session-structure">Intro Session Structure</Link> and{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/logging-system">Logging System</Link>.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Active Training Flow</h2>
          <p className="text-muted-foreground">
            Active training is system-led. The tutor is executing the drill that the system has already chosen.
          </p>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {activeTrainingFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">How Training Differs By Phase</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {phaseTrainingNotes.map((note) => (
              <div key={note.title} className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{note.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            The tutor should not read every phase through the Clarity teaching lens. Once Clarity is locked,
            the later phases are mainly execution conditioning.
          </p>
          <p className="text-sm text-muted-foreground">
            See <Link className="underline underline-offset-2" to="/responseconditioningsystem/clarity">Clarity</Link>,{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/structured-execution">Structured Execution</Link>,{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/controlled-discomfort">Controlled Discomfort</Link>, and{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/time-pressure-stability">Time Pressure Stability</Link>.
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
          <p className="text-sm text-muted-foreground">
            See <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/handover-verification">Handover Verification</Link> and{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/logging-system">Logging System</Link>.
          </p>
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
              <p className="text-sm text-muted-foreground">this is how the training journey begins, so verify starting phase</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is active training:</p>
              <p className="text-sm text-muted-foreground">run the system-selected drill and record observations</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is handover:</p>
              <p className="text-sm text-muted-foreground">this is what happens after tutor replacement, so verify inherited state and continue</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">Operational Standard</h2>
          <p className="text-muted-foreground">
            Tutors should identify the session type, respect that session's purpose, and execute the
            system path already defined for that student.
          </p>
          <p className="font-semibold">
            The cleaner the session purpose, the cleaner the tutor execution.
          </p>
        </Card>
      </div>
    </div>
  );
}
