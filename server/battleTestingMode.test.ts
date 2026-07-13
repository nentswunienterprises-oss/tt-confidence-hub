import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { hasCompleteTutorDocumentation, reconcileTutorTrainingMode } from "./battleTesting";
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

test("reconcileTutorTrainingMode clears stale applicant mode once documentation is complete", () => {
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
      persistedMode: "applicant",
      moduleProgress,
      deepDiveProgress,
      currentState: "locked",
      docsComplete: true,
    }),
    "certified_live"
  );
});

test("hasCompleteTutorDocumentation accepts legacy records that only stored approved document statuses", () => {
  assert.equal(
    hasCompleteTutorDocumentation({
      doc_1_submission_verified: false,
      doc_2_submission_verified: false,
      doc_3_submission_verified: false,
      doc_4_submission_verified: false,
      doc_5_submission_verified: false,
      doc_6_submission_verified: false,
      documents_status: {
        "1": "approved",
        "2": "approved",
        "3": "approved",
        "4": "approved",
        "5": "approved",
        "6": "approved",
      },
    }),
    true
  );
});
