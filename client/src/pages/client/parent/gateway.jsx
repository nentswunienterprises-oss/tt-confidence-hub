var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, ArrowLeft, Check } from "lucide-react";
import { TTLogo } from "@/components/TTLogo";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import ProposalView from "@/components/parent/ProposalView";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
export default function ParentGateway() {
    var _this = this;
    // Capture affiliate code from URL or localStorage (set by signup)
    const [affiliateCode, setAffiliateCode] = useState("");
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      let code = params.get("affiliate");
      if (!code) {
        code = localStorage.getItem("affiliate_code");
      }
      if (code) {
        setAffiliateCode(code);
        // Always set localStorage for consistency
        localStorage.setItem("affiliate_code", code);
      }
    }, []);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var navigate = useNavigate();
    var _a = useState("loading"), step = _a[0], setStep = _a[1];
    var _b = useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = useState(false), isProcessingProposal = _c[0], setIsProcessingProposal = _c[1];
    var _d = useState(null), parentCode = _d[0], setParentCode = _d[1];
    var _e = useState(false), isBookingDialogOpen = _e[0], setIsBookingDialogOpen = _e[1];
    var _f = useState(undefined), proposedDate = _f[0], setProposedDate = _f[1];
    var _g = useState(""), proposedTime = _g[0], setProposedTime = _g[1];
    var _h = useState(false), isSubmittingSession = _h[0], setIsSubmittingSession = _h[1];
    var justSubmittedRef = useRef(false);
    var _j = useState(null), debugInfo = _j[0], setDebugInfo = _j[1];
    var _k = useState(false), loadingDebug = _k[0], setLoadingDebug = _k[1];
    var _l = useState(null), debugError = _l[0], setDebugError = _l[1];
    // Fetch current user data
    var user = useQuery({
        queryKey: ["/api/auth/user"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data;
    // Fetch enrollment status
    var enrollmentStatus = useQuery({
        queryKey: ["/api/parent/enrollment-status"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: !!user,
    }).data;
    // Fetch assigned tutor if status is assigned
    var assignedTutor = useQuery({
        queryKey: ["/api/parent/assigned-tutor"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: !!user && ((enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "assigned" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "proposal_sent"),
    }).data;
    // Fetch intro session confirmation if status is assigned
    var introSessionConfirmation = useQuery({
        queryKey: ["/api/parent/intro-session-confirmation"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: !!user && (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "assigned",
        refetchInterval: 10000, // Poll every 10s for status updates
    }).data;
    // Fetch proposal if available
    var _m = useQuery({
        queryKey: ["/api/parent/proposal"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var session, headers, response, errorData, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase.auth.getSession()];
                    case 1:
                        session = (_a.sent()).data.session;
                        headers = {};
                        if (session === null || session === void 0 ? void 0 : session.access_token) {
                            headers["Authorization"] = "Bearer ".concat(session.access_token);
                        }
                        return [4 /*yield*/, fetch("".concat(API_URL, "/api/parent/proposal"), {
                                credentials: "include",
                                headers: headers,
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.status === 404) {
                            console.log("📋 No proposal found (404)");
                            return [2 /*return*/, null];
                        }
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 3:
                        errorData = _a.sent();
                        console.error("Failed to fetch proposal:", response.status, errorData);
                        throw new Error(errorData.message || "Failed to fetch proposal");
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _a.sent();
                        console.log("📋 Proposal received:", data);
                        if (data.parentCode) {
                            setParentCode(data.parentCode);
                        }
                        return [2 /*return*/, data];
                }
            });
        }); },
        enabled: !!user && !!enrollmentStatus,
        retry: false, // Don't retry on 404
    }), proposal = _m.data, proposalLoading = _m.isLoading, proposalError = _m.error;
    // Auto-set step based on enrollment status
    useEffect(function () {
        console.log("🔄 [Gateway] Enrollment status effect triggered", {
            hasEnrollmentStatus: !!enrollmentStatus,
            status: enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status,
            justSubmitted: justSubmittedRef.current,
        });
        // Skip if we just submitted - let the submission handler control the step
        if (justSubmittedRef.current) {
            console.log("  → Skipping because justSubmitted is true");
            return;
        }
        if (!enrollmentStatus) {
            console.log("  → Setting step to 'loading'");
            setStep("loading");
        }
        else if (enrollmentStatus.status === "not_enrolled") {
            console.log("  → Setting step to 'enrollment'");
            setStep("enrollment");
        }
        else if (enrollmentStatus.status === "session_booked" || enrollmentStatus.status === "report_received" || enrollmentStatus.status === "confirmed") {
            console.log("  → REDIRECTING to parent dashboard! Status:", enrollmentStatus.status);
            // Redirect to dashboard after proposal accepted
            setStep("loading"); // Show loading during redirect
            navigate("/client/parent/dashboard", { replace: true });
        }
        else if (enrollmentStatus.status === "awaiting_assignment" || enrollmentStatus.status === "assigned" || enrollmentStatus.status === "proposal_sent") {
            console.log("  → Setting step to 'submitted'");
            setStep("submitted");
        }
        else {
            console.log("  → Unhandled status:", enrollmentStatus.status);
        }
    }, [enrollmentStatus, navigate]);
    // Initialize form with user data
    var _o = useState({
        parentFullName: "",
        parentPhone: "",
        parentEmail: "",
        parentCity: "",
        studentFullName: "",
        studentGrade: "",
        schoolName: "",
        stuckAreas: [],
        mathStruggleAreas: "",
        previousTutoring: "",
        confidenceLevel: "",
        internetAccess: "",
        parentMotivation: "",
        processAlignment: "",
        agreedToTerms: false,
        affiliateCode: affiliateCode,
      }), formData = _o[0], setFormData = _o[1];
    // Auto-fill parent name and email from user data
    useEffect(function () {
        if (user) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { parentEmail: user.email || prev.parentEmail, parentFullName: user.name || (user.first_name && user.last_name ? "".concat(user.first_name, " ").concat(user.last_name).trim() : prev.parentFullName) })); });
        }
    }, [user]);
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var isFormValid = function () {
        return (formData.parentFullName &&
            formData.parentPhone &&
            formData.parentEmail &&
            formData.parentCity &&
            formData.studentFullName &&
            formData.studentGrade &&
            formData.schoolName &&
            formData.mathStruggleAreas &&
            formData.previousTutoring &&
            formData.confidenceLevel &&
            formData.internetAccess &&
            formData.agreedToTerms);
    };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, headers, response, error_1, onboardingType, payload;
        return __generator(this, function (_a) {
          switch (_a.label) {
                case 0:
                  if (!isFormValid()) {
                    toast({
                      title: "Incomplete Form",
                      description: "Please fill in all required fields.",
                      variant: "destructive",
                    });
                    return [2 /*return*/];
                  }
                  // Determine onboarding type
                  // Determine onboarding type
                  onboardingType = 'commercial';
                  // If affiliateCode is present and matches a pilot code, set pilot
                  // Always use affiliateCode from localStorage if present
                  const affCode = localStorage.getItem("affiliate_code") || affiliateCode || formData.affiliateCode;
                  if (affCode && typeof affCode === 'string' && affCode.toUpperCase().startsWith('PILOT')) {
                    onboardingType = 'pilot';
                  } else if (formData.cohortCode && formData.cohortCode.trim().toUpperCase() === 'PILOT2026') {
                    onboardingType = 'pilot';
                  }
                  // Ensure affiliate_code and cohortCode are included if present (snake_case for backend)
                  payload = Object.assign({}, formData, {
                    onboardingType: onboardingType,
                    affiliate_code: affCode || undefined,
                    cohortCode: formData.cohortCode || undefined
                  });
                  setIsSubmitting(true);
                  _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    headers = { "Content-Type": "application/json" };
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers["Authorization"] = "Bearer ".concat(session.access_token);
                    }
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/parent/enroll"), {
                        method: "POST",
                        headers: headers,
                        credentials: "include",
                        body: JSON.stringify(payload),
                      })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to submit enrollment");
                    }
                    // Set flag to prevent useEffect from overriding step
                    justSubmittedRef.current = true;
                    // Invalidate the enrollment status query so it refetches with the new status
                    return [4 /*yield*/, queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] })];
                case 4:
                    // Invalidate the enrollment status query so it refetches with the new status
                    _a.sent();
                    toast({
                        title: "Application Received",
                        description: "We'll assess fit and respond within 48 hours.",
                    });
                    setStep("submitted");
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Enrollment error:", error_1);
                    toast({
                        title: "Error",
                        description: "Failed to submit enrollment. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleAcceptProposal = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, headers, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsProcessingProposal(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    headers = { "Content-Type": "application/json" };
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers["Authorization"] = "Bearer ".concat(session.access_token);
                    }
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/parent/proposal/accept"), {
                            method: "POST",
                            headers: headers,
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to accept proposal");
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    // Store the parent code
                    if (data.parentCode) {
                        setParentCode(data.parentCode);
                    }
                    toast({
                        title: "Proposal Accepted!",
                        description: "Great! Your student code has been generated.",
                    });
                    // Refresh enrollment status
                    queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] });
                    return [3 /*break*/, 7];
                case 5:
                    error_2 = _a.sent();
                    console.error("Error accepting proposal:", error_2);
                    toast({
                        title: "Error",
                        description: "Failed to accept proposal. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setIsProcessingProposal(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDeclineProposal = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, headers, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsProcessingProposal(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    headers = { "Content-Type": "application/json" };
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers["Authorization"] = "Bearer ".concat(session.access_token);
                    }
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/parent/proposal/decline"), {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify({
                                reason: "Parent declined proposal", // Could add a dialog to collect reason
                            }),
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to decline proposal");
                    }
                    toast({
                        title: "Proposal Declined",
                        description: "We'll look for another tutor match.",
                    });
                    queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] });
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    console.error("Error declining proposal:", error_3);
                    toast({
                        title: "Error",
                        description: "Failed to decline proposal. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsProcessingProposal(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleProposeIntroSession = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, headers, response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!proposedDate || !proposedTime) {
                        toast({
                            title: "Missing Information",
                            description: "Please select both a date and time.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    setIsSubmittingSession(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    headers = { "Content-Type": "application/json" };
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers["Authorization"] = "Bearer ".concat(session.access_token);
                    }
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/parent/intro-session/propose"), {
                            method: "POST",
                            headers: headers,
                            credentials: "include",
                            body: JSON.stringify({
                                proposedDate: format(proposedDate, "yyyy-MM-dd"),
                                proposedTime: proposedTime,
                            }),
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to propose session");
                    }
                    toast({
                        title: "Session Proposed",
                        description: "Your tutor will confirm the time shortly.",
                    });
                    setIsBookingDialogOpen(false);
                    setProposedDate(undefined);
                    setProposedTime("");
                    // Refresh confirmation status
                    queryClient.invalidateQueries({ queryKey: ["/api/parent/intro-session-confirmation"] });
                    return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    console.error("Error proposing session:", error_4);
                    toast({
                        title: "Error",
                        description: "Failed to propose session. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsSubmittingSession(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDebugAuthInfo = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, headers, res, json, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingDebug(true);
                    setDebugError(null);
                    setDebugInfo(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    headers = {};
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers["Authorization"] = "Bearer ".concat(session.access_token);
                    }
                    return [4 /*yield*/, fetch("https://tt-confidence-hub-api.onrender.com/api/debug/auth-info", {
                            method: "GET",
                            headers: headers,
                            credentials: "include"
                        })];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    json = _a.sent();
                    setDebugInfo(json);
                    return [3 /*break*/, 7];
                case 5:
                    e_1 = _a.sent();
                    setDebugError(e_1.message || "Unknown error");
                    return [3 /*break*/, 7];
                case 6:
                    setLoadingDebug(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [adjustDate, setAdjustDate] = useState(undefined);
    const [adjustTime, setAdjustTime] = useState("");
    function handleParentConfirmSession() {
      if (!introSessionConfirmation || !introSessionConfirmation.id) {
        toast({ title: "No session to confirm", variant: "destructive" });
        return;
      }
      setIsSubmitting(true);
      fetch(`${API_URL}/api/parent/intro-session-confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: introSessionConfirmation.id }),
      }).then(res => {
        setIsSubmitting(false);
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["/api/parent/intro-session-confirmation"] });
          toast({ title: "Session confirmed!" });
        } else {
          toast({ title: "Failed to confirm session", variant: "destructive" });
        }
      });
    }
    function handleParentAdjustSession() {
      console.log('DEBUG handleParentAdjustSession', { introSessionConfirmation, id: introSessionConfirmation?.id, typeofId: typeof introSessionConfirmation?.id, adjustDate, adjustTime });
      console.log('FULL introSessionConfirmation:', introSessionConfirmation);
      if (!introSessionConfirmation || !introSessionConfirmation.id) {
        toast({ title: "No session to adjust", variant: "destructive" });
        return;
      }
      if (!adjustDate || !adjustTime) {
        toast({ title: "Select date and time", variant: "destructive" });
        return;
      }
      setIsSubmitting(true);
      const formattedDate = typeof adjustDate === 'string' ? adjustDate : format(adjustDate, 'yyyy-MM-dd');
      fetch(`${API_URL}/api/parent/intro-session-adjust`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: introSessionConfirmation.id, newDate: formattedDate, newTime: adjustTime }),
      }).then(res => {
        setIsSubmitting(false);
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["/api/parent/intro-session-confirmation"] });
          toast({ title: "Adjustment proposed!" });
          setIsAdjustDialogOpen(false);
        } else {
          toast({ title: "Failed to propose adjustment", variant: "destructive" });
        }
      });
    }
    return (<div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TTLogo size="md"/>
          </div>
          
          <div className="hidden md:block">
            <span className="text-xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              Cohort Application
            </span>
          </div>
          
          <Button variant="ghost" className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4" style={{ color: "#1A1A1A" }} onClick={function () { return navigate("/"); }}>
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
            Back
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20"/>

      {/* Journey Status Bar */}
      <div style={{ backgroundColor: "#FFF0F0" }}>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex justify-center">
          <div className="flex items-center justify-between w-full max-w-2xl overflow-x-auto">
            {[
            { label: "Applied", status: step === "enrollment" || step === "submitted" },
            { label: "Review", status: (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "awaiting_assignment" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "assigned" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "proposal_sent" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "session_booked" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "report_received" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "confirmed" },
            { label: "Assigned", status: (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "assigned" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "proposal_sent" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "session_booked" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "report_received" || (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "confirmed" },
            { label: "Active", status: (enrollmentStatus === null || enrollmentStatus === void 0 ? void 0 : enrollmentStatus.status) === "confirmed" },
        ].map(function (item, idx, arr) { return (<div key={item.label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition" style={{
                backgroundColor: item.status ? "#E63946" : "transparent",
                borderColor: item.status ? "#E63946" : "#D1D5DB",
                color: item.status ? "white" : "#9CA3AF"
            }}>
                    {item.status ? (<CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4"/>) : (<Circle className="w-3 h-3 sm:w-4 sm:h-4"/>)}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center" style={{ color: "#1A1A1A" }}>{item.label}</span>
                </div>
                {idx < arr.length - 1 && (<div className="flex-1 h-0.5 mx-1 sm:mx-2 transition min-w-[12px]" style={{ backgroundColor: item.status ? "#E63946" : "#E5E5E5" }}/>)}
              </div>); })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        {/* Enrollment Form */}
        {step === "enrollment" && (<Card className="border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl" style={{ color: "#1A1A1A" }}>Application Form</CardTitle>
              <CardDescription className="text-sm" style={{ color: "#5A5A5A" }}>
                Territorial Tutoring - Founding Cohort Application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
              {/* Introduction */}
              <div className="rounded-xl p-4 sm:p-5 space-y-2 sm:space-y-3" style={{ backgroundColor: "#FFF0F0" }}>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: "#E63946" }}>"We train how students respond when certainty disappears."</h3>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  This is the Founding Cohort. Limited families. Serious about response training.
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  TT is not tutoring. It's a performance-conditioning system. Every application is reviewed to ensure fit. This application helps us determine whether our training is appropriate for your child.
                </p>
              </div>

              {/* Parent Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Parent / Guardian Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Full Name *</label>
                    <Input className="text-sm sm:text-base" placeholder="Your full name" value={formData.parentFullName} onChange={function (e) { return handleInputChange("parentFullName", e.target.value); }} autoComplete="name"/>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Phone Number (+27) *</label>
                    <Input className="text-sm sm:text-base" placeholder="+27 71 234 5678" value={formData.parentPhone} onChange={function (e) { return handleInputChange("parentPhone", e.target.value); }} autoComplete="tel"/>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Email Address *</label>
                    <Input className="text-sm sm:text-base" placeholder="your@email.com" value={formData.parentEmail} onChange={function (e) { return handleInputChange("parentEmail", e.target.value); }} autoComplete="email"/>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">City / Suburb *</label>
                    <Input className="text-sm sm:text-base" placeholder="Your city" value={formData.parentCity} onChange={function (e) { return handleInputChange("parentCity", e.target.value); }} autoComplete="address-level2"/>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Student Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Student's Full Name *</label>
                    <Input className="text-sm sm:text-base" placeholder="Student's name" value={formData.studentFullName} onChange={function (e) { return handleInputChange("studentFullName", e.target.value); }} autoComplete="off"/>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>Grade in 2026 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Grade 6", "Grade 7"].map(function (grade) { return (<button key={grade} onClick={function () { return handleInputChange("studentGrade", grade); }} className="px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition" style={{
                    backgroundColor: formData.studentGrade === grade ? "#E63946" : "transparent",
                    color: formData.studentGrade === grade ? "white" : "#1A1A1A",
                    borderColor: formData.studentGrade === grade ? "#E63946" : "#E5E5E5"
                }}>
                          {grade}
                        </button>); })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">School Name *</label>
                    <Input className="text-sm sm:text-base" placeholder="School name" value={formData.schoolName} onChange={function (e) { return handleInputChange("schoolName", e.target.value); }} autoComplete="off"/>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>Where does your child most often get stuck in math?</label>
                    <div className="space-y-2">
                      {[
                { value: "word_problems", label: "Word problems" },
                { value: "tests", label: "Tests" },
                { value: "timed_work", label: "Timed work" },
                { value: "new_topics", label: "New topics" },
                { value: "careless_errors", label: "Careless errors" },
            ].map(function (option) { return (<button key={option.value} type="button" onClick={function () {
                    var currentAreas = formData.stuckAreas || [];
                    var newAreas = currentAreas.includes(option.value)
                        ? currentAreas.filter(function (a) { return a !== option.value; })
                        : __spreadArray(__spreadArray([], currentAreas, true), [option.value], false);
                    handleInputChange("stuckAreas", newAreas);
                }} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition flex items-center gap-2" style={{
                    backgroundColor: (formData.stuckAreas || []).includes(option.value) ? "#E63946" : "#FFF0F0",
                    color: (formData.stuckAreas || []).includes(option.value) ? "white" : "#1A1A1A",
                    borderColor: (formData.stuckAreas || []).includes(option.value) ? "#E63946" : "#FFF0F0"
                }}>
                          <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0" style={{
                    borderColor: (formData.stuckAreas || []).includes(option.value) ? "white" : "#E5E5E5",
                    backgroundColor: (formData.stuckAreas || []).includes(option.value) ? "white" : "transparent"
                }}>
                            {(formData.stuckAreas || []).includes(option.value) && (<Check className="w-3 h-3" style={{ color: "#E63946" }}/>)}
                          </div>
                          {option.label}
                        </button>); })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">What specific math areas does your child struggle with most? *</label>
                    <Input className="text-sm sm:text-base" placeholder="e.g., Algebra, Fractions, Problem Solving..." value={formData.mathStruggleAreas} onChange={function (e) { return handleInputChange("mathStruggleAreas", e.target.value); }} autoComplete="off"/>
                  </div>
                </div>
              </div>

              {/* Background Questions */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Background</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Has your child ever received tutoring before? *</label>
                    <div className="space-y-2">
                      {[
                { value: "formal", label: "Yes - formal paid tutoring" },
                { value: "informal", label: "Yes - informal help from friends/family" },
                { value: "no", label: "No - this will be their first time" },
            ].map(function (option) { return (<button key={option.value} onClick={function () { return handleInputChange("previousTutoring", option.value); }} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition" style={{
                    backgroundColor: formData.previousTutoring === option.value ? "#E63946" : "#FFF0F0",
                    color: formData.previousTutoring === option.value ? "white" : "#1A1A1A",
                    borderColor: formData.previousTutoring === option.value ? "#E63946" : "#FFF0F0"
                }}>
                          {option.label}
                        </button>); })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">When your child hits uncertainty in math, what happens? *</label>
                    <div className="space-y-2">
                      {[
                { value: "very_low", label: "They freeze - can't proceed without help" },
                { value: "low", label: "They rush or guess - emotion hijacks thinking" },
                { value: "average", label: "They try but break under time pressure" },
                { value: "high", label: "They execute a trained response and stay calm" },
            ].map(function (option) { return (<button key={option.value} onClick={function () { return handleInputChange("confidenceLevel", option.value); }} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition" style={{
                    backgroundColor: formData.confidenceLevel === option.value ? "#E63946" : "#FFF0F0",
                    color: formData.confidenceLevel === option.value ? "white" : "#1A1A1A",
                    borderColor: formData.confidenceLevel === option.value ? "#E63946" : "#FFF0F0"
                }}>
                          {option.label}
                        </button>); })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Does your child have access to stable internet and a device for online sessions? *</label>
                    <div className="space-y-2">
                      {[
                { value: "always", label: "Yes, always" },
                { value: "sometimes", label: "Sometimes" },
                { value: "no", label: "No" },
            ].map(function (option) { return (<button key={option.value} onClick={function () { return handleInputChange("internetAccess", option.value); }} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition" style={{
                    backgroundColor: formData.internetAccess === option.value ? "#E63946" : "#FFF0F0",
                    color: formData.internetAccess === option.value ? "white" : "#1A1A1A",
                    borderColor: formData.internetAccess === option.value ? "#E63946" : "#FFF0F0"
                }}>
                          {option.label}
                        </button>); })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Alignment */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Process Alignment (Required)</h4>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>Are you willing to allow sessions without encouragement, reassurance, or emotional coaching? *</label>
                  <div className="space-y-2">
                    {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
            ].map(function (option) { return (<button key={option.value} type="button" onClick={function () { return handleInputChange("processAlignment", option.value); }} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition" style={{
                    backgroundColor: formData.processAlignment === option.value ? "#E63946" : "#FFF0F0",
                    color: formData.processAlignment === option.value ? "white" : "#1A1A1A",
                    borderColor: formData.processAlignment === option.value ? "#E63946" : "#FFF0F0"
                }}>
                        {option.label}
                      </button>); })}
                  </div>
                </div>
              </div>

              {/* Parent Agreement */}
              <div className="space-y-3 rounded-xl p-4 sm:p-5" style={{ backgroundColor: "#FFF0F0" }}>
                <h4 className="font-semibold text-xs sm:text-sm" style={{ color: "#1A1A1A" }}>Parent Agreement *</h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                "I understand placement in the Founding Cohort is limited and not guaranteed.",
                "I consent for my child to participate in TT's response-conditioning system.",
                "I'll support my child's attendance, communication, and progress.",
                "I understand TT may use anonymized results or testimonials for success case studies.",
                "I understand the program structure and commitment expectations.",
            ].map(function (agreement, idx) { return (<div key={idx} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }}/>
                      <span style={{ color: "#5A5A5A" }}>{agreement}</span>
                    </div>); })}
                </div>
                <button onClick={function () { return handleInputChange("agreedToTerms", !formData.agreedToTerms); }} className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer" style={{ color: "#1A1A1A" }}>
                  <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center" style={{
                borderColor: formData.agreedToTerms ? "#E63946" : "#E5E5E5",
                backgroundColor: formData.agreedToTerms ? "#E63946" : "white"
            }}>
                    {formData.agreedToTerms && <Check className="w-3 h-3 text-white"/>}
                  </div>
                  I agree to the above terms
                </button>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting} className="w-full rounded-full font-semibold text-sm sm:text-base" size="lg" style={{ backgroundColor: "#E63946", color: "white" }}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>

              <p className="text-[10px] sm:text-xs text-center" style={{ color: "#5A5A5A" }}>
                Limited spots available. All applications are reviewed individually.
              </p>
            </CardContent>
          </Card>)}

        {/* Submitted Confirmation */}
        {step === "submitted" && enrollmentStatus && (<Card className="text-center border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-sm sm:text-lg" style={{ color: "#1A1A1A" }}>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#E63946" }}/>
                {enrollmentStatus.status === "awaiting_assignment" && "Application Being Assessed"}
                {enrollmentStatus.status === "assigned" && "Your tutor has been assigned"}
                {enrollmentStatus.status === "proposal_sent" && "Training Proposal Ready"}
                {enrollmentStatus.status === "session_booked" && "Proposal Accepted"}
                {enrollmentStatus.status === "report_received" && "Awaiting Report"}
                {enrollmentStatus.status === "confirmed" && "Active"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentStatus.status === "awaiting_assignment" && (<>
                  <p className="text-muted-foreground">
                    Application received. We're assessing fit.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We match each student with the right tutor. Response within 48 hours.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 text-left">
                    <p className="text-sm font-medium mb-2">What happens next:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>We assess your application</li>
                      <li>If accepted, we assign a tutor</li>
                      <li>You receive a training proposal</li>
                      <li>Review it. Accept or decline.</li>
                    </ul>
                  </div>
                </>)}
              {enrollmentStatus.status === "assigned" && (<>
                  {/* Show assigned tutor info */}
                  {assignedTutor && (<div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        {assignedTutor.profile_image_url ? (<img src={assignedTutor.profile_image_url} alt={assignedTutor.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0" onError={function (e) {
                            e.currentTarget.style.display = 'none';
                        }}/>) : null}
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg">{assignedTutor.name}</h3>
                          {assignedTutor.bio && (<p className="text-sm text-red-900 mt-1">{assignedTutor.bio}</p>)}
                          {assignedTutor.email && (<p className="text-sm text-red-900 mt-1">📧 {assignedTutor.email}</p>)}
                        </div>
                      </div>
                    </div>)}

                  {/* Show session status */}
                  {(introSessionConfirmation === null || introSessionConfirmation === void 0 ? void 0 : introSessionConfirmation.status) === "pending_tutor_confirmation" && (<div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-red-400/30 border-t-red-600 rounded-full animate-spin flex-shrink-0"/>
                        <div>
                          <p className="font-medium text-red-900">Waiting for tutor confirmation</p>
                          {introSessionConfirmation.scheduled_time && (<p className="text-xs text-red-700 mt-1">Proposed time: {new Date(introSessionConfirmation.scheduled_time).toLocaleString()}</p>)}
                        </div>
                      </div>
                    </div>)}
                  {(introSessionConfirmation === null || introSessionConfirmation === void 0 ? void 0 : introSessionConfirmation.status) === "pending_parent_confirmation" && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-yellow-400/30 border-t-yellow-600 rounded-full animate-spin flex-shrink-0" />
                        <div>
                          <p className="font-medium text-yellow-900">Tutor proposed a different time. Please confirm or adjust.</p>
                          {introSessionConfirmation.scheduled_time && (
                            <p className="text-xs text-yellow-700 mt-1">Proposed time: {new Date(introSessionConfirmation.scheduled_time).toLocaleString()}</p>
                          )}
                          <div className="mt-3 flex gap-1 items-center">
                            <Button
                              size="sm"
                              onClick={handleParentConfirmSession}
                              disabled={isSubmitting}
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              {isSubmitting ? "Confirming..." : "Confirm"}
                            </Button>
                            <span className="mx-1 text-muted-foreground">or</span>
                            <div className="relative">
                              <button
                                type="button"
                                className="border rounded px-1 py-0.5 text-xs w-[110px] bg-white"
                                onClick={() => setShowDatePicker(true)}
                              >
                                {adjustDate ? format(adjustDate, "PPP") : "Pick date"}
                              </button>
                              {showDatePicker && (
                                <div className="absolute z-10 bg-white border rounded p-2 flex gap-2 items-center" style={{ top: '110%', left: 0 }}>
                                  <input
                                    type="date"
                                    value={adjustDate ? format(adjustDate, "yyyy-MM-dd") : ""}
                                    onChange={e => {
                                      setAdjustDate(new Date(e.target.value));
                                      setShowDatePicker(false);
                                    }}
                                    autoFocus
                                  />
                                  <button type="button" className="text-xs px-2 py-1" onClick={() => setShowDatePicker(false)}>✕</button>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button
                                type="button"
                                className="border rounded px-1 py-0.5 text-xs w-[90px] bg-white"
                                onClick={() => setShowTimePicker(true)}
                              >
                                {adjustTime ? adjustTime : "Pick time"}
                              </button>
                              {showTimePicker && (
                                <div className="absolute z-10 bg-white border rounded p-2 flex gap-2 items-center" style={{ top: '110%', left: 0 }}>
                                  <input
                                    type="time"
                                    value={adjustTime}
                                    onChange={e => {
                                      setAdjustTime(e.target.value);
                                      setShowTimePicker(false);
                                    }}
                                    autoFocus
                                  />
                                  <button type="button" className="text-xs px-2 py-1" onClick={() => setShowTimePicker(false)}>✕</button>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleParentAdjustSession}
                              disabled={isSubmitting || !adjustDate || !adjustTime}
                            >
                              {isSubmitting ? "Adjusting..." : "Adjust"}
                            </Button>
                          </div>
                          {(adjustDate && adjustTime) && (
                            <div className="text-[11px] text-muted-foreground mt-2">New: {format(adjustDate, "PPP")} {adjustTime}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {(introSessionConfirmation === null || introSessionConfirmation === void 0 ? void 0 : introSessionConfirmation.status) === "confirmed" && (<div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-medium text-green-900">Your session has been confirmed</p>
                      {introSessionConfirmation.scheduled_time && (<p className="text-sm text-green-700 mt-2">Scheduled for: {new Date(introSessionConfirmation.scheduled_time).toLocaleString()}</p>)}
                      <p className="text-sm text-green-700 mt-2">You will receive an introductory report and proposal here after you've had your intro session</p>
                    </div>)}
                  {(introSessionConfirmation === null || introSessionConfirmation === void 0 ? void 0 : introSessionConfirmation.status) === "not_scheduled" && (<div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900 mb-4">Schedule your introductory session</p>
                      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                        <DialogTrigger asChild>
                          <Button style={{ backgroundColor: '#E63946', color: 'white' }} className="w-full">Book Introductory Session</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Propose Session Time</DialogTitle>
                            <DialogDescription>
                              Select a date and time for your introductory session with {assignedTutor === null || assignedTutor === void 0 ? void 0 : assignedTutor.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Date</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left">
                                    {proposedDate ? format(proposedDate, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={proposedDate} onSelect={setProposedDate} disabled={function (date) { return date < new Date(new Date().setHours(0, 0, 0, 0)); }}/>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Time</label>
                              <Input type="time" value={proposedTime} onChange={function (e) { return setProposedTime(e.target.value); }} className="mt-1"/>
                            </div>
                            <Button onClick={handleProposeIntroSession} disabled={isSubmittingSession} className="w-full">
                              {isSubmittingSession ? "Proposing..." : "Propose Time"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>)}
                </>)}
              {enrollmentStatus.status === "proposal_sent" && (<>
                  <p className="text-muted-foreground mb-4">
                    Your training proposal is ready.
                  </p>
                  
                  {(function () {
                    console.log("📋 Proposal status - Loading:", proposalLoading, "Error:", proposalError, "Data:", proposal);
                    if (proposalLoading) {
                        return (<div className="bg-muted/30 rounded-lg p-4 text-center">
                          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"/>
                          <p className="text-sm text-muted-foreground">Loading your proposal...</p>
                        </div>);
                    }
                    if (proposalError) {
                        return (<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-red-600">Failed to load proposal. Please refresh the page.</p>
                          <p className="text-xs text-red-500 mt-2">{proposalError.message}</p>
                        </div>);
                    }
                    if (proposal) {
                        console.log("📋 Rendering ProposalView with:", proposal);
                        return (<ProposalView proposal={proposal} showActions={true} onAccept={handleAcceptProposal} onDecline={handleDeclineProposal} isProcessing={isProcessingProposal}/>);
                    }
                    return (<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-600">Proposal is being prepared. Check back soon.</p>
                      </div>);
                })()}
                </>)}
              {(enrollmentStatus.status === "session_booked" || enrollmentStatus.status === "report_received" || enrollmentStatus.status === "confirmed") && (<>
                  {parentCode ? (<Card className="border-2 border-primary mb-4 sm:mb-6">
                      <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-xl">Student Access Code</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Give this to your child. They'll use it to create their account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 rounded-lg text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Student Code</p>
                          <div className="text-2xl sm:text-4xl font-bold tracking-wider text-primary mb-3 sm:mb-4">
                            {parentCode}
                          </div>
                          <Button variant="outline" onClick={function () {
                        navigator.clipboard.writeText(parentCode);
                        toast({
                            title: "Copied",
                            description: "Code copied",
                        });
                    }} className="gap-2 text-xs sm:text-sm">
                            Copy Code
                          </Button>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <h4 className="font-semibold text-xs sm:text-sm mb-2">What happens next:</h4>
                          <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
                            <li>1. Give this code to your child</li>
                            <li>2. They visit the student portal</li>
                            <li>3. They enter this code during account creation</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>) : (<Card className="border-2 border-primary mb-4 sm:mb-6">
                      <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-xl">Generate Student Code</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Create your child's access code
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                            Proposal accepted. Generate a code for your child to create their account.
                          </p>
                          <Button onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                        var session, headers, response, data, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, supabase.auth.getSession()];
                                case 1:
                                    session = (_a.sent()).data.session;
                                    headers = { "Content-Type": "application/json" };
                                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                                        headers["Authorization"] = "Bearer ".concat(session.access_token);
                                    }
                                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/parent/generate-student-code"), {
                                            method: "POST",
                                            headers: headers,
                                            credentials: "include",
                                        })];
                                case 2:
                                    response = _a.sent();
                                    return [4 /*yield*/, response.json()];
                                case 3:
                                    data = _a.sent();
                                    if (response.ok && data.parentCode) {
                                        setParentCode(data.parentCode);
                                        toast({
                                            title: "Code Generated!",
                                            description: "Your student access code is ready.",
                                        });
                                    }
                                    else {
                                        throw new Error(data.message || "Failed to generate code");
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_5 = _a.sent();
                                    console.error("❌ Error generating code:", error_5);
                                    toast({
                                        title: "Error",
                                        description: error_5.message || "Failed to generate student code. Please try again.",
                                        variant: "destructive",
                                    });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); }} className="w-full" size="lg">
                            Generate Student Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}
                </>)}
            </CardContent>
          </Card>)}

        {/* Loading State */}
        {step === "loading" && (<Card className="text-center">
            <CardContent className="py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"/>
              <p className="text-muted-foreground">Loading your enrollment status...</p>
            </CardContent>
          </Card>)}
      </div>
    </div>);
}

// ...existing code...
// Move these inside ParentGateway:
// ...existing code...
