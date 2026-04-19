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
import { CheckCircle2, ExternalLink, FileCheck, Loader2, ShieldCheck, XCircle } from "lucide-react";

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

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">{fullName}</CardTitle>
              <CardDescription className="break-all">{email}</CardDescription>
              <p className="text-xs text-muted-foreground">Application Ref: {application.id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{acceptedCount}/4 pure agreement steps accepted</Badge>
              <Badge variant="outline">Doc 2 is hybrid</Badge>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Agreement acceptance record</p>
              <p className="text-lg font-semibold">{acceptedCount}/4</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Matric review</p>
              <p className="text-lg font-semibold">
                {matricStatus === "approved" ? "Verified" : matricStatus === "pending_review" ? "Review" : matricStatus === "rejected" ? "Rejected" : "Waiting"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Certified ID review</p>
              <p className="text-lg font-semibold">
                {idStatus === "approved" ? "Verified" : idStatus === "pending_review" ? "Review" : idStatus === "rejected" ? "Rejected" : "Waiting"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
              <p className="font-medium">In-app acceptance evidence</p>
            </div>
            <div className="space-y-3">
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
                        <p className="text-sm font-medium">
                          Step {item.step}: {item.code}
                        </p>
                        <Badge className={stepStatus === "approved" ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                          {badgeText}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.title}</p>
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
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No acceptance recorded yet.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-slate-600" />
              <p className="font-medium">Step 2 upload: Certified Matric Certificate</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Status: {matricStatus.replace("_", " ")}</p>
              {application?.doc2SubmissionUploadedAt ? (
                <p>Uploaded {new Date(application.doc2SubmissionUploadedAt).toLocaleString()}</p>
              ) : null}
              {application?.doc2SubmissionUrl ? (
                <a href={application.doc2SubmissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  View certified Matric certificate
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p>No certified Matric certificate uploaded yet.</p>
              )}
              {matricStatus === "rejected" ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {application?.doc2SubmissionRejectionReason || application?.doc_2_submission_rejection_reason || "Please request a valid certified Matric certificate upload."}
                </div>
              ) : null}
            </div>
            {matricStatus === "pending_review" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ step: 2, approved: true })}>
                  {reviewMutation.isPending && reviewStep === 2 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Matric Certificate
                    </>
                  )}
                </Button>
                <Button variant="outline" disabled={reviewMutation.isPending} onClick={() => openRejectDialog(2)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Matric Certificate
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-slate-600" />
              <p className="font-medium">Step 6 upload: Certified ID Copy</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Status: {idStatus.replace("_", " ")}</p>
              {application?.doc6SubmissionUploadedAt ? (
                <p>Uploaded {new Date(application.doc6SubmissionUploadedAt).toLocaleString()}</p>
              ) : null}
              {application?.doc6SubmissionUrl ? (
                <a href={application.doc6SubmissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  View certified ID upload
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p>No certified ID file uploaded yet.</p>
              )}
              {idStatus === "rejected" ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {application?.doc6SubmissionRejectionReason || application?.doc_6_submission_rejection_reason || "Please request a corrected upload."}
                </div>
              ) : null}
            </div>
            {idStatus === "pending_review" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ step: 6, approved: true })}>
                  {reviewMutation.isPending && reviewStep === 6 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve ID Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" disabled={reviewMutation.isPending} onClick={() => openRejectDialog(6)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject ID Copy
                </Button>
              </div>
            ) : null}
          </div>
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
