export type ObservationLevel = "weak" | "partial" | "clear";

const WEAK_KEYWORDS = [
  "freeze",
  "could not",
  "cannot",
  "no idea",
  "avoided",
  "avoid",
  "random",
  "guess",
  "guessed",
  "froze",
  "wrong",
  "fails",
  "cannot finish",
  "collapse",
  "collapses",
  "breaks",
  "lost",
  "panic",
  "abandoned",
  "panic-driven",
  "shutdown",
  "waits",
  "delayed",
  "incorrect",
  "unsure",
  "asks immediately",
  "asks for help",
  "help early",
  "needs help",
  "dependent",
  "frequent",
  "missing",
  "skips",
  "resists",
  "gives up",
  "short attempt",
  "forgets",
  "careless",
  "inconsistent",
  "help immediately",
  "needed tutor to carry",
];

const CLEAR_KEYWORDS = [
  "clear",
  "independent",
  "immediate",
  "correct",
  "engages",
  "starts",
  "present",
  "structured",
  "full",
  "complete",
  "adapts",
  "stable",
  "recovers",
  "composed",
  "no rescue",
  "maintained",
  "controlled",
  "completed with structure",
  "calmly",
  "consisten",
  "without support",
  "did not seek rescue",
];

const CLEAR_PRIORITY_PHRASES = [
  "without collapse",
  "did not seek rescue",
  "no rescue",
];

export function normalizeObservationLevelValue(value: unknown): ObservationLevel {
  const v = String(value || "").toLowerCase().trim();
  if (!v) return "weak";
  if (v === "weak" || v === "partial" || v === "clear") return v;
  if (v === "none") return "weak";

  if (CLEAR_PRIORITY_PHRASES.some((phrase) => v.includes(phrase))) {
    return "clear";
  }

  if (WEAK_KEYWORDS.some((keyword) => v.includes(keyword))) {
    return "weak";
  }

  if (CLEAR_KEYWORDS.some((keyword) => v.includes(keyword))) {
    return "clear";
  }

  return "partial";
}

export function observationLevelFromOptionIndex(index: number, optionCount: number): ObservationLevel {
  if (optionCount <= 1) return "partial";
  if (index <= 0) return "weak";
  if (index >= optionCount - 1) return "clear";
  return "partial";
}
