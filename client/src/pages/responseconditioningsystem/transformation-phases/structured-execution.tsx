import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const trainingSets = [
  {
    name: "Forced Structure",
    reps: "3 reps",
    purpose: "Force step discipline before full independence.",
    instruction: "State the steps first. Then solve.",
    rules: [
      "Steps must be stated before solving.",
      "No skipping steps.",
      "Correct step order is required.",
    ],
  },
  {
    name: "Independent Execution",
    reps: "3 reps",
    purpose: "Build clean, repeatable execution with no help from tutor.",
    instruction: "Solve independently.",
    rules: [
      "No help from tutor.",
      "Full independence expected.",
      "Observe consistency and error handling.",
    ],
  },
  {
    name: "Variation Control",
    reps: "3 reps",
    purpose: "Test transfer to a slightly different form using the same method.",
    instruction: "Solve a slightly different form.",
    rules: [
      "Same method, different form.",
      "Test transfer, not memorization.",
      "No hints on what changed.",
    ],
  },
];

const diagnosisSets = [
  {
    name: "Start + Structure",
    reps: "3 reps",
    purpose: "Observe whether structure exists from the first move with no assistance.",
    instruction: "Solve the problem. No help for 10 seconds.",
    rules: [
      "No help for the cold start window.",
      "Observe independent start behavior.",
      "Record exactly what happens with no prompting.",
    ],
  },
  {
    name: "Repeatability",
    reps: "3 reps",
    purpose: "Test whether execution holds across similar problems without breakdown.",
    instruction: "Solve a similar problem.",
    rules: [
      "Same method repeated.",
      "No step-by-step guidance.",
      "Observe consistency across reps.",
    ],
  },
];

const observationSignals = [
  "Start behavior: do they avoid, delay, or start immediately?",
  "Step execution: do they guess, partially structure, or run full structure?",
  "Repeatability: does the step order hold across reps or drift?",
  "Independence: do they wait for help, ask after trying, or complete alone?",
];

const progressionBands = [
  "Low: run Structured Execution drill. No time pressure. Boss Battles only if the student can start.",
  "Medium: stay in Structured Execution and reinforce repeatable structure across multiple problems.",
  "High: run High Maintenance checks. Do not phase advance yet. Prove repeatable stability.",
  "High Maintenance: if a full session scores 85 or above, the engine progresses the topic into Controlled Discomfort at Low.",
];

const auditChecks = [
  "Cold start window was respected with no early help.",
  "Student was required to initiate and execute independently.",
  "Tutor enforced step order instead of tolerating guessing.",
  "Each rep was presented clearly and the log reflects what really happened.",
];

const criticalFails = [
  "Tutor helps before the student attempts.",
  "Student is not required to start independently.",
  "Tutor allows guessing or skips enforcing the steps.",
];

export default function ResponseConditioningStructuredExecution() {
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
                Structured Execution
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                The execution phase as defined by the state engine and drill library
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Phase Function in the Engine</h2>
          <p className="text-muted-foreground">
            Structured Execution exists to test and build the student's ability to execute
            a known method independently. The student already knows. Now the system requires
            proof that they can do it alone, in order, repeatedly.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>State steps before solving.</li>
            <li>No guessing tolerated.</li>
            <li>No skipping steps.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Unified Protocol</h2>
          <p className="text-muted-foreground">
            This phase is where the app stops rewarding passive understanding and starts scoring
            behavior. The purpose of the phase and the drill structure are the same system.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Purpose of phase: convert clarity into independent, repeatable method use.</li>
            <li>Primary action in the engine: run Structured Execution drill.</li>
            <li>Tutor role: enforce step order, not provide comfort teaching.</li>
            <li>Success is measured through rep-by-rep execution signals, not tutor opinion.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Diagnosis Structure</h2>
          <p className="text-muted-foreground">
            Diagnosis comes first in the intro session. It is not a general check-in. It uses
            fixed sets to expose start behavior, step order, and repeatability before training
            begins.
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
            Once diagnosis places the topic in Structured Execution, ongoing sessions use the
            training sets below to build independent method use.
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
            These observations are converted into weak, partial, or clear signals and rolled into
            the drill total that determines stability movement.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Progression Logic</h2>
          <p className="text-muted-foreground">
            Advancement out of Structured Execution only happens when the engine sees sustained
            High Maintenance performance, not when a tutor feels satisfied.
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
            <li>Do not rescue the cold start. Observe it.</li>
            <li>Do not keep remodelling when the phase requires independent execution.</li>
            <li>Do not accept skipped steps because the final answer looks right.</li>
            <li>After correction, return the problem to the student and require re-execution.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Compliance Audit Exposure</h2>
          <p className="text-muted-foreground">
            Structured Execution sessions are auditable against the TD compliance library. The audit
            tests execution integrity, not tutor intent.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {auditChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="font-medium">
            Only full compliance passes. If the drill is softened, the session fails audit.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-destructive">
          <h2 className="text-2xl font-bold">Violation Consequence</h2>
          <p className="text-muted-foreground">
            Any attempt to bypass independent execution, interfere early, or clean up the logs can
            trigger violation detection.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {criticalFails.map((fail) => (
              <li key={fail}>{fail}</li>
            ))}
          </ul>
          <p className="font-medium">
            Flagged non-compliance can lead to failed audits, suspension from active training,
            and for repeated or severe breaches, permanent ban or blacklisting from the TT platform.
          </p>
        </Card>
      </div>
    </div>
  );
}
