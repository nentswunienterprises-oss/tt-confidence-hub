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

function renderAgreementHtml(content: string) {
  const lines = content.split("\n").map((line) => line.trimEnd());
  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push(`<p>${escapeHtml(paragraphLines.join(" "))}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^(SECTION [A-Z]|[0-9]+\.)/.test(line) || /^[A-Z][A-Z0-9\s/&(),.-]{8,}$/.test(line)) {
      flushParagraph();
      flushList();
      const tag = /^(SECTION [A-Z]|[0-9]+\.)/.test(line) ? "h2" : "h1";
      blocks.push(`<${tag}>${escapeHtml(line)}</${tag}>`);
      continue;
    }

    if (/^\[.\]/.test(line) || /^(employment|partnership|joint venture|agency|copy|reproduce|distribute|teach outside TT|income|student allocation|session volume|withhold payment|reverse payment|adjust payment|audit sessions|review recordings|evaluate performance|conduct|session execution|TT Operating System \(TT-OS\) compliance|operational performance within the platform)$/i.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^\[[^\]]*\]\s*/, ""));
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.join("");
}

function normalizeValue(value: unknown) {
  return String(value ?? "").trim();
}

function buildInitialFormData(fields: FieldDefinition[], application: any, acceptance: any) {
  const savedForm = acceptance?.formSnapshotJson || acceptance?.form_snapshot_json || {};
  const initial: Record<string, string> = {
    legalName: normalizeValue(
      acceptance?.typedFullName ||
      acceptance?.typed_full_name ||
      application?.fullName ||
      application?.full_name
    ),
    emailAddress: normalizeValue(application?.email),
    phoneNumber: normalizeValue(application?.phone),
    idNumber: normalizeValue(application?.idNumber || application?.id_number),
    matricYear: normalizeValue(application?.matricYear || application?.matric_year),
    schoolName: normalizeValue(application?.school || application?.schoolName || application?.school_name),
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

function hydrateDocumentContent(content: string, fieldValues: Record<string, string>) {
  const replacements: Array<[RegExp, string]> = [
    [/Full Name:\s*_+/i, `Full Name: ${fieldValues.legalName || "______________________________"}`],
    [/Contact Number:\s*_+/i, `Contact Number: ${fieldValues.phoneNumber || "______________________________"}`],
    [/Date of Birth:\s*_+/i, `Date of Birth: ${fieldValues.dateOfBirth || "______________________________"}`],
    [/Email Address:\s*_+/i, `Email Address: ${fieldValues.emailAddress || "______________________________"}`],
    [/ID Number:\s*_+/i, `ID Number: ${fieldValues.idNumber || "______________________________"}`],
    [/School Attended \(Matric\):\s*_+/i, `School Attended (Matric): ${fieldValues.schoolName || "______________________________"}`],
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
  const documentVersion = acceptance?.documentVersion || acceptance?.document_version || document.version;
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
      <div class="agreement-body">${renderAgreementHtml(hydrateDocumentContent(document.content || "", { ...formData, legalName: acceptedName }))}</div>
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
    { key: "emailAddress", label: "Email address", placeholder: "Loaded from your TT account", readOnly: true },
    { key: "phoneNumber", label: "Phone number", placeholder: "Enter your contact number" },
    { key: "idNumber", label: "ID number", placeholder: "Enter your South African ID number" },
  ],
  2: [
    { key: "legalName", label: "Full legal name", placeholder: "Enter your full legal name" },
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
  const currentStep = getCurrentStep(documentsStatus);
  const currentDocument = data?.documents?.find((entry) => entry.step === currentStep);
  const currentAcceptance = acceptanceMap[String(currentStep)];
  const currentFormFields = DOCUMENT_FORM_FIELDS[currentStep] || [];
  const currentStatus = documentsStatus[String(currentStep)];
  const uploadReady = currentStep === 6 || Boolean(acceptanceMap["2"]);
  const isUploadStep = currentStep === 2 || currentStep === 6;
  const isAcceptanceStep = Boolean(currentDocument?.requiresAcceptance);
  const acceptanceAlreadyRecorded = Boolean(currentAcceptance);
  const allApproved = Object.values(documentsStatus).every((value) => value === "approved");

  const statusLabel =
    currentStep === 2 && currentStatus === "pending_upload" && currentAcceptance
      ? "accepted - waiting for certificate upload"
      : currentStep !== 6 && currentStatus === "pending_upload"
        ? "awaiting acceptance"
        : String(currentStatus).replace(/_/g, " ");

  const initialFormData = useMemo(
    () => buildInitialFormData(currentFormFields, liveApplication, currentAcceptance),
    [currentFormFields, liveApplication, currentAcceptance]
  );
  const hydratedDocumentContent = useMemo(
    () => hydrateDocumentContent(currentDocument?.content || "", { ...initialFormData, ...formData, legalName: typedFullName || initialFormData.legalName || "" }),
    [currentDocument, initialFormData, formData, typedFullName]
  );

  useEffect(() => {
    const fallbackName = liveApplication?.fullName || liveApplication?.full_name || "";
    setTypedFullName(currentAcceptance?.typedFullName || currentAcceptance?.typed_full_name || initialFormData.legalName || fallbackName);
    setFormData(initialFormData);
    setGeneralRead(false);
    setGeneralBound(false);
    setClauseChecks(
      Object.fromEntries((currentDocument?.mandatoryClauses || []).map((clause) => [clause.key, false]))
    );
    setReaderPercent(0);
    setHasCompletedReading(Boolean(currentAcceptance));
    setViewStartedAt(null);
    setViewCompletedAt(null);
    setSelectedFile(null);
    setReaderOpen(false);
  }, [currentStep, currentAcceptance, currentDocument, liveApplication, initialFormData]);

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
    const maxScroll = Math.max(node.scrollHeight - node.clientHeight, 1);
    const percent = Math.min(100, Math.round((node.scrollTop / maxScroll) * 100));
    setReaderPercent(percent);
    if (percent >= 99) setViewCompletedAt((current) => current || new Date().toISOString());
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

  if (isLoading || !currentDocument) {
    return <Card><CardContent className="py-10 text-sm text-muted-foreground">Loading onboarding documents...</CardContent></Card>;
  }

  if (allApproved) {
    return <Card className="border-green-200 bg-green-50"><CardContent className="py-8 text-sm text-green-800">All onboarding steps are complete. TT is matching you to a pod.</CardContent></Card>;
  }

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Step {currentStep} of 6</CardTitle>
              <CardDescription>{currentDocument.title}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{currentDocument.code}</Badge>
              <Badge variant="outline">Version {currentDocument.version}</Badge>
              <Badge variant="outline">{statusLabel}</Badge>
            </div>
          </div>
          <Progress value={(currentStep / 6) * 100} />
        </CardHeader>

        <CardContent className="space-y-6">
          {isAcceptanceStep ? (
            <div className="rounded-2xl border bg-slate-950 p-4 text-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Read the full document first</p>
                  <p className="text-sm text-slate-300">The agreement opens full screen. Once you reach the end, you return here to complete the acceptance workspace.</p>
                </div>
                <Button onClick={openReader} className="bg-white text-slate-950 hover:bg-slate-200">
                  <Expand className="mr-2 h-4 w-4" />
                  Open full-screen document
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
                <span>Read progress: {readerPercent}%</span>
                <span>{hasCompletedReading ? "Review complete" : "Acceptance remains locked until you finish reading"}</span>
              </div>
            </div>
          ) : null}

          {isAcceptanceStep ? (
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
                <Button disabled={!canAccept || acceptMutation.isPending || acceptanceAlreadyRecorded} onClick={() => acceptMutation.mutate()} className="w-full">
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
                  <Button variant="outline" onClick={openReader}><FileText className="mr-2 h-4 w-4" />Review again</Button>
                  <Button variant="outline" disabled={!acceptanceAlreadyRecorded} onClick={downloadCopy}><Download className="mr-2 h-4 w-4" />Download accepted copy</Button>
                </div>
              </div>
            </div>
          ) : null}

          {isUploadStep ? (
            <div className="rounded-2xl border p-4">
              <p className="font-medium">{currentDocument.uploadTitle || "Required upload"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{currentDocument.uploadDescription}</p>
              {currentStep === 2 && !uploadReady ? <p className="mt-3 text-sm text-amber-700">Accept TT-EQV-002 first. The certified Matric certificate upload unlocks immediately after acceptance.</p> : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={!uploadReady || uploadMutation.isPending || currentStatus === "pending_review"} onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                <Button disabled={!selectedFile || !uploadReady || uploadMutation.isPending || currentStatus === "pending_review"} onClick={() => uploadMutation.mutate()}>
                  {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload file
                </Button>
              </div>
              {currentStatus === "pending_review" ? <p className="mt-3 text-sm text-muted-foreground">Your upload is with COO for review now.</p> : null}
              {currentStatus === "rejected" ? <p className="mt-3 text-sm text-red-700">{liveApplication?.[`doc${currentStep}SubmissionRejectionReason`] || liveApplication?.[`doc_${currentStep}_submission_rejection_reason`] || "Your upload was rejected. Review the reason and upload a corrected file."}</p> : null}
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
            }

            .agreement-reader li {
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
              <DialogDescription className="text-[#6B5B52]">{currentDocument.code} • version {currentDocument.version}</DialogDescription>
            </DialogHeader>
            <div ref={readerRef} onScroll={handleReaderScroll} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FFF5ED] px-3 py-4 touch-pan-y sm:px-6 sm:py-6">
              <div className="mx-auto max-w-4xl rounded-2xl border border-[#E7D5C8] bg-white px-4 py-6 text-[#1A1A1A] shadow-[0_18px_50px_rgba(230,57,70,0.08)] sm:px-10 sm:py-10">
                <div className="border-b border-[#E7D5C8] pb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E63946]">Territorial Tutoring Onboarding Document</p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">{currentDocument.title}</h1>
                  <p className="mt-2 text-xs text-[#6B5B52] sm:text-sm">
                    {currentDocument.code} • Version {currentDocument.version}
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
                          <Input
                            value={field.key === "legalName" ? typedFullName : formData[field.key] || ""}
                            disabled={acceptanceAlreadyRecorded || field.readOnly}
                            onChange={(event) => {
                              if (field.key === "legalName") {
                                setTypedFullName(event.target.value);
                                setFormData((value) => ({ ...value, legalName: event.target.value }));
                                return;
                              }
                              setFormData((value) => ({ ...value, [field.key]: event.target.value }));
                            }}
                            placeholder={field.placeholder}
                            className={field.readOnly ? "border-[#E7D5C8] bg-[#F7EFE7] text-[#8A7A70]" : "border-[#E7D5C8] bg-white"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div
                  className="agreement-reader mt-8"
                  dangerouslySetInnerHTML={{ __html: renderAgreementHtml(hydratedDocumentContent || "No document content available.") }}
                />
              </div>
            </div>
            <div className="shrink-0 border-t border-[#E7D5C8] bg-white px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm">Read progress: {readerPercent}%</p>
                  <p className="text-xs text-[#6B5B52]">Reach the end of the document to unlock the acceptance workspace.</p>
                </div>
                <Button className="w-full bg-[#E63946] text-white hover:bg-[#cf2e3c] sm:w-auto" disabled={readerPercent < 99} onClick={() => { setHasCompletedReading(true); setReaderOpen(false); }}>
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
