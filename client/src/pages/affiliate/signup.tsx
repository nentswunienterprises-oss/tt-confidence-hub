import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { QrCode, Compass, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function AffiliateSignup() {
  const [selectedRole, setSelectedRole] = useState<"affiliate" | "od" | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate("/affiliate/landing")}
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Back
            </Button>
            
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              AFFILIATE PROGRAM
            </span>
            
            <div className="w-16 sm:w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20" />

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-3xl space-y-6 sm:space-y-10">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
                <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
                  Choose Your Path
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "#1A1A1A" }}>
                Start Your <span style={{ color: "#E63946" }}>Earning Journey</span>
              </h2>
              <p style={{ color: "#5A5A5A" }}>
                Select your affiliate journey and start earning
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Affiliate Option */}
              <Card 
                className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                style={{ backgroundColor: "white" }}
                onClick={() => setSelectedRole("affiliate")}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: "#FFF0F0" }}
                >
                  <QrCode className="w-8 h-8" style={{ color: "#E63946" }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Affiliate</h3>
                <p className="mb-4" style={{ color: "#5A5A5A" }}>
                  Individual referrer using QR codes and links
                </p>
                <div className="py-3 px-4 rounded-xl mb-6" style={{ backgroundColor: "#FFF0F0" }}>
                  <p className="text-2xl font-bold" style={{ color: "#E63946" }}>R100-R150</p>
                  <p className="text-sm" style={{ color: "#5A5A5A" }}>per referral</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {["Personal QR code", "Real-time tracking", "Easy payouts"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#5A5A5A" }}>
                      <Check className="w-4 h-4" style={{ color: "#E63946" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full rounded-full py-6 font-semibold border-0"
                  style={{ backgroundColor: "#E63946", color: "white" }}
                >
                  Become an Affiliate
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>

              {/* Outreach Director Option */}
              <Card 
                className="p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group relative"
                style={{ backgroundColor: "white" }}
                onClick={() => setSelectedRole("od")}
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
                  <Compass className="w-8 h-8" style={{ color: "#E63946" }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Outreach Director</h3>
                <p className="mb-4" style={{ color: "#5A5A5A" }}>
                  Strategic operator managing schools & institutions
                </p>
                <div className="py-3 px-4 rounded-xl mb-6" style={{ backgroundColor: "#FFF0F0" }}>
                  <p className="text-2xl font-bold" style={{ color: "#E63946" }}>R5000+</p>
                  <p className="text-sm" style={{ color: "#5A5A5A" }}>per pod filled</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {["Multiple campaigns", "School partnerships", "Bonus tiers"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#5A5A5A" }}>
                      <Check className="w-4 h-4" style={{ color: "#E63946" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full rounded-full py-6 font-semibold border-0"
                  style={{ backgroundColor: "#E63946", color: "white" }}
                >
                  Become Outreach Director
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            style={{ color: "#1A1A1A" }}
            onClick={() => setSelectedRole(null)}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back
          </Button>
          
          <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            {selectedRole === "affiliate" ? "AFFILIATE" : "OUTREACH DIRECTOR"}
          </span>
          
          <div className="w-20 sm:w-28" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: "#FFF0F0" }}
            >
              {selectedRole === "affiliate" ? (
                <QrCode className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#E63946" }} />
              ) : (
                <Users className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#E63946" }} />
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#1A1A1A" }}>
              {selectedRole === "affiliate" ? "Start Earning as an Affiliate" : "Build Your Affiliate Empire"}
            </h2>
            <p style={{ color: "#5A5A5A" }}>
              {selectedRole === "affiliate"
                ? "Share your unique QR code and earn commission on every referral."
                : "Manage schools, institutions, and grow your territory for higher commissions."}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 justify-center p-1 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
            <button
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                mode === "signup" ? "shadow-md" : ""
              }`}
              style={{ 
                backgroundColor: mode === "signup" ? "#E63946" : "transparent",
                color: mode === "signup" ? "white" : "#5A5A5A"
              }}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                mode === "login" ? "shadow-md" : ""
              }`}
              style={{ 
                backgroundColor: mode === "login" ? "#E63946" : "transparent",
                color: mode === "login" ? "white" : "#5A5A5A"
              }}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          {/* Auth Form Container */}
          <Card className="p-8 border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <AuthForm mode={mode} defaultRole={selectedRole} />
          </Card>

          {/* Footer Info */}
          <p className="text-xs text-center" style={{ color: "#5A5A5A" }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
