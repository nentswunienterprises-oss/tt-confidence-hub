import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Home, FolderKanban, TrendingUp, AlertCircle, Copy, Users, Target, CheckCircle, LogOut, User, Plus } from "lucide-react";
import { useState } from "react";
import EncounterForm from "@/components/EncounterForm";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Fetch affiliate code
  const { data: codeData } = useQuery<{ code: string }>({
    queryKey: ["/api", "affiliate", "code"],
  });

  // Fetch affiliate stats
  const { data: stats, refetch: refetchStats } = useQuery<{ encounters: number; leads: number; closes: number }>({
    queryKey: ["/api", "affiliate", "stats"],
  });

  const handleCopyCode = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      toast({
        title: "Copied!",
        description: "Your affiliate code has been copied to clipboard",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome Back, {user?.firstName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your unique code with parents and track every step of their journey to tutoring success.
          </p>
        </div>

        {/* Key Metrics - Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 border shadow-sm hover-elevate">
            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground">{stats?.encounters || 0}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Encounters
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-8 border shadow-sm hover-elevate">
            <div className="flex items-start gap-4">
              <Target className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground">{stats?.leads || 0}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Leads
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-8 border shadow-sm hover-elevate">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground">{stats?.closes || 0}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Closes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Affiliate Code Section */}
        <Card className="p-8 border shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Unique Affiliate Code</h2>
              <p className="text-muted-foreground">
                Share this code with parents so you get credited when they sign up.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border rounded-lg p-4 text-center font-mono font-bold">
                {codeData?.code || "Loading..."}
              </div>
              <Button onClick={handleCopyCode} variant="default" size="lg" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>
        </Card>

        {/* Log Encounter Form */}
        <EncounterForm onSuccess={() => {
          refetchStats();
        }} />
      </div>
    </DashboardLayout>
  );
}
