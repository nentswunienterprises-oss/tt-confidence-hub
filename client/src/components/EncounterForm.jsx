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
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/config";
import { ChevronRight, Plus, X } from "lucide-react";
var OUTCOME_OPTIONS = [
    { value: "enrolled", label: "✓ Enrolled" },
    { value: "objected", label: "Objected" },
    { value: "follow_up_needed", label: "Follow Up Needed" },
];
var STORAGE_KEY = "encounterFormData";
var getDefaultFormData = function () { return ({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childName: "",
    childGrade: "",
    dateMet: new Date().toISOString().split("T")[0],
    contactMethod: "phone",
    discoveryOutcome: "",
    deliveryNotes: "",
    finalOutcome: "",
    result: "",
    confidenceRating: 3,
    myThoughts: "",
    whereFlinched: "",
    whereTalkedTooMuch: "",
    whereAvoidedTension: "",
}); };
export default function EncounterForm(_a) {
    var _this = this;
    var onSuccess = _a.onSuccess;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = useState("initial"), step = _c[0], setStep = _c[1];
    var _d = useState(function () {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                var parsed = JSON.parse(saved);
                console.log("✅ Restored form data from localStorage:", parsed);
                return parsed;
            }
            console.log("📝 No saved form data, using defaults");
            return getDefaultFormData();
        }
        catch (e) {
            console.error("❌ Error restoring form data:", e);
            return getDefaultFormData();
        }
    }), formData = _d[0], setFormData = _d[1];
    // Save form data to localStorage whenever it changes
    useEffect(function () {
        console.log("💾 Saving form data to localStorage:", formData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [formData]);
    var logEncounterMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var res, errorData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data.parentName)
                            throw new Error("Parent name is required");
                        return [4 /*yield*/, fetch("".concat(API_URL, "/api/affiliate/encounters"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify(data),
                            })];
                    case 1:
                        res = _a.sent();
                        if (!!res.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.json().catch(function () { return ({ message: "Unknown error" }); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error(errorData.message || "Server error: ".concat(res.status));
                    case 3: return [2 /*return*/, res.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Saved",
                description: "Encounter logged",
            });
            // Invalidate all related queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ["/api", "affiliate", "stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api", "affiliate", "breakdown"] });
            // Invalidate all encounters queries regardless of filter (partial key match)
            queryClient.invalidateQueries({ queryKey: ["/api", "affiliate", "encounters"], exact: false });
            var defaultData = getDefaultFormData();
            setFormData(defaultData);
            localStorage.removeItem(STORAGE_KEY);
            setStep("initial");
            setIsOpen(false);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function () {
        logEncounterMutation.mutate(formData);
    };
    return (<>
      {!isOpen ? (<button onClick={function () {
                setIsOpen(true);
                setStep("initial");
            }} className="w-full h-14 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 group font-medium shadow-sm hover:shadow-md text-lg">
          <Plus className="w-5 h-5"/>
          Log Encounter
        </button>) : (<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl bg-card">
        {/* Header */}
        <div className="px-6 py-5 border-b border-card-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-lg font-600 text-foreground">New Encounter</h2>
          <button onClick={function () {
                setIsOpen(false);
                setStep("initial");
            }} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step: Initial */}
          {step === "initial" && (<div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Parent Name
                </label>
                <Input placeholder="Who did you meet?" value={formData.parentName} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { parentName: e.target.value })); }} className="text-base border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0" autoFocus/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Child Name
                  </label>
                  <Input placeholder="Optional" value={formData.childName} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { childName: e.target.value })); }} className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"/>
                </div>
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Grade
                  </label>
                  <Input placeholder="Optional" value={formData.childGrade} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { childGrade: e.target.value })); }} className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"/>
                </div>
              </div>
            </div>)}

          {/* Step: Outcome */}
          {step === "outcome" && (<div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-3">
                  What happened?
                </label>
                <div className="space-y-2">
                  {OUTCOME_OPTIONS.map(function (option) { return (<button key={option.value} onClick={function () {
                        setFormData(__assign(__assign({}, formData), { finalOutcome: option.value }));
                        setStep("details");
                    }} className="w-full px-4 py-3 text-left rounded-lg border border-card-border hover:border-primary hover:bg-accent/50 transition-all duration-150 text-sm font-500 text-foreground group flex items-center justify-between">
                      {option.label}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary"/>
                    </button>); })}
                </div>
              </div>
            </div>)}

          {/* Step: Details */}
          {step === "details" && (<div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Their Challenge
                </label>
                <textarea placeholder="What's their main pain point?" value={formData.discoveryOutcome} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { discoveryOutcome: e.target.value })); }} rows={2} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  How You Positioned Us
                </label>
                <textarea placeholder="What resonated with them?" value={formData.deliveryNotes} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { deliveryNotes: e.target.value })); }} rows={2} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Next Steps
                </label>
                <textarea placeholder="What's next?" value={formData.result} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { result: e.target.value })); }} rows={1} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-3">
                  Confidence Level
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(function (rating) { return (<button key={rating} onClick={function () { return setFormData(__assign(__assign({}, formData), { confidenceRating: rating })); }} className={"flex-1 h-8 rounded-lg text-xs font-600 transition-all duration-150 ".concat(formData.confidenceRating === rating
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-accent text-foreground hover:bg-accent/80")}>
                      {rating}
                    </button>); })}
                </div>
              </div>
            </div>)}

          {/* Step: Reflection */}
          {step === "reflection" && (<div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Reflection
                </label>
                <textarea placeholder="What went well? What to improve?" value={formData.myThoughts} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { myThoughts: e.target.value })); }} rows={3} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Where did they flinch?
                </label>
                <textarea placeholder="Where did they show resistance or hesitation?" value={formData.whereFlinched} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { whereFlinched: e.target.value })); }} rows={2} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Where did you talk too much?
                </label>
                <textarea placeholder="Where did you dominate the conversation?" value={formData.whereTalkedTooMuch} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { whereTalkedTooMuch: e.target.value })); }} rows={2} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Where did you avoid tension?
                </label>
                <textarea placeholder="Where did you sidestep difficult topics?" value={formData.whereAvoidedTension} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { whereAvoidedTension: e.target.value })); }} rows={2} className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <Input type="email" placeholder="Optional" value={formData.parentEmail} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { parentEmail: e.target.value })); }} className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"/>
                </div>
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Phone
                  </label>
                  <Input placeholder="Optional" value={formData.parentPhone} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { parentPhone: e.target.value })); }} className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"/>
                </div>
              </div>
            </div>)}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-card-border flex gap-3 bg-accent/20">
          {step !== "initial" && (<button onClick={function () {
                    if (step === "outcome")
                        setStep("initial");
                    if (step === "details")
                        setStep("outcome");
                    if (step === "reflection")
                        setStep("details");
                }} className="flex-1 py-2 px-4 text-foreground hover:bg-accent/50 rounded-lg text-sm font-500 transition-colors">
              Back
            </button>)}

          {step === "initial" && (<button onClick={function () { return formData.parentName && setStep("outcome"); }} disabled={!formData.parentName} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Continue
            </button>)}

          {step === "outcome" && (<button onClick={function () { return setStep("details"); }} disabled={!formData.finalOutcome} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Continue
            </button>)}

          {step === "details" && (<button onClick={function () { return setStep("reflection"); }} disabled={!formData.discoveryOutcome || !formData.deliveryNotes} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Review
            </button>)}

          {step === "reflection" && (<button onClick={handleSubmit} disabled={logEncounterMutation.isPending} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {logEncounterMutation.isPending ? "Saving…" : "Save"}
            </button>)}
        </div>
      </Card>
        </div>)}
    </>);
}
