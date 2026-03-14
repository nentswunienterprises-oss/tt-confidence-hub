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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Users, Trash2, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getQueryFn } from "@/lib/queryClient";
export default function COODashboard() {
    var _this = this;
    // Helper functions for Select type compatibility
    var handleAffiliateTypeChange = function (value) { return setAffiliateType(value); };
    var handleSchoolTypeChange = function (value) { return setSchoolType(value); };
    // Affiliate code/link generation UI state
    var _a = useState('person'), affiliateType = _a[0], setAffiliateType = _a[1];
    var _b = useState(""), personName = _b[0], setPersonName = _b[1];
    var _c = useState(""), entityName = _c[0], setEntityName = _c[1];
    var _d = useState(""), schoolType = _d[0], setSchoolType = _d[1];
    var _e = useState(""), generatedCode = _e[0], setGeneratedCode = _e[1];
    var _f = useState(""), generatedLink = _f[0], setGeneratedLink = _f[1];
    var _g = useState(false), creatingAffiliate = _g[0], setCreatingAffiliate = _g[1];
    var _h = useState(""), affiliateError = _h[0], setAffiliateError = _h[1];
    // Affiliate code/link creation handler
    var handleCreateAffiliate = function () { return __awaiter(_this, void 0, void 0, function () {
        var sessionData, accessToken, body, res, data, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setCreatingAffiliate(true);
                    setAffiliateError("");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    sessionData = (_b.sent()).data;
                    accessToken = (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token;
                    if (!accessToken)
                        throw new Error("No access token found. Please log in again.");
                    body = {
                        type: affiliateType,
                        personName: affiliateType === 'person' ? personName : undefined,
                        entityName: affiliateType === 'entity' ? entityName : undefined,
                        schoolType: affiliateType === 'entity' ? schoolType : undefined,
                    };
                    return [4 /*yield*/, fetch("/api/coo/create-affiliate-code", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer ".concat(accessToken)
                            },
                            body: JSON.stringify(body)
                        })];
                case 3:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    data = _b.sent();
                    if (!res.ok)
                        throw new Error(data.message || "Failed to create affiliate");
                    setGeneratedCode(data.code);
                    setGeneratedLink("".concat(window.location.origin, "/client/signup?affiliate=").concat(data.code));
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _b.sent();
                    setAffiliateError(err_1.message || "Unknown error");
                    return [3 /*break*/, 6];
                case 6:
                    setCreatingAffiliate(false);
                    return [2 /*return*/];
            }
        });
    }); };
    // Delete pilot request mutation
    var deletePilotRequestMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var endpoint;
            var id = _b.id, type = _b.type;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        endpoint = type === 'leadership'
                            ? "/api/coo/leadership-pilot-requests/".concat(id)
                            : "/api/coo/earlyintervention-requests/".concat(id);
                        return [4 /*yield*/, apiRequest("DELETE", endpoint)];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/leadership-pilot-requests"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/earlyintervention-requests"] });
            toast({ title: "Pilot request deleted!" });
        },
        onError: function () {
            toast({ title: "Failed to delete pilot request", variant: "destructive" });
        },
    });
    var _j = useAuth(), isAuthenticated = _j.isAuthenticated, authLoading = _j.isLoading;
    var toast = useToast().toast;
    var _k = useState(false), showPodForm = _k[0], setShowPodForm = _k[1];
    var _l = useState(""), podName = _l[0], setPodName = _l[1];
    var _m = useState(false), showDeletedPods = _m[0], setShowDeletedPods = _m[1];
    var _o = useState(false), expandedSalesStats = _o[0], setExpandedSalesStats = _o[1];
    // Fetch all pods
    var _p = useQuery({
        queryKey: ["/api/coo/pods"],
        enabled: isAuthenticated && !authLoading,
    }), _q = _p.data, pods = _q === void 0 ? [] : _q, podsLoading = _p.isLoading, podsError = _p.error;
    // Fetch deleted pods
    var _r = useQuery({
        queryKey: ["/api/coo/deleted-pods"],
        enabled: showDeletedPods && isAuthenticated && !authLoading,
    }).data, deletedPods = _r === void 0 ? [] : _r;
    // Fetch all TDs
    var _s = useQuery({
        queryKey: ["/api/coo/tds"],
        enabled: isAuthenticated && !authLoading,
    }), _t = _s.data, tds = _t === void 0 ? [] : _t, tdsLoading = _s.isLoading, tdsError = _s.error;
    // Fetch sales stats
    var _u = useQuery({
        queryKey: ["/api/coo/sales-stats"],
        enabled: isAuthenticated && !authLoading,
    }), _v = _u.data, salesStats = _v === void 0 ? null : _v, salesStatsLoading = _u.isLoading;
    // Fetch leadership pilot requests for COO
    var _w = useQuery({
        queryKey: ["/api/coo/leadership-pilot-requests"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !authLoading,
        refetchInterval: 10000,
    }), _x = _w.data, leadershipRequests = _x === void 0 ? [] : _x, leadershipLoading = _w.isLoading;
    // Fetch early intervention pilot requests for COO
    var _y = useQuery({
        queryKey: ["/api/coo/earlyintervention-requests"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !authLoading,
        refetchInterval: 10000,
    }), _z = _y.data, earlyInterventionRequests = _z === void 0 ? [] : _z, earlyInterventionLoading = _y.isLoading;
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
        if (podsError && isUnauthorizedError(podsError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [podsError, toast]);
    useEffect(function () {
        if (tdsError && isUnauthorizedError(tdsError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [tdsError, toast]);
    // Fetch all role permissions
    var _0 = useQuery({
        queryKey: ["/api/coo/role-permissions"],
    }), _1 = _0.data, rolePermissions = _1 === void 0 ? [] : _1, permissionsLoading = _0.isLoading;
    // Create pod mutation
    var createPodMutation = useMutation({
        mutationFn: function (podName) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/coo/pods", {
                            podName: podName,
                            podType: "Training",
                            status: "Active",
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            toast({ title: "Pod created successfully!" });
            setPodName("");
            setShowPodForm(false);
        },
        onError: function () {
            toast({ title: "Failed to create pod", variant: "destructive" });
        },
    });
    // Add TD email mutation - no longer used after UI removal
    // Assign TD to pod mutation
    var assignTDMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var tdId = _b.tdId, podId = _b.podId, currentPodId = _b.currentPodId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Check if TD is already assigned to this pod
                        if (currentPodId === podId) {
                            throw new Error("TD already assigned to this pod");
                        }
                        return [4 /*yield*/, apiRequest("POST", "/api/coo/assign-td", {
                                tdId: tdId,
                                podId: podId,
                            })];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/tds"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            toast({ title: "TD assigned to pod!" });
        },
        onError: function (error) {
            if (error.message === "TD already assigned to this pod") {
                toast({ title: "TD already assigned to this pod", variant: "default" });
            }
            else {
                toast({ title: "Failed to assign TD", variant: "destructive" });
            }
        },
    });
    // Delete pod mutation
    var deletePodMutation = useMutation({
        mutationFn: function (podId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/coo/pods/".concat(podId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/tds"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/deleted-pods"] });
            toast({ title: "Pod deleted successfully!" });
        },
        onError: function () {
            toast({ title: "Failed to delete pod", variant: "destructive" });
        },
    });
    // Affiliate Card Component
    var AffiliateCard = function (_a) {
        var affiliate = _a.affiliate;
        var _b = useState(false), expanded = _b[0], setExpanded = _b[1];
        var _c = useState([]), encounters = _c[0], setEncounters = _c[1];
        var _d = useState([]), leads = _d[0], setLeads = _d[1];
        var _e = useState([]), closes = _e[0], setCloses = _e[1];
        var _f = useState(false), loading = _f[0], setLoading = _f[1];
        var loadAffiliateData = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, leadRes, closeRes, leadData, closeData, _b, encRes, leadRes, closeRes, encData, leadData, closeData, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (expanded) {
                            setExpanded(false);
                            return [2 /*return*/];
                        }
                        setLoading(true);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 11, 12, 13]);
                        if (!affiliate.isOrganic) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all([
                                fetch("/api/organic/leads", { credentials: 'include' }),
                                fetch("/api/organic/closes", { credentials: 'include' }),
                            ])];
                    case 2:
                        _a = _c.sent(), leadRes = _a[0], closeRes = _a[1];
                        return [4 /*yield*/, leadRes.json()];
                    case 3:
                        leadData = _c.sent();
                        return [4 /*yield*/, closeRes.json()];
                    case 4:
                        closeData = _c.sent();
                        setEncounters([]);
                        setLeads(leadData || []);
                        setCloses(closeData || []);
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, Promise.all([
                            fetch("/api/affiliate/".concat(affiliate.id, "/encounters"), { credentials: 'include' }),
                            fetch("/api/affiliate/".concat(affiliate.id, "/leads"), { credentials: 'include' }),
                            fetch("/api/affiliate/".concat(affiliate.id, "/closes"), { credentials: 'include' }),
                        ])];
                    case 6:
                        _b = _c.sent(), encRes = _b[0], leadRes = _b[1], closeRes = _b[2];
                        return [4 /*yield*/, encRes.json()];
                    case 7:
                        encData = _c.sent();
                        return [4 /*yield*/, leadRes.json()];
                    case 8:
                        leadData = _c.sent();
                        return [4 /*yield*/, closeRes.json()];
                    case 9:
                        closeData = _c.sent();
                        setEncounters(encData || []);
                        setLeads(leadData || []);
                        setCloses(closeData || []);
                        _c.label = 10;
                    case 10:
                        setExpanded(true);
                        return [3 /*break*/, 13];
                    case 11:
                        error_1 = _c.sent();
                        console.error("Error loading affiliate data:", error_1);
                        toast({ title: "Failed to load affiliate data", variant: "destructive" });
                        return [3 /*break*/, 13];
                    case 12:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        }); };
        return (<Card className="border cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader onClick={loadAffiliateData} className="hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{affiliate.name}</CardTitle>
                {affiliate.isOrganic && (<Badge variant="secondary" className="text-xs">Organic</Badge>)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{affiliate.email}</p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-2xl font-bold">{affiliate.totalLeads}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{affiliate.totalCloses}</p>
                <p className="text-xs text-muted-foreground">Closes</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{affiliate.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conv.</p>
              </div>
              {expanded ? (<ChevronUp className="w-5 h-5 text-muted-foreground"/>) : (<ChevronDown className="w-5 h-5 text-muted-foreground"/>)}
            </div>
          </div>
        </CardHeader>

        {expanded && (<CardContent className="space-y-6 pt-4 border-t">
            {loading ? (<p className="text-muted-foreground">Loading data...</p>) : (<>
                {/* Encounters Section */}
                {encounters.length > 0 && (<div className="space-y-3">
                    <h3 className="font-semibold text-sm">Encounters ({encounters.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {encounters.map(function (enc) { return (<div key={enc.id} className="p-3 bg-gray-50 rounded text-sm">
                          <p className="font-medium">{enc.parent_name}</p>
                          <p className="text-xs text-muted-foreground">{enc.parent_email || enc.parent_phone}</p>
                          {enc.date_met && (<p className="text-xs text-muted-foreground mt-1">
                              {new Date(enc.date_met).toLocaleDateString()}
                            </p>)}
                          {enc.status && (<Badge variant="outline" className="mt-2 text-xs">
                              {enc.status}
                            </Badge>)}
                        </div>); })}
                    </div>
                  </div>)}

                {/* Leads Section */}
                {leads.length > 0 && (<div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Leads ({leads.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {leads.map(function (lead) {
                            var _a;
                            return (<div key={lead.id} className="p-3 bg-blue-50 rounded text-sm">
                          <p className="font-medium">Lead #{(_a = lead.id) === null || _a === void 0 ? void 0 : _a.slice(0, 8)}</p>
                          {lead.tracking_source && (<Badge variant="secondary" className="text-xs">
                              {lead.tracking_source}
                            </Badge>)}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </p>
                        </div>);
                        })}
                    </div>
                  </div>)}

                {/* Closes Section */}
                {closes.length > 0 && (<div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Closes ({closes.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {closes.map(function (close) {
                            var _a;
                            return (<div key={close.id} className="p-3 bg-green-50 rounded text-sm">
                          <p className="font-medium">Close #{(_a = close.id) === null || _a === void 0 ? void 0 : _a.slice(0, 8)}</p>
                          <Badge className="bg-green-600 text-xs">Converted</Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(close.created_at).toLocaleDateString()}
                          </p>
                        </div>);
                        })}
                    </div>
                  </div>)}

                {encounters.length === 0 && leads.length === 0 && closes.length === 0 && (<p className="text-center text-muted-foreground py-4">No data recorded yet</p>)}
              </>)}
          </CardContent>)}
      </Card>);
    };
    return (<DashboardLayout>
      <div className="space-y-8">
        {/* Grade Monitoring System Link */}
        <section>
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Academic Compliance & Grade Monitoring</h3>
                <Button size="sm" variant="default" onClick={function () { return window.location.href = '/executive/coo/grade-monitoring'; }}>
                  Go to Grade Monitoring System
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Protect institutional credibility, enforce tutor discipline, automate consequences, and maintain trust with schools. Full compliance engine for academic review.</p>
            </CardContent>
          </Card>
        </section>
        {/* Sales & Affiliates Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Affiliate Sales</h2>
          
          {salesStatsLoading ? (<Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading affiliate data...
              </CardContent>
            </Card>) : salesStats && salesStats.affiliateDetails && salesStats.affiliateDetails.length > 0 ? (<div className="space-y-3">
              {salesStats.affiliateDetails.map(function (aff) { return (<AffiliateCard key={aff.id} affiliate={aff}/>); })}
            </div>) : (<Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No affiliates yet.
              </CardContent>
            </Card>)}
        </section>

        {/* Pods Section - VIEW ONLY */}
        {/* Pilot Considerations Section - ALL PILOT SUBMISSIONS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Pilot Considerations</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              All pilot program submissions are shown below.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {__spreadArray(__spreadArray([], (leadershipRequests || []), true), (earlyInterventionRequests || []), true).map(function (r) {
            var type = leadershipRequests.some(function (req) { return req.id === r.id; }) ? 'leadership' : 'early';
            return (<Card key={r.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary"/>
                      {r.school_name || r.schoolName || 'School name missing'}
                    </CardTitle>
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={function () { return deletePilotRequestMutation.mutate({ id: r.id, type: type }); }} aria-label="Delete pilot request" disabled={deletePilotRequestMutation.status === 'pending'}>
                      <Trash2 className="w-5 h-5 text-destructive"/>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Contact Full Name:</span>
                        <span className="text-muted-foreground">{r.contact_person_name || r.contactName || r.submitter_name || r.submitterName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Role:</span>
                        <span className="text-muted-foreground">{r.contact_person_role || r.contactRole || r.submitter_role || r.submitterRole || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">{r.contact_person_phone || r.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span className="text-muted-foreground">{r.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Submitted:</span>
                        <span className="text-muted-foreground">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>);
        })}
          </div>
          {(leadershipLoading || earlyInterventionLoading) && (<CardContent className="py-4 text-center text-muted-foreground">Loading pilot requests...</CardContent>)}
          {!leadershipLoading && !earlyInterventionLoading && (__spreadArray(__spreadArray([], (leadershipRequests || []), true), (earlyInterventionRequests || []), true).length === 0) && (<CardContent className="py-4 text-center text-muted-foreground">No pilot requests yet.</CardContent>)}
        </section>
        {/* Pods Section - VIEW ONLY */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Mentorship Groups</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all active mentorship groups. Manage groups in Mentorship Group Management tab.
            </p>
          </div>
          {podsLoading ? (<Card>
              <CardContent className="py-6 text-center text-muted-foreground">Loading pods...</CardContent>
            </Card>) : pods.length === 0 ? (<Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pods created yet. Create your first pod to get started!
              </CardContent>
            </Card>) : (<div className="grid gap-4 sm:grid-cols-2">
              {pods.map(function (pod) {
                var podType = pod.pod_type || pod.podType || 'training';
                var vehicle = pod.vehicle || '4_seater';
                var tdId = pod.td_id || pod.tdId;
                // Format display values
                var typeDisplay = podType === 'training' ? 'Training' : 'Paid';
                var vehicleDisplay = vehicle.replace('_', '-').replace('seater', 'Seater');
                // Find TD name if assigned
                var assignedTD = tdId ? tds.find(function (td) { return td.id === tdId; }) : null;
                return (<Card key={pod.id} data-testid={"card-pod-".concat(pod.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary"/>
                        {pod.pod_name || pod.podName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge variant={pod.status === 'active' ? 'default' : 'secondary'}>
                            {pod.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Type:</span>
                          <span className="text-muted-foreground">{typeDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Vehicle:</span>
                          <span className="text-muted-foreground">{vehicleDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">TD Assigned:</span>
                          <span className="text-muted-foreground">
                            {assignedTD ? (assignedTD.name || assignedTD.email) : 'Not assigned'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>);
            })}
            </div>)}
        </section>

        {/* Territory Directors Section - VIEW ONLY */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Territory Directors</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all TDs and their pod assignments. Manage in Pod Management tab.
            </p>
          </div>

          {tdsLoading ? (<p className="text-muted-foreground">Loading TDs...</p>) : tds.length === 0 ? (<Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No Territory Directors yet.
              </CardContent>
            </Card>) : (<div className="grid gap-4">
              {tds.map(function (td) {
                // Find assigned pod
                var assignedPod = pods.find(function (p) { return p.td_id === td.id || p.tdId === td.id; });
                return (<Card key={td.id} data-testid={"card-td-".concat(td.id)}>
                    <CardContent className="py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{td.name || td.email}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {td.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {assignedPod ? (<div className="text-left sm:text-right">
                              <Badge className="bg-green-600 hover:bg-green-700 text-xs" data-testid={"badge-assigned-".concat(td.id)}>
                                Assigned
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {assignedPod.pod_name || assignedPod.podName}
                              </p>
                            </div>) : (<Badge variant="outline" className="text-xs">Not Assigned</Badge>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>);
            })}
            </div>)}
        </section>

        {/* COO Affiliate Code/Link Generation UI */}
        <section>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Generate Affiliate Code/Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Affiliate Type</Label>
                  <Select value={affiliateType} onValueChange={handleAffiliateTypeChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Person</SelectItem>
                      <SelectItem value="entity">Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {affiliateType === "person" ? (<div>
                    <Label>Person Name</Label>
                    <Input value={personName} onChange={function (e) { return setPersonName(e.target.value); }} placeholder="Enter person name" className="mt-1"/>
                  </div>) : (<>
                    <div>
                      <Label>Entity Name</Label>
                      <Input value={entityName} onChange={function (e) { return setEntityName(e.target.value); }} placeholder="Enter entity name" className="mt-1"/>
                    </div>
                    <div>
                      <Label>School Type</Label>
                      <Select value={schoolType} onValueChange={handleSchoolTypeChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select school type"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>)}
                <Button onClick={handleCreateAffiliate} disabled={creatingAffiliate} className="w-full">
                  {creatingAffiliate ? "Generating..." : "Generate Code & Link"}
                </Button>
                {affiliateError && <p className="text-destructive text-sm mt-2">{affiliateError}</p>}
                {generatedCode && (<div className="mt-4">
                    <Label>Affiliate Code</Label>
                    <Input value={generatedCode} readOnly className="mt-1"/>
                  </div>)}
                {generatedLink && (<div className="mt-2">
                    <Label>Signup Link</Label>
                    <Input value={generatedLink} readOnly className="mt-1"/>
                  </div>)}
                {/* Track Leads Button */}
                <Button variant="outline" className="w-full mt-6" onClick={function () { return window.location.href = '/executive/coo/track-leads'; }}>
                  Track Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>);
}
