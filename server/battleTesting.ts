import { v4 as uuidv4 } from "uuid";
import { supabase } from "./storage";
import {
  BATTLE_TEST_SCORE_POINTS,
  computeBattleTestOutcome,
  getBattleTestStateLabel,
  type BattleTestOutcome,
  type BattleTestPhaseDefinition,
  type BattleTestPhaseScore,
  type BattleTestRepLogDetail,
  type BattleTestResponseInput,
  type BattleTestRunDetail,
  type BattleTestRunHistoryItem,
  type BattleTestingTdSummary,
  type BattleTestingTutorSummary,
  type BattleTestState,
  type BattleTestSubjectType,
  type PodBattleTestingSummary,
} from "@shared/battleTesting";

interface PersistBattleTestRunInput {
  podId: string;
  subjectType: BattleTestSubjectType;
  subjectUserId: string;
  tutorAssignmentId?: string | null;
  createdByUserId: string;
  templateKey: string;
  phases: BattleTestPhaseDefinition[];
  responses: BattleTestResponseInput[];
}

interface TutorBattleTestingMeta {
  assignmentId: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  studentCount: number;
}

interface TdBattleTestingMeta {
  tdId: string | null;
  tdName: string | null;
}

interface BattleTestRunRow {
  id: string;
  pod_id: string;
  subject_type: BattleTestSubjectType;
  subject_user_id: string;
  tutor_assignment_id: string | null;
  created_by_user_id: string;
  template_key: string;
  selected_phase_keys: string[];
  phase_scores: BattleTestPhaseScore[];
  weak_phases: string[];
  critical_fail_reasons: string[];
  total_questions: number;
  answered_questions: number;
  total_points: number;
  possible_points: number;
  alignment_percent: number;
  state: BattleTestState;
  has_critical_fail: boolean;
  action_required: string | null;
  completed_at: string;
  created_at: string;
}

interface BattleTestRepLogRow {
  run_id: string;
  phase_key: string;
  question_key: string;
  section: string;
  question_order: number;
  prompt: string;
  expected_answer: string;
  fail_indicators: string[];
  score: "clear" | "partial" | "fail";
  points_awarded: number;
  note: string | null;
  is_critical_fail: boolean;
}

function roundValue(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizePhaseScores(rawValue: unknown): BattleTestPhaseScore[] {
  if (!Array.isArray(rawValue)) return [];
  return rawValue
    .map((entry) => {
      const item = entry as Partial<BattleTestPhaseScore>;
      if (!item?.phaseKey || !item?.title) return null;
      return {
        phaseKey: String(item.phaseKey),
        title: String(item.title),
        pointsEarned: Number(item.pointsEarned || 0),
        pointsPossible: Number(item.pointsPossible || 0),
        percent: Number(item.percent || 0),
        state: (item.state as BattleTestState) || "fail",
      };
    })
    .filter((entry): entry is BattleTestPhaseScore => Boolean(entry));
}

function normalizeStringArray(rawValue: unknown) {
  return Array.isArray(rawValue) ? rawValue.map((item) => String(item)) : [];
}

function mapRunRow(rawRow: any): BattleTestRunRow {
  return {
    id: String(rawRow.id),
    pod_id: String(rawRow.pod_id),
    subject_type: rawRow.subject_type as BattleTestSubjectType,
    subject_user_id: String(rawRow.subject_user_id),
    tutor_assignment_id: rawRow.tutor_assignment_id ? String(rawRow.tutor_assignment_id) : null,
    created_by_user_id: String(rawRow.created_by_user_id),
    template_key: String(rawRow.template_key),
    selected_phase_keys: normalizeStringArray(rawRow.selected_phase_keys),
    phase_scores: normalizePhaseScores(rawRow.phase_scores),
    weak_phases: normalizeStringArray(rawRow.weak_phases),
    critical_fail_reasons: normalizeStringArray(rawRow.critical_fail_reasons),
    total_questions: Number(rawRow.total_questions || 0),
    answered_questions: Number(rawRow.answered_questions || 0),
    total_points: Number(rawRow.total_points || 0),
    possible_points: Number(rawRow.possible_points || 0),
    alignment_percent: Number(rawRow.alignment_percent || 0),
    state: (rawRow.state as BattleTestState) || "fail",
    has_critical_fail: !!rawRow.has_critical_fail,
    action_required: rawRow.action_required ? String(rawRow.action_required) : null,
    completed_at: String(rawRow.completed_at),
    created_at: String(rawRow.created_at),
  };
}

function mapRepLogRow(rawRow: any): BattleTestRepLogRow {
  return {
    run_id: String(rawRow.run_id),
    phase_key: String(rawRow.phase_key),
    question_key: String(rawRow.question_key),
    section: String(rawRow.section),
    question_order: Number(rawRow.question_order || 0),
    prompt: String(rawRow.prompt),
    expected_answer: String(rawRow.expected_answer),
    fail_indicators: normalizeStringArray(rawRow.fail_indicators),
    score: rawRow.score as "clear" | "partial" | "fail",
    points_awarded: Number(rawRow.points_awarded || 0),
    note: rawRow.note ? String(rawRow.note) : null,
    is_critical_fail: !!rawRow.is_critical_fail,
  };
}

function getEmptySummary(podId: string): PodBattleTestingSummary {
  return {
    podId,
    weeklyAlignmentPercent: null,
    driftIncidents: 0,
    lockedTutors: 0,
    watchlistTutors: 0,
    failTutors: 0,
    phaseWeaknesses: [],
    phaseScores: [],
    tutorSummaries: [],
    tdSummary: null,
  };
}

export async function persistBattleTestRun(input: PersistBattleTestRunInput) {
  const { podId, subjectType, subjectUserId, tutorAssignmentId, createdByUserId, templateKey, phases, responses } = input;
  if (!phases.length) {
    throw new Error("At least one battle-testing phase is required.");
  }

  const expectedQuestionKeys = new Set(
    phases.flatMap((phase) => phase.questions.map((question) => `${phase.key}:${question.key}`))
  );

  const responseMap = validateBattleTestResponses(subjectType, phases, responses);
  if (responseMap.size !== expectedQuestionKeys.size) {
    throw new Error("Every battle-testing question must be scored before submission.");
  }

  for (const expectedQuestionKey of expectedQuestionKeys) {
    if (!responseMap.has(expectedQuestionKey)) {
      throw new Error(`Missing battle-testing response: ${expectedQuestionKey}`);
    }
  }

  for (const response of responseMap.values()) {
    if ((response.score === "partial" || response.score === "fail") && !String(response.note || "").trim()) {
      throw new Error("Partial and fail scores require a note.");
    }
  }

  const normalizedResponses = Array.from(responseMap.values());
  const outcome = computeBattleTestOutcome(subjectType, phases, normalizedResponses);
  const completedAt = new Date().toISOString();
  const selectedPhaseKeys = phases.map((phase) => phase.key);

  const runInsert = {
    id: uuidv4(),
    pod_id: podId,
    subject_type: subjectType,
    subject_user_id: subjectUserId,
    tutor_assignment_id: tutorAssignmentId || null,
    created_by_user_id: createdByUserId,
    template_key: templateKey,
    selected_phase_keys: selectedPhaseKeys,
    phase_scores: outcome.phaseScores,
    weak_phases: outcome.weakPhases,
    critical_fail_reasons: outcome.criticalFailReasons,
    total_questions: outcome.totalQuestions,
    answered_questions: outcome.answeredQuestions,
    total_points: outcome.totalPoints,
    possible_points: outcome.possiblePoints,
    alignment_percent: outcome.alignmentPercent,
    state: outcome.state,
    has_critical_fail: outcome.hasCriticalFail,
    action_required: outcome.actionRequired,
    completed_at: completedAt,
  };

  const { data: runRow, error: runError } = await supabase.from("battle_test_runs").insert(runInsert).select("*").single();
  if (runError) {
    throw new Error(`Failed to save battle test run: ${runError.message}`);
  }

  try {
    const repLogRows = phases.flatMap((phase) =>
      phase.questions.map((question, index) => {
        const response = responseMap.get(`${phase.key}:${question.key}`);
        if (!response) {
          throw new Error(`Missing battle-testing response: ${phase.key}:${question.key}`);
        }
        return {
          id: uuidv4(),
          run_id: runRow.id,
          phase_key: phase.key,
          question_key: question.key,
          section: question.section,
          question_order: index,
          prompt: question.prompt,
          expected_answer: question.expectedAnswer,
          fail_indicators: question.failIndicators,
          score: response.score,
          points_awarded: BATTLE_TEST_SCORE_POINTS[response.score],
          note: response.note?.trim() || null,
          is_critical_fail:
            !!response.isCriticalFail || (!!question.autoCriticalOnFail && response.score === "fail"),
        };
      })
    );

    const { error: repLogError } = await supabase.from("battle_test_rep_logs").insert(repLogRows);
    if (repLogError) {
      throw new Error(`Failed to save battle test logs: ${repLogError.message}`);
    }
  } catch (repLogFailure) {
    await supabase.from("battle_test_runs").delete().eq("id", runRow.id);
    throw repLogFailure instanceof Error
      ? repLogFailure
      : new Error("Failed to save battle test logs.");
  }

  return {
    runId: String(runRow.id),
    completedAt,
    outcome,
  };
}

export async function buildPodBattleTestingSummary(
  podId: string,
  tutorMeta: TutorBattleTestingMeta[],
  tdMeta?: TdBattleTestingMeta | null,
) {
  const summary = getEmptySummary(podId);
  const { data, error } = await supabase
    .from("battle_test_runs")
    .select("*")
    .eq("pod_id", podId)
    .order("completed_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load battle-testing runs: ${error.message}`);
  }

  const runRows = (data || []).map(mapRunRow);
  const latestTutorRunByAssignment = new Map<string, BattleTestRunRow>();
  const latestTutorPhaseScoresByAssignment = new Map<string, Map<string, BattleTestPhaseScore>>();
  const phaseAggregates = new Map<string, { title: string; total: number; count: number; weakCount: number }>();

  for (const run of runRows) {
    if (run.subject_type !== "tutor") continue;
    const assignmentKey = run.tutor_assignment_id || run.subject_user_id;
    if (!latestTutorRunByAssignment.has(assignmentKey)) {
      latestTutorRunByAssignment.set(assignmentKey, run);
      for (const phase of run.phase_scores) {
        const current = phaseAggregates.get(phase.phaseKey) || {
          title: phase.title,
          total: 0,
          count: 0,
          weakCount: 0,
        };
        current.title = phase.title;
        current.total += phase.percent;
        current.count += 1;
        if (phase.percent < 95) current.weakCount += 1;
        phaseAggregates.set(phase.phaseKey, current);
      }
    }

    if (!latestTutorPhaseScoresByAssignment.has(assignmentKey)) {
      latestTutorPhaseScoresByAssignment.set(assignmentKey, new Map<string, BattleTestPhaseScore>());
    }
    const phaseScoreMap = latestTutorPhaseScoresByAssignment.get(assignmentKey)!;
    for (const phase of run.phase_scores) {
      if (!phaseScoreMap.has(phase.phaseKey)) {
        phaseScoreMap.set(phase.phaseKey, phase);
      }
    }
  }

  summary.tutorSummaries = tutorMeta.map((meta) => {
    const latestRun = latestTutorRunByAssignment.get(meta.assignmentId) || latestTutorRunByAssignment.get(meta.tutorId);
    const latestPhaseScoreMap =
      latestTutorPhaseScoresByAssignment.get(meta.assignmentId) ||
      latestTutorPhaseScoresByAssignment.get(meta.tutorId) ||
      new Map<string, BattleTestPhaseScore>();
    const tutorSummary: BattleTestingTutorSummary = {
      assignmentId: meta.assignmentId,
      tutorId: meta.tutorId,
      tutorName: meta.tutorName,
      tutorEmail: meta.tutorEmail,
      studentCount: meta.studentCount,
      alignmentPercent: latestRun ? roundValue(latestRun.alignment_percent) : null,
      state: latestRun?.state || null,
      hasCriticalFail: latestRun?.has_critical_fail || false,
      actionRequired: latestRun?.action_required || null,
      lastAuditAt: latestRun?.completed_at || null,
      phaseScores: Array.from(latestPhaseScoreMap.values()),
    };
    if (tutorSummary.state === "locked") summary.lockedTutors += 1;
    if (tutorSummary.state === "watchlist") summary.watchlistTutors += 1;
    if (tutorSummary.state === "fail") summary.failTutors += 1;
    return tutorSummary;
  });

  const tutorPercents = summary.tutorSummaries
    .map((entry) => entry.alignmentPercent)
    .filter((value): value is number => typeof value === "number");
  if (tutorPercents.length) {
    summary.weeklyAlignmentPercent = roundValue(
      tutorPercents.reduce((sum, value) => sum + value, 0) / tutorPercents.length
    );
  }

  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  summary.driftIncidents = runRows.filter((run) => {
    const completedAt = new Date(run.completed_at).getTime();
    return (
      run.subject_type === "tutor" &&
      completedAt >= recentCutoff &&
      (run.state !== "locked" || run.has_critical_fail)
    );
  }).length;

  summary.phaseWeaknesses = Array.from(phaseAggregates.entries())
    .map(([phaseKey, aggregate]) => ({
      phaseKey,
      title: aggregate.title,
      averagePercent: aggregate.count ? roundValue(aggregate.total / aggregate.count) : 0,
      affectedTutors: aggregate.weakCount,
    }))
    .filter((phase) => phase.affectedTutors > 0)
    .sort((left, right) => left.averagePercent - right.averagePercent);

  summary.phaseScores = Array.from(phaseAggregates.entries()).map(([phaseKey, aggregate]) => {
    const percent = aggregate.count ? roundValue(aggregate.total / aggregate.count) : 0;
    return {
      phaseKey,
      title: aggregate.title,
      pointsEarned: percent,
      pointsPossible: 100,
      percent,
      state: percent < 90 ? "fail" : percent < 95 ? "watchlist" : "locked",
    };
  });

  if (tdMeta?.tdId) {
    const latestTdRun = runRows.find((run) => run.subject_type === "td" && run.subject_user_id === tdMeta.tdId) || null;
    summary.tdSummary = {
      tdId: tdMeta.tdId,
      tdName: tdMeta.tdName || null,
      alignmentPercent: latestTdRun ? roundValue(latestTdRun.alignment_percent) : null,
      state: latestTdRun?.state || null,
      hasCriticalFail: latestTdRun?.has_critical_fail || false,
      actionRequired: latestTdRun?.action_required || null,
      lastAuditAt: latestTdRun?.completed_at || null,
    } satisfies BattleTestingTdSummary;
  } else if (tdMeta) {
    summary.tdSummary = {
      tdId: null,
      tdName: tdMeta.tdName || null,
      alignmentPercent: null,
      state: null,
      hasCriticalFail: false,
      actionRequired: null,
      lastAuditAt: null,
    };
  }

  return summary;
}

export async function getBattleTestRunHistoryForPod(
  podId: string,
  nameByUserId: Record<string, string>,
) {
  const { data, error } = await supabase
    .from("battle_test_runs")
    .select("*")
    .eq("pod_id", podId)
    .order("completed_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load battle-testing history: ${error.message}`);
  }

  return (data || []).map((rawRow) => {
    const run = mapRunRow(rawRow);
    return {
      runId: run.id,
      podId: run.pod_id,
      subjectType: run.subject_type,
      subjectUserId: run.subject_user_id,
      tutorAssignmentId: run.tutor_assignment_id,
      subjectName:
        nameByUserId[run.subject_user_id] ||
        (run.subject_type === "td" ? "Assigned TD" : "Assigned Tutor"),
      templateKey: run.template_key,
      selectedPhaseKeys: run.selected_phase_keys,
      alignmentPercent: roundValue(run.alignment_percent),
      state: run.state,
      stateLabel: getBattleTestStateLabel(run.state),
      hasCriticalFail: run.has_critical_fail,
      actionRequired: run.action_required,
      completedAt: run.completed_at,
      phaseScores: run.phase_scores,
    } satisfies BattleTestRunHistoryItem;
  });
}

export async function getBattleTestRunDetail(
  runId: string,
  nameByUserId: Record<string, string>,
) {
  const { data: runData, error: runError } = await supabase
    .from("battle_test_runs")
    .select("*")
    .eq("id", runId)
    .single();

  if (runError || !runData) {
    throw new Error(`Failed to load battle-testing run: ${runError?.message || "Run not found"}`);
  }

  const { data: repData, error: repError } = await supabase
    .from("battle_test_rep_logs")
    .select("*")
    .eq("run_id", runId)
    .order("phase_key", { ascending: true })
    .order("question_order", { ascending: true });

  if (repError) {
    throw new Error(`Failed to load battle-testing rep logs: ${repError.message}`);
  }

  const run = mapRunRow(runData);
  const phaseOrder = new Map(run.selected_phase_keys.map((phaseKey, index) => [phaseKey, index] as const));
  const repLogs = (repData || []).map((rawRow) => {
    const rep = mapRepLogRow(rawRow);
    return {
      phaseKey: rep.phase_key,
      questionKey: rep.question_key,
      section: rep.section,
      questionOrder: rep.question_order,
      prompt: rep.prompt,
      expectedAnswer: rep.expected_answer,
      failIndicators: rep.fail_indicators,
      score: rep.score,
      pointsAwarded: rep.points_awarded,
      note: rep.note,
      isCriticalFail: rep.is_critical_fail,
    } satisfies BattleTestRepLogDetail;
  }).sort((left, right) => {
    const leftPhaseIndex = phaseOrder.get(left.phaseKey) ?? Number.MAX_SAFE_INTEGER;
    const rightPhaseIndex = phaseOrder.get(right.phaseKey) ?? Number.MAX_SAFE_INTEGER;
    if (leftPhaseIndex !== rightPhaseIndex) return leftPhaseIndex - rightPhaseIndex;
    return left.questionOrder - right.questionOrder;
  });

  return {
    runId: run.id,
    podId: run.pod_id,
    subjectType: run.subject_type,
    subjectUserId: run.subject_user_id,
    tutorAssignmentId: run.tutor_assignment_id,
    subjectName:
      nameByUserId[run.subject_user_id] ||
      (run.subject_type === "td" ? "Assigned TD" : "Assigned Tutor"),
    templateKey: run.template_key,
    selectedPhaseKeys: run.selected_phase_keys,
    alignmentPercent: roundValue(run.alignment_percent),
    state: run.state,
    stateLabel: getBattleTestStateLabel(run.state),
    hasCriticalFail: run.has_critical_fail,
    actionRequired: run.action_required,
    completedAt: run.completed_at,
    phaseScores: run.phase_scores,
    repLogs,
  } satisfies BattleTestRunDetail;
}

export function buildBattleTestSuccessPayload(runId: string, outcome: BattleTestOutcome) {
  return {
    runId,
    alignmentPercent: outcome.alignmentPercent,
    state: outcome.state,
    stateLabel: getBattleTestStateLabel(outcome.state),
    hasCriticalFail: outcome.hasCriticalFail,
    actionRequired: outcome.actionRequired,
    phaseScores: outcome.phaseScores,
  };
}

export function validateBattleTestResponses(
  subjectType: BattleTestSubjectType,
  phases: BattleTestPhaseDefinition[],
  responses: BattleTestResponseInput[],
) {
  const responseMap = new Map<string, BattleTestResponseInput>();

  // Create a map of all valid question keys from the provided phases
  const validQuestionKeys = new Set<string>();
  for (const phase of phases) {
    for (const question of phase.questions) {
      validQuestionKeys.add(`${phase.key}:${question.key}`);
    }
  }

  for (const response of responses) {
    const responseKey = `${response.phaseKey}:${response.questionKey}`;
    if (!validQuestionKeys.has(responseKey)) {
      throw new Error(`Unknown battle-testing question: ${responseKey}`);
    }

    if (responseMap.has(responseKey)) {
      throw new Error(`Duplicate battle-testing response: ${responseKey}`);
    }
    responseMap.set(responseKey, response);
  }

  if (
    subjectType === "td" &&
    phases.some((phase) => phase.key !== "td_system_integrity")
  ) {
    throw new Error("Invalid TD battle-testing phase.");
  }

  return responseMap;
}
