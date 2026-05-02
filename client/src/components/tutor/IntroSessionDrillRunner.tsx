import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { observationLevelFromOptionIndex } from "@shared/observationScoring";
import { tryParsePhase } from "@shared/topicConditioningEngine";
import {
  computeAdaptiveDiagnosisPhaseSummary,
  getAdjacentDiagnosisPhase,
} from "@shared/adaptiveDiagnosis";
import { useStudentWorkflowState } from "@/hooks/useStudentWorkflowState";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/config";

type PhaseLabel = "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability";
type DrillMode = "diagnosis" | "training" | "session" | "handover";
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

type VerificationPrepSpec = {
  title: string;
  objective: string;
  problemPlan: string;
  problemCoverage?: string[];
  totalProblems?: number;
  tutorRules: string[];
  derivedFrom: string;
  checklist: string[];
};

type AdaptiveTransitionState = {
  currentPhase: PhaseLabel;
  nextPhase: PhaseLabel;
  phaseScore: number;
  direction: "escalate" | "de-escalate";
  currentBlock: {
    phase: PhaseLabel;
    setName: string;
    observations: Array<Record<string, string>>;
  };
};

function explainAdaptiveTransition(
  currentPhase: PhaseLabel,
  nextPhase: PhaseLabel,
  direction: "escalate" | "de-escalate",
) {
  if (direction === "escalate") {
    return `The student is already looking strong in ${currentPhase}, so the system is moving up to check how they hold in ${nextPhase}.`;
  }

  return `The student is not holding cleanly enough in ${currentPhase}, so the system is dropping down to ${nextPhase} to find the correct entry point.`;
}

type StudentListEntry = {
  id: string | number;
  fullName?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

const PHASE_CONTEXT: Record<PhaseLabel, { purpose: string; constraints: string[] }> = {
  Clarity: {
    purpose: "Can the student see the problem clearly before solving? Clarity is naming what's there, recognizing the method, understanding why. If this fails - everything else collapses.",
    constraints: ["No Boss Battles", "No time pressure", "No skipping layers"],
  },
  "Structured Execution": {
    purpose: "Test and build ability to execute the known method independently. Student knows - now prove they can do it alone, repeatably.",
    constraints: ["State steps before solving", "No guessing tolerated", "No skipping steps"],
  },
  "Controlled Discomfort": {
    purpose: "Test and stabilize behavior under uncertainty and difficulty. Does the student persist - or shut down?",
    constraints: ["No full rescue", "Hold discomfort window", "One-step confirmation max"],
  },
  "Time Pressure Stability": {
    purpose: "Maintain method structure under urgency. Structure is the target - speed is secondary.",
    constraints: ["Method over speed", "Timer is active", "Structured response required - no panic tolerance"],
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
      activeRules: ["Student does not solve", "Recognition only - no execution", "No hints or steps from tutor"],
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
      reps: 1,
      purpose: "Build the mental map before drilling.",
      repInstruction: "Teach Vocabulary → Method → Reason, then ask the student to explain back.",
      isModelingSet: true,
      activeRules: ["Tutor models - student does NOT solve", "Vocab → Method → Reason sequence", "Ask student to explain back after each model"],
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

const ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE: Record<PhaseLabel, DrillSetConfig> = {
  Clarity: DIAGNOSIS_SETS_BY_PHASE.Clarity[0],
  "Structured Execution": DIAGNOSIS_SETS_BY_PHASE["Structured Execution"][0],
  "Controlled Discomfort": DIAGNOSIS_SETS_BY_PHASE["Controlled Discomfort"][0],
  "Time Pressure Stability": DIAGNOSIS_SETS_BY_PHASE["Time Pressure Stability"][0],
};

function normalizePhase(value: string | null): PhaseLabel {
  return tryParsePhase(value) || "Clarity";
}

function buildDrillStructure(mode: DrillMode, phase: PhaseLabel) {
  if (mode === "training") {
    return TRAINING_SETS_BY_PHASE[phase];
  }
  if (mode === "handover") {
    return [ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE[phase]];
  }
  return DIAGNOSIS_SETS_BY_PHASE[phase];
}

function buildVerificationPrepSpec(
  phase: PhaseLabel,
  mode: "diagnosis" | "handover" | "handover_rediagnosis"
): VerificationPrepSpec {
  const diagnosisBlock = ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE[phase];
  const trainingSets = TRAINING_SETS_BY_PHASE[phase];
  const trainingReference = trainingSets
    .map((set) => set.setName)
    .join(" -> ");
  const phasePurpose = PHASE_CONTEXT[phase].purpose;
  const phaseRules = PHASE_CONTEXT[phase].constraints;
  const verificationRules = diagnosisBlock.activeRules;
  const previousPhase = getAdjacentDiagnosisPhase(phase, "previous");
  const nextPhase = getAdjacentDiagnosisPhase(phase, "next");
  const adaptiveCoverage = [previousPhase, phase, nextPhase].filter(Boolean) as PhaseLabel[];
  const adaptiveCoverageNotes = adaptiveCoverage
    .map((coveragePhase) => {
      const coverageBlock = ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE[coveragePhase];
      return `${coveragePhase}: ${coverageBlock.reps} ${coverageBlock.setName} problems`;
    });
  const adaptiveCoverageProblemTotal = adaptiveCoverage.reduce((total, coveragePhase) => {
    const coverageBlock = ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE[coveragePhase];
    return total + coverageBlock.reps;
  }, 0);

  if (mode === "diagnosis") {
    return {
      title: "Diagnosis Prep",
      objective: `Place the topic correctly inside ${phase}. ${phasePurpose}`,
      problemPlan: `Prepare the starting ${phase} block first. Also prepare the nearest phase below and above it, because the system may move there during diagnosis.`,
      problemCoverage: adaptiveCoverageNotes,
      totalProblems: adaptiveCoverageProblemTotal,
      tutorRules: [
        ...verificationRules,
        ...phaseRules,
        "Diagnosis is adaptive, so prep the starting phase and the nearest lower and higher phase where they exist.",
        "Do not expand into full training volume.",
      ],
      derivedFrom: `Derived from the ${phase} training lane and reduced to adaptive verification coverage around the ${diagnosisBlock.setName} block. Training reference: ${trainingReference}.`,
      checklist: [
        `I prepared the starting ${phase} block and the adjacent phase blocks the system may move into.`,
        `My diagnosis prep covers these phases: ${adaptiveCoverage.join(", ")}.`,
        "I will keep this as placement verification, not normal training.",
        `I will hold the ${phase} phase rules exactly as shown by the system.`,
      ],
    };
  }

  if (mode === "handover") {
    return {
      title: "Handover Prep",
      objective: `Verify whether the inherited ${phase} topic-state is still trustworthy. ${phasePurpose}`,
      problemPlan: `Prepare exactly ${diagnosisBlock.reps} clean verification problems at the inherited ${phase} level. Keep the same phase target, but do not open the full training drill.`,
      tutorRules: [
        ...verificationRules,
        ...phaseRules,
        "Do not reteach from scratch.",
        "Do not progress the student during verification.",
      ],
      derivedFrom: `Derived from the ${phase} training lane and reduced to the ${diagnosisBlock.setName} continuity-check block. Training reference: ${trainingReference}.`,
      checklist: [
        `I reviewed the inherited ${phase} / ${phase === "Clarity" ? "concept-entry" : "response-state"} before starting.`,
        `I prepared exactly ${diagnosisBlock.reps} clean ${phase} verification problems.`,
        "I will verify continuity only and will not restart or train forward.",
      ],
    };
  }

  return {
    title: "Targeted Re-Diagnosis Prep",
    objective: `Reclassify the current topic state inside ${phase} with no drift. ${phasePurpose}`,
    problemPlan: `Prepare exactly ${diagnosisBlock.reps} clean ${phase} phase-block problems. Use this to reclassify the flagged topic, not to open normal training.`,
    tutorRules: [
      ...verificationRules,
      ...phaseRules,
      "Resolve classification only for this flagged topic.",
      "Do not turn this into standard training.",
    ],
    derivedFrom: `Derived from the ${phase} diagnosis block, which itself is anchored to the ${phase} training structure. Training reference: ${trainingReference}.`,
    checklist: [
      `I prepared exactly ${diagnosisBlock.reps} clean ${phase} phase-block problems.`,
      "I will use this only to reclassify the flagged topic.",
      "I will not turn this targeted re-diagnosis into normal training.",
    ],
  };
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
  const [sessionTopicIndex, setSessionTopicIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  const [prepReady, setPrepReady] = useState(false);
  const [prepChecks, setPrepChecks] = useState<Record<string, boolean>>({});
  const [showModeInstructions, setShowModeInstructions] = useState(true);

  const requestedMode = searchParams.get("mode");
  const requestedContext = searchParams.get("context");
  const handoverReDiagnosisMode = requestedMode === "handover" && searchParams.get("rediagnosis") === "1";
  const drillMode: DrillMode =
    requestedMode === "training"
      ? "training"
      : requestedMode === "session"
        ? "session"
        : requestedMode === "handover"
          ? "handover"
          : "diagnosis";
  const isSessionMode = drillMode === "session";
  const scheduledSessionId = searchParams.get("scheduledSessionId") || "";
  const rawPhase = searchParams.get("phase");
  const parsedLaunchPhase = tryParsePhase(rawPhase);
  const phase = parsedLaunchPhase || "Clarity";
  const [activeDiagnosisPhase, setActiveDiagnosisPhase] = useState<PhaseLabel>(phase);
  const [adaptiveDiagnosisBlocks, setAdaptiveDiagnosisBlocks] = useState<Array<{
    phase: PhaseLabel;
    setName: string;
    observations: Array<Record<string, string>>;
  }>>([]);
  const [adaptiveDiagnosisMessage, setAdaptiveDiagnosisMessage] = useState<string | null>(null);
  const [adaptiveTransition, setAdaptiveTransition] = useState<AdaptiveTransitionState | null>(null);
  const previousStability = String(searchParams.get("stability") || "").trim() || null;

  const introTopic = useMemo(() => {
    const raw = searchParams.get("topic") || "";
    return String(raw).trim();
  }, [searchParams]);

  const sessionTopics = useMemo(() => {
    const raw = searchParams.get("topics") || "";
    return raw ? raw.split(',').map(t => decodeURIComponent(t).trim()).filter(Boolean) : [];
  }, [searchParams]);

  const { data: topicData, isLoading: topicDataLoading } = useQuery<{ topics: Array<{ topic: string; phase: string; stability: string }> } | undefined>({
    queryKey: ["/api/tutor/topic-conditioning", studentId],
    enabled: isSessionMode && !!studentId,
  });

  const currentSessionTopic = useMemo(() => {
    if (!isSessionMode || !topicData?.topics || sessionTopicIndex >= sessionTopics.length) return null;
    const topicName = sessionTopics[sessionTopicIndex];
    return topicData.topics.find((t: any) => t.topic === topicName) || null;
  }, [isSessionMode, topicData, sessionTopicIndex, sessionTopics]);

  const currentTopicPhase = currentSessionTopic?.phase || phase;
  const currentTopicStability = currentSessionTopic?.stability || previousStability;
  const currentTopicName = isSessionMode && sessionTopicIndex < sessionTopics.length 
    ? sessionTopics[sessionTopicIndex]
    : introTopic;
  const { data: workflow, isLoading: workflowLoading } = useStudentWorkflowState(studentId || "");
  const assignmentAccepted = workflow?.assignmentAccepted ?? true;
  const diagnosisSessionKind = requestedContext === "training" ? "training" : "intro";
  const sessionKind =
    drillMode === "diagnosis" ? diagnosisSessionKind : drillMode === "handover" ? "handover" : "training";

  useEffect(() => {
    setShowModeInstructions(true);
  }, [drillMode, handoverReDiagnosisMode, currentTopicName, activeDiagnosisPhase, studentId]);

  const {
    data: drillSessionAccess,
    isLoading: drillSessionAccessLoading,
  } = useQuery<any>({
    queryKey: ["/api/tutor/drill-session-access", studentId, sessionKind, scheduledSessionId],
    queryFn: async () => {
      const params = new URLSearchParams({ kind: sessionKind });
      if (scheduledSessionId) params.set("sessionId", scheduledSessionId);
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/drill-session-access?${params.toString()}`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to load drill session access (${res.status})`);
      }
      return res.json();
    },
    enabled: !!studentId,
    retry: false,
  });
  const canUseScheduledSession = drillSessionAccess?.canLaunch ?? false;
  const scheduledSession = drillSessionAccess?.session || null;

  const modeToUse: DrillMode = isSessionMode ? "training" : drillMode;
  const isAdaptiveDiagnosisMode = modeToUse === "diagnosis";
  const isHandoverMode = modeToUse === "handover";
  const isAdaptiveVerificationFlow = isAdaptiveDiagnosisMode || (isHandoverMode && handoverReDiagnosisMode);
  const drillStructure = useMemo(() => {
    if (isSessionMode && topicDataLoading) return null;
    if (isAdaptiveVerificationFlow) {
      return [ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE[activeDiagnosisPhase]];
    }
    const phaseToUse = (isSessionMode ? currentTopicPhase : phase) as PhaseLabel;
    return buildDrillStructure(modeToUse, phaseToUse);
  }, [isSessionMode, modeToUse, currentTopicPhase, phase, topicDataLoading, isAdaptiveVerificationFlow, activeDiagnosisPhase]);

  const displayPhase: PhaseLabel = isAdaptiveVerificationFlow
    ? activeDiagnosisPhase
    : ((isSessionMode ? currentTopicPhase : phase) as PhaseLabel);
  const verificationPrepSpec = useMemo(
    () =>
      buildVerificationPrepSpec(
        displayPhase,
        isAdaptiveDiagnosisMode
          ? "diagnosis"
          : handoverReDiagnosisMode
            ? "handover_rediagnosis"
            : "handover"
      ),
    [displayPhase, isAdaptiveDiagnosisMode, handoverReDiagnosisMode]
  );

  const hasIntroTopic = !!introTopic;

  const { data: studentsData } = useQuery<StudentListEntry[] | { students?: StudentListEntry[] }>({
    queryKey: ["/api/tutor/students"],
    staleTime: 60_000,
  });

  const studentName = useMemo(() => {
    const list = Array.isArray(studentsData)
      ? studentsData
      : Array.isArray(studentsData?.students)
      ? studentsData.students
      : [];

    const student = list.find((s) => String(s.id) === String(studentId));
    if (!student) return null;

    const directName = String(student.fullName || student.name || "").trim();
    if (directName) return directName;

    const composedName = `${String(student.firstName || "").trim()} ${String(student.lastName || "").trim()}`.trim();
    return composedName || null;
  }, [studentId, studentsData]);

  const set = drillStructure?.[currentSet] ?? null;
  const isModelingSet = !!set?.isModelingSet;
  const isFirstRep = currentRep === 0;
  const isFirstSet = currentSet === 0;
  const isLastRep = set ? currentRep === set.reps - 1 : false;
  const isLastSet = drillStructure ? currentSet === drillStructure.length - 1 : false;
  const showSessionInstructions = isSessionMode && sessionTopicIndex === 0 && isFirstSet;

  useEffect(() => {
    if (!drillStructure) return;
    if (currentSet >= drillStructure.length) {
      setCurrentSet(0);
      setCurrentRep(0);
      return;
    }
    if (set && currentRep >= set.reps) {
      setCurrentRep(0);
    }
  }, [drillStructure, currentSet, currentRep, set]);

  useEffect(() => {
    setPrepReady(false);
    setPrepChecks({});
    setAdaptiveTransition(null);
  }, [drillMode, handoverReDiagnosisMode, phase, introTopic, sessionTopicIndex]);

  const handleExitToPod = () => {
    navigate("/tutor/pod");
  };

  const handleBackStep = () => {
    if (submitting || submitSuccess) return;
    if (adaptiveTransition) {
      setAdaptiveTransition(null);
      setAdaptiveDiagnosisMessage(null);
      return;
    }
    if (!isFirstRep) {
      setCurrentRep((r) => r - 1);
      return;
    }
    if (isAdaptiveVerificationFlow && adaptiveDiagnosisBlocks.length > 0) {
      const previousBlock = adaptiveDiagnosisBlocks[adaptiveDiagnosisBlocks.length - 1];
      const previousSet = ADAPTIVE_DIAGNOSIS_BLOCK_BY_PHASE[previousBlock.phase];
      setAdaptiveDiagnosisBlocks((prev) => prev.slice(0, -1));
      setActiveDiagnosisPhase(previousBlock.phase);
      setCurrentSet(0);
      setCurrentRep(Math.max(0, previousSet.reps - 1));
      setObservations(hydrateObservationsFromSet(previousSet, previousBlock));
      setAdaptiveDiagnosisMessage(null);
      return;
    }
    if (!isFirstSet) {
      const previousSetIndex = currentSet - 1;
      const previousSet = drillStructure[previousSetIndex];
      setCurrentSet(previousSetIndex);
      setCurrentRep(previousSet.reps - 1);
      return;
    }
    // If we're at the beginning and in session mode, go back to previous topic
    if (isSessionMode && sessionTopicIndex > 0) {
      setSessionTopicIndex(prev => prev - 1);
      // Reset to last set/rep of previous topic
      setCurrentSet(drillStructure.length - 1);
      setCurrentRep(drillStructure[drillStructure.length - 1].reps - 1);
      // Restore observations for previous topic if they exist
      const prevTopicResults = sessionResults[sessionTopicIndex - 1];
      if (prevTopicResults) {
        // This is complex - we'd need to reconstruct observations from stored results
        // For now, just reset observations and let user re-do if needed
        setObservations({});
      }
    }
  };

  const handleObservation = (field: string, value: string) => {
    setSubmitError(null);
    if (adaptiveTransition) {
      setAdaptiveTransition(null);
    }
    setObservations((prev: any) => ({
      ...prev,
      [`set${currentSet}_rep${currentRep}_${field}`]: value,
    }));
  };

  const handleContinueAdaptiveTransition = () => {
    if (!adaptiveTransition) return;
    setAdaptiveDiagnosisBlocks((prev) => [...prev, adaptiveTransition.currentBlock]);
    setAdaptiveDiagnosisMessage(
      `${adaptiveTransition.currentPhase} scored ${adaptiveTransition.phaseScore}/100. ${
        adaptiveTransition.direction === "escalate"
          ? `Moving up to ${adaptiveTransition.nextPhase}.`
          : `Dropping to ${adaptiveTransition.nextPhase}.`
      }`
    );
    setActiveDiagnosisPhase(adaptiveTransition.nextPhase);
    setCurrentSet(0);
    setCurrentRep(0);
    setObservations({});
    setAdaptiveTransition(null);
  };

  const getMissingFieldsForRep = (setIndex: number, repIndex: number) => {
    const repSet = drillStructure[setIndex];
    const observationBlock = getObservationBlockForRep(repSet, repIndex);
    return observationBlock.filter(
      (field) => !String(observations[`set${setIndex}_rep${repIndex}_${field.key}`] || "").trim()
    );
  };

  const getFirstMissingRep = () => {
    if (!drillStructure) return null;
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

  const getSubmissionRepCount = (setConfig: DrillSetConfig) => {
    return setConfig.reps;
  };

  const hydrateObservationsFromSet = (setConfig: DrillSetConfig, serializedSet: { observations?: Array<Record<string, string>> }) => {
    const nextObservations: Record<string, string> = {};
    const reps = Array.isArray(serializedSet?.observations) ? serializedSet.observations : [];
    reps.forEach((repObs, repIdx) => {
      const observationBlock = getObservationBlockForRep(setConfig, repIdx);
      observationBlock.forEach((field) => {
        const selectedLabel = String(repObs?.[field.key] || "").trim();
        if (selectedLabel) {
          nextObservations[`set0_rep${repIdx}_${field.key}`] = selectedLabel;
        }
      });
    });
    return nextObservations;
  };

  const serializeSetForSubmission = (setConfig: DrillSetConfig, setIndex: number) => {
    const repCount = getSubmissionRepCount(setConfig);
    if (setConfig.isModelingSet) {
      return {
        setName: setConfig.setName,
        reps: repCount,
        observations: [],
      };
    }

    return {
      setName: setConfig.setName,
      reps: repCount,
      observations: Array.from({ length: repCount }).map((_, repIdx) => {
        const obs: Record<string, string> = {};
        const observationBlock = getObservationBlockForRep(setConfig, repIdx);
        observationBlock.forEach((block) => {
          const selectedLabel = observations[`set${setIndex}_rep${repIdx}_${block.key}`] || "";
          const optionIndex = block.options.findIndex((option) => option === selectedLabel);
          const selectedLevel = observationLevelFromOptionIndex(optionIndex, block.options.length);
          obs[block.key] = selectedLabel;
          obs[`${block.key}_level`] = selectedLevel;
        });
        return obs;
      }),
    };
  };

  const handleNext = async () => {
    if (!drillStructure) {
      setSubmitError("Drill structure is loading. Please wait.");
      return;
    }

    if (!isSessionMode && !hasIntroTopic) {
      setSubmitError("Diagnostic topic is required. Please return and set Add Diagnostic Topic first.");
      return;
    }
    if (!isSessionMode && !parsedLaunchPhase) {
      setSubmitError("Invalid drill phase. Relaunch the drill from the student card or topic map.");
      return;
    }
    if (!canUseScheduledSession) {
      setSubmitError(
        drillMode === "diagnosis"
          ? "A confirmed TT intro session is required before running this drill."
          : "A launch-ready TT training lesson is required before running this drill."
      );
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
    } else if (isAdaptiveVerificationFlow) {
      const serializedSet = serializeSetForSubmission(set, currentSet);
      const phaseSummary = computeAdaptiveDiagnosisPhaseSummary(activeDiagnosisPhase, serializedSet.observations);
      const currentBlock = {
        phase: activeDiagnosisPhase,
        setName: set.setName,
        observations: serializedSet.observations,
      };
      const nextPhase =
        phaseSummary.band === "de-escalate"
          ? getAdjacentDiagnosisPhase(activeDiagnosisPhase, "previous")
          : phaseSummary.band === "escalate"
            ? getAdjacentDiagnosisPhase(activeDiagnosisPhase, "next")
            : null;
      const shouldStop = !nextPhase || phaseSummary.band === "place";

      if (!shouldStop) {
        setAdaptiveTransition({
          currentPhase: activeDiagnosisPhase,
          nextPhase,
          phaseScore: phaseSummary.phaseScore,
          direction: phaseSummary.band === "escalate" ? "escalate" : "de-escalate",
          currentBlock,
        });
        return;
      }

      const finalAdaptiveBlocks = [...adaptiveDiagnosisBlocks, currentBlock];

      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      setScoring(null);
      try {
        const payload = isHandoverMode
          ? {
              studentId,
              handoverTopic: introTopic,
              phase,
              startingPhase: phase,
              stability: previousStability,
              adaptiveBlocks: finalAdaptiveBlocks,
              scheduledSessionId,
              rediagnosis: true,
            }
          : {
              studentId,
              introTopic,
              startingPhase: phase,
              adaptiveBlocks: finalAdaptiveBlocks,
              scheduledSessionId,
            };
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        const adaptiveEndpoint = isHandoverMode ? "/api/tutor/handover-verification-drill" : "/api/tutor/intro-session-drill";
        const adaptiveResponse = await fetch(`${API_URL}${adaptiveEndpoint}`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!adaptiveResponse.ok) {
          const errorData = await adaptiveResponse.json().catch(() => ({}));
          const error = new Error(errorData?.message || `Request failed with status code ${adaptiveResponse.status}`) as any;
          error.response = { status: adaptiveResponse.status, data: errorData };
          throw error;
        }
        const res = { data: await adaptiveResponse.json() };

        const queryClient = (window as any).__queryClient;
        if (queryClient) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/sessions"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/intro-session-details", studentId] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "workflow-state"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/topic-conditioning", studentId] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "topic-conditioning-activations"] }),
            queryClient.invalidateQueries({ queryKey: [`/api/tutor/students/${studentId}/reports-center`] }),
            queryClient.invalidateQueries({ queryKey: [`/api/tutor/students/${studentId}/assignments`] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/reports"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/dashboard-student"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/dashboard-topic-states"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/assigned-tutor"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/intro-session"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/proposal"] }),
          ]);
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ["/api/tutor/pod"] }),
            queryClient.refetchQueries({ queryKey: [`/api/tutor/students/${studentId}/reports-center`] }),
          ]);
        }

        setAdaptiveDiagnosisMessage(
          isHandoverMode
            ? `${phaseSummary.phaseScore}/100 in ${activeDiagnosisPhase}. Targeted re-diagnosis resolved to ${res.data?.summary?.resultingPhase || activeDiagnosisPhase}.`
            : `${phaseSummary.phaseScore}/100 in ${activeDiagnosisPhase}. Diagnosis locked at ${res.data?.summary?.phase || activeDiagnosisPhase}.`
        );
        setSubmitSuccess(true);
        setScoring(res.data?.scoring || null);
      } catch (err: any) {
        console.error("Adaptive intro diagnosis submission error:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Submission failed. Please try again.";
        const statusCode = err?.response?.status;
        setSubmitError(statusCode ? `${errorMessage} (${statusCode})` : errorMessage);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Last rep of last set - either submit or move to next topic in session
      if (isSessionMode && sessionTopicIndex < sessionTopics.length - 1) {
        // Save current drill results and move to next topic
        const drillResult = {
          trainingTopic: currentTopicName,
          phase: currentTopicPhase,
          previousStability: currentTopicStability,
          drill: drillStructure.map((set, setIdx) => serializeSetForSubmission(set, setIdx)),
        };
        
        setSessionResults(prev => [...prev, drillResult]);
        setSessionTopicIndex(prev => prev + 1);
        setCurrentSet(0);
        setCurrentRep(0);
        setObservations({});
        return;
      }

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

        // Construct drill data for this topic - ensure ALL sets are included
        const currentDrill = {
          trainingTopic: isSessionMode ? currentTopicName : introTopic,
          phase: isSessionMode ? currentTopicPhase : phase,
          previousStability: isSessionMode ? currentTopicStability : previousStability,
          // IMPORTANT: Include all sets from drillStructure - no filtering
          // Training drills MUST have exactly 3 sets per validation rules
          drill: drillStructure.map((set, setIdx) => serializeSetForSubmission(set, setIdx)),
        };

        // Collect all drills (for multi-topic sessions, include previous + current)
        const allDrills = isSessionMode 
          ? [...sessionResults.map(d => ({ ...d, trainingTopic: d.trainingTopic || d.topic })), currentDrill]
          : [currentDrill];

        const isDiagnosisMode = modeToUse === "diagnosis";
        const endpoint = isDiagnosisMode
          ? "/api/tutor/intro-session-drill"
          : isHandoverMode
            ? "/api/tutor/handover-verification-drill"
            : "/api/tutor/training-session-drill";
        const payload = isDiagnosisMode
          ? {
              studentId,
              drill: currentDrill.drill,
              introTopic: currentDrill.trainingTopic,
              phase: currentDrill.phase,
              scheduledSessionId,
            }
          : isHandoverMode
            ? {
                studentId,
                drill: currentDrill.drill,
                handoverTopic: currentDrill.trainingTopic,
                phase: currentDrill.phase,
                stability: currentDrill.previousStability,
                scheduledSessionId,
              }
            : {
              studentId,
              sessionDrills: allDrills,
              scheduledSessionId,
            };
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        const submitResponse = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!submitResponse.ok) {
          const errorData = await submitResponse.json().catch(() => ({}));
          const error = new Error(errorData?.message || `Request failed with status code ${submitResponse.status}`) as any;
          error.response = { status: submitResponse.status, data: errorData };
          throw error;
        }
        const res = { data: await submitResponse.json() };
        
        // Invalidate relevant caches so updated status/stage/state appear immediately
        const queryClient = (window as any).__queryClient;
        if (queryClient) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/sessions"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/topic-conditioning", studentId] }),
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "topic-conditioning-activations"] }),
            queryClient.invalidateQueries({ queryKey: [`/api/tutor/students/${studentId}/reports-center`] }),
            queryClient.invalidateQueries({ queryKey: [`/api/tutor/students/${studentId}/assignments`] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/reports"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/dashboard-student"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/dashboard-topic-states"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/assigned-tutor"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/intro-session"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/parent/proposal"] }),
          ]);
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ["/api/tutor/pod"] }),
            queryClient.refetchQueries({ queryKey: [`/api/tutor/students/${studentId}/reports-center`] }),
          ]);
        }
        
        setSubmitSuccess(true);
        const drillResults = res.data?.drillResults;
        const scoringRows = res.data?.scoring || (Array.isArray(drillResults)
          ? drillResults.flatMap((result: any) =>
              Array.isArray(result.scoring)
                ? result.scoring.map((row: any) => ({ ...row, topic: result.topic }))
                : []
            )
          : null);
        setScoring(scoringRows || null);
      } catch (err: any) {
        console.error("Intro session drill submission error:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Submission failed. Please try again.";
        const statusCode = err?.response?.status;
        setSubmitError(statusCode ? `${errorMessage} (${statusCode})` : errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      {drillSessionAccessLoading && (
        <div className="mb-4 p-3 rounded-md border border-primary/20 bg-primary/5">
          <p className="text-sm">Validating TT lesson context...</p>
        </div>
      )}
      {!drillSessionAccessLoading && !canUseScheduledSession && (
        <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold">Live lesson context required</p>
            <p className="mt-2 text-sm">
              {drillMode === "diagnosis"
                ? "Return to the student card and launch this intro drill from the confirmed TT intro lesson."
                : "Return to Topic Conditioning and launch this drill from a live or imminently scheduled TT training lesson."}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-primary/20 bg-background hover:bg-primary/5"
              onClick={handleExitToPod}
            >
              Back to Pod
            </button>
          </div>
        </div>
      )}
      {canUseScheduledSession && scheduledSession && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">TT Lesson</p>
          <p className="text-sm font-medium">
            {new Date(scheduledSession.scheduled_time).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Status: {scheduledSession.status}</span>
            <span>Type: {scheduledSession.type}</span>
          </div>
        </div>
      )}
      {(drillMode === "training" || isSessionMode) && workflowLoading && (
        <div className="mb-4 p-3 rounded-md border border-primary/20 bg-primary/5">
          <p className="text-sm">Checking assignment access...</p>
        </div>
      )}
      {(drillMode === "training" || isSessionMode) && !workflowLoading && !assignmentAccepted && (
        <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold">Training access is locked</p>
            <p className="mt-2 text-sm">
              This student is assigned to you, but you must accept the assignment before running drills or training sessions.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-primary/20 bg-background hover:bg-primary/5"
              onClick={handleExitToPod}
            >
              Back to Pod
            </button>
          </div>
        </div>
      )}
      {!drillSessionAccessLoading && canUseScheduledSession && !((drillMode === "training" || isSessionMode) && !workflowLoading && !assignmentAccepted) && (
      <>
      {(!drillStructure || (isSessionMode && topicDataLoading)) && (
        <div className="mb-4 p-3 rounded-md border border-primary/20 bg-primary/5">
          <p className="text-sm">Loading drill structure...</p>
        </div>
      )}
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          className="px-3 py-2 rounded-md border border-primary/20 bg-background hover:bg-primary/5"
          onClick={handleExitToPod}
        >
          Exit to Pod
        </button>
      </div>
      {submitSuccess && scoring && scoring.length > 0 && (() => {
        // Group rows by topic and set name so multi-topic sessions render clearly
        const setGroups: Record<string, typeof scoring> = {};
        scoring.forEach((row) => {
          const key = row.topic ? `${row.topic} · ${row.set}` : row.set;
          if (!setGroups[key]) setGroups[key] = [];
          setGroups[key].push(row);
        });
        const setNames = Object.keys(setGroups);
        const topicRows = scoring.reduce((acc: Record<string, typeof scoring>, row) => {
          const topicKey = row.topic || "Session";
          if (!acc[topicKey]) acc[topicKey] = [];
          acc[topicKey].push(row);
          return acc;
        }, {});
        const topicNames = Object.keys(topicRows);
        const topicSummaries = topicNames.map((topicName) => {
          const rows = topicRows[topicName];
          const lastRow = rows[rows.length - 1];
          const topicScore = lastRow?.sessionScore ?? 0;
          return {
            topicName,
            rows,
            lastRow,
            topicScore,
          };
        });
        const overallSessionScore = Math.round(
          topicSummaries.reduce((sum, topic) => sum + topic.topicScore, 0) / Math.max(topicSummaries.length, 1)
        );
        const stabilityColorFor = (stability?: string | null) =>
          stability === "High Maintenance"
            ? "text-blue-700"
            : stability === "High"
            ? "text-green-700"
            : stability === "Medium"
            ? "text-yellow-700"
            : "text-red-700";
        const resultLabelFor = (row: any, topicName: string) => {
          if (drillMode === "diagnosis" && row?.bandLabel) {
            return `${topicName}: placed in ${row?.phase} at ${row?.stability} stability`;
          }
          const transitionReason = String(row?.transitionReason || row?.phaseDecision || "remain").toLowerCase();
          if ((transitionReason === "phase progress" || row?.phaseDecision === "advance") && row?.phaseBefore !== row?.phase) {
            return `${topicName}: phase advanced to ${row?.phase} at ${row?.stability} stability`;
          }
          if (row?.phase === "Time Pressure Stability" && row?.stability === "High Maintenance") {
            return `${topicName}: sustained final-phase maintenance in ${row?.phase}`;
          }
          if (transitionReason === "stability regress" || row?.phaseDecision === "regress") {
            return `${topicName}: stability regressed to ${row?.stability} in ${row?.phase}`;
          }
          if (transitionReason === "stability advance") {
            return `${topicName}: stability improved to ${row?.stability} in ${row?.phase}`;
          }
          return `${topicName}: stability held at ${row?.stability} in ${row?.phase}`;
        };
        const formatState = (phaseValue?: string | null, stabilityValue?: string | null) => {
          if (!phaseValue && !stabilityValue) return "Not recorded";
          if (!phaseValue) return String(stabilityValue || "Not recorded");
          if (!stabilityValue) return String(phaseValue || "Not recorded");
          return `${phaseValue} (${stabilityValue})`;
        };
        return (
          <div className="mb-6 space-y-4">
            <div className="p-3 rounded-md border border-primary/25 bg-primary/10 text-foreground font-medium">
              Drill submitted. Scoring complete.
            </div>

            {/* Per-set scoring */}
            {setNames.map((setName) => {
              const rows = setGroups[setName];
              const setMeta = rows.find((r) => typeof r.setPoints === "number" && typeof r.setMaxPoints === "number");
              const setPercent = setMeta?.setScore ?? Math.round(rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length);
              const setPoints = setMeta?.setPoints ?? setPercent;
              const setMaxPoints = setMeta?.setMaxPoints ?? 100;
              return (
                <div key={setName} className="rounded-xl border border-primary/15 bg-background overflow-hidden">
                  <div className="bg-primary/5 px-4 py-2 flex justify-between items-center">
                    <span className="font-semibold text-sm">{setName}</span>
                    <span className="text-sm text-muted-foreground">
                      Set Total: <strong>{setPoints}/{setMaxPoints || 100}</strong>
                      <span className="ml-2 text-xs">({setPercent}%)</span>
                    </span>
                  </div>
                  <div className="divide-y">
                    {rows.map((row, i) => (
                      <div key={i} className="px-4 py-2 flex justify-between items-center text-sm bg-background">
                        <span className="text-muted-foreground">Rep {row.rep}</span>
                        <span className={`font-medium ${
                          row.score >= 70 ? "text-green-700" : row.score >= 45 ? "text-yellow-700" : "text-red-700"
                        }`}>{row.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Session total */}
            <div className="rounded-xl border border-primary/15 bg-background px-4 py-3 flex justify-between items-center">
              <span className="font-semibold">
                {topicSummaries.length > 1 ? "Overall Session Average" : "Session Total"}
              </span>
              <span className={`text-lg font-bold ${
                overallSessionScore >= 70 ? "text-green-700" : overallSessionScore >= 45 ? "text-yellow-700" : "text-red-700"
              }`}>{overallSessionScore}/100</span>
            </div>

            {/* Per-topic direction cards */}
            {topicSummaries.map(({ topicName, lastRow, topicScore }) => {
              const stabilityColor = stabilityColorFor(lastRow?.stability);
              return (
                <div key={topicName} className="rounded-xl border border-primary/15 bg-background overflow-hidden">
                  <div className="bg-primary/5 px-4 py-2">
                    <span className="font-semibold text-sm">
                      System Direction{topicSummaries.length > 1 ? ` · ${topicName}` : ""}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">This Session Result</p>
                      <p className={`font-semibold ${stabilityColor}`}>{resultLabelFor(lastRow, topicName)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-muted-foreground">Topic Score</span>
                      <span className={`font-bold ${
                        topicScore >= 70 ? "text-green-700" : topicScore >= 45 ? "text-yellow-700" : "text-red-700"
                      }`}>{topicScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Before</span>
                      <span className="font-medium">{formatState(lastRow?.phaseBefore, lastRow?.stabilityBefore)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Now</span>
                      <span className="font-medium">{formatState(lastRow?.phase, lastRow?.stability)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Phase</span>
                      <span className="font-medium">{lastRow?.phase}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Next Session Focus</p>
                      <p className="font-semibold text-blue-700">{lastRow?.nextAction}</p>
                    </div>
                    {lastRow?.constraint && (
                      <div className="mt-1 pt-2 border-t text-xs text-muted-foreground">
                        Constraint: {lastRow.constraint}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
      {submitSuccess && (!scoring || scoring.length === 0) && (
        <div className="mb-4 p-3 rounded-md border border-primary/25 bg-primary/10 text-foreground">
          Drill submitted successfully.
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
          {submitError}
        </div>
      )}
      {adaptiveDiagnosisMessage && !submitSuccess && isAdaptiveVerificationFlow && (
        <div className="mb-4 p-3 rounded-md border border-primary/20 bg-primary/5 text-sm text-foreground">
          {adaptiveDiagnosisMessage}
        </div>
      )}
      {adaptiveTransition && !submitSuccess && isAdaptiveVerificationFlow && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">System Transition</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The current phase block is complete. Review the decision before opening the next diagnosis block.
            </p>
          </div>
          <div className="rounded-lg border border-primary/15 bg-background/80 p-4 space-y-2 text-sm">
            <p>
              <span className="font-medium text-foreground">Current Phase:</span> {adaptiveTransition.currentPhase}
            </p>
            <p>
              <span className="font-medium text-foreground">Phase Score:</span> {adaptiveTransition.phaseScore}/100
            </p>
            <p>
              <span className="font-medium text-foreground">System Decision:</span>{" "}
              {adaptiveTransition.direction === "escalate"
                ? `Move up to ${adaptiveTransition.nextPhase}`
                : `Drop to ${adaptiveTransition.nextPhase}`}
            </p>
            <p>
              <span className="font-medium text-foreground">Why:</span>{" "}
              {explainAdaptiveTransition(
                adaptiveTransition.currentPhase,
                adaptiveTransition.nextPhase,
                adaptiveTransition.direction,
              )}
            </p>
            <p>
              <span className="font-medium text-foreground">What happens next:</span>{" "}
              The drill screen will reset and open the {adaptiveTransition.nextPhase} diagnosis block.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleContinueAdaptiveTransition}
            >
              Continue to {adaptiveTransition.nextPhase}
            </button>
          </div>
        </div>
      )}
      {(isAdaptiveDiagnosisMode || isHandoverMode) && !submitSuccess && !prepReady && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {verificationPrepSpec.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdaptiveDiagnosisMode
                ? "Diagnosis prep is verification-readiness prep, not training prep."
                : handoverReDiagnosisMode
                  ? "Targeted re-diagnosis prep is for resolving one flagged inherited topic, not for normal training."
                  : "Handover prep is continuity-check prep, not intro prep and not training prep."}
            </p>
          </div>
          <div className="rounded-lg border border-primary/15 bg-background/80 p-3 space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Topic:</span> {hasIntroTopic ? introTopic : "Not set"}
            </p>
              <p>
                <span className="font-medium text-foreground">Phase:</span> {displayPhase}
              </p>
              {!isAdaptiveDiagnosisMode && (
              <p>
                <span className="font-medium text-foreground">Inherited Stability:</span> {previousStability || "Not recorded"}
              </p>
            )}
            <p>
              <span className="font-medium text-foreground">Objective:</span> {verificationPrepSpec.objective}
            </p>
            <div className="space-y-1">
              <p>
                <span className="font-medium text-foreground">Problem Prep:</span> {verificationPrepSpec.problemPlan}
              </p>
              {verificationPrepSpec.problemCoverage?.length ? (
                <div className="pl-0.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coverage For This Session</p>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {verificationPrepSpec.problemCoverage.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {typeof verificationPrepSpec.totalProblems === "number" ? (
                    <p className="mt-2 text-sm text-foreground">
                      <span className="font-medium">Total problems:</span> {verificationPrepSpec.totalProblems}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
            {verificationPrepSpec.tutorRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className="rounded-lg border border-primary/15 bg-background/80 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required Confirmations</p>
            <div className="space-y-2">
              {verificationPrepSpec.checklist.map((item, index) => {
                const checkKey = `prep-${index}`;
                const checked = !!prepChecks[checkKey];
                return (
                  <button
                    type="button"
                    key={item}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      checked
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-primary/15 bg-background hover:bg-primary/5 text-muted-foreground"
                    }`}
                    onClick={() =>
                      setPrepChecks((prev) => ({
                        ...prev,
                        [checkKey]: !checked,
                      }))
                    }
                  >
                    <span className="font-medium">{checked ? "[x]" : "[ ]"}</span> {item}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{verificationPrepSpec.derivedFrom}</p>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              onClick={() => setPrepReady(true)}
              disabled={!verificationPrepSpec.checklist.every((_, index) => prepChecks[`prep-${index}`])}
            >
              {isAdaptiveDiagnosisMode
                ? "Start Diagnosis"
                : handoverReDiagnosisMode
                  ? "Start Re-Diagnosis"
                  : "Start Verification"}
            </button>
          </div>
        </div>
      )}
      {drillStructure && set && (
        !((isAdaptiveDiagnosisMode || isHandoverMode) && !submitSuccess && (!prepReady || !!adaptiveTransition)) && (
        <>
          <h2 className="text-2xl font-bold mb-2">
            {isSessionMode
              ? `Training Session - Topic ${sessionTopicIndex + 1} of ${sessionTopics.length}`
              : drillMode === "training"
              ? `Training Drill - ${phase}`
              : drillMode === "handover"
                ? handoverReDiagnosisMode
                  ? `Targeted Re-Diagnosis - ${displayPhase}`
                  : `Handover Verification - ${displayPhase}`
                : `Adaptive Intro Diagnosis - ${displayPhase}`}
          </h2>
      <p className="mb-2 text-sm">
        <span className="font-semibold">
          {isSessionMode ? "Current Topic:" : drillMode === "handover" ? "Carry-Over Topic:" : "Diagnostic Topic:"}
        </span>{" "}
        {isSessionMode ? currentTopicName : hasIntroTopic ? introTopic : "Not set"}
        {isSessionMode && currentSessionTopic && (
          <span className="ml-2 text-muted-foreground">
            ({currentTopicPhase} - {currentTopicStability})
          </span>
        )}
      </p>
      {!hasIntroTopic && !isSessionMode && (
        <div className="mb-4 p-3 rounded-md border border-primary/20 bg-primary/5 text-sm">
          {drillMode === "handover"
            ? "No carry-over topic was provided. Go back to the student card and open handover verification from the inherited topic state."
            : "No diagnostic topic was provided. Go back to the student card and use Add Diagnostic Topic before opening the intro session."}
        </div>
      )}
      <p className="mb-4 text-muted-foreground">{studentName || studentId}</p>
      {showSessionInstructions && (
        <div className="mb-4 p-3 rounded-md border border-primary/20 bg-primary/5">
          <p className="font-semibold mb-1">Session Instructions:</p>
          <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
            <li>
              This is a multi-topic training session. Complete drills for each selected topic in sequence.
            </li>
            <li>Each topic follows its own phase-specific drill structure based on current state.</li>
            <li>After completing all topics, the session results will be submitted together.</li>
            <li>You can navigate back to previous topics if needed, but all topics must be completed.</li>
          </ul>
        </div>
      )}
      {drillMode === "diagnosis" && showModeInstructions && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="font-semibold">Instructions</p>
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setShowModeInstructions(false)}
            >
              Dismiss
            </button>
          </div>
          <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
            <li>This diagnosis is adaptive. Complete the current phase verification block exactly as shown.</li>
            <li><strong>Before you begin:</strong> Prepare <span className="font-semibold">3 distinct problems</span> for the current phase block.</li>
            <li>The system will move up, place here, or move down after each phase block based on the score band.</li>
            <li>You cannot skip steps or edit outside the verification structure. Complete each observation in order.</li>
            <li>Diagnosis stops automatically once the correct entry phase is verified.</li>
          </ul>
        </div>
      )}
      {drillMode === "handover" && showModeInstructions && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="font-semibold">Instructions</p>
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setShowModeInstructions(false)}
            >
              Dismiss
            </button>
          </div>
          <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
            <li>
              {handoverReDiagnosisMode
                ? "This is targeted re-diagnosis inside handover. The inherited topic-state was not trustworthy enough to continue from."
                : "This is handover verification. You are checking whether the inherited topic-state is still trustworthy."}
            </li>
            <li><strong>Before you begin:</strong> Prepare <span className="font-semibold">3 distinct problems</span> for this phase verification block.</li>
            <li>Do not turn this into normal training.</li>
            <li>
              {handoverReDiagnosisMode
                ? "Run adaptive diagnosis only for this flagged topic until the correct current phase is clear."
                : "Run the single verification block exactly as shown, score it honestly, and let the system decide whether the inherited state holds."}
            </li>
          </ul>
        </div>
      )}

      {/* Phase-level context bar -shown only on set 1 */}
      {isFirstSet && isFirstRep && <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 text-sm">
        <div className="font-semibold text-foreground mb-1">Phase: {displayPhase}</div>
        <div className="text-muted-foreground text-xs mb-2">{PHASE_CONTEXT[displayPhase].purpose}</div>
        <div className="flex flex-wrap gap-1">
          {PHASE_CONTEXT[displayPhase].constraints.map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-background border border-primary/20 text-foreground rounded text-xs font-medium">✕ {c}</span>
          ))}
        </div>
      </div>}

      {/* Modeling session callout - shown only for Clarity Training Set 1 */}
      {set?.isModelingSet && (
        <div className="mb-4 p-4 rounded-xl border border-primary/25 bg-primary/10">
          <div className="font-bold text-foreground text-sm mb-1">MODELING STEP</div>
          <div className="text-muted-foreground text-xs leading-relaxed">
            Tutor teaches first. Student does <strong>NOT</strong> solve yet.<br />
            Run <strong>Vocabulary → Method → Reason</strong>, then ask the student to explain back.<br />
            Sets 2 and 3 are the scored drill sets.
          </div>
        </div>
      )}

      {/* Set context block -purpose, rep instruction, active rules */}
      <div className="mb-4 p-3 rounded-xl border border-primary/15 bg-background shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm flex items-center gap-2">
            Set {currentSet + 1} / {drillStructure.length}: {set?.setName}
          </div>
          <div className="text-sm font-medium text-muted-foreground">{isModelingSet ? "Pre-Drill Step" : `Rep ${currentRep + 1} / ${set?.reps ?? 0}`}</div>
        </div>
        <div className="text-xs text-muted-foreground mb-3">{set?.purpose}</div>
        <div className="p-2 rounded-md border border-primary/20 bg-primary/5 mb-3">
          <div className="text-xs font-semibold text-primary mb-0.5">→ Rep instruction</div>
          <div className="text-sm text-foreground font-medium">{set?.repInstruction}</div>
        </div>
        <div className="flex flex-wrap gap-1">
          {set?.activeRules?.map((rule, i) => (
            <span key={i} className="px-2 py-0.5 bg-background border border-primary/15 text-muted-foreground rounded text-xs">{rule}</span>
          ))}
        </div>
      </div>

      <form className="space-y-4">
        {getObservationBlockForRep(set, currentRep).length === 0 && (
          <div className="p-3 rounded-md border border-primary/20 bg-primary/5 text-sm">
            No observations are captured for this step. Continue when pre-drill teaching is complete.
          </div>
        )}
        {getObservationBlockForRep(set, currentRep).map((obs) => (
          <div key={obs.key}>
            <label className="block font-medium mb-1">{obs.label}</label>
            <div className="flex gap-2">
              {obs.options.map((option: string) => (
                <button
                  type="button"
                  key={option}
                  className={`px-3 py-1 rounded-md border transition-colors ${observations[`set${currentSet}_rep${currentRep}_${obs.key}`] === option ? "bg-primary text-primary-foreground border-primary" : "bg-background border-primary/20 hover:bg-primary/5"}`}
                  onClick={() => handleObservation(obs.key, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </form>
        </>
        )
      )}
      {(!((isAdaptiveDiagnosisMode || isHandoverMode) && !submitSuccess && (!prepReady || !!adaptiveTransition))) && (
      <div className="mt-6 flex justify-end">
        {!submitSuccess && (
          <button
            type="button"
            className="mr-2 px-4 py-2 rounded-md border border-primary/20 bg-background hover:bg-primary/5 disabled:opacity-60"
            onClick={handleBackStep}
            disabled={submitting || (isFirstSet && isFirstRep && (!isSessionMode || sessionTopicIndex === 0))}
          >
            Back
          </button>
        )}
        <button
          type="button"
            className={`px-4 py-2 rounded-md text-primary-foreground disabled:opacity-60 ${
            submitSuccess ? "bg-primary cursor-default" : "bg-primary hover:bg-primary/90"
          }`}
          onClick={handleNext}
          disabled={submitting || submitSuccess || (!isSessionMode && !hasIntroTopic) || (isSessionMode && topicDataLoading) || !drillStructure || !set}
        >
          {submitSuccess
            ? "Submitted"
            : submitting
            ? "Submitting..."
            : isAdaptiveVerificationFlow && isLastRep
            ? "Verify Phase"
            : isHandoverMode && isLastSet && isLastRep
            ? "Submit Verification"
            : isLastSet && isLastRep
            ? "Submit Drill"
            : set?.isModelingSet && isLastRep
            ? "Start Drilling"
            : "Next"}
        </button>
      </div>
      )}
      {submitSuccess && (
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-primary/20 bg-background hover:bg-primary/5"
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
      </>
      )}
    </div>
  );
}
