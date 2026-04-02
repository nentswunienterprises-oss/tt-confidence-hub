import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

type PhaseLabel = "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability";
type DrillMode = "diagnosis" | "training";
type ObservationField = { key: string; label: string; options: string[] };
type DrillSetConfig = {
  setName: string;
  reps: number;
  purpose: string;
  repInstruction: string;
  isModelingSet?: boolean;
  activeRules: string[];
  observationBlock?: ObservationField[];
  repObservationBlocks?: ObservationField[][];
};

const PHASE_CONTEXT: Record<PhaseLabel, { purpose: string; constraints: string[] }> = {
  Clarity: {
    purpose: "Can the student see the problem clearly before solving? Clarity = naming what's there, recognizing the method, understanding why. If this fails — everything else collapses.",
    constraints: ["No Boss Battles", "No time pressure", "No skipping layers"],
  },
  "Structured Execution": {
    purpose: "Test and build ability to execute the known method independently. Student knows — now prove they can do it alone, repeatably.",
    constraints: ["State steps before solving", "No guessing tolerated", "No skipping steps"],
  },
  "Controlled Discomfort": {
    purpose: "Test and stabilize behavior under uncertainty and difficulty. Does the student persist — or shut down?",
    constraints: ["No full rescue", "Hold discomfort window", "One-step confirmation max"],
  },
  "Time Pressure Stability": {
    purpose: "Maintain method structure under urgency. Structure is the target — speed is secondary.",
    constraints: ["Method over speed", "Timer is active", "Structured response required — no panic tolerance"],
  },
};

// ---------------------------------------------------------------------------
// DRILL SET CONFIGURATIONS
// Each set carries: purpose (why), repInstruction (what tutor says/does),
// activeRules (constraints live during this set), and per-rep observation blocks.
// ---------------------------------------------------------------------------
const DIAGNOSIS_SETS_BY_PHASE: Record<PhaseLabel, DrillSetConfig[]> = {
  Clarity: [
    {
      setName: "Recognition Probe",
      reps: 3,
      purpose: "Student does NOT solve. Tests vocabulary, type recognition, and step awareness only.",
      repInstruction: "Show the problem. Ask student to name terms, identify type, and state the steps. Do not let them solve.",
      activeRules: ["Student does not solve", "Recognition only — no execution", "No hints or steps from tutor"],
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
      activeRules: ["No help for 10 seconds", "Observe cold start behavior", "Record exactly what happens - no prompting"],
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
      activeRules: ["Similar problem - same method", "No step-by-step guidance", "Observe consistency across reps"],
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
      activeRules: ["No help for 10 seconds", "Hold the discomfort window", "Do not rescue - observe"],
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
      activeRules: ["One-step confirmation only", "No rescue allowed", "Hold pressure - do not relieve it"],
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
      activeRules: ["Timer is active", "Observe structure - not just speed", "Record panic vs controlled response"],
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
      activeRules: ["Same timer", "Observe drift and consistency", "Behavioral pattern - not just completion"],
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

const TRAINING_SETS_BY_PHASE: Record<PhaseLabel, DrillSetConfig[]> = {
  Clarity: [
    {
      setName: "Modeling",
      reps: 3,
      purpose: "Build the mental map. Tutor models Vocab → Method → Reason. Student explains back. This is TEACHING - not drilling.",
      repInstruction: "Model the problem step-by-step: name the vocabulary, demonstrate the method, explain the reason it works. After each model, ask student to explain back in their own words.",
      isModelingSet: true,
      activeRules: ["Tutor models - student does NOT solve", "Vocab → Method → Reason sequence", "Ask student to explain back after each model"],
      repObservationBlocks: [
        [
          { key: "vocabulary", label: "Vocabulary Recognition (Rep 1)", options: ["cannot name", "partial", "clear"] },
          { key: "method", label: "Method Awareness (Rep 1)", options: ["cannot state steps", "incomplete steps", "clear steps"] },
          { key: "reason", label: "Reason Awareness (Rep 1)", options: ["no idea why", "vague", "clear logic"] },
          { key: "immediateApply", label: "Engagement (Rep 1)", options: ["passive", "following", "actively tracking"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary Recognition (Rep 2)", options: ["cannot name", "partial", "clear"] },
          { key: "method", label: "Method Awareness (Rep 2)", options: ["cannot state steps", "incomplete steps", "clear steps"] },
          { key: "reason", label: "Reason Awareness (Rep 2)", options: ["no idea why", "vague", "clear logic"] },
          { key: "immediateApply", label: "Explain-Back Response (Rep 2)", options: ["cannot repeat / avoids", "partial", "independent"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary Recognition (Rep 3)", options: ["cannot name", "partial", "clear"] },
          { key: "method", label: "Method Awareness (Rep 3)", options: ["cannot state steps", "incomplete steps", "clear steps"] },
          { key: "reason", label: "Reason Awareness (Rep 3)", options: ["no idea why", "vague", "clear logic"] },
          { key: "immediateApply", label: "Immediate Apply Readiness (Rep 3)", options: ["cannot repeat / avoids", "partial", "independent"] },
        ],
      ],
    },
    {
      setName: "Identification",
      reps: 3,
      purpose: "Recognition without solving. Student names terms, identifies type, states steps, explains why.",
      repInstruction: "Show the problem. Ask student to: name the terms, identify the type, state the steps, explain why it works. No solving allowed.",
      activeRules: ["No solving allowed", "Push for vocabulary precision", "All 4 layers: terms, type, steps, reason"],
      repObservationBlocks: [
        [
          { key: "vocabulary", label: "Type Recognition (Rep 1)", options: ["wrong", "hesitant", "correct"] },
          { key: "method", label: "Step Recall (Rep 1)", options: ["missing", "partial", "clear"] },
          { key: "reason", label: "Reason Recall (Rep 1)", options: ["none", "weak", "clear"] },
          { key: "immediateApply", label: "Response Behavior (Rep 1)", options: ["avoids answering", "unsure but tries", "confident"] },
        ],
        [
          { key: "vocabulary", label: "Type Recognition (Rep 2)", options: ["wrong", "hesitant", "correct"] },
          { key: "method", label: "Step Recall (Rep 2)", options: ["missing", "partial", "clear"] },
          { key: "reason", label: "Reason Recall (Rep 2)", options: ["none", "weak", "clear"] },
          { key: "immediateApply", label: "Response Behavior (Rep 2)", options: ["avoids answering", "unsure but tries", "confident"] },
        ],
        [
          { key: "vocabulary", label: "Type Recognition (Rep 3)", options: ["wrong", "hesitant", "correct"] },
          { key: "method", label: "Step Recall (Rep 3)", options: ["missing", "partial", "clear"] },
          { key: "reason", label: "Reason Recall (Rep 3)", options: ["none", "weak", "clear"] },
          { key: "immediateApply", label: "Response Behavior (Rep 3)", options: ["avoids answering", "unsure but tries", "confident"] },
        ],
      ],
    },
    {
      setName: "Light Apply",
      reps: 3,
      purpose: "Test clarity under active solving. Minimal guidance only. Observe whether clarity holds when they execute.",
      repInstruction: "Ask student to solve. Minimal guidance. Observe clarity under execution.",
      activeRules: ["Minimal guidance only", "No step-by-step help", "Observe independent start and execution"],
      repObservationBlocks: [
        [
          { key: "vocabulary", label: "Vocabulary Usage (Rep 1)", options: ["incorrect", "partial", "correct"] },
          { key: "method", label: "Step Execution (Rep 1)", options: ["skips", "inconsistent", "structured"] },
          { key: "reason", label: "Reason Usage (Rep 1)", options: ["absent", "weak", "present"] },
          { key: "immediateApply", label: "Start Behavior (Rep 1)", options: ["delayed", "hesitant", "immediate"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary Usage (Rep 2)", options: ["incorrect", "partial", "correct"] },
          { key: "method", label: "Step Execution (Rep 2)", options: ["skips", "inconsistent", "structured"] },
          { key: "reason", label: "Reason Usage (Rep 2)", options: ["absent", "weak", "present"] },
          { key: "immediateApply", label: "Start Behavior (Rep 2)", options: ["delayed", "hesitant", "immediate"] },
        ],
        [
          { key: "vocabulary", label: "Vocabulary Usage (Rep 3)", options: ["incorrect", "partial", "correct"] },
          { key: "method", label: "Step Execution (Rep 3)", options: ["skips", "inconsistent", "structured"] },
          { key: "reason", label: "Reason Usage (Rep 3)", options: ["absent", "weak", "present"] },
          { key: "immediateApply", label: "Start Behavior (Rep 3)", options: ["delayed", "hesitant", "immediate"] },
        ],
      ],
    },
  ],
  "Structured Execution": [
    {
      setName: "Forced Structure",
      reps: 3,
      purpose: "Force structured execution. Student must state all steps first, then solve. Build discipline before independence.",
      repInstruction: "State steps first. Then solve.",
      activeRules: ["Steps must be stated before solving", "No skipping steps", "Correct step order required"],
      observationBlock: [
        { key: "startBehavior", label: "Start", options: ["delayed", "hesitant", "immediate"] },
        { key: "stepExecution", label: "Step Discipline", options: ["skips", "partial", "full"] },
        { key: "repeatability", label: "Correction Response", options: ["resists", "accepts", "adjusts"] },
        { key: "independence", label: "Independence", options: ["needs help", "light support", "independent"] },
      ],
    },
    {
      setName: "Independent Execution",
      reps: 3,
      purpose: "Full independent execution without any help. Build consistent, repeatable execution.",
      repInstruction: "Solve independently.",
      activeRules: ["No help from tutor", "Full independence expected", "Observe consistency and error handling"],
      observationBlock: [
        { key: "independence", label: "Independence", options: ["needs help", "light support", "independent"] },
        { key: "repeatability", label: "Consistency", options: ["breaks", "inconsistent", "stable"] },
        { key: "stepExecution", label: "Error Handling", options: ["guesses", "partial correction", "structured correction"] },
        { key: "startBehavior", label: "Start", options: ["delayed", "hesitant", "immediate"] },
      ],
    },
    {
      setName: "Variation Control",
      reps: 3,
      purpose: "Test transfer. Student adapts to a slightly different form using the same method. Method must survive variation.",
      repInstruction: "Solve slightly different form.",
      activeRules: ["Same method - different form", "Test transfer not memorization", "No hints on what changed"],
      observationBlock: [
        { key: "stepExecution", label: "Transfer", options: ["cannot adapt", "partial", "adapts"] },
        { key: "repeatability", label: "Step Retention", options: ["lost", "partial", "stable"] },
        { key: "independence", label: "Completion", options: ["fails", "partial", "complete"] },
        { key: "startBehavior", label: "Start", options: ["delayed", "hesitant", "immediate"] },
      ],
    },
  ],
  "Controlled Discomfort": [
    {
      setName: "Controlled Entry",
      reps: 3,
      purpose: "Build controlled entry under difficulty. Force a pause before the first action.",
      repInstruction: "Pause. Then state the first step.",
      activeRules: ["Force a pause before starting", "First step must be stated out loud", "Do not let them jump in"],
      observationBlock: [
        { key: "initialResponse", label: "Start Control", options: ["freeze", "hesitant", "controlled"] },
        { key: "firstStepControl", label: "First-Step Accuracy", options: ["wrong", "partial", "correct"] },
        { key: "discomfortTolerance", label: "Stability", options: ["breaks", "unstable", "stable"] },
        { key: "rescueDependence", label: "Rescue Behavior", options: ["frequent", "occasional", "none"] },
      ],
    },
    {
      setName: "No Rescue",
      reps: 3,
      purpose: "Build independence under difficulty. No rescue under any circumstance.",
      repInstruction: "Continue. No full help.",
      activeRules: ["No rescue allowed", "Hold the hold - do not relieve", "Observe rescue-seeking pattern"],
      observationBlock: [
        { key: "rescueDependence", label: "Independence", options: ["dependent", "partial", "independent"] },
        { key: "discomfortTolerance", label: "Stability", options: ["breaks", "unstable", "stable"] },
        { key: "initialResponse", label: "Recovery", options: ["collapses", "partial", "recovers"] },
        { key: "firstStepControl", label: "First-Step Control", options: ["none", "prompted", "independent"] },
      ],
    },
    {
      setName: "Repeat Exposure",
      reps: 3,
      purpose: "Repeat exposure to build tolerance. Same difficulty level. The target is stability - not just survival.",
      repInstruction: "Another similar difficulty.",
      activeRules: ["Same difficulty level", "Repeat exposure - build tolerance", "Observe consistency of response"],
      observationBlock: [
        { key: "discomfortTolerance", label: "Consistency", options: ["breaks", "inconsistent", "stable"] },
        { key: "initialResponse", label: "Recovery", options: ["collapses", "partial", "recovers"] },
        { key: "rescueDependence", label: "Rescue Behavior", options: ["frequent", "occasional", "none"] },
        { key: "firstStepControl", label: "First-Step Control", options: ["none", "prompted", "independent"] },
      ],
    },
  ],
  "Time Pressure Stability": [
    {
      setName: "Structure Under Timer",
      reps: 3,
      purpose: "Build structured execution under a timer. Method is priority - speed is secondary.",
      repInstruction: "Focus on method, not speed.",
      activeRules: ["Timer active", "Method priority - not speed", "Structure must be maintained throughout"],
      observationBlock: [
        { key: "startUnderTime", label: "Start", options: ["panic", "hesitant", "controlled"] },
        { key: "structureUnderTime", label: "Structure", options: ["lost", "partial", "maintained"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
        { key: "completionIntegrity", label: "Completion", options: ["fails", "partial", "complete"] },
      ],
    },
    {
      setName: "Repeated Timed Execution",
      reps: 3,
      purpose: "Build consistency under repeated timed execution. Same constraint - look for drift.",
      repInstruction: "Repeat under timer.",
      activeRules: ["Same timer constraint", "Build consistency - not just completion", "Observe pace regulation"],
      observationBlock: [
        { key: "completionIntegrity", label: "Consistency", options: ["breaks", "inconsistent", "stable"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
        { key: "structureUnderTime", label: "Structure", options: ["lost", "partial", "maintained"] },
        { key: "startUnderTime", label: "Start", options: ["panic", "hesitant", "controlled"] },
      ],
    },
    {
      setName: "Full Constraint",
      reps: 3,
      purpose: "Full constraint drill. Tighter time - structure and completion integrity both tested.",
      repInstruction: "Solve under tighter time.",
      activeRules: ["Tighter timer", "Full constraint - no relief", "Structure + completion both required"],
      observationBlock: [
        { key: "completionIntegrity", label: "Completion", options: ["fails", "partial", "complete"] },
        { key: "structureUnderTime", label: "Integrity", options: ["collapses", "unstable", "stable"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
        { key: "startUnderTime", label: "Start", options: ["panic", "hesitant", "controlled"] },
      ],
    },
  ],
};

function normalizePhase(value: string | null): PhaseLabel {
  const v = String(value || "").toLowerCase();
  if (v.includes("clarity")) return "Clarity";
  if (v.includes("structured")) return "Structured Execution";
  if (v.includes("discomfort")) return "Controlled Discomfort";
  if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
  return "Clarity";
}

function buildDrillStructure(mode: DrillMode, phase: PhaseLabel) {
  return mode === "training" ? TRAINING_SETS_BY_PHASE[phase] : DIAGNOSIS_SETS_BY_PHASE[phase];
}

function getObservationBlockForRep(setConfig: DrillSetConfig, repIndex: number): ObservationField[] {
  if (setConfig.repObservationBlocks && setConfig.repObservationBlocks[repIndex]) {
    return setConfig.repObservationBlocks[repIndex];
  }
  return setConfig.observationBlock || [];
}

export default function IntroSessionDrillRunner() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentSet, setCurrentSet] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [observations, setObservations] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [scoring, setScoring] = useState<any[] | null>(null);

  const drillMode: DrillMode = searchParams.get("mode") === "training" ? "training" : "diagnosis";
  const phase = normalizePhase(searchParams.get("phase"));
  const drillStructure = useMemo(() => buildDrillStructure(drillMode, phase), [drillMode, phase]);
  const previousStability = String(searchParams.get("stability") || "").trim() || null;

  const introTopic = useMemo(() => {
    const raw = searchParams.get("topic") || "";
    return String(raw).trim();
  }, [searchParams]);

  const hasIntroTopic = !!introTopic;

  const set = drillStructure[currentSet];
  const isFirstRep = currentRep === 0;
  const isFirstSet = currentSet === 0;
  const isLastRep = currentRep === set.reps - 1;
  const isLastSet = currentSet === drillStructure.length - 1;

  const handleExitToPod = () => {
    navigate("/tutor/pod");
  };

  const handleBackStep = () => {
    if (submitting || submitSuccess) return;
    if (!isFirstRep) {
      setCurrentRep((r) => r - 1);
      return;
    }
    if (!isFirstSet) {
      const previousSetIndex = currentSet - 1;
      const previousSet = drillStructure[previousSetIndex];
      setCurrentSet(previousSetIndex);
      setCurrentRep(previousSet.reps - 1);
    }
  };

  const handleObservation = (field: string, value: string) => {
    setSubmitError(null);
    setObservations((prev: any) => ({
      ...prev,
      [`set${currentSet}_rep${currentRep}_${field}`]: value,
    }));
  };

  const getMissingFieldsForRep = (setIndex: number, repIndex: number) => {
    const repSet = drillStructure[setIndex];
    const observationBlock = getObservationBlockForRep(repSet, repIndex);
    return observationBlock.filter(
      (field) => !String(observations[`set${setIndex}_rep${repIndex}_${field.key}`] || "").trim()
    );
  };

  const getFirstMissingRep = () => {
    for (let setIndex = 0; setIndex < drillStructure.length; setIndex++) {
      const repSet = drillStructure[setIndex];
      for (let repIndex = 0; repIndex < repSet.reps; repIndex++) {
        const missing = getMissingFieldsForRep(setIndex, repIndex);
        if (missing.length > 0) {
          return { setIndex, repIndex, label: missing[0].label };
        }
      }
    }
    return null;
  };

  const handleNext = async () => {
    if (!hasIntroTopic) {
      setSubmitError("Diagnostic topic is required. Please return and set Add Diagnostic Topic first.");
      return;
    }

    const missingCurrent = getMissingFieldsForRep(currentSet, currentRep);
    if (missingCurrent.length > 0) {
      setSubmitError(`Complete all observation toggles before continuing. Missing: ${missingCurrent.map((field) => field.label).join(", ")}.`);
      return;
    }

    if (!isLastRep) {
      setCurrentRep((r) => r + 1);
    } else if (!isLastSet) {
      setCurrentSet((s) => s + 1);
      setCurrentRep(0);
    } else {
      // Submit observations to backend for scoring
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      setScoring(null);
      try {
        const firstMissing = getFirstMissingRep();
        if (firstMissing) {
          setCurrentSet(firstMissing.setIndex);
          setCurrentRep(firstMissing.repIndex);
          setSubmitError(
            `Set ${firstMissing.setIndex + 1}, Rep ${firstMissing.repIndex + 1} is incomplete. Missing: ${firstMissing.label}.`
          );
          setSubmitting(false);
          return;
        }

        const payload = {
          studentId,
          introTopic,
          trainingTopic: introTopic,
          phase,
          previousStability,
          drillType: drillMode,
          drill: drillStructure.map((set, setIdx) => ({
            setName: set.setName,
            reps: set.reps,
            observations: Array.from({ length: set.reps }).map((_, repIdx) => {
              const obs: Record<string, string> = {};
              const observationBlock = getObservationBlockForRep(set, repIdx);
              observationBlock.forEach((block) => {
                obs[block.key] = observations[`set${setIdx}_rep${repIdx}_${block.key}`] || "";
              });
              return obs;
            }),
          })),
        };
        const endpoint = drillMode === "training"
          ? "/api/tutor/training-session-drill"
          : "/api/tutor/intro-session-drill";
        const res = await axios.post(endpoint, payload);
        setSubmitSuccess(true);
        setScoring(res.data?.scoring || null);
      } catch (err: any) {
        setSubmitError(err?.response?.data?.message || "Submission failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="px-3 py-2 rounded border bg-background"
          onClick={handleExitToPod}
        >
          Exit to Pod
        </button>
      </div>
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-900">
          Drill submitted successfully! Observations have been sent for automated scoring.
        </div>
      )}
      {scoring && scoring.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">System Scoring Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 border">Set</th>
                  <th className="px-2 py-1 border">Rep</th>
                  <th className="px-2 py-1 border">Score</th>
                  <th className="px-2 py-1 border">Phase</th>
                  <th className="px-2 py-1 border">Stability</th>
                  <th className="px-2 py-1 border">Next Action</th>
                  <th className="px-2 py-1 border">Constraint</th>
                </tr>
              </thead>
              <tbody>
                {scoring.map((row, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="px-2 py-1 border">{row.set}</td>
                    <td className="px-2 py-1 border">{row.rep}</td>
                    <td className="px-2 py-1 border">{row.sessionScore}</td>
                    <td className="px-2 py-1 border">{row.phase}</td>
                    <td className="px-2 py-1 border">{row.stability}</td>
                    <td className="px-2 py-1 border">{row.nextAction}</td>
                    <td className="px-2 py-1 border">{row.constraint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Show summary of last scoring result */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="font-semibold mb-1">System Interpretation:</div>
            <div>
              <strong>Phase:</strong> {scoring[scoring.length - 1]?.phase} &nbsp;|
              <strong> Stability:</strong> {scoring[scoring.length - 1]?.stability} &nbsp;|
              <strong> Next Action:</strong> {scoring[scoring.length - 1]?.nextAction}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              <strong>Constraint:</strong> {scoring[scoring.length - 1]?.constraint}
            </div>
          </div>
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-900">
          {submitError}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2">
        {drillMode === "training"
          ? `Training Drill - ${phase}`
          : `Intro Session - ${phase} Diagnostic Drill`}
      </h2>
      <p className="mb-2 text-sm">
        <span className="font-semibold">Diagnostic Topic:</span>{" "}
        {hasIntroTopic ? introTopic : "Not set"}
      </p>
      {!hasIntroTopic && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
          No diagnostic topic was provided. Go back to the student card and use Add Diagnostic Topic before opening the intro session.
        </div>
      )}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="font-semibold mb-1">Instructions:</p>
        <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
          <li>
            {drillMode === "training"
              ? "This drill is for system-driven training progression. Follow the structure exactly."
              : "This drill is for system-driven diagnostics. Follow the structure exactly."}
          </li>
          <li><strong>Before you begin:</strong> Prepare <span className="font-semibold">3 distinct problems</span> for each set (e.g., Recognition Probe, Light Apply Probe). You will need one unique problem per rep, per set. Do not repeat problems within a set.</li>
          <li>For each set and rep, present the prepared problem, observe the student, and select the option that best matches their behavior for each field.</li>
          <li>You cannot skip steps or edit outside the drill structure. Complete each observation in order.</li>
          <li>
            {drillMode === "training"
              ? "When finished, observations are scored and the topic state map updates automatically."
              : "When finished, observations are submitted for automated scoring and proposal linkage."}
          </li>
        </ul>
      </div>
      <p className="mb-4 text-muted-foreground">Student ID: {studentId}</p>

      {/* Phase-level context bar — stays constant throughout the drill */}
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
        <div className="font-semibold text-slate-700 mb-1">Phase: {phase}</div>
        <div className="text-slate-600 text-xs mb-2">{PHASE_CONTEXT[phase].purpose}</div>
        <div className="flex flex-wrap gap-1">
          {PHASE_CONTEXT[phase].constraints.map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs font-medium">✕ {c}</span>
          ))}
        </div>
      </div>

      {/* Modeling session callout - shown only for Clarity Training Set 1 */}
      {set.isModelingSet && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="font-bold text-amber-900 text-sm mb-1">⬛ MODELING SESSION - Teaching before the drill</div>
          <div className="text-amber-800 text-xs leading-relaxed">
            You model. Student does <strong>NOT</strong> solve yet. This set is Pre-Drill teaching.<br />
            Sequence: <strong>Vocabulary → Method → Reason</strong>. Ask student to explain back after each model.<br />
            Sets 2 and 3 are the main drill. Do not skip this set.
          </div>
        </div>
      )}

      {/* Set context block — purpose, rep instruction, active rules */}
      <div className="mb-4 p-3 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm flex items-center gap-2">
            Set {currentSet + 1} / {drillStructure.length}: {set.setName}
            {set.isModelingSet && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-xs border border-amber-200">Modeling</span>
            )}
          </div>
          <div className="text-sm font-medium text-muted-foreground">Rep {currentRep + 1} / {set.reps}</div>
        </div>
        <div className="text-xs text-slate-500 mb-3">{set.purpose}</div>
        <div className="p-2 bg-blue-50 border border-blue-200 rounded mb-3">
          <div className="text-xs font-semibold text-blue-700 mb-0.5">→ Rep instruction</div>
          <div className="text-sm text-blue-900 font-medium">{set.repInstruction}</div>
        </div>
        <div className="flex flex-wrap gap-1">
          {set.activeRules.map((rule, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded text-xs">{rule}</span>
          ))}
        </div>
      </div>

      <form className="space-y-4">
        {getObservationBlockForRep(set, currentRep).map((obs) => (
          <div key={obs.key}>
            <label className="block font-medium mb-1">{obs.label}</label>
            <div className="flex gap-2">
              {obs.options.map((option: string) => (
                <button
                  type="button"
                  key={option}
                  className={`px-3 py-1 rounded border ${observations[`set${currentSet}_rep${currentRep}_${obs.key}`] === option ? "bg-primary text-white" : "bg-muted"}`}
                  onClick={() => handleObservation(obs.key, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </form>
      <div className="mt-6 flex justify-end">
        {!submitSuccess && (
          <button
            type="button"
            className="mr-2 px-4 py-2 rounded border bg-background disabled:opacity-60"
            onClick={handleBackStep}
            disabled={submitting || (isFirstSet && isFirstRep)}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60"
          onClick={handleNext}
          disabled={submitting || submitSuccess || !hasIntroTopic}
        >
          {submitting
            ? "Submitting..."
            : isLastSet && isLastRep
            ? "Submit Drill"
            : "Next"}
        </button>
      </div>
      {submitSuccess && (
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded border bg-background"
            onClick={handleExitToPod}
          >
            Back to Pod
          </button>
          {drillMode === "diagnosis" && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-primary text-white"
              onClick={handleExitToPod}
            >
              Continue to Proposal
            </button>
          )}
        </div>
      )}
    </div>
  );
}
