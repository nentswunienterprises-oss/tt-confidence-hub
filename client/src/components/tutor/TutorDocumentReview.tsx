import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

interface TutorDocumentReviewProps {
  application: any;
  onReview?: () => void;
}

const DOCUMENT_NAMES: Record<number, string> = {
  1: "Consent Form (Adult)",
  2: "Independent Contractor Agreement (Adult)",
  3: "Safeguarding and Conduct Policy (Adult)",
  4: "Data Protection Consent (Adult)",
  5: "Matric Entry Qualification Verification",
};

export function TutorDocumentReview({
  application,
  onReview,
}: TutorDocumentReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const fullName =
    application.fullName ||
    application.fullNames ||
    application.full_name ||
    application.full_names ||
    "Unknown Tutor";
  const email = application.email || "No email";
  const applicationId = application.id || "Unknown";

  const documentsStatus = application.documentsStatus || application.documents_status || {};

  // Find the first document that's pending_review
  let currentDocStep = 0;
  for (let i = 1; i <= 5; i++) {
    if (documentsStatus[i.toString()] === "pending_review") {
      currentDocStep = i;
      break;
    }
  }

  // Get document URL
  const documentUrls: Record<number, string | null> = {
    1: application.doc1TutorAgreementUrl || application.doc_1_tutor_agreement_url,
    2: application.doc2CodeOfConductUrl || application.doc_2_code_of_conduct_url,
    3: application.doc3EmergencyWaiverUrl || application.doc_3_emergency_waiver_url,
    4: application.doc4BackgroundAuthUrl || application.doc_4_background_auth_url,
    5: application.doc5TaxInfoUrl || application.doc_5_tax_info_url,
  };

  const documentUrl = currentDocStep ? documentUrls[currentDocStep] : null;
  const documentName = currentDocStep ? DOCUMENT_NAMES[currentDocStep] : "";

  // Review document mutation
  const reviewMutation = useMutation({
    mutationFn: async ({
      approved,
      rejectionReason: reason,
    }: {
      approved: boolean;
      rejectionReason?: string;
    }) => {
      const response = await fetch(
        `${API_URL}/api/coo/tutor/${application.id}/document/${currentDocStep}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            approved,
            rejectionReason: reason,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to review document");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/coo/tutor-applications"],
      });
      toast({
        title: "Document Reviewed",
        description: data.message,
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      onReview?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review document",
        variant: "destructive",
      });
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
          <p className="text-sm text-muted-foreground">
            ✓ All 5 documents have been reviewed and approved. This tutor is ready
            for pod assignment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-amber-900">{fullName}</p>
              <p className="text-xs text-amber-700">{email}</p>
              <p className="text-xs text-amber-600 mt-0.5">ID: {applicationId}</p>
            </div>
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded whitespace-nowrap">
              Step {currentDocStep} of 5
            </span>
          </div>
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Pending Review: {documentName}
            </CardTitle>
            <CardDescription>
              Document uploaded - awaiting COO review
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Viewer */}
          {documentUrl ? (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {documentName}
                </p>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Full Document
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-white border rounded p-4 min-h-48 flex items-center justify-center text-gray-500 text-sm">
                Document Available - Click "View Full Document" to review
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Document not yet available for viewing
              </p>
            </div>
          )}

          {/* Review Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              disabled={reviewMutation.isPending || !documentUrl}
              onClick={() => reviewMutation.mutate({ approved: true })}
              className="gap-2"
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Document
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={reviewMutation.isPending}
              onClick={() => setShowRejectDialog(true)}
            >
              Reject & Ask for Changes
            </Button>
          </div>

          {!documentUrl && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              Approve is disabled until the uploaded file URL is available. You can still reject and request re-upload.
            </p>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              {currentDocStep === 5
                ? "Approving this final document will complete all requirements and confirm the tutor."
                : `Approving this document will move the tutor to the next step (${currentDocStep}/5).`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Document for Revision</DialogTitle>
            <DialogDescription>
              Explain what needs to be corrected or changed
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Page 2 is missing signature, please re-scan and resubmit..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!rejectionReason.trim() || reviewMutation.isPending}
              onClick={() =>
                reviewMutation.mutate({
                  approved: false,
                  rejectionReason,
                })
              }
            >
              {reviewMutation.isPending ? "Sending..." : "Send Back to Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
