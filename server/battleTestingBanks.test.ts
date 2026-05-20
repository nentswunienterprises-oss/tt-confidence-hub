import test from "node:test";
import assert from "node:assert/strict";
import { TUTOR_BATTLE_TEST_PHASES } from "@shared/battleTesting";
import { TUTOR_BATTLE_TEST_PHASES_EXACT, TUTOR_BATTLE_TEST_PHASES_SAFE } from "./battleTestingBanks";

test("tutor battle-test safe bank preserves the full canonical phase list", () => {
  assert.equal(TUTOR_BATTLE_TEST_PHASES_SAFE.length, TUTOR_BATTLE_TEST_PHASES.length);
  assert.deepEqual(
    TUTOR_BATTLE_TEST_PHASES_SAFE.map((phase) => phase.key),
    TUTOR_BATTLE_TEST_PHASES.map((phase) => phase.key)
  );
});

test("tutor battle-test safe bank includes transformation phases", () => {
  const transformationPhaseKeys = [
    "clarity",
    "structured_execution",
    "controlled_discomfort",
    "time_pressure_stability",
    "topic_conditioning",
  ];

  for (const phaseKey of transformationPhaseKeys) {
    assert.ok(
      TUTOR_BATTLE_TEST_PHASES_SAFE.some((phase) => phase.key === phaseKey),
      `expected ${phaseKey} to be present in the safe bank`
    );
  }
});

test("exact transformation phase banks are populated from source files", () => {
  const transformationPhaseKeys = [
    "clarity",
    "structured_execution",
    "controlled_discomfort",
    "time_pressure_stability",
    "topic_conditioning",
  ];

  for (const phaseKey of transformationPhaseKeys) {
    const phase = TUTOR_BATTLE_TEST_PHASES_EXACT.find((entry) => entry.key === phaseKey);
    assert.ok(phase, `expected exact phase ${phaseKey} to exist`);
    assert.equal(phase.questions.length, 15, `expected ${phaseKey} to expose 15 deep-dive questions`);
  }
});
