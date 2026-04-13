import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const trainingSets = [
  {
    name: "Modeling",
    reps: "1 rep",
    purpose: "Build the mental map before drilling.",
    instruction: "Teach Vocabulary -> Method -> Reason, then make the student explain back.",
    rules: [
      "Tutor models. Student does not solve.",
      "Vocabulary -> Method -> Reason sequence is mandatory.",
      "Student explains back after each model.",
    ],
  },
  {
    name: "Identification",
    reps: "3 reps",
    purpose: "Recognition without solving. The student names terms, identifies type, states steps, and explains why.",
    instruction: "Show the problem and require recognition only. No solving allowed.",
    rules: [
      "No solving allowed.",
      "Push for vocabulary precision.",
      "All four layers must be checked: terms, type, steps, reason.",
    ],
  },
  {
    name: "Light Apply",
    reps: "3 reps",
    purpose: "Test whether clarity survives active solving with minimal guidance.",
    instruction: "Ask the student to solve with minimal guidance and observe whether clarity holds.",
    rules: [
      "Minimal guidance only.",
      "No step-by-step help.",
      "Observe independent start and structured execution.",
    ],
  },
];

const diagnosisSets = [
  {
    name: "Recognition Probe",
    reps: "3 reps",
    purpose: "Assessment only. Tests vocabulary, type recognition, step awareness, and first response without solving.",
    instruction: "Show the problem. Ask them to name terms, identify type, and state steps. Do not let them solve.",
    rules: [
      "Student does not solve.",
      "Recognition only. No execution drift.",
      "No hints or steps from tutor.",
    ],
  },
  {
    name: "Light Apply Probe",
    reps: "3 reps",
    purpose: "Checks whether clarity carries into solving with minimal tutor interference.",
    instruction: "Ask the student to solve and watch the start behavior, structure, and clarity carryover.",
    rules: [
      "Student must attempt independently.",
      "Minimal guidance only.",
      "No step-by-step help.",
    ],
  },
];

const observationSignals = [
  "Vocabulary: can they name terms correctly or do they collapse into vague language?",
  "Method: can they state the steps in order or do they guess the sequence?",
  "Reason: can they explain why the method works or do they repeat without logic?",
  "Immediate apply: when asked to respond, do they avoid, hesitate, or engage?",
];

const progressionBands = [
  "Low: run Clarity drill. No Boss Battles, no time pressure, no skipping layers.",
  "Medium: still run Clarity drill. Reduce explanation and increase light execution checks.",
  "High: run Clarity High Maintenance checks. Do not advance yet. Prove repeatability.",
  "High Maintenance: if a full session scores 85 or above, the engine progresses the topic into Structured Execution at Low.",
];

const auditChecks = [
  "Student did not solve during recognition-only sets.",
  "Tutor did not provide steps, guide answers, or convert the set into teaching.",
  "The V/M/R protocol was preserved and observations matched the actual rep behavior.",
  "Each rep was presented clearly and logged honestly.",
];

const criticalFails = [
  "Student solves during a recognition set.",
  "Tutor gives steps or explains the method inside an assessment rep.",
  "Tutor converts the drill into free teaching, over-guides Light Apply, or falsifies logs.",
];

export default function ResponseConditioningClarity() {
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
                Clarity
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                The 3-Layer Lens inside the app&apos;s actual drill algorithm
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Phase Function in the Engine</h2>
          <p className="text-muted-foreground">
            Clarity is the opening phase in the TT state engine. Its purpose is fixed:
            can the student see the problem clearly before solving it?
          </p>
          <p className="font-medium">
            In system terms, Clarity means naming what is there, recognizing the method,
            and understanding why the method works before pressure is added.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>No Boss Battles</li>
            <li>No time pressure</li>
            <li>No skipping layers</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Unified Protocol</h2>
          <p className="text-muted-foreground">
            This phase is not just a philosophy page. In the app, the phase and the drill
            protocol are one system.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Purpose of phase: build clear recognition before independent execution.</li>
            <li>Primary action in the engine: run Clarity drill.</li>
            <li>Core operating lens: Vocabulary -&gt; Method -&gt; Reason.</li>
            <li>Every rep is scored through observation, then translated into stability movement.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Diagnosis Structure</h2>
          <p className="text-muted-foreground">
            Diagnosis comes first in the intro session. These separate Clarity sets are not
            freeform checks. They are defined probes inside the library used to identify the
            student's entry point before training starts.
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
            Once diagnosis has established that the topic sits in Clarity, ongoing sessions use
            the training sets below to build the phase.
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
          <p className="text-muted-foreground">
            Clarity reps are not marked by vibe. The runner scores fixed observation families
            that drive the state engine.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {observationSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
          <p className="font-medium">
            First option logs weak. Middle logs partial. Last logs clear. That drill total
            is what moves the student through stability bands.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Progression Logic</h2>
          <p className="text-muted-foreground">
            Clarity does not advance because a tutor feels ready. The engine advances from score
            and stability state only.
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
            <li>Do not let recognition sets drift into solving.</li>
            <li>Do not over-explain when the rep is meant to observe recall.</li>
            <li>Do not skip Vocabulary, Method, or Reason because one layer looks strong.</li>
            <li>Do not teach around the drill. Run the drill exactly and log what happened.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Compliance Audit Exposure</h2>
          <p className="text-muted-foreground">
            Clarity sessions are auditable against the TD drill compliance library. Audit is not
            interpretive. It checks whether the drill was executed exactly as required.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {auditChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="font-medium">
            Compliance standard is binary: only 100 percent passes. Anything else fails.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-destructive">
          <h2 className="text-2xl font-bold">Violation Consequence</h2>
          <p className="text-muted-foreground">
            If a tutor breaks the Clarity drill rules, softens the protocol, or logs dishonestly,
            the session can be flagged for violation detection.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {criticalFails.map((fail) => (
              <li key={fail}>{fail}</li>
            ))}
          </ul>
          <p className="font-medium">
            Flagged non-compliance can trigger audit failure, tutor suspension, and where violations
            are severe or repeated, permanent removal or blacklisting from the TT platform.
          </p>
        </Card>
      </div>
    </div>
  );
}
