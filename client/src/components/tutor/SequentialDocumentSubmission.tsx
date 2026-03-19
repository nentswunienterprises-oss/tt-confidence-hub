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
    title: "Tutor Agreement",
    description: "Foundation tutoring agreement & policies",
    details:
      "Please review and sign this tutoring agreement which outlines your responsibilities, payment terms, and conduct standards.",
  },
  {
    step: 2,
    title: "Code of Conduct",
    description: "Professional standards & expectations",
    details:
      "Review our code of conduct guidelines for professional interactions with parents and students.",
  },
  {
    step: 3,
    title: "Emergency Contact & Liability",
    description: "Safety information & liability acknowledgment",
    details:
      "Please provide emergency contact information and acknowledge our liability waiver.",
  },
  {
    step: 4,
    title: "Background Check Authorization",
    description: "Consent form for background screening",
    details:
      "Sign this form to authorize our background check and verification process.",
  },
  {
    step: 5,
    title: "Tax Information",
    description: "Tax ID & payment details for compensation",
    details:
      "Provide your tax information so we can process your compensation correctly.",
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

  // Extract current step and document statuses from applicationStatus
  const currentStep =
    applicationStatus?.documentSubmissionStep || 0;
  const documentStatuses =
    applicationStatus?.documentsStatus ||
    {
      "1": "not_started",
      "2": "not_started",
      "3": "not_started",
      "4": "not_started",
      "5": "not_started",
    };

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

      return response.json();
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
      if (!response.ok) throw new Error("Failed to download document");

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
      toast({
        title: "Download Failed",
        description: "Could not download document template",
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
                {applicationStatus?.[`doc${currentStep}RejectionReason`] ||
                  "Please review and resubmit"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {getDocumentStatus(currentStep) === "not_started" ||
          getDocumentStatus(currentStep) === "pending_upload" ? (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTemplate(currentStep)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <Button
                size="sm"
                disabled={uploadingStep === currentStep}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                {uploadingStep === currentStep ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Signed Document
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {getDocumentStatus(currentStep) === "pending_review"
                  ? "✓ Your document has been submitted. We're reviewing it now."
                  : "✓ This document has been approved!"}
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
