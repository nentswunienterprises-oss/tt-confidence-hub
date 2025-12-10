import { useState } from "react";
import { ExecutiveAuthForm } from "@/components/auth/executive-auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, Users, TrendingUp } from "lucide-react";

type Role = "coo" | "hr" | "ceo";

export default function ExecutiveSignup() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("login");
  const navigate = useNavigate();

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="font-bold text-lg">Executive Portal</h1>
              <p className="text-xs text-muted-foreground">Leadership & Operations</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/executive/landing")}
            >
              Back
            </Button>
          </div>
        </header>

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                Select Your Executive Role
              </h2>
              <p className="text-muted-foreground">
                Choose your role to access the appropriate dashboard and management tools
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* COO Role */}
              <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => setSelectedRole("coo")}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle>Chief Operating Officer</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage day-to-day operations, pods, tutor assignments, and communications
                  </p>
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs font-semibold">ACCESS INCLUDES</p>
                    <ul className="space-y-1">
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Pod Management
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Tutor Assignments
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Broadcast System
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Performance Analytics
                      </li>
                    </ul>
                  </div>
                  <Button className="w-full mt-auto">
                    Continue as COO
                  </Button>
                </CardContent>
              </Card>

              {/* HR Role */}
              <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => setSelectedRole("hr")}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>Head of HR</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Oversee staffing, metrics, personnel updates, and HR analytics
                  </p>
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs font-semibold">ACCESS INCLUDES</p>
                    <ul className="space-y-1">
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Staff Management
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Enrollment Metrics
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Personnel Updates
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Team Analytics
                      </li>
                    </ul>
                  </div>
                  <Button className="w-full mt-auto">
                    Continue as HR
                  </Button>
                </CardContent>
              </Card>

              {/* CEO Role */}
              <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => setSelectedRole("ceo")}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <CardTitle>Chief Executive Officer</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View executive dashboard, strategic insights, and business intelligence
                  </p>
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs font-semibold">ACCESS INCLUDES</p>
                    <ul className="space-y-1">
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Executive Dashboard
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Strategic Insights
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Growth Metrics
                      </li>
                      <li className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        Company Analytics
                      </li>
                    </ul>
                  </div>
                  <Button className="w-full mt-auto">
                    Continue as CEO
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
          <button
            onClick={() => setSelectedRole(null)}
            className="text-sm font-medium transition hover:opacity-70"
          >
            ← Back to Roles
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">Executive Portal</h1>
            <p className="text-xs text-muted-foreground">
              {selectedRole === "coo" && "Chief Operating Officer"}
              {selectedRole === "hr" && "Head of Human Resources"}
              {selectedRole === "ceo" && "Chief Executive Officer"}
            </p>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <ExecutiveAuthForm role={selectedRole as Role} mode={mode} setMode={setMode} />
        </div>
      </div>
    </div>
  );
}
