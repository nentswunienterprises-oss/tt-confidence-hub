import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { QrCode, TrendingUp, DollarSign, Users, Zap, Check, ArrowRight, ArrowLeft, Banknote } from "lucide-react";
import { useEffect } from "react";

export default function AffiliateLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back
          </Button>
          
          <div className="hidden md:block">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              AFFILIATE PROGRAM
            </span>
          </div>
          
          <Button
            className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#E63946", color: "white" }}
            onClick={() => navigate("/affiliate/signup")}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 md:pt-20 pb-12 sm:pb-20">
        {/* Mobile Title */}
        <div className="md:hidden text-center mb-6">
          <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            AFFILIATE PROGRAM
          </span>
        </div>
        
        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
            <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
              Earn While Growing Our Community
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
            Turn Your Network
            <br />
            <span style={{ color: "#E63946" }}>Into Income.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
            Join our Affiliate Program and earn competitive commissions by introducing families 
            to Territorial Tutoring's Confidence Pod system.
          </p>

          <Button
            size="lg"
            className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all border-0"
            style={{ backgroundColor: "#E63946", color: "white" }}
            onClick={() => navigate("/affiliate/signup")}
          >
            Start Earning Today
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#1A1A1A" }}>
              How It Works
            </h2>
            <p className="text-lg" style={{ color: "#5A5A5A" }}>
              Simple steps to start earning commissions
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Get Your QR Code", desc: "Log in and generate your unique referral QR code and tracking link." },
              { num: "2", title: "Share With Parents", desc: "Share your QR code and link with schools, community groups, and networks." },
              { num: "3", title: "Track Signups", desc: "See all referrals in real-time with a detailed analytics dashboard." },
              { num: "4", title: "Earn Commission", desc: "Receive commission when referred families enroll in pods." }
            ].map((step) => (
              <Card key={step.num} className="p-6 border-0 shadow-lg text-center" style={{ backgroundColor: "#FFF5ED" }}>
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "#FFF0F0", border: "2px solid #E63946" }}
                >
                  <span 
                    className="text-xl"
                    style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#E63946", fontWeight: "600" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-2" style={{ color: "#1A1A1A" }}>{step.title}</h4>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Types */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
              Choose Your Path
            </h2>
            <p className="text-lg" style={{ color: "#A0A0A0" }}>
              Pick the role that fits your business model
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Affiliate Path */}
            <Card 
              className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              style={{ backgroundColor: "white" }}
              onClick={() => navigate("/affiliate/signup")}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FFF0F0" }}
              >
                <QrCode className="w-8 h-8" style={{ color: "#E63946" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Affiliate
              </h3>
              <p className="mb-6" style={{ color: "#5A5A5A" }}>
                Individual referrer using unique code to drive enrollments
              </p>
              
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#E63946" }}>
                Dashboard Includes
              </p>
              <ul className="space-y-3 mb-6">
                {["Personal QR Code & Tracking Link", "Real-Time Signup Tracking", "Commission Earnings Dashboard", "Performance Analytics", "Marketing Materials Library"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#E63946" }} />
                    <span style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="py-4 mb-6 rounded-xl text-center" style={{ backgroundColor: "#FFF0F0" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5A5A" }}>Commission</p>
                <p className="text-3xl font-bold" style={{ color: "#E63946" }}>R100-R150</p>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>per enrolled student</p>
              </div>
              
              <Button 
                className="w-full rounded-full py-6 font-semibold border-0"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                Become an Affiliate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            {/* Outreach Director Path */}
            <Card 
              className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
              style={{ backgroundColor: "white" }}
              onClick={() => navigate("/affiliate/signup")}
            >
              <div 
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                Popular
              </div>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FFF0F0" }}
              >
                <Users className="w-8 h-8" style={{ color: "#E63946" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Outreach Director
              </h3>
              <p className="mb-6" style={{ color: "#5A5A5A" }}>
                Strategic operator managing schools, institutions, and regional growth
              </p>
              
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#E63946" }}>
                Dashboard Includes
              </p>
              <ul className="space-y-3 mb-6">
                {["Multiple QR Codes & Campaign Links", "School & Institution Partnerships", "Advanced Analytics & Segmentation", "Team Performance Tracking", "Bonus Tier Eligibility & Tracking"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#E63946" }} />
                    <span style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="py-4 mb-6 rounded-xl text-center" style={{ backgroundColor: "#FFF0F0" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#5A5A5A" }}>Commission</p>
                <p className="text-3xl font-bold" style={{ color: "#E63946" }}>R5000+</p>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>per Pod filled + bonuses</p>
              </div>
              
              <Button 
                className="w-full rounded-full py-6 font-semibold border-0"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                Become an Outreach Director
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#1A1A1A" }}>
              Why Join Our Program?
            </h2>
            <p className="text-lg" style={{ color: "#5A5A5A" }}>
              Everything you need to succeed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Real-Time Analytics", desc: "Track your referrals and earnings with live dashboards" },
              { icon: DollarSign, title: "Competitive Commissions", desc: "Earn R100-R150 per enrollment or more with our scale model" },
              { icon: Zap, title: "Easy Sharing", desc: "Share via QR code, link, or direct referral" },
              { icon: Users, title: "Dedicated Support", desc: "Get guidance from our affiliate team" },
              { icon: QrCode, title: "Multiple Marketing Tools", desc: "Access resources to promote effectively" },
              { icon: Banknote, title: "Fast Payouts", desc: "Get paid on time, every time" }
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 border-0 shadow-lg text-center" style={{ backgroundColor: "white" }}>
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: "#FFF0F0" }}
                  >
                    <Icon className="w-7 h-7" style={{ color: "#E63946" }} />
                  </div>
                  <h4 className="font-bold text-lg mb-2" style={{ color: "#1A1A1A" }}>{feature.title}</h4>
                  <p className="text-sm" style={{ color: "#5A5A5A" }}>{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#E63946" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Banknote className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Earning?
          </h2>
          <p className="text-lg mb-10 text-white/80">
            Join hundreds of affiliates and outreach directors already earning with Territorial Tutoring.
          </p>
          <Button
            size="lg"
            className="text-lg font-semibold px-10 py-6 rounded-full border-0"
            style={{ backgroundColor: "white", color: "#E63946" }}
            onClick={() => navigate("/affiliate/signup")}
          >
            Sign Up Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                TERRITORIAL TUTORING
              </span>
              <span className="text-xl font-bold" style={{ color: "#E63946" }}>+</span>
            </div>
            <p className="text-center md:text-right" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-sm">
                Manufacturing Confidence & Financial Independence in South African Youth.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
