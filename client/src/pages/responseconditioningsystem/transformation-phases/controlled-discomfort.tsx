import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const trainingSets = [
  {
    name: "Controlled Entry",
    reps: "3 reps",
    purpose: "Build controlled entry under difficulty by forcing pause before action.",
    instruction: "Pause. Then state the first step.",
    rules: [
      "Force a pause before starting.",
      "First step must be stated out loud.",
      "Do not let the student jump in randomly.",
    ],
  },
  {
    name: "No Rescue",
    reps: "3 reps",
    purpose: "Build independence under difficulty with no rescue.",
    instruction: "Continue. No full help.",
    rules: [
      "No rescue allowed.",
      "Hold the hold. Do not relieve the pressure.",
      "Observe rescue-seeking pattern.",
    ],
  },
  {
    name: "Repeat Exposure",
    reps: "3 reps",
    purpose: "Repeat the same difficulty level until response becomes stable, not merely survivable.",
    instruction: "Another similar difficulty.",
    rules: [
      "Same difficulty level.",
      "Repeat exposure to build tolerance.",
      "Observe consistency of response.",
    ],
  },
];

const diagnosisSets = [
  {
    name: "First Contact",
    reps: "3 reps",
    purpose: "Tests the student's first response to difficulty under a no-help condition.",
    instruction: "Try this. No help for 10 seconds.",
    rules: [
      "No help for 10 seconds.",
      "Hold the discomfort window.",
      "Do not rescue. Observe.",
    ],
  },
  {
    name: "Pressure Hold",
    reps: "3 reps",
    purpose: "Tests whether the student can stay engaged under difficulty without relief.",
    instruction: "Continue. I will only confirm the first step.",
    rules: [
      "One-step confirmation only.",
      "No rescue allowed.",
      "Hold pressure. Do not relieve it.",
    ],
  },
];

const observationSignals = [
  "Initial response: do they freeze, hesitate, or attempt?",
  "First-step control: can they produce the first move without prompt?",
  "Discomfort tolerance: do they panic, tighten, or stay controlled?",
  "Rescue dependence: do they ask immediately, later, or work without rescue?",
];

const progressionBands = [
  "Low: run Controlled Discomfort drill. No rescuing. No full explanations mid-struggle. No time pressure yet.",
  "Medium: keep the difficulty on. Do not over-guide and do not remove uncertainty.",
  "High: run High Maintenance checks. Do not phase advance yet. Prove repeatable stability.",
  "High Maintenance: if a full session scores 85 or above, the engine progresses the topic into Time Pressure Stability at Low.",
];

const auditChecks = [
  "The 10 to 15 second discomfort window was genuinely held when required.",
  "Tutor did not rescue at any point.",
  "Only minimal first-step confirmation was used where the set allows it.",
  "Student remained responsible for execution and the rep was logged honestly.",
];

const criticalFails = [
  "Any rescue occurs.",
  "Tutor relieves pressure early or shortens the discomfort window.",
  "Tutor gives hints or explanations mid-struggle and converts the drill into support.",
];

export default function ResponseConditioningControlledDiscomfort() {
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
                Controlled Discomfort
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                Difficulty exposure as an exact drill protocol, not a loose coaching style
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Phase Function in the Engine</h2>
          <p className="text-muted-foreground">
            Controlled Discomfort exists to test and stabilize behavior under uncertainty and
            difficulty. This is where the app checks whether the student persists, or shuts down,
            once familiarity is removed.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>No full rescue.</li>
            <li>Hold the discomfort window.</li>
            <li>One-step confirmation maximum.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Unified Protocol</h2>
          <p className="text-muted-foreground">
            The phase purpose and the drill structure are one thing here. TT does not claim to
            train discomfort unless the discomfort protocol was actually run.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Purpose of phase: keep method alive when uncertainty appears.</li>
            <li>Primary action in the engine: run Controlled Discomfort drill.</li>
            <li>Tool inside the app: Boss Battle style difficulty without rescue.</li>
            <li>Target behavior: controlled starts, reduced rescue-seeking, stable structure under friction.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Diagnosis Structure</h2>
          <p className="text-muted-foreground">
            Diagnosis comes first in the intro session. It exposes raw response patterns before the
            tutor contaminates the rep with explanations or comfort behavior.
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
            Once diagnosis shows that the topic breaks under discomfort, ongoing sessions use the
            training sets below to stabilize that response.
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
            Those signals determine whether the system reads hesitation under pressure or better
            control under difficulty. That translation drives progression.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Progression Logic</h2>
          <p className="text-muted-foreground">
            The student does not graduate from this phase because the tutor felt the struggle looked
            cleaner. The topic only moves when the session score and stability state justify it.
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
            <li>Do not comfort the student out of the drill.</li>
            <li>Do not soften the difficulty to protect the tutor experience.</li>
            <li>Do not explain the whole problem after the first visible hesitation.</li>
            <li>If guidance is allowed, it is first-step only. Nothing beyond that.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Compliance Audit Exposure</h2>
          <p className="text-muted-foreground">
            Controlled Discomfort is one of the most audit-sensitive phases. The TD library checks
            whether pressure was truly maintained or quietly removed.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {auditChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="font-medium">
            The standard is exact execution. Only 100 percent compliance passes.
          </p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-destructive">
          <h2 className="text-2xl font-bold">Violation Consequence</h2>
          <p className="text-muted-foreground">
            If a tutor rescues, relieves the pressure, or falsifies what happened in the discomfort
            window, the platform can flag the session immediately.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {criticalFails.map((fail) => (
              <li key={fail}>{fail}</li>
            ))}
          </ul>
          <p className="font-medium">
            Audit failure in this phase can trigger suspension, and repeated or severe drill
            violations can result in permanent TT platform ban or blacklisting.
          </p>
        </Card>
      </div>
    </div>
  );
}
