import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              TERRITORIAL TUTORING
            </span>
            <span className="text-sm sm:text-xl font-bold" style={{ color: "#E63946" }}>+</span>
          </div>
          
          <div className="hidden md:block">
            <span className="text-xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              THE CONFIDENCE HUB
            </span>
          </div>
          
          <Button
            variant="ghost"
            className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            style={{ color: "#1A1A1A" }}
            onClick={() => (window.location.href = "/")}
            data-testid="button-back-home"
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
            {/* Mobile App Title */}
            <div className="md:hidden">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                THE CONFIDENCE HUB
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mx-auto" style={{ backgroundColor: "#FFF0F0" }}>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
                Staff & Tutor Portal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "#1A1A1A" }}>
              Welcome Back
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#5A5A5A" }}>
              Access your dashboard and manage your work.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            <Button
              className="px-4 sm:px-6 py-3 sm:py-5 rounded-full font-semibold transition-all text-sm sm:text-base border-0"
              style={{ 
                backgroundColor: mode === "signup" ? "#E63946" : "transparent",
                color: mode === "signup" ? "white" : "#1A1A1A",
                border: mode === "signup" ? "none" : "2px solid #1A1A1A"
              }}
              onClick={() => setMode("signup")}
              data-testid="button-switch-signup"
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
              data-testid="button-switch-login"
            >
              Log In
            </Button>
          </div>

          {/* Auth Form Card */}
          <div 
            className="rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg"
            style={{ backgroundColor: "white" }}
          >
            <AuthForm mode={mode} />
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2 sm:pt-4">
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FFF0F0" }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" style={{ color: "#E63946" }} />
            </div>
            <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
              Building <span className="font-semibold" style={{ color: "#1A1A1A" }}>confidence</span> in every student
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
