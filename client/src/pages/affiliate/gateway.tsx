import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TTLogo } from "@/components/TTLogo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getQueryFn } from "@/lib/queryClient";
import { API_URL } from "@/lib/config";
import { AffiliateApplicationForm } from "@/components/affiliate/application-form";
import { SequentialAgreementAcceptance } from "@/components/affiliate/SequentialAgreementAcceptance";

export default function AffiliateGateway() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<"application" | "submitted" | "loading">("loading");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const justSubmittedRef = useRef(false);

  const { data: gatewaySession, isLoading, error } = useQuery<any>({
    queryKey: ["/api/affiliate/gateway-session"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: isAuthenticated ? 5000 : false,
    refetchIntervalInBackground: true,
  });

  const applicationStatus = gatewaySession?.applicationStatus || null;
  const documentsStatus = {
    "1": "pending_upload",
    "2": "not_started",
    "3": "not_started",
    "4": "not_started",
    "5": "not_started",
    ...(applicationStatus?.documentsStatus || applicationStatus?.documents_status || {}),
  };
  const allEgpStepsApproved = ["1", "2", "3", "4", "5"].every(
    (step) => documentsStatus[step] === "approved"
  );

  useEffect(() => {
    if (justSubmittedRef.current) return;
    if (authLoading || !isAuthenticated || isLoading) {
      setStep("loading");
      return;
    }
    if (!applicationStatus || applicationStatus.status === "not_applied") {
      setStep("application");
      return;
    }
    setStep("submitted");
  }, [authLoading, isAuthenticated, isLoading, applicationStatus]);

  const completeOnboarding = async () => {
    if (!applicationStatus?.applicationId || continuing) return;
    setContinuing(true);
    try {
      const response = await fetch(`${API_URL}/api/affiliate/complete-onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ applicationId: applicationStatus.applicationId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Failed to complete onboarding");
      await queryClient.invalidateQueries({ queryKey: ["/api/affiliate/gateway-session"] });
      navigate("/affiliate/affiliate/home", { replace: true });
    } catch (completionError) {
      setContinuing(false);
      toast({
        title: "Unable to continue",
        description: completionError instanceof Error ? completionError.message : "Failed to complete onboarding",
        variant: "destructive",
      });
    }
  };

  const getStageStatus = (label: string) => {
    if (!applicationStatus) return label === "Application";
    const status = applicationStatus.status;
    switch (label) {
      case "Application":
        return true;
      case "Review":
        return ["pending", "approved", "confirmed", "rejected"].includes(status);
      case "Agreements":
        return ["approved", "confirmed"].includes(status);
      case "Access":
        return allEgpStepsApproved;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      <header className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6 md:px-12">
          <div className="w-10 md:hidden" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 justify-center sm:static sm:w-auto sm:translate-x-0 sm:translate-y-0">
            <TTLogo size="md" variant="integrity" />
          </div>
          <div className="hidden md:block">
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A] lg:text-3xl">EGP Gateway</span>
          </div>
          <Button variant="ghost" className="hidden items-center gap-2 hover:bg-transparent md:inline-flex" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto flex justify-center px-3 pb-6 pt-24 sm:px-4">
        <div className="flex w-full max-w-2xl items-center justify-between overflow-x-auto">
          {["Application", "Review", "Agreements", "Access"].map((item, index, all) => (
            <div key={item} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: getStageStatus(item) ? "#E63946" : "transparent",
                    borderColor: getStageStatus(item) ? "#E63946" : "#D1D5DB",
                    color: getStageStatus(item) ? "white" : "#9CA3AF",
                  }}
                >
                  {getStageStatus(item) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <span className="mt-2 text-xs font-medium text-[#1A1A1A]">{item}</span>
              </div>
              {index < all.length - 1 ? (
                <div className="mx-2 h-0.5 flex-1" style={{ backgroundColor: getStageStatus(item) ? "#E63946" : "#E5E5E5" }} />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-3 pb-10 sm:px-4">
        {step === "application" ? (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Education Growth Partner Application</CardTitle>
              <CardDescription>Precision first. Need first. Performance based.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl bg-[#FFF0F0] p-5 text-sm text-[#5A5A5A]">
                <p>This is not a casual referral role.</p>
                <p className="mt-2">TT works with a small number of operators who can identify real need, speak to parents clearly, and walk away when the fit is wrong.</p>
                <p className="mt-2 font-semibold text-[#1A1A1A]">Low-precision operators remove themselves here.</p>
              </div>
              <Button className="w-full rounded-full" size="lg" style={{ backgroundColor: "#E63946" }} onClick={() => setShowApplicationForm(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Apply for Access
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogContent className="h-[95vh] max-w-5xl overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>EGP Application</DialogTitle>
            </DialogHeader>
            <AffiliateApplicationForm
              onSuccess={() => {
                justSubmittedRef.current = true;
                setShowApplicationForm(false);
                setStep("submitted");
                queryClient.invalidateQueries({ queryKey: ["/api/affiliate/application-status"] });
                queryClient.invalidateQueries({ queryKey: ["/api/affiliate/gateway-session"] });
                toast({
                  title: "Application submitted",
                  description: "Your EGP application is now under review.",
                });
              }}
              onCancel={() => setShowApplicationForm(false)}
            />
          </DialogContent>
        </Dialog>

        {step === "submitted" && applicationStatus ? (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-center">
                <CheckCircle2 className="h-5 w-5 text-[#E63946]" />
                <span>
                  {applicationStatus.status === "pending" && "Application Under Review"}
                  {applicationStatus.status === "approved" && "Application Approved"}
                  {applicationStatus.status === "confirmed" && (allEgpStepsApproved ? "Onboarding Complete" : "Application Approved")}
                  {applicationStatus.status === "rejected" && "Application Not Accepted"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {applicationStatus.status === "pending" ? (
                <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                  Your application has been received. COO will review fit, parent access quality, and alignment with TT's need-first positioning.
                </div>
              ) : null}

              {(applicationStatus.status === "approved" || !allEgpStepsApproved) && applicationStatus.status !== "pending" && applicationStatus.status !== "rejected" ? (
                <SequentialAgreementAcceptance
                  applicationId={applicationStatus.applicationId}
                  applicationStatus={applicationStatus}
                />
              ) : null}

              {applicationStatus.status === "confirmed" && allEgpStepsApproved ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">EGP access unlocked</h3>
                    <p className="text-sm text-muted-foreground">Your application is approved and all onboarding steps are complete.</p>
                  </div>
                  <Button className="rounded-full" style={{ backgroundColor: "#E63946" }} disabled={continuing} onClick={completeOnboarding}>
                    {continuing ? "Continuing..." : "Continue to Dashboard"}
                  </Button>
                </div>
              ) : null}

              {applicationStatus.status === "rejected" ? (
                <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                  This application was not accepted. You can reach out to TT if you need follow-up.
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {step === "loading" ? (
          <Card>
            <CardContent className="py-12 text-center">
              {error ? (
                <p className="text-sm text-red-600">Unable to load your EGP gateway right now.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Loading your gateway...</p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
