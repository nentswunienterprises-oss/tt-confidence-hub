
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { QrCode, TrendingUp, DollarSign, Compass, Users, Zap, Check, ArrowRight, ArrowLeft, Banknote } from "lucide-react";
import { useEffect } from "react";
import { TTLogo } from "@/components/TTLogo";

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
              INEVITABILITY PARTNERS
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

      <div className="h-16 sm:h-20" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 md:pt-20 pb-12 sm:pb-20">
        <div className="md:hidden text-center mb-6">
          <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            INEVITABILITY PARTNERS
          </span>
        </div>
        
        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
            <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
              Discipline Creates Inevitability
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
            Turn System Integrity
            <br />
            <span style={{ color: "#E63946" }}>Into Income.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
            This isn't influencer marketing or luck-based referrals.  
            It's disciplined outreach aligned to a system that proves inevitable. You execute with integrity. We pay you for converting families into response.
          </p>

          <Button
            size="lg"
            className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all border-0"
            style={{ backgroundColor: "#E63946", color: "white" }}
            onClick={() => navigate("/affiliate/signup")}
          >
            Enter the System
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "#1A1A1A" }}>
              The Inevitability Loop
            </h2>
            <p className="text-sm sm:text-lg" style={{ color: "#5A5A5A" }}>
              Clarity. Systems. Repetition. Results.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[
              { num: "1", title: "Get Assigned", desc: "Receive your unique QR code and referral links inside the system." },
              { num: "2", title: "Execute Outreach", desc: "Share through schools, parents, WhatsApp groups, or communities." },
              { num: "3", title: "Track Reality", desc: "Every scan, signup, and enrollment is logged in real time." },
              { num: "4", title: "Get Paid", desc: "Commissions are triggered by actual enrollments. No fluff." }
            ].map((step) => (
              <Card key={step.num} className="p-3 sm:p-6 border-0 shadow-lg text-center" style={{ backgroundColor: "#FFF5ED" }}>
                <div 
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-5"
                  style={{ backgroundColor: "#FFF0F0", border: "2px solid #E63946" }}
                >
                  <span 
                    className="text-base sm:text-xl"
                    style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#E63946", fontWeight: "600" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-lg mb-1 sm:mb-2" style={{ color: "#1A1A1A" }}>{step.title}</h4>
                <p className="text-[10px] sm:text-sm" style={{ color: "#5A5A5A" }}>{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Types */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
              Choose Your Role
            </h2>
            <p className="text-sm sm:text-lg" style={{ color: "#A0A0A0" }}>
              Same system. Different scale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {/* Affiliate */}
            <Card 
              className="p-4 sm:p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              style={{ backgroundColor: "white" }}
              onClick={() => navigate("/affiliate/signup")}
            >
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FFF0F0" }}
              >
                <QrCode className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "#E63946" }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: "#1A1A1A" }}>
                Affiliate
              </h3>
              <p className="text-xs sm:text-base mb-4 sm:mb-6" style={{ color: "#5A5A5A" }}>
                Individual operator executing referrals inside a defined system
              </p>

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {["Unique QR & Links", "Live Enrollment Tracking", "Transparent Commissions", "Performance Feedback", "Approved Messaging"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "#E63946" }} />
                    <span className="text-xs sm:text-base" style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl text-center" style={{ backgroundColor: "#FFF0F0" }}>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "#E63946" }}>R100–R150</p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>per enrolled student</p>
              </div>

              <Button 
                className="w-full rounded-full py-4 sm:py-6 font-semibold border-0 text-sm sm:text-base"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                Join as Affiliate
              </Button>
            </Card>

            {/* Outreach Director */}
            <Card 
              className="p-4 sm:p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              style={{ backgroundColor: "white" }}
              onClick={() => navigate("/affiliate/signup")}
            >
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FFF0F0" }}
              >
                <Compass className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "#E63946" }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: "#1A1A1A" }}>
                Outreach Director
              </h3>
              <p className="text-xs sm:text-base mb-4 sm:mb-6" style={{ color: "#5A5A5A" }}>
                Regional operator responsible for filling Pods through institutions and schools
              </p>

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {["Multiple Campaign Links", "School Partnerships", "Pod-Level Tracking", "Bonus Eligibility", "Strategic Oversight"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "#E63946" }} />
                    <span className="text-xs sm:text-base" style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl text-center" style={{ backgroundColor: "#FFF0F0" }}>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "#E63946" }}>R5,000+</p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>per Pod filled</p>
              </div>

              <Button 
                className="w-full rounded-full py-4 sm:py-6 font-semibold border-0 text-sm sm:text-base"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                Join as Director
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#E63946" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">
            This Is Not Motivation.
            <br />
            This Is a System.
          </h2>
          <p className="text-sm sm:text-lg mb-6 sm:mb-10 text-white/80">
            If you execute, the outcome is inevitable.
          </p>
          <Button
            size="lg"
            className="text-base sm:text-lg font-semibold px-6 sm:px-10 py-4 sm:py-6 rounded-full border-0"
            style={{ backgroundColor: "white", color: "#E63946" }}
            onClick={() => navigate("/affiliate/signup")}
          >
            Enter the System
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <TTLogo size="md" />
            </div>
            <p className="text-center md:text-right text-xs sm:text-base" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-[10px] sm:text-sm">
                Clarity, discipline, inevitability.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
