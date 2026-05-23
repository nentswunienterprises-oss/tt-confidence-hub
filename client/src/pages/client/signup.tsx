import { useState, useEffect } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import {
  getFastTrackBadgeLabel,
  getFastTrackDescription,
  isFastTrackAccessEnabled,
} from "@/lib/fastTrackAccess";
import { getParentIntakeLabel } from "@/lib/intakeWindows";
import { buildTrackedPath, resolveTrackedBackTarget } from "@/lib/publicTracking";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";

export default function ClientSignup() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = resolveTrackedBackTarget(location.search);
  const termsUrl = buildTrackedPath("/terms-of-use", location.search, { returnTo: backTarget });
  const privacyUrl = buildTrackedPath("/privacy-policy", location.search, { returnTo: backTarget });
  const params = new URLSearchParams(location.search);
  const lockedMode = params.get("lock") === "login" || params.get("lock") === "signup"
    ? (params.get("lock") as "signup" | "login")
    : null;
  const intakeLabel = getParentIntakeLabel(params.get("intake"));
  const fastTrackEnabled = isFastTrackAccessEnabled(location.search);
  const fastTrackBadge = getFastTrackBadgeLabel(location.search);
  const fastTrackDescription = getFastTrackDescription(location.search);

  useEffect(() => {
    const m = params.get('mode');
    if (lockedMode) {
      setMode(lockedMode);
      return;
    }

    if (m === 'login') {
      setMode('login');
      return;
    }

    setMode('signup');
  }, [location.search, lockedMode]);

  const badgeText = lockedMode === "login"
    ? "Existing Parent Access"
    : lockedMode === "signup"
      ? fastTrackEnabled && !params.get("intake")
        ? fastTrackBadge ?? intakeLabel
        : intakeLabel
      : fastTrackEnabled
        ? fastTrackBadge ?? "Parent Portal"
      : "Parent Portal";

  const title = lockedMode === "login"
    ? "Continue to Parent Login"
    : lockedMode === "signup"
      ? fastTrackEnabled && !params.get("intake")
        ? "Continue with Direct Parent Signup"
        : `Continue with ${intakeLabel}`
      : fastTrackEnabled
        ? "Direct Parent Signup"
      : "Join Response Integrity";

  const description = lockedMode === "login"
    ? "Already enrolled families continue here. This route is reserved for login only."
    : lockedMode === "signup"
      ? fastTrackEnabled && !params.get("intake")
        ? fastTrackDescription ?? "Direct signup is temporarily unlocked outside the standard intake gate."
        : "This is the protected signup path for the current intake. New family entry continues here only after the intake gateway."
      : fastTrackEnabled
        ? fastTrackDescription ?? "Direct signup is temporarily unlocked outside the standard intake gate."
      : "Give your child the response of calm execution under pressure.";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 relative flex items-center justify-between">
          <div className="w-10 md:hidden" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:static sm:transform-none w-full sm:w-auto flex justify-center">
            <ResponseIntegrityLogo size="md" variant="integrity" />
          </div>
          
          <div className="hidden md:block">
            <span className="text-xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              Parent Portal
            </span>
          </div>
          
          <Button
            variant="ghost"
            className="hidden md:inline-flex text-sm sm:text-base font-medium hover:bg-transparent items-center gap-1 sm:gap-2 px-2 sm:px-4"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate(backTarget)}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            {/* Mobile Portal Title */}
            <div className="md:hidden">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                Parent Portal
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mx-auto" style={{ backgroundColor: "#FFF0F0" }}>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
                {badgeText}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "#1A1A1A" }}>
              {title}
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#5A5A5A" }}>
              {description}
            </p>
          </div>

          {lockedMode ? null : (
            <div className="flex gap-2 sm:gap-3 justify-center">
              <Button
                className="px-4 sm:px-6 py-3 sm:py-5 rounded-full font-semibold transition-all text-sm sm:text-base border-0"
                style={{
                  backgroundColor: mode === "signup" ? "#E63946" : "transparent",
                  color: mode === "signup" ? "white" : "#1A1A1A",
                  border: mode === "signup" ? "none" : "2px solid #1A1A1A"
                }}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </Button>
              <Button
                className="px-4 sm:px-6 py-3 sm:py-5 rounded-full font-semibold transition-all text-sm sm:text-base border-0"
                style={{
                  backgroundColor: mode === "login" ? "#E63946" : "transparent",
                  color: mode === "login" ? "white" : "#1A1A1A",
                  border: mode === "login" ? "none" : "2px solid #1A1A1A"
                }}
                onClick={() => setMode("login")}
              >
                Log In
              </Button>
            </div>
          )}

          {/* Auth Form Card */}
          <div 
            className="rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg"
            style={{ backgroundColor: "white" }}
          >
            <AuthForm mode={mode} defaultRole="parent" />
          </div>

          {/* Footer Info */}
          <p className="text-xs text-center" style={{ color: "#5A5A5A" }}>
            By signing up, you agree to our{" "}
            <a href={termsUrl} target="_blank" className="underline hover:text-[#E63946]" style={{ color: "#1A1A1A" }}>
              Terms of Use
            </a>{" "}
            and{" "}
            <a href={privacyUrl} target="_blank" className="underline hover:text-[#E63946]" style={{ color: "#1A1A1A" }}>
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

