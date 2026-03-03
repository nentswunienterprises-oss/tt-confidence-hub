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
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, TrendingUp, ClipboardList } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format, startOfWeek } from "date-fns";
export default function TutorGrowth() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading, user = _a.user;
    var toast = useToast().toast;
    var _b = useState(""), reflectionText = _b[0], setReflectionText = _b[1];
    var _c = useState([5]), habitScore = _c[0], setHabitScore = _c[1];
    var _d = useState(false), checkInDialogOpen = _d[0], setCheckInDialogOpen = _d[1];
    var _e = useState({
        sessionsSummary: "",
        wins: "",
        challenges: "",
        emotions: "",
        skillImprovement: "",
        helpNeeded: "",
        nextWeekGoals: "",
    }), checkInData = _e[0], setCheckInData = _e[1];
    var _f = useQuery({
        queryKey: ["/api/tutor/reflections"],
        enabled: isAuthenticated && !authLoading,
    }), reflections = _f.data, isLoading = _f.isLoading, error = _f.error;
    var podAssignment = useQuery({
        queryKey: ["/api/tutor/pod"],
        enabled: isAuthenticated && !authLoading,
    }).data;
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
    var createReflection = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/tutor/reflections", data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/reflections"] });
            setReflectionText("");
            setHabitScore([5]);
            toast({
                title: "Reflection saved",
                description: "Your reflection has been recorded successfully.",
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
                description: "Failed to save reflection. Please try again.",
                variant: "destructive",
            });
        },
    });
    var submitWeeklyCheckIn = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var podId;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        podId = (_a = podAssignment === null || podAssignment === void 0 ? void 0 : podAssignment.assignment) === null || _a === void 0 ? void 0 : _a.podId;
                        if (!podId)
                            throw new Error("Pod ID not found");
                        return [4 /*yield*/, apiRequest("POST", "/api/tutor/weekly-check-in", __assign({ podId: podId, weekStartDate: startOfWeek(new Date()).toISOString() }, checkInData))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            setCheckInDialogOpen(false);
            setCheckInData({
                sessionsSummary: "",
                wins: "",
                challenges: "",
                emotions: "",
                skillImprovement: "",
                helpNeeded: "",
                nextWeekGoals: "",
            });
            toast({
                title: "Check-in submitted",
                description: "Your weekly check-in has been recorded and sent to your TD.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: "Failed to submit check-in. Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!reflectionText.trim()) {
            toast({
                title: "Validation Error",
                description: "Please write a reflection before submitting.",
                variant: "destructive",
            });
            return;
        }
        createReflection.mutate({
            reflectionText: reflectionText.trim(),
            habitScore: habitScore[0],
        });
    };
    if (authLoading || isLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-64"/>
          <Skeleton className="h-40"/>
        </div>
      </DashboardLayout>);
    }
    var avgHabitScore = reflections && reflections.length > 0
        ? reflections.reduce(function (sum, r) { return sum + (r.habitScore || 0); }, 0) / reflections.length
        : 0;
    return (<DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Growth & Reflections</h1>
          <p className="text-muted-foreground">Track your journey and celebrate every step forward</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">{(reflections === null || reflections === void 0 ? void 0 : reflections.length) || 0}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Reflections</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"/>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">{avgHabitScore.toFixed(1)}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Avg Habit Score</p>
            </div>
          </Card>
        </div>

        {/* New Reflection Form */}
        <Card className="p-6 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reflection" className="text-base font-semibold">
                New Reflection
              </Label>
              <Textarea id="reflection" placeholder="What went well today? What did you learn? What are you proud of?" value={reflectionText} onChange={function (e) { return setReflectionText(e.target.value); }} className="min-h-32 resize-none" data-testid="input-reflection-text"/>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="habit-score" className="text-base font-semibold">
                  Habit Score
                </Label>
                <span className="text-2xl font-bold text-primary">{habitScore[0]}/10</span>
              </div>
              <Slider id="habit-score" min={1} max={10} step={1} value={habitScore} onValueChange={setHabitScore} className="py-4" data-testid="input-habit-score"/>
              <p className="text-xs text-muted-foreground">
                Rate your consistency and discipline today (1 = poor, 10 = excellent)
              </p>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={createReflection.isPending} data-testid="button-submit-reflection">
              <Plus className="w-4 h-4"/>
              {createReflection.isPending ? "Saving..." : "Save Reflection"}
            </Button>
          </form>
        </Card>

        {/* Reflections History */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Reflection History</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {!reflections || reflections.length === 0 ? (<div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground mb-2">No reflections yet</p>
                <p className="text-sm text-muted-foreground/80">Start documenting your growth journey today</p>
              </div>) : (reflections.map(function (reflection) { return (<div key={reflection.id} className="p-6 space-y-3" data-testid={"reflection-".concat(reflection.id)}>
                  <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(reflection.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="leading-relaxed">{reflection.reflectionText}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {reflection.habitScore}
                        </span>
                      </div>
                      <span className="text-2xs text-muted-foreground uppercase tracking-wide">
                        Score
                      </span>
                    </div>
                  </div>
                </div>); }))}
          </div>
        </Card>

        {/* Weekly Check-In Section */}
        <Card className="p-6 border bg-slate-50/30 border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
                <ClipboardList className="w-5 h-5 text-slate-600"/>
                Weekly Check-In
              </h2>
              <p className="text-sm text-muted-foreground">
                Submit your weekly update to your Territory Director
              </p>
            </div>
          </div>

          <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" variant="default">
                <Plus className="w-4 h-4"/>
                Start Weekly Check-In
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Weekly Check-In for Week of {format(startOfWeek(new Date()), "MMMM d, yyyy")}</DialogTitle>
              </DialogHeader>

              <form onSubmit={function (e) {
            e.preventDefault();
            submitWeeklyCheckIn.mutate();
        }} className="space-y-6">
                {/* Sessions Summary */}
                <div className="space-y-2">
                  <Label htmlFor="sessions-summary" className="font-semibold">
                    How were your sessions this week?
                  </Label>
                  <Textarea id="sessions-summary" placeholder="Describe how your sessions went, energy levels, student engagement, etc." value={checkInData.sessionsSummary} onChange={function (e) {
            return setCheckInData(__assign(__assign({}, checkInData), { sessionsSummary: e.target.value }));
        }} className="min-h-24 resize-none"/>
                </div>

                {/* Wins */}
                <div className="space-y-2">
                  <Label htmlFor="wins" className="font-semibold">
+                    Wins this week
                  </Label>
                  <Textarea id="wins" placeholder="What went well? What are you proud of?" value={checkInData.wins} onChange={function (e) { return setCheckInData(__assign(__assign({}, checkInData), { wins: e.target.value })); }} className="min-h-24 resize-none"/>
                </div>

                {/* Challenges */}
                <div className="space-y-2">
                  <Label htmlFor="challenges" className="font-semibold">
                    Challenges faced
                  </Label>
                  <Textarea id="challenges" placeholder="What challenges did you face this week?" value={checkInData.challenges} onChange={function (e) {
            return setCheckInData(__assign(__assign({}, checkInData), { challenges: e.target.value }));
        }} className="min-h-24 resize-none"/>
                </div>

                {/* Emotions & Thoughts */}
                <div className="space-y-2">
                  <Label htmlFor="emotions" className="font-semibold">
                    Emotions felt and thoughts
                  </Label>
                  <Textarea id="emotions" placeholder="How are you feeling? What's on your mind?" value={checkInData.emotions} onChange={function (e) {
            return setCheckInData(__assign(__assign({}, checkInData), { emotions: e.target.value }));
        }} className="min-h-24 resize-none"/>
                </div>

                {/* Skill Improvement */}
                <div className="space-y-2">
                  <Label htmlFor="skill-improvement" className="font-semibold">
                    Working on improving about student transformation skills
                  </Label>
                  <Textarea id="skill-improvement" placeholder="What aspect of your tutoring/transformation skills are you working on?" value={checkInData.skillImprovement} onChange={function (e) {
            return setCheckInData(__assign(__assign({}, checkInData), { skillImprovement: e.target.value }));
        }} className="min-h-24 resize-none"/>
                </div>

                {/* Help Needed */}
                <div className="space-y-2">
                  <Label htmlFor="help-needed" className="font-semibold">
                    Help needed or questions (Optional)
                  </Label>
                  <Textarea id="help-needed" placeholder="Is there anything you need help with or any questions for your TD?" value={checkInData.helpNeeded} onChange={function (e) {
            return setCheckInData(__assign(__assign({}, checkInData), { helpNeeded: e.target.value }));
        }} className="min-h-24 resize-none"/>
                </div>

                {/* Next Week Goals */}
                <div className="space-y-2">
                  <Label htmlFor="next-week-goals" className="font-semibold">
                    Goals for next week
                  </Label>
                  <Textarea id="next-week-goals" placeholder="What are your goals for next week?" value={checkInData.nextWeekGoals} onChange={function (e) {
            return setCheckInData(__assign(__assign({}, checkInData), { nextWeekGoals: e.target.value }));
        }} className="min-h-24 resize-none"/>
                </div>

                <Button type="submit" className="w-full" disabled={submitWeeklyCheckIn.isPending}>
                  {submitWeeklyCheckIn.isPending ? "Submitting..." : "Submit Check-In"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </DashboardLayout>);
}
