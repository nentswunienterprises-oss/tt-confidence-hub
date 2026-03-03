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
import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
var IDENTITIES = [
    "Entrepreneur",
    "Lawyer",
    "Accountant",
    "Doctor",
    "Engineer",
    "Director",
    "Coach",
    "CEO",
    "Storyteller",
    "Teacher",
];
var PRESSURE_RESPONSES = ["Fight", "Freeze", "Avoid", "Overthink", "Shut-down"];
var PLANS = ["Standard Plan", "Premium Plan"];
var JUSTIFICATION_SCRIPTS = {
    "Premium Plan": [
        "{studentName} performs best with tight, consistent touchpoints. Premium matches their learning tempo and keeps their progress sharp.",
        "{studentName} grasps concepts quickly, but they also move on quickly. Premium lets us channel that speed into mastery instead of rushing.",
        "{studentName} is aiming high. Premium gives them the intensity and structure that matches the goals they're chasing.",
        "{studentName} grows when they stay in flow. Premium keeps them in that flow so every lesson builds directly on the last.",
        "{studentName} responds well to quick corrections. Premium lets us turn mistakes into improvements before they settle.",
        "{studentName} benefits from a training-style routine. Premium mirrors athletic conditioning: frequent reps, steady gains.",
    ],
    "Standard Plan": [
        "{studentName} learns deeply when they have time to process. Standard gives them room to think, reflect, and come back stronger each week.",
        "{studentName} performs best without feeling rushed. Standard offers reliable support while keeping things calm and manageable.",
        "{studentName} naturally takes initiative. Standard ensures they have weekly guidance while still letting them build independence.",
        "{studentName} has a tight schedule. Standard keeps tutoring effective without crowding their routine.",
        "{studentName} improves consistently over time. Standard matches their natural pace and keeps progress smooth.",
        "{studentName} needs time to practice after learning something new. Standard gives them the perfect cycle: learn, apply, return.",
    ],
};
export default function ParentOnboardingProposal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange, studentName = _a.studentName, studentId = _a.studentId, _b = _a.tutorName, tutorName = _b === void 0 ? "Your Tutor" : _b, identitySheetData = _a.identitySheetData;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _c = useState("overview"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = useState({
        primaryIdentity: "",
        mathRelationship: "",
        confidenceTriggers: "",
        confidenceKillers: "",
        pressureResponse: "",
        growthDrivers: "",
        currentTopics: "",
        immediateStruggles: "",
        gapsIdentified: "",
        tutorNotes: "",
        futureIdentity: "",
        wantToRemembered: "",
        hiddenMotivations: "",
        internalConflict: "",
        recommendedPlan: "Standard Plan",
        justification: "",
        childWillWin: "",
    }), formData = _d[0], setFormData = _d[1];
    var _e = useState(""), selectedJustificationScript = _e[0], setSelectedJustificationScript = _e[1];
    // Pre-populate form when identity sheet data is available
    useEffect(function () {
        var _a, _b, _c, _d, _e;
        if (identitySheetData && open) {
            // Extract specific answers from identity sheet Q&A
            var identitySheet = identitySheetData.identitySheet || {};
            // Map questions to form fields
            var dreamJob_1 = ((_a = identitySheet["Who Are You?-1"]) === null || _a === void 0 ? void 0 : _a[0]) || ""; // "What's your dream life or job?"
            var wantRemembered_1 = ((_b = identitySheet["Values & Emotional Landscape-0"]) === null || _b === void 0 ? void 0 : _b[0]) || ""; // "What kind of person do you want to be remembered as?"
            var hiddenBelief_1 = ((_c = identitySheet["Mindset & Self-Perception-3"]) === null || _c === void 0 ? void 0 : _c[0]) || ""; // "What's something you believe about yourself that no one sees?"
            var secretDream_1 = ((_d = identitySheet["Dreams & Inner Drive-0"]) === null || _d === void 0 ? void 0 : _d[0]) || ""; // "What's a dream you haven't told anyone about?"
            var deepDesire_1 = ((_e = identitySheet["Dreams & Inner Drive-1"]) === null || _e === void 0 ? void 0 : _e[0]) || ""; // "What's something you really want"
            // Clean up corrupted array data (filters out single-char strings)
            var cleanArray_1 = function (value) {
                if (!value)
                    return "";
                if (Array.isArray(value)) {
                    // Filter out single-character corruption, keep real values
                    var cleaned = value.filter(function (item) { return typeof item === 'string' && item.length > 1; });
                    return cleaned.join(", ");
                }
                if (typeof value === 'string')
                    return value;
                return "";
            };
            setFormData(function (prev) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return (__assign(__assign({}, prev), { primaryIdentity: ((_a = identitySheetData.personalProfile) === null || _a === void 0 ? void 0 : _a.learningId) || "", mathRelationship: ((_b = identitySheetData.emotionalInsights) === null || _b === void 0 ? void 0 : _b.relationshipWithMath) || "", confidenceTriggers: cleanArray_1((_c = identitySheetData.emotionalInsights) === null || _c === void 0 ? void 0 : _c.confidenceTriggers), confidenceKillers: cleanArray_1((_d = identitySheetData.emotionalInsights) === null || _d === void 0 ? void 0 : _d.confidenceKillers), pressureResponse: ((_e = identitySheetData.emotionalInsights) === null || _e === void 0 ? void 0 : _e.pressureResponse) || "", growthDrivers: ((_f = identitySheetData.emotionalInsights) === null || _f === void 0 ? void 0 : _f.growthDrivers) || "", currentTopics: ((_g = identitySheetData.academicDiagnosis) === null || _g === void 0 ? void 0 : _g.currentClassTopics) || "", immediateStruggles: ((_h = identitySheetData.academicDiagnosis) === null || _h === void 0 ? void 0 : _h.strugglesWith) || "", gapsIdentified: ((_j = identitySheetData.academicDiagnosis) === null || _j === void 0 ? void 0 : _j.gapsIdentified) || "", tutorNotes: ((_k = identitySheetData.academicDiagnosis) === null || _k === void 0 ? void 0 : _k.tutorNotes) || "", 
                    // Psychological Anchor fields from identity sheet Q&A
                    futureIdentity: dreamJob_1, wantToRemembered: wantRemembered_1, hiddenMotivations: [secretDream_1, deepDesire_1].filter(Boolean).join("; "), internalConflict: hiddenBelief_1 }));
            });
        }
    }, [identitySheetData, open]);
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
        // Reset justification script selector when plan changes
        if (field === "recommendedPlan") {
            setSelectedJustificationScript("");
        }
    };
    var handleJustificationScriptSelect = function (scriptTemplate) {
        setSelectedJustificationScript(scriptTemplate);
        // Replace {studentName} with actual student name
        var personalizedScript = scriptTemplate.replace(/{studentName}/g, studentName);
        handleInputChange("justification", personalizedScript);
    };
    var handleSendProposal = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/tutor/proposal"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify(__assign({ studentId: studentId }, formData)),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json().catch(function () { return ({ message: "Failed to send proposal" }); })];
                case 2:
                    errorData = _a.sent();
                    console.error("Server error:", errorData);
                    throw new Error(errorData.message || "Failed to send proposal");
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    console.log("✅ Proposal sent successfully:", data);
                    // Show success message
                    toast({
                        title: "Proposal Sent Successfully!",
                        description: "The personalized proposal for ".concat(studentName, " has been sent to their parent."),
                        duration: 5000,
                    });
                    // Refresh pod data to update button state
                    return [4 /*yield*/, queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] })];
                case 5:
                    // Refresh pod data to update button state
                    _a.sent();
                    // Close dialog
                    onOpenChange(false);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("❌ Error sending proposal:", error_1);
                    toast({
                        title: "Failed to Send Proposal",
                        description: error_1 instanceof Error ? error_1.message : "An unexpected error occurred",
                        variant: "destructive",
                        duration: 5000,
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadProposal = function () {
        // TODO: Implement PDF download
        console.log("Downloading proposal for student:", studentId);
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-base sm:text-lg">Parent Onboarding Proposal</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Creating a personalized proposal for {studentName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">Overview</TabsTrigger>
            <TabsTrigger value="academics" className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">Academics</TabsTrigger>
            <TabsTrigger value="recommendation" className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">Recommendation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 sm:p-6 rounded-lg mb-3 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-bold text-foreground mb-1 sm:mb-2">
                Response Pattern Assessment
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Observations of {studentName}'s response patterns and academic needs.
              </p>
            </div>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">1. Tutor Session Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div>
                  <Label htmlFor="tutorNotes" className="text-xs sm:text-sm font-medium">
                    Observed Response Patterns
                  </Label>
                  <Textarea id="tutorNotes" placeholder="Observable patterns during problem-solving: how they approach new topics, response to errors, work pace, etc..." value={formData.tutorNotes} onChange={function (e) {
            return handleInputChange("tutorNotes", e.target.value);
        }} className="mt-2 min-h-20 sm:min-h-24 text-sm"/>
                  <p className="text-xs text-muted-foreground mt-1">
                    Focus on procedural observations, not emotional interpretation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academics" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">2. Academic Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div>
                  <Label htmlFor="currentTopics" className="text-xs sm:text-sm font-medium">
                    Current Topics
                  </Label>
                  <Textarea id="currentTopics" placeholder="Based on what the child mentioned in session..." value={formData.currentTopics} onChange={function (e) {
            return handleInputChange("currentTopics", e.target.value);
        }} className="mt-2 min-h-16 sm:min-h-20 text-sm"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="immediateStruggles" className="text-xs sm:text-sm font-medium">
                      Immediate Struggles
                    </Label>
                    <Textarea id="immediateStruggles" placeholder="Patterns, not just topics..." value={formData.immediateStruggles} onChange={function (e) {
            return handleInputChange("immediateStruggles", e.target.value);
        }} className="mt-2 min-h-16 sm:min-h-20 text-sm"/>
                  </div>

                  <div>
                    <Label htmlFor="gapsIdentified" className="text-xs sm:text-sm font-medium">
                      Gaps Identified
                    </Label>
                    <Textarea id="gapsIdentified" placeholder="Where foundations cracked..." value={formData.gapsIdentified} onChange={function (e) {
            return handleInputChange("gapsIdentified", e.target.value);
        }} className="mt-2 min-h-16 sm:min-h-20 text-sm"/>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">3. The Training Roadmap (90-Day Plan)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="bg-accent/50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">Phase 1: Foundation Assessment (Weeks 1–3)</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Identify response patterns under pressure</li>
                      <li>• Map procedural gaps</li>
                      <li>• Establish baseline problem-solving approach</li>
                      <li>• Introduce step-by-step problem protocols</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">Phase 2: Systematic Training (Weeks 4–7)</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Address identified gaps systematically</li>
                      <li>• Practice under timed conditions</li>
                      <li>• Reinforce procedural consistency</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">Phase 3: Performance Testing (Weeks 8–12)</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Progressive difficulty increase</li>
                      <li>• Pressure simulation sessions</li>
                      <li>• Test-condition practice</li>
                      <li>• Performance consistency measurement</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/10 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <h4 className="font-semibold text-xs sm:text-sm mb-2 text-foreground">Expected Outcomes by Day 90</h4>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>✓ Consistent problem-solving procedure</li>
                    <li>✓ Measurable gap closure</li>
                    <li>✓ Improved test performance</li>
                    <li>✓ Reduced error rate under time pressure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-3 sm:space-y-4">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Standard Program: Premium Response Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-medium">
                    All students receive the same standardized program: <strong>Premium Response Training</strong>
                  </p>
                  
                  <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                    <h4 className="font-semibold text-xs sm:text-sm">What's Included</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>✓ Weekly 1-on-1 session</li>
                      <li>✓ Response-first problem training</li>
                      <li>✓ Monthly pressure simulation</li>
                      <li>✓ Neutral progress reporting</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                      No psychology theatre, no identity probing, no motivational leakage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Ready to Send</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Click "Send to Parent" to deliver the standardized Premium Response Training program to {studentName}'s parent.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 px-3 sm:px-0">
              <Button onClick={handleSendProposal} className="w-full gap-2 text-sm sm:text-base" size="lg">
                <Send className="w-4 h-4"/>
                Send to Parent
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>);
}
