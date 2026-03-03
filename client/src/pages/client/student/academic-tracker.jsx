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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, Plus, Target, Edit, Trash2, CheckCircle2, Calendar, } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
export default function StudentAcademicTracker() {
    var _this = this;
    var toast = useToast().toast;
    var _a = useState(false), profileDialogOpen = _a[0], setProfileDialogOpen = _a[1];
    var _b = useState(false), targetDialogOpen = _b[0], setTargetDialogOpen = _b[1];
    var _c = useState(null), editingTargetId = _c[0], setEditingTargetId = _c[1];
    var _d = useState({
        fullName: "",
        grade: "",
        school: "",
        latestTermReport: "",
        myThoughts: "",
        currentChallenges: "",
        recentWins: "",
        upcomingExamsProjects: "",
    }), profileData = _d[0], setProfileData = _d[1];
    var _e = useState({
        subject: "",
        topicConcept: "",
        myStruggle: "",
        strategy: "",
        consolidationDate: "",
    }), targetData = _e[0], setTargetData = _e[1];
    var _f = useQuery({
        queryKey: ["/api/student/profile"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), profile = _f.data, profileLoading = _f.isLoading, refetchProfile = _f.refetch;
    var _g = useQuery({
        queryKey: ["/api/student/targets"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), targets = _g.data, targetsLoading = _g.isLoading, refetchTargets = _g.refetch;
    useEffect(function () {
        if (profile) {
            setProfileData({
                fullName: profile.fullName || "",
                grade: profile.grade || "",
                school: profile.school || "",
                latestTermReport: profile.latestTermReport || "",
                myThoughts: profile.myThoughts || "",
                currentChallenges: profile.currentChallenges || "",
                recentWins: profile.recentWins || "",
                upcomingExamsProjects: profile.upcomingExamsProjects || "",
            });
        }
    }, [profile]);
    var saveProfile = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/student/profile", profileData)];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            refetchProfile();
            setProfileDialogOpen(false);
            toast({
                title: "Profile saved",
                description: "Your academic profile updated successfully.",
            });
        },
        onError: function (error) {
            if (isUnauthorizedError(error)) {
                window.location.href = "/student-login";
                return;
            }
            toast({
                title: "Error",
                description: "Failed to save profile. Please try again.",
                variant: "destructive",
            });
        },
    });
    var saveTarget = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var res, json, res, json, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        if (!editingTargetId) return [3 /*break*/, 3];
                        return [4 /*yield*/, apiRequest("PUT", "/api/student/targets/".concat(editingTargetId), __assign(__assign({}, targetData), { consolidationDate: targetData.consolidationDate ? new Date(targetData.consolidationDate).toISOString() : null }))];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = _a.sent();
                        console.log("PUT response:", json);
                        return [2 /*return*/, json];
                    case 3: return [4 /*yield*/, apiRequest("POST", "/api/student/targets", __assign(__assign({}, targetData), { consolidationDate: targetData.consolidationDate ? new Date(targetData.consolidationDate).toISOString() : null }))];
                    case 4:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 5:
                        json = _a.sent();
                        console.log("POST response:", json);
                        return [2 /*return*/, json];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_1 = _a.sent();
                        console.error("Mutation error:", err_1);
                        throw err_1;
                    case 8: return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            refetchTargets();
            queryClient.invalidateQueries({ queryKey: ["/api/student/targets"] });
            setTargetDialogOpen(false);
            setEditingTargetId(null);
            setTargetData({
                subject: "",
                topicConcept: "",
                myStruggle: "",
                strategy: "",
                consolidationDate: "",
            });
            toast({
                title: editingTargetId ? "Target updated" : "Target added",
                description: "Struggle target saved successfully.",
            });
        },
        onError: function (error) {
            if (isUnauthorizedError(error)) {
                window.location.href = "/student-login";
                return;
            }
            toast({
                title: "Error",
                description: "Failed to save target. Please try again.",
                variant: "destructive",
            });
        },
    });
    var toggleOvercame = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var id = _b.id, overcame = _b.overcame;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, apiRequest("PUT", "/api/student/targets/".concat(id), { overcame: overcame })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            refetchTargets();
            toast({
                title: "Target updated",
                description: "Status changed successfully.",
            });
        },
    });
    var deleteTarget = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/student/targets/".concat(id), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            refetchTargets();
            toast({
                title: "Target deleted",
                description: "Struggle target removed successfully.",
            });
        },
    });
    var handleEditTarget = function (target) {
        setEditingTargetId(target.id);
        setTargetData({
            subject: target.subject,
            topicConcept: target.topicConcept || "",
            myStruggle: target.myStruggle || "",
            strategy: target.strategy,
            consolidationDate: target.consolidationDate
                ? format(new Date(target.consolidationDate), "yyyy-MM-dd")
                : "",
        });
        setTargetDialogOpen(true);
    };
    if (profileLoading) {
        return (<div className="space-y-6">
        <Skeleton className="h-8 w-48"/>
        <Skeleton className="h-40"/>
      </div>);
    }
    return (<div className="space-y-4 sm:space-y-8 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:gap-2 border-b pb-4 sm:pb-6">
        <h1 className="text-xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Academic Health Center
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Your personal command center for academic excellence and strategic growth
        </p>
      </div>

      {/* Academic Profile Section */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 space-y-0 pb-4 border-b p-3 sm:p-6">
          <div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-primary"/>
              </div>
              Academic Profile
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Your command center. Answer: What's happening? How do you feel? What's next?
            </p>
          </div>
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-full sm:w-auto">
                <Edit className="w-4 h-4"/>
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Update Academic Profile</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Update your academic profile and current status
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name *</Label>
                    <Input id="fullName" className="text-sm" value={profileData.fullName} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { fullName: e.target.value })); }}/>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="grade" className="text-xs sm:text-sm">Grade *</Label>
                    <Input id="grade" className="text-sm" value={profileData.grade} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { grade: e.target.value })); }}/>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="school" className="text-xs sm:text-sm">School</Label>
                  <Input id="school" className="text-sm" value={profileData.school} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { school: e.target.value })); }}/>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="termReport" className="text-xs sm:text-sm">Latest Term Report</Label>
                  <Textarea id="termReport" className="text-sm" placeholder="Summary of recent academic performance..." value={profileData.latestTermReport} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { latestTermReport: e.target.value })); }} rows={3}/>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="thoughts">My Thoughts</Label>
                  <Textarea id="thoughts" placeholder="How do you feel about your progress?" value={profileData.myThoughts} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { myThoughts: e.target.value })); }} rows={2}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="challenges">Current Challenges</Label>
                  <Textarea id="challenges" placeholder="What's difficult right now?" value={profileData.currentChallenges} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { currentChallenges: e.target.value })); }} rows={2}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wins">Recent Wins</Label>
                  <Textarea id="wins" placeholder="What went well recently?" value={profileData.recentWins} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { recentWins: e.target.value })); }} rows={2}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exams">Upcoming Exams/Projects</Label>
                  <Textarea id="exams" placeholder="What's coming up?" value={profileData.upcomingExamsProjects} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { upcomingExamsProjects: e.target.value })); }} rows={2}/>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={function () { return saveProfile.mutate(); }} disabled={saveProfile.isPending || !profileData.fullName || !profileData.grade}>
                  {saveProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {profileLoading ? (<div className="space-y-2">
              <Skeleton className="h-4 w-full"/>
              <Skeleton className="h-4 w-3/4"/>
            </div>) : profile || profileData.fullName ? (<div className="grid gap-3 sm:gap-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-sm sm:text-base">{(profile === null || profile === void 0 ? void 0 : profile.fullName) || profileData.fullName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Grade</p>
                  <p className="text-sm sm:text-base">{(profile === null || profile === void 0 ? void 0 : profile.grade) || profileData.grade || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">School</p>
                  <p className="text-sm sm:text-base">{(profile === null || profile === void 0 ? void 0 : profile.school) || profileData.school || "Not set"}</p>
                </div>
              </div>
              {((profile === null || profile === void 0 ? void 0 : profile.latestTermReport) || profileData.latestTermReport) && (<div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Latest Term Report</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{(profile === null || profile === void 0 ? void 0 : profile.latestTermReport) || profileData.latestTermReport}</p>
                </div>)}
              {((profile === null || profile === void 0 ? void 0 : profile.myThoughts) || profileData.myThoughts) && (<div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">My Thoughts</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{(profile === null || profile === void 0 ? void 0 : profile.myThoughts) || profileData.myThoughts}</p>
                </div>)}
              {((profile === null || profile === void 0 ? void 0 : profile.currentChallenges) || profileData.currentChallenges) && (<div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Challenges</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{(profile === null || profile === void 0 ? void 0 : profile.currentChallenges) || profileData.currentChallenges}</p>
                </div>)}
              {((profile === null || profile === void 0 ? void 0 : profile.recentWins) || profileData.recentWins) && (<div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Recent Wins</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{(profile === null || profile === void 0 ? void 0 : profile.recentWins) || profileData.recentWins}</p>
                </div>)}
              {profileData.upcomingExamsProjects && (<div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Upcoming Exams/Projects</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{profileData.upcomingExamsProjects}</p>
                </div>)}
            </div>) : (<p className="text-sm text-muted-foreground">No profile data yet. Click Edit to get started.</p>)}
        </CardContent>
      </Card>

      {/* Target Center Section */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 space-y-0 pb-4 border-b p-3 sm:p-6">
          <div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-primary"/>
              </div>
              Strategy Center
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              From stuck to strategic. Plan your bounce-back from academic struggles.
            </p>
          </div>
          <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-full sm:w-auto" onClick={function () {
            setEditingTargetId(null);
            setTargetData({
                subject: "",
                topicConcept: "",
                myStruggle: "",
                strategy: "",
                consolidationDate: "",
            });
        }}>
                <Plus className="w-4 h-4"/>
                Add Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-2 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {editingTargetId ? "Edit Struggle Target" : "New Struggle Target"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm" className="text-xs sm:text-sm">
                  Track a specific struggle and plan how to overcome it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="subject" className="text-xs sm:text-sm">Subject *</Label>
                    <Input id="subject" className="text-sm" placeholder="e.g., Mathematics" value={targetData.subject} onChange={function (e) { return setTargetData(__assign(__assign({}, targetData), { subject: e.target.value })); }}/>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="topic" className="text-xs sm:text-sm">Topic/Concept *</Label>
                    <Input id="topic" className="text-sm" placeholder="e.g., Quadratic Equations" value={targetData.topicConcept} onChange={function (e) { return setTargetData(__assign(__assign({}, targetData), { topicConcept: e.target.value })); }}/>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="struggle" className="text-xs sm:text-sm">My Struggle *</Label>
                  <Textarea id="struggle" className="text-sm" placeholder="What exactly are you struggling with?" value={targetData.myStruggle} onChange={function (e) { return setTargetData(__assign(__assign({}, targetData), { myStruggle: e.target.value })); }} rows={3}/>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="strategy" className="text-xs sm:text-sm">Strategy *</Label>
                  <Textarea id="strategy" className="text-sm" placeholder="What will you do to overcome this?" value={targetData.strategy} onChange={function (e) { return setTargetData(__assign(__assign({}, targetData), { strategy: e.target.value })); }} rows={3}/>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="consolidationDate" className="text-xs sm:text-sm">Consolidation Date</Label>
                  <Input id="consolidationDate" className="text-sm" type="date" value={targetData.consolidationDate} onChange={function (e) { return setTargetData(__assign(__assign({}, targetData), { consolidationDate: e.target.value })); }}/>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={function () { return saveTarget.mutate(); }} disabled={saveTarget.isPending ||
            !targetData.subject ||
            !targetData.topicConcept ||
            !targetData.myStruggle ||
            !targetData.strategy}>
                  {saveTarget.isPending ? "Saving..." : editingTargetId ? "Update Target" : "Add Target"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {targetsLoading ? (<div className="space-y-2">
              <Skeleton className="h-20"/>
              <Skeleton className="h-20"/>
            </div>) : !targets || targets.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
              No struggle targets yet. Click "Add Target" to track a challenge.
            </p>) : (<div className="space-y-3">
              {targets.map(function (target) { return (<Card key={target.id}>
                  <CardContent className="p-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{target.subject}</Badge>
                          <Badge variant="secondary" className="text-xs">{target.topicConcept}</Badge>
                          {target.overcame ? (<Badge className="bg-green-600 hover:bg-green-700 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1"/>
                              Overcame
                            </Badge>) : (<Badge variant="outline" className="text-xs">In Progress</Badge>)}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Struggle:</p>
                          <p className="text-xs sm:text-sm">{target.myStruggle}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Strategy:</p>
                          <p className="text-xs sm:text-sm">{target.strategy}</p>
                        </div>
                        {target.consolidationDate && (<div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4"/>
                            <span>
                              Target:{" "}
                              {format(new Date(target.consolidationDate), "MMM dd, yyyy")}
                            </span>
                          </div>)}
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 justify-between sm:justify-start">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={"overcame-".concat(target.id)} className="text-xs">
                            Overcame?
                          </Label>
                          <Switch id={"overcame-".concat(target.id)} checked={target.overcame} onCheckedChange={function (checked) {
                    return toggleOvercame.mutate({ id: target.id, overcame: checked });
                }}/>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={function () { return handleEditTarget(target); }}>
                            <Edit className="w-4 h-4"/>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={function () { return deleteTarget.mutate(target.id); }}>
                            <Trash2 className="w-4 h-4 text-destructive"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>); })}
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
