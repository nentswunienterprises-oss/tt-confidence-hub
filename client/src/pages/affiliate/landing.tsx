import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { QrCode, TrendingUp, DollarSign, Users, Zap, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function AffiliateLanding() {
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
            <h1 className="font-bold text-lg">Affiliate Program</h1>
            <p className="text-xs text-muted-foreground">Earn While Growing Our Community</p>
          </div>
          <Button
            onClick={() => navigate("/affiliate/signup")}
            className="gap-2"
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
              Turn Your Network 
              <br />
              Into Income.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our Affiliate Program and earn competitive commissions by introducing families 
              to Territorial Tutoring's Confidence Pod system.
            </p>
          </div>
          <Button
            onClick={() => navigate("/affiliate/signup")}
            size="lg"
            className="gap-2"
          >
            Start Earning Today
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">How It Works</h3>
            <p className="text-muted-foreground">Simple steps to start earning commissions</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Get Your QR Code", desc: "Log in and generate your unique referral QR code and tracking link." },
              { num: "2", title: "Share With Parents", desc: "Share your QR code and link with schools, community groups, and networks." },
              { num: "3", title: "Track Signups", desc: "See all referrals in real-time with a detailed analytics dashboard." },
              { num: "4", title: "Earn Commission", desc: "Receive commission when referred families enroll in pods." }
            ].map((step) => (
              <Card key={step.num}>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-primary/10">
                      <span className="font-bold text-primary">{step.num}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Types */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">Choose Your Path</h3>
            <p className="text-muted-foreground">Pick the role that fits your business model</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Affiliate Path */}
            <Card className="relative overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <CardTitle>Affiliate</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Individual referrer using Unique code to drive enrollments
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold">DASHBOARD INCLUDES</p>
                  <ul className="space-y-2">
                    {[
                      "Personal QR Code & Tracking Link",
                      "Real-Time Signup Tracking",
                      "Commission Earnings Dashboard",
                      "Performance Analytics",
                      "Marketing Materials Library"
                    ].map((item) => (
                      <li key={item} className="flex gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-semibold text-center text-muted-foreground">COMMISSION</p>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">R100-R150</p>
                    <p className="text-xs text-muted-foreground">per enrolled student</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/affiliate/signup")}
                  className="w-full"
                  variant="default"
                >
                  Become an Affiliate
                </Button>
              </CardContent>
            </Card>

            {/* Outreach Director Path */}
            <Card className="relative overflow-hidden border-primary/50">
              <div className="absolute top-4 right-4">
                <Badge>Popular</Badge>
              </div>
              <CardHeader className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>Outreach Director</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Strategic operator managing schools, institutions, and regional growth
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold">DASHBOARD INCLUDES</p>
                  <ul className="space-y-2">
                    {[
                      "Multiple QR Codes & Campaign Links",
                      "School & Institution Partnerships",
                      "Advanced Analytics & Segmentation",
                      "Team Performance Tracking",
                      "Bonus Tier Eligibility & Tracking"
                    ].map((item) => (
                      <li key={item} className="flex gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-semibold text-center text-muted-foreground">COMMISSION</p>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">R5000+</p>
                    <p className="text-xs text-muted-foreground">per Pod filled + bonuses</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/affiliate/signup")}
                  className="w-full"
                  variant="default"
                >
                  Become an Outreach Director
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">Why Join Our Program?</h3>
            <p className="text-muted-foreground">Everything you need to succeed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Real-Time Analytics", desc: "Track your referrals and earnings with live dashboards" },
              { icon: DollarSign, title: "Competitive Commissions", desc: "Earn R100-R150 per enrollment or more with our scale model" },
              { icon: Zap, title: "Easy Sharing", desc: "Share via QR code, link, or direct referral" },
              { icon: Users, title: "Dedicated Support", desc: "Get guidance from our affiliate team" },
              { icon: QrCode, title: "Multiple Marketing Tools", desc: "Access resources to promote effectively" },
              { icon: CheckCircle2, title: "Fast Payouts", desc: "Get paid on time, every time" }
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <div className="space-y-4 text-center">
                      <Icon className="w-8 h-8 text-primary mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="space-y-3">
            <h3 className="text-3xl font-bold">Ready to Start Earning?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of affiliates and outreach directors already earning with Territorial Tutoring.
            </p>
          </div>
          <Button
            onClick={() => navigate("/affiliate/signup")}
            size="lg"
            className="gap-2"
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
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
