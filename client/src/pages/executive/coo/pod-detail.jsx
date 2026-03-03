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
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, Calendar, Zap, Trash2, Plus, ChevronDown, FileText, } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
export default function PodDetail() {
    var _this = this;
    var podId = useParams().podId;
    var navigate = useNavigate();
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(false), addTutorsOpen = _b[0], setAddTutorsOpen = _b[1];
    var _c = useState([]), selectedTutorIds = _c[0], setSelectedTutorIds = _c[1];
    var _d = useState(null), tutorToRemove = _d[0], setTutorToRemove = _d[1];
    var _e = useState(new Set()), expandedTutors = _e[0], setExpandedTutors = _e[1];
    // Student dialog state
    var _f = useState(false), identitySheetOpen = _f[0], setIdentitySheetOpen = _f[1];
    var _g = useState(false), assignmentsDialogOpen = _g[0], setAssignmentsDialogOpen = _g[1];
    var _h = useState(false), trackingDialogOpen = _h[0], setTrackingDialogOpen = _h[1];
    var _j = useState(""), selectedStudentId = _j[0], setSelectedStudentId = _j[1];
    var _k = useState(""), selectedStudentName = _k[0], setSelectedStudentName = _k[1];
    if (!podId) {
        navigate("/coo/pods");
        return null;
    }
    // @ts-ignore - React Query generic inference issue, safe at runtime
    var _l = useQuery({
        queryKey: ["/api/coo/pods"],
        enabled: isAuthenticated && !authLoading,
    }), pods = _l.data, podLoading = _l.isLoading;
    var currentPod = pods === null || pods === void 0 ? void 0 : pods.find(function (p) { return p.id === podId; });
    var _m = useQuery({
        queryKey: ["/api/coo/tds"],
        enabled: isAuthenticated && !authLoading,
    }), tds = _m.data, tdsLoading = _m.isLoading;
    var _o = useQuery({
        queryKey: ["/api/coo/approved-tutors"],
        enabled: isAuthenticated && !authLoading,
    }), approvedTutors = _o.data, tutorsLoading = _o.isLoading;
    var _p = useQuery({
        queryKey: ["/api/coo/all-tutor-assignments"],
        enabled: isAuthenticated && !authLoading,
    }), assignedTutorIds = _p.data, assignedTutorsLoading = _p.isLoading;
    var _q = useQuery({
        queryKey: ["/api/coo/pods/".concat(podId, "/tutors")],
        enabled: isAuthenticated && !authLoading && !!podId,
    }), podTutors = _q.data, podTutorsLoading = _q.isLoading, refetchPodTutors = _q.refetch;
    var _r = useQuery({
        queryKey: ["/api/coo/pods/".concat(podId, "/stats")],
        enabled: isAuthenticated && !authLoading && !!podId,
    }), podStats = _r.data, statsLoading = _r.isLoading;
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                navigate("/");
            }, 1000);
        }
    }, [authLoading, isAuthenticated, navigate, toast]);
    useEffect(function () {
        console.log("📊 Pod detail data loaded:");
        console.log("  - assignedTutorIds:", assignedTutorIds);
        console.log("  - assignedTutorsLoading:", assignedTutorsLoading);
        console.log("  - approvedTutors:", approvedTutors === null || approvedTutors === void 0 ? void 0 : approvedTutors.length);
        console.log("  - tutorsLoading:", tutorsLoading);
    }, [assignedTutorIds, assignedTutorsLoading, approvedTutors, tutorsLoading]);
    var removeTutorMutation = useMutation({
        mutationFn: function (assignmentId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/coo/pods/".concat(podId, "/tutors/").concat(assignmentId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            refetchPodTutors();
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            setTutorToRemove(null);
            toast({
                title: "Success",
                description: "Tutor removed from pod.",
            });
        },
        onError: function () {
            toast({
                title: "Error",
                description: "Failed to remove tutor from pod.",
                variant: "destructive",
            });
        },
    });
    var addTutorsMutation = useMutation({
        mutationFn: function (tutorIds) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/coo/pods/".concat(podId, "/tutors"), { tutorIds: tutorIds })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            refetchPodTutors();
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            setAddTutorsOpen(false);
            setSelectedTutorIds([]);
            toast({
                title: "Success",
                description: "Tutors added to pod.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to add tutors to pod.",
                variant: "destructive",
            });
        },
    });
    // Delete Pod mutation (soft delete) ✅
    var deletePodMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/coo/pods/".concat(podId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/tds"] });
            toast({ title: "Pod deleted", description: "Pod deleted successfully." });
            navigate("/coo/pods");
        },
        onError: function () {
            toast({ title: "Error", description: "Failed to delete pod.", variant: "destructive" });
        },
    });
    var getTDName = function (tdId) {
        var _a;
        if (!tdId)
            return "Unassigned";
        return ((_a = tds === null || tds === void 0 ? void 0 : tds.find(function (td) { return td.id === tdId; })) === null || _a === void 0 ? void 0 : _a.name) || "Unknown";
    };
    var getStatusColor = function (status) {
        return status === "active"
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-blue-100 text-blue-800 border-blue-200";
    };
    var getCertificationColor = function (status) {
        switch (status) {
            case "passed":
                return "bg-emerald-100 text-emerald-700 border border-emerald-300";
            case "failed":
                return "bg-red-100 text-red-700 border border-red-300";
            default:
                return "bg-amber-100 text-amber-700 border border-amber-300";
        }
    };
    var toggleTutorExpand = function (tutorId) {
        var newExpanded = new Set(expandedTutors);
        if (newExpanded.has(tutorId)) {
            newExpanded.delete(tutorId);
        }
        else {
            newExpanded.add(tutorId);
        }
        setExpandedTutors(newExpanded);
    };
    if (podLoading || tdsLoading || tutorsLoading || authLoading || statsLoading) {
        return (<DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-48"/>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-1 h-64"/>
            <Skeleton className="lg:col-span-2 h-96"/>
          </div>
        </div>
      </DashboardLayout>);
    }
    if (!pods) {
        return (<DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Pod not found</p>
          <Button onClick={function () { return navigate("/coo/pods"); }}>Back to Pods</Button>
        </div>
      </DashboardLayout>);
    }
    if (!currentPod) {
        return (<DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Pod not found</p>
          <Button onClick={function () { return navigate("/coo/pods"); }}>Back to Pods</Button>
        </div>
      </DashboardLayout>);
    }
    var podName = currentPod.podName;
    var tdName = getTDName(currentPod.tdId);
    var tutorCount = (podTutors === null || podTutors === void 0 ? void 0 : podTutors.length) || 0;
    var maxTutors = 10;
    var availableSlots = maxTutors - tutorCount;
    // Debug logging
    console.log("🔍 Approved tutors:", approvedTutors === null || approvedTutors === void 0 ? void 0 : approvedTutors.map(function (t) { return ({ id: t.id, name: t.name }); }));
    console.log("🔍 Assigned tutor IDs (raw):", assignedTutorIds);
    console.log("🔍 Is assignedTutorIds an array?", Array.isArray(assignedTutorIds));
    console.log("🔍 Assigned tutor IDs type:", typeof assignedTutorIds);
    var availableTutors = (approvedTutors === null || approvedTutors === void 0 ? void 0 : approvedTutors.filter(function (tutor) {
        // Ensure we're comparing strings to strings
        var tutorIdStr = String(tutor.id).trim();
        var isInList = assignedTutorIds && assignedTutorIds.length > 0
            ? assignedTutorIds.some(function (id) { return String(id).trim() === tutorIdStr; })
            : false;
        if (!isInList) {
            console.log("\u2705 ".concat(tutor.name, " (").concat(tutor.id, "): NOT assigned - will show in dialog"));
        }
        else {
            console.log("\u274C ".concat(tutor.name, " (").concat(tutor.id, "): ASSIGNED - will NOT show in dialog"));
        }
        return !isInList;
    })) || [];
    return (<DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={function () { return navigate("/coo/pods"); }} className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5"/>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate flex-1">{podName}</h1>

          {/* Delete Pod (soft delete) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Pod?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will soft-delete the pod and clear its Territory Director assignment. The pod can be viewed in Deleted Pods but this action cannot be undone from the app.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={function () { return deletePodMutation.mutate(); }} className="bg-red-600 hover:bg-red-700" disabled={deletePodMutation.isPending}>
                {deletePodMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Students</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{(podStats === null || podStats === void 0 ? void 0 : podStats.totalStudents) || 0}</p>
              </div>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 opacity-50"/>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Sessions</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{(podStats === null || podStats === void 0 ? void 0 : podStats.sessionsCompleted) || 0}</p>
              </div>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 opacity-50"/>
            </div>
          </Card>
        </div>

        {/* Pod Info Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Status */}
            <Card className="p-4 sm:p-6 border">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Status</p>
              <div className="mt-2 sm:mt-3">
                <Badge className={"".concat(getStatusColor(currentPod.status), " border font-semibold text-xs")}>
                  {currentPod.status}
                </Badge>
              </div>
            </Card>

            {/* Territory Director */}
            <Card className="p-4 sm:p-6 border">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary"/>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Territory Director</p>
              </div>
              <p className="font-medium text-sm sm:text-base">{tdName}</p>
            </Card>

            {/* Start Date */}
            {currentPod.startDate && (<Card className="p-4 sm:p-6 border">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary"/>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Started</p>
                </div>
                <p className="font-medium text-sm sm:text-base">
                  {new Date(currentPod.startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </Card>)}
          </div>

          {/* Right Column - Tutors */}
          <div>
            <Card className="p-4 sm:p-6 border">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b pb-3 sm:pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
                    <h2 className="font-semibold text-sm sm:text-base">Assigned Tutors</h2>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {tutorCount}/{maxTutors}
                  </span>
                </div>

                {/* Tutors List */}
                {podTutorsLoading ? (<div className="space-y-2">
                    <Skeleton className="h-14"/>
                    <Skeleton className="h-14"/>
                  </div>) : !podTutors || podTutors.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tutors assigned yet</p>
                  </div>) : (<div className="space-y-2">
                    {podTutors.map(function (assignment) {
                var isExpanded = expandedTutors.has(assignment.id);
                return (<div key={assignment.id} className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors">
                          <div className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold text-primary shrink-0">
                                  {assignment.tutorName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm sm:text-base truncate">{assignment.tutorName}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{assignment.tutorEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <Button variant="ghost" size="sm" onClick={function () { return toggleTutorExpand(assignment.id); }} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                  <ChevronDown className={"w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ".concat(isExpanded ? "rotate-180" : "")}/>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={function () { return setTutorToRemove(assignment.id); }}>
                                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Tutor?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove {assignment.tutorName} from this pod?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={function () { return removeTutorMutation.mutate(assignment.id); }} className="bg-red-600 hover:bg-red-700" disabled={removeTutorMutation.isPending}>
                                      {removeTutorMutation.isPending ? "Removing..." : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (<TutorStudentsSection tutorId={assignment.tutorId} tutorName={assignment.tutorName} certificationStatus={assignment.certification_status || "pending"} studentCount={assignment.student_count || 0} getCertificationColor={getCertificationColor} onViewIdentitySheet={function (studentId, studentName) {
                            setSelectedStudentId(studentId);
                            setSelectedStudentName(studentName);
                            setIdentitySheetOpen(true);
                        }} onViewTrackingSystems={function (studentId, studentName) {
                            setSelectedStudentId(studentId);
                            setSelectedStudentName(studentName);
                            setTrackingDialogOpen(true);
                        }} onViewAssignments={function (studentId, studentName) {
                            setSelectedStudentId(studentId);
                            setSelectedStudentName(studentName);
                            setAssignmentsDialogOpen(true);
                        }}/>)}
                          </div>
                        </div>);
            })}
                  </div>)}

                {/* Add Tutors Button */}
                {availableSlots > 0 && (<Dialog open={addTutorsOpen} onOpenChange={setAddTutorsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
                        <Plus className="w-4 h-4"/>
                        Add Tutor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Tutors to Pod</DialogTitle>
                        <DialogDescription>
                          Select tutors to add. You can add {availableSlots} more tutor{availableSlots !== 1 ? "s" : ""}.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        {availableTutors.length === 0 ? (<p className="text-sm text-muted-foreground py-4 text-center">
                            No available tutors
                          </p>) : (<div className="space-y-2 max-h-96 overflow-y-auto">
                            {availableTutors.map(function (tutor) { return (<div key={tutor.id} className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted">
                                <Checkbox id={"add-tutor-".concat(tutor.id)} checked={selectedTutorIds.includes(tutor.id)} onCheckedChange={function (checked) {
                        if (checked) {
                            if (selectedTutorIds.length >= availableSlots) {
                                toast({
                                    title: "Slot limit reached",
                                    description: "You can only add ".concat(availableSlots, " more tutor").concat(availableSlots !== 1 ? "s" : "", "."),
                                    variant: "destructive",
                                });
                                return;
                            }
                            setSelectedTutorIds(__spreadArray(__spreadArray([], selectedTutorIds, true), [tutor.id], false));
                        }
                        else {
                            setSelectedTutorIds(selectedTutorIds.filter(function (id) { return id !== tutor.id; }));
                        }
                    }}/>
                                <label htmlFor={"add-tutor-".concat(tutor.id)} className="flex-1 cursor-pointer">
                                  <p className="font-medium text-sm">{tutor.name}</p>
                                  <p className="text-xs text-muted-foreground">{tutor.email}</p>
                                </label>
                              </div>); })}
                          </div>)}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={function () {
                setAddTutorsOpen(false);
                setSelectedTutorIds([]);
            }}>
                          Cancel
                        </Button>
                        <Button onClick={function () { return addTutorsMutation.mutate(selectedTutorIds); }} disabled={selectedTutorIds.length === 0 || addTutorsMutation.isPending}>
                          {addTutorsMutation.isPending ? "Adding..." : "Add"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>)}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Student Dialogs - COO read-only view */}
      <StudentIdentitySheet open={identitySheetOpen} onOpenChange={setIdentitySheetOpen} studentId={selectedStudentId} studentName={selectedStudentName} readOnly={true} apiBasePath="/api/coo"/>
      
      <ViewAssignmentsDialog open={assignmentsDialogOpen} onOpenChange={setAssignmentsDialogOpen} studentId={selectedStudentId} studentName={selectedStudentName} apiBasePath="/api/coo"/>
      
      <ViewTrackingSystemsDialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen} studentId={selectedStudentId} studentName={selectedStudentName} apiBasePath="/api/coo"/>
    </DashboardLayout>);
}
function TutorStudentsSection(_a) {
    var tutorId = _a.tutorId, tutorName = _a.tutorName, certificationStatus = _a.certificationStatus, studentCount = _a.studentCount, getCertificationColor = _a.getCertificationColor, onViewIdentitySheet = _a.onViewIdentitySheet, onViewTrackingSystems = _a.onViewTrackingSystems, onViewAssignments = _a.onViewAssignments;
    var _b = useQuery({
        queryKey: ["/api/coo/tutors/".concat(tutorId, "/students")],
        enabled: !!tutorId,
    }), students = _b.data, isLoading = _b.isLoading;
    return (<div className="mt-4 pt-4 border-t space-y-4">
      {/* Certification Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Certification</p>
          <Badge className={"".concat(getCertificationColor(certificationStatus), " mt-2 border")}>
            {certificationStatus}
          </Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Students</p>
          <p className="font-semibold mt-2">{(students === null || students === void 0 ? void 0 : students.length) || studentCount || 0}</p>
        </div>
      </div>

      {/* Students List */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Assigned Students</p>
        {isLoading ? (<div className="space-y-2">
            <Skeleton className="h-16 w-full"/>
            <Skeleton className="h-16 w-full"/>
          </div>) : !students || students.length === 0 ? (<p className="text-sm text-muted-foreground py-3 text-center bg-muted/30 rounded-lg">
            No students assigned to this tutor yet
          </p>) : (<div className="space-y-3">
            {students.map(function (student) {
                var initials = student.name
                    .split(" ")
                    .map(function (n) { return n[0]; })
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                return (<div key={student.id} className="p-3 sm:p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarFallback className="bg-accent text-foreground font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{student.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {student.grade || "No grade"}
                        </Badge>
                      </div>
                      {student.sessionProgress !== undefined && (<p className="text-xs text-muted-foreground mt-1">
                          Sessions: {student.sessionProgress || 0}/16
                        </p>)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={function () { return onViewIdentitySheet(student.id, student.name); }}>
                      <FileText className="w-3 h-3 mr-1.5"/>
                      Identity Sheet
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={function () { return onViewTrackingSystems(student.id, student.name); }}>
                      <Calendar className="w-3 h-3 mr-1.5"/>
                      Tracking
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={function () { return onViewAssignments(student.id, student.name); }}>
                      <FileText className="w-3 h-3 mr-1.5"/>
                      Assignments
                    </Button>
                  </div>
                </div>);
            })}
          </div>)}
      </div>
    </div>);
}
