import { PHASES, type TopicPhase } from "./topicConditioningEngine";

export type ResponseSymptomOption = {
  id: string;
  label: string;
  description: string;
  weights: Partial<Record<TopicPhase, number>>;
};

export type ResponseSymptomGroup = {
  id: string;
  title: string;
  prompt: string;
  options: ResponseSymptomOption[];
};

const FALLBACK_RESPONSE_OPTIONS = (groupId: string): ResponseSymptomOption[] => [
  {
    id: `${groupId}_none_of_above`,
    label: "None of the above",
    description: "None of these patterns fits what you usually see.",
    weights: {},
  },
  {
    id: `${groupId}_not_sure`,
    label: "I don't know / Not sure",
    description: "You are not confident enough to choose a symptom here.",
    weights: {},
  },
];

const BASE_RESPONSE_SYMPTOM_GROUPS: ResponseSymptomGroup[] = [
  {
    id: "understanding",
    title: "Understanding The Work",
    prompt: "What tends to happen before your child even begins solving?",
    options: [
      {
        id: "question_confusion",
        label: "My child often does not understand what the question is asking",
        description: "They seem lost before they even start.",
        weights: { Clarity: 3 },
      },
      {
        id: "method_confusion",
        label: "My child struggles to identify which method to use",
        description: "They do not know how to approach the problem.",
        weights: { Clarity: 3, "Structured Execution": 1 },
      },
      {
        id: "term_formula_forgetting",
        label: "My child forgets key terms, rules, or formulas",
        description: "Important language or rules do not stay stable.",
        weights: { Clarity: 3 },
      },
      {
        id: "cannot_explain_reason",
        label: "My child can copy steps but cannot explain why they are doing them",
        description: "The method may be repeated without real understanding.",
        weights: { Clarity: 2, "Structured Execution": 1 },
      },
      {
        id: "confused_before_start",
        label: "My child gets confused even before they begin solving",
        description: "They stall before the first real step.",
        weights: { Clarity: 3 },
      },
    ],
  },
  {
    id: "independent_work",
    title: "Working Independently",
    prompt: "What usually happens when your child has to work alone?",
    options: [
      {
        id: "guided_but_not_alone",
        label: "My child understands when someone explains, but struggles alone",
        description: "The understanding does not hold independently.",
        weights: { "Structured Execution": 3, Clarity: 1 },
      },
      {
        id: "skips_steps",
        label: "My child skips steps or works in an unstructured way",
        description: "The process becomes messy or incomplete.",
        weights: { "Structured Execution": 3 },
      },
      {
        id: "starts_wrong_after_examples",
        label: "My child starts incorrectly even after seeing examples",
        description: "They still cannot launch the method correctly.",
        weights: { "Structured Execution": 3, Clarity: 1 },
      },
      {
        id: "guesses_without_method",
        label: "My child guesses instead of following a method",
        description: "They reach for answers before structure.",
        weights: { "Structured Execution": 3, "Controlled Discomfort": 1 },
      },
      {
        id: "needs_prompting",
        label: "My child needs frequent prompting to continue",
        description: "They depend on outside pushes to keep moving.",
        weights: { "Structured Execution": 2, "Controlled Discomfort": 1 },
      },
    ],
  },
  {
    id: "difficulty_response",
    title: "Handling Difficulty",
    prompt: "What tends to happen when the work becomes unfamiliar or difficult?",
    options: [
      {
        id: "freezes_unfamiliar",
        label: "My child freezes when a question looks unfamiliar",
        description: "The response collapses when certainty disappears.",
        weights: { "Controlled Discomfort": 3, "Structured Execution": 1 },
      },
      {
        id: "gives_up_quickly",
        label: "My child gives up quickly when work becomes difficult",
        description: "They disengage instead of staying with the problem.",
        weights: { "Controlled Discomfort": 3 },
      },
      {
        id: "overwhelmed_by_uncertainty",
        label: "My child gets overwhelmed when they are not immediately sure what to do",
        description: "Uncertainty triggers an emotional drop.",
        weights: { "Controlled Discomfort": 3 },
      },
      {
        id: "asks_help_immediately",
        label: "My child asks for help almost immediately when stuck",
        description: "They struggle to hold the pressure long enough to respond.",
        weights: { "Controlled Discomfort": 3, "Structured Execution": 1 },
      },
      {
        id: "avoids_challenge",
        label: "My child avoids challenging questions",
        description: "They steer away from discomfort instead of entering it.",
        weights: { "Controlled Discomfort": 3 },
      },
    ],
  },
  {
    id: "time_pressure",
    title: "Handling Time And Pressure",
    prompt: "What changes when speed, tests, or the clock are involved?",
    options: [
      {
        id: "rushes_under_time",
        label: "My child rushes and makes mistakes under time pressure",
        description: "Speed starts to replace structure.",
        weights: { "Time Pressure Stability": 3 },
      },
      {
        id: "panics_in_tests",
        label: "My child panics in tests or timed tasks",
        description: "Pressure changes the response pattern.",
        weights: { "Time Pressure Stability": 3, "Controlled Discomfort": 1 },
      },
      {
        id: "loses_structure_when_fast",
        label: "My child loses structure when trying to work quickly",
        description: "The method falls apart once pace rises.",
        weights: { "Time Pressure Stability": 3, "Structured Execution": 1 },
      },
      {
        id: "untimed_ok_timed_breaks",
        label: "My child knows the work untimed, but falls apart in exams",
        description: "The difficulty appears when performance must hold under pressure.",
        weights: { "Time Pressure Stability": 3 },
      },
      {
        id: "careless_when_clock_involved",
        label: "My child becomes careless when the clock is involved",
        description: "Accuracy drops once timing enters the picture.",
        weights: { "Time Pressure Stability": 2 },
      },
    ],
  },
];

export const RESPONSE_SYMPTOM_GROUPS: ResponseSymptomGroup[] = BASE_RESPONSE_SYMPTOM_GROUPS.map((group) => ({
  ...group,
  options: [...group.options, ...FALLBACK_RESPONSE_OPTIONS(group.id)],
}));

const OPTION_LOOKUP = new Map(
  RESPONSE_SYMPTOM_GROUPS.flatMap((group) => group.options.map((option) => [option.id, option] as const))
);

export function normalizeResponseSymptoms(raw: unknown): string[] {
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,\n;|]+/)
      : [];

  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter((value) => OPTION_LOOKUP.has(value))
    )
  );
}

export function deriveResponseSignalScores(symptomIds: string[]): Record<TopicPhase, number> {
  const scores = Object.fromEntries(PHASES.map((phase) => [phase, 0])) as Record<TopicPhase, number>;

  normalizeResponseSymptoms(symptomIds).forEach((symptomId) => {
    const option = OPTION_LOOKUP.get(symptomId);
    if (!option) return;
    PHASES.forEach((phase) => {
      scores[phase] += Number(option.weights?.[phase] || 0);
    });
  });

  return scores;
}

export function recommendStartingPhaseFromSymptoms(symptomIds: string[]) {
  const normalizedSymptomIds = normalizeResponseSymptoms(symptomIds);
  const scores = deriveResponseSignalScores(normalizedSymptomIds);

  const ranked = [...PHASES]
    .map((phase) => ({ phase, score: scores[phase] }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase);
    });

  const top = ranked[0];
  const phase = top?.score > 0 ? top.phase : "Clarity";
  const supportingSymptoms = normalizedSymptomIds
    .map((id) => OPTION_LOOKUP.get(id))
    .filter((option): option is ResponseSymptomOption => !!option)
    .filter((option) => Number(option.weights?.[phase] || 0) > 0)
    .sort((a, b) => Number(b.weights?.[phase] || 0) - Number(a.weights?.[phase] || 0))
    .slice(0, 2)
    .map((option) => option.label);

  return {
    phase,
    scores,
    supportingSymptoms,
  };
}

export function buildStartingPhaseRationale(phase: TopicPhase, supportingSymptoms: string[]) {
  const symptomText =
    supportingSymptoms.length > 0
      ? supportingSymptoms.join("; ")
      : "Current parent signals point here most strongly.";

  switch (phase) {
    case "Clarity":
      return `Signals suggest the struggle starts before stable recognition and understanding. Most relevant signals: ${symptomText}`;
    case "Structured Execution":
      return `Signals suggest baseline understanding may be present, but independent execution is unstable. Most relevant signals: ${symptomText}`;
    case "Controlled Discomfort":
      return `Signals suggest the student destabilizes when certainty drops or difficulty rises. Most relevant signals: ${symptomText}`;
    case "Time Pressure Stability":
      return `Signals suggest the student loses structure when speed, tests, or the clock are involved. Most relevant signals: ${symptomText}`;
    default:
      return symptomText;
  }
}

export function getResponseSymptomLabels(symptomIds: string[]) {
  return normalizeResponseSymptoms(symptomIds)
    .map((id) => OPTION_LOOKUP.get(id)?.label || null)
    .filter((value): value is string => !!value);
}
