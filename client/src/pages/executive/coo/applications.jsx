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
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
export default function COOApplications() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useQuery({
        queryKey: ["/api/coo/applications"],
        enabled: isAuthenticated && !authLoading,
    }), applications = _b.data, isLoading = _b.isLoading, error = _b.error;
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
        if (error && isUnauthorizedError(error)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [error, toast]);
    var verifyTutor = useMutation({
        mutationFn: function (userId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/coo/verify-tutor/".concat(userId), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/stats"] });
            toast({
                title: "Tutor verified",
                description: "The tutor has been verified and can now be assigned to pods.",
            });
        },
        onError: function (error) {
            if (isUnauthorizedError(error)) {
                toast({
                    title: "Unauthorized",
                    description: "You are logged out. Logging in again...",
                    variant: "destructive",
                });
                setTimeout(function () {
                    window.location.href = "/";
                }, 500);
                return;
            }
            toast({
                title: "Error",
                description: "Failed to verify tutor. Please try again.",
                variant: "destructive",
            });
        },
    });
    var rejectTutor = useMutation({
        mutationFn: function (userId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/coo/reject-tutor/".concat(userId), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/applications"] });
            toast({
                title: "Application rejected",
                description: "The tutor application has been rejected.",
            });
        },
        onError: function (error) {
            if (isUnauthorizedError(error)) {
                toast({
                    title: "Unauthorized",
                    description: "You are logged out. Logging in again...",
                    variant: "destructive",
                });
                setTimeout(function () {
                    window.location.href = "/";
                }, 500);
                return;
            }
            toast({
                title: "Error",
                description: "Failed to reject application. Please try again.",
                variant: "destructive",
            });
        },
    });
    if (authLoading || isLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    var getInitials = function (name) {
        return name
            .split(" ")
            .map(function (n) { return n[0]; })
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    var pendingApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return !app.user.verified; })) || [];
    var verifiedApplications = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.user.verified; })) || [];
    return (<DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Applications</h1>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 border font-semibold px-3 py-1">
            {pendingApplications.length} Pending
          </Badge>
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (<Card className="border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Pending Verification</h2>
            </div>
            <div className="divide-y">
              {pendingApplications.map(function (app) { return (<div key={app.user.id} className="p-6 space-y-4" data-testid={"application-".concat(app.user.id)}>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={app.user.profileImageUrl || undefined} alt={app.user.name}/>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(app.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{app.user.name}</h3>
                      <p className="text-sm text-muted-foreground">{app.user.email}</p>
                      {app.user.grade && app.user.school && (<p className="text-sm text-muted-foreground mt-1">
                          Grade {app.user.grade} • {app.user.school}
                        </p>)}
                    </div>
                  </div>

                  {app.verificationDoc && (<div className="space-y-2 pt-2">
                      <p className="text-sm font-medium">Submitted Documents:</p>
                      <div className="flex gap-2">
                        {app.verificationDoc.fileUrlAgreement && (<Badge variant="outline" className="font-normal">
                            Agreement ✓
                          </Badge>)}
                        {app.verificationDoc.fileUrlConsent && (<Badge variant="outline" className="font-normal">
                            Consent ✓
                          </Badge>)}
                      </div>
                    </div>)}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="gap-2" onClick={function () { return verifyTutor.mutate(app.user.id); }} disabled={verifyTutor.isPending} data-testid={"button-verify-".concat(app.user.id)}>
                      <Check className="w-4 h-4"/>
                      Verify
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={function () { return rejectTutor.mutate(app.user.id); }} disabled={rejectTutor.isPending} data-testid={"button-reject-".concat(app.user.id)}>
                      <X className="w-4 h-4"/>
                      Reject
                    </Button>
                  </div>
                </div>); })}
            </div>
          </Card>)}

        {/* Verified Tutors */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Verified Tutors</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {verifiedApplications.length === 0 ? (<div className="p-12 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No verified tutors yet</p>
              </div>) : (verifiedApplications.map(function (app) { return (<div key={app.user.id} className="p-6 hover-elevate" data-testid={"verified-tutor-".concat(app.user.id)}>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={app.user.profileImageUrl || undefined} alt={app.user.name}/>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(app.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{app.user.name}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200 border text-2xs font-semibold uppercase">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{app.user.email}</p>
                      {app.user.grade && app.user.school && (<p className="text-sm text-muted-foreground mt-1">
                          {app.user.grade} • {app.user.school}
                        </p>)}
                    </div>
                  </div>
                </div>); }))}
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}
