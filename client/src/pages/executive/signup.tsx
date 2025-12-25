import { useState } from "react";
import { ExecutiveAuthForm } from "@/components/auth/executive-auth-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, Users, TrendingUp, ArrowLeft, ArrowRight, Check } from "lucide-react";

type Role = "coo" | "hr" | "ceo";

const roleData = {
  coo: {
    title: "Chief Operating Officer",
    shortTitle: "COO",
    description: "Manage day-to-day operations, pods, tutor assignments, and communications",
    icon: Building2,
    features: ["Pod Management", "Tutor Assignments", "Broadcast System", "Performance Analytics"],
  },
  hr: {
    title: "Head of Human Resources",
    shortTitle: "HR",
    description: "Oversee staffing, metrics, personnel updates, and HR analytics",
    icon: Users,
    features: ["Staff Management", "Enrollment Metrics", "Personnel Updates", "Team Analytics"],
  },
  ceo: {
    title: "Chief Executive Officer",
    shortTitle: "CEO",
    description: "View executive dashboard, strategic insights, and business intelligence",
    icon: TrendingUp,
    features: ["Executive Dashboard", "Strategic Insights", "Growth Metrics", "Company Analytics"],
  },
};

export default function ExecutiveSignup() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("login");
  const navigate = useNavigate();

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-base font-medium hover:bg-transparent flex items-center gap-2"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate("/executive/landing")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <span className="text-xl lg:text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              EXECUTIVE PORTAL
            </span>
            
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-20" />

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-5xl space-y-10">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#FEF3EE" }}>
                <span className="text-sm font-medium" style={{ color: "#E85A2C" }}>
                  Select Your Role
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A1A1A" }}>
                Access Your <span style={{ color: "#E85A2C" }}>Executive Dashboard</span>
              </h2>
              <p style={{ color: "#5A5A5A" }}>
                Choose your role to access the appropriate dashboard and management tools
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {(Object.keys(roleData) as Role[]).map((roleKey) => {
                const role = roleData[roleKey];
                const Icon = role.icon;
                return (
                  <Card 
                    key={roleKey}
                    className="p-6 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                    style={{ backgroundColor: "white" }}
                    onClick={() => setSelectedRole(roleKey)}
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: "#FEF3EE" }}
                    >
                      <Icon className="w-7 h-7" style={{ color: "#E85A2C" }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>
                      {role.title}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#5A5A5A" }}>
                      {role.description}
                    </p>
                    
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#E85A2C" }}>
                      Access Includes
                    </p>
                    <ul className="space-y-2 mb-5">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: "#5A5A5A" }}>
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#E85A2C" }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full rounded-full py-5 font-semibold"
                      style={{ backgroundColor: "#E85A2C", color: "white" }}
                    >
                      Continue as {role.shortTitle}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = roleData[selectedRole];
  const Icon = currentRole.icon;

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
            {currentRole.shortTitle}
          </span>
          
          <div className="w-28" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: "#FEF3EE" }}
            >
              <Icon className="w-8 h-8" style={{ color: "#E85A2C" }} />
            </div>
            <h2 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>
              {currentRole.title}
            </h2>
            <p style={{ color: "#5A5A5A" }}>
              {currentRole.description}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 justify-center p-1 rounded-full" style={{ backgroundColor: "#FEF3EE" }}>
            <button
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                mode === "login" ? "shadow-md" : ""
              }`}
              style={{ 
                backgroundColor: mode === "login" ? "#E85A2C" : "transparent",
                color: mode === "login" ? "white" : "#5A5A5A"
              }}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                mode === "signup" ? "shadow-md" : ""
              }`}
              style={{ 
                backgroundColor: mode === "signup" ? "#E85A2C" : "transparent",
                color: mode === "signup" ? "white" : "#5A5A5A"
              }}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Form Container */}
          <Card className="p-8 border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <ExecutiveAuthForm role={selectedRole as Role} mode={mode} setMode={setMode} />
          </Card>
        </div>
      </div>
    </div>
  );
}
