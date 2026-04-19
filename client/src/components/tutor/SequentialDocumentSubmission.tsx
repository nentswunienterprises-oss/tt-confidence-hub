import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/config";
import { CheckCircle2, Download, Expand, FileCheck, FileText, Loader2, Upload } from "lucide-react";

type DocumentStatus = "not_started" | "pending_upload" | "pending_review" | "approved" | "rejected";

interface ClauseDefinition {
  key: string;
  label: string;
}

interface OnboardingDocumentDefinition {
  step: number;
  code: string;
  title: string;
  version: string;
  requiresAcceptance: boolean;
  requiresUpload: boolean;
  uploadTitle?: string;
  uploadDescription?: string;
  mandatoryClauses: ClauseDefinition[];
  content?: string;
  contentHash?: string;
}

interface SequentialDocumentSubmissionProps {
  applicationId: string;
  applicationStatus: any;
}

interface FieldDefinition {
  key: string;
  label: string;
  placeholder: string;
  readOnly?: boolean;
}

interface DocumentRenderRules {
  nonListColonLines?: RegExp[];
  numberedListIntroLines?: RegExp[];
  plainListIntroLines?: RegExp[];
  listItemLines?: RegExp[];
}

const DOCUMENT_RENDER_RULES: Record<string, DocumentRenderRules> = {
  "TT-TCF-001": {
    nonListColonLines: [/^Document Reference:/i],
    numberedListIntroLines: [],
    plainListIntroLines: [/^[A-Z][A-Za-z0-9'().,\s/-]+:$/],
    listItemLines: [/^[A-Za-z0-9][A-Za-z0-9'()\-/,.\s]+$/],
  },
  "TT-EQV-002": {
    nonListColonLines: [/^Document Reference:/i],
    numberedListIntroLines: [],
    plainListIntroLines: [
      /^Once verified and accepted, the Contractor's continued participation is governed by:$/i,
      /^The following are not accepted:$/i,
      /^By accepting this form, the Contractor confirms all of the following:$/i,
      /^I understand that once my entry qualification is verified and accepted, my continued participation in the TT Leadership Programme is governed by:$/i,
      /^By accepting this form in the TT platform, the Contractor confirms:$/i,
    ],
    listItemLines: [/^[A-Za-z0-9][A-Za-z0-9'()\-/,.\s]+$/],
  },
  "TT-ICA-003": {
    nonListColonLines: [/^This Agreement is entered into between:$/i, /^Document Reference:/i],
    numberedListIntroLines: [/^\d+\.\d+\s+.+:$/],
    plainListIntroLines: [/^By accepting this Agreement in the TT platform, the Contractor confirms:$/i],
    listItemLines: [/^[A-Za-z0-9][A-Za-z0-9'()\-/,.\s]+$/],
  },
  "TT-SCP-004": {
    nonListColonLines: [/^Document Reference:/i],
    numberedListIntroLines: [/^\d+\.\d+\s+.+:$/],
    plainListIntroLines: [
      /^All conduct must prioritize:$/i,
      /^All tutor conduct must remain:$/i,
      /^Tutors are not:$/i,
      /^The following are strictly prohibited:$/i,
      /^This includes:$/i,
      /^The following are prohibited during sessions:$/i,
      /^Tutors must:$/i,
      /^Tutors may not:$/i,
      /^The following result in immediate suspension or termination:$/i,
      /^By accepting this policy in the TT platform, the Contractor confirms:$/i,
    ],
    listItemLines: [/^[A-Za-z0-9][A-Za-z0-9'()\-/,.\s]+$/],
  },
  "TT-DPC-005": {
    nonListColonLines: [/^Document Reference:/i],
    numberedListIntroLines: [
      /^\d+\.\d+\s+(Personal Information|Learner Data|Session Data|Technical Data)$/i,
      /^\d+\.\d+\s+.+:$/i,
    ],
    plainListIntroLines: [
      /^TT collects and processes the following:$/i,
      /^Data is collected and used strictly to:$/i,
      /^Users have the right to:$/i,
      /^Requests may be submitted to:$/i,
      /^Note:$/i,
      /^Users may not:$/i,
      /^By accepting this agreement in the TT platform, the user confirms:$/i,
    ],
    listItemLines: [/^[A-Za-z0-9][A-Za-z0-9'()\-/,.\s:.]+$/],
  },
};

function formatCurrentSituation(value: string) {
  const normalized = String(value || "").trim();
  const labels: Record<string, string> = {
    gap_year: "Gap Year",
    waiting_uni: "Waiting For University",
    studying: "Currently Studying",
    working: "Working",
    other: "Other",
  };
  return labels[normalized] || normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveDateOfBirthFromSouthAfricanId(idNumber: string) {
  const digits = String(idNumber || "").replace(/\D/g, "");
  if (digits.length < 6) return "";
  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));
  if (!yy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return "";

  const now = new Date();
  const currentTwoDigitYear = now.getFullYear() % 100;
  const fullYear = yy <= currentTwoDigitYear ? 2000 + yy : 1900 + yy;
  const date = new Date(fullYear, mm - 1, dd);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== fullYear ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return "";
  }

  return `${fullYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAcceptedAt(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
}

function normalizeAgreementContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[â€œâ€]/g, '"')
    .replace(/[â€˜â€™]/g, "'")
    .replace(/[â€“â€”]/g, "-")
    .replace(/â†’/g, " -> ")
    .replace(/\uFFFD/g, "")
    .replace(/Grade Level Preference:\s*[\s\S]*?(?=\nSECTION B:)/i, "")
    .replace(/\nFOR OFFICIAL USE ONLY[\s\S]*$/i, "")
    .replace(/\n(?:SECTION [A-Z]:\s*FINAL DECLARATION|[0-9]+\.\s*DECLARATION)[\s\S]*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tokenizeAgreementLines(content: string) {
  const rawLines = normalizeAgreementContent(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lines: string[] = [];

  for (let index = 0; index < rawLines.length; index += 1) {
    const current = rawLines[index];
    const next = rawLines[index + 1];

    if (/^SECTION [A-Z]:$/i.test(current) && next && /^[A-Z][A-Z\s()/-]+$/.test(next)) {
      lines.push(`${current} ${next}`);
      index += 1;
      continue;
    }

    if (/^[A-Z][A-Z\s()/-]+$/.test(current) && next && /^[A-Z][A-Z\s()/-]+$/.test(next) && !/^SECTION [A-Z]:/i.test(next)) {
      lines.push(`${current} ${next}`);
      index += 1;
      continue;
    }

    lines.push(current);
  }

  return lines;
}

function renderAgreementHtml(content: string) {
  const lines = tokenizeAgreementLines(content);
  const blocks: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  let listMode = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^(SECTION [A-Z]|[0-9]+\.)/.test(line) || /^[A-Z][A-Z0-9\s/&(),.-]{8,}$/.test(line)) {
      flushList();
      const tag = /^(SECTION [A-Z]|[0-9]+\.)/.test(line) ? "h2" : "h1";
      blocks.push(`<${tag}>${escapeHtml(line)}</${tag}>`);
      listMode = false;
      continue;
    }

    const cleanedCheckboxLine = line.replace(/^\[[^\]]*\]\s*/, "");
    if (/^\[.\]/.test(line)) {
      listItems.push(line.replace(/^\[[^\]]*\]\s*/, ""));
      listMode = true;
      continue;
    }

    const isLikelyListItem =
      listMode ||
      /^[A-Z][a-z][^.!?]{0,95}$/.test(cleanedCheckboxLine) ||
      /^(employment|partnership|joint venture|agency|conduct|session execution|platform discipline|non-compliance|platform violations|session integrity issues|copy|reproduce|distribute|teach outside TT|income|student allocation|session volume|withhold payment|reverse payment|adjust payment|audit sessions|review recordings|evaluate performance|compliance|quality control|system integrity|accurate|honest|complete|placement|earnings|references|long-term engagement)$/i.test(cleanedCheckboxLine) ||
      /^(deliver|conduct|maintain|execute|record|model|apply|guide|top-down camera|clear, step-by-step visual execution|conditioning phases|stability states|tt drill system|no private communication|no acceptance of payment|consistent execution|tt-os compliance|platform discipline|session quality failure|structural violations|misreporting or dishonest observation|platform misuse|conduct issues|may occur without prior notice|immediately halts all payment eligibility|all tt decisions regarding compliance are final|contractor income stability|academic or career outcomes|personal financial obligations|all tax obligations \(including sars compliance\)|placement|earnings|references|long-term engagement)$/i.test(cleanedCheckboxLine);

    if (/:$/.test(line)) {
      flushList();
      blocks.push(`<p>${escapeHtml(line)}</p>`);
      listMode = true;
      continue;
    }

    if (isLikelyListItem) {
      listItems.push(cleanedCheckboxLine);
      listMode = true;
      continue;
    }

    flushList();
    listMode = false;
    blocks.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();

  return blocks.join("");
}

function normalizeAgreementContentStrict(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F]/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/Grade Level Preference:\s*[\s\S]*?(?=\nSECTION B:)/i, "")
    .replace(/\nFOR OFFICIAL USE ONLY[\s\S]*$/i, "")
    .replace(/\n(?:SECTION [A-Z]:\s*FINAL DECLARATION|[0-9]+\.\s*DECLARATION)[\s\S]*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tokenizeAgreementLinesStrict(content: string) {
  const rawLines = normalizeAgreementContentStrict(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lines: string[] = [];
  let pendingSectionHeading: string | null = null;

  const isAllCapsHeadingFragment = (value: string) => /^[A-Z][A-Z\s()/-]+$/.test(value);

  const flushPendingHeading = () => {
    if (!pendingSectionHeading) return;
    lines.push(pendingSectionHeading);
    pendingSectionHeading = null;
  };

  for (let index = 0; index < rawLines.length; index += 1) {
    let current = rawLines[index];
    const next = rawLines[index + 1];

    if (/^SECTION [A-Z]:/i.test(current) && (!/[.!?]$/.test(current) || /[:,-]$/.test(current))) {
      pendingSectionHeading = current;
      continue;
    }

    if (pendingSectionHeading) {
      if (isAllCapsHeadingFragment(current)) {
        pendingSectionHeading = `${pendingSectionHeading} ${current}`;
        continue;
      }

      flushPendingHeading();
    }

    if (/^SECTION [A-Z]:$/i.test(current) && next && isAllCapsHeadingFragment(next)) {
      pendingSectionHeading = `${current} ${next}`;
      index += 1;
      continue;
    }

    if (isAllCapsHeadingFragment(current) && next && isAllCapsHeadingFragment(next) && !/^SECTION [A-Z]:/i.test(next)) {
      pendingSectionHeading = `${current} ${next}`;
      index += 1;
      continue;
    }

    if (
      next &&
      current.length >= 90 &&
      !/:$/.test(current) &&
      !/^(SECTION [A-Z]|\d+\.)/i.test(current) &&
      !/^[A-Z][A-Z0-9\s/&(),.-]{8,}$/.test(next) &&
      /^[a-z(]/.test(next)
    ) {
      current = `${current} ${next}`;
      index += 1;
    }

    lines.push(current);
  }

  flushPendingHeading();

  return lines;
}

function renderAgreementHtmlStrict(content: string, documentCode?: string) {
  const lines = tokenizeAgreementLinesStrict(content);
  const blocks: string[] = [];
  let listItems: string[] = [];
  let listMode = false;
  const rules = DOCUMENT_RENDER_RULES[documentCode || ""] || {};
  const isDocumentHeading = (value: string) => /^SECTION [A-Z]/.test(value) || /^\d+\.\s+[A-Z]/.test(value);
  const isNumberedClauseLine = (value: string) => /^\d+\.\d+\s+/.test(value);
  const matchesAny = (value: string, patterns: RegExp[] | undefined) => (patterns || []).some((pattern) => pattern.test(value));
  const isPotentialListItem = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return false;
    if (/^(and|or)$/i.test(cleaned)) return false;
    if (/[.!?]$/.test(cleaned)) return false;
    if (isNumberedClauseLine(cleaned)) return false;
    if (protectedFieldLine.test(cleaned)) return false;
    if (cleaned.length > 110) return false;
    if (matchesAny(cleaned, rules.listItemLines)) return true;
    return false;
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  const protectedFieldLine =
    /^(Full Name:|Contact Number:|Date of Birth:|Email Address:|ID Number:|School Attended \(Matric\):|Current Status|Matric Year:|School Where Matric Was Completed:|Print Name:|Document Reference:)/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const isProtectedFieldLine = protectedFieldLine.test(line);

    if (isDocumentHeading(line) || /^[A-Z][A-Z0-9\s/&(),.-]{8,}$/.test(line)) {
      flushList();
      const tag = isDocumentHeading(line) ? "h2" : "h1";
      blocks.push(`<${tag}>${escapeHtml(line)}</${tag}>`);
      listMode = false;
      continue;
    }

    if (isProtectedFieldLine) {
      flushList();
      listMode = false;
      blocks.push(`<p>${escapeHtml(line)}</p>`);
      continue;
    }

    if (isNumberedClauseLine(line) && !matchesAny(line, rules.numberedListIntroLines)) {
      flushList();
      listMode = false;
      blocks.push(`<p>${escapeHtml(line)}</p>`);
      continue;
    }

    const inlineColonMatch = line.match(/^([A-Z][A-Za-z0-9\s()/-]{2,48}:)\s+(.+)$/);
    if (inlineColonMatch && !isProtectedFieldLine) {
      flushList();
      blocks.push(`<p>${escapeHtml(inlineColonMatch[1])}</p>`);
      listItems.push(inlineColonMatch[2]);
      listMode = true;
      continue;
    }

    if (matchesAny(line, rules.numberedListIntroLines)) {
      flushList();
      blocks.push(`<p>${escapeHtml(line)}</p>`);
      listMode = true;
      continue;
    }

    const cleanedCheckboxLine = line.replace(/^\[[^\]]*\]\s*/, "");
    if (/^\[.\]/.test(line)) {
      listItems.push(cleanedCheckboxLine);
      listMode = true;
      continue;
    }

    if (matchesAny(line, rules.plainListIntroLines)) {
      flushList();
      blocks.push(`<p>${escapeHtml(line)}</p>`);
      listMode = true;
      continue;
    }

    if (listMode) {
      if (isPotentialListItem(cleanedCheckboxLine)) {
        listItems.push(cleanedCheckboxLine);
        continue;
      }
      flushList();
      listMode = false;
    }

    flushList();
    listMode = false;
    blocks.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();
  return blocks.join("");
}

function normalizeValue(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeDisplayedVersion(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "1";
  if (/^TT-[A-Z]+-\d{3}$/i.test(normalized)) return "1";
  return normalized;
}

function buildInitialFormData(fields: FieldDefinition[], application: any, acceptance: any) {
  const savedForm = acceptance?.formSnapshotJson || acceptance?.form_snapshot_json || {};
  const applicationIdNumber = normalizeValue(application?.idNumber || application?.id_number);
  const applicationCurrentSituation = normalizeValue(
    application?.currentSituationOther ||
    application?.current_situation_other ||
    formatCurrentSituation(application?.currentSituation || application?.current_situation)
  );
  const applicationSchool = normalizeValue(
    application?.schoolAttended ||
    application?.school_attended ||
    application?.school ||
    application?.schoolName ||
    application?.school_name
  );
  const initial: Record<string, string> = {
    legalName: normalizeValue(
      acceptance?.typedFullName ||
      acceptance?.typed_full_name ||
      application?.fullName ||
      application?.full_name
    ),
    emailAddress: normalizeValue(application?.email),
    phoneNumber: normalizeValue(application?.phone),
    idNumber: applicationIdNumber,
    dateOfBirth: deriveDateOfBirthFromSouthAfricanId(applicationIdNumber),
    matricYear: normalizeValue(application?.matricYear || application?.matric_year),
    schoolName: applicationSchool,
    currentStatus: applicationCurrentSituation,
    examNumber: normalizeValue(application?.examNumber || application?.exam_number),
  };

  for (const field of fields) {
    const savedValue = normalizeValue(savedForm[field.key]);
    if (savedValue) {
      initial[field.key] = savedValue;
    }
  }

  return Object.fromEntries(fields.map((field) => [field.key, initial[field.key] || ""]));
}

function buildAcceptanceDerivedFormData(acceptance: any) {
  const savedForm = acceptance?.formSnapshotJson || acceptance?.form_snapshot_json || {};
  return {
    legalName: normalizeValue(acceptance?.typedFullName || acceptance?.typed_full_name || savedForm.legalName),
    emailAddress: normalizeValue(savedForm.emailAddress),
    phoneNumber: normalizeValue(savedForm.phoneNumber),
    idNumber: normalizeValue(savedForm.idNumber),
    dateOfBirth: normalizeValue(savedForm.dateOfBirth),
    matricYear: normalizeValue(savedForm.matricYear),
    schoolName: normalizeValue(savedForm.schoolName),
    currentStatus: normalizeValue(savedForm.currentStatus),
    examNumber: normalizeValue(savedForm.examNumber),
  };
}

function buildApplicationLockedFormData(application: any) {
  const applicationIdNumber = normalizeValue(application?.idNumber || application?.id_number);
  return {
    legalName: normalizeValue(application?.fullName || application?.full_name),
    emailAddress: normalizeValue(application?.email),
    phoneNumber: normalizeValue(application?.phone),
    idNumber: applicationIdNumber,
    dateOfBirth: deriveDateOfBirthFromSouthAfricanId(applicationIdNumber),
    matricYear: normalizeValue(application?.matricYear || application?.matric_year),
    schoolName: normalizeValue(
      application?.schoolAttended ||
      application?.school_attended ||
      application?.school ||
      application?.schoolName ||
      application?.school_name
    ),
    currentStatus: normalizeValue(
      application?.currentSituationOther ||
      application?.current_situation_other ||
      formatCurrentSituation(application?.currentSituation || application?.current_situation)
    ),
    examNumber: normalizeValue(application?.examNumber || application?.exam_number),
  };
}

function hydrateDocumentContent(content: string, fieldValues: Record<string, string>) {
  const replacements: Array<[RegExp, string]> = [
    [/Full Name:\s*_+/i, `Full Name: ${fieldValues.legalName || "______________________________"}`],
    [/Contact Number:\s*_+/i, `Contact Number: ${fieldValues.phoneNumber || "______________________________"}`],
    [/Date of Birth:\s*_+/i, `Date of Birth: ${fieldValues.dateOfBirth || "______________________________"}`],
    [/Email Address:\s*_+/i, `Email Address: ${fieldValues.emailAddress || "______________________________"}`],
    [/ID Number:\s*_+/i, `ID Number: ${fieldValues.idNumber || "______________________________"}`],
    [/School Attended \(Matric\):\s*_+/i, `School Attended (Matric): ${fieldValues.schoolName || "______________________________"}`],
    [/Current Status \(e\.g\.\s*Gap Year,\s*University Student,\s*Graduate\):\s*_*\s*/i, `Current Status (e.g. Gap Year, University Student, Graduate): ${fieldValues.currentStatus || "______________________________"}\n`],
    [/Matric Year:\s*_+/i, `Matric Year: ${fieldValues.matricYear || "______________________________"}`],
    [/School Where Matric Was Completed:\s*_+/i, `School Where Matric Was Completed: ${fieldValues.schoolName || "______________________________"}`],
    [/Print Name:\s*_+/i, `Print Name: ${fieldValues.legalName || "______________________________"}`],
  ];

  let next = content;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  return next;
}

function buildAcceptedCopyHtml(params: {
  document: OnboardingDocumentDefinition;
  acceptance: any;
  typedFullName: string;
  formData: Record<string, string>;
  fields: FieldDefinition[];
}) {
  const { document, acceptance, typedFullName, formData, fields } = params;
  const acceptedAt = acceptance?.acceptedAt || acceptance?.accepted_at || null;
  const acceptedName = acceptance?.typedFullName || acceptance?.typed_full_name || typedFullName || "Not available";
  const documentHash = acceptance?.documentChecksum || acceptance?.document_checksum || document.contentHash || "Not available";
  const documentVersion = normalizeDisplayedVersion(acceptance?.documentVersion || acceptance?.document_version || document.version);
  const clauseKeys = acceptance?.acceptedClausesJson || acceptance?.accepted_clauses_json || [];
  const tutorDetailsRows = fields
    .map((field) => {
      const value = String(formData[field.key] || "").trim();
      if (!value) return "";
      return `<tr><th>${escapeHtml(field.label)}</th><td>${escapeHtml(value)}</td></tr>`;
    })
    .filter(Boolean)
    .join("");
  const clauseRows = (document.mandatoryClauses || [])
    .filter((clause) => clauseKeys.includes(clause.key))
    .map((clause) => `<li>${escapeHtml(clause.label)}</li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(document.code)} Accepted Copy</title>
  <style>
    @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e7e1d7; color: #1f2933; font-family: "Georgia", "Times New Roman", serif; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fffdf8; padding: 18mm 16mm; }
    .eyebrow { font: 600 11px/1.4 Arial, sans-serif; letter-spacing: 0.18em; text-transform: uppercase; color: #8b2c1f; }
    h1 { margin: 8px 0 6px; font-size: 28px; line-height: 1.15; }
    .subhead { margin: 0; font: 500 13px/1.6 Arial, sans-serif; color: #52606d; }
    .summary { margin-top: 18px; padding: 14px 16px; border: 1px solid #d8cfc2; background: #f8f2e8; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin-top: 10px; }
    .summary-label { font: 600 11px/1.4 Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; color: #7b8794; }
    .summary-value { margin-top: 3px; font: 400 14px/1.5 Arial, sans-serif; color: #102a43; }
    .section { margin-top: 22px; }
    .section-title { margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #d8cfc2; font: 700 14px/1.4 Arial, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: #7b341e; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 9px 10px; border: 1px solid #ddd3c5; vertical-align: top; }
    th { width: 34%; background: #f6efe4; text-align: left; font: 600 12px/1.5 Arial, sans-serif; color: #243b53; }
    td { font: 400 13px/1.6 Arial, sans-serif; }
    .clauses { margin: 0; padding-left: 18px; font: 400 13px/1.7 Arial, sans-serif; }
    .agreement-body { margin-top: 12px; }
    .agreement-body h1, .agreement-body h2 { font-family: Arial, sans-serif; color: #102a43; }
    .agreement-body h1 { font-size: 16px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
    .agreement-body h2 { font-size: 14px; margin: 16px 0 8px; }
    .agreement-body p { margin: 0 0 10px; font: 400 13px/1.7 Arial, sans-serif; }
    .agreement-body ul { margin: 0 0 10px 18px; padding: 0; }
    .agreement-body li { margin-bottom: 5px; font: 400 13px/1.6 Arial, sans-serif; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd3c5; font: 400 11px/1.5 Arial, sans-serif; color: #7b8794; }
    .signature { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .signature-box { padding-top: 10px; border-top: 1px solid #9fb3c8; font: 400 12px/1.5 Arial, sans-serif; }
  </style>
</head>
<body>
  <main class="page">
    <div class="eyebrow">Territorial Tutoring Accepted Agreement Copy</div>
    <h1>${escapeHtml(document.title)}</h1>
    <p class="subhead">${escapeHtml(document.code)} | Version ${escapeHtml(documentVersion)} | Accepted in-app against the tutor's authenticated TT account</p>

    <section class="summary">
      <div class="summary-label">Acceptance record</div>
      <div class="summary-grid">
        <div><div class="summary-label">Accepted by</div><div class="summary-value">${escapeHtml(acceptedName)}</div></div>
        <div><div class="summary-label">Accepted at</div><div class="summary-value">${escapeHtml(formatAcceptedAt(acceptedAt))}</div></div>
        <div><div class="summary-label">Document hash</div><div class="summary-value">${escapeHtml(documentHash)}</div></div>
        <div><div class="summary-label">Acceptance method</div><div class="summary-value">In-app assent with typed full name and clause acknowledgement</div></div>
      </div>
    </section>

    ${tutorDetailsRows ? `<section class="section"><h2 class="section-title">Tutor Details Captured At Acceptance</h2><table>${tutorDetailsRows}</table></section>` : ""}
    ${clauseRows ? `<section class="section"><h2 class="section-title">Acknowledged Clauses</h2><ul class="clauses">${clauseRows}</ul></section>` : ""}

    <section class="section">
      <h2 class="section-title">Accepted Agreement Text</h2>
      <div class="agreement-body">${renderAgreementHtmlStrict(hydrateDocumentContent(document.content || "", { ...formData, legalName: acceptedName }), document.code)}</div>
    </section>

    <section class="signature">
      <div class="signature-box">Tutor acceptance name: ${escapeHtml(acceptedName)}</div>
      <div class="signature-box">Accepted timestamp: ${escapeHtml(formatAcceptedAt(acceptedAt))}</div>
    </section>

    <div class="footer">
      This accepted copy was generated from TT's stored onboarding acceptance record. It reflects the versioned in-app agreement text and acceptance evidence held at the time of assent.
    </div>
  </main>
</body>
</html>`;
}

const DEFAULT_DOCUMENT_STATUSES: Record<string, DocumentStatus> = {
  "1": "pending_upload",
  "2": "not_started",
  "3": "not_started",
  "4": "not_started",
  "5": "not_started",
  "6": "not_started",
};

const DOCUMENT_FORM_FIELDS: Record<number, FieldDefinition[]> = {
  1: [
    { key: "legalName", label: "Full legal name", placeholder: "Enter your full legal name" },
    { key: "dateOfBirth", label: "Date of birth", placeholder: "Derived from your SA ID number", readOnly: true },
    { key: "emailAddress", label: "Email address", placeholder: "Loaded from your TT account", readOnly: true },
    { key: "phoneNumber", label: "Phone number", placeholder: "Enter your contact number" },
    { key: "idNumber", label: "ID number", placeholder: "Enter your South African ID number" },
    { key: "schoolName", label: "School attended (Matric)", placeholder: "Enter the school you attended for Matric" },
    { key: "currentStatus", label: "Current status", placeholder: "Gap year, waiting uni, studying, working, etc." },
  ],
  2: [
    { key: "legalName", label: "Full legal name", placeholder: "Enter your full legal name" },
    { key: "dateOfBirth", label: "Date of birth", placeholder: "Derived from your SA ID number", readOnly: true },
    { key: "emailAddress", label: "Email address", placeholder: "Loaded from your TT account", readOnly: true },
    { key: "phoneNumber", label: "Phone number", placeholder: "Enter your contact number" },
    { key: "idNumber", label: "ID number", placeholder: "Enter your South African ID number" },
    { key: "matricYear", label: "Matric year", placeholder: "Enter the year you completed Matric" },
    { key: "schoolName", label: "School name", placeholder: "Enter the school where you completed Matric" },
    { key: "examNumber", label: "Exam number", placeholder: "Enter your exam or candidate number if shown" },
  ],
};

function normalizeDocumentStatuses(raw: any): Record<string, DocumentStatus> {
  return { ...DEFAULT_DOCUMENT_STATUSES, ...(raw && typeof raw === "object" ? raw : {}) };
}

function getCurrentStep(statuses: Record<string, DocumentStatus>) {
  for (const step of [1, 2, 3, 4, 5, 6]) {
    if (statuses[String(step)] !== "approved") return step;
  }
  return 6;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result.split(",")[1] : "";
      resolve(result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function SequentialDocumentSubmission({ applicationId, applicationStatus }: SequentialDocumentSubmissionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const readerRef = useRef<HTMLDivElement | null>(null);
  const [liveApplication, setLiveApplication] = useState<any>(applicationStatus);
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerPercent, setReaderPercent] = useState(0);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);
  const [viewStartedAt, setViewStartedAt] = useState<string | null>(null);
  const [viewCompletedAt, setViewCompletedAt] = useState<string | null>(null);
  const [typedFullName, setTypedFullName] = useState("");
  const [generalRead, setGeneralRead] = useState(false);
  const [generalBound, setGeneralBound] = useState(false);
  const [clauseChecks, setClauseChecks] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setLiveApplication(applicationStatus);
  }, [applicationStatus]);

  const { data, isLoading } = useQuery<{ applicationId: string; documents: OnboardingDocumentDefinition[] }>({
    queryKey: ["/api/tutor/onboarding-documents", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/tutor/onboarding-documents`, { credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Failed to load onboarding documents");
      return payload;
    },
  });

  const documentsStatus = useMemo(
    () => normalizeDocumentStatuses(liveApplication?.documentsStatus || liveApplication?.documents_status),
    [liveApplication]
  );
  const acceptanceMap = liveApplication?.onboardingAcceptanceMap || {};
  const doc1Acceptance = acceptanceMap["1"];
  const currentStep = getCurrentStep(documentsStatus);
  const currentDocument = data?.documents?.find((entry) => entry.step === currentStep);
  const currentAcceptance = acceptanceMap[String(currentStep)];
  const currentFormFields = DOCUMENT_FORM_FIELDS[currentStep] || [];
  const currentStatus = documentsStatus[String(currentStep)];
  const uploadReady = currentStep === 6 || Boolean(acceptanceMap["2"]);
  const isUploadStep = currentStep === 2 || currentStep === 6;
  const isAcceptanceStep = Boolean(currentDocument?.requiresAcceptance);
  const acceptanceAlreadyRecorded = Boolean(currentAcceptance);
  const isPendingCooReview = currentStatus === "pending_review";
  const allApproved = Object.values(documentsStatus).every((value) => value === "approved");

  const statusLabel =
    currentStep === 2 && currentStatus === "pending_upload" && currentAcceptance
      ? "Accepted - Waiting For Certificate Upload"
      : currentStep !== 6 && currentStatus === "pending_upload"
        ? "Awaiting Acceptance"
        : String(currentStatus).replace(/_/g, " ");

  const initialFormData = useMemo(
    () => buildInitialFormData(currentFormFields, liveApplication, currentAcceptance),
    [currentFormFields, liveApplication, currentAcceptance]
  );
  const previousAcceptanceDerivedFormData = useMemo(
    () => buildAcceptanceDerivedFormData(currentStep === 2 ? doc1Acceptance : null),
    [currentStep, doc1Acceptance]
  );
  const applicationLockedFormData = useMemo(
    () => buildApplicationLockedFormData(liveApplication),
    [liveApplication]
  );
  const canonicalLockedFormData = useMemo(
    () => ({
      ...applicationLockedFormData,
      ...(currentStep === 2
        ? Object.fromEntries(
            Object.entries(previousAcceptanceDerivedFormData).filter(([, value]) => Boolean(String(value || "").trim()))
          )
        : {}),
    }),
    [applicationLockedFormData, currentStep, previousAcceptanceDerivedFormData]
  );
  const effectiveInitialFormData = useMemo(
    () => ({
      ...initialFormData,
      ...(currentStep === 2
        ? Object.fromEntries(
            Object.entries(previousAcceptanceDerivedFormData).filter(([, value]) => Boolean(String(value || "").trim()))
          )
        : {}),
    }),
    [initialFormData, currentStep, previousAcceptanceDerivedFormData]
  );
  const hydratedDocumentContent = useMemo(
    () => hydrateDocumentContent(currentDocument?.content || "", { ...effectiveInitialFormData, ...formData, legalName: typedFullName || effectiveInitialFormData.legalName || "" }),
    [currentDocument, effectiveInitialFormData, formData, typedFullName]
  );
  const acceptanceResetKey = `${currentStep}:${currentAcceptance?.acceptedAt || currentAcceptance?.accepted_at || "pending"}`;

  useEffect(() => {
    const fallbackName = liveApplication?.fullName || liveApplication?.full_name || "";
    setTypedFullName(currentAcceptance?.typedFullName || currentAcceptance?.typed_full_name || effectiveInitialFormData.legalName || fallbackName);
    setFormData(effectiveInitialFormData);
    setGeneralRead(false);
    setGeneralBound(false);
    setClauseChecks(
      Object.fromEntries((currentDocument?.mandatoryClauses || []).map((clause) => [clause.key, false]))
    );
    setReaderPercent(0);
    setHasCompletedReading(Boolean(currentAcceptance));
    setViewStartedAt(null);
    setViewCompletedAt(null);
  }, [acceptanceResetKey, currentDocument?.step]);

  useEffect(() => {
    setSelectedFile(null);
  }, [currentStep]);

  useEffect(() => {
    setReaderOpen(false);
  }, [currentStep]);

  useEffect(() => {
    if (currentStatus === "pending_review" || currentStatus === "approved") {
      setSelectedFile(null);
    }
  }, [currentStatus]);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!currentDocument) throw new Error("No document loaded");
      const response = await fetch(`${API_URL}/api/tutor/onboarding-documents/${currentDocument.step}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId,
          documentVersion: currentDocument.version,
          documentHash: currentDocument.contentHash,
          typedFullName,
          acceptedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language,
          platform: "web",
          sourceFlow: `tutor_onboarding_step_${currentDocument.step}`,
          formData,
          acceptedClauseKeys: Object.entries(clauseChecks).filter(([, value]) => value).map(([key]) => key),
          scrollCompletionPercent: readerPercent,
          viewStartedAt,
          viewCompletedAt,
          acceptClickedAt: new Date().toISOString(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Failed to accept document");
      return payload;
    },
    onSuccess: (payload) => {
      setLiveApplication(payload.application);
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
      toast({ title: "Agreement accepted", description: `${currentDocument?.code} has been recorded.` });
    },
    onError: (error: Error) => {
      if (/(already been accepted|already accepted|current acceptance step|pending review)/i.test(error.message)) {
        queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
        toast({
          title: "Agreement status updated",
          description: "Your onboarding state has been refreshed.",
        });
        return;
      }
      toast({ title: "Acceptance failed", description: error.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !currentDocument) throw new Error("Choose a file first");
      const fileData = await readFileAsBase64(selectedFile);
      const response = await fetch(`${API_URL}/api/tutor/onboarding-documents/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId,
          docStep: currentDocument.step,
          fileName: `${applicationId}/doc_${currentDocument.step}_${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          fileData,
          fileType: selectedFile.type,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Upload failed");
      return payload;
    },
    onSuccess: (payload) => {
      setLiveApplication(payload.application);
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
      toast({ title: "Upload received", description: "Your file is now in the COO review queue." });
    },
    onError: (error: Error) => {
      if (/(pending review|already approved|already accepted)/i.test(error.message)) {
        queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
        toast({
          title: "Upload status updated",
          description: "Your onboarding state has been refreshed.",
        });
        return;
      }
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const mandatoryClausesAccepted = (currentDocument?.mandatoryClauses || []).every((clause) => clauseChecks[clause.key]);
  const requiredFieldsComplete = currentFormFields.every((field) => String(formData[field.key] || "").trim());
  const canAccept = hasCompletedReading && generalRead && generalBound && mandatoryClausesAccepted && typedFullName.trim() && requiredFieldsComplete;

  const openReader = () => {
    setReaderOpen(true);
  };

  const handleReaderScroll = () => {
    const node = readerRef.current;
    if (!node) return;
    if (node.scrollHeight <= node.clientHeight + 8) {
      setReaderPercent(100);
      setViewCompletedAt((current) => current || new Date().toISOString());
      return;
    }
    const visibleBottom = node.scrollTop + node.clientHeight;
    const reachedEnd = visibleBottom >= node.scrollHeight - 24;
    const percent = reachedEnd
      ? 100
      : Math.min(99, Math.max(1, Math.round((visibleBottom / node.scrollHeight) * 100)));
    setReaderPercent(percent);
    if (reachedEnd) setViewCompletedAt((current) => current || new Date().toISOString());
  };

  useEffect(() => {
    if (!readerOpen || viewStartedAt) return;
    setViewStartedAt(new Date().toISOString());
  }, [readerOpen, viewStartedAt]);

  useEffect(() => {
    if (!readerOpen) return;
    const timer = window.setTimeout(handleReaderScroll, 50);
    return () => window.clearTimeout(timer);
  }, [readerOpen, currentDocument]);

  const downloadCopy = () => {
    if (!currentDocument?.content || !currentAcceptance) return;
    const storedFormData = currentAcceptance?.formSnapshotJson || currentAcceptance?.form_snapshot_json || formData;
    const html = buildAcceptedCopyHtml({
      document: currentDocument,
      acceptance: currentAcceptance,
      typedFullName,
      formData: storedFormData,
      fields: currentFormFields,
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentDocument.code}-accepted-copy.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAcceptedCopyFor = (docDefinition: OnboardingDocumentDefinition, acceptance: any) => {
    if (!docDefinition?.content || !acceptance) return;
    const storedFormData = acceptance?.formSnapshotJson || acceptance?.form_snapshot_json || {};
    const html = buildAcceptedCopyHtml({
      document: docDefinition,
      acceptance,
      typedFullName: acceptance?.typedFullName || acceptance?.typed_full_name || "",
      formData: storedFormData,
      fields: DOCUMENT_FORM_FIELDS[docDefinition.step] || [],
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${docDefinition.code}-accepted-copy.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !currentDocument) {
    return <Card><CardContent className="py-10 text-sm text-muted-foreground">Loading onboarding documents...</CardContent></Card>;
  }

  if (allApproved) {
    return <Card className="border-green-200 bg-green-50"><CardContent className="py-8 text-sm text-green-800">All onboarding steps are complete. TT is matching you to a pod.</CardContent></Card>;
  }

  return (
    <>
      <Card className="border-[#E7D5C8] bg-white shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Step {currentStep} of 6</CardTitle>
              <CardDescription>{currentDocument.title}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{currentDocument.code}</Badge>
              <Badge variant="outline">Version {normalizeDisplayedVersion(currentDocument.version)}</Badge>
              <Badge variant="outline">{statusLabel}</Badge>
            </div>
          </div>
          <Progress value={(currentStep / 6) * 100} />
        </CardHeader>

        <CardContent className="space-y-6">
          {isPendingCooReview ? (
            <div className="rounded-2xl border border-[#E7D5C8] bg-[#FFF5ED] p-4 text-[#1A1A1A] sm:p-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">This step is with COO for review</p>
                <p className="text-sm text-[#6B5B52]">
                  {currentStep === 2
                    ? "Your accepted TT-EQV-002 record and certified Matric certificate are now with COO. Step 3 will open after the certificate is approved."
                    : "Your certified ID copy is now with COO for review. You do not need to take any further action on this step right now."}
                </p>
              </div>
            </div>
          ) : null}

          {isAcceptanceStep && !isPendingCooReview ? (
            <div className="rounded-2xl border border-[#E7D5C8] bg-[#FFF5ED] p-4 text-[#1A1A1A] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Read the full document first</p>
                  <p className="text-sm text-[#6B5B52]">Open the document reader, review the agreement in-app, complete any document fields there, then return here to confirm acceptance.</p>
                </div>
                <Button type="button" onClick={openReader} className="w-full bg-[#E63946] text-white hover:bg-[#cf2e3c] sm:w-auto sm:self-start">
                  <Expand className="mr-2 h-4 w-4" />
                  Open document reader
                </Button>
              </div>
              <div className="mt-4 flex flex-col gap-1 text-xs text-[#6B5B52] sm:flex-row sm:flex-wrap sm:gap-3">
                <span>Read progress: {readerPercent}%</span>
                <span>{hasCompletedReading ? "Review complete" : "Acceptance remains locked until you finish reading"}</span>
              </div>
            </div>
          ) : null}

          {isAcceptanceStep && !isPendingCooReview ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-2xl border p-4">
                <div>
                  <p className="font-medium">Acceptance workspace</p>
                  <p className="text-sm text-muted-foreground">Complete only the inputs that belong to this document. The TT text stays read-only inside the full-screen reader.</p>
                </div>
                {acceptanceAlreadyRecorded ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    Acceptance already recorded for this step.
                    {currentAcceptance?.acceptedAt || currentAcceptance?.accepted_at
                      ? ` Accepted ${new Date(currentAcceptance?.acceptedAt || currentAcceptance?.accepted_at).toLocaleString()}.`
                      : ""}
                    {currentStep === 2 ? " Upload your certified Matric certificate below to move this step into COO review." : ""}
                  </div>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  Review the document fields inside the reader, then return here only to confirm assent and complete acceptance.
                </p>
                <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                  <label className="flex items-start gap-3 text-sm"><Checkbox checked={generalRead} disabled={!hasCompletedReading || acceptanceAlreadyRecorded} onCheckedChange={(value) => setGeneralRead(Boolean(value))} /><span>I have read and understood this document.</span></label>
                  <label className="flex items-start gap-3 text-sm"><Checkbox checked={generalBound} disabled={!hasCompletedReading || acceptanceAlreadyRecorded} onCheckedChange={(value) => setGeneralBound(Boolean(value))} /><span>I agree to be legally bound by these terms and understand TT will store an audit record of this acceptance.</span></label>
                  {currentDocument.mandatoryClauses.map((clause) => (
                    <label key={clause.key} className="flex items-start gap-3 text-sm">
                      <Checkbox checked={clauseChecks[clause.key] || false} disabled={!hasCompletedReading || acceptanceAlreadyRecorded} onCheckedChange={(value) => setClauseChecks((current) => ({ ...current, [clause.key]: Boolean(value) }))} />
                      <span>{clause.label}</span>
                    </label>
                  ))}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Acceptance name</label>
                    <Input value={typedFullName} disabled placeholder="Complete your legal name in the reader above" />
                    <p className="text-xs text-muted-foreground">This mirrors the legal name captured inside the document and is the name used on the acceptance record.</p>
                  </div>
                </div>
                <Button type="button" disabled={!canAccept || acceptMutation.isPending || acceptanceAlreadyRecorded} onClick={() => acceptMutation.mutate()} className="w-full">
                  {acceptMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                  Accept and continue
                </Button>
              </div>

              <div className="space-y-4 rounded-2xl border p-4">
                <div>
                  <p className="font-medium">Step summary</p>
                  <p className="text-sm text-muted-foreground">Version-locked acceptance record tied to your TT account.</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Document: {currentDocument.code}</p>
                  <p>Version: {currentDocument.version}</p>
                  <p>Hash: {String(currentDocument.contentHash || "").slice(0, 16)}...</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={openReader}><FileText className="mr-2 h-4 w-4" />Review again</Button>
                  <Button type="button" variant="outline" disabled={!acceptanceAlreadyRecorded} onClick={downloadCopy}><Download className="mr-2 h-4 w-4" />Download accepted copy</Button>
                </div>
              </div>
            </div>
          ) : null}

          {isUploadStep && !isPendingCooReview ? (
            <div className="rounded-2xl border p-4">
              <p className="font-medium">{currentDocument.uploadTitle || "Required upload"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{currentDocument.uploadDescription}</p>
              {currentStep === 2 && !uploadReady ? <p className="mt-3 text-sm text-amber-700">Accept TT-EQV-002 first. The certified Matric certificate upload unlocks immediately after acceptance.</p> : null}
              {currentStep === 2 && uploadReady && currentStatus !== "pending_review" ? (
                <p className="mt-3 text-sm text-muted-foreground">Choose the certified Matric certificate, then upload it for COO review. Step 3 opens only after COO approves this certificate.</p>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={!uploadReady || uploadMutation.isPending || currentStatus === "pending_review"} onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                <Button type="button" className="w-full sm:w-auto" disabled={!selectedFile || !uploadReady || uploadMutation.isPending || currentStatus === "pending_review"} onClick={() => uploadMutation.mutate()}>
                  {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload file
                </Button>
              </div>
              {selectedFile ? (
                <p className="mt-3 text-sm text-[#6B5B52]">
                  Selected file: <span className="font-medium text-[#1A1A1A]">{selectedFile.name}</span>
                </p>
              ) : null}
              {currentStatus === "pending_review" ? <p className="mt-3 text-sm text-muted-foreground">Your upload is with COO for review now.</p> : null}
              {currentStatus === "rejected" ? <p className="mt-3 text-sm text-red-700">{liveApplication?.[`doc${currentStep}SubmissionRejectionReason`] || liveApplication?.[`doc_${currentStep}_submission_rejection_reason`] || "Your upload was rejected. Review the reason and upload a corrected file."}</p> : null}
            </div>
          ) : null}

          {data?.documents?.some((document) => document.requiresAcceptance && acceptanceMap[String(document.step)]) ? (
            <div className="rounded-2xl border p-4">
              <div className="mb-4">
                <p className="font-medium">Accepted documents</p>
                <p className="text-sm text-muted-foreground">Download a clean accepted copy for any agreement you have already completed.</p>
              </div>
              <div className="space-y-3">
                {data.documents
                  .filter((document) => document.requiresAcceptance && acceptanceMap[String(document.step)])
                  .map((document) => {
                    const acceptance = acceptanceMap[String(document.step)];
                    const acceptedAt = acceptance?.acceptedAt || acceptance?.accepted_at;
                    return (
                      <div key={document.step} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium">{document.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.code} • Version {normalizeDisplayedVersion(acceptance?.documentVersion || acceptance?.document_version || document.version)}
                          </p>
                          {acceptedAt ? (
                            <p className="text-xs text-muted-foreground">Accepted {new Date(acceptedAt).toLocaleString()}</p>
                          ) : null}
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => downloadAcceptedCopyFor(document, acceptance)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download accepted copy
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={readerOpen} onOpenChange={setReaderOpen}>
        <DialogContent className="left-1/2 top-1/2 h-[92dvh] w-[calc(100vw-1rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E7D5C8] p-0 shadow-2xl sm:h-[88dvh] sm:w-[calc(100vw-3rem)]">
          <style>{`
            .agreement-reader h1,
            .agreement-reader h2 {
              font-family: Arial, sans-serif;
              color: #102a43;
            }

            .agreement-reader h1 {
              margin: 1.25rem 0 0.65rem;
              font-size: 1rem;
              line-height: 1.5;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }

            .agreement-reader h2 {
              margin: 1rem 0 0.55rem;
              font-size: 0.9rem;
              line-height: 1.5;
              font-weight: 700;
            }

            .agreement-reader p {
              margin: 0 0 0.7rem;
              font-family: Arial, sans-serif;
              font-size: 0.95rem;
              line-height: 1.8;
              color: #243b53;
            }

            .agreement-reader ul {
              margin: 0 0 0.8rem 1.2rem;
              padding: 0;
              list-style-type: disc;
              list-style-position: outside;
            }

            .agreement-reader li {
              display: list-item;
              margin-bottom: 0.35rem;
              font-family: Arial, sans-serif;
              font-size: 0.95rem;
              line-height: 1.7;
              color: #243b53;
            }
          `}</style>
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[#FFF5ED] text-[#1A1A1A]">
            <DialogHeader className="shrink-0 border-b border-[#E7D5C8] bg-white px-4 py-4 text-left sm:px-6 sm:py-5">
              <DialogTitle className="pr-8 text-xl sm:text-2xl">{currentDocument.title}</DialogTitle>
              <DialogDescription className="text-[#6B5B52]">{currentDocument.code} • version {normalizeDisplayedVersion(currentDocument.version)}</DialogDescription>
            </DialogHeader>
            <div ref={readerRef} onScroll={handleReaderScroll} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FFF5ED] px-3 py-4 touch-pan-y sm:px-6 sm:py-6">
              <div className="mx-auto max-w-4xl rounded-2xl border border-[#E7D5C8] bg-white px-4 py-6 text-[#1A1A1A] shadow-[0_18px_50px_rgba(230,57,70,0.08)] sm:px-10 sm:py-10">
                <div className="border-b border-[#E7D5C8] pb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E63946]">Territorial Tutoring Onboarding Document</p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">{currentDocument.title}</h1>
                  <p className="mt-2 text-xs text-[#6B5B52] sm:text-sm">
                    {currentDocument.code} • Version {normalizeDisplayedVersion(currentDocument.version)}
                  </p>
                </div>
                {currentFormFields.length > 0 ? (
                  <div className="mt-6 rounded-2xl border border-[#E7D5C8] bg-[#FFF5ED] p-4 sm:p-5">
                    <div className="mb-4 space-y-1">
                      <p className="text-sm font-semibold text-[#1A1A1A]">Document fields</p>
                      <p className="text-sm text-[#6B5B52]">Complete the tutor details that belong to this document here. TT account fields are prefilled automatically.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentFormFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <label className="text-sm font-medium text-[#1A1A1A]">{field.label}</label>
                          {(() => {
                            const fieldValue = field.key === "legalName" ? typedFullName : formData[field.key] || "";
                            const applicationProvidedValue =
                              field.key === "legalName"
                                ? canonicalLockedFormData.legalName
                                : canonicalLockedFormData[field.key as keyof typeof canonicalLockedFormData];
                            const isLockedFromApplication = Boolean(applicationProvidedValue);
                            const isDisabled = acceptanceAlreadyRecorded || field.readOnly || isLockedFromApplication;

                            return (
                          <Input
                            value={fieldValue}
                            disabled={isDisabled}
                            onChange={(event) => {
                              if (field.key === "legalName") {
                                setTypedFullName(event.target.value);
                                setFormData((value) => ({ ...value, legalName: event.target.value }));
                                return;
                              }
                              if (field.key === "idNumber") {
                                const nextId = event.target.value;
                                setFormData((value) => ({
                                  ...value,
                                  idNumber: nextId,
                                  dateOfBirth: deriveDateOfBirthFromSouthAfricanId(nextId),
                                }));
                                return;
                              }
                              setFormData((value) => ({ ...value, [field.key]: event.target.value }));
                            }}
                            placeholder={field.placeholder}
                            className={isDisabled ? "border-[#E7D5C8] bg-[#F7EFE7] text-[#8A7A70]" : "border-[#E7D5C8] bg-white"}
                          />
                            );
                          })()}
                          {Boolean(
                            (field.key === "legalName"
                              ? canonicalLockedFormData.legalName
                              : canonicalLockedFormData[field.key as keyof typeof canonicalLockedFormData]) && !acceptanceAlreadyRecorded
                          ) ? (
                            <p className="text-xs text-[#8A7A70]">{currentStep === 2 && previousAcceptanceDerivedFormData[field.key as keyof typeof previousAcceptanceDerivedFormData] ? "Locked to the accepted details from Step 1." : "Locked to the tutor application record."}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div
                  className="agreement-reader mt-8"
                  dangerouslySetInnerHTML={{ __html: renderAgreementHtmlStrict(hydratedDocumentContent || "No document content available.", currentDocument.code) }}
                />
              </div>
            </div>
            <div className="shrink-0 border-t border-[#E7D5C8] bg-white px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm">Read progress: {readerPercent}%</p>
                  <p className="text-xs text-[#6B5B52]">Reach the end of the document to unlock the acceptance workspace.</p>
                </div>
                <Button type="button" className="w-full bg-[#E63946] text-white hover:bg-[#cf2e3c] sm:w-auto" disabled={readerPercent < 99} onClick={() => { setHasCompletedReading(true); setReaderOpen(false); }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Continue to acceptance
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
