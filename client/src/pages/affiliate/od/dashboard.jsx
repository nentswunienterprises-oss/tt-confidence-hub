var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AffiliateCodeModal } from "@/components/auth/affiliate-code-modal";
import { useUpdateAffiliateCode } from "@/hooks/useUpdateAffiliateCode";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { TrendingUp, Users, BarChart3, Copy, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
export default function OutreachDirectorDashboard() {
    var _this = this;
    var _a;
    var _b = useAuth(), isAuthenticated = _b.isAuthenticated, authLoading = _b.isLoading, user = _b.user;
    var toast = useToast().toast;
    var _c = useState(false), showAffiliateModal = _c[0], setShowAffiliateModal = _c[1];
    var updateAffiliateCode = useUpdateAffiliateCode();
    // Show affiliate code modal if user is parent and missing code
    useEffect(function () {
        if (isAuthenticated &&
            (user === null || user === void 0 ? void 0 : user.role) === "parent" &&
            (!user.affiliateCode || user.affiliateCode === "")) {
            setShowAffiliateModal(true);
        }
        else {
            setShowAffiliateModal(false);
        }
    }, [isAuthenticated, user]);
    // Fetch affiliate performance data
    var _d = useQuery({
        queryKey: ["/api/affiliate/performance"],
        enabled: isAuthenticated && !authLoading,
    }), _e = _d.data, affiliateData = _e === void 0 ? {} : _e, dataLoading = _d.isLoading, dataError = _d.error;
    // Fetch referral metrics
    var _f = useQuery({
        queryKey: ["/api/affiliate/referrals"],
        enabled: isAuthenticated && !authLoading,
    }), _g = _f.data, referralMetrics = _g === void 0 ? {} : _g, referralError = _f.error;
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [isAuthenticated, authLoading, toast]);
    useEffect(function () {
        if (dataError && isUnauthorizedError(dataError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [dataError, toast]);
    useEffect(function () {
        if (referralError && isUnauthorizedError(referralError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [referralError, toast]);
    if (authLoading || dataLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64"/>
          <Skeleton className="h-6 w-96"/>
          <div className="grid md:grid-cols-4 gap-6">
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
          </div>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    var firstName = ((_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.split(" ")[0]) || "Affiliate";
    return (<DashboardLayout>
      <AffiliateCodeModal open={showAffiliateModal} loading={updateAffiliateCode.isLoading} onSubmit={function (code) { return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, updateAffiliateCode.mutateAsync(code)];
                    case 1:
                        _a.sent();
                        toast({ title: "Affiliate code saved!", description: "Thank you for providing your code." });
                        setShowAffiliateModal(false);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        toast({ title: "Error", description: err_1.message, variant: "destructive" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} onClose={function () { }}/>
      <div className="space-y-4 sm:space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Track your referrals and earnings in real-time.
          </p>
        </div>

        {/* Key Metrics - Prominent Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <Users className="w-5 h-5 sm:w-8 sm:h-8 text-primary flex-shrink-0"/>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-4xl font-bold text-foreground">
                  {referralMetrics.totalReferrals || 0}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Encounters
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-primary flex-shrink-0"/>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-4xl font-bold text-foreground">
                  {referralMetrics.conversions || 0}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Leads
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <BarChart3 className="w-5 h-5 sm:w-8 sm:h-8 text-green-500 flex-shrink-0"/>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-4xl font-bold text-foreground">
                  {referralMetrics.conversionRate || "0"}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Closes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Your Unique Affiliate Code */}
        <Card className="p-4 sm:p-6 border shadow-sm">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Your Unique Affiliate Code</h2>
              <p className="text-xs sm:text-base text-muted-foreground">
                Share this code with parents so you get credited when they sign up.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border rounded-lg p-3 sm:p-4 text-center font-mono font-bold text-sm sm:text-base">
                AFIXYY1LLX
              </div>
              <Button variant="default" size="default" className="gap-2 px-3 sm:px-4">
                <Copy className="w-4 h-4"/>
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Referral Dashboard */}
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">My Referrals</h2>
          {dataLoading ? (<Card className="p-6 sm:p-12 text-center border shadow-sm">
              <p className="text-sm sm:text-base text-muted-foreground">Loading referrals...</p>
            </Card>) : (affiliateData === null || affiliateData === void 0 ? void 0 : affiliateData.referrals) && affiliateData.referrals.length > 0 ? (<div className="space-y-3 sm:space-y-4">
              {affiliateData.referrals.map(function (referral) { return (<Card key={referral.id} className="p-3 sm:p-6 border shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-lg truncate">{referral.name || referral.email}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{referral.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={referral.status === 'converted' ? 'default' : 'secondary'} className="text-xs">
                        {referral.status || 'pending'}
                      </Badge>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                        {referral.referralDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>); })}
            </div>) : (<Card className="p-6 sm:p-12 text-center border shadow-sm">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground"/>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Referrals Yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Start sharing your affiliate link to get your first referrals!
              </p>
            </Card>)}
        </div>

        {/* Log Encounter Button */}
        <Button size="default" className="w-full h-12 sm:h-14 text-sm sm:text-lg gap-2">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5"/>
          Log Encounter
        </Button>
      </div>
    </DashboardLayout>);
}
