import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

interface ClauseDefinition {
  key: string;
  label: string;
}

interface OnboardingDocumentDefinition {
  step: number;
  code: string;
  title: string;
  version: string;
  content?: string;
  contentHash?: string;
  requiresAcceptance: boolean;
  requiresUpload: boolean;
  uploadTitle?: string;
  uploadDescription?: string;
  mandatoryClauses: ClauseDefinition[];
}

interface DocumentSubmissionProps {
  applicationId: string;
  applicationStatus: any;
  onDocumentsComplete?: () => void;
}

type DocumentStatus =
  | "not_started"
  | "pending_upload"
  | "pending_review"
  | "approved"
  | "rejected";

const DEFAULT_DOCUMENT_STATUSES: Record<string, DocumentStatus> = {
  "1": "pending_upload",
  "2": "not_started",
  "3": "not_started",
  "4": "not_started",
  "5": "not_started",
  "6": "not_started",
};

function normalizeDocumentStatuses(statuses: any): Record<string, DocumentStatus> {
  return {
    ...DEFAULT_DOCUMENT_STATUSES,
    ...(statuses && typeof statuses === "object" ? statuses : {}),
  };
}

function detectCurrentStep(statuses: Record<string, DocumentStatus>, explicitStep?: number) {
  if (explicitStep && explicitStep >= 1 && explicitStep <= 6) {
    return explicitStep;
  }

  for (let step = 1; step <= 6; step += 1) {
    if (statuses[String(step)] !== "approved") {
      return step;
    }
  }

  return 6;
}

export function SequentialDocumentSubmission({
  applicationId,
  applicationStatus,
  onDocumentsComplete,
}: DocumentSubmissionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agreementScrollRef = useRef<HTMLDivElement>(null);

  const documentStatuses = useMemo(
    () => normalizeDocumentStatuses(applicationStatus?.documentsStatus || applicationStatus?.documents_status),
    [applicationStatus]
  );
  const currentStep = detectCurrentStep(
    documentStatuses,
    applicationStatus?.documentSubmissionStep || applicationStatus?.document_submission_step
  );
  const allDocumentsApproved = Object.values(documentStatuses).every((status) => status === "approved");
  const onboardingAcceptanceMap = applicationStatus?.onboardingAcceptanceMap || {};
  const currentAcceptance = onboardingAcceptanceMap[String(currentStep)];

  const { data: onboardingConfig, isLoading: onboardingConfigLoading } = useQuery<{
    applicationId: string;
    documents: OnboardingDocumentDefinition[];
  }>({
    queryKey: ["/api/tutor/onboarding-documents", applicationId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/tutor/onboarding-documents`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load onboarding documents");
      }
      return response.json();
    },
    enabled: !!applicationId,
    staleTime: 0,
  });

  const documents = onboardingConfig?.documents ?? [];
  const currentDocument = documents.find((document) => document.step === currentStep);

  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [hasReadAndUnderstood, setHasReadAndUnderstood] = useState(false);
  const [hasAcceptedLegalBinding, setHasAcceptedLegalBinding] = useState(false);
  const [typedFullName, setTypedFullName] = useState("");
  const [acceptedClauses, setAcceptedClauses] = useState<Record<string, boolean>>({});
  const [scrollCompletionPercent, setScrollCompletionPercent] = useState(0);
  const [viewStartedAt, setViewStartedAt] = useState<string | null>(null);
  const [viewCompletedAt, setViewCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    setHasReachedEnd(false);
    setHasReadAndUnderstood(false);
    setHasAcceptedLegalBinding(false);
    setScrollCompletionPercent(0);
    setViewStartedAt(currentDocument?.requiresAcceptance ? new Date().toISOString() : null);
    setViewCompletedAt(null);
    setAcceptedClauses(
      Object.fromEntries((currentDocument?.mandatoryClauses ?? []).map((clause) => [clause.key, false]))
    );
  }, [currentDocument?.step, currentDocument?.requiresAcceptance]);

  useEffect(() => {
    if (!currentDocument?.requiresAcceptance) {
      return;
    }

    const accountName =
      applicationStatus?.fullName ||
      applicationStatus?.full_name ||
      applicationStatus?.name ||
      "";
    setTypedFullName(accountName);
  }, [applicationStatus, currentDocument?.requiresAcceptance]);

  const handleAgreementScroll = () => {
    const element = agreementScrollRef.current;
    if (!element) return;

    const maxScroll = Math.max(1, element.scrollHeight - element.clientHeight);
    const completion = Math.min(100, Math.round((element.scrollTop / maxScroll) * 100));
    setScrollCompletionPercent(completion);

    const reachedEnd = element.scrollTop + element.clientHeight >= element.scrollHeight - 12;
    if (reachedEnd && !hasReachedEnd) {
      setHasReachedEnd(true);
      setViewCompletedAt(new Date().toISOString());
      setScrollCompletionPercent(100);
    }
  };

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!currentDocument?.requiresAcceptance) {
        throw new Error("This onboarding step is not an agreement acceptance step.");
      }

      const clauseKeys = currentDocument.mandatoryClauses
        .filter((clause) => acceptedClauses[clause.key])
        .map((clause) => clause.key);

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
          acceptedClauseKeys: clauseKeys,
          scrollCompletionPercent,
          viewStartedAt,
          viewCompletedAt,
          acceptClickedAt: new Date().toISOString(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to accept agreement");
      }

      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/onboarding-documents", applicationId] });
      toast({
        title: "Agreement Accepted",
        description: "Your acceptance was recorded with the document version and timestamp.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Acceptance Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          resolve(result.split(",", 2)[1]);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const extension = file.name.split(".").pop();
      const response = await fetch(`${API_URL}/api/tutor/onboarding-documents/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId,
          docStep: currentStep,
          fileName: `${applicationId}/doc_${currentStep}_${Date.now()}.${extension}`,
          fileData: base64,
          fileType: file.type,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to upload verification document");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
      toast({
        title: currentStep === 2 ? "Matric Certificate Uploaded" : "Certified ID Uploaded",
        description:
          currentStep === 2
            ? "Your certified Matric certificate is now pending COO review."
            : "Your final onboarding upload is now pending COO review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approvedCount = Object.values(documentStatuses).filter((status) => status === "approved").length;
  const progressPercent = (approvedCount / 6) * 100;

  const canAcceptCurrentDocument =
    !!currentDocument?.requiresAcceptance &&
    hasReachedEnd &&
    hasReadAndUnderstood &&
    hasAcceptedLegalBinding &&
    typedFullName.trim().length > 0 &&
    currentDocument.mandatoryClauses.every((clause) => acceptedClauses[clause.key]);

  const downloadDocumentCopy = async (docStep: number) => {
    const response = await fetch(`${API_URL}/api/tutor/onboarding-documents/${docStep}/download`, {
      credentials: "include",
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.message || "Failed to download document copy");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${documents.find((document) => document.step === docStep)?.code || `TT-Document-${docStep}`}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  };

  const handleDownloadDocumentCopy = async (docStep: number) => {
    try {
      await downloadDocumentCopy(docStep);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not download the document copy.",
        variant: "destructive",
      });
    }
  };

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Upload a PDF or image file (JPEG or PNG).",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Upload a file smaller than 10MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    uploadMutation.mutate({ file });
    event.target.value = "";
  };

  const renderStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending_review":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const renderStatusLabel = (step: number, status: DocumentStatus) => {
    if (step === 2) {
      switch (status) {
        case "approved":
          return "Accepted and verified";
        case "pending_review":
          return "Certificate pending COO review";
        case "rejected":
          return "Certificate rejected - upload again";
        case "pending_upload":
          return onboardingAcceptanceMap["2"] ? "Accepted - waiting for certificate upload" : "Awaiting acceptance";
        default:
          return "Awaiting acceptance";
      }
    }

    if (step <= 5) {
      switch (status) {
        case "approved":
          return "Accepted in app";
        case "rejected":
          return "Needs fresh acceptance";
        default:
          return "Awaiting acceptance";
      }
    }

    switch (status) {
      case "approved":
        return "Verified";
      case "pending_review":
        return "Pending COO review";
      case "rejected":
        return "Rejected - upload a corrected copy";
      case "pending_upload":
        return "Ready for upload";
      default:
        return "Not started";
    }
  };

  if (allDocumentsApproved) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            All Onboarding Steps Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-800">
            Your in-app agreement acceptances, certified Matric verification, and certified ID copy are fully verified. TT can now assign you to a pod.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Onboarding Step {currentStep} of 6</CardTitle>
              <span className="text-sm text-muted-foreground">{approvedCount} completed</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{currentDocument?.title || "Loading onboarding step..."}</CardTitle>
          <CardDescription>
            {currentStep === 2
              ? currentAcceptance
                ? currentDocument?.uploadDescription || "Upload your certified Matric certificate for COO verification."
                : "Read TT-EQV-002 in app, acknowledge the verification clauses, type your full name, and accept before uploading your certified Matric certificate."
              : currentDocument?.requiresAcceptance
                ? "Read the full document in-app, acknowledge the required clauses, type your full name, and accept."
                : currentDocument?.uploadDescription || "Upload your certified ID copy for final COO verification."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            {renderStatusIcon(documentStatuses[String(currentStep)])}
            <span className="text-sm font-medium">
              Status: {renderStatusLabel(currentStep, documentStatuses[String(currentStep)])}
            </span>
          </div>

          {onboardingConfigLoading ? (
            <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading onboarding document...
            </div>
          ) : null}

          {currentDocument?.requiresAcceptance ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{currentDocument.code}</Badge>
                <Badge variant="outline">Version {currentDocument.version}</Badge>
                {currentDocument.contentHash ? <Badge variant="outline">Hash locked</Badge> : null}
              </div>

              <div
                ref={agreementScrollRef}
                onScroll={handleAgreementScroll}
                className="max-h-[28rem] overflow-y-auto rounded-xl border bg-slate-50 p-4 text-sm leading-6 whitespace-pre-wrap"
              >
                {currentDocument.content}
              </div>

              <div className="text-xs text-muted-foreground">
                Review completion: {scrollCompletionPercent}%
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDocumentCopy(currentStep)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Copy
                </Button>
              </div>

              {!currentAcceptance ? (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 text-sm">
                      <Checkbox
                        checked={hasReadAndUnderstood}
                        disabled={!hasReachedEnd}
                        onCheckedChange={(checked) => setHasReadAndUnderstood(checked === true)}
                      />
                      <span>I have read and understood this agreement.</span>
                    </label>

                    <label className="flex items-start gap-3 text-sm">
                      <Checkbox
                        checked={hasAcceptedLegalBinding}
                        onCheckedChange={(checked) => setHasAcceptedLegalBinding(checked === true)}
                      />
                      <span>
                        I agree to be legally bound by these terms and my acceptance will be recorded against my TT account.
                      </span>
                    </label>

                    {currentDocument.mandatoryClauses.map((clause) => (
                      <label key={clause.key} className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={acceptedClauses[clause.key] === true}
                          onCheckedChange={(checked) =>
                            setAcceptedClauses((current) => ({
                              ...current,
                              [clause.key]: checked === true,
                            }))
                          }
                        />
                        <span>{clause.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Type your full legal name</p>
                    <Input
                      value={typedFullName}
                      onChange={(event) => setTypedFullName(event.target.value)}
                      placeholder="Full legal name"
                    />
                  </div>

                  <Button onClick={() => acceptMutation.mutate()} disabled={!canAcceptCurrentDocument || acceptMutation.isPending}>
                    {acceptMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording Acceptance...
                      </>
                    ) : (
                      <>
                        <FileCheck className="mr-2 h-4 w-4" />
                        Accept & Continue
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-medium">Acceptance recorded</p>
                  <p>
                    Accepted {new Date(currentAcceptance.acceptedAt).toLocaleString()} as {currentAcceptance.typedFullName}.
                  </p>
                  <p>
                    Version {currentAcceptance.documentVersion} • Hash {String(currentAcceptance.documentChecksum || "").slice(0, 16)}...
                  </p>
                </div>
              )}
            </>
          ) : null}

          {currentDocument?.requiresUpload ? (
            <>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-medium">{currentDocument.uploadTitle || currentDocument.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentDocument.uploadDescription}
                </p>
              </div>

              {documentStatuses[String(currentStep)] === "rejected" ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {currentStep === 2
                    ? applicationStatus?.doc2SubmissionRejectionReason || "Please upload a valid certified Matric certificate."
                    : applicationStatus?.doc6SubmissionRejectionReason || "Please upload a clearer or corrected certified ID copy."}
                </div>
              ) : null}

              {documentStatuses[String(currentStep)] === "pending_review" ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {currentStep === 2
                    ? "Your certified Matric certificate is with COO for review now."
                    : "Your certified ID copy is with COO for review now."}
                </div>
              ) : null}

              {(documentStatuses[String(currentStep)] === "pending_upload" ||
                documentStatuses[String(currentStep)] === "not_started" ||
                documentStatuses[String(currentStep)] === "rejected") ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleUploadChange}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending || (currentStep === 2 && !currentAcceptance)}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {currentStep === 2
                          ? documentStatuses["2"] === "rejected"
                            ? "Re-upload Certified Matric Certificate"
                            : "Upload Certified Matric Certificate"
                          : documentStatuses["6"] === "rejected"
                            ? "Re-upload Certified ID Copy"
                            : "Upload Certified ID Copy"}
                      </>
                    )}
                  </Button>
                  {currentStep === 2 && !currentAcceptance ? (
                    <p className="text-xs text-muted-foreground">
                      Accept TT-EQV-002 first. The certified Matric certificate upload unlocks after acceptance.
                    </p>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onboarding Checklist</CardTitle>
          <CardDescription>Steps 1, 3, 4, and 5 are in-app acceptances. Step 2 is hybrid: acceptance plus certified Matric upload. Step 6 remains the final ID upload.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((document) => {
            const status = documentStatuses[String(document.step)] || "not_started";
            const acceptance = onboardingAcceptanceMap[String(document.step)];
            return (
              <div key={document.step} className="rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  {renderStatusIcon(status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        Step {document.step}: {document.title}
                      </p>
                      <Badge variant="outline">{renderStatusLabel(document.step, status)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {document.step === 2
                        ? `${document.code} • version ${document.version} • certified Matric upload required`
                        : document.step <= 5
                          ? `${document.code} • version ${document.version}`
                          : "Certified ID copy upload"}
                    </p>
                    {acceptance?.acceptedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Accepted {new Date(acceptance.acceptedAt).toLocaleString()} as {acceptance.typedFullName}
                      </p>
                    ) : null}
                    {document.step === 2 && applicationStatus?.doc2SubmissionUrl ? (
                      <a
                        href={applicationStatus.doc2SubmissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View uploaded certified Matric certificate
                      </a>
                    ) : null}
                    {document.step === 6 && applicationStatus?.doc6SubmissionUrl ? (
                      <a
                        href={applicationStatus.doc6SubmissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View uploaded certified ID copy
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
