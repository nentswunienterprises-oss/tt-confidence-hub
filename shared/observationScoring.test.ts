import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeObservationLevelValue,
  observationLevelFromOptionIndex,
} from "./observationScoring";

test("normalizeObservationLevelValue respects explicit level tokens", () => {
  assert.equal(normalizeObservationLevelValue("weak"), "weak");
  assert.equal(normalizeObservationLevelValue("partial"), "partial");
  assert.equal(normalizeObservationLevelValue("clear"), "clear");
});

test("normalizeObservationLevelValue classifies known low labels as weak", () => {
  const lowLabels = [
    "Asked for help early",
    "Needs help",
    "Dependent",
    "Frequent",
    "Gives up",
    "Short attempt",
    "Could not identify first step",
  ];

  lowLabels.forEach((label) => {
    assert.equal(normalizeObservationLevelValue(label), "weak", label);
  });
});

test("normalizeObservationLevelValue keeps expected middle and high labels", () => {
  assert.equal(normalizeObservationLevelValue("Hesitated but attempted"), "partial");
  assert.equal(normalizeObservationLevelValue("asks later"), "partial");
  assert.equal(normalizeObservationLevelValue("Did not seek rescue"), "clear");
  assert.equal(normalizeObservationLevelValue("Controlled pace"), "clear");
});

test("observationLevelFromOptionIndex maps ordered options deterministically", () => {
  assert.equal(observationLevelFromOptionIndex(0, 3), "weak");
  assert.equal(observationLevelFromOptionIndex(1, 3), "partial");
  assert.equal(observationLevelFromOptionIndex(2, 3), "clear");
  assert.equal(observationLevelFromOptionIndex(0, 5), "weak");
  assert.equal(observationLevelFromOptionIndex(2, 5), "partial");
  assert.equal(observationLevelFromOptionIndex(4, 5), "clear");
});
