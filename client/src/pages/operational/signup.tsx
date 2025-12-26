import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, Crown, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function OperationalSignup() {
  const [selectedRole, setSelectedRole] = useState<"tutor" | "td" | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate("/operational/landing")}
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Back
            </Button>
            
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              JOIN OUR TEAM
            </span>
            
            <div className="w-16 sm:w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20" />

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-3xl space-y-10">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
                <span className="text-sm font-medium" style={{ color: "#E63946" }}>
                  Choose Your Role
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A1A1A" }}>
                How Would You Like to <span style={{ color: "#E63946" }}>Make an Impact?</span>
              </h2>
              <p style={{ color: "#5A5A5A" }}>
                Select whether you're joining as a Tutor or Territory Director
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Tutor Card */}
              <Card 
                className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group" 
                style={{ backgroundColor: "white" }}
                onClick={() => setSelectedRole("tutor")}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: "#FFF0F0" }}
                >
                  <Brain className="w-8 h-8" style={{ color: "#E63946" }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Tutor</h3>
                <p className="mb-6" style={{ color: "#5A5A5A" }}>
                  Lead 4-6 students in Confidence Pods and transform mathematical confidence
                </p>
                <ul className="space-y-2 mb-6">
                  {["Flexible hours", "Training provided", "Make real impact"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#5A5A5A" }}>
                      <Check className="w-4 h-4" style={{ color: "#E63946" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full rounded-full py-6 font-semibold border-0"
                  style={{ backgroundColor: "#E63946", color: "white" }}
                >
                  Continue as Tutor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>

              {/* Territory Director Card */}
              <Card 
                className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group" 
                style={{ backgroundColor: "white" }}
                onClick={() => setSelectedRole("td")}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: "#FFF0F0" }}
                >
                  <Crown className="w-8 h-8" style={{ color: "#E63946" }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Territory Director</h3>
                <p className="mb-6" style={{ color: "#5A5A5A" }}>
                  Oversee multiple pods, tutors, and ensure quality consistency
                </p>
                <ul className="space-y-2 mb-6">
                  {["Leadership role", "Build your team", "Territory ownership"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#5A5A5A" }}>
                      <Check className="w-4 h-4" style={{ color: "#E63946" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full rounded-full py-6 font-semibold border-0"
                  style={{ backgroundColor: "#E63946", color: "white" }}
                >
                  Continue as Director
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-base font-medium hover:bg-transparent flex items-center gap-2"
            style={{ color: "#1A1A1A" }}
            onClick={() => setSelectedRole(null)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roles
          </Button>
          
          <span className="text-xl lg:text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            {selectedRole === "tutor" ? "TUTOR" : "TERRITORY DIRECTOR"}
          </span>
          
          <div className="w-28" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: "#FFF0F0" }}
            >
              {selectedRole === "tutor" ? (
                <Brain className="w-8 h-8" style={{ color: "#E63946" }} />
              ) : (
                <Crown className="w-8 h-8" style={{ color: "#E63946" }} />
              )}
            </div>
            <h2 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>
              {selectedRole === "tutor" ? "Join as a Tutor" : "Join as Territory Director"}
            </h2>
            <p style={{ color: "#5A5A5A" }}>
              {selectedRole === "tutor"
                ? "Help students build confidence and transform their relationship with math."
                : "Lead a territory and oversee multiple pods and tutors."}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 justify-center p-1 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
            <button
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                mode === "signup" ? "shadow-md" : ""
              }`}
              style={{ 
                backgroundColor: mode === "signup" ? "#E63946" : "transparent",
                color: mode === "signup" ? "white" : "#5A5A5A"
              }}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                mode === "login" ? "shadow-md" : ""
              }`}
              style={{ 
                backgroundColor: mode === "login" ? "#E63946" : "transparent",
                color: mode === "login" ? "white" : "#5A5A5A"
              }}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          {/* Auth Form Container */}
          <Card className="p-8 border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <AuthForm mode={mode} defaultRole={selectedRole} />
          </Card>

          {/* Footer Info */}
          <p className="text-xs text-center" style={{ color: "#5A5A5A" }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
