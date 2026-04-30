export const BATTLE_TEST_SCORE_POINTS = {
  clear: 1,
  partial: 0.5,
  fail: 0,
} as const;

export type BattleTestScore = keyof typeof BATTLE_TEST_SCORE_POINTS;
export type BattleTestState = "locked" | "watchlist" | "fail";
export type BattleTestSubjectType = "tutor" | "td";
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
        section: "Core Understanding",
        prompt: "What is the purpose of Clarity in TT, in one sentence?",
        expectedAnswer:
          "To ensure the student can clearly recognize what they are dealing with before solving begins.",
        failIndicators: ["help the student understand the topic", "explain the concept better", "build confidence"],
      },
      {
        key: "clarity_q2",
        section: "Core Understanding",
        prompt: "Why is solving not allowed during Recognition sets?",
        expectedAnswer:
          "Because the goal is to isolate recognition ability. Solving hides whether the student can actually see the problem clearly.",
        failIndicators: ["make it easier", "simplify the process", "we're still teaching"],
      },
      {
        key: "clarity_q3",
        section: "Core Understanding",
        prompt: "Explain the 3-Layer Lens and why all three layers must always be checked.",
        expectedAnswer:
          "Vocabulary, Method, and Reason must all be checked because missing any layer means clarity is incomplete.",
        failIndicators: ["only mentions one or two layers", "it helps understanding"],
      },
      {
        key: "clarity_q4",
        section: "Core Understanding",
        prompt: "What does Clarity measure that normal tutoring ignores?",
        expectedAnswer:
          "It measures whether the student can recognize, structure, and explain before solving, not just get answers.",
        failIndicators: ["checks understanding", "helps with basics"],
      },
      {
        key: "clarity_q5",
        section: "Core Understanding",
        prompt: "Why does TT not allow skipping from Clarity to harder phases even if the student seems smart?",
        expectedAnswer:
          "Because incomplete clarity leads to unstable execution later. Full recognition must hold before pressure is introduced.",
        failIndicators: ["to be thorough", "make sure they don't struggle"],
      },
      {
        key: "clarity_q6",
        section: "Application",
        prompt: "A student starts solving immediately but cannot name terms or explain steps. What phase are they in and why?",
        expectedAnswer:
          "Clarity. They are executing without recognition, so they cannot actually see the problem properly.",
        failIndicators: ["structured execution", "they just need practice"],
      },
      {
        key: "clarity_q7",
        section: "Application",
        prompt: "During a Recognition set, the student tries to solve anyway. What do you do immediately?",
        expectedAnswer: "Stop the solving, reset the rep, and enforce recognition-only protocol.",
        failIndicators: ["let them continue", "help them finish"],
        autoCriticalOnFail: true,
      },
      {
        key: "clarity_q8",
        section: "Application",
        prompt: "A student can repeat steps but cannot explain why they work. What layer is weak and what does that mean?",
        expectedAnswer: "Reason is weak. The student is memorizing without understanding, so clarity is incomplete.",
        failIndicators: ["they understand enough", "that's fine for now"],
      },
      {
        key: "clarity_q9",
        section: "Application",
        prompt: "In Light Apply, the student hesitates and delays starting. What is being exposed?",
        expectedAnswer: "Clarity is not stable. The student cannot translate recognition into independent action.",
        failIndicators: ["they lack confidence", "they need motivation"],
      },
      {
        key: "clarity_q10",
        section: "Application",
        prompt: "Why is minimal guidance enforced during Light Apply?",
        expectedAnswer: "To test whether clarity holds under independent execution without tutor support.",
        failIndicators: ["to make it harder", "to challenge the student"],
      },
      {
        key: "clarity_q11",
        section: "Pressure Scenarios",
        prompt: "Tutor explains Vocabulary, Method, and Reason perfectly, but does not ask the student to explain back. What is wrong?",
        expectedAnswer: "Clarity is assumed, not verified. Explanation back is required to test recognition.",
        failIndicators: ["nothing, explanation is enough"],
      },
      {
        key: "clarity_q12",
        section: "Pressure Scenarios",
        prompt: "Tutor turns Recognition reps into mini-teaching sessions. What violation is happening?",
        expectedAnswer: "Drill protocol is broken. Recognition sets must observe, not teach.",
        failIndicators: ["helping the student understand more"],
        autoCriticalOnFail: true,
      },
      {
        key: "clarity_q13",
        section: "Pressure Scenarios",
        prompt: "Student gets correct answers in Light Apply but uses vague language and unclear reasoning. Do you progress or hold? Why?",
        expectedAnswer: "Hold. Correct answers do not equal clarity. The response is not reliable.",
        failIndicators: ["progress, they're getting it right"],
        autoCriticalOnFail: true,
      },
      {
        key: "clarity_q14",
        section: "Pressure Scenarios",
        prompt: "Tutor skips Reason layer because Vocabulary and Method look strong. What is the risk?",
        expectedAnswer: "Hidden instability. The student may execute but collapse when the problem changes or difficulty rises.",
        failIndicators: ["it's fine if they understand steps"],
      },
      {
        key: "clarity_final",
        section: "Final Test",
        prompt: "What is your job inside the Clarity phase?",
        expectedAnswer:
          "To verify that the student can clearly recognize the problem using Vocabulary, Method, and Reason before allowing execution.",
        failIndicators: ["explain the topic", "help them understand better", "teach the concept clearly"],
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
        section: "Core Understanding",
        prompt: "What is the purpose of Structured Execution in TT, in one sentence?",
        expectedAnswer:
          "To ensure the student can execute a known method independently, in order, and repeatedly without assistance.",
        failIndicators: ["practice solving", "improve accuracy", "reinforce understanding"],
      },
      {
        key: "structured_execution_q2",
        section: "Core Understanding",
        prompt: "What is the key difference between Clarity and Structured Execution?",
        expectedAnswer:
          "Clarity verifies recognition. Structured Execution verifies independent action on a known method.",
        failIndicators: ["clarity is easier", "clarity is theory, execution is practice"],
      },
      {
        key: "structured_execution_q3",
        section: "Core Understanding",
        prompt: "Why does TT enforce 'state steps before solving'?",
        expectedAnswer:
          "To force structured thinking and prevent guessing or skipping, so the method is consciously followed.",
        failIndicators: ["help them remember", "slow them down"],
      },
      {
        key: "structured_execution_q4",
        section: "Core Understanding",
        prompt: "Why is guessing not tolerated in this phase?",
        expectedAnswer: "Because guessing hides lack of structure. TT trains reliable execution, not lucky outcomes.",
        failIndicators: ["it causes mistakes", "it's bad practice"],
      },
      {
        key: "structured_execution_q5",
        section: "Core Understanding",
        prompt: "Why is tutor opinion irrelevant in progression out of Structured Execution?",
        expectedAnswer:
          "Progression is based on observed execution signals and repeatable performance, not how the tutor feels.",
        failIndicators: ["to keep things consistent", "to follow system rules"],
      },
      {
        key: "structured_execution_q6",
        section: "Application",
        prompt: "A student knows the method but waits for help before starting. What phase are they in and why?",
        expectedAnswer: "Structured Execution. They cannot initiate independently even though the method is known.",
        failIndicators: ["clarity", "they lack confidence"],
      },
      {
        key: "structured_execution_q7",
        section: "Application",
        prompt: "During the cold start window, the student hesitates. What must you NOT do?",
        expectedAnswer: "Do not help, guide, or prompt. The hesitation must be observed and logged.",
        failIndicators: ["encourage them to start", "give a small hint"],
        autoCriticalOnFail: true,
      },
      {
        key: "structured_execution_q8",
        section: "Application",
        prompt: "A student gets the correct answer but skips steps. Do you accept or reject the rep? Why?",
        expectedAnswer: "Reject. Correct answer without structure is not valid execution.",
        failIndicators: ["accept, they got it right", "correct them next time"],
        autoCriticalOnFail: true,
      },
      {
        key: "structured_execution_q9",
        section: "Application",
        prompt: "A student executes correctly once but breaks on the next similar problem. What does this indicate?",
        expectedAnswer: "Lack of repeatability. Execution is not yet stable.",
        failIndicators: ["small mistake", "they just need more practice"],
      },
      {
        key: "structured_execution_q10",
        section: "Application",
        prompt: "Why does TT include Variation Control in this phase?",
        expectedAnswer:
          "To test whether the student can apply the same method when the form changes, preventing memorization.",
        failIndicators: ["challenge the student", "make it harder"],
      },
      {
        key: "structured_execution_q11",
        section: "Pressure Scenarios",
        prompt: "Tutor sees the student struggling to start and gives a hint after 3 seconds. What violation occurred?",
        expectedAnswer: "The cold start window was broken. Independent initiation was not tested.",
        failIndicators: ["helping the student", "keeping the flow going"],
        autoCriticalOnFail: true,
      },
      {
        key: "structured_execution_q12",
        section: "Pressure Scenarios",
        prompt: "Student asks: 'Is this the right step?' before continuing. What do you do?",
        expectedAnswer: "Refuse confirmation and require the student to proceed using their own structure.",
        failIndicators: ["confirm to keep them on track", "guide them slightly"],
        autoCriticalOnFail: true,
      },
      {
        key: "structured_execution_q13",
        section: "Pressure Scenarios",
        prompt: "Tutor keeps re-modelling the method during execution reps. What is the problem?",
        expectedAnswer: "The tutor has reverted to teaching instead of enforcing independent execution.",
        failIndicators: ["helping reinforce learning"],
        autoCriticalOnFail: true,
      },
      {
        key: "structured_execution_q14",
        section: "Pressure Scenarios",
        prompt: "Student completes all reps correctly but relies on small tutor prompts throughout. Do you progress or hold? Why?",
        expectedAnswer: "Hold. Independence is not achieved.",
        failIndicators: ["progress, they got them right"],
        autoCriticalOnFail: true,
      },
      {
        key: "structured_execution_final",
        section: "Final Test",
        prompt: "What is your job inside the Structured Execution phase?",
        expectedAnswer:
          "To enforce independent, step-by-step execution of a known method until it becomes repeatable without help.",
        failIndicators: ["help them solve correctly", "guide them through problems", "support their learning"],
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
        section: "Core Understanding",
        prompt: "What is the purpose of Controlled Discomfort in TT, in one sentence?",
        expectedAnswer:
          "To ensure the student maintains structured execution when difficulty and uncertainty appear without relying on rescue.",
        failIndicators: ["challenge the student", "make them stronger", "build confidence"],
      },
      {
        key: "controlled_discomfort_q2",
        section: "Core Understanding",
        prompt: "Why does TT not allow full rescue in this phase?",
        expectedAnswer:
          "Because rescue removes the condition being trained and hides the student's real response under difficulty.",
        failIndicators: ["struggle helps learning", "push the student harder"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q3",
        section: "Core Understanding",
        prompt: "What is the difference between Structured Execution and Controlled Discomfort?",
        expectedAnswer:
          "Structured Execution tests independent execution of a known method. Controlled Discomfort tests whether that execution holds when uncertainty is introduced.",
        failIndicators: ["just harder questions", "execution is easier, discomfort is harder"],
      },
      {
        key: "controlled_discomfort_q4",
        section: "Core Understanding",
        prompt: "What does 'hold the discomfort window' actually mean?",
        expectedAnswer:
          "Allow the student to sit in difficulty without intervening, rescuing, or reducing pressure so true response behavior can be observed.",
        failIndicators: ["give them time to think", "wait a bit before helping"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q5",
        section: "Core Understanding",
        prompt: "Why is only one-step confirmation allowed and nothing more?",
        expectedAnswer:
          "To prevent full guidance while giving just enough anchoring for the student to continue independently.",
        failIndicators: ["help them get started", "make it easier"],
      },
      {
        key: "controlled_discomfort_q6",
        section: "Application",
        prompt: "A student freezes when difficulty appears and immediately asks for help. What phase are they in and why?",
        expectedAnswer: "Controlled Discomfort. The breakdown appears under uncertainty, not under clarity or basic execution.",
        failIndicators: ["structured execution", "they lack confidence"],
      },
      {
        key: "controlled_discomfort_q7",
        section: "Application",
        prompt: "During the discomfort window, the student says 'I don't know.' What do you do next?",
        expectedAnswer: "Hold the discomfort. Do not rescue. Require continued engagement or a controlled first-step attempt.",
        failIndicators: ["explain the problem", "guide them through it"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q8",
        section: "Application",
        prompt: "A student completes the question correctly but required multiple hints during struggle. Do you accept or reject the rep? Why?",
        expectedAnswer: "Reject. The response was supported rather than independent.",
        failIndicators: ["accept, they got it right"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q9",
        section: "Application",
        prompt: "A student can execute well in familiar problems but collapses when the form changes. What is being exposed?",
        expectedAnswer: "Failure under uncertainty. This is a Controlled Discomfort breakdown.",
        failIndicators: ["they don't understand the topic", "they need more practice"],
      },
      {
        key: "controlled_discomfort_q10",
        section: "Application",
        prompt: "Why does TT repeat the same level of difficulty multiple times in this phase?",
        expectedAnswer: "To build stable tolerance to difficulty, not just survival of a single rep.",
        failIndicators: ["give more practice", "improve accuracy"],
      },
      {
        key: "controlled_discomfort_q11",
        section: "Pressure Scenarios",
        prompt: "Tutor sees the student struggling and says 'Let me show you how to do this.' What violation occurred?",
        expectedAnswer: "Full rescue. The discomfort condition was removed.",
        failIndicators: ["helping the student understand"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q12",
        section: "Pressure Scenarios",
        prompt: "Student keeps asking for help after every step. What must you enforce?",
        expectedAnswer: "No rescue. Maintain independence and require the student to continue without full guidance.",
        failIndicators: ["answer their questions to keep them moving"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q13",
        section: "Pressure Scenarios",
        prompt: "Tutor reduces the difficulty because the student looks overwhelmed. What is the problem?",
        expectedAnswer: "The tutor is protecting comfort instead of training response under difficulty, which breaks the phase.",
        failIndicators: ["adjusting to the student's level"],
        autoCriticalOnFail: true,
      },
      {
        key: "controlled_discomfort_q14",
        section: "Pressure Scenarios",
        prompt: "Student hesitates but eventually works through the problem independently without help. What does this indicate?",
        expectedAnswer: "Improving discomfort tolerance and controlled response under difficulty.",
        failIndicators: ["they're gaining confidence"],
      },
      {
        key: "controlled_discomfort_final",
        section: "Final Test",
        prompt: "What is your job inside the Controlled Discomfort phase?",
        expectedAnswer:
          "To maintain pressure and ensure the student continues executing the method under difficulty without rescue.",
        failIndicators: ["support them through hard questions", "help them get unstuck", "guide them when they struggle"],
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
        section: "Core Understanding",
        prompt: "What is the purpose of Time Pressure Stability in TT, in one sentence?",
        expectedAnswer:
          "To ensure the student can maintain structured method execution under time pressure without collapsing into panic or rushing.",
        failIndicators: ["make students faster", "improve speed in exams", "help them finish on time"],
      },
      {
        key: "time_pressure_stability_q2",
        section: "Core Understanding",
        prompt: "Why does TT say 'method over speed' in this phase?",
        expectedAnswer:
          "Because speed without structure creates instability. Controlled execution under time matters more than finishing quickly.",
        failIndicators: ["accuracy matters more than speed", "so they don't rush"],
      },
      {
        key: "time_pressure_stability_q3",
        section: "Core Understanding",
        prompt: "What does the timer actually expose in a student's behavior?",
        expectedAnswer: "Whether structure breaks under urgency through panic, rushing, hesitation, or loss of method.",
        failIndicators: ["how fast they are", "how well they perform under pressure"],
      },
      {
        key: "time_pressure_stability_q4",
        section: "Core Understanding",
        prompt: "Why is speed not considered success in this phase?",
        expectedAnswer: "Because success is defined by maintained structure and controlled execution, not by finishing quickly.",
        failIndicators: ["they might make mistakes", "speed comes later"],
      },
      {
        key: "time_pressure_stability_q5",
        section: "Core Understanding",
        prompt: "How does this phase confirm whether earlier phases were real?",
        expectedAnswer:
          "If earlier phases were truly conditioned, structure will hold under time. If not, breakdown appears immediately.",
        failIndicators: ["it builds on previous phases", "it tests everything together"],
      },
      {
        key: "time_pressure_stability_q6",
        section: "Application",
        prompt: "A student starts rushing and skipping steps as soon as the timer starts. What is being exposed?",
        expectedAnswer: "Structure breakdown under time pressure.",
        failIndicators: ["they panic", "they need more confidence"],
      },
      {
        key: "time_pressure_stability_q7",
        section: "Application",
        prompt: "A student completes the question quickly but with poor structure. Do you accept or reject the rep? Why?",
        expectedAnswer: "Reject. Speed without structure is not valid performance.",
        failIndicators: ["accept, they finished on time"],
        autoCriticalOnFail: true,
      },
      {
        key: "time_pressure_stability_q8",
        section: "Application",
        prompt: "During timed reps, the student slows down slightly but maintains full structure. Is this correct behavior? Why?",
        expectedAnswer: "Yes. Controlled pace with maintained structure is the goal, not raw speed.",
        failIndicators: ["no, they should go faster"],
      },
      {
        key: "time_pressure_stability_q9",
        section: "Application",
        prompt: "Why must the same timer be used across repeated reps?",
        expectedAnswer: "To measure consistency and stability under identical pressure conditions.",
        failIndicators: ["to be fair", "to track progress"],
      },
      {
        key: "time_pressure_stability_q10",
        section: "Application",
        prompt: "A student performs well once under time but collapses in the next rep. What does this indicate?",
        expectedAnswer: "Lack of stability under time pressure.",
        failIndicators: ["they made a mistake", "they need more practice"],
      },
      {
        key: "time_pressure_stability_q11",
        section: "Pressure Scenarios",
        prompt: "Tutor says 'Faster, faster, you're running out of time!' What violation occurred?",
        expectedAnswer: "The tutor pushed speed over method and broke the phase protocol.",
        failIndicators: ["encouraging urgency"],
        autoCriticalOnFail: true,
      },
      {
        key: "time_pressure_stability_q12",
        section: "Pressure Scenarios",
        prompt: "Tutor helps the student mid-timer to keep them moving. What is the problem?",
        expectedAnswer: "Interference under pressure. The student is not executing independently under real conditions.",
        failIndicators: ["helping them stay on track"],
        autoCriticalOnFail: true,
      },
      {
        key: "time_pressure_stability_q13",
        section: "Pressure Scenarios",
        prompt: "Tutor stops the timer early because the student looks overwhelmed. What is the issue?",
        expectedAnswer: "The pressure condition was removed, which invalidates the rep.",
        failIndicators: ["adjusting to the student"],
        autoCriticalOnFail: true,
      },
      {
        key: "time_pressure_stability_q14",
        section: "Pressure Scenarios",
        prompt: "Student maintains structure but fails to complete within time. What matters more here and why?",
        expectedAnswer: "Structure matters more. Completion without structure is meaningless, while structure can be conditioned into completion.",
        failIndicators: ["completion matters more"],
      },
      {
        key: "time_pressure_stability_final",
        section: "Final Test",
        prompt: "What is your job inside the Time Pressure Stability phase?",
        expectedAnswer:
          "To ensure the student maintains structured method execution under time pressure without sacrificing control or independence.",
        failIndicators: ["help them work faster", "improve exam speed", "make sure they finish on time"],
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
          "Describe training how a student behaves when difficulty appears in their current work, identifying the break point and repeatedly correcting that response until it becomes reliable.",
        failIndicators: ["helping students understand their work better", "practicing what they learn in school", "improving performance through repetition"],
      },
      {
        key: "topic_conditioning_q2",
        section: "Core Understanding",
        prompt: "A student understands fractions but freezes in tests. Under TT, what exactly is the problem?",
        expectedAnswer: "Understanding exists, but execution breaks under pressure in that arena.",
        failIndicators: ["they don't understand properly", "they lack confidence", "they need more practice"],
      },
      {
        key: "topic_conditioning_q3",
        section: "Core Understanding",
        prompt: "Why is the statement 'The student is bad at algebra' wrong in TT?",
        expectedAnswer: "TT does not label global ability. It identifies where response breaks inside a specific arena.",
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
        prompt: "Why does TT refuse to move to a new topic just because the student seems better?",
        expectedAnswer:
          "Apparent improvement is not enough. TT only moves when response is consistently reliable under difficulty and pressure.",
        failIndicators: ["we want to be thorough", "repetition helps confidence"],
      },
      {
        key: "topic_conditioning_q6",
        section: "Application",
        prompt: "Parent says 'My child struggles with math in general.' What is your first move inside TT?",
        expectedAnswer: "Select a specific arena, test it using TT checks, and identify where the response breaks.",
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
        prompt: "Why is it incorrect to say 'This student is inconsistent' using TT logic?",
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
        prompt: "Parent says 'Can we move to the next topic? They've already done this one a lot.' How do you respond without breaking TT doctrine?",
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
        prompt: "In one sentence, what is your job as a tutor in TT?",
        expectedAnswer: "To identify where the student's response breaks in an arena and condition it until it becomes stable.",
        failIndicators: ["help students understand math", "improve marks", "teach topics"],
        autoCriticalOnFail: true,
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
      prompt: "What is your job as a Territory Director in TT, in one sentence?",
      expectedAnswer: "To ensure the TT system is executed exactly as defined and to detect and correct any deviation immediately.",
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
      expectedAnswer: "Any deviation from defined TT-OS protocols, regardless of outcome.",
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
      prompt: "When should a tutor be removed from TT?",
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
