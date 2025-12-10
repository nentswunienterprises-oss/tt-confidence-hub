import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Zap, CheckCircle2 } from "lucide-react";

export default function ClientLanding() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">The Confidence Hub</h1>
            <p className="text-xs text-muted-foreground">Your Command Center for Confidence</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/client/signup")}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/client/signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Confidence Isn't Luck 
              <br />
              It's a Skill We Teach.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Give your child the gift of mathematical confidence. Through our Pods, 
              students don't just learn math - they learn to believe in themselves.
            </p>
          </div>
          <Button
            onClick={() => navigate("/client/signup")}
            size="lg"
            className="gap-2"
          >
            Start Your Child's Journey <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">How It Works</h3>
            <p className="text-muted-foreground">Our approach to building confidence</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-primary/10">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Personalized Mentorship</h4>
                    <p className="text-sm text-muted-foreground">
                      Your child gets matched with a trained tutor, online.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-primary/10">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Proven Method</h4>
                    <p className="text-sm text-muted-foreground">
                      Our Confidence Formula targets the root causes of their math anxiety, not just test scores.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-primary/10">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Real Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Weekly progress tracking, honest feedback, and visible confidence growth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">What You Get</h3>
            <p className="text-muted-foreground">Everything your child needs to succeed</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Weekly Progress Updates</h4>
                    <p className="text-sm text-muted-foreground">Real-time insights into your child's growth and next steps</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Structured Sessions</h4>
                    <p className="text-sm text-muted-foreground">Consistent, predictable tutoring schedule that fits your family</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Expert Support</h4>
                    <p className="text-sm text-muted-foreground">Territory Directors who ensure tutor quality and consistency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Free Trial (First 6-8 Weeks)</h4>
                    <p className="text-sm text-muted-foreground">Join an experimental phase at no cost - see if it's right for your family</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Accountability & Growth</h4>
                    <p className="text-sm text-muted-foreground">Reflections, feedback loops, and celebration of wins</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Confidence Blueprint</h4>
                    <p className="text-sm text-muted-foreground">Scientifically-designed system that proves confidence is teachable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 pb-8 mb-8 border-b">
            <div className="space-y-4">
              <h4 className="font-semibold">About TT</h4>
              <p className="text-sm text-muted-foreground">
                Territorial Tutoring is reimagining mathematics education through confidence-first mentorship.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Get Involved</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/operational/landing")}
                  className="text-sm block transition text-muted-foreground hover:text-foreground"
                >
                  Become a Tutor
                </button>
                <button
                  onClick={() => navigate("/affiliate/landing")}
                  className="text-sm block transition text-muted-foreground hover:text-foreground"
                >
                  Affiliate Program
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Contact</h4>
              <p className="text-sm text-muted-foreground">
                Questions? We're here to help.
              </p>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
            <p>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br className="md:hidden" />
              <span className="hidden md:inline"> · </span>
              The Confidence Company.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
