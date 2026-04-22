import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sessionContexts = [
  {
    title: "Intro",
    purpose: "The session exists to place topic-entry state. This is where the system determines where a topic should begin.",
    defaultDrill: "Diagnosis only",
    notFor: "Do not treat intro as normal training. You are placing, not training.",
  },
  {
    title: "Active Training",
    purpose: "The session exists to train the student's current topics using the system-selected drill for the current phase and state.",
    defaultDrill: "Training by default, diagnosis only when a newly activated topic needs entry placement",
    notFor: "Do not re-place existing topics every session. Do not pick drills from tutor instinct.",
  },
  {
    title: "Tutor Handover Verification",
    purpose: "The session exists to verify inherited topic-state after tutor replacement so training can continue cleanly.",
    defaultDrill: "Verification only",
    notFor: "Do not treat handover like a fresh intro and do not jump straight into normal training without verification.",
  },
];

const drillTypes = [
  {
    title: "Diagnosis",
    purpose: "Use diagnosis when a topic needs entry placement.",
    usage: "This is the drill type used in intro and whenever a newly activated topic appears during active training.",
  },
  {
    title: "Training",
    purpose: "Use training drills when the topic has already been placed and the system is conditioning performance.",
    usage: "This is the default drill type inside active training.",
  },
  {
    title: "Verification",
    purpose: "Use verification when the system needs to confirm that inherited topic-state is still trustworthy.",
    usage: "This is the drill type used in tutor handover.",
  },
];

const activeTrainingFlow = [
  "The system identifies the current topic, phase, and stability.",
  "The system selects the training drill for that state.",
  "The tutor runs the drill exactly as written.",
  "The tutor records only what the student actually does.",
  "If a new topic is activated, that topic may need diagnosis before training continues on it.",
  "The system uses the observations to determine the next step.",
];

const introFlow = [
  "Identify the topic that is entering the system.",
  "Start from the recommended entry point.",
  "Run one diagnosis block.",
  "Score the block.",
  "Escalate, de-escalate, or stop when placement is clear.",
];

const verificationFlow = [
  "Review inherited topic, phase, and stability.",
  "Run the verification block.",
  "Verify whether the carry-over state still holds.",
  "Either continue, adjust, or trigger more targeted verification.",
];

const phaseTrainingNotes = [
  {
    title: "Clarity training",
    detail:
      "Clarity is where vocabulary, method, reason, and the main Model -> Apply -> Guide teaching loop are most visible. This is the training phase where teaching structure is most explicit.",
  },
  {
    title: "Execution phases",
    detail:
      "Structured Execution, Controlled Discomfort, and Time Pressure Stability are training phases. Here the tutor is mainly running the drill conditions, holding the rules, and logging what happens.",
  },
];

const guardrails = [
  "Session context and drill type are not the same thing.",
  "Diagnosis is topic-entry placement, not general training.",
  "Intro uses diagnosis because intro is for placement.",
  "Handover uses verification because handover is for trust-checking inherited state.",
  "Active training mainly uses training drills, but a newly activated topic may still need diagnosis.",
  "The system chooses the drill. The tutor does not pick drills from preference or instinct.",
  "Model -> Apply -> Guide is mainly a Clarity training structure, not a universal law for every phase.",
  "Boss Battles are not used in every training drill and not used in every drill type.",
  "Timed pressure belongs only when the current phase and drill design require it.",
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
                Session Context and Drill Flow
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4 border-2 border-primary/20 bg-primary/5">
          <h2 className="text-2xl font-bold">Start With Session Context</h2>
          <p className="text-muted-foreground">
            The first question is always:
          </p>
          <p className="text-lg font-semibold">What session context is this?</p>
          <p className="text-muted-foreground">
            Session context tells you why the session exists. Drill type tells you what procedure you run inside that session.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Core Distinction</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h3 className="text-lg font-semibold">Session Context</h3>
              <p className="text-sm text-muted-foreground">
                Session context answers: what is this session for?
              </p>
              <p className="text-sm text-muted-foreground">
                The three session contexts are Intro, Active Training, and Tutor Handover Verification.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h3 className="text-lg font-semibold">Drill Type</h3>
              <p className="text-sm text-muted-foreground">
                Drill type answers: what procedure am I running right now?
              </p>
              <p className="text-sm text-muted-foreground">
                The three drill types are Diagnosis, Training, and Verification.
              </p>
            </div>
          </div>
          <p className="font-semibold">
            Simple rule: session context sets the purpose. Drill type serves that purpose.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Three Core Session Contexts</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sessionContexts.map((context) => (
              <div key={context.title} className="rounded-xl border bg-card p-4 space-y-2">
                <h3 className="text-lg font-semibold">{context.title}</h3>
                <p className="text-sm text-muted-foreground">{context.purpose}</p>
                <p className="text-sm font-medium">{context.defaultDrill}</p>
                <p className="text-sm font-medium">{context.notFor}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Three Drill Types</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {drillTypes.map((drill) => (
              <div key={drill.title} className="rounded-xl border bg-card p-4 space-y-2">
                <h3 className="text-lg font-semibold">{drill.title}</h3>
                <p className="text-sm text-muted-foreground">{drill.purpose}</p>
                <p className="text-sm font-medium">{drill.usage}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">How They Work Together</h2>
          <div className="space-y-3">
            <div className="rounded-xl border p-4">
              <p className="font-semibold">Intro session</p>
              <p className="text-sm text-muted-foreground">
                Purpose: place topic-entry state. Drill type: diagnosis. This session is for placement, not training.
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">Tutor handover verification session</p>
              <p className="text-sm text-muted-foreground">
                Purpose: verify inherited state after tutor replacement. Drill type: verification. This session is for trust-checking, not fresh placement and not normal training.
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">Active training session</p>
              <p className="text-sm text-muted-foreground">
                Purpose: train current topics. Drill type: training by default. If a new topic is activated during training, that new topic may still require diagnosis for entry placement.
              </p>
            </div>
          </div>
          <p className="font-semibold">
            Diagnosis can appear inside active training when a newly activated topic needs entry placement, but that does not turn the whole session into an intro session.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Diagnosis Flow</h2>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {introFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <p className="font-semibold">
            Diagnosis is topic-entry placement. In intro, diagnosis is the whole session. During active training, diagnosis is only used when a newly activated topic needs entry placement.
          </p>
          <p className="text-sm text-muted-foreground">
            See <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/intro-session-structure">Intro Session Structure</Link> and{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/logging-system">Logging System</Link>.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Active Training Flow</h2>
          <p className="text-muted-foreground">
            Active training is system-led. The tutor is executing the training drill that the system has already chosen.
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
          <h2 className="text-2xl font-bold">Training Phase Still Matters</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {phaseTrainingNotes.map((note) => (
              <div key={note.title} className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{note.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Phase is a training variable, not a session-context variable. The tutor should not read every phase through the Clarity teaching lens. Once Clarity is locked, the later phases are mainly execution conditioning.
          </p>
          <p className="text-sm text-muted-foreground">
            See <Link className="underline underline-offset-2" to="/responseconditioningsystem/clarity">Clarity</Link>,{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/structured-execution">Structured Execution</Link>,{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/controlled-discomfort">Controlled Discomfort</Link>, and{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/time-pressure-stability">Time Pressure Stability</Link>.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Verification Flow</h2>
          <p className="text-muted-foreground">
            When a tutor is reassigned, the system should preserve continuity. The new tutor verifies inherited state before normal training resumes.
          </p>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            {verificationFlow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <p className="font-semibold">Handover is verification, not re-onboarding and not normal training.</p>
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
              <p className="text-sm text-muted-foreground">place topic-entry state, so run diagnosis and do not treat the session as training</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is active training:</p>
              <p className="text-sm text-muted-foreground">run the system-selected training drill and record observations; if a new topic appears, that topic may need diagnosis</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-semibold">If this is handover:</p>
              <p className="text-sm text-muted-foreground">verify inherited state after tutor replacement, then continue only when the carry-over state is trustworthy</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">Operational Standard</h2>
          <p className="text-muted-foreground">
            Tutors should identify the session context first, then run the drill type that serves that context.
          </p>
          <p className="font-semibold">
            Extreme clarity comes from keeping purpose and procedure separate: session context defines why the session exists, and drill type defines what is run.
          </p>
        </Card>
      </div>
    </div>
  );
}
