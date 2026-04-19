import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { resolve } from "path";

export interface TutorOnboardingClauseDefinition {
  key: string;
  label: string;
}

export interface TutorOnboardingDocumentDefinition {
  step: number;
  code: string;
  title: string;
  fileName: string;
  version: string;
  effectiveDate?: string;
  lastUpdatedAt?: string;
  requiresAcceptance: boolean;
  requiresUpload: boolean;
  uploadTitle?: string;
  uploadDescription?: string;
  mandatoryClauses: TutorOnboardingClauseDefinition[];
}

const DOC_ROOT = resolve(process.cwd(), "onboarding");

export const TUTOR_ONBOARDING_DOCUMENTS: TutorOnboardingDocumentDefinition[] = [
  {
    step: 1,
    code: "TT-TCF-001",
    title: "Tutor Consent Form",
    fileName: "TT-TCF-001.txt",
    version: "TT-TCF-001",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "platform_rules",
        label: "I acknowledge that I must operate inside TT's platform rules and system requirements.",
      },
    ],
  },
  {
    step: 2,
    code: "TT-EQV-002",
    title: "Entry Qualification Verification",
    fileName: "TT-EQV-002.md",
    version: "TT-EQV-002",
    requiresAcceptance: true,
    requiresUpload: true,
    uploadTitle: "Certified Matric Certificate",
    uploadDescription:
      "After accepting the verification terms, upload a certified copy of your official National Senior Certificate for COO review.",
    mandatoryClauses: [
      {
        key: "qualification_truthfulness",
        label: "I confirm that the qualification information and supporting claims I provide to TT must be truthful.",
      },
      {
        key: "matric_certificate_submission",
        label: "I confirm that I am submitting a certified copy of my official Matric certificate for TT verification.",
      },
    ],
  },
  {
    step: 3,
    code: "TT-ICA-003",
    title: "Independent Contractor Agreement",
    fileName: "TT-ICA-003.md",
    version: "TT-ICA-003",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "independent_contractor_status",
        label: "I acknowledge that I am engaged as an independent contractor, not an employee of TT.",
      },
      {
        key: "tt_platform_control",
        label: "I agree that TT controls the platform environment, session structure, and assignment flow.",
      },
      {
        key: "no_circumvention",
        label: "I may not take TT learners or parents off-platform or use TT relationships outside TT.",
      },
    ],
  },
  {
    step: 4,
    code: "TT-SCP-004",
    title: "Safeguarding and Conduct Policy",
    fileName: "TT-SCP-004.md",
    version: "TT-SCP-004",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "platform_only_contact",
        label: "I will keep all learner and parent communication inside TT-approved channels only.",
      },
      {
        key: "zero_tolerance",
        label: "I understand that safeguarding breaches and inappropriate contact can result in immediate suspension or termination.",
      },
    ],
  },
  {
    step: 5,
    code: "TT-DPC-005",
    title: "Data Protection / POPIA Consent",
    fileName: "TT-DPC-005.md",
    version: "TT-DPC-005",
    requiresAcceptance: true,
    requiresUpload: false,
    mandatoryClauses: [
      {
        key: "data_handling",
        label: "I acknowledge that learner data, recordings, and operational data must be handled only for TT's lawful purposes.",
      },
      {
        key: "no_external_storage",
        label: "I may not store, share, or process TT learner data outside TT-approved systems.",
      },
    ],
  },
  {
    step: 6,
    code: "TT-CID-006",
    title: "Certified ID Copy",
    fileName: "",
    version: "TT-CID-006",
    requiresAcceptance: false,
    requiresUpload: true,
    uploadTitle: "Certified ID Copy",
    uploadDescription: "Upload a certified copy of your ID document. This is the only remaining file upload step.",
    mandatoryClauses: [],
  },
];

const DOC_MAP = new Map(TUTOR_ONBOARDING_DOCUMENTS.map((doc) => [doc.step, doc]));

export function getTutorOnboardingDocumentDefinition(step: number): TutorOnboardingDocumentDefinition {
  const doc = DOC_MAP.get(step);
  if (!doc) {
    throw new Error(`Invalid onboarding document step: ${step}`);
  }

  return doc;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\uFFFD/g, "")
    .trim();
}

export interface LoadedTutorOnboardingDocument extends TutorOnboardingDocumentDefinition {
  content: string;
  contentHash: string;
}

export async function loadTutorOnboardingDocument(step: number): Promise<LoadedTutorOnboardingDocument> {
  const doc = getTutorOnboardingDocumentDefinition(step);
  if (!doc.requiresAcceptance) {
    return {
      ...doc,
      content: "",
      contentHash: "",
    };
  }

  const fullPath = resolve(DOC_ROOT, doc.fileName);
  const raw = await readFile(fullPath, "utf8");
  const content = normalizeText(raw);
  const contentHash = createHash("sha256").update(content, "utf8").digest("hex");

  return {
    ...doc,
    content,
    contentHash,
  };
}
