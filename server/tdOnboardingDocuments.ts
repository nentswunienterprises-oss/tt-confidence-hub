import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { sanitizeLegacyOnboardingDocumentText } from "@shared/onboardingDocumentSanitizer";

export interface TdOnboardingClauseDefinition {
  key: string;
  label: string;
}

export interface TdOnboardingDocumentDefinition {
  step: number;
  code: string;
  title: string;
  fileName?: string;
  version: string;
  requiresAcceptance: boolean;
  requiresUpload: boolean;
  uploadTitle?: string;
  uploadDescription?: string;
  mandatoryClauses: TdOnboardingClauseDefinition[];
}

const DOC_ROOT = resolve(process.cwd(), "TD-Related");

export const TD_ONBOARDING_DOCUMENTS: TdOnboardingDocumentDefinition[] = [
  {
    step: 1,
    code: "Response Integrity-TDA-001",
    title: "Territory Director Contractor Agreement",
    fileName: "TT-TDA-001.txt",
    version: "1",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "independent_contractor",
        label: "I acknowledge that I operate as an independent contractor and not as a Response Integrity employee.",
      },
      {
        key: "performance_based_compensation",
        label: "I accept that TD compensation is performance-linked and tied to active pod assignment.",
      },
    ],
  },
  {
    step: 2,
    code: "Response Integrity-CEA-002",
    title: "Response Integrity-OS Compliance & Enforcement Agreement",
    fileName: "TT-CEA-002.md",
    version: "1",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "fixed_system_adherence",
        label: "I acknowledge that Response Integrity-OS is fixed and that I may not modify, reinterpret, or soften it.",
      },
      {
        key: "system_first_enforcement",
        label: "I accept that enforcing system integrity takes priority over tutor comfort or relationships.",
      },
    ],
  },
  {
    step: 3,
    code: "Response Integrity-AID-003",
    title: "Audit Integrity Declaration",
    fileName: "TT-AID-003.md",
    version: "1",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "truth_reporting",
        label: "I will report audit reality truthfully, regardless of intent, effort, or personal dynamics.",
      },
      {
        key: "zero_omission",
        label: "I understand that omitting known violations is treated as intentional concealment.",
      },
    ],
  },
  {
    step: 4,
    code: "Response Integrity-HTQ-004",
    title: "HTQ Track Addendum",
    fileName: "TT-HTQ-004.md",
    version: "1",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "no_promotion_guarantee",
        label: "I understand that the HTQ track is a selection filter and creates no guarantee of promotion.",
      },
      {
        key: "objective_evaluation",
        label: "I agree to be evaluated objectively against Response Integrity's defined system performance thresholds.",
      },
    ],
  },
  {
    step: 5,
    code: "Response Integrity-PSA-005",
    title: "Performance Scorecard Acknowledgement",
    fileName: "TT-PSA-005.md",
    version: "1",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "measured_outputs",
        label: "I accept that my performance is measured through system outputs, not effort or opinion.",
      },
      {
        key: "data_authority",
        label: "I accept Response Integrity's recorded performance data as authoritative for evaluation purposes.",
      },
    ],
  },
  {
    step: 6,
    code: "Response Integrity-CSP-006",
    title: "Confidentiality & System Protection Agreement",
    fileName: "TT-CSP-006.md",
    version: "1",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "protect_tt_systems",
        label: "I will protect company systems, methods, data, and operational frameworks as confidential property.",
      },
      {
        key: "no_replication_or_circumvention",
        label: "I may not reproduce proprietary methodologies, bypass approved systems, or divert platform tutors or students.",
      },
    ],
  },
  {
    step: 7,
    code: "Response Integrity-TDI-007",
    title: "Certified Identification",
    version: "1",
    requiresAcceptance: false,
    requiresUpload: true,
    uploadTitle: "Certified Identification Copy",
    uploadDescription: "Upload a certified copy of your South African ID or passport so Response Integrity can verify your TD identity record.",
    mandatoryClauses: [],
  },
];

const DOC_MAP = new Map(TD_ONBOARDING_DOCUMENTS.map((doc) => [doc.step, doc]));

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[â€œâ€]/g, '"')
    .replace(/[â€˜']/g, "'")
    .replace(/[â€“-]/g, "-")
    .replace(/\uFFFD/g, "")
    .trim();
}

export function getTdOnboardingDocumentDefinition(step: number): TdOnboardingDocumentDefinition {
  const doc = DOC_MAP.get(step);
  if (!doc) {
    throw new Error(`Invalid TD onboarding document step: ${step}`);
  }

  return doc;
}

export interface LoadedTdOnboardingDocument extends TdOnboardingDocumentDefinition {
  content: string;
  contentHash: string;
}

export async function loadTdOnboardingDocument(step: number): Promise<LoadedTdOnboardingDocument> {
  const doc = getTdOnboardingDocumentDefinition(step);
  const content = doc.fileName ? sanitizeLegacyOnboardingDocumentText(await readFile(resolve(DOC_ROOT, doc.fileName), "utf8")) : "";
  const contentHash = createHash("sha256").update(content, "utf8").digest("hex");

  return {
    ...doc,
    content,
    contentHash,
  };
}
