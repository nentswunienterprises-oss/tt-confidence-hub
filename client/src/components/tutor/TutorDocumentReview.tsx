import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ExternalLink, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

interface TutorDocumentReviewProps {
  application: any;
  onReview?: () => void;
}

const DOCUMENTS = [
  { step: 1, name: "TT-TCF-001", requiresCompletedTemplate: true },
  { step: 2, name: "TT-EQV-002", requiresCompletedTemplate: true },
  { step: 3, name: "TT-ICA-003", requiresCompletedTemplate: true },
  { step: 4, name: "TT-SCP-004", requiresCompletedTemplate: true },
  { step: 5, name: "TT-DPC-005", requiresCompletedTemplate: true },
  { step: 6, name: "TT-CID-006", requiresCompletedTemplate: false },
] as const;

type DocumentStatus =
  | "not_started"
  | "pending_upload"
  | "pending_review"
  | "approved"
  | "rejected";

function readFileAsBase64(fileToRead: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",", 2)[1]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileToRead);
  });
}

export function TutorDocumentReview({ application, onReview }: TutorDocumentReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const completedTemplateInputRef = useRef<HTMLInputElement>(null);
  const [completedTemplateStep, setCompletedTemplateStep] = useState<number | null>(null);
  const [completedTemplateOverrides, setCompletedTemplateOverrides] = useState<Record<number, string>>({});
  const [rejectStep, setRejectStep] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fullName = application.fullName || application.fullNames || application.full_name || application.full_names || "Unknown Tutor";
  const email = application.email || "No email";
  const tutorUserId = application.userId || application.user_id || "Unknown";
  const applicationId = application.id || "Unknown";

  const documentsStatus: Record<string, string> = {
    "1": "pending_upload",
    "2": "not_started",
    "3": "not_started",
    "4": "not_started",
    "5": "not_started",
    "6": "not_started",
    ...(application.documentsStatus || application.documents_status || {}),
  };

  const tutorSignedUrls: Record<number, string | null> = {
    1: application.doc1SubmissionUrl,
    2: application.doc2SubmissionUrl,
    3: application.doc3SubmissionUrl,
    4: application.doc4SubmissionUrl,
    5: application.doc5SubmissionUrl,
    6: application.doc6SubmissionUrl,
  };

  const completedTemplateUrls: Record<number, string | null> = {
    1: completedTemplateOverrides[1] || application.doc1CompletedTemplateUrl || application.doc_1_completed_template_url,
    2: completedTemplateOverrides[2] || application.doc2CompletedTemplateUrl || application.doc_2_completed_template_url,
    3: completedTemplateOverrides[3] || application.doc3CompletedTemplateUrl || application.doc_3_completed_template_url,
    4: completedTemplateOverrides[4] || application.doc4CompletedTemplateUrl || application.doc_4_completed_template_url,
    5: completedTemplateOverrides[5] || application.doc5CompletedTemplateUrl || application.doc_5_completed_template_url,
    6: null,
  };

  const rejectionReasons: Record<number, string | undefined> = {
    1: application.doc1SubmissionRejectionReason,
    2: application.doc2SubmissionRejectionReason,
    3: application.doc3SubmissionRejectionReason,
    4: application.doc4SubmissionRejectionReason,
    5: application.doc5SubmissionRejectionReason,
    6: application.doc6SubmissionRejectionReason,
  };

  const approvedCount = DOCUMENTS.filter((doc) => documentsStatus[String(doc.step)] === "approved").length;
  const pendingReviewCount = DOCUMENTS.filter((doc) => documentsStatus[String(doc.step)] === "pending_review").length;
  const pendingUploadCount = DOCUMENTS.filter((doc) => {
    const status = documentsStatus[String(doc.step)] as DocumentStatus;
    return status === "not_started" || status === "pending_upload";
  }).length;
  const missingCompletedTemplateCount = DOCUMENTS.filter(
    (doc) =>
      doc.requiresCompletedTemplate &&
      documentsStatus[String(doc.step)] === "approved" &&
      !completedTemplateUrls[doc.step]
  ).length;

  const currentPendingStep =
    DOCUMENTS.find((doc) => documentsStatus[String(doc.step)] === "pending_review")?.step ?? null;

  const uploadCompletedMutation = useMutation({
    mutationFn: async ({ step, file }: { step: number; file: File }) => {
      const base64 = await readFileAsBase64(file);
      const ext = file.name.split(".").pop();
      const response = await fetch(`${API_URL}/api/coo/tutor/${application.id}/document/${step}/completed-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fileName: `${application.id}/doc_${step}_completed_${Date.now()}.${ext}`,
          fileData: base64,
          fileType: file.type,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to upload completed template");
      return { ...data, step };
    },
    onSuccess: (data: any) => {
      setCompletedTemplateOverrides((current) => ({
        ...current,
        [data.step]: data?.completedDocumentUrl,
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
      toast({
        title: "TT Internal Copy Uploaded",
        description: `Step ${data.step} now has a TT-completed document on record.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload completed template",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setCompletedTemplateStep(null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      step,
      approved,
      rejectionReason: reason,
    }: {
      step: number;
      approved: boolean;
      rejectionReason?: string;
    }) => {
      const response = await fetch(`${API_URL}/api/coo/tutor/${application.id}/document/${step}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          approved,
          rejectionReason: reason,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to review document");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
      toast({ title: "Document Reviewed", description: data.message });
      setRejectStep(null);
      setRejectionReason("");
      onReview?.();
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error?.message || "Failed to review document",
        variant: "destructive",
      });
    },
  });

  const handleCompletedTemplateFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const step = completedTemplateStep;
    if (!file || !step) return;
    uploadCompletedMutation.mutate({ step, file });
    event.target.value = "";
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return "Verified";
      case "pending_review":
        return "Pending COO review";
      case "pending_upload":
        return "Waiting for tutor upload";
      case "rejected":
        return "Returned for changes";
      default:
        return "Not started";
    }
  };

  const getStatusBadgeClassName = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_review":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const renderTopBadge = () => {
    if (approvedCount === DOCUMENTS.length) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">6 docs verified</Badge>;
    }
    if (pendingReviewCount > 0) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Under review</Badge>;
    }
    if (missingCompletedTemplateCount > 0) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Awaiting TT completion</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Pending tutor progress</Badge>;
  };

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">{fullName}</CardTitle>
              <CardDescription className="break-all">{email}</CardDescription>
              <p className="text-xs text-muted-foreground">
                Tutor ID: {tutorUserId} | Application Ref: {applicationId}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {renderTopBadge()}
              {currentPendingStep ? (
                <Badge variant="outline">Current review step: {currentPendingStep}</Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Verified</p>
              <p className="text-lg font-semibold">{approvedCount}/6</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending review</p>
              <p className="text-lg font-semibold">{pendingReviewCount}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending tutor uploads</p>
              <p className="text-lg font-semibold">{pendingUploadCount}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Missing TT copies</p>
              <p className="text-lg font-semibold">{missingCompletedTemplateCount}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <input
            ref={completedTemplateInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleCompletedTemplateFile}
          />

          {DOCUMENTS.map((doc) => {
            const status = (documentsStatus[String(doc.step)] || "not_started") as DocumentStatus;
            const tutorSignedUrl = tutorSignedUrls[doc.step];
            const completedTemplateUrl = completedTemplateUrls[doc.step];
            const missingCompletedTemplate =
              doc.requiresCompletedTemplate &&
              status === "approved" &&
              !completedTemplateUrl;
            const isUploadingThisStep =
              uploadCompletedMutation.isPending && completedTemplateStep === doc.step;
            const isReviewingThisStep =
              reviewMutation.isPending && currentPendingStep === doc.step;

            return (
              <div key={doc.step} className="rounded-xl border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        Step {doc.step}: {doc.name}
                      </p>
                      <Badge className={getStatusBadgeClassName(status)}>{getStatusLabel(status)}</Badge>
                      {missingCompletedTemplate ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">TT copy missing</Badge>
                      ) : null}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Tutor submission:{" "}
                        {tutorSignedUrl ? (
                          <a href={tutorSignedUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            View file
                          </a>
                        ) : (
                          "Not uploaded yet"
                        )}
                      </p>
                      {doc.requiresCompletedTemplate ? (
                        <p>
                          TT internal copy:{" "}
                          {completedTemplateUrl ? (
                            <a href={completedTemplateUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              View file
                            </a>
                          ) : (
                            "Not uploaded yet"
                          )}
                        </p>
                      ) : (
                        <p>TT internal copy: Not required for certified ID copy</p>
                      )}
                    </div>

                    {status === "rejected" ? (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-medium">Returned to tutor</p>
                        <p>{rejectionReasons[doc.step] || "Please review and resubmit."}</p>
                      </div>
                    ) : null}

                    {status === "pending_review" ? (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Review is active on this step. Approval will keep the tutor moving, and the document stays visible here afterward.
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {tutorSignedUrl ? (
                      <a href={tutorSignedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <Button size="sm" variant="outline" className="gap-1">
                          Tutor File
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    ) : null}

                    {completedTemplateUrl ? (
                      <a href={completedTemplateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <Button size="sm" variant="outline" className="gap-1">
                          TT Copy
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    ) : null}

                    {doc.requiresCompletedTemplate && tutorSignedUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={uploadCompletedMutation.isPending}
                        onClick={() => {
                          setCompletedTemplateStep(doc.step);
                          completedTemplateInputRef.current?.click();
                        }}
                      >
                        {isUploadingThisStep ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {completedTemplateUrl ? "Replace TT Copy" : "Upload TT Copy"}
                          </>
                        )}
                      </Button>
                    ) : null}

                    {status === "pending_review" ? (
                      <>
                        <Button
                          size="sm"
                          className="gap-2"
                          disabled={reviewMutation.isPending || !tutorSignedUrl}
                          onClick={() => reviewMutation.mutate({ step: doc.step, approved: true })}
                        >
                          {isReviewingThisStep ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewMutation.isPending}
                          onClick={() => {
                            setRejectStep(doc.step);
                            setRejectionReason(rejectionReasons[doc.step] || "");
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {approvedCount === DOCUMENTS.length ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">Verified archive complete</p>
              <p>All six documents remain visible here for future COO reference.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={rejectStep !== null} onOpenChange={(open) => !open && setRejectStep(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Document for Revision</DialogTitle>
            <DialogDescription>Explain what the tutor needs to correct before re-uploading.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Example: Signature is missing on page 2. Please re-sign and resubmit."
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectStep(null)}>
              Cancel
            </Button>
            <Button
              disabled={!rejectStep || !rejectionReason.trim() || reviewMutation.isPending}
              onClick={() => {
                if (!rejectStep) return;
                reviewMutation.mutate({
                  step: rejectStep,
                  approved: false,
                  rejectionReason,
                });
              }}
            >
              {reviewMutation.isPending ? "Sending..." : "Send Back to Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
