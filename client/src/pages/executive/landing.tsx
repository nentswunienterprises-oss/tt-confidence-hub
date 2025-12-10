import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, TrendingUp, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium transition hover:opacity-70"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">Executive Portal</h1>
            <p className="text-xs text-muted-foreground">Leadership & Operations</p>
          </div>
          <Button
            onClick={() => navigate("/executive/signup")}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Lead with
              <br />
              Confidence.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Executive access to operations, analytics, and strategic insights. Manage the Confidence Pod system with role-based dashboards.
            </p>
          </div>
          <Button
            onClick={() => navigate("/executive/signup")}
            size="lg"
          >
            Access Leadership Portal
          </Button>
        </div>
      </section>

      {/* Role Selection */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">Choose Your Role</h3>
            <p className="text-muted-foreground">Select your leadership position to access your dashboard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold">YOUR DASHBOARD INCLUDES</p>
                      <ul className="space-y-2">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => handleRoleSelect(role.id)}
                      className="w-full mt-auto"
                    >
                      Continue as {role.title.split(" ").pop()}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Confidence. Executive Portal secured with role-based access control.
          </p>
        </div>
      </footer>
    </div>
  );
}
