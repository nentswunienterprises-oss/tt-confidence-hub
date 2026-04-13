import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const trainingSets = [
  {
    name: "Structure Under Timer",
    reps: "3 reps",
    purpose: "Build structured execution under a timer with method still prioritized over speed.",
    instruction: "Focus on method, not speed.",
    rules: [
      "Timer active.",
      "Method priority, not speed.",
      "Structure must be maintained throughout.",
    ],
  },
  {
    name: "Repeated Timed Execution",
    reps: "3 reps",
    purpose: "Build consistency under repeated timed attempts using the same time constraint.",
    instruction: "Repeat under timer.",
    rules: [
      "Same timer constraint.",
      "Build consistency, not just completion.",
      "Observe pace regulation.",
    ],
  },
  {
    name: "Full Constraint",
    reps: "3 reps",
    purpose: "Tighter timed exposure where structure and completion integrity are both tested.",
    instruction: "Solve under tighter time.",
    rules: [
      "Tighter timer.",
      "Full constraint with no relief.",
      "Structure and completion both required.",
    ],
  },
];

const diagnosisSets = [
  {
    name: "Light Timer",
    reps: "3 reps",
    purpose: "Tests structure and start behavior under first timer exposure.",
    instruction: "Solve under short timer.",
    rules: [
      "Timer is active.",
      "Observe structure, not just speed.",
      "Record panic versus controlled response.",
    ],
  },
  {
    name: "Consistency",
    reps: "3 reps",
    purpose: "Tests whether structure holds across repeated timed attempts or drifts.",
    instruction: "Repeat under the same time constraint.",
    rules: [
      "Same timer each rep.",
      "Observe drift and consistency.",
      "Behavioral pattern matters, not just completion.",
    ],
  },
];

const observationSignals = [
  "Start under time: freeze, delayed, or immediate?",
  "Structure under time: breaks, partial, or maintained?",
  "Pace control: panic, rushed, or controlled?",
  "Completion integrity: fails, partial, or complete under the timer?",
];

const progressionBands = [
  "Low: run Time Pressure Stability drill. Do not push speed aggressively.",
  "Medium: continue timed conditioning without sacrificing method discipline.",
  "High: run High Maintenance checks. Do not declare transfer yet. Confirm sustained timed stability.",
  "High Maintenance: remain in maintenance and begin cross-topic transfer rather than phase advancement.",
];

const auditChecks = [
  "A real timer was used and maintained across reps.",
  "Tutor prioritized structure over speed.",
  "Tutor did not rush the student or ignore structure breakdowns.",
  "Repeated timed attempts were executed and logged honestly.",
];

const criticalFails = [
  "No real timer was used.",
  "Tutor pushes speed over method.",
  "Structure collapse is ignored or cleaned up in the log.",
];

export default function ResponseConditioningTimePressureStability() {
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Time Pressure Stability
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                Timed conditioning as an exact algorithmic phase, not a motivational push
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Phase Function in the Engine</h2>
          <p className="text-muted-foreground">
            Time Pressure Stability exists to maintain method structure under urgency. The system
            does not treat speed as the target. Structure is the target. Time pressure only reveals
            whether the structure holds.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Method over speed.</li>
            <li>Timer is active.</li>
            <li>Structured response required. No panic tolerance.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Unified Protocol</h2>
          <p className="text-muted-foreground">
            This phase is the timed extension of the same conditioning engine. It does not replace
            the earlier phases. It exposes whether Clarity, Structured Execution, and Controlled
            Discomfort were real.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Purpose of phase: preserve structure when urgency rises.</li>
            <li>Primary action in the engine: run Time Pressure Stability drill.</li>
            <li>Allowed emphasis: process under time, not hustle rhetoric.</li>
            <li>Expected outcome: stable starts, maintained method, controlled pace, intact completion.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Diagnosis Structure</h2>
          <p className="text-muted-foreground">
            Diagnosis comes first in the intro session. It checks whether the timer itself changes
            the student's behavior and whether that pattern stays stable across repeated reps.
          </p>
          <div className="space-y-4">
            {diagnosisSets.map((set) => (
              <div key={set.name} className="rounded-lg border p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{set.name}</h3>
                  <p className="text-sm text-muted-foreground">{set.reps}</p>
                </div>
                <p className="text-muted-foreground">{set.purpose}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Rep instruction:</span>{" "}
                  {set.instruction}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {set.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Training Drill Structure</h2>
          <p className="text-muted-foreground">
            Once diagnosis shows that time pressure is the live instability, ongoing sessions use
            the training sets below to build timed stability.
          </p>
          <div className="space-y-4">
            {trainingSets.map((set) => (
              <div key={set.name} className="rounded-lg border p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{set.name}</h3>
                  <p className="text-sm text-muted-foreground">{set.reps}</p>
                </div>
                <p className="text-muted-foreground">{set.purpose}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Rep instruction:</span>{" "}
                  {set.instruction}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {set.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What the App Actually Observes</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {observationSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
          <p className="font-medium">
            Under this phase, speed without structure is not success. Controlled pace and intact
            method are what score well.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Progression Logic</h2>
          <p className="text-muted-foreground">
            This is the final phase. High Maintenance here does not move to a fifth phase. It
            shifts into maintenance and cross-topic transfer when timed stability is sustained.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {progressionBands.map((band) => (
              <li key={band}>{band}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Tutor Discipline Inside This Phase</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Do not confuse urgency with quality.</li>
            <li>Do not shout speed cues that make the student abandon method.</li>
            <li>Do not intervene continuously. Real pressure has no live tutor rescue.</li>
            <li>Debrief structure loss after the timer, not by coaching through the rep.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Compliance Audit Exposure</h2>
          <p className="text-muted-foreground">
            Time Pressure Stability is auditable against the TD library with fixed timer integrity
            and structure-preservation checks.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {auditChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="font-medium">
            If the timer is fake, inconsistent, or used to push speed instead of structure, the
            session fails compliance.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-destructive">
          <h2 className="text-2xl font-bold">Violation Consequence</h2>
          <p className="text-muted-foreground">
            Timed sessions that are manipulated, softened, or logged dishonestly can be flagged by
            compliance review.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {criticalFails.map((fail) => (
              <li key={fail}>{fail}</li>
            ))}
          </ul>
          <p className="font-medium">
            Audit failure can lead to session invalidation and suspension, and repeated or severe
            violations can justify permanent TT platform ban or blacklisting.
          </p>
        </Card>
      </div>
    </div>
  );
}
