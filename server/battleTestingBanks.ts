import { readFileSync } from "fs";
import { resolve } from "path";
import type { BattleTestPhaseDefinition, BattleTestQuestionDefinition } from "@shared/battleTesting";

type ParsedQuestion = BattleTestQuestionDefinition & { sourceLabel: string };

const ROOT = resolve(process.cwd(), "Battle-Testing Infrastructure");

const TUTOR_SOURCE_FILES = [
  {
    key: "clarity",
    title: "Clarity",
    description: "TT-OS BATTLE TEST: CLARITY (SCORING VERSION)",
    path: resolve(ROOT, "Tutor Battle-Testing", "TT-OS Trasnformation Phases Battle-Testing = Clarity.md"),
  },
  {
    key: "structured_execution",
    title: "Structured Execution",
    description: "TT-OS BATTLE TEST: STRUCTURED EXECUTION (SCORING VERSION)",
    path: resolve(ROOT, "Tutor Battle-Testing", "TT-OS Trasnformation Phases Battle-Testing = Structured Execution.md"),
  },
  {
    key: "controlled_discomfort",
    title: "Controlled Discomfort",
    description: "TT-OS BATTLE TEST: CONTROLLED DISCOMFORT (SCORING VERSION)",
    path: resolve(ROOT, "Tutor Battle-Testing", "TT-OS Trasnformation Phases Battle-Testing = Controlled Discomfort.md"),
  },
  {
    key: "time_pressure_stability",
    title: "Time Pressure Stability",
    description: "TT-OS BATTLE TEST: TIME PRESSURE STABILITY (SCORING VERSION)",
    path: resolve(ROOT, "Tutor Battle-Testing", "TT-OS Trasnformation Phases Battle-Testing = Time Pressure Stability.md"),
  },
  {
    key: "topic_conditioning",
    title: "Topic Conditioning",
    description: "TT-OS BATTLE TEST: TOPIC CONDITIONING (SCORING VERSION)",
    path: resolve(ROOT, "Tutor Battle-Testing", "TT-OS Trasnformation Phases Battle-Testing = Topic Conditioning.md"),
  },
] as const;

const TD_SOURCE_FILE = {
  key: "td_system_integrity",
  title: "TD System Integrity",
  description: "TD BATTLE TEST SYSTEM (STRUCTURE)",
  path: resolve(ROOT, "TD Battle-Testing", "TD System Integrity Drilling.txt"),
} as const;

const AUTO_CRITICAL_BY_PHASE: Record<string, Set<string>> = {
  clarity: new Set(["Q7", "Scenario 2", "Scenario 3", "FINAL QUESTION"]),
  structured_execution: new Set(["Q7", "Q8", "Scenario 1", "Scenario 2", "Scenario 3", "Scenario 4", "FINAL QUESTION"]),
  controlled_discomfort: new Set(["Q2", "Q4", "Q7", "Q8", "Scenario 1", "Scenario 2", "Scenario 3", "FINAL QUESTION"]),
  time_pressure_stability: new Set(["Q7", "Scenario 1", "Scenario 2", "Scenario 3", "FINAL QUESTION"]),
  topic_conditioning: new Set(["Scenario 1", "Scenario 3", "Scenario 4", "FINAL QUESTION"]),
  td_system_integrity: new Set([
    "Q4",
    "Q5",
    "Q6",
    "Q8",
    "Q9",
    "Q11",
    "Q12",
    "Scenario 1",
    "Scenario 2",
    "Scenario 3",
    "FINAL QUESTION",
  ]),
};

function normalizeLines(raw: string) {
  return normalizeBattleTestCopy(raw)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .split("\n");
}

function normalizeBattleTestCopy(raw: string) {
  return raw
    .replace(/â€œ|â€/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€“|â€”/g, "-")
    .replace(/â†’/g, "->")
    .replace(/ðŸ‘‰\s*/g, "")
    .replace(/ðŸ”¹\s*/g, "")
    .replace(/âŒ\s*/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+$/gm, "");
}

function isQuestionStart(line: string) {
  return /^Q\d+\s*$/.test(line) || /^Scenario\s+\d+\s*$/.test(line) || /^FINAL QUESTION\s*$/.test(line);
}

function isSectionHeader(line: string) {
  return line.includes("SECTION ") || /^FINAL TEST\s*$/.test(line);
}

function isPostQuestionMeta(line: string) {
  return /WHAT THIS /i.test(line) || /FINAL TRUTH/i.test(line) || /AUTO-FAIL SIGNALS:/i.test(line) || /^TRUTH$/i.test(line);
}

function extractSectionLabel(line: string) {
  if (/^FINAL TEST\s*$/.test(line.trim())) return "FINAL TEST";
  const sectionIndex = line.indexOf("SECTION ");
  if (sectionIndex === -1) return line.trim();
  return line.slice(sectionIndex).trim();
}

function toQuestionKey(sourceLabel: string) {
  return sourceLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseBattleTestDocument(phaseKey: string, title: string, description: string, raw: string): BattleTestPhaseDefinition {
  const lines = normalizeLines(raw);
  const questions: ParsedQuestion[] = [];

  let i = 0;
  let currentSection = description;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) {
      i += 1;
      continue;
    }

    if (i === 0) {
      i += 1;
      continue;
    }

    if (isSectionHeader(line)) {
      currentSection = extractSectionLabel(line);
      i += 1;
      continue;
    }

    if (!isQuestionStart(line)) {
      i += 1;
      continue;
    }

    const sourceLabel = line;
    i += 1;

    while (i < lines.length && !lines[i].trim()) i += 1;

    const promptLines: string[] = [];
    while (i < lines.length) {
      const next = lines[i].trim();
      if (/^Expected Answer/.test(next)) break;
      promptLines.push(lines[i]);
      i += 1;
    }

    if (i >= lines.length) break;
    i += 1;

    const expectedAnswerLines: string[] = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        if (/^Fail Answer/.test(next)) break;
        if (isQuestionStart(next) || isSectionHeader(next) || isPostQuestionMeta(next)) break;
        expectedAnswerLines.push(lines[i]);
        i += 1;
      }

    const failIndicators: string[] = [];
    if (i < lines.length && /^Fail Answer/.test(lines[i].trim())) {
      i += 1;
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) {
          i += 1;
          continue;
        }
        if (isQuestionStart(next) || isSectionHeader(next) || isPostQuestionMeta(next)) {
          break;
        }
        failIndicators.push(lines[i]);
        i += 1;
      }
    }

    const questionKey =
      phaseKey === "td_system_integrity"
        ? (() => {
            if (/^final question$/i.test(sourceLabel.trim())) return "td_final";
            if (/^scenario\s+1$/i.test(sourceLabel.trim())) return "td_q13";
            if (/^scenario\s+2$/i.test(sourceLabel.trim())) return "td_q14";
            if (/^scenario\s+3$/i.test(sourceLabel.trim())) return "td_q15";
            if (/^scenario\s+4$/i.test(sourceLabel.trim())) return "td_q16";
            return `td_${toQuestionKey(sourceLabel)}`;
          })()
        : (() => {
            if (/^final question$/i.test(sourceLabel.trim())) return `${phaseKey}_final`;
            if (phaseKey === "clarity") {
              if (/^scenario\s+2$/i.test(sourceLabel.trim())) return "clarity_q15";
              if (/^scenario\s+3$/i.test(sourceLabel.trim())) return "clarity_q16";
            } else if (phaseKey === "structured_execution") {
              if (/^scenario\s+1$/i.test(sourceLabel.trim())) return "structured_execution_q15";
              if (/^scenario\s+2$/i.test(sourceLabel.trim())) return "structured_execution_q16";
              if (/^scenario\s+3$/i.test(sourceLabel.trim())) return "structured_execution_q17";
              if (/^scenario\s+4$/i.test(sourceLabel.trim())) return "structured_execution_q18";
            } else if (phaseKey === "controlled_discomfort") {
              if (/^scenario\s+1$/i.test(sourceLabel.trim())) return "controlled_discomfort_q15";
              if (/^scenario\s+2$/i.test(sourceLabel.trim())) return "controlled_discomfort_q16";
              if (/^scenario\s+3$/i.test(sourceLabel.trim())) return "controlled_discomfort_q17";
            } else if (phaseKey === "time_pressure_stability") {
              if (/^scenario\s+1$/i.test(sourceLabel.trim())) return "time_pressure_stability_q15";
              if (/^scenario\s+2$/i.test(sourceLabel.trim())) return "time_pressure_stability_q16";
              if (/^scenario\s+3$/i.test(sourceLabel.trim())) return "time_pressure_stability_q17";
            } else if (phaseKey === "topic_conditioning") {
              if (/^scenario\s+1$/i.test(sourceLabel.trim())) return "topic_conditioning_q15";
              if (/^scenario\s+3$/i.test(sourceLabel.trim())) return "topic_conditioning_q16";
              if (/^scenario\s+4$/i.test(sourceLabel.trim())) return "topic_conditioning_q17";
            }
            return `${phaseKey}_${toQuestionKey(sourceLabel)}`;
          })();

    questions.push({
      key: questionKey,
      sourceLabel,
      section: currentSection,
      prompt: promptLines.join("\n").trim(),
      expectedAnswer: expectedAnswerLines.join("\n").trim(),
      failIndicators: failIndicators.map((entry) => entry.trim()).filter(Boolean),
      autoCriticalOnFail: AUTO_CRITICAL_BY_PHASE[phaseKey]?.has(sourceLabel) || false,
    });
  }

  return {
    key: phaseKey,
    title,
    description,
    questions,
  };
}

export const TUTOR_BATTLE_TEST_PHASES_EXACT: BattleTestPhaseDefinition[] = TUTOR_SOURCE_FILES.map((file) =>
  parseBattleTestDocument(file.key, file.title, file.description, readFileSync(file.path, "utf8"))
);

export const TD_BATTLE_TEST_PHASE_EXACT: BattleTestPhaseDefinition = parseBattleTestDocument(
  TD_SOURCE_FILE.key,
  TD_SOURCE_FILE.title,
  TD_SOURCE_FILE.description,
  readFileSync(TD_SOURCE_FILE.path, "utf8")
);

export function getTutorBattleTestPhaseDefinitionsExact(phaseKeys: string[]) {
  return phaseKeys
    .map((phaseKey) => TUTOR_BATTLE_TEST_PHASES_EXACT.find((phase) => phase.key === phaseKey) || null)
    .filter((phase): phase is BattleTestPhaseDefinition => Boolean(phase));
}
