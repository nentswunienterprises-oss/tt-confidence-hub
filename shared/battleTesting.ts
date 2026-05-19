export const BATTLE_TEST_SCORE_POINTS = {
  clear: 1,
  partial: 0.5,
  fail: 0,
} as const;

export type BattleTestScore = keyof typeof BATTLE_TEST_SCORE_POINTS;
export type BattleTestState = "locked" | "watchlist" | "fail";
export type BattleTestSubjectType = "tutor" | "td";
export type TutorBattleTestModuleKey = "transformation_phases" | "session_infrastructure";
export type TutorBattleTestHistoricalState = "in_progress" | "completed";
export type TutorBattleTestHealthState = "locked" | "watchlist" | "drift";
export type TutorTrainingMode = "applicant" | "training" | "sandbox" | "certified_live" | "watchlist" | "suspended";
export type TutorBattleTestPhaseKey =
  | "clarity"
  | "structured_execution"
  | "controlled_discomfort"
  | "time_pressure_stability"
  | "topic_conditioning"
  | "intro_session_structure"
  | "logging_system"
  | "session_flow_control"
  | "drill_library"
  | "handover_verification"
  | "tools_required";

const TUTOR_BATTLE_TEST_KEYS: TutorBattleTestPhaseKey[] = [
  "clarity",
  "structured_execution",
  "controlled_discomfort",
  "time_pressure_stability",
  "topic_conditioning",
  "intro_session_structure",
  "logging_system",
  "session_flow_control",
  "drill_library",
  "handover_verification",
  "tools_required",
];

export interface BattleTestQuestionDefinition {
  key: string;
  section: string;
  prompt: string;
  expectedAnswer: string;
  failIndicators: string[];
  autoCriticalOnFail?: boolean;
}

export interface BattleTestPhaseDefinition {
  key: string;
  title: string;
  description: string;
  questions: BattleTestQuestionDefinition[];
}

export interface BattleTestResponseInput {
  phaseKey: string;
  questionKey: string;
  score: BattleTestScore;
  note?: string;
  isCriticalFail?: boolean;
}

export interface BattleTestPhaseScore {
  phaseKey: string;
  title: string;
  pointsEarned: number;
  pointsPossible: number;
  percent: number;
  state: BattleTestState;
}

export interface BattleTestOutcome {
  totalQuestions: number;
  answeredQuestions: number;
  totalPoints: number;
  possiblePoints: number;
  alignmentPercent: number;
  state: BattleTestState;
  hasCriticalFail: boolean;
  criticalFailReasons: string[];
  actionRequired: string;
  weakPhases: string[];
  phaseScores: BattleTestPhaseScore[];
}

export interface BattleTestingTutorSummary {
  assignmentId: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  studentCount: number;
  alignmentPercent: number | null;
  state: BattleTestState | null;
  hasCriticalFail: boolean;
  actionRequired: string | null;
  lastAuditAt: string | null;
  phaseScores: BattleTestPhaseScore[];
  mode?: TutorTrainingMode | null;
  moduleProgress?: TutorBattleTestModuleProgress[];
  deepDiveProgress?: TutorBattleTestDeepDiveProgress[];
  nextBattleTests?: TutorBattleTestRecommendation[];
  certificationRecoveryNote?: string | null;
  recoveryRequiredUntil?: string | null;
}

export interface TutorBattleTestModuleProgress {
  moduleKey: TutorBattleTestModuleKey;
  title: string;
  completedCount: number;
  totalCount: number;
  completed: boolean;
}

export interface TutorBattleTestDeepDiveProgress {
  phaseKey: string;
  title: string;
  moduleKey: TutorBattleTestModuleKey;
  moduleTitle: string;
  historicalState: TutorBattleTestHistoricalState;
  currentHealthState: TutorBattleTestHealthState;
  currentStreak: number;
  consecutiveDriftCount: number;
  latestScore: number | null;
  completedAt: string | null;
  lastTestedAt: string | null;
  attemptsCount: number;
  criticalFlag: boolean;
}

export interface TutorBattleTestRecommendation {
  phaseKey: string;
  title: string;
  moduleKey: TutorBattleTestModuleKey;
  priorityScore: number;
  reason: string;
}

export interface BattleTestingTdSummary {
  tdId: string | null;
  tdName: string | null;
  alignmentPercent: number | null;
  state: BattleTestState | null;
  hasCriticalFail: boolean;
  actionRequired: string | null;
  lastAuditAt: string | null;
}

export interface BattleTestRunHistoryItem {
  runId: string;
  podId: string;
  subjectType: BattleTestSubjectType;
  subjectUserId: string;
  tutorAssignmentId: string | null;
  subjectName: string;
  templateKey: string;
  selectedPhaseKeys: string[];
  alignmentPercent: number;
  state: BattleTestState;
  stateLabel: string;
  hasCriticalFail: boolean;
  actionRequired: string | null;
  completedAt: string;
  phaseScores: BattleTestPhaseScore[];
}

export interface BattleTestRepLogDetail {
  phaseKey: string;
  questionKey: string;
  section: string;
  questionOrder: number;
  prompt: string;
  expectedAnswer: string;
  failIndicators: string[];
  score: BattleTestScore;
  pointsAwarded: number;
  note: string | null;
  isCriticalFail: boolean;
}

export interface BattleTestRunDetail extends BattleTestRunHistoryItem {
  repLogs: BattleTestRepLogDetail[];
}

export interface PodBattleTestingSummary {
  podId: string;
  weeklyAlignmentPercent: number | null;
  driftIncidents: number;
  lockedTutors: number;
  watchlistTutors: number;
  failTutors: number;
  tdOperationalFlags: Array<{
    phaseKey: string;
    title: string;
    affectedTutors: number;
    windowDays: number;
  }>;
  phaseWeaknesses: Array<{
    phaseKey: string;
    title: string;
    averagePercent: number;
    affectedTutors: number;
  }>;
  phaseScores: BattleTestPhaseScore[];
  tutorSummaries: BattleTestingTutorSummary[];
  tdSummary: BattleTestingTdSummary | null;
}

const tutorPhaseDefinitions: BattleTestPhaseDefinition[] = [
  {
    key: "clarity",
    title: "Clarity",
    description: "Can the tutor correctly identify and enforce recognition before solving begins?",
    questions: [
      {
        key: "clarity_q1",
        section: "Core Purpose",
        prompt: "What is the purpose of the Clarity phase?",
        expectedAnswer:
          "To make sure the student can clearly see what they are dealing with before solving: vocabulary, method, reason, and immediate apply.",
        failIndicators: ["Help them understand", "explain the topic", "build confidence"],
      },
      {
        key: "clarity_q2",
        section: "Core Purpose",
        prompt: "What four fields must a tutor observe in Clarity?",
        expectedAnswer:
          "Vocabulary, method, reason, and immediate apply.",
        failIndicators: ["Accuracy, speed, confidence, neatness", "understanding and practice"],
      },
      {
        key: "clarity_q3",
        section: "Fields and Breakdown",
        prompt: "A student can solve after help but cannot name the terms or parts in the question. What is weak?",
        expectedAnswer: "Vocabulary is weak. The student does not yet clearly identify what they are looking at.",
        failIndicators: ["Structured Execution", "lack of practice", "confidence issue"],
      },
      {
        key: "clarity_q4",
        section: "Fields and Breakdown",
        prompt: "A student names the topic correctly but does not know the method to use. What is weak?",
        expectedAnswer: "Method is weak. They recognize the topic but do not have the correct solving structure yet.",
        failIndicators: ["Time pressure", "they are careless", "they need more speed"],
      },
      {
        key: "clarity_q5",
        section: "Fields and Breakdown",
        prompt: "A student follows steps but cannot explain why the steps work. What is weak?",
        expectedAnswer: "Reason is weak. The method may be present, but the logic behind it is not clear enough.",
        failIndicators: ["That is fine if they get answers", "move to speed", "they just need repetition"],
      },
      {
        key: "clarity_q6",
        section: "Fields and Breakdown",
        prompt: "A student understands after explanation but hesitates heavily when asked to try a similar question. What field is weak?",
        expectedAnswer: "Immediate apply is weak. Clarity has not yet transferred into action.",
        failIndicators: ["They are lazy", "they need motivation", "skip to Structured Execution"],
      },
      {
        key: "clarity_q7",
        section: "Protocol and Execution",
        prompt: "During a Clarity recognition rep, the student starts solving immediately. What should the tutor do?",
        expectedAnswer: "Pause the solving and return to recognition: name the problem type, identify the components, state the method, and explain the first step.",
        failIndicators: ["Let them solve", "help them finish", "mark the answer"],
      },
      {
        key: "clarity_q8",
        section: "Protocol and Execution",
        prompt: "During a recognition rep, the tutor starts explaining before checking what the student sees. What protocol break occurred?",
        expectedAnswer: "The tutor turned observation into teaching. In Clarity, the tutor must first observe whether the student can recognize the problem clearly.",
        failIndicators: ["They were helping", "explanation is always useful", "students need teaching first"],
      },
      {
        key: "clarity_q9",
        section: "Protocol and Execution",
        prompt: "When modeling in Clarity, what should the tutor do first?",
        expectedAnswer: "Name the problem type and components before explaining the method. Do not mix layers by explaining method before vocabulary.",
        failIndicators: ["Start solving", "ask the student questions", "explain everything at once"],
      },
      {
        key: "clarity_q10",
        section: "Protocol and Execution",
        prompt: "During modeling, should the tutor ask the student lots of questions?",
        expectedAnswer: "No. Modeling is showing, not testing. The tutor should model clearly, briefly, and in order.",
        failIndicators: ["Yes, to keep them engaged", "ask until they understand", "test while modeling"],
      },
      {
        key: "clarity_q11",
        section: "Tutor Moves",
        prompt: "A student gives a vague answer: 'You just move the thing over.' What should the tutor do?",
        expectedAnswer: "Do not accept vague language. Require correct mathematical language and ask them to name the operation, term, or step clearly.",
        failIndicators: ["Accept it if they understand", "move on", "correct it later"],
      },
      {
        key: "clarity_q12",
        section: "Tutor Moves",
        prompt: "When can a tutor say Clarity is improving?",
        expectedAnswer: "When the student names the problem type, identifies components, states the method, explains why it works, and applies it with less hesitation.",
        failIndicators: ["They got more answers right", "they seem confident", "they enjoyed the session"],
      },
      {
        key: "clarity_q13",
        section: "Progression and Constraints",
        prompt: "A student gets correct answers but cannot explain the method or reason. Should the tutor progress them?",
        expectedAnswer: "No. Hold in Clarity because the response is not structurally clear yet.",
        failIndicators: ["Yes, because accuracy matters", "move to speed", "give harder questions"],
      },
      {
        key: "clarity_q14",
        section: "Progression and Constraints",
        prompt: "What must not be introduced too early during Clarity?",
        expectedAnswer: "Boss Battles, heavy difficulty, and time pressure. Clarity must first build recognition, language, method, reason, and light application.",
        failIndicators: ["Challenge them early", "test under pressure", "build confidence through hard work"],
      },
      {
        key: "clarity_q15",
        section: "Final Filter",
        prompt: "What is the tutor's job inside Clarity?",
        expectedAnswer:
          "Build and verify the student's mental map: vocabulary, method, reason, and immediate apply, then return to observation instead of over-teaching.",
        failIndicators: ["Explain the topic", "make the student understand", "help them feel better"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "structured_execution",
    title: "Structured Execution",
    description: "Can the tutor enforce independent, repeatable method execution without help?",
    questions: [
      {
        key: "structured_execution_q1",
        section: "Core Purpose",
        prompt: "What is the purpose of Structured Execution?",
        expectedAnswer:
          "To make sure the student can execute a known method independently, in order, repeatedly, and without being carried by the tutor.",
        failIndicators: ["Practice solving", "improve accuracy", "revise the topic"],
      },
      {
        key: "structured_execution_q2",
        section: "Core Purpose",
        prompt: "When should a student enter Structured Execution?",
        expectedAnswer:
          "When Clarity is sufficient: the student knows what the problem is, knows the method, understands the reason, and can begin applying it.",
        failIndicators: ["When they get answers right once", "when the tutor has explained", "when the parent wants progress"],
      },
      {
        key: "structured_execution_q3",
        section: "Core Purpose",
        prompt: "What fields matter most in Structured Execution?",
        expectedAnswer:
          "Start behavior, step execution, repeatability or step order, and independence.",
        failIndicators: ["Confidence, speed, marks", "how much work they finish"],
      },
      {
        key: "structured_execution_q4",
        section: "Fields and Breakdown",
        prompt: "A student knows the method but waits for the tutor to tell them the first step. What is weak?",
        expectedAnswer: "Start behavior and independence are weak. They cannot initiate without support.",
        failIndicators: ["Clarity", "they forgot", "they need motivation"],
      },
      {
        key: "structured_execution_q5",
        section: "Fields and Breakdown",
        prompt: "A student starts correctly but keeps skipping steps. What is weak?",
        expectedAnswer: "Step execution and repeatability are weak. The method is not being executed in a stable order.",
        failIndicators: ["Carelessness", "speed problem", "confidence issue"],
      },
      {
        key: "structured_execution_q6",
        section: "Fields and Breakdown",
        prompt: "A student can solve only when the tutor gives hints after each step. What is weak?",
        expectedAnswer: "Independence is weak. The student is being carried through the method.",
        failIndicators: ["They understand", "they are improving", "the tutor is supporting well"],
      },
      {
        key: "structured_execution_q7",
        section: "Protocol and Execution",
        prompt: "In Structured Execution, should the tutor keep remodeling the method?",
        expectedAnswer: "No. If Clarity is present, the tutor must stop carrying and require independent execution. Only return to modeling if a true Clarity gap appears.",
        failIndicators: ["Yes, to help them remember", "model until perfect", "explain each step"],
      },
      {
        key: "structured_execution_q8",
        section: "Protocol and Execution",
        prompt: "The student says, 'I don't know,' but they already learned the method. What should the tutor do?",
        expectedAnswer: "Give thinking time, bring them back to identification, ask for the first step, and require execution without giving the full method again.",
        failIndicators: ["Explain again", "show the solution", "make it easier"],
      },
      {
        key: "structured_execution_q9",
        section: "Progression and Success",
        prompt: "A student completes a problem with constant prompting. Can that count as stable Structured Execution?",
        expectedAnswer: "No. The execution was tutor-dependent. Structured Execution requires independent starts, ordered steps, and repeatability.",
        failIndicators: ["Yes, because it was completed", "partial pass because answer is right"],
      },
      {
        key: "structured_execution_q10",
        section: "Progression and Success",
        prompt: "How should a tutor correct an error during Structured Execution?",
        expectedAnswer: "Target the exact point of failure. Do not explain everything again. Correct the broken step, then return the student to execution.",
        failIndicators: ["Restart the whole lesson", "give a full explanation", "move to a different topic"],
      },
      {
        key: "structured_execution_q11",
        section: "Tutor Moves",
        prompt: "The student says, 'I just do the normal thing.' What should the tutor require?",
        expectedAnswer: "Require clear step language. The student must name the step or operation, not use vague shortcuts.",
        failIndicators: ["Accept it if they can solve", "language does not matter", "move on"],
      },
      {
        key: "structured_execution_q12",
        section: "Tutor Moves",
        prompt: "Why does Structured Execution use repeated reps?",
        expectedAnswer: "To prove the student can execute the same method consistently, in order, without dependence.",
        failIndicators: ["To do more practice", "to fill time", "to build confidence"],
      },
      {
        key: "structured_execution_q13",
        section: "Phase Identification",
        prompt: "A student understands the method but cannot repeat it without skipping steps. Is this Clarity or Structured Execution?",
        expectedAnswer: "Structured Execution. The method is known, but execution is not reliable.",
        failIndicators: ["Clarity", "Controlled Discomfort", "Time Pressure"],
      },
      {
        key: "structured_execution_q14",
        section: "Progression and Success",
        prompt: "When is a student ready to leave Structured Execution?",
        expectedAnswer: "When they can start independently, follow the method in order, repeat it reliably, and reduce tutor dependence across reps.",
        failIndicators: ["When they get one answer right", "when they say they understand", "when the tutor feels ready"],
      },
      {
        key: "structured_execution_q15",
        section: "Final Filter",
        prompt: "What is the tutor's job inside Structured Execution?",
        expectedAnswer:
          "Protect the method structure, reduce dependence, correct skipped steps, and require independent ordered execution.",
        failIndicators: ["Explain more", "make it easier", "help them finish"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "controlled_discomfort",
    title: "Controlled Discomfort",
    description: "Can the tutor hold pressure and prevent rescue when difficulty appears?",
    questions: [
      {
        key: "controlled_discomfort_q1",
        section: "Core Purpose",
        prompt: "What is the purpose of Controlled Discomfort?",
        expectedAnswer:
          "To test and stabilize the student's response when uncertainty, difficulty, or unfamiliar forms appear.",
        failIndicators: ["Make questions harder", "challenge them", "build confidence"],
      },
      {
        key: "controlled_discomfort_q2",
        section: "Core Purpose",
        prompt: "When should Controlled Discomfort be used?",
        expectedAnswer:
          "After the student has enough Clarity and Structured Execution to face difficulty without the tutor needing to reteach the whole method.",
        failIndicators: ["Anytime they are bored", "when they need motivation", "before they know the method"],
      },
      {
        key: "controlled_discomfort_q3",
        section: "Core Purpose",
        prompt: "What fields matter most in Controlled Discomfort?",
        expectedAnswer:
          "Discomfort tolerance, initial response, rescue dependence, and first-step control.",
        failIndicators: ["Accuracy, speed, confidence", "marks and completion"],
      },
      {
        key: "controlled_discomfort_q4",
        section: "Fields and Breakdown",
        prompt: "A student sees a harder question and immediately says, 'I can't do this.' What field is weak?",
        expectedAnswer: "Discomfort tolerance and initial response are weak. The student is collapsing when uncertainty appears.",
        failIndicators: ["They need easier work", "they lack intelligence", "they should skip it"],
      },
      {
        key: "controlled_discomfort_q5",
        section: "Fields and Breakdown",
        prompt: "A student waits for the tutor to simplify every hard question. What is weak?",
        expectedAnswer: "Rescue dependence is high. The student has not learned to stay in the struggle long enough to attempt a first step.",
        failIndicators: ["They need support", "they are doing fine", "the tutor should explain more"],
      },
      {
        key: "controlled_discomfort_q6",
        section: "Fields and Breakdown",
        prompt: "A student cannot solve the full harder question but can identify the first step. Is that useful?",
        expectedAnswer: "Yes. Controlled Discomfort values first-step control because the goal is stable response under uncertainty, not instant full success.",
        failIndicators: ["No, they failed", "only final answers matter", "move back immediately"],
      },
      {
        key: "controlled_discomfort_q7",
        section: "Protocol and Execution",
        prompt: "During Controlled Discomfort, the tutor gives a full explanation mid-struggle. What rule was broken?",
        expectedAnswer: "The tutor removed the discomfort the phase was meant to expose. Full explanations mid-struggle break the phase condition.",
        failIndicators: ["They were helping", "students need explanation", "it prevents frustration"],
      },
      {
        key: "controlled_discomfort_q8",
        section: "Protocol and Execution",
        prompt: "The student freezes during a Boss Battle. What should the tutor do?",
        expectedAnswer: "Do not rescue. Give thinking time, ask for identification, ask for the first step, and observe whether the student recovers.",
        failIndicators: ["Show them how", "make it easier", "tell them the answer"],
      },
      {
        key: "controlled_discomfort_q9",
        section: "Purpose and Design",
        prompt: "Why does Controlled Discomfort introduce unfamiliar or harder forms?",
        expectedAnswer: "To see whether the student's structure survives when certainty disappears.",
        failIndicators: ["To make them stronger", "to impress parents", "to increase challenge"],
      },
      {
        key: "controlled_discomfort_q10",
        section: "Purpose and Design",
        prompt: "A tutor changes the hard question into an easier one because the student is uncomfortable. What happened?",
        expectedAnswer: "The rep was invalidated. The tutor removed the condition that was supposed to reveal the response pattern.",
        failIndicators: ["Good adaptation", "student-centered teaching", "helpful scaffolding"],
      },
      {
        key: "controlled_discomfort_q11",
        section: "Tutor Discipline",
        prompt: "What emotional state should the tutor protect during Controlled Discomfort?",
        expectedAnswer: "Calm, neutral, structured effort. The tutor should not panic, over-comfort, shame, or rescue.",
        failIndicators: ["Make the student feel confident", "remove stress", "keep it easy"],
      },
      {
        key: "controlled_discomfort_q12",
        section: "Progression and Feedback",
        prompt: "A student gets the answer wrong but stays calm, identifies the type, and attempts the first step. Is that a complete failure?",
        expectedAnswer: "No. The answer is wrong, but the response may be improving. Log the actual fields: tolerance, initial response, rescue dependence, and first-step control.",
        failIndicators: ["Yes, wrong answer means fail", "accuracy is everything", "move back instantly"],
      },
      {
        key: "controlled_discomfort_q13",
        section: "Constraints",
        prompt: "A tutor gives a question far beyond the student's current method. Is that Controlled Discomfort?",
        expectedAnswer: "No. Controlled Discomfort is controlled. The difficulty must test response under uncertainty, not introduce impossible content.",
        failIndicators: ["Yes, harder is better", "pressure builds grit", "let them struggle"],
      },
      {
        key: "controlled_discomfort_q14",
        section: "Recovery and Success",
        prompt: "What does recovery look like in Controlled Discomfort?",
        expectedAnswer: "The student pauses, stays oriented, identifies what they know, attempts the first step, and continues without full rescue.",
        failIndicators: ["They feel happy", "they finish fast", "they stop struggling"],
      },
      {
        key: "controlled_discomfort_q15",
        section: "Final Filter",
        prompt: "What is the tutor's job inside Controlled Discomfort?",
        expectedAnswer:
          "Preserve controlled difficulty, prevent rescue, observe the student's response under uncertainty, and guide only enough to return them to first-step execution.",
        failIndicators: ["Explain fully", "make them comfortable", "challenge them randomly"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "time_pressure_stability",
    title: "Time Pressure Stability",
    description: "Can the tutor protect method-first execution when urgency is introduced?",
    questions: [
      {
        key: "time_pressure_stability_q1",
        section: "Core Purpose",
        prompt: "What is the purpose of Time Pressure Stability?",
        expectedAnswer:
          "To test whether the student can keep structure intact while time pressure is active.",
        failIndicators: ["Make them faster", "finish on time", "exam speed"],
      },
      {
        key: "time_pressure_stability_q2",
        section: "Core Purpose",
        prompt: "When should Time Pressure Stability be used?",
        expectedAnswer:
          "After the student has enough Clarity, Structured Execution, and Controlled Discomfort to maintain structure before time is added.",
        failIndicators: ["Before exams only", "whenever they are slow", "to force improvement"],
      },
      {
        key: "time_pressure_stability_q3",
        section: "Core Purpose",
        prompt: "What fields matter most in Time Pressure Stability?",
        expectedAnswer:
          "Completion integrity, structure under time, pace control, and start under time.",
        failIndicators: ["Speed, marks, confidence", "how quickly they finish"],
      },
      {
        key: "time_pressure_stability_q4",
        section: "Fields and Breakdown",
        prompt: "A student finishes quickly but skips steps and becomes messy. Is that stable?",
        expectedAnswer: "No. Speed without structure is not Time Pressure Stability. The student must maintain method discipline under time.",
        failIndicators: ["Yes, they were fast", "exam speed matters most", "mark it as progress"],
      },
      {
        key: "time_pressure_stability_q5",
        section: "Fields and Breakdown",
        prompt: "The timer starts and the student immediately panics before reading the question. What field is weak?",
        expectedAnswer: "Start under time is weak. The student's initial response collapses under time pressure.",
        failIndicators: ["They are slow", "they lack content knowledge", "they need motivation"],
      },
      {
        key: "time_pressure_stability_q6",
        section: "Fields and Breakdown",
        prompt: "A student rushes the first half and then freezes. What is weak?",
        expectedAnswer: "Pace control is weak. Their speed is uneven and structure is not being managed under time.",
        failIndicators: ["They need to go faster", "they need harder drills", "they are careless"],
      },
      {
        key: "time_pressure_stability_q7",
        section: "Protocol and Execution",
        prompt: "A student knows the method, but under time they abandon the steps. What is weak?",
        expectedAnswer: "Structure under time is weak. The method does not survive urgency.",
        failIndicators: ["Clarity", "they forgot everything", "they just need more speed"],
      },
      {
        key: "time_pressure_stability_q8",
        section: "Protocol and Execution",
        prompt: "A student completes the task on time but with broken method and guessed answers. Can it count as a strong completion?",
        expectedAnswer: "No. Completion integrity is weak because the task was finished without preserving structure.",
        failIndicators: ["Yes, because completed", "marks are enough", "speed was good"],
      },
      {
        key: "time_pressure_stability_q9",
        section: "Tutor Discipline",
        prompt: "During a timed rep, the tutor keeps saying, 'Hurry, hurry, hurry.' What is wrong?",
        expectedAnswer: "The tutor replaced method discipline with urgency talk. Time Pressure Stability should train calm structure under time, not panic.",
        failIndicators: ["Good exam preparation", "pressure motivates", "students need urgency"],
      },
      {
        key: "time_pressure_stability_q10",
        section: "Tutor Moves",
        prompt: "The student rushes and skips the method under time. What should the tutor do after the rep?",
        expectedAnswer: "Log the breakdown, reset the structure, identify where method discipline collapsed, and repeat with focus on controlled pace and step integrity.",
        failIndicators: ["Tell them to go faster", "give easier work", "ignore it if answer is right"],
      },
      {
        key: "time_pressure_stability_q11",
        section: "Constraints",
        prompt: "A student cannot recognize the problem type, but the tutor starts timed practice anyway. What is wrong?",
        expectedAnswer: "The drill is invalid. Time pressure cannot be added before Clarity and basic execution are stable enough.",
        failIndicators: ["Time reveals weakness", "exam practice is needed", "pressure builds skill"],
      },
      {
        key: "time_pressure_stability_q12",
        section: "Success and Stability",
        prompt: "What does a stable time-pressure response look like?",
        expectedAnswer: "The student reads, identifies, starts calmly, follows the method, controls pace, and completes without abandoning structure.",
        failIndicators: ["Fast answer", "no hesitation", "finishes before time"],
      },
      {
        key: "time_pressure_stability_q13",
        section: "Success and Stability",
        prompt: "A student works slowly under time but keeps the method intact. Is that automatically a fail?",
        expectedAnswer: "No. It may show developing stability. The tutor should log pace control and completion integrity separately instead of judging only speed.",
        failIndicators: ["Yes, too slow", "speed is the only goal", "fail because incomplete"],
      },
      {
        key: "time_pressure_stability_q14",
        section: "Progression",
        prompt: "When can a student progress in Time Pressure Stability?",
        expectedAnswer: "When they maintain structure under time, control pace, start without panic, and preserve completion integrity across reps.",
        failIndicators: ["When they finish fast once", "when they get a high mark", "when they feel confident"],
      },
      {
        key: "time_pressure_stability_q15",
        section: "Final Filter",
        prompt: "What is the tutor's job inside Time Pressure Stability?",
        expectedAnswer:
          "Protect structure under urgency, observe whether time breaks the response, log pace and integrity honestly, and prevent panic-based rushing.",
        failIndicators: ["Push speed", "make them finish", "simulate exam stress only"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "topic_conditioning",
    title: "Topic Conditioning",
    description: "Can the tutor diagnose where response breaks inside the current arena and hold there until reliable?",
    questions: [
      {
        key: "topic_conditioning_q1",
        section: "Core Understanding",
        prompt: "Explain Topic Conditioning without using the words 'topic', 'phase', or 'stability'.",
        expectedAnswer:
          "Training how a student behaves when difficulty appears in their current work, identifying the break point and repeatedly correcting that response until it becomes reliable.",
        failIndicators: ["helping students understand their work better", "practicing what they learn in school", "improving performance through repetition"],
      },
      {
        key: "topic_conditioning_q2",
        section: "Core Understanding",
        prompt: "A student understands fractions but freezes in tests. Under Response Integrity, what exactly is the problem?",
        expectedAnswer: "Understanding exists, but execution breaks under pressure in that arena.",
        failIndicators: ["they don't understand properly", "they lack confidence", "they need more practice"],
      },
      {
        key: "topic_conditioning_q3",
        section: "Core Understanding",
        prompt: "Why is the statement 'The student is bad at algebra' wrong in Response Integrity?",
        expectedAnswer: "Response Integrity does not label global ability. It identifies where response breaks inside a specific arena.",
        failIndicators: ["it's too negative", "it lowers confidence", "it's not motivating"],
      },
      {
        key: "topic_conditioning_q4",
        section: "Core Understanding",
        prompt: "What is the difference between covering a topic and conditioning a topic?",
        expectedAnswer:
          "Covering explains and moves through content. Conditioning diagnoses where response breaks and trains that response until it becomes reliable before progressing.",
        failIndicators: ["conditioning is just more practice", "covering is faster, conditioning is slower"],
      },
      {
        key: "topic_conditioning_q5",
        section: "Core Understanding",
        prompt: "Why does Response Integrity refuse to move to a new topic just because the student seems better?",
        expectedAnswer:
          "Apparent improvement is not enough. Response Integrity only moves when response is consistently reliable under difficulty and pressure.",
        failIndicators: ["we want to be thorough", "repetition helps confidence"],
      },
      {
        key: "topic_conditioning_q6",
        section: "Application",
        prompt: "Parent says 'My child struggles with math in general.' What is your first move inside Response Integrity?",
        expectedAnswer: "Select a specific arena, test it using Response Integrity checks, and identify where the response breaks.",
        failIndicators: ["ask what topics they don't understand", "start teaching basics"],
      },
      {
        key: "topic_conditioning_q7",
        section: "Application",
        prompt: "Linear Equations: the student can name steps, delays starting, and skips steps. Identify the entry phase and why.",
        expectedAnswer: "Structured Execution, because the student knows what to do but cannot act reliably and independently.",
        failIndicators: ["clarity", "controlled discomfort"],
      },
      {
        key: "topic_conditioning_q8",
        section: "Application",
        prompt: "A student performs well in practice but collapses in exams. Which phase are you testing first and why?",
        expectedAnswer: "Time Pressure Stability, and possibly Controlled Discomfort, because the breakdown occurs under pressure.",
        failIndicators: ["clarity", "go over the topic again"],
      },
      {
        key: "topic_conditioning_q9",
        section: "Application",
        prompt: "High clarity, good execution, but the student breaks when questions change form. Where are they and what do you do next?",
        expectedAnswer: "Controlled Discomfort. Introduce harder or unfamiliar problems and force stable response without rescue.",
        failIndicators: ["give more practice", "explain different question types"],
      },
      {
        key: "topic_conditioning_q10",
        section: "Application",
        prompt: "Why is it incorrect to say 'This student is inconsistent' using Response Integrity logic?",
        expectedAnswer: "Because inconsistency is not random. It reflects different conditioning levels across different arenas.",
        failIndicators: ["it sounds negative", "it hurts confidence"],
      },
      {
        key: "topic_conditioning_q11",
        section: "Pressure Scenarios",
        prompt: "Student says 'I don't know this question' even though it is inside a trained arena. What do you do next step by step?",
        expectedAnswer: "Bring them back to identification, anchor structure, prevent escape, and force first-step execution.",
        failIndicators: ["explain again", "show them how to do it"],
        autoCriticalOnFail: true,
      },
      {
        key: "topic_conditioning_q12",
        section: "Pressure Scenarios",
        prompt: "Parent says 'Can we move to the next topic? They've already done this one a lot.' How do you respond without breaking Response Integrity doctrine?",
        expectedAnswer:
          "Explain that repetition alone is not the goal. Progress happens only when execution is reliably stable under pressure.",
        failIndicators: ["okay we can move on", "let's just test the next topic"],
      },
      {
        key: "topic_conditioning_q13",
        section: "Pressure Scenarios",
        prompt: "Student performs well with guidance, collapses alone, and asks for help early. What phase are they really in, and what must you stop doing immediately?",
        expectedAnswer: "Structured Execution. Stop rescuing, over-guiding, or carrying them.",
        failIndicators: ["they're improving", "give more support"],
        autoCriticalOnFail: true,
      },
      {
        key: "topic_conditioning_q14",
        section: "Pressure Scenarios",
        prompt: "Student gets answers correct but uses vague language and cannot explain steps clearly. Do you progress or hold, and why?",
        expectedAnswer: "Hold. Clarity is incomplete, so the response is not reliable.",
        failIndicators: ["progress, they're getting answers right", "focus on speed now"],
        autoCriticalOnFail: true,
      },
      {
        key: "topic_conditioning_final",
        section: "Final Test",
        prompt: "In one sentence, what is your job as a tutor in Response Integrity?",
        expectedAnswer: "To identify where the student's response breaks in an arena and condition it until it becomes stable.",
        failIndicators: ["help students understand math", "improve marks", "teach topics"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "intro_session_structure",
    title: "Intro Session Structure",
    description: "Can the tutor structure intro sessions to establish baseline clarity and prevent false starts?",
    questions: [
      {
        key: "intro_session_q1",
        section: "Core Understanding",
        prompt: "What is the purpose of the intro session structure in Response Integrity?",
        expectedAnswer: "To establish baseline clarity before any training begins, preventing false starts and wasted time on unstable foundation.",
        failIndicators: ["to build confidence", "to warm up the student", "to get them comfortable"],
      },
      {
        key: "intro_session_q2",
        section: "Core Understanding",
        prompt: "Why must clarity be verified before moving to structured execution in intro?",
        expectedAnswer: "Because incomplete clarity at baseline means all subsequent training will be built on instability.",
        failIndicators: ["to save time", "students improve quickly anyway"],
      },
      {
        key: "intro_session_q3",
        section: "Application",
        prompt: "In an intro session, the student recognizes problems but hesitates to execute independently. What is happening?",
        expectedAnswer: "Clarity is established but structured execution is not yet ready. Hold on execution drills.",
        failIndicators: ["they need confidence", "they're ready for harder problems"],
      },
    ],
  },
  {
    key: "logging_system",
    title: "Logging System",
    description: "Can the tutor maintain accurate session logs and use them to drive training decisions?",
    questions: [
      {
        key: "logging_q1",
        section: "Core Understanding",
        prompt: "What is the purpose of logging in Response Integrity?",
        expectedAnswer: "To create an objective record of student performance that drives training decisions and prevents tutor drift.",
        failIndicators: ["to track attendance", "to show progress to parents"],
      },
      {
        key: "logging_q2",
        section: "Core Understanding",
        prompt: "What must a log entry capture to be useful?",
        expectedAnswer: "The phase, the arena, the student's response clarity, and whether execution held under pressure.",
        failIndicators: ["just that they did it", "how they felt"],
      },
      {
        key: "logging_q3",
        section: "Application",
        prompt: "A tutor logs 'student improved' without phase or arena detail. What is wrong?",
        expectedAnswer: "The log is useless. It cannot drive decisions because it has no specificity.",
        failIndicators: ["that's fine", "they'll remember"],
      },
    ],
  },
  {
    key: "session_flow_control",
    title: "Session Flow Control",
    description: "Can the tutor execute a session plan without deviation and adapt only when data demands it?",
    questions: [
      {
        key: "session_flow_q1",
        section: "Core Understanding",
        prompt: "What is session flow control in Response Integrity?",
        expectedAnswer: "The discipline of following a planned phase sequence without deviation unless performance data forces a change.",
        failIndicators: ["keeping the student happy", "following their pace", "being flexible"],
      },
      {
        key: "session_flow_q2",
        section: "Core Understanding",
        prompt: "Why is deviation from the flow plan dangerous?",
        expectedAnswer: "Because it hides whether phases are actually mastered, replacing signal with tutor intuition.",
        failIndicators: ["it slows down progress", "it's boring for the student"],
      },
      {
        key: "session_flow_q3",
        section: "Application",
        prompt: "Mid-session, a student shows struggle. Can you skip to an easier phase?",
        expectedAnswer: "No. Log the struggle and complete the plan. Use the data to adjust next session.",
        failIndicators: ["yes, adapt to them", "yes, build confidence first"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "drill_library",
    title: "Drill Library",
    description: "Can the tutor select and execute drills that target the exact arena and phase?",
    questions: [
      {
        key: "drill_library_q1",
        section: "Core Understanding",
        prompt: "What is the purpose of the drill library in Response Integrity?",
        expectedAnswer: "To provide targeted, repeatable practice that isolates the exact skill or arena needed at each phase.",
        failIndicators: ["to give students lots of problems", "to keep them busy"],
      },
      {
        key: "drill_library_q2",
        section: "Core Understanding",
        prompt: "What makes a drill valid for a phase?",
        expectedAnswer: "It targets the exact arena and skill that phase is training, with minimal confounds.",
        failIndicators: ["any problem from that topic", "problems students find easy"],
      },
      {
        key: "drill_library_q3",
        section: "Application",
        prompt: "You need a clarity drill for exponent rules. What must it isolate?",
        expectedAnswer: "Only recognition of exponent rules, not their application or mixed topics.",
        failIndicators: ["any exponent problem", "multiple rule types together"],
      },
    ],
  },
  {
    key: "handover_verification",
    title: "Handover Verification",
    description: "Can the tutor verify that independent mastery has transferred before session end?",
    questions: [
      {
        key: "handover_q1",
        section: "Core Understanding",
        prompt: "What is handover verification in Response Integrity?",
        expectedAnswer: "The discipline of verifying that the student can execute independently before ending the session.",
        failIndicators: ["saying goodbye nicely", "telling them to practice at home"],
      },
      {
        key: "handover_q2",
        section: "Core Understanding",
        prompt: "Why must handover happen before session end?",
        expectedAnswer: "Because once the session ends, you cannot see if they can actually execute alone.",
        failIndicators: ["so you have proof to show", "so they leave confident"],
      },
      {
        key: "handover_q3",
        section: "Application",
        prompt: "At session end, a student can solve with your hints. Are they ready to go?",
        expectedAnswer: "No. They must prove independent execution in the final drills with no support.",
        failIndicators: ["yes, they're getting it", "they can ask for help at home"],
        autoCriticalOnFail: true,
      },
    ],
  },
  {
    key: "tools_required",
    title: "Tools Required",
    description: "Can the tutor use the Response Integrity system tools correctly to log, track, and communicate?",
    questions: [
      {
        key: "tools_q1",
        section: "Core Understanding",
        prompt: "Why are Response Integrity tools required, not optional?",
        expectedAnswer: "Because they enforce consistency, prevent data loss, and create the record needed for training decisions.",
        failIndicators: ["they're just convenient", "for administration"],
      },
      {
        key: "tools_q2",
        section: "Core Understanding",
        prompt: "What happens if a tutor skips logging a rep to save time?",
        expectedAnswer: "The training system goes blind. Decisions will be made without that data.",
        failIndicators: ["nothing, they remember anyway", "they can log it later"],
      },
      {
        key: "tools_q3",
        section: "Application",
        prompt: "You forget to log session end before closing. What is the risk?",
        expectedAnswer: "The session record is incomplete and cannot be used to compute training status.",
        failIndicators: ["you can add it later", "it's not important"],
      },
    ],
  },
];

const tdSystemIntegrityDefinition: BattleTestPhaseDefinition = {
  key: "td_system_integrity",
  title: "TD System Integrity",
  description: "Can the TD detect drift, enforce protocol, and protect system integrity under pressure?",
  questions: [
    {
      key: "td_q1",
      section: "System Ownership",
      prompt: "What is your job as a Territory Director in Response Integrity, in one sentence?",
      expectedAnswer: "To ensure the Response Integrity system is executed exactly as defined and to detect and correct any deviation immediately.",
      failIndicators: ["support tutors", "help improve sessions", "guide tutors"],
    },
    {
      key: "td_q2",
      section: "System Ownership",
      prompt: "What matters more: tutor intention or system execution? Why?",
      expectedAnswer: "System execution matters more because the system is the product and intention does not produce results.",
      failIndicators: ["both matter", "intention is important"],
    },
    {
      key: "td_q3",
      section: "System Ownership",
      prompt: "What is system drift?",
      expectedAnswer: "Any deviation from defined Response Integrity system protocols, regardless of outcome.",
      failIndicators: ["when results drop", "when tutors struggle"],
    },
    {
      key: "td_q4",
      section: "Drift Detection",
      prompt: "A tutor runs Recognition reps but allows the student to solve. What is this?",
      expectedAnswer: "A Clarity phase violation and protocol drift.",
      failIndicators: ["minor mistake", "still helping the student"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q5",
      section: "Drift Detection",
      prompt: "A student gets correct answers but steps are skipped, and the tutor logs it as successful. What do you flag?",
      expectedAnswer: "False compliance and a structure violation.",
      failIndicators: ["results are still good"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q6",
      section: "Drift Detection",
      prompt: "Tutor helps during the cold start window. What phase is violated and why does it matter?",
      expectedAnswer: "Structured Execution is violated because independence was not tested.",
      failIndicators: ["just helping flow"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q7",
      section: "Enforcement Decision",
      prompt: "You detect repeated small helping behaviors from a tutor. What do you do?",
      expectedAnswer: "Flag it, correct it immediately, monitor closely, and escalate if it repeats.",
      failIndicators: ["give feedback and see how it goes", "let them adjust over time"],
    },
    {
      key: "td_q8",
      section: "Enforcement Decision",
      prompt: "Tutor says 'The student was struggling, so I helped a bit.' What is your response?",
      expectedAnswer: "That violates the system. The struggle must be observed, not removed.",
      failIndicators: ["understandable", "just be careful next time"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q9",
      section: "Enforcement Decision",
      prompt: "A tutor produces good student results but breaks protocol often. Do you keep or remove them, and why?",
      expectedAnswer: "Correct or remove immediately because system integrity overrides short-term results.",
      failIndicators: ["keep them, results matter"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q10",
      section: "Audit Logic",
      prompt: "What makes a session pass audit?",
      expectedAnswer: "Exact protocol execution with full compliance.",
      failIndicators: ["good teaching", "student improvement"],
    },
    {
      key: "td_q11",
      section: "Audit Logic",
      prompt: "What is a critical audit failure?",
      expectedAnswer: "Breaking core protocol, such as rescue, skipping phases, or falsifying logs.",
      failIndicators: ["minor mistakes"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q12",
      section: "Audit Logic",
      prompt: "If logs do not match actual behavior, what does that indicate?",
      expectedAnswer: "Dishonesty or system manipulation.",
      failIndicators: ["logging error"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q13",
      section: "Pressure Scenarios",
      prompt: "Tutor rescues a student during Controlled Discomfort but logs 'independent execution.' What do you do?",
      expectedAnswer: "Flag it as a major violation, audit failure, and potential suspension.",
      failIndicators: ["correct the log", "warn them"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q14",
      section: "Pressure Scenarios",
      prompt: "Tutor consistently produces good sessions but avoids difficult drills. What is happening?",
      expectedAnswer: "System avoidance and hidden drift.",
      failIndicators: ["they're optimizing sessions"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q15",
      section: "Pressure Scenarios",
      prompt: "Tutor follows structure but softens pressure to keep the student comfortable. What is the issue?",
      expectedAnswer: "Protocol drift. The system is not being executed as designed.",
      failIndicators: ["they care about the student"],
      autoCriticalOnFail: true,
    },
    {
      key: "td_q16",
      section: "Pressure Scenarios",
      prompt: "Parent praises a tutor heavily, but audits show drift. What matters?",
      expectedAnswer: "System execution matters, not external praise.",
      failIndicators: ["parent satisfaction matters more"],
    },
    {
      key: "td_final",
      section: "Final Filter",
      prompt: "When should a tutor be removed from Response Integrity?",
      expectedAnswer:
        "When they consistently fail to execute the system, violate protocols, or compromise integrity.",
      failIndicators: ["when results drop", "when parents complain"],
      autoCriticalOnFail: true,
    },
  ],
};

export const TUTOR_BATTLE_TEST_PHASES = tutorPhaseDefinitions;
export const TD_BATTLE_TEST_PHASE = tdSystemIntegrityDefinition;
export const TUTOR_BATTLE_TEST_PHASE_ORDER = TUTOR_BATTLE_TEST_KEYS;

export function getTutorBattleTestPhaseDefinition(phaseKey: string) {
  return tutorPhaseDefinitions.find((phase) => phase.key === phaseKey) || null;
}

export function getTutorBattleTestPhaseDefinitions(phaseKeys: string[]) {
  return phaseKeys
    .map((phaseKey) => getTutorBattleTestPhaseDefinition(phaseKey))
    .filter((phase): phase is BattleTestPhaseDefinition => Boolean(phase));
}

export function getBattleTestQuestionDefinition(subjectType: BattleTestSubjectType, phaseKey: string, questionKey: string) {
  const phase =
    subjectType === "td"
      ? phaseKey === tdSystemIntegrityDefinition.key
        ? tdSystemIntegrityDefinition
        : null
      : getTutorBattleTestPhaseDefinition(phaseKey);
  return phase?.questions.find((question) => question.key === questionKey) || null;
}

function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

function getPhaseState(percent: number): BattleTestState {
  if (percent < 90) return "fail";
  if (percent < 95) return "watchlist";
  return "locked";
}

function getActionRequired(state: BattleTestState, hasCriticalFail: boolean) {
  if (hasCriticalFail || state === "fail") {
    return "Remove from live responsibility and recondition before returning.";
  }
  if (state === "watchlist") {
    return "Correct immediately and retest in the next cycle.";
  }
  return "Continue. Eligible for greater responsibility if other operating criteria hold.";
}

export function computeBattleTestOutcome(subjectType: BattleTestSubjectType, phases: BattleTestPhaseDefinition[], responses: BattleTestResponseInput[]): BattleTestOutcome {
  const responseMap = new Map(responses.map((response) => [`${response.phaseKey}:${response.questionKey}`, response] as const));
  const phaseScores: BattleTestPhaseScore[] = [];
  const criticalFailReasons = new Set<string>();
  let totalQuestions = 0;
  let answeredQuestions = 0;
  let totalPoints = 0;
  let possiblePoints = 0;

  for (const phase of phases) {
    let pointsEarned = 0;
    const pointsPossible = phase.questions.length;
    totalQuestions += phase.questions.length;
    possiblePoints += pointsPossible;

    for (const question of phase.questions) {
      const response = responseMap.get(`${phase.key}:${question.key}`);
      if (!response) continue;

      const points = BATTLE_TEST_SCORE_POINTS[response.score];
      answeredQuestions += 1;
      pointsEarned += points;
      totalPoints += points;

      if (response.isCriticalFail || (question.autoCriticalOnFail && response.score === "fail")) {
        criticalFailReasons.add(`${phase.title}: ${question.prompt}`);
      }
    }

    const percent = pointsPossible > 0 ? roundScore((pointsEarned / pointsPossible) * 100) : 0;
    phaseScores.push({
      phaseKey: phase.key,
      title: phase.title,
      pointsEarned: roundScore(pointsEarned),
      pointsPossible,
      percent,
      state: getPhaseState(percent),
    });
  }

  const alignmentPercent = possiblePoints > 0 ? roundScore((totalPoints / possiblePoints) * 100) : 0;
  const hasCriticalFail = criticalFailReasons.size > 0;
  const weakPhases = phaseScores.filter((phase) => phase.percent < 95).map((phase) => phase.phaseKey);
  const anyPhaseFailed = phaseScores.some((phase) => phase.percent < 90);
  const anyPhaseWatchlist = phaseScores.some((phase) => phase.percent >= 90 && phase.percent < 95);

  let state: BattleTestState;
  if (hasCriticalFail || anyPhaseFailed || alignmentPercent < 90) {
    state = "fail";
  } else if (anyPhaseWatchlist || alignmentPercent < 95) {
    state = "watchlist";
  } else {
    state = "locked";
  }

  return {
    totalQuestions,
    answeredQuestions,
    totalPoints: roundScore(totalPoints),
    possiblePoints,
    alignmentPercent,
    state,
    hasCriticalFail,
    criticalFailReasons: Array.from(criticalFailReasons),
    actionRequired: getActionRequired(state, hasCriticalFail),
    weakPhases,
    phaseScores,
  };
}

export function getBattleTestTemplateLabel(subjectType: BattleTestSubjectType) {
  return subjectType === "td" ? "TD System Integrity" : "Tutor Battle Test";
}

export function getBattleTestStateLabel(state: BattleTestState | null | undefined) {
  if (!state) return "Not Tested";
  if (state === "locked") return "LOCKED";
  if (state === "watchlist") return "WATCHLIST";
  return "FAIL / DRIFT";
}
