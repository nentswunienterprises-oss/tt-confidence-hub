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
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowLeft, FileText, Upload, AlertCircle, Loader2, Clock, ExternalLink, Users } from "lucide-react";
import { TTLogo } from "@/components/TTLogo";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { ApplicationForm } from "@/components/tutor/application-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export default function TutorGateway() {
    var _this = this;
    // ...existing code...
    // ...existing code...
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var navigate = useNavigate();
    var _a = useState("loading"), step = _a[0], setStep = _a[1];
    var _b = useState(false), showApplicationForm = _b[0], setShowApplicationForm = _b[1];
    var justSubmittedRef = useRef(false);
    var _c = useState(null), uploadingDoc = _c[0], setUploadingDoc = _c[1];
    var trialAgreementInputRef = useRef(null);
    var parentConsentInputRef = useRef(null);
    // Fetch current user data
    // Use shared auth hook which waits for Supabase session restore
    var _d = useAuth(), user = _d.user, userLoading = _d.isLoading, isAuthenticated = _d.isAuthenticated;
    // Fetch aggregated gateway session
    var _e = useQuery({
        queryKey: ["/api/tutor/gateway-session"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated,
        retry: 3,
        retryDelay: function (attemptIndex) { return Math.min(1000 * Math.pow(2, attemptIndex), 5000); },
    }), gatewaySession = _e.data, gatewayLoading = _e.isLoading, gatewayError = _e.error;
    // Debug: log the gateway session response
    useEffect(function () {
        if (gatewaySession) {
            console.log("🔍 gatewaySession response:", gatewaySession);
        }
    }, [gatewaySession]);
    // Extract application status, pod assignment, etc. from gatewaySession
    var applicationStatus = (gatewaySession === null || gatewaySession === void 0 ? void 0 : gatewaySession.applicationStatus) || null;
    var podData = {
        assignment: gatewaySession === null || gatewaySession === void 0 ? void 0 : gatewaySession.assignment,
        students: gatewaySession === null || gatewaySession === void 0 ? void 0 : gatewaySession.students,
    };
    var hasPodAssignment = !!podData.assignment;
    // Province, role, enrollmentStatus, verificationStatus available as needed
    // const province = gatewaySession?.province;
    // const role = gatewaySession?.role;
    // const enrollmentStatus = gatewaySession?.enrollmentStatus;
    // const verificationStatus = gatewaySession?.verificationStatus;
    // Loading and error states
    var appStatusLoading = gatewayLoading;
    var appStatusError = gatewayError;
    // Document upload mutation
    var uploadDocumentMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var readFileAsBase64, base64, ext, fileName, response, text;
            var documentType = _b.documentType, file = _b.file;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(applicationStatus === null || applicationStatus === void 0 ? void 0 : applicationStatus.applicationId) || !(user === null || user === void 0 ? void 0 : user.id)) {
                            throw new Error("Missing application or user info");
                        }
                        readFileAsBase64 = function (fileToRead) {
                            return new Promise(function (resolve, reject) {
                                var reader = new FileReader();
                                reader.onload = function () {
                                    var result = reader.result;
                                    // result is like: data:<mime>;base64,XXXX
                                    var parts = result.split(',', 2);
                                    resolve(parts[1]);
                                };
                                reader.onerror = function (err) { return reject(err); };
                                reader.readAsDataURL(fileToRead);
                            });
                        };
                        return [4 /*yield*/, readFileAsBase64(file)];
                    case 1:
                        base64 = _c.sent();
                        ext = file.name.split('.').pop();
                        fileName = "".concat(user.id, "/").concat(documentType, "_").concat(Date.now(), ".").concat(ext);
                        return [4 /*yield*/, fetch("".concat(API_URL, "/api/tutor/onboarding-documents/upload"), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                    applicationId: applicationStatus.applicationId,
                                    documentType: documentType,
                                    fileName: fileName,
                                    fileData: base64,
                                    fileType: file.type,
                                }),
                            })];
                    case 2:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        text = _c.sent();
                        throw new Error("Upload failed: ".concat(response.status, " ").concat(text));
                    case 4: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
            toast({
                title: "Document Uploaded",
                description: "Your document has been submitted for verification.",
            });
        },
        onError: function (error) {
            toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive",
            });
        },
        onSettled: function () {
            setUploadingDoc(null);
        },
    });
    // Handle file selection
    var handleFileChange = function (event, documentType) { return __awaiter(_this, void 0, void 0, function () {
        var file, allowedTypes;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a PDF or image file (JPEG, PNG)",
                    variant: "destructive",
                });
                return [2 /*return*/];
            }
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "File Too Large",
                    description: "Please upload a file smaller than 10MB",
                    variant: "destructive",
                });
                return [2 /*return*/];
            }
            setUploadingDoc(documentType);
            uploadDocumentMutation.mutate({ documentType: documentType, file: file });
            // Reset input
            event.target.value = "";
            return [2 /*return*/];
        });
    }); };
    // Auto-set step based on application status
    useEffect(function () {
        if (justSubmittedRef.current) {
            return;
        }
        // While user auth is loading, show loading
        if (userLoading || !isAuthenticated) {
            console.log("🔄 gateway: waiting for auth", { userLoading: userLoading, isAuthenticated: isAuthenticated });
            setStep("loading");
            return;
        }
        // If application-status query is still loading, show loading
        if (appStatusLoading) {
            console.log("🔄 gateway: fetching application status...");
            setStep("loading");
            return;
        }
        // If there was an error fetching application status, try to proceed or show error
        if (appStatusError) {
            console.error("❌ gateway: error fetching application status:", appStatusError);
            // Still show loading UI but don't get stuck forever
            setStep("loading");
            return;
        }
        // Now we have the application status data (or it's null/undefined)
        console.log("✅ gateway: application status resolved:", applicationStatus);
        if (!applicationStatus) {
            // Either the user has no application record (not_applied) or error occurred
            // Default to application form
            console.log("📋 gateway: no application status, showing form");
            setStep("application");
        }
        else if (applicationStatus.status === "not_applied") {
            setStep("application");
        }
        else if (applicationStatus.status === "confirmed") {
            // If confirmed, show submitted view — if assigned, show Assigned stage with Continue button
            setStep("submitted");
        }
        else {
            // pending, approved, verification states
            setStep("submitted");
        }
    }, [applicationStatus, appStatusLoading, appStatusError, userLoading, isAuthenticated, navigate, hasPodAssignment]);
    // Mark onboarding complete (tutor clicked Continue to Dashboard)
    var completeOnboarding = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, text, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(applicationStatus === null || applicationStatus === void 0 ? void 0 : applicationStatus.applicationId))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    setUploadingDoc(null);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/tutor/complete-onboarding"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ applicationId: applicationStatus.applicationId }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.text()];
                case 3:
                    text = _a.sent();
                    throw new Error("Failed to complete onboarding: ".concat(res.status, " ").concat(text));
                case 4:
                    queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
                    navigate("/tutor/pod", { replace: true });
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    toast({ title: "Error", description: err_1.message || "Failed to continue", variant: "destructive" });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Determine current journey stage for progress bar
    var getStageStatus = function (stage) {
        if (!applicationStatus)
            return false;
        var statusOrder = ["not_applied", "pending", "approved", "verification", "confirmed"];
        var currentIndex = statusOrder.indexOf(applicationStatus.status);
        switch (stage) {
            case "Application":
                return currentIndex >= 0;
            case "Review":
                return currentIndex >= 1;
            case "Verification":
                return currentIndex >= 2; // Approved means they can start verification
            case "Assigned":
                return currentIndex >= 4 && hasPodAssignment; // Confirmed + has pod
            default:
                return false;
        }
    };
    return (<div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TTLogo size="md"/>
          </div>
          
          <div className="hidden md:block">
            <span className="text-xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              System Entry
            </span>
          </div>
          
          <Button variant="ghost" className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4" style={{ color: "#1A1A1A" }} onClick={function () { return window.history.back(); }}>
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
            { label: "Application", status: getStageStatus("Application") },
            { label: "Review", status: getStageStatus("Review") },
            { label: "Verification", status: getStageStatus("Verification") },
            { label: "Assigned", status: getStageStatus("Assigned") },
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
        {/* Application Prompt */}
        {step === "application" && (<Card className="border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl" style={{ color: "#1A1A1A" }}>Founding Team Application</CardTitle>
              <CardDescription className="text-sm" style={{ color: "#5A5A5A" }}>
                Territorial Tutoring - Join Our Founding Cohort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              {/* Introduction */}
              <div className="rounded-xl p-4 sm:p-5 space-y-2 sm:space-y-3" style={{ backgroundColor: "#FFF0F0" }}>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: "#E63946" }}>"Systems produce results. Everything else produces noise."</h3>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  TT operates on structure. Tutors execute a system - not improvisation, not personality, not motivation.
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  This application determines if you're ready to execute with precision. If you need creative freedom, this isn't for you.
                </p>
              </div>

              {/* What to Expect */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>Application Process:</h4>
                <ul className="space-y-2 text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }}/>
                    <span>7-step application - mindset, execution capacity, and fit</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }}/>
                    <span>15-20 minutes if answered directly</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }}/>
                    <span>Video introduction optional but recommended</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }}/>
                    <span>Review within 48 hours</span>
                  </li>
                </ul>
              </div>

              {/* Start Application Button */}
              <Button onClick={function () { return setShowApplicationForm(true); }} className="w-full rounded-full font-semibold text-sm sm:text-base" size="lg" style={{ backgroundColor: "#E63946", color: "white" }}>
                <FileText className="w-4 h-4 mr-2"/>
                Start Application
              </Button>

              <p className="text-[10px] sm:text-xs text-center" style={{ color: "#5A5A5A" }}>
                Limited positions available. All applications are reviewed individually.
              </p>
            </CardContent>
          </Card>)}

        {/* Application Dialog */}
        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogContent className="w-[95vw] max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Founding Team Application</DialogTitle>
            </DialogHeader>
            <ApplicationForm onSuccess={function () {
            justSubmittedRef.current = true;
            setShowApplicationForm(false);
            setStep("submitted");
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/application-status"] });
            toast({
                title: "Application Submitted!",
                description: "Your application is now under review. We'll be in touch soon.",
            });
        }} onCancel={function () { return setShowApplicationForm(false); }}/>
          </DialogContent>
        </Dialog>

        {/* Submitted / Status View */}
        {step === "submitted" && applicationStatus && (<Card className="text-center border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-sm sm:text-lg" style={{ color: "#1A1A1A" }}>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "#E63946" }}/>
                <span className="text-center">
                  {applicationStatus.status === "pending" && "Application Under Review"}
                  {applicationStatus.status === "approved" && "You've Been Accepted!"}
                  {applicationStatus.status === "verification" && "Documents Under Verification"}
                  {applicationStatus.status === "confirmed" && "Awaiting Pod Assignment"}
                  {applicationStatus.status === "rejected" && "Application Not Accepted"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {applicationStatus.status === "pending" && (<>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Application received. Under review.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Response within 48 hours.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-left">
                    <p className="text-xs sm:text-sm font-medium mb-2">What happens next:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>We assess fit</li>
                      <li>If accepted, upload verification documents</li>
                      <li>Once verified, you're assigned to a pod</li>
                      <li>System training begins</li>
                    </ul>
                  </div>
                </>)}

              {(applicationStatus.status === "approved" || applicationStatus.status === "verification") && (<>
                  <h3 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4">
                    {applicationStatus.status === "approved"
                    ? "You're in. Upload your documents."
                    : "Documents Submitted—Under Verification"}
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {applicationStatus.status === "approved"
                    ? "Before you start, we need verification documents."
                    : "Verification in progress. You'll be contacted once confirmed."}
                  </p>
                  
                  {/* Hidden file inputs */}
                  <input type="file" ref={trialAgreementInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={function (e) { return handleFileChange(e, "trial_agreement"); }}/>
                  <input type="file" ref={parentConsentInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={function (e) { return handleFileChange(e, "parent_consent"); }}/>
                  
                  <div className="space-y-4 text-left">
                    {/* Trial Tutor Agreement */}
                    <div className="p-4 rounded-lg border" style={{
                    backgroundColor: applicationStatus.trialAgreementVerified
                        ? "#F0FDF4"
                        : applicationStatus.hasTrialAgreement
                            ? "#FEF3C7"
                            : "#FFF0F0",
                    borderColor: applicationStatus.trialAgreementVerified
                        ? "#86EFAC"
                        : applicationStatus.hasTrialAgreement
                            ? "#FCD34D"
                            : "#FECACA"
                }}>
                      <div className="flex items-start gap-3">
                        {applicationStatus.trialAgreementVerified ? (<CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>) : applicationStatus.hasTrialAgreement ? (<Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>) : (<Circle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Trial Tutor Agreement</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {applicationStatus.trialAgreementVerified
                    ? "Verified ✓"
                    : applicationStatus.hasTrialAgreement
                        ? "Uploaded - Awaiting verification"
                        : "Review and sign the founding team tutor agreement"}
                          </p>
                          {!applicationStatus.hasTrialAgreement && (<Button size="sm" className="mt-2" style={{ backgroundColor: "#E63946" }} onClick={function () { var _a; return (_a = trialAgreementInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={uploadingDoc !== null}>
                              {uploadingDoc === "trial_agreement" ? (<Loader2 className="w-3 h-3 mr-1 animate-spin"/>) : (<Upload className="w-3 h-3 mr-1"/>)}
                              {uploadingDoc === "trial_agreement" ? "Uploading..." : "Upload Signed Agreement"}
                            </Button>)}
                          {applicationStatus.hasTrialAgreement && applicationStatus.trialAgreementUrl && (<a href={applicationStatus.trialAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
                              <ExternalLink className="w-3 h-3"/>
                              View uploaded document
                            </a>)}
                        </div>
                      </div>
                    </div>

                    {/* Parent Consent (if under 18) */}
                    {applicationStatus.isUnder18 && (<div className="p-4 rounded-lg border" style={{
                        backgroundColor: applicationStatus.parentConsentVerified
                            ? "#F0FDF4"
                            : applicationStatus.hasParentConsent
                                ? "#FEF3C7"
                                : "#FFF0F0",
                        borderColor: applicationStatus.parentConsentVerified
                            ? "#86EFAC"
                            : applicationStatus.hasParentConsent
                                ? "#FCD34D"
                                : "#FECACA"
                    }}>
                        <div className="flex items-start gap-3">
                          {applicationStatus.parentConsentVerified ? (<CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>) : applicationStatus.hasParentConsent ? (<Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>) : (<Circle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">Parent/Guardian Consent Form</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {applicationStatus.parentConsentVerified
                        ? "Verified - Parent contacted ✓"
                        : applicationStatus.hasParentConsent
                            ? "Uploaded - We'll contact your parent to verify"
                            : "Required for tutors under 18 years old"}
                            </p>
                            {!applicationStatus.hasParentConsent && (<Button size="sm" className="mt-2" style={{ backgroundColor: "#E63946" }} onClick={function () { var _a; return (_a = parentConsentInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={uploadingDoc !== null}>
                                {uploadingDoc === "parent_consent" ? (<Loader2 className="w-3 h-3 mr-1 animate-spin"/>) : (<Upload className="w-3 h-3 mr-1"/>)}
                                {uploadingDoc === "parent_consent" ? "Uploading..." : "Upload Consent Form"}
                              </Button>)}
                            {applicationStatus.hasParentConsent && applicationStatus.parentConsentUrl && (<a href={applicationStatus.parentConsentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
                                <ExternalLink className="w-3 h-3"/>
                                View uploaded document
                              </a>)}
                          </div>
                        </div>
                      </div>)}
                  </div>

                  {applicationStatus.status === "approved" && (<div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0"/>
                        <p className="text-xs sm:text-sm text-amber-800 text-left">
                          Complete required documents to proceed.
                        </p>
                      </div>
                    </div>)}

                  {applicationStatus.status === "verification" && (<div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0"/>
                        <p className="text-xs sm:text-sm text-blue-800 text-left">
                          Verification takes 1-2 business days.
                          {applicationStatus.isUnder18 && " We'll contact your parent/guardian to confirm consent."}
                        </p>
                      </div>
                    </div>)}
                </>)}

              {/* Confirmed but waiting for pod assignment */}
              {applicationStatus.status === "confirmed" && !hasPodAssignment && (<>
                  <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
                    Documents Verified
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
                    You're in. Matching you with a pod now.
                  </p>
                  
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0"/>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-medium text-green-800">Waiting for Pod Assignment</p>
                        <p className="text-[10px] sm:text-xs text-green-700 mt-1">
                          Our team is preparing your first pod. You'll be notified once you're assigned.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-left">
                    <p className="text-xs sm:text-sm font-medium mb-2">What to expect:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>You'll be assigned 2-4 students in your first pod</li>
                      <li>Your Territory Director will introduce your students</li>
                      <li>You'll get access to student profiles and identity sheets</li>
                      <li>Sessions will be scheduled based on availability</li>
                    </ul>
                  </div>
                </>)}

              {/* Confirmed and assigned -> show Assigned stage with Continue button */}
              {applicationStatus.status === "confirmed" && hasPodAssignment && (<>
                  <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
                    Pod Assigned
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
                    Documents verified. Pod assigned. Continue to your dashboard.
                  </p>

                  <div className="flex justify-center">
                    <Button size="lg" className="rounded-full" style={{ backgroundColor: "#E63946" }} onClick={completeOnboarding}>
                      Continue to Dashboard
                    </Button>
                  </div>
                </>)}

              {applicationStatus.status === "rejected" && (<>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Application not accepted. This doesn't prevent future applications.
                  </p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">
                    For feedback, contact the team.
                  </p>
                </>)}
            </CardContent>
          </Card>)}

        {/* Loading State */}
        {step === "loading" && (<Card className="text-center">
            <CardContent className="py-12">
              {appStatusError ? (<>
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3"/>
                  <p className="text-red-600 font-semibold mb-2">Unable to load application status</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                    {appStatusError.message || "An error occurred while loading. Please try again."}
                  </p>
                  <Button onClick={function () { return window.location.reload(); }} className="rounded-full" style={{ backgroundColor: "#E63946" }}>
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Retry
                  </Button>
                </>) : (<>
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"/>
                  <p className="text-muted-foreground">Loading your application status...</p>
                  <p className="text-xs text-gray-400 mt-4">If this takes more than 15 seconds, please refresh the page.</p>
                </>)}
            </CardContent>
          </Card>)}
      </div>
    </div>);
}
