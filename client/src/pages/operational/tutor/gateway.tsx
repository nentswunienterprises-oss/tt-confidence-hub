import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowLeft, FileText, Upload, AlertCircle, Loader2, Clock, ExternalLink, Users } from "lucide-react";
import { TTLogo } from "@/components/TTLogo";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { ApplicationForm } from "@/components/tutor/application-form";
import { SequentialDocumentSubmission } from "@/components/tutor/SequentialDocumentSubmission";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApplicationStatus {
  status: "not_applied" | "pending" | "approved" | "rejected" | "verification" | "confirmed";
  applicationId?: string;
  hasTrialAgreement?: boolean;
  hasParentConsent?: boolean;
  trialAgreementVerified?: boolean;
  parentConsentVerified?: boolean;
  trialAgreementUrl?: string;
  parentConsentUrl?: string;
  isUnder18?: boolean;
}

interface PodData {
  assignment?: any;
  students?: any[];
}

export default function TutorGateway() {
  // ...existing code...
  // ...existing code...
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState<"application" | "submitted" | "loading">("loading");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const justSubmittedRef = useRef(false);
  const [uploadingDoc, setUploadingDoc] = useState<"trial_agreement" | "parent_consent" | null>(null);
  const trialAgreementInputRef = useRef<HTMLInputElement>(null);
  const parentConsentInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user data
  // Use shared auth hook which waits for Supabase session restore
  const { user, isLoading: userLoading, isAuthenticated } = useAuth();

  // Fetch aggregated gateway session
  const { data: gatewaySession, isLoading: gatewayLoading, error: gatewayError } = useQuery<any>({
    queryKey: ["/api/tutor/gateway-session"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });

  // Debug: log the gateway session response
  useEffect(() => {
    if (gatewaySession) {
      console.log("🔍 gatewaySession response:", gatewaySession);
    }
  }, [gatewaySession]);

  // Extract application status, pod assignment, etc. from gatewaySession
  const applicationStatus = gatewaySession?.applicationStatus || null;
  const podData = {
    assignment: gatewaySession?.assignment,
    students: gatewaySession?.students,
  };
  const hasPodAssignment = !!podData.assignment;
  // Province, role, enrollmentStatus, verificationStatus available as needed
  // const province = gatewaySession?.province;
  // const role = gatewaySession?.role;
  // const enrollmentStatus = gatewaySession?.enrollmentStatus;
  // const verificationStatus = gatewaySession?.verificationStatus;

  // Loading and error states
  const appStatusLoading = gatewayLoading;
  const appStatusError = gatewayError;

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ documentType, file }: { documentType: "trial_agreement" | "parent_consent"; file: File }) => {
      if (!applicationStatus?.applicationId || !user?.id) {
        throw new Error("Missing application or user info");
      }

      // Read file as base64
      const readFileAsBase64 = (fileToRead: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // result is like: data:<mime>;base64,XXXX
            const parts = result.split(',', 2);
            resolve(parts[1]);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(fileToRead);
        });
      };

      const base64 = await readFileAsBase64(file);
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${ext}`;

      const response = await fetch(`${API_URL}/api/tutor/onboarding-documents/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          applicationId: applicationStatus.applicationId,
          documentType,
          fileName,
          fileData: base64,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${response.status} ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/gateway-session"] });
      toast({
        title: "Document Uploaded",
        description: "Your document has been submitted for verification.",
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
      setUploadingDoc(null);
    },
  });

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: "trial_agreement" | "parent_consent"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
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
    
    setUploadingDoc(documentType);
    uploadDocumentMutation.mutate({ documentType, file });
    
    // Reset input
    event.target.value = "";
  };

  // Auto-set step based on application status
  useEffect(() => {
    if (justSubmittedRef.current) {
      return;
    }
    
    // While user auth is loading, show loading
    if (userLoading || !isAuthenticated) {
      console.log("🔄 gateway: waiting for auth", { userLoading, isAuthenticated });
      setStep("loading");
      return;
    }
    
    // If application-status query is still loading, show loading
    if (appStatusLoading) {
      console.log("🔄 gateway: fetching application status...");
      setStep("loading");
      return;
    }
    
    // If there was an error fetching application status, try to proceed or show error
    if (appStatusError) {
      console.error("❌ gateway: error fetching application status:", appStatusError);
      // Still show loading UI but don't get stuck forever
      setStep("loading");
      return;
    }
    
    // Now we have the application status data (or it's null/undefined)
    console.log("✅ gateway: application status resolved:", applicationStatus);
    if (!applicationStatus) {
      // Either the user has no application record (not_applied) or error occurred
      // Default to application form
      console.log("📋 gateway: no application status, showing form");
      setStep("application");
    } else if (applicationStatus.status === "not_applied") {
      setStep("application");
    } else if (applicationStatus.status === "confirmed") {
      // If confirmed, show submitted view — if assigned, show Assigned stage with Continue button
      setStep("submitted");
    } else {
      // pending, approved, verification states
      setStep("submitted");
    }
  }, [applicationStatus, appStatusLoading, appStatusError, userLoading, isAuthenticated, navigate, hasPodAssignment]);

  // Mark onboarding complete (tutor clicked Continue to Dashboard)
  const completeOnboarding = async () => {
    if (!applicationStatus?.applicationId) return;
    try {
      setUploadingDoc(null);
      const res = await fetch(`${API_URL}/api/tutor/complete-onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ applicationId: applicationStatus.applicationId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to complete onboarding: ${res.status} ${text}`);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      navigate("/tutor/pod", { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to continue", variant: "destructive" });
    }
  };

  // Determine current journey stage for progress bar
  const getStageStatus = (stage: string): boolean => {
    if (!applicationStatus) return false;
    
    const statusOrder = ["not_applied", "pending", "approved", "verification", "confirmed"];
    const currentIndex = statusOrder.indexOf(applicationStatus.status);
    
    switch (stage) {
      case "Application":
        return currentIndex >= 0;
      case "Review":
        return currentIndex >= 1;
      case "Verification":
        return currentIndex >= 2; // Approved means they can start verification
      case "Assigned":
        return currentIndex >= 4 && hasPodAssignment; // Confirmed + has pod
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TTLogo size="md" />
          </div>
          
          <div className="hidden md:block">
            <span className="text-xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              System Entry
            </span>
          </div>
          
          <Button
            variant="ghost"
            className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            style={{ color: "#1A1A1A" }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Journey Status Bar */}
      <div style={{ backgroundColor: "#FFF0F0" }}>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex justify-center">
          <div className="flex items-center justify-between w-full max-w-2xl overflow-x-auto">
            {[
              { label: "Application", status: getStageStatus("Application") },
              { label: "Review", status: getStageStatus("Review") },
              { label: "Verification", status: getStageStatus("Verification") },
              { label: "Assigned", status: getStageStatus("Assigned") },
            ].map((item, idx, arr) => (
              <div key={item.label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition"
                    style={{
                      backgroundColor: item.status ? "#E63946" : "transparent",
                      borderColor: item.status ? "#E63946" : "#D1D5DB",
                      color: item.status ? "white" : "#9CA3AF"
                    }}
                  >
                    {item.status ? (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center" style={{ color: "#1A1A1A" }}>{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1 sm:mx-2 transition min-w-[12px]"
                    style={{ backgroundColor: item.status ? "#E63946" : "#E5E5E5" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        {/* Application Prompt */}
        {step === "application" && (
          <Card className="border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl" style={{ color: "#1A1A1A" }}>Founding Team Application</CardTitle>
              <CardDescription className="text-sm" style={{ color: "#5A5A5A" }}>
                Territorial Tutoring - Join Our Founding Cohort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              {/* Introduction */}
              <div className="rounded-xl p-4 sm:p-5 space-y-2 sm:space-y-3" style={{ backgroundColor: "#FFF0F0" }}>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: "#E63946" }}>"Systems produce results. Everything else produces noise."</h3>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  TT operates on structure. Tutors execute a system - not improvisation, not personality, not motivation.
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  This application determines if you're ready to execute with precision. If you need creative freedom, this isn't for you.
                </p>
              </div>

              {/* What to Expect */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>Application Process:</h4>
                <ul className="space-y-2 text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }} />
                    <span>7-step application - mindset, execution capacity, and fit</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }} />
                    <span>15-20 minutes if answered directly</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }} />
                    <span>Video introduction optional but recommended</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }} />
                    <span>Review within 48 hours</span>
                  </li>
                </ul>
              </div>

              {/* Start Application Button */}
              <Button
                onClick={() => setShowApplicationForm(true)}
                className="w-full rounded-full font-semibold text-sm sm:text-base"
                size="lg"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Start Application
              </Button>

              <p className="text-[10px] sm:text-xs text-center" style={{ color: "#5A5A5A" }}>
                Limited positions available. All applications are reviewed individually.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Application Dialog */}
        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogContent className="w-[95vw] max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Founding Team Application</DialogTitle>
            </DialogHeader>
            <ApplicationForm
              onSuccess={() => {
                justSubmittedRef.current = true;
                setShowApplicationForm(false);
                setStep("submitted");
                queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
                toast({
                  title: "Application Submitted!",
                  description: "Your application is now under review. We'll be in touch soon.",
                });
              }}
              onCancel={() => setShowApplicationForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Submitted / Status View */}
        {step === "submitted" && applicationStatus && (
          <Card className="text-center border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-sm sm:text-lg" style={{ color: "#1A1A1A" }}>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "#E63946" }} />
                <span className="text-center">
                  {applicationStatus.status === "pending" && "Application Under Review"}
                  {applicationStatus.status === "approved" && "You've Been Accepted!"}
                  {applicationStatus.status === "verification" && "Documents Under Verification"}
                  {applicationStatus.status === "confirmed" && "Awaiting Pod Assignment"}
                  {applicationStatus.status === "rejected" && "Application Not Accepted"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {applicationStatus.status === "pending" && (
                <>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Application received. Under review.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Response within 48 hours.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-left">
                    <p className="text-xs sm:text-sm font-medium mb-2">What happens next:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>We assess fit</li>
                      <li>If accepted, upload verification documents</li>
                      <li>Once verified, you're assigned to a pod</li>
                      <li>System training begins</li>
                    </ul>
                  </div>
                </>
              )}

              {(applicationStatus.status === "approved" || applicationStatus.status === "verification") && (
                <>
                  <SequentialDocumentSubmission
                    applicationId={applicationStatus.applicationId}
                    applicationStatus={applicationStatus}
                  />
                </>
              )}

              {/* Confirmed but waiting for pod assignment */}
              {applicationStatus.status === "confirmed" && !hasPodAssignment && (
                <>
                  <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
                    Documents Verified
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
                    You're in. Matching you with a pod now.
                  </p>
                  
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-medium text-green-800">Waiting for Pod Assignment</p>
                        <p className="text-[10px] sm:text-xs text-green-700 mt-1">
                          Our team is preparing your first pod. You'll be notified once you're assigned.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-left">
                    <p className="text-xs sm:text-sm font-medium mb-2">What to expect:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>You'll be assigned 2-4 students in your first pod</li>
                      <li>Your Territory Director will introduce your students</li>
                      <li>You'll get access to student profiles and identity sheets</li>
                      <li>Sessions will be scheduled based on availability</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Confirmed and assigned -> show Assigned stage with Continue button */}
              {applicationStatus.status === "confirmed" && hasPodAssignment && (
                <>
                  <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
                    Pod Assigned
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
                    Documents verified. Pod assigned. Continue to your dashboard.
                  </p>

                  <div className="flex justify-center">
                    <Button size="lg" className="rounded-full" style={{ backgroundColor: "#E63946" }} onClick={completeOnboarding}>
                      Continue to Dashboard
                    </Button>
                  </div>
                </>
              )}

              {applicationStatus.status === "rejected" && (
                <>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Application not accepted. This doesn't prevent future applications.
                  </p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">
                    For feedback, contact the team.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {step === "loading" && (
          <Card className="text-center">
            <CardContent className="py-12">
              {appStatusError ? (
                <>
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 font-semibold mb-2">Unable to load application status</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                    {appStatusError.message || "An error occurred while loading. Please try again."}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="rounded-full"
                    style={{ backgroundColor: "#E63946" }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground">Loading your application status...</p>
                  <p className="text-xs text-gray-400 mt-4">If this takes more than 15 seconds, please refresh the page.</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
