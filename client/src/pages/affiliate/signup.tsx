import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AffiliateSignup() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF5ED]">
      <header
        className="fixed left-0 right-0 top-0 z-50 border-b border-[#F0DDD0] backdrop-blur-md"
        style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6 md:px-12">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 text-sm font-medium hover:bg-transparent sm:px-4 sm:text-base"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate("/affiliate/landing")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8A4B35]">
              Affiliate Gateway
            </p>
            <p className="mt-0.5 text-sm font-bold tracking-tight text-[#1A1A1A] sm:text-xl">
              Education Growth Partner
            </p>
          </div>

          <div className="w-16 sm:w-24" aria-hidden="true" />
        </div>
      </header>

      <div className="h-16 sm:h-20" />

      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8">
          <div className="space-y-4 text-center">
            <div
              className="inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
              style={{ backgroundColor: "#FFF0F0", color: "#E63946" }}
            >
              Precision-first operator role
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
              Enter the EGP gateway
            </h1>
            <p className="text-sm leading-7 text-[#5A5A5A] sm:text-base">
              Create your account or log in to begin the Education Growth Partner application flow.
            </p>
          </div>

          <div className="flex justify-center gap-2 rounded-full p-1" style={{ backgroundColor: "#FFF0F0" }}>
            <button
              className="flex-1 rounded-full px-6 py-3 font-semibold transition-all"
              style={{
                backgroundColor: mode === "signup" ? "#E63946" : "transparent",
                color: mode === "signup" ? "white" : "#5A5A5A",
              }}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button
              className="flex-1 rounded-full px-6 py-3 font-semibold transition-all"
              style={{
                backgroundColor: mode === "login" ? "#E63946" : "transparent",
                color: mode === "login" ? "white" : "#5A5A5A",
              }}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          <Card className="border-0 p-6 shadow-lg sm:p-8" style={{ backgroundColor: "white" }}>
            <AuthForm mode={mode} defaultRole="affiliate" />
          </Card>

          <p className="text-center text-xs text-[#5A5A5A]">
            By continuing, you agree to our{" "}
            <a href="/terms-of-use" target="_blank" className="underline hover:text-[#E63946]" style={{ color: "#1A1A1A" }}>
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" target="_blank" className="underline hover:text-[#E63946]" style={{ color: "#1A1A1A" }}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
