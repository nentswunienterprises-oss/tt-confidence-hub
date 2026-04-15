import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Clock, FileText, ExternalLink, AlertCircle, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

interface TutorDocumentReviewProps {
  application: any;
  onReview?: () => void;
}

const DOCUMENT_NAMES: Record<number, string> = {
  1: "TT-TCF-001",
  2: "TT-EQV-002",
  3: "TT-ICA-003",
  4: "TT-SCP-004",
  5: "TT-DPC-005",
  6: "TT-CID-006",
};

const TOTAL_STEPS = 6;

function readFileAsBase64(fileToRead: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(",", 2);
      resolve(parts[1]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileToRead);
  });
}

export function TutorDocumentReview({ application, onReview }: TutorDocumentReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [completedTemplateOverrideUrl, setCompletedTemplateOverrideUrl] = useState<string | null>(null);
  const completedTemplateInputRef = useRef<HTMLInputElement>(null);

  const fullName = application.fullName || application.fullNames || application.full_name || application.full_names || "Unknown Tutor";
  const email = application.email || "No email";
  const tutorUserId = application.userId || application.user_id || "Unknown";
  const applicationId = application.id || "Unknown";
  const documentsStatus = application.documentsStatus || application.documents_status || {};

  let currentDocStep = 0;
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    if (String(documentsStatus[i.toString()]) === "pending_review") {
      currentDocStep = i;
      break;
    }
  }

  const tutorSignedUrls: Record<number, string | null> = {
    1: application.doc1TutorAgreementUrl || application.doc_1_tutor_agreement_url,
    2: application.doc2CodeOfConductUrl || application.doc_2_code_of_conduct_url,
    3: application.doc3EmergencyWaiverUrl || application.doc_3_emergency_waiver_url,
    4: application.doc4BackgroundAuthUrl || application.doc_4_background_auth_url,
    5: application.doc5TaxInfoUrl || application.doc_5_tax_info_url,
    6: application.doc6CertifiedIdCopyUrl || application.doc_6_certified_id_copy_url,
  };
  const completedTemplateUrls: Record<number, string | null> = {
    1: application.doc1CompletedTemplateUrl || application.doc_1_completed_template_url,
    2: application.doc2CompletedTemplateUrl || application.doc_2_completed_template_url,
    3: application.doc3CompletedTemplateUrl || application.doc_3_completed_template_url,
    4: application.doc4CompletedTemplateUrl || application.doc_4_completed_template_url,
    5: application.doc5CompletedTemplateUrl || application.doc_5_completed_template_url,
    6: null,
  };

  const documentName = currentDocStep ? DOCUMENT_NAMES[currentDocStep] : "";
  const tutorSignedUrl = currentDocStep ? tutorSignedUrls[currentDocStep] : null;
  const requiresCompletedTemplate = currentDocStep >= 1 && currentDocStep <= 5;
  const completedTemplateUrl = currentDocStep ? completedTemplateUrls[currentDocStep] : null;
  const effectiveCompletedTemplateUrl = completedTemplateOverrideUrl || completedTemplateUrl;
  const canApprove = !!tutorSignedUrl;

  useEffect(() => {
    setCompletedTemplateOverrideUrl(null);
  }, [currentDocStep, application.id]);

  const uploadCompletedMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!currentDocStep || !requiresCompletedTemplate) {
        throw new Error("Completed template upload is only available for steps 1 to 5.");
      }
      const base64 = await readFileAsBase64(file);
      const ext = file.name.split(".").pop();
      const response = await fetch(`${API_URL}/api/coo/tutor/${application.id}/document/${currentDocStep}/completed-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fileName: `${application.id}/doc_${currentDocStep}_completed_${Date.now()}.${ext}`,
          fileData: base64,
          fileType: file.type,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to upload completed template");
      return data;
    },
    onSuccess: (data: any) => {
      setCompletedTemplateOverrideUrl(data?.completedDocumentUrl || null);
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      toast({ title: "Completed Template Uploaded", description: "You can now approve this step." });
    },
    onError: (error: any) => {
      toast({ title: "Upload Failed", description: error?.message || "Failed to upload completed template", variant: "destructive" });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ approved, rejectionReason: reason }: { approved: boolean; rejectionReason?: string }) => {
      const response = await fetch(`${API_URL}/api/coo/tutor/${application.id}/document/${currentDocStep}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          approved,
          completedDocumentUrl: approved ? effectiveCompletedTemplateUrl : undefined,
          rejectionReason: reason,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to review document");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tutor-applications"] });
      toast({ title: "Document Reviewed", description: data.message });
      setShowRejectDialog(false);
      setRejectionReason("");
      onReview?.();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to review document", variant: "destructive" });
    },
  });

  if (!currentDocStep) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            All Documents Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">All 6 documents have been reviewed and approved. This tutor is ready for pod assignment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-amber-900">{fullName}</p>
              <p className="text-xs text-amber-700">{email}</p>
              <p className="text-xs text-amber-600 mt-0.5">Tutor ID: {tutorUserId}</p>
              <p className="text-xs text-amber-600">Application Ref: {applicationId}</p>
            </div>
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded self-start whitespace-nowrap">Step {currentDocStep} of {TOTAL_STEPS}</span>
          </div>
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Pending Review: {documentName}
            </CardTitle>
            <CardDescription>Review the tutor-signed submission. Approve if it is valid, or reject and request changes if it is not.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tutorSignedUrl ? (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4" />Tutor Signed: {documentName}</p>
                <a href={tutorSignedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View / Download Tutor Submission
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">Tutor-signed document not yet available for viewing.</p>
            </div>
          )}

          {requiresCompletedTemplate ? (
            <div className="p-4 bg-slate-50 border rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4" />TT Completed Version</p>
                {effectiveCompletedTemplateUrl ? (
                  <a href={effectiveCompletedTemplateUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    View / Download Completed Version
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
              <input
                ref={completedTemplateInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  uploadCompletedMutation.mutate(file);
                  event.target.value = "";
                }}
              />
              <Button size="sm" variant="outline" disabled={uploadCompletedMutation.isPending} onClick={() => completedTemplateInputRef.current?.click()} className="gap-2">
                {uploadCompletedMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />{effectiveCompletedTemplateUrl ? "Replace TT Internal Copy" : "Upload TT Internal Copy"}</>}
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">Step 6 is the tutor certified ID copy. No TT-completed version upload is required.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button size="sm" disabled={reviewMutation.isPending || !canApprove} onClick={() => reviewMutation.mutate({ approved: true })} className="gap-2 w-full sm:w-auto">
              {reviewMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><CheckCircle2 className="w-4 h-4" />Approve Document</>}
            </Button>
            <Button size="sm" variant="outline" disabled={reviewMutation.isPending} onClick={() => setShowRejectDialog(true)} className="w-full sm:w-auto">
              Reject and Ask for Changes
            </Button>
          </div>

          {!tutorSignedUrl ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              Approve is disabled until the tutor-signed document is available.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Document for Revision</DialogTitle>
            <DialogDescription>Explain what needs to be corrected or changed.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Example: Signature is missing on page 2. Please re-sign and resubmit."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              disabled={!rejectionReason.trim() || reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ approved: false, rejectionReason })}
            >
              {reviewMutation.isPending ? "Sending..." : "Send Back to Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
