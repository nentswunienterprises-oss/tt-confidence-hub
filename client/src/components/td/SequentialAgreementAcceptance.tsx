import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Expand, FileCheck, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { renderAgreementHtmlStrict } from "@/components/tutor/SequentialDocumentSubmission";

type Clause = {
  key: string;
  label: string;
};

type DocumentDefinition = {
  step: number;
  code: string;
  title: string;
  version: string;
  mandatoryClauses: Clause[];
  content: string;
  contentHash: string;
};

type Props = {
  applicationId: string;
  applicationStatus: any;
};

const DEFAULT_STATUSES: Record<string, string> = {
  "1": "pending_upload",
  "2": "not_started",
  "3": "not_started",
  "4": "not_started",
  "5": "not_started",
  "6": "not_started",
};

const TD_STEP_META: Record<number, { code: string; shortTitle: string }> = {
  1: { code: "TT-TDA-001", shortTitle: "Contractor Agreement" },
  2: { code: "TT-CEA-002", shortTitle: "Compliance Agreement" },
  3: { code: "TT-AID-003", shortTitle: "Audit Declaration" },
  4: { code: "TT-HTQ-004", shortTitle: "HTQ Addendum" },
  5: { code: "TT-PSA-005", shortTitle: "Scorecard Acknowledgement" },
  6: { code: "TT-CSP-006", shortTitle: "Confidentiality" },
};

function normalizeValue(value: unknown) {
  return String(value ?? "").trim();
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
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

function normalizeDocumentText(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€“|â€”/g, "-")
    .replace(/â†’/g, " -> ")
    .replace(/\u0000/g, "")
    .replace(/\uFFFD/g, "")
    .trim();
}

function buildTdFieldValues(applicationStatus: any, typedNameOverride?: string) {
  const now = new Date();
  const day = String(now.getDate());
  const month = now.toLocaleString("en-ZA", { month: "long" });
  const year = String(now.getFullYear());

  return {
    legalName: normalizeValue(
      typedNameOverride ||
      applicationStatus?.fullName ||
      applicationStatus?.full_name ||
      applicationStatus?.name
    ),
    city: normalizeValue(applicationStatus?.city),
    effectiveDate: now.toLocaleDateString("en-ZA"),
    day,
    month,
    year,
  };
}

function hydrateTdDocumentContent(content: string, fieldValues: ReturnType<typeof buildTdFieldValues>) {
  const legalName = fieldValues.legalName || "______________________________________";
  const effectiveDate = fieldValues.effectiveDate || "______________________";
  const city = fieldValues.city || "__________________________";
  const day = fieldValues.day || "______";
  const month = fieldValues.month || "______________";
  const year = fieldValues.year || "2026";

  let next = normalizeDocumentText(content);
  next = next.replace(/and\s*\n\s*_+\s*\([^)]*Territory Director[^)]*\)/i, `and\n${legalName} ("Territory Director")`);
  next = next.replace(/Effective Date:\s*_+/i, `Effective Date: ${effectiveDate}`);
  next = next.replace(
    /Signed at\s*_+\s*on this\s*_+\s*day of\s*_+\s*(\d{4})\./i,
    `Signed at ${city} on this ${day} day of ${month} ${year}.`
  );
  next = next.replace(/_+\s*\n\s*Territory Director/i, `${legalName}\nTerritory Director`);
  next = next.replace(/TT Representative Signature:\s*_+/i, `TT Representative Signature: ______________________`);
  next = next.replace(/Date:\s*_+/i, `Date: ${effectiveDate}`);
  return next;
}

function stripTdTemplateScaffold(content: string) {
  return normalizeDocumentText(content)
    .replace(/^TT-[A-Z-0-9]+\s+-\s+.*\n?/i, "")
    .replace(/^AGREEMENT\s*\n?/i, "")
    .replace(/^This Agreement is entered into between:?\s*\n?/i, "")
    .replace(/^This Declaration is entered into between:?\s*\n?/i, "")
    .replace(/^This Addendum is entered into between:?\s*\n?/i, "")
    .replace(/^Territorial Tutoring SA \(Pty\) Ltd.*\n?/im, "")
    .replace(/^and\s*\n?/im, "")
    .replace(/^.*Territory Director.*\n?/im, "")
    .replace(/^Effective Date:.*\n?/im, "")
    .replace(/\nSigned at .*$/is, "")
    .replace(/\nDocument Reference:.*$/is, "")
    .trim();
}

function DocumentContent({ content, legalName, effectiveDate, documentCode }: { content: string; legalName: string; effectiveDate: string; documentCode: string }) {
  const agreementHtml = useMemo(
    () => renderAgreementHtmlStrict(stripTdTemplateScaffold(content), documentCode),
    [content, documentCode]
  );

  return (
    <div className="space-y-4 text-sm leading-7 text-[#1A1A1A]">
      <div className="rounded-2xl border border-[#E7D5C8] bg-[#FFF8F4] p-4 sm:p-5">
        <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-[#7b341e]">Agreement Parties</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7A70]">Party A</p>
            <p className="text-[#1A1A1A]">Territorial Tutoring SA (Pty) Ltd ("TT")</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7A70]">Party B</p>
            <p className="text-[#1A1A1A]">{legalName || "Territory Director"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7A70]">Effective Date</p>
            <p className="text-[#1A1A1A]">{effectiveDate}</p>
          </div>
        </div>
      </div>
      <div className="agreement-reader" dangerouslySetInnerHTML={{ __html: agreementHtml }} />
    </div>
  );
}

function buildAcceptedCopyHtml(params: {
  document: DocumentDefinition;
  acceptance: any;
  applicationStatus: any;
}) {
  const { document, acceptance, applicationStatus } = params;
  const acceptedAt = acceptance?.acceptedAt || acceptance?.accepted_at || null;
  const acceptedName = normalizeValue(
    acceptance?.typedFullName ||
    acceptance?.typed_full_name ||
    applicationStatus?.fullName ||
    applicationStatus?.full_name
  ) || "Not available";
  const acceptedClauses = acceptance?.acceptedClausesJson || acceptance?.accepted_clauses_json || [];
  const acceptedClauseRows = (document.mandatoryClauses || [])
    .filter((clause) => acceptedClauses.includes(clause.key))
    .map((clause) => `<li>${escapeHtml(clause.label)}</li>`)
    .join("");
  const hydratedContent = hydrateTdDocumentContent(
    acceptance?.documentSnapshot || acceptance?.document_snapshot || document.content,
    buildTdFieldValues(applicationStatus, acceptedName)
  );

  const bodyHtml = renderToStaticMarkup(
    <div className="accepted-copy-body">
      <DocumentContent
        content={hydratedContent}
        legalName={acceptedName}
        effectiveDate={buildTdFieldValues(applicationStatus, acceptedName).effectiveDate}
        documentCode={document.code}
      />
    </div>
  );

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(document.code)} Accepted Copy</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    body { margin: 0; background: #efe7dc; color: #1f2933; font-family: Georgia, "Times New Roman", serif; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fffdf8; padding: 18mm 16mm; box-sizing: border-box; }
    .eyebrow { font: 600 11px/1.4 Arial, sans-serif; letter-spacing: 0.18em; text-transform: uppercase; color: #8b2c1f; }
    h1 { margin: 10px 0 6px; font-size: 28px; line-height: 1.15; }
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
    .accepted-copy-body h2 { margin: 18px 0 8px; font: 700 14px/1.4 Arial, sans-serif; color: #7b341e; }
    .accepted-copy-body p { margin: 0 0 10px; font: 400 13px/1.7 Arial, sans-serif; color: #243b53; }
    .accepted-copy-body ul { margin: 0 0 10px 18px; padding: 0; }
    .accepted-copy-body li { margin-bottom: 5px; font: 400 13px/1.6 Arial, sans-serif; color: #243b53; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd3c5; font: 400 11px/1.5 Arial, sans-serif; color: #7b8794; }
  </style>
</head>
<body>
  <main class="page">
    <div class="eyebrow">Territorial Tutoring Accepted Agreement Copy</div>
    <h1>${escapeHtml(document.title)}</h1>
    <p class="subhead">${escapeHtml(document.code)} | Version ${escapeHtml(normalizeValue(document.version) || "1")} | Accepted in-app against the TD account</p>

    <section class="summary">
      <div class="summary-label">Acceptance record</div>
      <div class="summary-grid">
        <div><div class="summary-label">Accepted by</div><div class="summary-value">${escapeHtml(acceptedName)}</div></div>
        <div><div class="summary-label">Accepted at</div><div class="summary-value">${escapeHtml(formatAcceptedAt(acceptedAt))}</div></div>
        <div><div class="summary-label">Email</div><div class="summary-value">${escapeHtml(normalizeValue(applicationStatus?.email) || "Not available")}</div></div>
        <div><div class="summary-label">Phone</div><div class="summary-value">${escapeHtml(normalizeValue(applicationStatus?.phone) || "Not available")}</div></div>
      </div>
    </section>

    ${acceptedClauseRows ? `<section class="section"><h2 class="section-title">Acknowledged Clauses</h2><ul class="clauses">${acceptedClauseRows}</ul></section>` : ""}

    <section class="section">
      <h2 class="section-title">Accepted Agreement Text</h2>
      ${bodyHtml}
    </section>

    <div class="footer">
      This accepted copy was generated from TT's stored TD onboarding acceptance record. It reflects the versioned in-app agreement text and acceptance evidence held at the time of assent.
    </div>
  </main>
</body>
</html>`;
}

export function TdSequentialAgreementAcceptance({ applicationId, applicationStatus }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const readerRef = useRef<HTMLDivElement | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerSession, setReaderSession] = useState(0);
  const [readerPercent, setReaderPercent] = useState(0);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);
  const [viewStartedAt, setViewStartedAt] = useState<string | null>(null);
  const [viewCompletedAt, setViewCompletedAt] = useState<string | null>(null);
  const [typedFullName, setTypedFullName] = useState("");
  const [generalRead, setGeneralRead] = useState(false);
  const [generalBound, setGeneralBound] = useState(false);
  const [clauseChecks, setClauseChecks] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery<{ applicationId: string; documents: DocumentDefinition[] }>({
    queryKey: ["/api/td/onboarding-documents", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/td/onboarding-documents`, { credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Failed to load TD documents");
      return payload;
    },
  });

  const documentsStatus = useMemo(
    () => ({ ...DEFAULT_STATUSES, ...(applicationStatus?.documentsStatus || applicationStatus?.documents_status || {}) }),
    [applicationStatus]
  );
  const acceptanceMap = applicationStatus?.onboardingAcceptanceMap || {};

  const currentStep = useMemo(() => {
    for (const step of [1, 2, 3, 4, 5, 6]) {
      if (documentsStatus[String(step)] !== "approved") return step;
    }
    return 6;
  }, [documentsStatus]);

  const currentDocument = data?.documents?.find((document) => document.step === currentStep);
  const currentAcceptance = acceptanceMap[String(currentStep)];
  const acceptanceAlreadyRecorded = Boolean(currentAcceptance);
  const currentStatus = documentsStatus[String(currentStep)] || "not_started";
  const allApproved = ["1", "2", "3", "4", "5", "6"].every((step) => documentsStatus[step] === "approved");
  const acceptanceResetKey = `${currentStep}:${currentAcceptance?.acceptedAt || currentAcceptance?.accepted_at || "pending"}`;
  const hydratedDocumentContent = useMemo(
    () => hydrateTdDocumentContent(currentDocument?.content || "", buildTdFieldValues(applicationStatus, typedFullName)),
    [currentDocument, applicationStatus, typedFullName]
  );

  useEffect(() => {
    const nextName = normalizeValue(
      currentAcceptance?.typedFullName ||
      currentAcceptance?.typed_full_name ||
      applicationStatus?.fullName ||
      applicationStatus?.full_name ||
      applicationStatus?.name
    );

    setTypedFullName(nextName);
    setGeneralRead(false);
    setGeneralBound(false);
    setClauseChecks(Object.fromEntries((currentDocument?.mandatoryClauses || []).map((clause) => [clause.key, false])));
    setReaderPercent(0);
    setHasCompletedReading(Boolean(currentAcceptance));
    setViewStartedAt(null);
    setViewCompletedAt(currentAcceptance ? currentAcceptance?.viewCompletedAt || currentAcceptance?.view_completed_at || null : null);
    setReaderOpen(false);
  }, [acceptanceResetKey, applicationStatus, currentAcceptance, currentDocument]);

  const handleReaderScroll = () => {
    const node = readerRef.current;
    if (!node) return;

    if (node.scrollHeight <= node.clientHeight + 8) {
      setReaderPercent(100);
      setViewCompletedAt((current) => current || new Date().toISOString());
      return;
    }

    const maxScrollTop = node.scrollHeight - node.clientHeight;
    const percent = Math.min(100, Math.max(0, Math.round((node.scrollTop / maxScrollTop) * 100)));
    setReaderPercent(percent);

    if (percent >= 99) {
      setViewCompletedAt((current) => current || new Date().toISOString());
    }
  };

  const resetReaderPosition = () => {
    const node = readerRef.current;
    if (!node) return;
    node.scrollTop = 0;
    node.focus({ preventScroll: true });
    handleReaderScroll();
  };

  useEffect(() => {
    if (!readerOpen || viewStartedAt || acceptanceAlreadyRecorded) return;
    setViewStartedAt(new Date().toISOString());
  }, [acceptanceAlreadyRecorded, readerOpen, viewStartedAt]);

  useEffect(() => {
    if (!readerOpen) return;
    const timer = window.setTimeout(resetReaderPosition, 80);
    return () => window.clearTimeout(timer);
  }, [readerOpen, currentDocument?.step, readerSession]);

  useEffect(() => {
    if (!readerOpen) return;

    const rafOne = window.requestAnimationFrame(resetReaderPosition);
    const rafTwo = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resetReaderPosition);
    });
    const timer = window.setTimeout(resetReaderPosition, 220);

    return () => {
      window.cancelAnimationFrame(rafOne);
      window.cancelAnimationFrame(rafTwo);
      window.clearTimeout(timer);
    };
  }, [readerOpen, readerSession]);

  const mandatoryClausesAccepted = (currentDocument?.mandatoryClauses || []).every((clause) => clauseChecks[clause.key]);
  const canAccept =
    !acceptanceAlreadyRecorded &&
    hasCompletedReading &&
    generalRead &&
    generalBound &&
    mandatoryClausesAccepted &&
    typedFullName.trim().length > 1;

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!currentDocument) throw new Error("No agreement loaded");

      const acceptedClauseKeys = currentDocument.mandatoryClauses
        .filter((clause) => clauseChecks[clause.key])
        .map((clause) => clause.key);

      const response = await fetch(`${API_URL}/api/td/onboarding-documents/${currentDocument.step}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId,
          documentVersion: currentDocument.version,
          documentHash: currentDocument.contentHash,
          typedFullName,
          acceptedClauseKeys,
          acceptedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language,
          platform: "web",
          sourceFlow: `td_gateway_step_${currentDocument.step}`,
          formData: {
            typedFullName,
            email: applicationStatus?.email || "",
            phone: applicationStatus?.phone || "",
          },
          scrollCompletionPercent: Math.max(readerPercent, 100),
          viewStartedAt,
          viewCompletedAt: viewCompletedAt || new Date().toISOString(),
          acceptClickedAt: new Date().toISOString(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Failed to accept agreement");
      return payload;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/td/application-status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/gateway-session"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/onboarding-documents", applicationId] }),
      ]);
      toast({
        title: "Agreement accepted",
        description: "The next TD onboarding step is now unlocked.",
      });
      setReaderOpen(false);
      window.requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to accept agreement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadAcceptedCopyFor = (document: DocumentDefinition, acceptance: any) => {
    if (!document || !acceptance) return;
    const html = buildAcceptedCopyHtml({ document, acceptance, applicationStatus });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.code}-accepted-copy.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (allApproved) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="space-y-6 py-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">All TD agreements completed</h3>
            <p className="mt-2 text-sm text-muted-foreground">Every TD onboarding agreement has been accepted and recorded.</p>
          </div>

          {data?.documents?.length ? (
            <div className="rounded-2xl border p-4">
              <div className="mb-4">
                <p className="font-medium">Accepted documents</p>
                <p className="text-sm text-muted-foreground">Download a clean accepted copy for any agreement you have completed.</p>
              </div>
              <div className="space-y-3">
                {data.documents
                  .filter((document) => acceptanceMap[String(document.step)])
                  .map((document) => {
                    const acceptance = acceptanceMap[String(document.step)];
                    const acceptedAt = acceptance?.acceptedAt || acceptance?.accepted_at;
                    return (
                      <div key={document.step} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium">{document.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.code} • Version {normalizeValue(acceptance?.documentVersion || acceptance?.document_version || document.version)}
                          </p>
                          {acceptedAt ? <p className="text-xs text-muted-foreground">Accepted {new Date(acceptedAt).toLocaleString()}</p> : null}
                        </div>
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => downloadAcceptedCopyFor(document, acceptance)}>
                          <Download className="mr-2 h-4 w-4 shrink-0" />
                          Download accepted copy
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !currentDocument) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">Loading onboarding documents...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <div ref={containerRef}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Step {currentStep} of 6</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{currentDocument.title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{currentDocument.code}</Badge>
                <Badge variant="outline">Version {normalizeValue(currentDocument.version) || "1"}</Badge>
                <Badge variant="outline">{statusLabel(currentStatus)}</Badge>
              </div>
            </div>
            <Progress value={(currentStep / 6) * 100} />
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((step) => {
                const status = documentsStatus[String(step)];
                const meta = TD_STEP_META[step];
                const tone =
                  status === "approved"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : step === currentStep
                      ? "border-[#E63946]/30 bg-[#FFF3F1] text-[#9F1D2B]"
                      : "border-slate-200 bg-white text-slate-600";

                return (
                  <div key={step} className={`min-w-0 rounded-xl border p-3 ${tone}`}>
                    <p className="text-[11px] uppercase tracking-wide">{meta.code}</p>
                    <p className="text-sm font-semibold leading-tight">
                      {status === "approved" ? "Accepted" : step === currentStep ? "Current" : statusLabel(status)}
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-current/80">{meta.shortTitle}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#E7D5C8] bg-[#FFF5ED] p-4 text-[#1A1A1A] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Agreement review</p>
                  <p className="text-sm text-[#6B5B52]">Open the agreement, review the full text, scroll to the end, then return here to unlock acceptance.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setReaderSession((current) => current + 1);
                    setReaderOpen(true);
                  }}
                  className="w-full bg-[#E63946] text-white hover:bg-[#cf2e3c] sm:w-auto"
                >
                  <Expand className="mr-2 h-4 w-4" />
                  Open agreement
                </Button>
              </div>
              <div className="mt-4 flex flex-col gap-1 text-xs text-[#6B5B52] sm:flex-row sm:flex-wrap sm:gap-3">
                <span>Read progress: {readerPercent}%</span>
                <span>{hasCompletedReading ? "Reader completed" : "Acceptance remains locked until the agreement is fully read"}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4 rounded-2xl border p-4">
                <div>
                  <p className="font-medium">Acceptance workspace</p>
                  <p className="text-sm text-muted-foreground">This area unlocks only after the agreement reader is completed.</p>
                </div>

                <div className="grid gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="td-typed-full-name">Acceptance name</Label>
                    <Input
                      id="td-typed-full-name"
                      value={typedFullName}
                      disabled
                      placeholder="Captured from the TD application"
                    />
                  </div>

                  {currentDocument.mandatoryClauses.length ? (
                    <div className="space-y-3 rounded-xl border border-[#E7D5C8] bg-[#FFF8F4] p-4">
                      <div>
                        <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-[#7b341e]">Mandatory Clauses</p>
                        <p className="mt-1 text-sm text-[#6B5B52]">Each clause must be acknowledged before this TD agreement can be accepted.</p>
                      </div>

                      <div className="space-y-3">
                        {currentDocument.mandatoryClauses.map((clause, index) => (
                          <label key={clause.key} className="flex items-start gap-3 rounded-xl border border-[#E7D5C8] bg-white p-3 text-sm">
                            <Checkbox
                              checked={clauseChecks[clause.key] || false}
                              disabled={!hasCompletedReading || acceptanceAlreadyRecorded}
                              onCheckedChange={(value) => setClauseChecks((current) => ({ ...current, [clause.key]: Boolean(value) }))}
                            />
                            <span className="space-y-1">
                              <span className="block font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#7b341e]">
                                Clause {index + 1}
                              </span>
                              <span className="block text-[#1A1A1A]">{clause.label}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox
                      checked={generalRead}
                      disabled={!hasCompletedReading || acceptanceAlreadyRecorded}
                      onCheckedChange={(value) => setGeneralRead(Boolean(value))}
                    />
                    <span>I have read and understood this agreement.</span>
                  </label>

                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox
                      checked={generalBound}
                      disabled={!hasCompletedReading || acceptanceAlreadyRecorded}
                      onCheckedChange={(value) => setGeneralBound(Boolean(value))}
                    />
                    <span>I agree to be legally bound by these terms and understand TT will store an audit record of this acceptance.</span>
                  </label>
                </div>

                <Button type="button" disabled={!canAccept || acceptMutation.isPending} onClick={() => acceptMutation.mutate()} className="w-full gap-2">
                  {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                  {acceptMutation.isPending ? "Accepting..." : "Accept and continue"}
                </Button>
              </div>

              <div className="space-y-4 rounded-2xl border p-4">
                <div>
                  <p className="font-medium">Captured details</p>
                  <p className="text-sm text-muted-foreground">The agreement is tied to the submitted TD application and stored with the acceptance record.</p>
                </div>
                <div className="space-y-3 rounded-xl bg-[#FFF8F4] p-4 text-sm text-[#5A5A5A]">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Full legal name</p>
                    <p>{typedFullName || "Pending"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Email address</p>
                    <p>{applicationStatus?.email || "Pending"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Phone number</p>
                    <p>{applicationStatus?.phone || "Pending"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Current status</p>
                    <p>{statusLabel(currentStatus)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setReaderSession((current) => current + 1);
                      setReaderOpen(true);
                    }}
                  >
                    <Expand className="mr-2 h-4 w-4" />
                    Review again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full whitespace-normal text-left sm:w-auto sm:whitespace-nowrap sm:text-center"
                    disabled={!acceptanceAlreadyRecorded}
                    onClick={() => currentAcceptance && downloadAcceptedCopyFor(currentDocument, currentAcceptance)}
                  >
                    <Download className="mr-2 h-4 w-4 shrink-0" />
                    Download accepted copy
                  </Button>
                </div>
              </div>
            </div>

            {data?.documents?.some((document) => acceptanceMap[String(document.step)]) ? (
              <div className="rounded-2xl border p-4">
                <div className="mb-4">
                  <p className="font-medium">Accepted documents</p>
                  <p className="text-sm text-muted-foreground">Download a clean accepted copy for any agreement you have already completed.</p>
                </div>
                <div className="space-y-3">
                  {data.documents
                    .filter((document) => acceptanceMap[String(document.step)])
                    .map((document) => {
                      const acceptance = acceptanceMap[String(document.step)];
                      const acceptedAt = acceptance?.acceptedAt || acceptance?.accepted_at;
                      return (
                        <div key={document.step} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-medium">{document.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {document.code} • Version {normalizeValue(acceptance?.documentVersion || acceptance?.document_version || document.version)}
                            </p>
                            {acceptedAt ? <p className="text-xs text-muted-foreground">Accepted {new Date(acceptedAt).toLocaleString()}</p> : null}
                          </div>
                          <div className="w-full sm:w-auto">
                            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => downloadAcceptedCopyFor(document, acceptance)}>
                              <Download className="mr-2 h-4 w-4 shrink-0" />
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
      </div>

      <Dialog open={readerOpen} onOpenChange={setReaderOpen}>
        <DialogContent
          key={`td-reader-${currentDocument.step}-${readerSession}`}
          className="left-1/2 top-1/2 h-[92dvh] w-[calc(100vw-1rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E7D5C8] p-0 shadow-2xl sm:h-[88dvh] sm:w-[calc(100vw-3rem)]"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            window.requestAnimationFrame(resetReaderPosition);
          }}
        >
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
              margin: 0 0 0.55rem;
              padding-top: 1.35rem;
              border-top: 1px solid #e7d5c8;
              font-size: 0.9rem;
              line-height: 1.5;
              font-weight: 700;
              color: #7c2d12;
            }

            .agreement-reader h2:first-of-type {
              padding-top: 0;
              border-top: 0;
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
              <p className="text-sm text-[#6B5B52]">{currentDocument.code} • Version {currentDocument.version}</p>
            </DialogHeader>

            <div
              key={`td-reader-scroll-${currentDocument.step}-${readerSession}`}
              ref={readerRef}
              tabIndex={-1}
              onScroll={handleReaderScroll}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FFF5ED] px-3 py-4 touch-pan-y sm:px-6 sm:py-6"
            >
              <div className="mx-auto max-w-4xl rounded-2xl border border-[#E7D5C8] bg-white px-4 py-6 text-[#1A1A1A] shadow-[0_18px_50px_rgba(230,57,70,0.08)] sm:px-10 sm:py-10">
                <div className="border-b border-[#E7D5C8] pb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E63946]">Territory Director Agreement</p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">{currentDocument.title}</h1>
                  <p className="mt-2 text-xs text-[#6B5B52] sm:text-sm">
                    {currentDocument.code} • Version {currentDocument.version}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-[#E7D5C8] bg-[#FFF5ED] p-4 sm:p-5">
                  <div className="mb-4 space-y-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Agreement record</p>
                    <p className="text-sm text-[#6B5B52]">This agreement acceptance is tied to your TD application identity and stored as an auditable TT record.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="td-reader-name">Full legal name</Label>
                      <Input id="td-reader-name" value={typedFullName} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="td-reader-email">Email address</Label>
                      <Input id="td-reader-email" value={applicationStatus?.email || ""} disabled />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <DocumentContent
                    content={hydratedDocumentContent}
                    legalName={typedFullName || "Territory Director"}
                    effectiveDate={buildTdFieldValues(applicationStatus, typedFullName).effectiveDate}
                    documentCode={currentDocument.code}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#E7D5C8] bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">Read completion</p>
                  <p className="text-sm text-[#6B5B52]">
                    Progress {readerPercent}% {hasCompletedReading ? "• reader complete" : "• scroll to the end to unlock acceptance"}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setReaderOpen(false)}>
                    Close
                  </Button>
                  <Button
                    type="button"
                    className="bg-[#E63946] text-white hover:bg-[#cf2e3c]"
                    disabled={readerPercent < 99}
                    onClick={() => {
                      setHasCompletedReading(true);
                      setReaderOpen(false);
                    }}
                  >
                    Mark as read
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
