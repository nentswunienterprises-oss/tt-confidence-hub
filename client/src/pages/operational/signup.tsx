import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";

export default function OperationalSignup() {
  const [selectedRole, setSelectedRole] = useState<"tutor" | "td" | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="font-bold text-lg">Operational Portal</h1>
              <p className="text-xs text-muted-foreground">Join Our Team</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/operational/landing")}
            >
              Back
            </Button>
          </div>
        </header>

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                Choose Your Role
              </h2>
              <p className="text-muted-foreground">
                Select whether you're joining as a Tutor or Territory Director
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tutor Card */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover-elevate border-primary/20" 
                onClick={() => setSelectedRole("tutor")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <CardTitle>Tutor</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Lead 4-6 students in Confidence Pods and transform mathematical confidence
                  </p>
                  <Button className="w-full">
                    Continue as Tutor
                  </Button>
                </CardContent>
              </Card>

              {/* Territory Director Card */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover-elevate border-primary/20" 
                onClick={() => setSelectedRole("td")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>Territory Director</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Oversee multiple pods, tutors, and ensure quality consistency
                  </p>
                  <Button className="w-full">
                    Continue as Director
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="font-bold text-lg">Operational Portal</h1>
            <p className="text-xs text-muted-foreground">
              {selectedRole === "tutor" ? "Tutor Sign Up" : "Territory Director Sign Up"}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
          >
            Back to Roles
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              {selectedRole === "tutor" ? "Join as a Tutor" : "Join as Territory Director"}
            </h2>
            <p className="text-muted-foreground">
              {selectedRole === "tutor"
                ? "Help students build confidence and transform their relationship with math."
                : "Lead a territory and oversee multiple pods and tutors."}
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
          <AuthForm mode={mode} defaultRole={selectedRole} />

          {/* Footer Info */}
          <div className="border-t pt-6">
            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
