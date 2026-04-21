import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, Expand, X } from "lucide-react";
import { observationLevelFromOptionIndex } from "@shared/observationScoring";
import {
  getNextActionData,
  type PhaseLabel,
  type StabilityLabel,
} from "@/components/tutor/topicConditioningEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ObservationField = { key: string; label: string; options: string[] };
type DrillSetConfig = {
  setName: string;
  reps: number;
  purpose: string;
  repInstruction: string;
  activeRules: string[];
  observationBlock?: ObservationField[];
  repObservationBlocks?: ObservationField[][];
};

type DemoSummary = {
  phase: PhaseLabel;
  stability: StabilityLabel;
  diagnosisScore: number;
  nextAction: string;
  constraint: string | null;
  highGuardPasses: boolean;
  setScores: number[];
  repRows: Array<{ set: string; rep: number; repScore: number }>;
};

const PHASES: PhaseLabel[] = [
  "Clarity",
  "Structured Execution",
  "Controlled Discomfort",
  "Time Pressure Stability",
];

const PHASE_CONTEXT: Record<PhaseLabel, { purpose: string; constraints: string[] }> = {
  Clarity: {
    purpose:
      "Can the student see the problem clearly before solving? Clarity is naming what's there, recognizing the method, understanding why. If this fails, everything else collapses.",
    constraints: ["No Boss Battles", "No time pressure", "No skipping layers"],
  },
  "Structured Execution": {
    purpose:
      "Test and build ability to execute the known method independently. Student knows, now prove they can do it alone, repeatably.",
    constraints: ["State steps before solving", "No guessing tolerated", "No skipping steps"],
  },
  "Controlled Discomfort": {
    purpose:
      "Test and stabilize behavior under uncertainty and difficulty. Does the student persist, or shut down?",
    constraints: ["No full rescue", "Hold discomfort window", "One-step confirmation max"],
  },
  "Time Pressure Stability": {
    purpose:
      "Maintain method structure under urgency. Structure is the target, speed is secondary.",
    constraints: ["Method over speed", "Timer is active", "Structured response required"],
  },
};

const DIAGNOSIS_SETS_BY_PHASE: Record<PhaseLabel, DrillSetConfig[]> = {
  Clarity: [
    {
      setName: "Recognition Probe",
      reps: 3,
      purpose: "Student does not solve. Tests vocabulary, type recognition, and step awareness only.",
      repInstruction:
        "Show the problem. Ask student to name terms, identify type, and state the steps. Do not let them solve.",
      activeRules: ["Student does not solve", "Recognition only", "No hints or steps from tutor"],
      repObservationBlocks: [
        [
          { key: "vocabulary", label: "Vocabulary (Rep 1 - Cold Name)", options: ["cannot name", "partial", "clear"] },
          { key: "method", label: "Type Recognition (Rep 1)", options: ["wrong", "hesitant", "correct"] },
          { key: "reason", label: "Step Awareness (Rep 1)", options: ["none", "partial", "clear"] },
          { key: "immediateApply", label: "First Response (Rep 1)", options: ["avoids", "unsure", "engages"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary (Rep 2 - Second Look)", options: ["cannot name", "partial", "clear"] },
          { key: "method", label: "Method Recognition (Rep 2)", options: ["wrong", "hesitant", "correct"] },
          { key: "reason", label: "Can They State Steps? (Rep 2)", options: ["none", "partial", "clear"] },
          { key: "immediateApply", label: "Willingness to Try (Rep 2)", options: ["avoids", "unsure", "engages"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary (Rep 3 - Confirm)", options: ["cannot name", "partial", "clear"] },
          { key: "method", label: "Method Recall (Rep 3)", options: ["wrong", "hesitant", "correct"] },
          { key: "reason", label: "Can They Explain Why? (Rep 3)", options: ["none", "partial", "clear"] },
          { key: "immediateApply", label: "Confidence Signal (Rep 3)", options: ["avoids", "unsure", "engages"] },
        ],
      ],
    },
    {
      setName: "Light Apply Probe",
      reps: 3,
      purpose: "Student solves with minimal help. Tests start behavior, structure, and clarity carryover.",
      repInstruction: "Ask student to solve. Minimal guidance only. Observe start behavior and step discipline.",
      activeRules: ["Minimal guidance only", "No step-by-step help", "Observe independent start and execution"],
      repObservationBlocks: [
        [
          { key: "vocabulary", label: "Vocabulary in Context (Rep 1 - First Attempt)", options: ["incorrect", "partial", "correct"] },
          { key: "method", label: "Step Execution (Rep 1)", options: ["random", "partial", "structured"] },
          { key: "reason", label: "Reason Awareness (Rep 1)", options: ["none", "weak", "present"] },
          { key: "immediateApply", label: "Start Behavior (Rep 1)", options: ["cannot start", "delayed", "starts"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary in Context (Rep 2 - With Feedback)", options: ["incorrect", "partial", "correct"] },
          { key: "method", label: "Step Discipline (Rep 2)", options: ["random", "partial", "structured"] },
          { key: "reason", label: "Reason Application (Rep 2)", options: ["none", "weak", "present"] },
          { key: "immediateApply", label: "Adjustment to Feedback (Rep 2)", options: ["cannot start", "delayed", "starts"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary in Context (Rep 3 - Independence Check)", options: ["incorrect", "partial", "correct"] },
          { key: "method", label: "Step Consistency (Rep 3)", options: ["random", "partial", "structured"] },
          { key: "reason", label: "Reason Retention (Rep 3)", options: ["none", "weak", "present"] },
          { key: "immediateApply", label: "Independent Start (Rep 3)", options: ["cannot start", "delayed", "starts"] },
        ],
      ],
    },
  ],
  "Structured Execution": [
    {
      setName: "Start + Structure",
      reps: 3,
      purpose: "Test ability to execute from a cold start with no assistance. Observe whether structure exists from the first move.",
      repInstruction: "Solve the problem. No help for 10 seconds.",
      activeRules: ["No help for 10 seconds", "Observe cold start behavior", "Record exactly what happens"],
      repObservationBlocks: [
        [
          { key: "startBehavior", label: "Cold Start (Rep 1)", options: ["avoids", "delayed", "immediate"] },
          { key: "stepExecution", label: "First Step Attempt (Rep 1)", options: ["random / guessing", "partial steps", "full structure"] },
          { key: "repeatability", label: "Step Order (Rep 1)", options: ["incorrect", "minor errors", "correct"] },
          { key: "independence", label: "Help-Seeking (Rep 1)", options: ["waits for help", "asks after trying", "independent"] },
        ],
        [
          { key: "startBehavior", label: "Start Under Observation (Rep 2)", options: ["avoids", "delayed", "immediate"] },
          { key: "stepExecution", label: "Mid-Execution Discipline (Rep 2)", options: ["random / guessing", "partial steps", "full structure"] },
          { key: "repeatability", label: "Correction Response (Rep 2)", options: ["incorrect", "minor errors", "correct"] },
          { key: "independence", label: "Dependence Pattern (Rep 2)", options: ["waits for help", "asks after trying", "independent"] },
        ],
        [
          { key: "startBehavior", label: "Completion Start (Rep 3)", options: ["avoids", "delayed", "immediate"] },
          { key: "stepExecution", label: "Full Execution (Rep 3)", options: ["random / guessing", "partial steps", "full structure"] },
          { key: "repeatability", label: "Final Step Order (Rep 3)", options: ["incorrect", "minor errors", "correct"] },
          { key: "independence", label: "Can They Finish Alone? (Rep 3)", options: ["waits for help", "asks after trying", "independent"] },
        ],
      ],
    },
    {
      setName: "Repeatability",
      reps: 3,
      purpose: "Test whether execution holds across similar problems without breaking down.",
      repInstruction: "Solve similar problem.",
      activeRules: ["Similar problem", "No step-by-step guidance", "Observe consistency across reps"],
      repObservationBlocks: [
        [
          { key: "repeatability", label: "First Repeat - Consistency (Rep 1)", options: ["breaks each time", "inconsistent", "stable"] },
          { key: "stepExecution", label: "Step Recall (Rep 1)", options: ["forgets", "partial", "full"] },
          { key: "independence", label: "Error Type (Rep 1)", options: ["guessing", "careless", "structured"] },
          { key: "startBehavior", label: "Completion (Rep 1)", options: ["cannot finish", "partial", "complete"] },
        ],
        [
          { key: "repeatability", label: "Second Repeat - Pattern (Rep 2)", options: ["breaks each time", "inconsistent", "stable"] },
          { key: "stepExecution", label: "Step Retention (Rep 2)", options: ["forgets", "partial", "full"] },
          { key: "independence", label: "Self-Correction (Rep 2)", options: ["guessing", "careless", "structured"] },
          { key: "startBehavior", label: "Completion (Rep 2)", options: ["cannot finish", "partial", "complete"] },
        ],
        [
          { key: "repeatability", label: "Third Repeat - Final Stability (Rep 3)", options: ["breaks each time", "inconsistent", "stable"] },
          { key: "stepExecution", label: "Step Reliability (Rep 3)", options: ["forgets", "partial", "full"] },
          { key: "independence", label: "Independence Signal (Rep 3)", options: ["guessing", "careless", "structured"] },
          { key: "startBehavior", label: "Completion (Rep 3)", options: ["cannot finish", "partial", "complete"] },
        ],
      ],
    },
  ],
  "Controlled Discomfort": [
    {
      setName: "First Contact",
      reps: 3,
      purpose: "Test initial response to difficulty under a no-help condition. What does the student do first?",
      repInstruction: "Try this. No help for 10 seconds.",
      activeRules: ["No help for 10 seconds", "Hold the discomfort window", "Do not rescue"],
      repObservationBlocks: [
        [
          { key: "initialResponse", label: "Immediate Reaction (Rep 1 - Cold Contact)", options: ["freeze", "hesitate", "attempt"] },
          { key: "firstStepControl", label: "First Step Without Prompt (Rep 1)", options: ["none", "prompted", "independent"] },
          { key: "discomfortTolerance", label: "Emotional State (Rep 1)", options: ["panic", "tension", "controlled"] },
          { key: "rescueDependence", label: "Rescue Seeking (Rep 1)", options: ["asks immediately", "asks later", "no rescue"] },
        ],
        [
          { key: "initialResponse", label: "Persistence Under Hold (Rep 2)", options: ["freeze", "hesitate", "attempt"] },
          { key: "firstStepControl", label: "Step Control Maintained? (Rep 2)", options: ["none", "prompted", "independent"] },
          { key: "discomfortTolerance", label: "Tolerance Window (Rep 2)", options: ["panic", "tension", "controlled"] },
          { key: "rescueDependence", label: "Rescue Pattern (Rep 2)", options: ["asks immediately", "asks later", "no rescue"] },
        ],
        [
          { key: "initialResponse", label: "Recovery Behavior (Rep 3)", options: ["freeze", "hesitate", "attempt"] },
          { key: "firstStepControl", label: "Reentry After Struggle (Rep 3)", options: ["none", "prompted", "independent"] },
          { key: "discomfortTolerance", label: "Final Stability (Rep 3)", options: ["panic", "tension", "controlled"] },
          { key: "rescueDependence", label: "Final Rescue Check (Rep 3)", options: ["asks immediately", "asks later", "no rescue"] },
        ],
      ],
    },
    {
      setName: "Pressure Hold",
      reps: 3,
      purpose: "Test sustained engagement under difficulty. Can the student persist without rescue?",
      repInstruction: "Continue. I will only confirm the first step.",
      activeRules: ["One-step confirmation only", "No rescue allowed", "Hold pressure"],
      repObservationBlocks: [
        [
          { key: "discomfortTolerance", label: "Sustained Engagement (Rep 1)", options: ["gives up", "short attempt", "stays engaged"] },
          { key: "rescueDependence", label: "Rescue Under Sustained Hold (Rep 1)", options: ["asks immediately", "asks later", "no rescue"] },
          { key: "firstStepControl", label: "Structure Retention (Rep 1)", options: ["breaks", "partial", "maintained"] },
          { key: "initialResponse", label: "Recovery After Struggle (Rep 1)", options: ["collapses", "partial", "recovers"] },
        ],
        [
          { key: "discomfortTolerance", label: "Tolerance Ceiling (Rep 2)", options: ["gives up", "short attempt", "stays engaged"] },
          { key: "rescueDependence", label: "Rescue Pattern (Rep 2)", options: ["asks immediately", "asks later", "no rescue"] },
          { key: "firstStepControl", label: "Can Still Sequence? (Rep 2)", options: ["breaks", "partial", "maintained"] },
          { key: "initialResponse", label: "Composed or Reactive? (Rep 2)", options: ["collapses", "partial", "recovers"] },
        ],
        [
          { key: "discomfortTolerance", label: "Final Hold - Stability (Rep 3)", options: ["gives up", "short attempt", "stays engaged"] },
          { key: "rescueDependence", label: "Final Rescue Check (Rep 3)", options: ["asks immediately", "asks later", "no rescue"] },
          { key: "firstStepControl", label: "Structure Under Max Pressure (Rep 3)", options: ["breaks", "partial", "maintained"] },
          { key: "initialResponse", label: "Final Recovery (Rep 3)", options: ["collapses", "partial", "recovers"] },
        ],
      ],
    },
  ],
  "Time Pressure Stability": [
    {
      setName: "Light Timer",
      reps: 3,
      purpose: "Test structure and start behavior under a timer. First exposure to time constraint.",
      repInstruction: "Solve under short timer.",
      activeRules: ["Timer is active", "Observe structure", "Record panic vs controlled response"],
      repObservationBlocks: [
        [
          { key: "startUnderTime", label: "First Time Exposure - Start (Rep 1)", options: ["freeze", "delayed", "immediate"] },
          { key: "structureUnderTime", label: "Structure on First Timer (Rep 1)", options: ["breaks", "partial", "maintained"] },
          { key: "paceControl", label: "Pace Reaction (Rep 1)", options: ["panic", "rushed", "controlled"] },
          { key: "completionIntegrity", label: "Completion Under Time (Rep 1)", options: ["fails", "partial", "complete"] },
        ],
        [
          { key: "startUnderTime", label: "Start - Adjusted? (Rep 2)", options: ["freeze", "delayed", "immediate"] },
          { key: "structureUnderTime", label: "Structure Mid-Timer (Rep 2)", options: ["breaks", "partial", "maintained"] },
          { key: "paceControl", label: "Pace Regulation (Rep 2)", options: ["panic", "rushed", "controlled"] },
          { key: "completionIntegrity", label: "Completion Quality (Rep 2)", options: ["fails", "partial", "complete"] },
        ],
        [
          { key: "startUnderTime", label: "Start - Consistent? (Rep 3)", options: ["freeze", "delayed", "immediate"] },
          { key: "structureUnderTime", label: "Structure Integrity (Rep 3)", options: ["breaks", "partial", "maintained"] },
          { key: "paceControl", label: "Final Pace Control (Rep 3)", options: ["panic", "rushed", "controlled"] },
          { key: "completionIntegrity", label: "Final Completion (Rep 3)", options: ["fails", "partial", "complete"] },
        ],
      ],
    },
    {
      setName: "Consistency",
      reps: 3,
      purpose: "Test whether structure holds across repeated timed attempts. Look for drift.",
      repInstruction: "Repeat under same time constraint.",
      activeRules: ["Same timer", "Observe drift and consistency", "Pattern matters more than speed"],
      repObservationBlocks: [
        [
          { key: "completionIntegrity", label: "Repeat 1 - Consistency Signal", options: ["collapses", "inconsistent", "stable"] },
          { key: "startUnderTime", label: "Behavior Pattern (Rep 1)", options: ["panic", "tension", "composed"] },
          { key: "structureUnderTime", label: "Structure Repeat 1", options: ["breaks", "partial", "maintained"] },
          { key: "paceControl", label: "Pace Pattern (Rep 1)", options: ["rushed", "uneven", "controlled"] },
        ],
        [
          { key: "completionIntegrity", label: "Repeat 2 - Holding? (Rep 2)", options: ["collapses", "inconsistent", "stable"] },
          { key: "startUnderTime", label: "Behavioral Drift (Rep 2)", options: ["panic", "tension", "composed"] },
          { key: "structureUnderTime", label: "Structure Stability (Rep 2)", options: ["breaks", "partial", "maintained"] },
          { key: "paceControl", label: "Pace Discipline (Rep 2)", options: ["rushed", "uneven", "controlled"] },
        ],
        [
          { key: "completionIntegrity", label: "Repeat 3 - Final Stability (Rep 3)", options: ["collapses", "inconsistent", "stable"] },
          { key: "startUnderTime", label: "Final Behavior (Rep 3)", options: ["panic", "tension", "composed"] },
          { key: "structureUnderTime", label: "Final Structure (Rep 3)", options: ["breaks", "partial", "maintained"] },
          { key: "paceControl", label: "Final Pace (Rep 3)", options: ["rushed", "uneven", "controlled"] },
        ],
      ],
    },
  ],
};

const INTRO_PHASE_WEIGHTS: Record<PhaseLabel, Array<{ aliases: string[]; weight: number }>> = {
  Clarity: [
    { aliases: ["vocabulary"], weight: 30 },
    { aliases: ["method"], weight: 30 },
    { aliases: ["reason"], weight: 20 },
    { aliases: ["immediateApply"], weight: 20 },
  ],
  "Structured Execution": [
    { aliases: ["startBehavior"], weight: 25 },
    { aliases: ["stepExecution"], weight: 30 },
    { aliases: ["repeatability"], weight: 25 },
    { aliases: ["independence"], weight: 20 },
  ],
  "Controlled Discomfort": [
    { aliases: ["initialResponse"], weight: 30 },
    { aliases: ["firstStepControl"], weight: 25 },
    { aliases: ["discomfortTolerance"], weight: 25 },
    { aliases: ["rescueDependence"], weight: 20 },
  ],
  "Time Pressure Stability": [
    { aliases: ["startUnderTime"], weight: 20 },
    { aliases: ["structureUnderTime"], weight: 35 },
    { aliases: ["paceControl"], weight: 20 },
    { aliases: ["completionIntegrity"], weight: 25 },
  ],
};

const flow = [
  "Runner loads phase context, active set, rep instruction, and allowed observation fields.",
  "Tutor presents the rep exactly as configured by the drill library.",
  "Tutor selects one option per observation field based on what actually happened in the rep.",
  "The runner normalizes option position into weak, partial, or clear.",
  "The system scores reps, computes set totals, and resolves next-session direction.",
  "The session output is shown in deterministic language for tracking and audit understanding.",
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
  "The drill total is what drives stability movement and next-step direction.",
];

const outputs = [
  "Rep score",
  "Set score",
  "Diagnosis score",
  "Resolved stability",
  "Next action",
  "Constraint",
  "Demo-only deterministic output",
];

const auditRisks = [
  "Selecting stronger observation options than the rep justified",
  "Logging a smoother response pattern than the drill score supports",
  "Altering or misreporting the automatic system result after scoring",
  "Writing around a rescue, pressure break, or structure collapse",
];

function getObservationBlockForRep(setConfig: DrillSetConfig, repIndex: number): ObservationField[] {
  if (setConfig.repObservationBlocks?.[repIndex]) {
    return setConfig.repObservationBlocks[repIndex];
  }
  return setConfig.observationBlock || [];
}

function weightedScoreFor(weight: number, optionIndex: number, optionCount: number) {
  const level = observationLevelFromOptionIndex(optionIndex, optionCount);
  if (level === "clear") return weight;
  if (level === "partial") return Math.round(weight * 0.6);
  return 0;
}

function observationKey(setIndex: number, repIndex: number, fieldKey: string) {
  return `set${setIndex}_rep${repIndex}_${fieldKey}`;
}

function guardPassesForPhase(phase: PhaseLabel, repObservations: Record<string, string>[]) {
  if (phase === "Clarity") {
    return !repObservations.some((repObs) =>
      INTRO_PHASE_WEIGHTS[phase].some((field) => {
        const rawValue = String(repObs[field.aliases[0]] || "").trim();
        return !rawValue || rawValue === "none" || rawValue === "wrong" || rawValue.includes("cannot");
      }),
    );
  }

  if (phase === "Structured Execution") {
    return !repObservations.some((repObs) => {
      const step = String(repObs.stepExecution || "").toLowerCase();
      const start = String(repObs.startBehavior || "").toLowerCase();
      return step.includes("guess") || start.includes("avoid");
    });
  }

  if (phase === "Controlled Discomfort") {
    return !repObservations.some((repObs) => {
      const initial = String(repObs.initialResponse || "").toLowerCase();
      const firstStep = String(repObs.firstStepControl || "").toLowerCase();
      return initial.includes("freeze") || firstStep === "none";
    });
  }

  return !repObservations.some((repObs) => {
    const structure = String(repObs.structureUnderTime || "").toLowerCase();
    const pace = String(repObs.paceControl || "").toLowerCase();
    return !structure.includes("maintained") || !pace.includes("controlled");
  });
}

function buildDemoSummary(
  phase: PhaseLabel,
  sets: DrillSetConfig[],
  observations: Record<string, string>,
): DemoSummary {
  const repRows: Array<{ set: string; rep: number; repScore: number }> = [];
  const setScores: number[] = [];
  let highGuardPasses = true;

  sets.slice(0, 2).forEach((setConfig, setIndex) => {
    const repScores: number[] = [];
    const repObservations: Record<string, string>[] = [];

    for (let repIndex = 0; repIndex < setConfig.reps; repIndex += 1) {
      const fields = getObservationBlockForRep(setConfig, repIndex);
      let repScore = 0;
      const repObs: Record<string, string> = {};

      fields.forEach((field) => {
        const selected = observations[observationKey(setIndex, repIndex, field.key)] || "";
        repObs[field.key] = selected;
        const optionIndex = field.options.indexOf(selected);
        if (optionIndex >= 0) {
          const phaseWeight = INTRO_PHASE_WEIGHTS[phase].find((item) => item.aliases.includes(field.key))?.weight || 0;
          repScore += weightedScoreFor(phaseWeight, optionIndex, field.options.length);
        }
      });

      const normalizedRepScore = Math.max(0, Math.min(100, Math.round(repScore)));
      repRows.push({ set: setConfig.setName, rep: repIndex + 1, repScore: normalizedRepScore });
      repScores.push(normalizedRepScore);
      repObservations.push(repObs);
    }

    const setScore = repScores.length > 0
      ? Math.round(repScores.reduce((sum, value) => sum + value, 0) / repScores.length)
      : 0;
    setScores.push(setScore);

    if (!guardPassesForPhase(phase, repObservations)) {
      highGuardPasses = false;
    }
  });

  const diagnosisScore = setScores.length > 0
    ? Math.round(setScores.reduce((sum, score) => sum + score, 0) / setScores.length)
    : 0;

  let stability: StabilityLabel = "Low";
  if (diagnosisScore <= 49) stability = "Low";
  else if (diagnosisScore <= 69) stability = "Medium";
  else stability = highGuardPasses ? "High" : "Medium";

  const nextActionData = getNextActionData(phase, stability);

  return {
    phase,
    stability,
    diagnosisScore,
    nextAction: nextActionData.primaryAction,
    constraint: nextActionData.rules[0] || null,
    highGuardPasses,
    setScores,
    repRows,
  };
}

function DemoRunnerOverlay({
  phase,
  open,
  onClose,
}: {
  phase: PhaseLabel;
  open: boolean;
  onClose: () => void;
}) {
  const drillStructure = DIAGNOSIS_SETS_BY_PHASE[phase];
  const [currentSet, setCurrentSet] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentSet(0);
    setCurrentRep(0);
    setObservations({});
    setSubmitSuccess(false);
  }, [open, phase]);

  const currentSetConfig = drillStructure[currentSet];
  const fields = currentSetConfig ? getObservationBlockForRep(currentSetConfig, currentRep) : [];
  const isFirstSet = currentSet === 0;
  const isFirstRep = currentRep === 0;
  const isLastSet = currentSet === drillStructure.length - 1;
  const isLastRep = currentRep === currentSetConfig.reps - 1;

  const canAdvance = fields.every((field) => {
    return Boolean(observations[observationKey(currentSet, currentRep, field.key)]);
  });

  const summary = useMemo(() => buildDemoSummary(phase, drillStructure, observations), [phase, drillStructure, observations]);

  const handleObservation = (fieldKey: string, option: string) => {
    setObservations((prev) => ({
      ...prev,
      [observationKey(currentSet, currentRep, fieldKey)]: option,
    }));
  };

  const handleBack = () => {
    if (submitSuccess) {
      setSubmitSuccess(false);
      setCurrentSet(drillStructure.length - 1);
      setCurrentRep(drillStructure[drillStructure.length - 1].reps - 1);
      return;
    }
    if (isFirstSet && isFirstRep) return;
    if (currentRep > 0) {
      setCurrentRep((prev) => prev - 1);
      return;
    }
    const previousSet = drillStructure[currentSet - 1];
    setCurrentSet((prev) => prev - 1);
    setCurrentRep(previousSet.reps - 1);
  };

  const handleNext = () => {
    if (isLastSet && isLastRep) {
      setSubmitSuccess(true);
      return;
    }
    if (currentRep < currentSetConfig.reps - 1) {
      setCurrentRep((prev) => prev + 1);
      return;
    }
    setCurrentSet((prev) => prev + 1);
    setCurrentRep(0);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="border-b bg-card/95">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Interactive Demo</Badge>
                <Badge variant="outline">{phase}</Badge>
                <Badge variant="outline">Demo only. Nothing is saved.</Badge>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Full-Screen Drill Runner Sandbox</h2>
              <p className="text-sm text-muted-foreground">
                Explore the live drill flow, select observations, and submit a demo result with no persistence.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close demo runner">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            {!submitSuccess ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="space-y-4 p-4 sm:p-5">
                      {isFirstSet && isFirstRep && (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                          <div className="mb-1 font-semibold text-foreground">Phase: {phase}</div>
                          <div className="mb-2 text-xs text-muted-foreground">{PHASE_CONTEXT[phase].purpose}</div>
                          <div className="flex flex-wrap gap-1">
                            {PHASE_CONTEXT[phase].constraints.map((rule) => (
                              <span
                                key={rule}
                                className="rounded border border-primary/20 bg-background px-2 py-0.5 text-xs font-medium"
                              >
                                {rule}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl border border-primary/15 bg-background p-3 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="font-semibold text-sm">
                            Set {currentSet + 1} / {drillStructure.length}: {currentSetConfig.setName}
                          </div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Rep {currentRep + 1} / {currentSetConfig.reps}
                          </div>
                        </div>
                        <div className="mb-3 text-xs text-muted-foreground">{currentSetConfig.purpose}</div>
                        <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 p-2">
                          <div className="mb-0.5 text-xs font-semibold text-primary">Rep instruction</div>
                          <div className="text-sm font-medium">{currentSetConfig.repInstruction}</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentSetConfig.activeRules.map((rule) => (
                            <span
                              key={rule}
                              className="rounded border border-primary/15 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="space-y-4 p-4 sm:p-5">
                      <div>
                        <p className="font-semibold">Rep Observation Capture</p>
                        <p className="text-sm text-muted-foreground">
                          Select what happened in this rep. The demo follows the same one-row-per-field structure as the live runner.
                        </p>
                      </div>

                      <form className="space-y-4">
                        {fields.map((field) => {
                          const selected = observations[observationKey(currentSet, currentRep, field.key)] || "";
                          const selectedIndex = field.options.indexOf(selected);
                          const selectedLevel = selectedIndex >= 0
                            ? observationLevelFromOptionIndex(selectedIndex, field.options.length)
                            : null;

                          return (
                            <div key={field.key}>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <label className="block font-medium">{field.label}</label>
                                {selectedLevel && <Badge variant="secondary">{selectedLevel}</Badge>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {field.options.map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                                      selected === option
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-primary/20 bg-background hover:bg-primary/5"
                                    }`}
                                    onClick={() => handleObservation(field.key, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </form>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="space-y-3 p-4 sm:p-5">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Runner Progress</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-muted/20 p-3">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Set</p>
                          <p className="mt-1 text-2xl font-semibold">{currentSet + 1}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Rep</p>
                          <p className="mt-1 text-2xl font-semibold">{currentRep + 1}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Fields</p>
                          <p className="mt-1 text-2xl font-semibold">{fields.length}</p>
                        </div>
                      </div>
                      <div className="rounded-lg border bg-primary/5 p-3 text-sm text-muted-foreground">
                        Submit is local only. It opens a demo result screen and does not update any student, topic, or report data.
                      </div>
                    </div>
                  </Card>

                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="space-y-3 p-4 sm:p-5">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Resolved Demo Direction</p>
                      <div>
                        <p className="text-sm text-muted-foreground">Current projected stability</p>
                        <p className="text-lg font-semibold">{summary.stability}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next action</p>
                        <p className="font-semibold">{summary.nextAction}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Constraint</p>
                        <p className="font-medium">{summary.constraint || "Follow phase constraints"}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-background text-primary hover:bg-background">Demo Submitted</Badge>
                      <Badge variant="outline">{phase}</Badge>
                    </div>
                    <h3 className="text-2xl font-bold">Demo Result Screen</h3>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                      This mirrors the post-submit feel of the live runner, but it is local-only. No session is recorded, no topic state changes, and no backend call is made.
                    </p>
                  </div>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Diagnosis Score</p>
                      <p className="mt-2 text-3xl font-semibold tabular-nums">{summary.diagnosisScore}/100</p>
                    </div>
                  </Card>
                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Resolved Stability</p>
                      <p className="mt-2 text-3xl font-semibold">{summary.stability}</p>
                    </div>
                  </Card>
                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Next Action</p>
                      <p className="mt-2 font-semibold">{summary.nextAction}</p>
                    </div>
                  </Card>
                  <Card className="border-primary/15 bg-background shadow-sm">
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">High Guard</p>
                      <p className="mt-2 text-3xl font-semibold">{summary.highGuardPasses ? "Pass" : "Fail"}</p>
                    </div>
                  </Card>
                </div>

                <Card className="border-primary/15 bg-background shadow-sm">
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="font-semibold">Per-Rep Scoring</p>
                      <p className="text-sm text-muted-foreground">
                        The demo runner scores option positions locally and rolls them into rep and set totals using the same phase weight model.
                      </p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {drillStructure.slice(0, 2).map((setConfig, index) => (
                        <div key={setConfig.setName} className="overflow-hidden rounded-xl border border-primary/15 bg-background">
                          <div className="flex items-center justify-between bg-primary/5 px-4 py-2">
                            <span className="font-semibold text-sm">{setConfig.setName}</span>
                            <span className="text-sm text-muted-foreground">
                              Set Total: <strong>{summary.setScores[index] || 0}/100</strong>
                            </span>
                          </div>
                          <div className="divide-y">
                            {summary.repRows
                              .filter((row) => row.set === setConfig.setName)
                              .map((row) => (
                                <div key={`${row.set}-${row.rep}`} className="flex items-center justify-between px-4 py-2 text-sm">
                                  <span className="text-muted-foreground">Rep {row.rep}</span>
                                  <span className="font-medium">{row.repScore}/100</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Constraint</p>
                      <p className="mt-1 font-medium">{summary.constraint || "Follow phase constraints"}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-card/95">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Button variant="outline" onClick={handleBack} disabled={!submitSuccess && isFirstSet && isFirstRep}>
              Back
            </Button>
            <div className="flex items-center gap-3">
              {submitSuccess ? (
                <>
                  <Button variant="outline" onClick={() => {
                    setCurrentSet(0);
                    setCurrentRep(0);
                    setObservations({});
                    setSubmitSuccess(false);
                  }}>
                    Restart Demo
                  </Button>
                  <Button onClick={onClose}>Close Demo</Button>
                </>
              ) : (
                <Button onClick={handleNext} disabled={!canAdvance}>
                  {isLastSet && isLastRep ? "Submit Demo Drill" : "Next"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResponseConditioningLoggingSystem() {
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<PhaseLabel>("Structured Execution");
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/responseconditioningsystem")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Response Conditioning System
          </Button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                TT-OS Deep Dive
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Logging System</h1>
              <p className="mt-1 text-muted-foreground">
                Drill-runner observation capture, scoring, and deterministic session output
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <Card className="space-y-6 border-2 border-primary/20 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Interactive Demo</Badge>
            <Badge variant="outline">Full-screen runner sandbox</Badge>
            <Badge variant="outline">No persistence</Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">What Logging Is in TT</h2>
            <p className="max-w-4xl text-muted-foreground">
              Logging is the observation spine inside the drill runner. It is not a free-text tutor
              form. It is the capture of rep behavior, the scoring of that behavior, and the system
              output that follows from that score.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/60 p-4 md:p-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h3 className="text-xl font-bold">Choose a Drill and Open the Runner</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pick one of the four TT phases, then open a full-screen interactive drill runner.
                    You can move through sets and reps, select observations, and submit a demo result
                    without changing any real data.
                  </p>
                </div>
                <Button onClick={() => setDemoOpen(true)} className="w-full sm:w-auto">
                  <Expand className="mr-2 h-4 w-4" />
                  Open Full-Screen Demo
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {PHASES.map((phase) => {
                  const isActive = phase === selectedPhase;
                  return (
                    <button
                      type="button"
                      key={phase}
                      onClick={() => setSelectedPhase(phase)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-background hover:border-primary/30 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{phase}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {PHASE_CONTEXT[phase].purpose}
                          </p>
                        </div>
                        {isActive && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-2xl border border-primary/15 bg-background p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Selected Demo</p>
                  <h4 className="mt-2 text-xl font-semibold">{selectedPhase}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{PHASE_CONTEXT[selectedPhase].purpose}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {PHASE_CONTEXT[selectedPhase].constraints.map((rule) => (
                      <span
                        key={rule}
                        className="rounded border border-primary/20 bg-primary/5 px-2 py-1 text-xs"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/15 bg-background p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">What Opens</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Real set and rep flow from the phase drill structure</li>
                    <li>Interactive observation buttons for every rep field</li>
                    <li>Back and next navigation just like the live runner</li>
                    <li>Demo-only submit screen with local scoring and next action</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-bold">Primary Rules</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-bold">Observation Scoring Logic</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {scoringRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-bold">Logging Flow in the Runner</h2>
          <ol className="space-y-1 pl-4 text-muted-foreground">
            {flow.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-bold">What the Runner Produces</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            {outputs.map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 border-2 border-primary/20 p-6">
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

        <Card className="space-y-4 border-2 border-primary/20 p-6">
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

      <DemoRunnerOverlay
        phase={selectedPhase}
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
}
