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
import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import { authorizedGetJson } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
var PERSONALITY_TYPES = [
    "Afraid to be incorrect",
    "Very shy",
    "Feels underestimated",
    "Reserved, but driven",
    "Reserved",
    "Loves praises",
    "Needs structure",
    "Shy, but smart",
];
var LEARNING_IDS = [
    "Entrepreneur (CEO, Businessman/Woman, Leader)",
    "Lawyer",
    "Accountant",
    "Doctor/Surgeon",
    "Movie director (Storyteller)",
    "COO (Manager, Builder for casual)",
    "Coach",
    "Teacher",
    "Engineer",
];
var GRADES = ["6", "7", "8", "9"];
var CONFIDENCE_TRIGGERS = [
    "Accuracy",
    "Visuals",
    "Genuine Compliment",
    "Celebrating Progress",
];
var CONFIDENCE_KILLERS = [
    "Feeling rushed",
    "Constructive criticism",
    "Repeating same mistakes",
    "Being corrected",
    "Looking dumb",
];
var IDENTITY_SHEET_QUESTIONS = [
    {
    category: "Phase 1 - Orientation",
        questions: [
      "Which math topics usually feel easiest for you?",
      "Which topics tend to confuse you the most?",
      "When a question looks unfamiliar, what usually happens first?",
      "Do you usually rush, freeze, or guess?",
        ],
    },
    {
    category: "Phase 2 - Surface the Pattern",
        questions: [
      "Which math topic never quite made sense?",
      "Are there moments in math where your mind goes blank?",
      "Which type of question usually causes problems?",
        ],
    },
    {
    category: "Phase 3 - Diagnose the Layer",
        questions: [
      "What did you observe when the student attempted unfamiliar problems?",
      "What response pattern showed up during difficulty (rush, freeze, guess, shutdown, etc.)?",
      "What are the two primary problem areas identified in this session?",
        ],
    },
    {
    category: "3-Layer Lens Diagnosis",
        questions: [
      "Vocabulary: Which terms or wording did the student not understand?",
      "Method: Where did the student's process sequence break down?",
      "Reason: What could the student not explain about why the method works?",
        ],
    },
    {
    category: "Intro Session Outcome",
        questions: [
      "Main difficulty topic to prioritize in early sessions",
      "Most unstable learning layer (Vocabulary, Method, or Reason)",
      "How the student responds when confused",
      "TT working structure agreed for next sessions",
        ],
    },
];
export default function StudentIdentitySheet(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange, studentId = _a.studentId, studentName = _a.studentName, onSaved = _a.onSaved, _b = _a.readOnly, readOnly = _b === void 0 ? false : _b, _c = _a.apiBasePath, apiBasePath = _c === void 0 ? "/api/tutor" : _c;
    var _d = useState({
        name: studentName,
        grade: "",
        school: "",
        learningId: "",
        personalityType: "",
        longTermGoals: "",
        relationshipWithMath: "",
        confidenceTriggers: [],
        confidenceKillers: [],
        pressureResponse: "",
        growthDrivers: "",
        currentClassTopics: "",
        strugglesWith: "",
        gapsIdentified: "",
        bossBattlesCompleted: "",
        lastBossBattleResult: "",
        tutorNotes: "",
        identitySheetResponses: {},
    }), formData = _d[0], setFormData = _d[1];
    var _e = useState(false), isSaving = _e[0], setIsSaving = _e[1];
    var _f = useState("personal"), activeTab = _f[0], setActiveTab = _f[1];
    var _g = useState(null), loadedStudentId = _g[0], setLoadedStudentId = _g[1];
    var _h = useState(null), originalData = _h[0], setOriginalData = _h[1];
    var _j = useState(false), hasExistingSheet = _j[0], setHasExistingSheet = _j[1];
    // Initialize identity sheet responses
    var initializeIdentityResponses = function () {
        var responses = {};
        IDENTITY_SHEET_QUESTIONS.forEach(function (section) {
            section.questions.forEach(function (q, idx) {
                responses["".concat(section.category, "-").concat(idx)] = [""];
            });
        });
        return responses;
    };
    // Load existing identity sheet data when dialog opens or student changes
    useEffect(function () {
        if (open && studentId && loadedStudentId !== studentId) {
            var loadExistingData = function () { return __awaiter(_this, void 0, void 0, function () {
                var session, headers, data, hasData, cleanArray, loadedFormData, err_1, error_1;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                return __generator(this, function (_t) {
                    switch (_t.label) {
                        case 0:
                            _t.trys.push([0, 6, , 7]);
                            return [4 /*yield*/, supabase.auth.getSession()];
                        case 1:
                            session = (_t.sent()).data.session;
                            headers = {};
                            if (session === null || session === void 0 ? void 0 : session.access_token) {
                                headers.Authorization = "Bearer ".concat(session.access_token);
                            }
                            _t.label = 2;
                        case 2:
                            _t.trys.push([2, 4, , 5]);
                            console.log("\uD83D\uDCCB Loading identity sheet from: ".concat(apiBasePath, "/students/").concat(studentId, "/identity-sheet"));
                            return [4 /*yield*/, authorizedGetJson("".concat(apiBasePath, "/students/").concat(studentId, "/identity-sheet"))];
                        case 3:
                            data = _t.sent();
                            console.log("📋 Identity sheet data received:", data);
                            hasData = !!(data.identitySheet || data.personalProfile || data.emotionalInsights || data.academicDiagnosis);
                            setHasExistingSheet(hasData);
                            if (hasData) {
                                cleanArray = function (value) {
                                    if (!value)
                                        return [];
                                    if (Array.isArray(value)) {
                                        // Filter out single-character strings (corrupted data)
                                        return value.filter(function (item) { return typeof item === 'string' && item.length > 1; });
                                    }
                                    return [];
                                };
                                loadedFormData = {
                                    name: ((_a = data.personalProfile) === null || _a === void 0 ? void 0 : _a.name) || studentName,
                                    grade: ((_b = data.personalProfile) === null || _b === void 0 ? void 0 : _b.grade) || "",
                                    school: ((_c = data.personalProfile) === null || _c === void 0 ? void 0 : _c.school) || "",
                                    learningId: ((_d = data.personalProfile) === null || _d === void 0 ? void 0 : _d.learningId) || "",
                                    personalityType: ((_e = data.personalProfile) === null || _e === void 0 ? void 0 : _e.personalityType) || "",
                                    longTermGoals: ((_f = data.personalProfile) === null || _f === void 0 ? void 0 : _f.longTermGoals) || "",
                                    relationshipWithMath: ((_g = data.emotionalInsights) === null || _g === void 0 ? void 0 : _g.relationshipWithMath) || "",
                                    confidenceTriggers: cleanArray((_h = data.emotionalInsights) === null || _h === void 0 ? void 0 : _h.confidenceTriggers),
                                    confidenceKillers: cleanArray((_j = data.emotionalInsights) === null || _j === void 0 ? void 0 : _j.confidenceKillers),
                                    pressureResponse: ((_k = data.emotionalInsights) === null || _k === void 0 ? void 0 : _k.pressureResponse) || "",
                                    growthDrivers: ((_l = data.emotionalInsights) === null || _l === void 0 ? void 0 : _l.growthDrivers) || "",
                                    currentClassTopics: ((_m = data.academicDiagnosis) === null || _m === void 0 ? void 0 : _m.currentClassTopics) || "",
                                    strugglesWith: ((_o = data.academicDiagnosis) === null || _o === void 0 ? void 0 : _o.strugglesWith) || "",
                                    gapsIdentified: ((_p = data.academicDiagnosis) === null || _p === void 0 ? void 0 : _p.gapsIdentified) || "",
                                    bossBattlesCompleted: ((_q = data.academicDiagnosis) === null || _q === void 0 ? void 0 : _q.bossBattlesCompleted) || "",
                                    lastBossBattleResult: ((_r = data.academicDiagnosis) === null || _r === void 0 ? void 0 : _r.lastBossBattleResult) || "",
                                    tutorNotes: ((_s = data.academicDiagnosis) === null || _s === void 0 ? void 0 : _s.tutorNotes) || "",
                                    identitySheetResponses: data.identitySheet || initializeIdentityResponses(),
                                };
                                setFormData(loadedFormData);
                                setOriginalData(JSON.parse(JSON.stringify(loadedFormData))); // Deep clone
                            }
                            else {
                                setOriginalData(null);
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            err_1 = _t.sent();
                            console.error("Failed to load identity sheet:", err_1);
                            return [3 /*break*/, 5];
                        case 5:
                            setLoadedStudentId(studentId);
                            return [3 /*break*/, 7];
                        case 6:
                            error_1 = _t.sent();
                            console.error("Error loading identity sheet:", error_1);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); };
            loadExistingData();
        }
    }, [open, studentId, loadedStudentId, studentName, apiBasePath]);
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleIdentityResponseChange = function (category, index, value) {
        var key = "".concat(category, "-").concat(index);
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), { identitySheetResponses: __assign(__assign({}, prev.identitySheetResponses), (_a = {}, _a[key] = [value], _a)) }));
        });
    };
    // Check if form data has changed from original
    var hasChanges = function () {
        if (!originalData)
            return true; // New sheet, always has changes
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, headers, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    console.log("🔵 FRONTEND - About to save formData.confidenceTriggers:", formData.confidenceTriggers);
                    console.log("Type:", typeof formData.confidenceTriggers, "IsArray:", Array.isArray(formData.confidenceTriggers));
                    console.log("🔵 FRONTEND - About to save formData.confidenceKillers:", formData.confidenceKillers);
                    console.log("Type:", typeof formData.confidenceKillers, "IsArray:", Array.isArray(formData.confidenceKillers));
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    headers = { "Content-Type": "application/json" };
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers.Authorization = "Bearer ".concat(session.access_token);
                    }
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/tutor/students/").concat(studentId, "/identity-sheet"), {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify(formData),
                            credentials: "include",
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 7];
                    setLoadedStudentId(studentId);
                    setHasExistingSheet(true);
                    setOriginalData(formData); // Update original data to current
                    if (!onSaved) return [3 /*break*/, 5];
                    return [4 /*yield*/, onSaved()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: 
                // Small delay to ensure state propagates
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 6:
                    // Small delay to ensure state propagates
                    _a.sent();
                    // Close dialog after state updates
                    onOpenChange(false);
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_2 = _a.sent();
                    console.error("Error saving identity sheet:", error_2);
                    return [3 /*break*/, 10];
                case 9:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Student Profile & Identity Sheet</DialogTitle>
          <DialogDescription className="text-sm">
            Building a complete profile for {studentName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="personal" className="text-xs sm:text-sm py-2">Personal</TabsTrigger>
            <TabsTrigger value="emotional" className="text-xs sm:text-sm py-2">Emotional</TabsTrigger>
            <TabsTrigger value="academic" className="text-xs sm:text-sm py-2">Academic</TabsTrigger>
            <TabsTrigger value="identity" className="text-xs sm:text-sm py-2">Identity</TabsTrigger>
          </TabsList>

          {/* TAB 1: PERSONAL PROFILE */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔹 Personal Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={formData.name} onChange={function (e) { return handleInputChange("name", e.target.value); }} placeholder="Student name" readOnly={readOnly}/>
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={formData.grade} onValueChange={function (value) {
            return handleInputChange("grade", value);
        }}>
                      <SelectTrigger className={readOnly ? "pointer-events-none" : ""}>
                        <SelectValue placeholder="Select grade"/>
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map(function (grade) { return (<SelectItem key={grade} value={grade}>
                            Grade {grade}
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="school">School</Label>
                    <Input id="school" value={formData.school} onChange={function (e) { return handleInputChange("school", e.target.value); }} placeholder="School name" readOnly={readOnly}/>
                  </div>
                  <div>
                    <Label htmlFor="learningId">Learning ID</Label>
                    <Select value={formData.learningId} onValueChange={function (value) {
            return handleInputChange("learningId", value);
        }}>
                      <SelectTrigger className={readOnly ? "pointer-events-none" : ""}>
                        <SelectValue placeholder="Select learning ID"/>
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNING_IDS.map(function (id) { return (<SelectItem key={id} value={id}>
                            {id}
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="personalityType">Personality Type</Label>
                  <Select value={formData.personalityType} onValueChange={function (value) {
            return handleInputChange("personalityType", value);
        }}>
                    <SelectTrigger className={readOnly ? "pointer-events-none" : ""}>
                      <SelectValue placeholder="Select personality type"/>
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONALITY_TYPES.map(function (type) { return (<SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>); })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="longTermGoals">Long-Term Goals</Label>
                  <Textarea id="longTermGoals" value={formData.longTermGoals} onChange={function (e) { return handleInputChange("longTermGoals", e.target.value); }} placeholder="What are this student's long-term aspirations?" rows={4} readOnly={readOnly}/>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: EMOTIONAL INSIGHTS */}
          <TabsContent value="emotional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔹 Emotional Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="relationshipWithMath">Relationship With Math</Label>
                  <Textarea id="relationshipWithMath" value={formData.relationshipWithMath} onChange={function (e) { return handleInputChange("relationshipWithMath", e.target.value); }} placeholder="How does this student feel about math?" rows={3} readOnly={readOnly}/>
                </div>

                <div>
                  <Label>Confidence Triggers (select all that apply)</Label>
                  <div className="space-y-2 mt-2">
                    {CONFIDENCE_TRIGGERS.map(function (trigger) { return (<div key={trigger} className="flex items-center space-x-2">
                        <Checkbox id={"trigger-".concat(trigger)} checked={formData.confidenceTriggers.includes(trigger)} onCheckedChange={function (checked) {
                if (checked) {
                    handleInputChange("confidenceTriggers", __spreadArray(__spreadArray([], formData.confidenceTriggers, true), [trigger], false));
                }
                else {
                    handleInputChange("confidenceTriggers", formData.confidenceTriggers.filter(function (t) { return t !== trigger; }));
                }
            }} className={readOnly ? "pointer-events-none" : ""}/>
                        <label htmlFor={"trigger-".concat(trigger)} className="text-sm font-normal cursor-pointer">
                          {trigger}
                        </label>
                      </div>); })}
                  </div>
                </div>

                <div>
                  <Label>Confidence Killers (select all that apply)</Label>
                  <div className="space-y-2 mt-2">
                    {CONFIDENCE_KILLERS.map(function (killer) { return (<div key={killer} className="flex items-center space-x-2">
                        <Checkbox id={"killer-".concat(killer)} checked={formData.confidenceKillers.includes(killer)} onCheckedChange={function (checked) {
                if (checked) {
                    handleInputChange("confidenceKillers", __spreadArray(__spreadArray([], formData.confidenceKillers, true), [killer], false));
                }
                else {
                    handleInputChange("confidenceKillers", formData.confidenceKillers.filter(function (k) { return k !== killer; }));
                }
            }} className={readOnly ? "pointer-events-none" : ""}/>
                        <label htmlFor={"killer-".concat(killer)} className="text-sm font-normal cursor-pointer">
                          {killer}
                        </label>
                      </div>); })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="pressureResponse">Pressure Response</Label>
                  <Textarea id="pressureResponse" value={formData.pressureResponse} onChange={function (e) { return handleInputChange("pressureResponse", e.target.value); }} placeholder="How does this student respond to pressure?" rows={3} readOnly={readOnly}/>
                </div>

                <div>
                  <Label htmlFor="growthDrivers">Growth Drivers</Label>
                  <Textarea id="growthDrivers" value={formData.growthDrivers} onChange={function (e) { return handleInputChange("growthDrivers", e.target.value); }} placeholder="What motivates this student to grow?" rows={3} readOnly={readOnly}/>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ACADEMIC DIAGNOSIS */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔹 Academic Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentClassTopics">Current Class Topics</Label>
                  <Textarea id="currentClassTopics" value={formData.currentClassTopics} onChange={function (e) { return handleInputChange("currentClassTopics", e.target.value); }} placeholder="What is the student currently studying?" rows={3} readOnly={readOnly}/>
                </div>

                <div>
                  <Label htmlFor="strugglesWith">Struggles With</Label>
                  <Textarea id="strugglesWith" value={formData.strugglesWith} onChange={function (e) { return handleInputChange("strugglesWith", e.target.value); }} placeholder="What specific math concepts are challenging?" rows={3} readOnly={readOnly}/>
                </div>

                <div>
                  <Label htmlFor="gapsIdentified">Gaps Identified</Label>
                  <Textarea id="gapsIdentified" value={formData.gapsIdentified} onChange={function (e) { return handleInputChange("gapsIdentified", e.target.value); }} placeholder="What foundational gaps need to be addressed?" rows={3} readOnly={readOnly}/>
                </div>

                <div>
                  <Label htmlFor="bossBattlesCompleted">Boss Battles Completed</Label>
                  <Input id="bossBattlesCompleted" value={formData.bossBattlesCompleted} onChange={function (e) { return handleInputChange("bossBattlesCompleted", e.target.value); }} placeholder="e.g., Algebra Fundamentals" readOnly={readOnly}/>
                </div>

                <div>
                  <Label htmlFor="lastBossBattleResult">Last Boss Battle Result</Label>
                  <Textarea id="lastBossBattleResult" value={formData.lastBossBattleResult} onChange={function (e) { return handleInputChange("lastBossBattleResult", e.target.value); }} placeholder="How did the student perform?" rows={3} readOnly={readOnly}/>
                </div>

                <div>
                  <Label htmlFor="tutorNotes">Tutor Notes</Label>
                  <Textarea id="tutorNotes" value={formData.tutorNotes} onChange={function (e) { return handleInputChange("tutorNotes", e.target.value); }} placeholder="Any additional observations or notes" rows={4} readOnly={readOnly}/>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: IDENTITY SHEET - INTRO SESSION STRUCTURE */}
          <TabsContent value="identity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Introductory Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {IDENTITY_SHEET_QUESTIONS.map(function (section, sectionIdx) { return (<div key={sectionIdx} className="space-y-3 pb-4 border-b last:border-b-0">
                    <h4 className="font-semibold text-sm text-gray-800">
                      {section.category}
                    </h4>
                    {section.questions.map(function (question, qIdx) {
                var _a;
                return (<div key={qIdx}>
                        <Label className="text-sm text-gray-700 mb-2 block">
                          {question}
                        </Label>
                        <Textarea value={((_a = formData.identitySheetResponses["".concat(section.category, "-").concat(qIdx)]) === null || _a === void 0 ? void 0 : _a[0]) || ""} onChange={function (e) {
                        return handleIdentityResponseChange(section.category, qIdx, e.target.value);
                    }} placeholder="Student's response..." rows={2} className="text-sm" readOnly={readOnly}/>
                      </div>);
            })}
                  </div>); })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button - only show for editable mode */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={function () { return onOpenChange(false); }} disabled={isSaving}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (<Button onClick={handleSave} disabled={isSaving || (hasExistingSheet && !hasChanges())}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              {hasExistingSheet
                ? (hasChanges() ? "Save Changes" : "No Changes to Save")
                : "Save Identity Sheet"}
            </Button>)}
        </div>
      </DialogContent>
    </Dialog>);
}
