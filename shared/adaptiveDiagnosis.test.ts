import test from "node:test";
import assert from "node:assert/strict";

import {
  computeAdaptiveDiagnosisPhaseSummary,
  getAdjacentDiagnosisPhase,
} from "./adaptiveDiagnosis";

test("adaptive diagnosis de-escalates on low scores", () => {
  const summary = computeAdaptiveDiagnosisPhaseSummary("Clarity", [
    {
      vocabulary_level: "weak",
      method_level: "weak",
      reason_level: "weak",
      immediateApply_level: "weak",
    },
    {
      vocabulary_level: "weak",
      method_level: "weak",
      reason_level: "weak",
      immediateApply_level: "weak",
    },
    {
      vocabulary_level: "weak",
      method_level: "weak",
      reason_level: "weak",
      immediateApply_level: "weak",
    },
  ]);

  assert.equal(summary.phaseScore, 0);
  assert.equal(summary.band, "de-escalate");
  assert.equal(summary.stability, "Low");
});

test("adaptive diagnosis places on middle-band scores", () => {
  const summary = computeAdaptiveDiagnosisPhaseSummary("Structured Execution", [
    {
      startBehavior_level: "partial",
      stepExecution_level: "partial",
      repeatability_level: "partial",
      independence_level: "partial",
    },
    {
      startBehavior_level: "partial",
      stepExecution_level: "partial",
      repeatability_level: "partial",
      independence_level: "partial",
    },
    {
      startBehavior_level: "partial",
      stepExecution_level: "partial",
      repeatability_level: "partial",
      independence_level: "partial",
    },
  ]);

  assert.equal(summary.phaseScore, 60);
  assert.equal(summary.band, "place");
  assert.equal(summary.stability, "Medium");
});

test("adaptive diagnosis accepts raw observation labels when explicit *_level fields are absent", () => {
  const summary = computeAdaptiveDiagnosisPhaseSummary("Structured Execution", [
    {
      startBehavior: "Starts after a short pause",
      stepExecution: "Partially structured steps",
      repeatability: "Mostly repeated with a missed step",
      independence: "Needed occasional support",
    },
    {
      startBehavior: "Starts independently",
      stepExecution: "Fully structured steps",
      repeatability: "Fully repeatable",
      independence: "Independent throughout",
    },
    {
      startBehavior: "Starts after a short pause",
      stepExecution: "Partially structured steps",
      repeatability: "Mostly repeated with a missed step",
      independence: "Needed occasional support",
    },
  ]);

  assert.equal(summary.phaseScore, 73);
  assert.equal(summary.band, "place");
  assert.equal(summary.stability, "Medium");
});

test("adaptive diagnosis escalates on high scores", () => {
  const summary = computeAdaptiveDiagnosisPhaseSummary("Controlled Discomfort", [
    {
      initialResponse_level: "clear",
      firstStepControl_level: "clear",
      discomfortTolerance_level: "clear",
      rescueDependence_level: "clear",
    },
    {
      initialResponse_level: "clear",
      firstStepControl_level: "clear",
      discomfortTolerance_level: "clear",
      rescueDependence_level: "clear",
    },
    {
      initialResponse_level: "clear",
      firstStepControl_level: "clear",
      discomfortTolerance_level: "clear",
      rescueDependence_level: "clear",
    },
  ]);

  assert.equal(summary.phaseScore, 100);
  assert.equal(summary.band, "escalate");
  assert.equal(summary.stability, "High");
});

test("adjacent phase lookup respects boundaries", () => {
  assert.equal(getAdjacentDiagnosisPhase("Clarity", "previous"), null);
  assert.equal(getAdjacentDiagnosisPhase("Clarity", "next"), "Structured Execution");
  assert.equal(getAdjacentDiagnosisPhase("Time Pressure Stability", "next"), null);
});
