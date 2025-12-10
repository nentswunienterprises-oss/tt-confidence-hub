import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Award, BarChart3, BookOpen, Target } from "lucide-react";
import { useEffect } from "react";

export default function OperationalLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
            <h1 className="font-bold text-lg">Operational Portal</h1>
            <p className="text-xs text-muted-foreground">Tutor & Territory Director Hub</p>
          </div>
          <Button
            onClick={() => navigate("/operational/signup")}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Transform Confidence
              <br />
              Change Lives.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything tutors and Territory Directors need to run exceptional Confidence Pods:
              Tracking, feedback, performance management, and student success metrics.
            </p>
          </div>
          <Button
            onClick={() => navigate("/operational/signup")}
            size="lg"
          >
            Join Our Team
          </Button>
        </div>
      </section>

      {/* Role Selection */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">Choose Your Role</h3>
            <p className="text-muted-foreground">Select the path that matches your goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tutor Role */}
            <Card className="hover-elevate transition-all border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Tutor
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Lead in student Confidence Pods and transform mathematical confidence
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Dashboard Includes</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Student Rosters & Profiles</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Weekly Check-In Forms</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Progress Tracking & Reflections</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Feedback & Coaching Notes</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Growth Metrics Dashboard</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate("/operational/signup")}
                  className="w-full"
                >
                  Continue as Tutor
                </Button>
              </CardContent>
            </Card>

            {/* Territory Director Role */}
            <Card className="hover-elevate transition-all border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Territory Director
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Oversee multiple pods, tutors, and ensure quality consistency
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Dashboard Includes</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Tutor Performance Reports</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>All Student Check-Ins (Territory-wide)</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Territory Analytics & KPIs</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Tutor Coaching & Feedback Management</span>
                    </li>
                    <li className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>Enrollment & Retention Tracking</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate("/operational/signup")}
                  className="w-full"
                >
                  Continue as Territory Director
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We're Looking For */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">What We're Looking For</h3>
            <p className="text-muted-foreground">The qualities that make great Tutors and Territory Directors</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tutors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Tutors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Strong math background (high school level minimum)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Natural mentoring ability and student empathy</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Commitment to student confidence (not just grades)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Reliability and consistent presence</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Openness to feedback and continuous learning</span>
                </div>
              </CardContent>
            </Card>

            {/* Territory Directors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Territory Directors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Leadership experience managing teams</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Strategic thinking and operational excellence</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Community relationships (school/parent networks)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Data-driven decision making</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">Passion for educational impact</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
            <br className="md:hidden" />
            <span className="hidden md:inline"> · </span>
            Manufacturing Confidence And Financial Independence in South African Youth.
          </p>
        </div>
      </footer>
    </div>
  );
}
