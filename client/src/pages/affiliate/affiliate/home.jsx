import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Flame } from "lucide-react";
import EncounterForm from "@/components/EncounterForm";
export default function AffiliateDashboard() {
    var _a;
    var toast = useToast().toast;
    var user = useAuth().user;
    // Fetch affiliate code
    var codeData = useQuery({
        queryKey: ["/api", "affiliate", "code"],
    }).data;
    // Fetch affiliate stats
    var _b = useQuery({
        queryKey: ["/api", "affiliate", "stats"],
    }), stats = _b.data, refetchStats = _b.refetch;
    var handleCopyCode = function () {
        if (codeData === null || codeData === void 0 ? void 0 : codeData.code) {
            navigator.clipboard.writeText(codeData.code);
            toast({
                title: "Copied!",
                description: "Your affiliate code has been copied to clipboard",
            });
        }
    };
    var handleCopyLink = function () {
        if (codeData === null || codeData === void 0 ? void 0 : codeData.code) {
            // Build the affiliate link with the actual domain
            var affiliateLink = "https://territorialtutoring.co.za?affiliate=".concat(codeData.code);
            navigator.clipboard.writeText(affiliateLink);
            toast({
                title: "Link Copied!",
                description: "Share this link with parents to track referrals",
            });
        }
    };
    var firstName = (user === null || user === void 0 ? void 0 : user.firstName) || ((_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || 'Affiliate';
    return (<DashboardLayout>
      <div className="space-y-4 sm:space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {firstName}! <Flame className="inline w-5 h-5 sm:w-8 sm:h-8 text-primary"/>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Share your unique code with parents and track every step of their journey to tutoring success.
          </p>
        </div>

        {/* Key Metrics - Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate text-center">
            <p className="text-2xl sm:text-5xl font-bold text-foreground">{(stats === null || stats === void 0 ? void 0 : stats.encounters) || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium mt-1">
              Encounters
            </p>
          </Card>
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate text-center">
            <p className="text-2xl sm:text-5xl font-bold text-foreground">{(stats === null || stats === void 0 ? void 0 : stats.leads) || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium mt-1">
              Leads
            </p>
          </Card>
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate text-center">
            <p className="text-2xl sm:text-5xl font-bold text-foreground">{(stats === null || stats === void 0 ? void 0 : stats.closes) || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium mt-1">
              Closes
            </p>
          </Card>
        </div>

        {/* Affiliate Link Section */}
        <Card className="p-4 sm:p-8 border shadow-sm">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Your Affiliate Link</h2>
              <p className="text-xs sm:text-base text-muted-foreground">
                Share this link with parents. They'll see our full service before signing up.
              </p>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1 bg-background border rounded-lg p-3 sm:p-4 text-left font-mono text-xs sm:text-sm break-all">
                {(codeData === null || codeData === void 0 ? void 0 : codeData.code) ? "territorialtutoring.co.za?affiliate=".concat(codeData.code) : "Loading..."}
              </div>
              <Button onClick={handleCopyLink} variant="default" size="default" className="gap-2 px-3 sm:px-4 whitespace-nowrap">
                <Copy className="w-4 h-4"/>
                <span className="hidden sm:inline">Copy Link</span>
                <span className="sm:hidden">Copy</span>
              </Button>
            </div>
            
            {/* Show code for reference */}
            <div className="pt-3 sm:pt-4 border-t">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Your affiliate code (for reference):</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-background border rounded-lg p-3 sm:p-4 text-center font-mono font-bold text-base sm:text-lg">
                  {(codeData === null || codeData === void 0 ? void 0 : codeData.code) || "Loading..."}
                </div>
                <Button onClick={handleCopyCode} variant="outline" size="default" className="gap-2 px-3 sm:px-4">
                  <Copy className="w-4 h-4"/>
                  <span className="hidden sm:inline">Copy Code</span>
                  <span className="sm:hidden">Copy</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Log Encounter Form */}
        <EncounterForm onSuccess={function () {
            refetchStats();
        }}/>
      </div>
    </DashboardLayout>);
}
