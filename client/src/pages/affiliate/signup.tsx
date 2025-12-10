import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { QrCode, Users } from "lucide-react";

export default function AffiliateSignup() {
  const [selectedRole, setSelectedRole] = useState<"affiliate" | "od" | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="font-bold text-lg">Affiliate Program</h1>
              <p className="text-xs text-muted-foreground">Earn While Growing</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/affiliate/landing")}
            >
              Back
            </Button>
          </div>
        </header>

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                Choose Your Path
              </h2>
              <p className="text-muted-foreground">
                Select your affiliate journey and start earning
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Affiliate Option */}
              <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => setSelectedRole("affiliate")}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <CardTitle>Affiliate</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Individual referrer using QR codes and links
                  </p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">R100-R150</p>
                    <p className="text-xs text-muted-foreground">per referral</p>
                  </div>
                  <Button className="w-full">
                    Become an Affiliate
                  </Button>
                </CardContent>
              </Card>

              {/* Outreach Director Option */}
              <Card className="cursor-pointer transition-all hover:shadow-lg border-primary/50" onClick={() => setSelectedRole("od")}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>Outreach Director</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Strategic operator managing schools & institutions
                  </p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">R5000+</p>
                    <p className="text-xs text-muted-foreground">per pod filled</p>
                  </div>
                  <Button className="w-full">
                    Become Outreach Director
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="font-bold text-lg">Affiliate Program</h1>
            <p className="text-xs text-muted-foreground">
              {selectedRole === "affiliate" ? "Affiliate Sign Up" : "Outreach Director Sign Up"}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
          >
            Back to Paths
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">
              {selectedRole === "affiliate" ? "Start Earning as an Affiliate" : "Build Your Affiliate Empire"}
            </h2>
            <p className="text-muted-foreground">
              {selectedRole === "affiliate"
                ? "Share your unique QR code and earn commission on every referral."
                : "Manage schools, institutions, and grow your territory for higher commissions."}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => setMode("signup")}
              className="flex-1"
            >
              Sign Up
            </Button>
            <Button
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
              className="flex-1"
            >
              Login
            </Button>
          </div>

          {/* Auth Form */}
          <AuthForm mode={mode} defaultRole={selectedRole} />

          {/* Footer Info */}
          <div className="border-t pt-6">
            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
