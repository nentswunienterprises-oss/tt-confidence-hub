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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
export default function TutorSessions() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(false), dialogOpen = _b[0], setDialogOpen = _b[1];
    var _c = useState(false), hasBossBattles = _c[0], setHasBossBattles = _c[1];
    var _d = useState(false), assignPractice = _d[0], setAssignPractice = _d[1];
    var _e = useState(false), has3LayerSolutions = _e[0], setHas3LayerSolutions = _e[1];
    var _f = useState(false), hasChallenges = _f[0], setHasChallenges = _f[1];
    var _g = useState(false), hasTechChallenges = _g[0], setHasTechChallenges = _g[1];
    var _h = useState({
        studentId: "",
        duration: "120",
        notes: "",
        // 3-Layer Lens Teaching Model fields
        solutionPurpose: "",
        vocabularyNotes: "",
        methodNotes: "",
        reasonNotes: "",
        studentResponse: "",
        tutorGrowthReflection: "",
        bossBattlesDone: "",
        practiceProblems: "",
        whatMisunderstood: "",
        correctionHelped: "",
        needsReinforcement: "",
        techChallengeDescription: "",
        techChallengeResolution: "",
    }), formData = _h[0], setFormData = _h[1];
    var _j = useQuery({
        queryKey: ["/api/tutor/sessions"],
        enabled: isAuthenticated && !authLoading,
    }), sessions = _j.data, sessionsLoading = _j.isLoading, sessionsError = _j.error;
    var _k = useQuery({
        queryKey: ["/api/tutor/students"],
        enabled: isAuthenticated && !authLoading,
    }), students = _k.data, studentsLoading = _k.isLoading;
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
        if (sessionsError && isUnauthorizedError(sessionsError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [sessionsError, toast]);
    var createSession = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/tutor/sessions", {
                            studentId: data.studentId,
                            duration: parseInt(data.duration),
                            notes: data.notes.trim() || null,
                            solutionPurpose: data.solutionPurpose.trim() || null,
                            vocabularyNotes: data.vocabularyNotes.trim() || null,
                            methodNotes: data.methodNotes.trim() || null,
                            reasonNotes: data.reasonNotes.trim() || null,
                            studentResponse: data.studentResponse.trim() || null,
                            tutorGrowthReflection: data.tutorGrowthReflection.trim() || null,
                            bossBattlesDone: data.bossBattlesDone.trim() || null,
                            practiceProblems: data.practiceProblems.trim() || null,
                            whatMisunderstood: data.whatMisunderstood.trim() || null,
                            correctionHelped: data.correctionHelped.trim() || null,
                            needsReinforcement: data.needsReinforcement.trim() || null,
                            techChallengeDescription: data.techChallengeDescription.trim() || null,
                            techChallengeResolution: data.techChallengeResolution.trim() || null,
                            date: new Date().toISOString(),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/sessions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/students"] });
            setDialogOpen(false);
            setHasBossBattles(false);
            setAssignPractice(false);
            setHas3LayerSolutions(false);
            setHasChallenges(false);
            setHasTechChallenges(false);
            setFormData({
                studentId: "",
                duration: "120",
                notes: "",
                solutionPurpose: "",
                vocabularyNotes: "",
                methodNotes: "",
                reasonNotes: "",
                studentResponse: "",
                tutorGrowthReflection: "",
                bossBattlesDone: "",
                practiceProblems: "",
                whatMisunderstood: "",
                correctionHelped: "",
                needsReinforcement: "",
                techChallengeDescription: "",
                techChallengeResolution: "",
            });
            toast({
                title: "Session logged",
                description: "Your session has been recorded successfully.",
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
                description: "Failed to log session. Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.studentId || !formData.duration) {
            toast({
                title: "Validation Error",
                description: "Please select a student and duration.",
                variant: "destructive",
            });
            return;
        }
        createSession.mutate(formData);
    };
    if (authLoading || sessionsLoading || studentsLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-40"/>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    var getStudentName = function (studentId) {
        var _a;
        return ((_a = students === null || students === void 0 ? void 0 : students.find(function (s) { return s.id === studentId; })) === null || _a === void 0 ? void 0 : _a.name) || "Unknown";
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sessions</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-log-session">
                <Plus className="w-4 h-4"/>
                Log Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Log New Session</DialogTitle>
                  <DialogDescription>
                    Record your session using the 3-Layer Lens Teaching Model
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Student Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="student">Student *</Label>
                    <Select value={formData.studentId} onValueChange={function (value) {
            return setFormData(__assign(__assign({}, formData), { studentId: value }));
        }}>
                      <SelectTrigger data-testid="select-student">
                        <SelectValue placeholder="Select a student"/>
                      </SelectTrigger>
                      <SelectContent>
                        {students === null || students === void 0 ? void 0 : students.map(function (student) { return (<SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.grade}
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input id="duration" type="number" min="30" max="240" value={formData.duration} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { duration: e.target.value }));
        }} data-testid="input-duration"/>
                  </div>

                  {/* Session Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Session Notes</Label>
                    <Textarea id="notes" placeholder="What did you cover? Any challenges or breakthroughs?" value={formData.notes} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }} rows={3} data-testid="input-notes"/>
                  </div>

                  {/* 3-Layer Solutions Implemented */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="has3LayerSolutions">3-Layer Solutions Implemented?</Label>
                      <Switch id="has3LayerSolutions" checked={has3LayerSolutions} onCheckedChange={function (checked) {
            setHas3LayerSolutions(checked);
            if (!checked) {
                setFormData(__assign(__assign({}, formData), { solutionPurpose: "", vocabularyNotes: "", methodNotes: "", reasonNotes: "" }));
            }
        }} data-testid="switch-3-layer-solutions"/>
                    </div>
                    {has3LayerSolutions && (<div className="space-y-3 border-t pt-3">
                        <div className="space-y-2">
                          <Label htmlFor="solutionPurpose">What solution (describe the purpose)?</Label>
                          <Textarea id="solutionPurpose" placeholder="What is the purpose of this solution? What problem does it solve?" value={formData.solutionPurpose} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { solutionPurpose: e.target.value })); }} rows={2} data-testid="input-solution-purpose"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vocabulary">Vocabulary Notes</Label>
                          <Textarea id="vocabulary" placeholder="What terms/concepts did you teach?" value={formData.vocabularyNotes} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { vocabularyNotes: e.target.value })); }} rows={2} data-testid="input-vocabulary"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="method">Method Notes</Label>
                          <Textarea id="method" placeholder="What steps/process did you follow?" value={formData.methodNotes} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { methodNotes: e.target.value })); }} rows={2} data-testid="input-method"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason Notes</Label>
                          <Textarea id="reason" placeholder="Why does this approach work?" value={formData.reasonNotes} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { reasonNotes: e.target.value })); }} rows={2} data-testid="input-reason"/>
                        </div>
                      </div>)}
                  </div>

                  {/* Student Response */}
                  <div className="space-y-2">
                    <Label htmlFor="studentResponse">Student Response</Label>
                    <Textarea id="studentResponse" placeholder="How did the student respond to today's session?" value={formData.studentResponse} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { studentResponse: e.target.value })); }} rows={2} data-testid="input-student-response"/>
                  </div>

                  {/* Any Challenges */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasChallenges">Any Challenges?</Label>
                      <Switch id="hasChallenges" checked={hasChallenges} onCheckedChange={function (checked) {
            setHasChallenges(checked);
            if (!checked) {
                setFormData(__assign(__assign({}, formData), { whatMisunderstood: "", correctionHelped: "", needsReinforcement: "" }));
            }
        }} data-testid="switch-challenges"/>
                    </div>
                    {hasChallenges && (<div className="space-y-3 border-t pt-3">
                        <div className="space-y-2">
                          <Label htmlFor="whatMisunderstood">1. What was misunderstood?</Label>
                          <Textarea id="whatMisunderstood" placeholder="Describe what the student misunderstood" value={formData.whatMisunderstood} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { whatMisunderstood: e.target.value })); }} rows={2} data-testid="input-what-misunderstood"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="correctionHelped">2. What correction helped?</Label>
                          <Textarea id="correctionHelped" placeholder="Describe the correction or approach that helped" value={formData.correctionHelped} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { correctionHelped: e.target.value })); }} rows={2} data-testid="input-correction-helped"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="needsReinforcement">3. What needs to be reinforced?</Label>
                          <Textarea id="needsReinforcement" placeholder="Describe what concepts or skills need reinforcement" value={formData.needsReinforcement} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { needsReinforcement: e.target.value })); }} rows={2} data-testid="input-needs-reinforcement"/>
                        </div>
                      </div>)}
                  </div>

                  {/* Any Tech Challenges */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasTechChallenges">Any Tech Challenges?</Label>
                      <Switch id="hasTechChallenges" checked={hasTechChallenges} onCheckedChange={function (checked) {
            setHasTechChallenges(checked);
            if (!checked) {
                setFormData(__assign(__assign({}, formData), { techChallengeDescription: "", techChallengeResolution: "" }));
            }
        }} data-testid="switch-tech-challenges"/>
                    </div>
                    {hasTechChallenges && (<div className="space-y-3 border-t pt-3">
                        <div className="space-y-2">
                          <Label htmlFor="techChallengeDescription">1. Describe the challenge & incident</Label>
                          <Textarea id="techChallengeDescription" placeholder="Describe the technical challenge and what happened" value={formData.techChallengeDescription} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { techChallengeDescription: e.target.value })); }} rows={2} data-testid="input-tech-challenge-description"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="techChallengeResolution">2. How it ended (methods taken)</Label>
                          <Textarea id="techChallengeResolution" placeholder="Describe how the issue was resolved or the methods used" value={formData.techChallengeResolution} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { techChallengeResolution: e.target.value })); }} rows={2} data-testid="input-tech-challenge-resolution"/>
                        </div>
                      </div>)}
                  </div>

                  {/* Tutor Growth Reflection */}
                  <div className="space-y-2">
                    <Label htmlFor="reflection">Tutor Growth Reflection/Notes</Label>
                    <Textarea id="reflection" placeholder="What did you learn? How can you improve?" value={formData.tutorGrowthReflection} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { tutorGrowthReflection: e.target.value })); }} rows={2} data-testid="input-tutor-reflection"/>
                  </div>

                  {/* Boss Battles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasBossBattles">Any Boss Battles done in-session?</Label>
                      <Switch id="hasBossBattles" checked={hasBossBattles} onCheckedChange={function (checked) {
            setHasBossBattles(checked);
            if (!checked) {
                setFormData(__assign(__assign({}, formData), { bossBattlesDone: "" }));
            }
        }} data-testid="switch-boss-battles"/>
                    </div>
                    {hasBossBattles && (<Textarea placeholder="Describe the Boss Battles completed" value={formData.bossBattlesDone} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { bossBattlesDone: e.target.value })); }} rows={2} data-testid="input-boss-battles"/>)}
                  </div>

                  {/* Practice Problems */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="assignPractice">Assign Practice Problems?</Label>
                      <Switch id="assignPractice" checked={assignPractice} onCheckedChange={function (checked) {
            setAssignPractice(checked);
            if (!checked) {
                setFormData(__assign(__assign({}, formData), { practiceProblems: "" }));
            }
        }} data-testid="switch-practice-problems"/>
                    </div>
                    {assignPractice && (<Textarea placeholder="Practice problems assigned for student" value={formData.practiceProblems} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { practiceProblems: e.target.value })); }} rows={2} data-testid="input-practice-problems"/>)}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createSession.isPending} data-testid="button-submit-session">
                    {createSession.isPending ? "Saving..." : "Log Session"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">{(sessions === null || sessions === void 0 ? void 0 : sessions.length) || 0}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">
                {(sessions === null || sessions === void 0 ? void 0 : sessions.reduce(function (sum, s) { return sum + s.duration; }, 0)) || 0}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Minutes</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"/>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">
                {sessions && sessions.length > 0
            ? (sessions.reduce(function (sum, s) { return sum + s.duration; }, 0) / sessions.length).toFixed(0)
            : 0}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Avg. Duration</p>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Session History</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {!sessions || sessions.length === 0 ? (<div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No sessions logged yet</p>
              </div>) : (sessions.map(function (session) { return (<div key={session.id} className="p-6 space-y-3" data-testid={"session-".concat(session.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{getStudentName(session.studentId)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.duration} min</p>
                        {session.confidenceScoreDelta !== null &&
                session.confidenceScoreDelta !== 0 && (<p className={"text-xs font-semibold ".concat(session.confidenceScoreDelta > 0
                    ? "text-green-600"
                    : "text-red-600")}>
                              {session.confidenceScoreDelta > 0 ? "+" : ""}
                              {session.confidenceScoreDelta} confidence
                            </p>)}
                      </div>
                    </div>
                  </div>
                  {session.notes && (<p className="text-sm text-muted-foreground leading-relaxed">
                      {session.notes}
                    </p>)}
                </div>); }))}
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}
