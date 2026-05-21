import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { reconcileTutorTrainingMode } from "./battleTesting";
import type { TutorBattleTestDeepDiveProgress, TutorBattleTestModuleProgress } from "@shared/battleTesting";

test("reconcileTutorTrainingMode keeps applicant when documentation is incomplete", () => {
  const moduleProgress: TutorBattleTestModuleProgress[] = [
    {
      moduleKey: "transformation_phases",
      title: "Transformation Phases",
      completedCount: 5,
      totalCount: 5,
      completed: true,
    },
    {
      moduleKey: "session_infrastructure",
      title: "Session Infrastructure",
      completedCount: 6,
      totalCount: 6,
      completed: true,
    },
  ];

  const deepDiveProgress: TutorBattleTestDeepDiveProgress[] = [];

  assert.equal(
    reconcileTutorTrainingMode({
      persistedMode: "training",
      moduleProgress,
      deepDiveProgress,
      currentState: "locked",
      docsComplete: false,
    }),
    "applicant"
  );
});
