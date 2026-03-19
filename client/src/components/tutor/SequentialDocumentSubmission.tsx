import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Upload,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

// Define the 5 documents in sequence
const ONBOARDING_DOCUMENTS = [
  {
    step: 1,
    title: "Consent Form (Adult)",
    description: "Adult consent acknowledgement",
    details:
      "Download the consent form, sign it, and upload the signed copy to continue.",
  },
  {
    step: 2,
    title: "Independent Contractor Agreement (Adult)",
    description: "Contractor terms and engagement conditions",
    details:
      "Review and sign the independent contractor agreement, then upload the signed document.",
  },
  {
    step: 3,
    title: "Safeguarding and Conduct Policy (Adult)",
    description: "Safeguarding obligations and conduct standards",
    details:
      "Read and sign the safeguarding and conduct policy before upload.",
  },
  {
    step: 4,
    title: "Data Protection Consent (Adult)",
    description: "Consent for handling personal data",
    details:
      "Sign the data protection consent form and upload it for review.",
  },
  {
    step: 5,
    title: "Matric Entry Qualification Verification",
    description: "Qualification declaration and verification",
    details:
      "Complete and sign the qualification verification form, then upload it as the final step.",
  },
];

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

export function SequentialDocumentSubmission({
  applicationId,
  applicationStatus,
  onDocumentsComplete,
}: DocumentSubmissionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingStep, setUploadingStep] = useState<number | null>(null);

  const defaultDocumentStatuses: Record<string, string> = {
    "1": "not_started",
    "2": "not_started",
    "3": "not_started",
    "4": "not_started",
    "5": "not_started",
  };

  const documentStatuses = {
    ...defaultDocumentStatuses,
    ...(applicationStatus?.documentsStatus || applicationStatus?.documents_status || {}),
  };

  const findCurrentStep = () => {
    const explicitStep =
      applicationStatus?.documentSubmissionStep ||
      applicationStatus?.document_submission_step;

    if (explicitStep) {
      return explicitStep;
    }

    for (let step = 1; step <= 5; step++) {
      const status = documentStatuses[step.toString()];
      if (status !== "approved") {
        return step;
      }
    }

    if (["approved", "verification"].includes(applicationStatus?.status)) {
      return 1;
    }

    return 0;
  };

  // Extract current step and document statuses from applicationStatus
  const currentStep = findCurrentStep();

  // Check if all documents are approved
  const allDocumentsApproved =
    Object.values(documentStatuses as Record<string, string>).every(
      (status: any) => status === "approved"
    );

  // Get current document
  const currentDoc = ONBOARDING_DOCUMENTS.find((d) => d.step === currentStep);

  // Upload document mutation
  const uploadDocMutation = useMutation({
    mutationFn: async ({
      docStep,
      file,
    }: {
      docStep: number;
      file: File;
    }) => {
      const readFileAsBase64 = (fileToRead: File): Promise<string> => {
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
      };

      const base64 = await readFileAsBase64(file);
      const ext = file.name.split(".").pop();
      const fileName = `${applicationId}/doc_${docStep}_${Date.now()}.${ext}`;

      const response = await fetch(
        `${API_URL}/api/tutor/onboarding-documents/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            applicationId,
            docStep,
            fileName,
            fileData: base64,
            fileType: file.type,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${response.status} ${text}`);
      }

      const payload = await response.json();
      if (!payload?.publicUrl) {
        throw new Error("Upload completed but document URL was not returned. Please try again.");
      }

      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tutor/gateway-session"],
      });
      toast({
        title: "Document Uploaded",
        description:
          "Your document has been submitted for COO review. We'll notify you once approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingStep(null);
    },
  });

  const handleDownloadTemplate = async (docStep: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tutor/onboarding-documents/${docStep}/download`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        let details = "Failed to download document";
        try {
          const errorBody = await response.json();
          details = errorBody?.message || details;
        } catch {
          const fallbackText = await response.text();
          if (fallbackText) {
            details = fallbackText;
          }
        }
        throw new Error(`(${response.status}) ${details}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TT_Document_${docStep}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not download document template";
      toast({
        title: "Download Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    if (!currentStep) {
      toast({
        title: "Error",
        description: "Invalid step number",
        variant: "destructive",
      });
      return;
    }

    setUploadingStep(currentStep);
    uploadDocMutation.mutate({ docStep: currentStep, file });

    // Reset input
    event.target.value = "";
  };

  const getDocumentStatus = (step: number): DocumentStatus => {
    return (documentStatuses[step.toString()] || "not_started") as DocumentStatus;
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "pending_review":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return "Approved ✓";
      case "pending_upload":
        return "Ready to upload";
      case "pending_review":
        return "Pending review";
      case "rejected":
        return "Rejected - Please resubmit";
      default:
        return "Not started";
    }
  };

  // Progress: number of approved documents
  const approvedCount = Object.values(documentStatuses as Record<string, string>).filter(
    (s: any) => s === "approved"
  ).length;
  const progressPercent = (approvedCount / 5) * 100;

  if (allDocumentsApproved) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle>All Documents Verified</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-800">
            Excellent! All 5 documents have been approved. You're now waiting for
            pod assignment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 0 || !currentDoc) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Document Submission Starting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Your application has been approved! Next, we need 5 documents from you.
          </p>
          <p className="text-sm font-medium">You'll complete them one at a time:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {ONBOARDING_DOCUMENTS.map((doc) => (
              <li key={doc.step}>{doc.title}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Document {currentStep} of 5
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {approvedCount} completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Document Card */}
      <Card>
        <CardHeader>
          <CardTitle>{currentDoc.title}</CardTitle>
          <CardDescription>{currentDoc.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {getStatusIcon(getDocumentStatus(currentStep))}
            <span className="text-sm font-medium">
              Status: {getStatusLabel(getDocumentStatus(currentStep))}
            </span>
          </div>

          {/* Document Details */}
          <p className="text-sm text-gray-700">{currentDoc.details}</p>

          {/* Rejection Reason (if applicable) */}
          {getDocumentStatus(currentStep) === "rejected" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-medium text-red-800 mb-1">
                Revisions Needed:
              </p>
              <p className="text-sm text-red-700">
                {({
                  1: applicationStatus?.doc1TutorAgreementRejectionReason || applicationStatus?.doc_1TutorAgreementRejectionReason || applicationStatus?.doc_1_tutor_agreement_rejection_reason,
                  2: applicationStatus?.doc2CodeOfConductRejectionReason || applicationStatus?.doc_2CodeOfConductRejectionReason || applicationStatus?.doc_2_code_of_conduct_rejection_reason,
                  3: applicationStatus?.doc3EmergencyWaiverRejectionReason || applicationStatus?.doc_3EmergencyWaiverRejectionReason || applicationStatus?.doc_3_emergency_waiver_rejection_reason,
                  4: applicationStatus?.doc4BackgroundAuthRejectionReason || applicationStatus?.doc_4BackgroundAuthRejectionReason || applicationStatus?.doc_4_background_auth_rejection_reason,
                  5: applicationStatus?.doc5TaxInfoRejectionReason || applicationStatus?.doc_5TaxInfoRejectionReason || applicationStatus?.doc_5_tax_info_rejection_reason,
                } as Record<number, string | undefined>)[currentStep] || "Please review and resubmit"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {getDocumentStatus(currentStep) === "not_started" ||
          getDocumentStatus(currentStep) === "pending_upload" ||
          getDocumentStatus(currentStep) === "rejected" ? (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTemplate(currentStep)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                disabled={uploadingStep === currentStep}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <Button
                size="sm"
                disabled={uploadingStep === currentStep}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {uploadingStep === currentStep ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {getDocumentStatus(currentStep) === "rejected" ? "Resubmit Document" : "Upload Signed Document"}
                  </>
                )}
              </Button>
            </div>
          ) : getDocumentStatus(currentStep) === "pending_review" ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Your document has been submitted. We're reviewing it now.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ This document has been approved!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ONBOARDING_DOCUMENTS.map((doc) => {
              const status = getDocumentStatus(doc.step);
              return (
                <div key={doc.step} className="flex items-center gap-3 p-2">
                  {getStatusIcon(status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getStatusLabel(status)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
