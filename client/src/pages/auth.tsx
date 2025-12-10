import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg text-foreground">
                TT Confidence Hub
              </h1>
              <p className="text-xs text-muted-foreground">
                Your Command Center for Confidence
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
        </div>
      </div>

      {/* Auth Form */}
      <div className="w-full max-w-md space-y-6 mt-16">
        <div className="flex gap-2 justify-center">
          <Button
            variant={mode === "signup" ? "default" : "outline"}
            onClick={() => setMode("signup")}
            data-testid="button-switch-signup"
          >
            Sign Up
          </Button>
          <Button
            variant={mode === "login" ? "default" : "outline"}
            onClick={() => setMode("login")}
            data-testid="button-switch-login"
          >
            Login
          </Button>
        </div>

        <AuthForm mode={mode} />
      </div>
    </div>
  );
}
