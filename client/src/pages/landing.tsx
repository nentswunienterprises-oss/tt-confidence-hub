import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  TrendingUp,
  BookOpen,
  Users,
  Target,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Landing() {
  const [activeSection, setActiveSection] = useState<"signup" | "login">("signup");
  const signupSectionRef = useRef<HTMLDivElement>(null);
  const loginSectionRef = useRef<HTMLDivElement>(null);

  // Scroll detection to highlight correct button
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === signupSectionRef.current) {
            setActiveSection("signup");
          } else if (entry.target === loginSectionRef.current) {
            setActiveSection("login");
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (signupSectionRef.current) {
      observer.observe(signupSectionRef.current);
    }
    if (loginSectionRef.current) {
      observer.observe(loginSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section
  const scrollToSection = (section: "signup" | "login") => {
    const targetRef = section === "signup" ? signupSectionRef : loginSectionRef;
    targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-bold text-lg text-foreground">
                TT Confidence Hub
              </h1>
              <p className="text-xs text-muted-foreground">
                Your Command Center for Confidence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={activeSection === "login" ? "default" : "ghost"}
              data-testid="button-login"
              onClick={() => window.location.href = "/auth?mode=login"}
            >
              Login
            </Button>
            <Button
              variant={activeSection === "signup" ? "default" : "ghost"}
              data-testid="button-signup"
              onClick={() => window.location.href = "/auth?mode=signup"}
              className="font-semibold"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Signup */}
      <section ref={signupSectionRef} className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Left - Auth Call to Action */}
          <Card className="p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Join TT Confidence Hub</h2>
              <p className="text-muted-foreground text-lg">
                Start your journey to building confidence today
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/30">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure Sign-Up</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your account with email and password
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/30">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Get started immediately - no lengthy forms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/30">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Role-Based Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalized experience for Tutors, TDs, and COOs
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full font-semibold text-lg h-14"
              onClick={() => (window.location.href = "/auth?mode=signup")}
              data-testid="button-get-started"
            >
              Get Started - Sign Up Now
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? Scroll down to choose your role
            </p>
          </Card>

          {/* Right - Value Proposition */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Transform Confidence,
                <br />
                Change Lives
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join South Africa's most powerful tutoring revolution.
                <br />
                <span className="font-medium text-foreground">
                  Build confidence first, grades follow naturally.
                </span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pod System</h3>
                  <p className="text-muted-foreground">
                    Collaborative learning in structured groups
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Growth Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor progress and build lasting habits
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Confidence Blueprint</h3>
                  <p className="text-muted-foreground">
                    Proven formula for confidence transformation
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-accent/50 rounded-xl border border-primary/20">
              <p className="text-muted-foreground italic">
                "Build confidence first, grades follow naturally."
              </p>
            </div>
          </div>
        </div>

        {/* Role Cards - Login Section */}
        <div ref={loginSectionRef} className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Choose Your Role</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Tutor Role */}
            <Card 
              className="p-6 space-y-4 border hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => (window.location.href = "/auth")}
              data-testid="card-role-tutor"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Tutor</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Execute & Grow
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>View your pod & assigned students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Log sessions & write reflections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Track academic progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Access the Confidence Blueprint</span>
                </li>
              </ul>
            </Card>

            {/* TD Role */}
            <Card 
              className="p-6 space-y-4 border hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => (window.location.href = "/auth")}
              data-testid="card-role-td"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Territory Director</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Lead & Support
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Oversee pod operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Monitor tutor performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Track student progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Provide mentorship</span>
                </li>
              </ul>
            </Card>

            {/* COO Role */}
            <Card 
              className="p-6 space-y-4 border hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => (window.location.href = "/auth")}
              data-testid="card-role-coo"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">COO</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    System Control
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Review & approve applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Create & launch pods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Assign students & tutors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>System-wide broadcasts</span>
                </li>
              </ul>
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
