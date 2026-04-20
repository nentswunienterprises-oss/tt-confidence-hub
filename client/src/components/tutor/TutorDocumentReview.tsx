import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";
import { CheckCircle2, ChevronDown, Download, ExternalLink, FileCheck, Loader2, ShieldCheck, XCircle } from "lucide-react";

interface TutorDocumentReviewProps {
  application: any;
  onReview?: () => void;
}

type DocumentStatus =
  | "not_started"
  | "pending_upload"
  | "pending_review"
  | "approved"
  | "rejected";

const AGREEMENT_STEPS = [
  { step: 1, code: "TT-TCF-001", title: "Tutor Consent Form" },
  { step: 2, code: "TT-EQV-002", title: "Entry Qualification Verification" },
  { step: 3, code: "TT-ICA-003", title: "Independent Contractor Agreement" },
  { step: 4, code: "TT-SCP-004", title: "Safeguarding and Conduct Policy" },
  { step: 5, code: "TT-DPC-005", title: "Data Protection / POPIA Consent" },
] as const;

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeDisplayedVersion(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "1";
  if (/^TT-[A-Z]+-\d{3}$/i.test(normalized)) return "1";
  return normalized;
}

function buildAcceptedAgreementHtml(item: { code: string; title: string }, acceptance: any) {
  const acceptedAt = acceptance?.acceptedAt || acceptance?.accepted_at || "";
  const acceptedName = acceptance?.typedFullName || acceptance?.typed_full_name || "Unknown";
  const documentVersion = normalizeDisplayedVersion(acceptance?.documentVersion || acceptance?.document_version || "1");
  const documentChecksum = acceptance?.documentChecksum || acceptance?.document_checksum || "";
  const documentSnapshot = acceptance?.documentSnapshot || acceptance?.document_snapshot || "";
  const formSnapshot = acceptance?.formSnapshotJson || acceptance?.form_snapshot_json || {};
  const acceptedClauses = acceptance?.acceptedClausesJson || acceptance?.accepted_clauses_json || [];

  const formRows = Object.entries(formSnapshot)
    .filter(([, value]) => String(value || "").trim())
    .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(String(value))}</td></tr>`)
    .join("");

  const clauseItems = Array.isArray(acceptedClauses)
    ? acceptedClauses.map((value: string) => `<li>${escapeHtml(String(value))}</li>`).join("")
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(item.code)} Accepted Copy</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    body { margin: 0; background: #efe7d8; color: #1f2933; font-family: Georgia, "Times New Roman", serif; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fffdf8; padding: 18mm 16mm; box-sizing: border-box; }
    .eyebrow { font: 600 11px/1.4 Arial, sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #8b2c1f; }
    h1 { margin: 8px 0 6px; font-size: 28px; line-height: 1.15; }
    .subhead { margin: 0; font: 500 13px/1.6 Arial, sans-serif; color: #52606d; }
    .section { margin-top: 20px; }
    .section-title { margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #d8cfc2; font: 700 14px/1.4 Arial, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: #7b341e; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 9px 10px; border: 1px solid #ddd3c5; vertical-align: top; }
    th { width: 34%; background: #f6efe4; text-align: left; font: 600 12px/1.5 Arial, sans-serif; color: #243b53; }
    td, p, li { font: 400 13px/1.6 Arial, sans-serif; }
    ul { margin: 0 0 0 18px; padding: 0; }
    pre { white-space: pre-wrap; font: 400 13px/1.7 Arial, sans-serif; color: #243b53; margin: 0; }
  </style>
</head>
<body>
  <main class="page">
    <div class="eyebrow">Territorial Tutoring Accepted Agreement Copy</div>
    <h1>${escapeHtml(item.title)}</h1>
    <p class="subhead">${escapeHtml(item.code)} | Version ${escapeHtml(String(documentVersion))}</p>
    <section class="section">
      <h2 class="section-title">Acceptance Record</h2>
      <p>Accepted by: ${escapeHtml(String(acceptedName))}</p>
      <p>Accepted at: ${escapeHtml(String(acceptedAt))}</p>
      <p>Document hash: ${escapeHtml(String(documentChecksum))}</p>
    </section>
    ${formRows ? `<section class="section"><h2 class="section-title">Captured Form Data</h2><table>${formRows}</table></section>` : ""}
    ${clauseItems ? `<section class="section"><h2 class="section-title">Acknowledged Clauses</h2><ul>${clauseItems}</ul></section>` : ""}
    <section class="section">
      <h2 class="section-title">Accepted Agreement Text</h2>
      <pre>${escapeHtml(String(documentSnapshot))}</pre>
    </section>
  </main>
</body>
</html>`;
}

function formatDocStatus(value: string) {
  return String(value || "not_started").replace(/_/g, " ");
}

function getReviewStepLabel(step: string) {
  const labels: Record<string, string> = {
    "1": "TCF",
    "2": "EQV",
    "3": "ICA",
    "4": "SCP",
    "5": "DPC",
    "6": "CID",
  };
  return labels[step] || step;
}

function getReviewStepStatusLabel(params: {
  step: string;
  status: DocumentStatus;
  acceptanceMap: Record<string, any>;
}) {
  const { step, status, acceptanceMap } = params;
  const isAgreementOnlyStep = ["1", "3", "4", "5"].includes(step);

  if (isAgreementOnlyStep) {
    if (acceptanceMap[step]) return "Accepted";
    if (status === "rejected") return "Rejected";
    return "Pending";
  }

  if (step === "2") {
    if (!acceptanceMap["2"]) return "Pending";
    if (status === "approved") return "Approved";
    if (status === "pending_review") return "Review";
    if (status === "rejected") return "Rejected";
    return "Waiting";
  }

  if (step === "6") {
    if (status === "approved") return "Approved";
    if (status === "pending_review") return "Review";
    if (status === "rejected") return "Rejected";
    return "Waiting";
  }

  return formatDocStatus(status);
}

function getCurrentActionSummary(documentsStatus: Record<string, DocumentStatus>, acceptanceMap: Record<string, any>) {
  const matricStatus = documentsStatus["2"];
  const idStatus = documentsStatus["6"];
  const hasDoc2Acceptance = Boolean(acceptanceMap["2"]);

  if (matricStatus === "pending_review") {
    return {
      queueLabel: "Needs review",
      stageTitle: "Certified Matric certificate review",
      stageDescription: "COO review is required now before step 3 can continue.",
    };
  }

  if (idStatus === "pending_review") {
    return {
      queueLabel: "Needs review",
      stageTitle: "Certified ID review",
      stageDescription: "COO review is required now before onboarding can close out.",
    };
  }

  if (["1", "2", "3", "4", "5", "6"].every((step) => documentsStatus[step] === "approved")) {
    return {
      queueLabel: "Complete",
      stageTitle: "Onboarding complete",
      stageDescription: "All agreement and upload steps are verified.",
    };
  }

  if (!acceptanceMap["1"]) {
    return {
      queueLabel: "Waiting on tutor",
      stageTitle: "Agreement 1 not yet accepted",
      stageDescription: "The tutor still needs to begin the in-app onboarding agreements.",
    };
  }

  if (hasDoc2Acceptance && matricStatus === "pending_upload") {
    return {
      queueLabel: "Waiting on tutor",
      stageTitle: "Waiting for certified Matric certificate",
      stageDescription: "The tutor accepted TT-EQV-002 but has not uploaded the certified Matric certificate yet.",
    };
  }

  if (["1", "2", "3", "4", "5"].every((step) => documentsStatus[step] === "approved") && idStatus === "pending_upload") {
    return {
      queueLabel: "Waiting on tutor",
      stageTitle: "Waiting for certified ID copy",
      stageDescription: "All agreements and Matric verification are done. The final certified ID upload is still outstanding.",
    };
  }

  return {
    queueLabel: "Waiting on tutor",
    stageTitle: "Agreement flow in progress",
    stageDescription: "The tutor is still working through the in-app onboarding steps.",
  };
}

export function TutorDocumentReview({ application, onReview }: TutorDocumentReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewStep, setReviewStep] = useState<2 | 6 | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const documentsStatus: Record<string, DocumentStatus> = {
    "1": "pending_upload",
    "2": "not_started",
    "3": "not_started",
    "4": "not_started",
    "5": "not_started",
    "6": "not_started",
    ...(application?.documentsStatus || application?.documents_status || {}),
  };

  const acceptanceMap = application?.onboardingAcceptanceMap || {};
  const fullName = application?.fullName || application?.full_name || "Unknown Tutor";
  const email = application?.email || "No email";
  const acceptedCount = ["1", "3", "4", "5"].filter((step) => documentsStatus[step] === "approved").length;
  const matricStatus = documentsStatus["2"];
  const idStatus = documentsStatus["6"];
  const currentAction = getCurrentActionSummary(documentsStatus, acceptanceMap);
  const currentUploadStep = matricStatus === "pending_review" ? 2 : idStatus === "pending_review" ? 6 : null;
  const queueBadgeClass =
    currentAction.queueLabel === "Needs review"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : currentAction.queueLabel === "Complete"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-slate-100 text-slate-700 border-slate-200";

  const reviewMutation = useMutation({
    mutationFn: async ({ step, approved, rejectionReason: reason }: { step: 2 | 6; approved: boolean; rejectionReason?: string }) => {
      const response = await fetch(`${API_URL}/api/coo/tutor/${application.id}/document/${step}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approved, rejectionReason: reason }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to review onboarding upload");
      }
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
      toast({
        title: "Onboarding Updated",
        description: payload?.message || "Onboarding review saved.",
      });
      setReviewStep(null);
      setRejectionReason("");
      onReview?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openRejectDialog = (step: 2 | 6) => {
    setReviewStep(step);
    setRejectionReason(
      step === 2
        ? application?.doc2SubmissionRejectionReason || application?.doc_2_submission_rejection_reason || ""
        : application?.doc6SubmissionRejectionReason || application?.doc_6_submission_rejection_reason || ""
    );
  };

  const downloadAcceptedAgreement = (item: (typeof AGREEMENT_STEPS)[number], acceptance: any) => {
    const html = buildAcceptedAgreementHtml(item, acceptance);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.code}-accepted-copy.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">{fullName}</CardTitle>
              <CardDescription className="break-all">{email}</CardDescription>
              <p className="text-xs text-muted-foreground">Application Ref: {application.id}</p>
              <p className="text-sm font-medium text-foreground">{currentAction.stageTitle}</p>
              <p className="text-sm text-muted-foreground">{currentAction.stageDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={queueBadgeClass}>{currentAction.queueLabel}</Badge>
              <Badge variant="outline">{acceptedCount}/4 agreements accepted</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
            {[
              { step: "1", label: "TCF" },
              { step: "2", label: "EQV" },
              { step: "3", label: "ICA" },
              { step: "4", label: "SCP" },
              { step: "5", label: "DPC" },
              { step: "6", label: "CID" },
            ].map((item) => {
              const status = documentsStatus[item.step];
              const tone =
                status === "approved"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : status === "pending_review"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : status === "rejected"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-700";

              return (
                <div key={item.step} className={`rounded-lg border p-3 ${tone}`}>
                  <p className="text-[11px] uppercase tracking-wide opacity-80">Step {item.step}</p>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs capitalize">{getReviewStepStatusLabel({ step: item.step, status, acceptanceMap })}</p>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-slate-600" />
              <p className="font-medium">Current review item</p>
            </div>

            {currentUploadStep === 2 ? (
              <>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Certified Matric certificate</p>
                  <p>Status: {formatDocStatus(matricStatus)}</p>
                  {application?.doc2SubmissionUploadedAt ? (
                    <p>Uploaded {new Date(application.doc2SubmissionUploadedAt).toLocaleString()}</p>
                  ) : null}
                  {application?.doc2SubmissionUrl ? (
                    <a href={application.doc2SubmissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      View certified Matric certificate
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ step: 2, approved: true })}>
                    {reviewMutation.isPending && reviewStep === 2 ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Matric certificate
                      </>
                    )}
                  </Button>
                  <Button variant="outline" disabled={reviewMutation.isPending} onClick={() => openRejectDialog(2)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject upload
                  </Button>
                </div>
              </>
            ) : currentUploadStep === 6 ? (
              <>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Certified ID copy</p>
                  <p>Status: {formatDocStatus(idStatus)}</p>
                  {application?.doc6SubmissionUploadedAt ? (
                    <p>Uploaded {new Date(application.doc6SubmissionUploadedAt).toLocaleString()}</p>
                  ) : null}
                  {application?.doc6SubmissionUrl ? (
                    <a href={application.doc6SubmissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      View certified ID upload
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ step: 6, approved: true })}>
                    {reviewMutation.isPending && reviewStep === 6 ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve certified ID
                      </>
                    )}
                  </Button>
                  <Button variant="outline" disabled={reviewMutation.isPending} onClick={() => openRejectDialog(6)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject upload
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>No COO action is required on this tutor right now.</p>
                <p>{currentAction.stageDescription}</p>
              </div>
            )}

            {(matricStatus === "rejected" || idStatus === "rejected") ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {matricStatus === "rejected"
                  ? application?.doc2SubmissionRejectionReason || application?.doc_2_submission_rejection_reason || "The Matric certificate needs correction."
                  : application?.doc6SubmissionRejectionReason || application?.doc_6_submission_rejection_reason || "The certified ID copy needs correction."}
              </div>
            ) : null}
          </div>

          <details className="rounded-xl border p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="font-medium">Agreement evidence</p>
                  <p className="text-sm text-muted-foreground">Accepted agreements, timestamps, and audit summary.</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </summary>
            <div className="mt-4 space-y-3">
              {AGREEMENT_STEPS.map((item) => {
                const acceptance = acceptanceMap[String(item.step)];
                const stepStatus = documentsStatus[String(item.step)];
                const badgeText =
                  item.step === 2
                    ? !acceptance
                      ? "Pending acceptance"
                      : stepStatus === "approved"
                        ? "Accepted and verified"
                        : stepStatus === "pending_review"
                          ? "Certificate pending review"
                          : stepStatus === "rejected"
                            ? "Certificate rejected"
                            : "Accepted - waiting for upload"
                    : stepStatus === "approved"
                      ? "Accepted"
                      : "Pending";

                return (
                  <div key={item.step} className="rounded-lg border p-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">Step {item.step}: {getReviewStepLabel(String(item.step))}</p>
                        <Badge className={stepStatus === "approved" ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                          {badgeText}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                      {acceptance ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Accepted {new Date(acceptance.acceptedAt).toLocaleString()} by {acceptance.typedFullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Version {acceptance.documentVersion} • Hash {String(acceptance.documentChecksum || "").slice(0, 16)}...
                          </p>
                          {Array.isArray(acceptance.acceptedClausesJson) && acceptance.acceptedClausesJson.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Clauses acknowledged: {acceptance.acceptedClausesJson.join(", ")}
                            </p>
                          ) : null}
                          <div className="pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => downloadAcceptedAgreement(item, acceptance)}>
                              <Download className="mr-2 h-3 w-3" />
                              Download accepted copy
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No acceptance recorded yet.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-3 border-t pt-4">
              <div className="rounded-lg border p-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">Step 2: EQV upload</p>
                    <Badge className={matricStatus === "approved" ? "bg-green-100 text-green-800 border-green-200" : matricStatus === "pending_review" ? "bg-amber-100 text-amber-900 border-amber-200" : matricStatus === "rejected" ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                      {getReviewStepStatusLabel({ step: "2", status: matricStatus, acceptanceMap })}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Certified Matric certificate</p>
                  {application?.doc2SubmissionUploadedAt ? (
                    <p className="text-xs text-muted-foreground">Uploaded {new Date(application.doc2SubmissionUploadedAt).toLocaleString()}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No upload recorded yet.</p>
                  )}
                  {application?.doc2SubmissionUrl ? (
                    <a href={application.doc2SubmissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      View certified Matric certificate
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">Step 6: CID upload</p>
                    <Badge className={idStatus === "approved" ? "bg-green-100 text-green-800 border-green-200" : idStatus === "pending_review" ? "bg-amber-100 text-amber-900 border-amber-200" : idStatus === "rejected" ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                      {getReviewStepStatusLabel({ step: "6", status: idStatus, acceptanceMap })}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Certified ID copy</p>
                  {application?.doc6SubmissionUploadedAt ? (
                    <p className="text-xs text-muted-foreground">Uploaded {new Date(application.doc6SubmissionUploadedAt).toLocaleString()}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No upload recorded yet.</p>
                  )}
                  {application?.doc6SubmissionUrl ? (
                    <a href={application.doc6SubmissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      View certified ID upload
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <Dialog open={reviewStep !== null} onOpenChange={(open) => !open && setReviewStep(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewStep === 2 ? "Reject Matric Certificate" : "Reject Certified ID Copy"}</DialogTitle>
            <DialogDescription>Explain exactly what the tutor must correct before uploading again.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder={reviewStep === 2 ? "Example: Upload a certified copy of the official National Senior Certificate." : "Example: Certification stamp is unclear. Upload a clearer certified copy."}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewStep(null)}>
              Cancel
            </Button>
            <Button
              disabled={!reviewStep || !rejectionReason.trim() || reviewMutation.isPending}
              onClick={() => reviewStep && reviewMutation.mutate({ step: reviewStep, approved: false, rejectionReason })}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Back to Tutor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
