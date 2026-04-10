import test from "node:test";
import assert from "node:assert/strict";
import {
  computeTransition,
  mapObservationsToBehavior,
} from "./topicConditioningEngine";

test("computeTransition promotes High to High Maintenance at 85+", () => {
  const result = computeTransition("Structured Execution", "High", 88);
  assert.equal(result.next_phase, "Structured Execution");
  assert.equal(result.next_stability, "High Maintenance");
  assert.equal(result.transition_reason, "stability advance");
});

test("computeTransition phase progresses only from High Maintenance and enters next phase at Low", () => {
  const result = computeTransition("Clarity", "High Maintenance", 91);
  assert.equal(result.next_phase, "Structured Execution");
  assert.equal(result.next_stability, "Low");
  assert.equal(result.transition_reason, "phase progress");
});

test("mapObservationsToBehavior maps weak and clear observation labels deterministically", () => {
  const behaviors = mapObservationsToBehavior([
    { key: "start_behavior", value: "Delayed start" },
    { key: "step_execution", value: "Skips steps" },
    { key: "independence_level", value: "Executed without support" },
    { key: "pace_control", value: "Controlled pace" },
  ]);

  assert.deepEqual(behaviors, [
    "delayed starts",
    "inconsistent step execution",
    "more independent execution",
    "more controlled pace",
  ]);
});
