import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";

export default function ClientSignup() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              TERRITORIAL TUTORING
            </span>
            <span className="text-xl font-bold" style={{ color: "#E85A2C" }}>+</span>
          </div>
          
          <div className="hidden md:block">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              Parent Portal
            </span>
          </div>
          
          <Button
            variant="ghost"
            className="text-base font-medium hover:bg-transparent flex items-center gap-2"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto" style={{ backgroundColor: "#FEF3EE" }}>
              <span className="text-sm font-medium" style={{ color: "#E85A2C" }}>
                Free Trial • First 6-8 Weeks
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A1A1A" }}>
              Join The Confidence Hub
            </h2>
            <p className="text-lg" style={{ color: "#5A5A5A" }}>
              Give your child the gift of mathematical confidence.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 justify-center">
            <Button
              className="px-6 py-5 rounded-full font-semibold transition-all"
              style={{ 
                backgroundColor: mode === "signup" ? "#E85A2C" : "transparent",
                color: mode === "signup" ? "white" : "#1A1A1A",
                border: mode === "signup" ? "none" : "2px solid #1A1A1A"
              }}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </Button>
            <Button
              className="px-6 py-5 rounded-full font-semibold transition-all"
              style={{ 
                backgroundColor: mode === "login" ? "#E85A2C" : "transparent",
                color: mode === "login" ? "white" : "#1A1A1A",
                border: mode === "login" ? "none" : "2px solid #1A1A1A"
              }}
              onClick={() => setMode("login")}
            >
              Log In
            </Button>
          </div>

          {/* Auth Form Card */}
          <div 
            className="rounded-2xl p-8 shadow-lg"
            style={{ backgroundColor: "white" }}
          >
            <AuthForm mode={mode} defaultRole="parent" />
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FEF3EE" }}
            >
              <Heart className="w-5 h-5 fill-current" style={{ color: "#E85A2C" }} />
            </div>
            <p className="text-sm" style={{ color: "#5A5A5A" }}>
              Trusted by <span className="font-semibold" style={{ color: "#1A1A1A" }}>500+ families</span> across South Africa
            </p>
          </div>

          {/* Footer Info */}
          <p className="text-xs text-center" style={{ color: "#5A5A5A" }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
