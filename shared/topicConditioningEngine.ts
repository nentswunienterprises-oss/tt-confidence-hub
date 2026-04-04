export const PHASES = [
  "Clarity",
  "Structured Execution",
  "Controlled Discomfort",
  "Time Pressure Stability",
] as const;

export type TopicPhase = (typeof PHASES)[number];
export type TopicStability = "Low" | "Medium" | "High" | "High Maintenance";

export type NextActionData = {
  primaryAction: string;
  rules: string[];
  nextActions?: string[];
  advanceTo?: TopicPhase;
};

export const STABILITY_THRESHOLDS = {
  low: { remainMax: 49, mediumMax: 79, highMin: 80 },
  medium: { regressMax: 44, remainMax: 79, highMin: 80 },
  high: { regressMax: 49, remainMax: 84, highMaintenanceMin: 85 },
  highMaintenance: { regressMax: 59, remainMax: 84, phaseProgressMin: 85 },
} as const;

export const NEXT_ACTION_ENGINE: Record<TopicPhase, Record<TopicStability, NextActionData>> = {
  Clarity: {
    Low: {
      primaryAction: "Run Clarity drill",
      rules: ["No Boss Battles", "No time pressure", "No skipping layers"],
      nextActions: [
        "Reinforce Vocabulary, Method & Reason (3 Layer Lens)",
        "Reinforce Method (step sequence)",
        "Reinforce Reason (why it works)",
        "Re-model same concept",
        "Immediate Apply after each model",
      ],
    },
    Medium: {
      primaryAction: "Run Clarity drill",
      rules: ["No Boss Battles as primary", "No time pressure", "Reduce explanation, increase execution"],
      nextActions: [
        "Continue 3-Layer Lens",
        "Run Clarity drill",
        "Start light execution checks (can they repeat without help?)",
      ],
    },
    High: {
      primaryAction: "Run Clarity High Maintenance drill",
      rules: ["Do NOT phase advance yet", "Prove repeatable stability first"],
      nextActions: [
        "Run High Maintenance check in Clarity",
        "Reduce modeling",
        "Increase independent attempts",
        "Validate consistency across full set volume",
      ],
    },
    "High Maintenance": {
      primaryAction: "Run Structured Execution drill",
      rules: ["Do NOT stay in teaching mode", "Move forward"],
      nextActions: [
        "Transition to Structured Execution",
        "Reduce modeling",
        "Increase independent attempts",
      ],
      advanceTo: "Structured Execution",
    },
  },
  "Structured Execution": {
    Low: {
      primaryAction: "Run Structured Execution drill",
      rules: ["No time pressure", "Boss Battles only if student can start", "No over-explaining"],
      nextActions: [
        "Run strict Model -> Apply -> Guide loops",
        "Enforce step-by-step execution",
        "Correct every skipped step",
        "Force student to start every problem",
      ],
    },
    Medium: {
      primaryAction: "Run Structured Execution drill",
      rules: ["Do not rush to time pressure", "Still reinforce structure every time"],
      nextActions: [
        "Run Structured Execution drill",
        "Reduce modeling",
        "Strengthen consistency across multiple problems",
        "Introduce light Boss Battles",
      ],
    },
    High: {
      primaryAction: "Run Structured Execution High Maintenance drill",
      rules: ["Do NOT phase advance yet", "Prove repeatable stability first"],
      nextActions: [
        "Run High Maintenance check in Structured Execution",
        "Run Structured Execution drill",
        "Confirm repeatable execution stability",
      ],
    },
    "High Maintenance": {
      primaryAction: "Run Controlled Discomfort drill",
      rules: ["Do NOT keep repeating basic problems", "Move forward"],
      nextActions: [
        "Transition to Controlled Discomfort",
        "Introduce Boss Battles consistently",
        "Focus on response under uncertainty",
      ],
      advanceTo: "Controlled Discomfort",
    },
  },
  "Controlled Discomfort": {
    Low: {
      primaryAction: "Run Controlled Discomfort drill",
      rules: ["No rescuing", "No full explanations mid-struggle", "No time pressure yet"],
      nextActions: [
        "Introduce Boss Battles carefully",
        "Enforce 10-15 second pause",
        "Guide only to first step",
        "Reinforce start despite uncertainty",
      ],
    },
    Medium: {
      primaryAction: "Run Controlled Discomfort drill",
      rules: ["Do not remove difficulty", "Do not over-guide"],
      nextActions: [
        "Run Controlled Discomfort drill",
        "Reduce hesitation time",
        "Push independent starts",
        "Reinforce calm execution",
      ],
    },
    High: {
      primaryAction: "Run Controlled Discomfort High Maintenance drill",
      rules: ["Do NOT phase advance yet", "Prove repeatable stability first"],
      nextActions: [
        "Run High Maintenance check in Controlled Discomfort",
        "Increase difficulty consistency",
        "Confirm composed starts under uncertainty",
      ],
    },
    "High Maintenance": {
      primaryAction: "Run Time Pressure Stability drill",
      rules: ["Do NOT stay in comfort zone", "Move forward"],
      nextActions: [
        "Transition to Time Pressure Stability",
        "Introduce timed Boss Battles",
        "Maintain structure under constraint",
      ],
      advanceTo: "Time Pressure Stability",
    },
  },
  "Time Pressure Stability": {
    Low: {
      primaryAction: "Run Time Pressure Stability drill",
      rules: ["Do not push speed", "Do not increase time pressure aggressively"],
      nextActions: [
        "Run Time Pressure Stability drill",
        "Reinforce process over speed",
        "Debrief after every attempt",
        "Re-anchor structure",
      ],
    },
    Medium: {
      primaryAction: "Run Time Pressure Stability drill",
      rules: ["Do not sacrifice structure for speed", "Maintain method discipline"],
      nextActions: [
        "Run Time Pressure Stability drill",
        "Reduce breakdown frequency",
        "Strengthen full execution within time",
      ],
    },
    High: {
      primaryAction: "Run Time Pressure Stability High Maintenance drill",
      rules: ["Do NOT declare transfer yet", "Confirm sustained stability first"],
      nextActions: [
        "Run High Maintenance check under time pressure",
        "Confirm structure under timed variation",
        "Sustain consistency across multiple sets",
      ],
    },
    "High Maintenance": {
      primaryAction: "Run Time Pressure Stability maintenance drill",
      rules: ["Do not over-train same pattern", "Begin cross-topic conditioning"],
      nextActions: [
        "Run Time Pressure Stability maintenance drill",
        "Introduce new variations of topic",
        "Prepare for transfer to new topics",
      ],
    },
  },
};

export const normalizePhase = (value: unknown): TopicPhase => {
  const v = String(value || "").toLowerCase();
  if (v.includes("clarity")) return "Clarity";
  if (v.includes("structured")) return "Structured Execution";
  if (v.includes("discomfort")) return "Controlled Discomfort";
  if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
  return "Structured Execution";
};

export const normalizeStability = (value: unknown): TopicStability => {
  const v = String(value || "").toLowerCase();
  if (v.includes("high maintenance")) return "High Maintenance";
  if (v.includes("high")) return "High";
  if (v.includes("medium")) return "Medium";
  return "Low";
};

export const stabilityToScore = (stability: TopicStability) =>
  stability === "Low" ? 1 : stability === "Medium" ? 2 : stability === "High" ? 3 : 4;