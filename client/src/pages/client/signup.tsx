import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ClientSignup() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">The Confidence Hub</h1>
            <p className="text-xs text-muted-foreground">Parent Portal</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            Back to Main
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 bg-muted/30 rounded-lg p-6">
            <h2 className="text-3xl font-bold">
              Join TT Confidence Hub
            </h2>
            <p className="text-muted-foreground">
              Give your child the gift of mathematical confidence. Start your free trial today.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </Button>
            <Button
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
            >
              Login
            </Button>
          </div>

          {/* Auth Form */}
          <AuthForm mode={mode} defaultRole="parent" />

          {/* Footer Info */}
          <div className="border-t pt-6">
            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy. Your first 6-8 weeks are free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
