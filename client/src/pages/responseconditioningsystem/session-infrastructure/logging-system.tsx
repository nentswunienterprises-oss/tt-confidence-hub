import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const repObservationRows = [
  {
    field: "Cold Start (Rep 1)",
    options: ["avoids", "delayed", "immediate"],
    selected: "delayed",
    level: "partial",
  },
  {
    field: "First Step Attempt (Rep 1)",
    options: ["random / guessing", "partial steps", "full structure"],
    selected: "partial steps",
    level: "partial",
  },
  {
    field: "Step Order (Rep 1)",
    options: ["incorrect", "minor errors", "correct"],
    selected: "minor errors",
    level: "partial",
  },
  {
    field: "Help-Seeking (Rep 1)",
    options: ["waits for help", "asks after trying", "independent"],
    selected: "asks after trying",
    level: "partial",
  },
];

const setScores = [
  { rep: "Rep 1", score: "75 / 100" },
  { rep: "Rep 2", score: "83 / 100" },
  { rep: "Rep 3", score: "83 / 100" },
  { rep: "Set Total", score: "80 / 100" },
];

const deterministicLogRows = [
  { label: "Drill", value: "Structured Execution - Start + Structure" },
  {
    label: "What Was Trained",
    value: "Cold-start execution and step order without early tutor intervention.",
  },
  {
    label: "Observed Response",
    value: "Delayed starts, partial structure on first move, minor order errors, and help-seeking after initial attempt.",
  },
  {
    label: "Performance Result",
    value: "Student can begin independently and recover into method, but execution is not yet fully stable from the first move.",
  },
  {
    label: "State Update",
    value: "Structured Execution advanced to High stability.",
  },
  {
    label: "What This Means",
    value: "The student is moving out of inconsistent execution and toward repeatable independent structure, but still needs high-maintenance proof.",
  },
  {
    label: "Next Drill",
    value: "Run Structured Execution High Maintenance drill.",
  },
  {
    label: "Constraint",
    value: "Do NOT phase advance yet. Prove repeatable stability first.",
  },
];

const flow = [
  "Runner loads the phase context, active set, rep instruction, and allowed observation fields.",
  "Tutor presents the rep exactly as configured by the drill library.",
  "Tutor selects one option per observation field based on what actually happened in the rep.",
  "The runner normalizes option position into weak, partial, or clear.",
  "The system scores reps, computes set and session totals, and runs the transition engine automatically.",
  "The session output is stored as deterministic log language for tracking, reports, and next-session direction.",
];

const rules = [
  "Logging begins inside the drill runner, not after the session in a separate narrative form.",
  "Only the phase-specific observation blocks count as primary session evidence.",
  "Free interpretation does not override option selection, scoring, or phase decision.",
  "If the tutor did not observe it in the rep, it does not belong in the core log.",
];

const scoringRules = [
  "First option in an observation block maps to weak.",
  "Middle option maps to partial.",
  "Last option maps to clear.",
  "Observation families are phase-specific and drill-specific.",
  "The drill total is what drives stability movement and phase progress logic.",
];

const outputs = [
  "Set score",
  "Session score",
  "Phase decision",
  "Transition reason",
  "Next action",
  "Constraint",
  "Deterministic session log",
];

const auditRisks = [
  "Selecting stronger observation options than the rep justified",
  "Logging a smoother response pattern than the drill score supports",
  "Altering or misreporting the automatic system result after scoring",
  "Writing around a rescue, pressure break, or structure collapse",
];

export default function ResponseConditioningLoggingSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
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
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Logging System
              </h1>
              <p className="text-muted-foreground mt-1">
                Drill-runner observation capture, scoring, and deterministic session output
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 md:p-8 border-2 border-primary/20 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Updated Demo</Badge>
            <Badge variant="outline">Structured Execution</Badge>
            <Badge variant="outline">Runner UI simulation</Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">What Logging Is in TT</h2>
            <p className="text-muted-foreground max-w-4xl">
              Logging is the observation spine inside the drill runner. It is not a free-text
              tutor form. It is the capture of rep behavior, the scoring of that behavior, and
              the system output that follows from that score.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/60 p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Live Runner Demo</h3>
                <p className="text-sm text-muted-foreground">
                  Structured Execution, Start + Structure, live observation capture
                </p>
              </div>
              <Badge variant="outline">Rep 1 view</Badge>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="font-semibold text-foreground text-sm">Phase: Structured Execution</div>
              <div className="text-xs text-muted-foreground">
                Test and build ability to execute the known method independently. Student knows. Now prove they can do it alone, repeatably.
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded border bg-background px-2 py-1">State steps before solving</span>
                <span className="rounded border bg-background px-2 py-1">No guessing tolerated</span>
                <span className="rounded border bg-background px-2 py-1">No skipping steps</span>
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-sm">Set 1 / 2: Start + Structure</div>
                <div className="text-sm font-medium text-muted-foreground">Rep 1 / 3</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Test ability to execute from a cold start with no assistance. Observe whether structure exists from the first move.
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="text-xs font-semibold text-primary mb-1">Rep instruction</div>
                <div className="text-sm font-medium">Solve the problem. No help for 10 seconds.</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded border px-2 py-1">No help for 10 seconds</span>
                <span className="rounded border px-2 py-1">Observe cold start behavior</span>
                <span className="rounded border px-2 py-1">Record exactly what happens</span>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div>
                <p className="font-semibold">Rep Observation Capture</p>
                <p className="text-sm text-muted-foreground">
                  This mirrors the live runner behavior: one observation row at a time, option buttons, no freestyle scoring.
                </p>
              </div>
              <div className="space-y-3">
                {repObservationRows.map((row) => (
                  <div key={row.field} className="rounded-lg border bg-background p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{row.field}</p>
                      <Badge variant="secondary">{row.level}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {row.options.map((option) => (
                        <span
                          key={option}
                          className={`rounded border px-2 py-1 ${
                            option === row.selected ? "border-primary bg-primary/10 text-foreground" : ""
                          }`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div>
                <p className="font-semibold">Scoring Output</p>
                <p className="text-sm text-muted-foreground">
                  After rep capture, the runner produces rep totals, set total, transition result, and next-session direction automatically.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {setScores.map((row) => (
                  <div key={row.rep} className="rounded-lg border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.rep}</p>
                    <p className="mt-1 font-semibold">{row.score}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Phase Decision</p>
                  <p className="mt-1 font-semibold">advance</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Transition Reason</p>
                  <p className="mt-1 font-semibold">stability advance</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Next Action</p>
                  <p className="mt-1 font-semibold">Run Structured Execution High Maintenance drill</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div>
                <p className="font-semibold">Deterministic Session Output</p>
                <p className="text-sm text-muted-foreground">
                  This is the stored session language generated from drill observation and engine interpretation.
                </p>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {deterministicLogRows.map((row) => (
                  <div key={row.label} className="rounded-lg border bg-background p-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                    <p className="font-medium">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Primary Rules</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Observation Scoring Logic</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {scoringRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Logging Flow in the Runner</h2>
          <ol className="space-y-1 pl-4 text-muted-foreground">
            {flow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">What the Runner Produces</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {outputs.map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4 border-2 border-primary/20">
          <h2 className="text-2xl font-bold">The Core Formula</h2>
          <p className="font-medium">The TT logging spine is:</p>
          <p className="text-xl font-semibold">
            Rep behavior observed
            <br />-&gt; option selected
            <br />-&gt; weak / partial / clear normalization
            <br />-&gt; set and session score
            <br />-&gt; transition result
            <br />-&gt; next drill direction
          </p>
        </Card>

        <Card className="p-6 space-y-4 border-2 border-primary/20">
          <h2 className="text-2xl font-bold">Audit Relevance</h2>
          <p className="text-muted-foreground">
            Because TT logging is tied directly to drill observation and scoring, dishonest logging
            means dishonest observation capture. That is a compliance issue, not a note-taking issue.
          </p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {auditRisks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
          <p className="font-medium">
            If the observation record is manipulated, the session output is compromised and the tutor
            can be flagged for audit failure.
          </p>
        </Card>
      </div>
    </div>
  );
}
