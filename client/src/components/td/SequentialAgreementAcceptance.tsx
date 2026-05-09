import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Expand, FileCheck, Loader2, Upload } from "lucide-react";
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
  requiresAcceptance: boolean;
  requiresUpload: boolean;
  uploadTitle?: string;
  uploadDescription?: string;
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
  "7": "not_started",
};

const TD_STEP_META: Record<number, { code: string; shortTitle: string }> = {
  1: { code: "TT-TDA-001", shortTitle: "Contractor Agreement" },
  2: { code: "TT-CEA-002", shortTitle: "Compliance Agreement" },
  3: { code: "TT-AID-003", shortTitle: "Audit Declaration" },
  4: { code: "TT-HTQ-004", shortTitle: "HTQ Addendum" },
  5: { code: "TT-PSA-005", shortTitle: "Scorecard Acknowledgement" },
  6: { code: "TT-CSP-006", shortTitle: "Confidentiality" },
  7: { code: "TT-TDI-007", shortTitle: "Certified Identification" },
};

function normalizeValue(value: unknown) {
  return String(value ?? "").trim();
}

function getTdIdentificationType(applicationStatus: any) {
  const value = String(applicationStatus?.id_type || applicationStatus?.idType || "").trim().toLowerCase();
  return value === "passport" ? "passport" : "sa_id";
}

function getTdIdentificationLabel(applicationStatus: any) {
  return getTdIdentificationType(applicationStatus) === "passport" ? "Passport" : "South African ID";
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
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
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

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
    for (const step of [1, 2, 3, 4, 5, 6, 7]) {
      if (documentsStatus[String(step)] !== "approved") return step;
    }
    return 7;
  }, [documentsStatus]);

  const currentDocument = data?.documents?.find((document) => document.step === currentStep);
  const currentAcceptance = acceptanceMap[String(currentStep)];
  const acceptanceAlreadyRecorded = Boolean(currentAcceptance);
  const currentStatus = documentsStatus[String(currentStep)] || "not_started";
  const allApproved = ["1", "2", "3", "4", "5", "6", "7"].every((step) => documentsStatus[step] === "approved");
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
    setSelectedUploadFile(null);
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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!currentDocument || !currentDocument.requiresUpload) throw new Error("No upload step is active");
      if (!selectedUploadFile) throw new Error("Choose a file before uploading");

      const base64 = await fileToBase64(selectedUploadFile);
      const response = await fetch(`${API_URL}/api/td/onboarding-documents/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId,
          docStep: currentDocument.step,
          fileName: selectedUploadFile.name,
          fileType: selectedUploadFile.type || "application/octet-stream",
          fileData: base64,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Failed to upload identification");
      return payload;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/td/application-status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/gateway-session"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/onboarding-documents", applicationId] }),
        queryClient.invalidateQueries({ queryKey: ["/api/coo/td-applications"] }),
      ]);
      toast({
        title: "Identification uploaded",
        description: "Your certified identification copy is now pending COO review.",
      });
      setSelectedUploadFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (allApproved) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="space-y-6 py-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">All TD onboarding steps completed</h3>
            <p className="mt-2 text-sm text-muted-foreground">Every TD agreement and identification requirement has been completed and recorded.</p>
          </div>

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
                <CardTitle className="text-xl">Step {currentStep} of 7</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{currentDocument.title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{currentDocument.code}</Badge>
                <Badge variant="outline">Version {normalizeValue(currentDocument.version) || "1"}</Badge>
                <Badge variant="outline">{statusLabel(currentStatus)}</Badge>
              </div>
            </div>
            <Progress value={(currentStep / 7) * 100} />
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => {
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

            {currentDocument.requiresUpload ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4 rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">{currentDocument.uploadTitle || "Identification upload"}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentDocument.uploadDescription || "Upload your certified identification copy for COO review."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E7D5C8] bg-[#FFF5ED] p-4 text-[#1A1A1A] sm:p-5">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Accepted identification type</p>
                      <p className="text-sm text-[#6B5B52]">
                        Upload a certified copy of your {getTdIdentificationLabel(applicationStatus)}. This upload is reviewed by COO before TD access is fully unlocked.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#E7D5C8] bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7A70]">Identification type</p>
                        <p className="mt-2 text-sm text-[#1A1A1A]">{getTdIdentificationLabel(applicationStatus)}</p>
                      </div>
                      <div className="rounded-xl border border-[#E7D5C8] bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7A70]">
                          {getTdIdentificationType(applicationStatus) === "passport" ? "Passport number" : "SA ID number"}
                        </p>
                        <p className="mt-2 text-sm text-[#1A1A1A]">{applicationStatus?.id_number || applicationStatus?.idNumber || "Not captured"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="td-certified-id-upload">
                        {getTdIdentificationType(applicationStatus) === "passport" ? "Certified passport copy" : "Certified South African ID copy"}
                      </Label>
                      <Input
                        id="td-certified-id-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        disabled={currentStatus === "pending_review" || currentStatus === "approved" || uploadMutation.isPending}
                        onChange={(event) => setSelectedUploadFile(event.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a clear certified copy in PDF or image format. Status will move to review once uploaded.
                      </p>
                    </div>

                    {selectedUploadFile ? (
                      <div className="rounded-xl border border-[#E7D5C8] bg-white p-3 text-sm">
                        <p className="font-medium text-[#1A1A1A]">{selectedUploadFile.name}</p>
                        <p className="mt-1 text-muted-foreground">
                          {(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      disabled={!selectedUploadFile || currentStatus === "pending_review" || currentStatus === "approved" || uploadMutation.isPending}
                      onClick={() => uploadMutation.mutate()}
                      className="w-full gap-2"
                    >
                      {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadMutation.isPending ? "Uploading..." : currentStatus === "pending_review" ? "Pending COO review" : currentStatus === "approved" ? "Identification approved" : "Upload identification"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Captured details</p>
                    <p className="text-sm text-muted-foreground">This upload is tied to your submitted TD application identity.</p>
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
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Current file</p>
                      <p>
                        {applicationStatus?.doc_7_submission_url ? (
                          <a href={applicationStatus.doc_7_submission_url} target="_blank" rel="noreferrer" className="text-[#9F1D2B] underline underline-offset-2">
                            Open uploaded copy
                          </a>
                        ) : "No file uploaded yet"}
                      </p>
                    </div>
                    {(applicationStatus?.doc_7_submission_rejection_reason || applicationStatus?.doc7SubmissionRejectionReason) ? (
                      <div>
                        <p className="font-medium text-[#1A1A1A]">Rejection reason</p>
                        <p>{applicationStatus?.doc_7_submission_rejection_reason || applicationStatus?.doc7SubmissionRejectionReason}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
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
                    </div>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {!currentDocument.requiresUpload ? (
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
      ) : null}
    </>
  );
}
