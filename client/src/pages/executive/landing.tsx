import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Check, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import { useEffect } from "react";

export default function ExecutiveLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const roles = [
    {
      id: "coo",
      title: "Chief Operating Officer",
      shortTitle: "COO",
      description: "Manage day-to-day operations, pods, tutor assignments, and broadcast communications",
      icon: Building2,
      features: [
        "Pod Management & Assignments",
        "Tutor Performance Tracking",
        "Broadcast Communications",
        "Operations Dashboard",
        "Quality Control & Verification",
      ],
    },
    {
      id: "hr",
      title: "Head of Human Resources",
      shortTitle: "HR",
      description: "Oversee staffing, track metrics, manage personnel updates, and HR analytics",
      icon: Users,
      features: [
        "Staff Management",
        "Traffic & Enrollment Metrics",
        "Personnel Updates",
        "HR Analytics",
        "Team Performance Reports",
      ],
    },
    {
      id: "ceo",
      title: "Chief Executive Officer",
      shortTitle: "CEO",
      description: "View executive dashboard, strategic insights, and business intelligence",
      icon: TrendingUp,
      features: [
        "Executive Dashboard",
        "Strategic Insights",
        "Business Intelligence",
        "Growth Metrics",
        "Company-Wide Analytics",
      ],
    },
  ];

  const handleRoleSelect = (role: string) => {
    navigate(`/executive/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(250, 248, 245, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-base font-medium hover:bg-transparent flex items-center gap-2"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="hidden md:block">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              EXECUTIVE PORTAL
            </span>
          </div>
          
          <Button
            className="text-base font-semibold px-6 py-5 rounded-full"
            style={{ backgroundColor: "#E85A2C", color: "white" }}
            onClick={() => navigate("/executive/signup")}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#FEF3EE" }}>
            <span className="text-sm font-medium" style={{ color: "#E85A2C" }}>
              Leadership & Operations
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
            Lead with
            <br />
            <span style={{ color: "#E85A2C" }}>Confidence.</span>
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
            Executive access to operations, analytics, and strategic insights. Manage the Confidence Pod system with role-based dashboards.
          </p>

          <Button
            size="lg"
            className="text-lg font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#E85A2C", color: "white" }}
            onClick={() => navigate("/executive/signup")}
          >
            Access Leadership Portal
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
              Choose Your Role
            </h2>
            <p className="text-lg" style={{ color: "#A0A0A0" }}>
              Select your leadership position to access your dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id} 
                  className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  style={{ backgroundColor: "white" }}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "#FEF3EE" }}
                  >
                    <Icon className="w-8 h-8" style={{ color: "#E85A2C" }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
                    {role.title}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "#5A5A5A" }}>
                    {role.description}
                  </p>
                  
                  <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#E85A2C" }}>
                    Your Dashboard Includes
                  </p>
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: "#5A5A5A" }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#E85A2C" }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full rounded-full py-6 font-semibold"
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
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                TERRITORIAL TUTORING
              </span>
              <span className="text-xl font-bold" style={{ color: "#E85A2C" }}>+</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "#5A5A5A" }}>
              <Shield className="w-4 h-4" />
              <span className="text-sm">Executive Portal secured with role-based access control</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
