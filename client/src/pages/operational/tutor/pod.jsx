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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import { authorizedGetJson } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentCard } from "@/components/tutor/StudentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Target, Calendar, Flame, FileText, Lock, Sparkles } from "lucide-react";
import { ApplicationForm } from "@/components/tutor/application-form";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import ParentOnboardingProposal from "@/components/tutor/ParentOnboardingProposal";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
export default function TutorPod() {
    var _this = this;
    var _a, _b;
    var _c = useAuth(), user = _c.user, isAuthenticated = _c.isAuthenticated, authLoading = _c.isLoading;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var navigate = useNavigate();
    var _d = useState(false), showApplicationForm = _d[0], setShowApplicationForm = _d[1];
    var _e = useState(false), identitySheetOpen = _e[0], setIdentitySheetOpen = _e[1];
    var _f = useState(""), selectedStudentId = _f[0], setSelectedStudentId = _f[1];
    var _g = useState(""), selectedStudentName = _g[0], setSelectedStudentName = _g[1];
    var _h = useState(false), proposalOpen = _h[0], setProposalOpen = _h[1];
    var _j = useState(false), assignmentsDialogOpen = _j[0], setAssignmentsDialogOpen = _j[1];
    var _k = useState(false), trackingDialogOpen = _k[0], setTrackingDialogOpen = _k[1];
    var _l = useState({}), studentIdentitySheets = _l[0], setStudentIdentitySheets = _l[1];
    // Force refresh - identity sheet integration
    var _m = useQuery({
        queryKey: ["/api/tutor/pod"],
        enabled: isAuthenticated && !authLoading,
    }), podData = _m.data, isLoading = _m.isLoading, error = _m.error;
    var _o = useQuery({
        queryKey: ["/api/tutor/applications"],
        enabled: isAuthenticated && !authLoading,
    }), applications = _o.data, applicationsLoading = _o.isLoading;
    var hasSubmittedApplication = applications && applications.length > 0;
    var hasPendingApplication = applications && applications.some(function (app) { return app.status === "pending"; });
    var hasApprovedApplication = applications && applications.some(function (app) { return app.status === "approved"; });
    var onboardingCompleted = applications && applications.some(function (app) { return !!app.onboardingCompletedAt; });
    // Redirect to gateway if tutor hasn't completed onboarding (no approved application or no pod assignment)
    useEffect(function () {
        if (!authLoading && !isLoading && !applicationsLoading && isAuthenticated) {
            // If onboarding not completed and no approved application or no pod assignment, redirect to gateway
            if (!onboardingCompleted && (!hasApprovedApplication || !(podData === null || podData === void 0 ? void 0 : podData.assignment))) {
                navigate("/operational/tutor/gateway");
            }
        }
    }, [authLoading, isLoading, applicationsLoading, isAuthenticated, hasApprovedApplication, podData, navigate]);
    // Fetch identity sheets for all students
    useEffect(function () {
        if ((podData === null || podData === void 0 ? void 0 : podData.students) && podData.students.length > 0) {
            var fetchIdentitySheets = function () { return __awaiter(_this, void 0, void 0, function () {
                var sheets, session, headers, _i, _a, student, path, data, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            sheets = {};
                            return [4 /*yield*/, supabase.auth.getSession()];
                        case 1:
                            session = (_b.sent()).data.session;
                            headers = {};
                            if (session === null || session === void 0 ? void 0 : session.access_token) {
                                headers.Authorization = "Bearer ".concat(session.access_token);
                                console.log("🔐 Auth token found, adding to headers");
                            }
                            else {
                                console.warn("⚠️ No Supabase session token - requests may fail on cross-origin");
                            }
                            console.log("🔍 Fetching identity sheets, API_URL:", API_URL, "hostname:", window.location.hostname);
                            _i = 0, _a = podData.students;
                            _b.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 7];
                            student = _a[_i];
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, , 6]);
                            path = "/api/tutor/students/".concat(student.id, "/identity-sheet");
                            return [4 /*yield*/, authorizedGetJson(path)];
                        case 4:
                            data = _b.sent();
                            if (data && (data.identitySheet || data.personalProfile || data.emotionalInsights || data.academicDiagnosis)) {
                                sheets[student.id] = data;
                            }
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _b.sent();
                            console.error("Failed to fetch identity sheet for student ".concat(student.id, ":"), error_1);
                            return [3 /*break*/, 6];
                        case 6:
                            _i++;
                            return [3 /*break*/, 2];
                        case 7:
                            setStudentIdentitySheets(sheets);
                            return [2 /*return*/];
                    }
                });
            }); };
            fetchIdentitySheets();
        }
    }, [podData === null || podData === void 0 ? void 0 : podData.students]);
    // Authentication is handled by route protection, no need for manual redirects
    if (authLoading || isLoading || applicationsLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64"/>
          <Skeleton className="h-6 w-96"/>
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
          </div>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    if (!podData || !podData.assignment) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {((_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.split(" ")[0]) || "Tutor"}! <Flame className="inline w-8 h-8 text-primary"/>
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to start your journey? Let's build confidence together.
            </p>
          </div>
          
          <Card className="p-12 text-center border shadow-sm">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
            <h2 className="text-xl font-semibold mb-2">
              {hasPendingApplication ? "Application Pending" : "No Pod Assignment Yet"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {hasPendingApplication
                ? "Your application is being reviewed. You'll be notified once it's approved and you're assigned to a pod."
                : "You don't have any students assigned yet. Apply here to get started with your first pod."}
            </p>
            {!hasPendingApplication && (<Button onClick={function () { return setShowApplicationForm(true); }} size="lg" className="gap-2" data-testid="button-apply">
                <FileText className="w-5 h-5"/>
                Apply Now
              </Button>)}
          </Card>

          <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Territorial Tutoring - Founding Team Application</DialogTitle>
              </DialogHeader>
              <ApplicationForm onSuccess={function () {
                setShowApplicationForm(false);
                toast({
                    title: "Application Submitted!",
                    description: "Thank you for applying. We'll review your application soon.",
                });
            }} onCancel={function () { return setShowApplicationForm(false); }}/>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>);
    }
    var assignment = podData.assignment, students = podData.students;
    var totalSessions = students.reduce(function (sum, s) { return sum + s.sessionProgress; }, 0);
    var remainingSessions = students.reduce(function (sum, s) { return sum + (16 - s.sessionProgress); }, 0);
    var maxSessions = students.length * 16;
    var progress = maxSessions > 0 ? (totalSessions / maxSessions) * 100 : 0;
    var studentsImpacted = students.filter(function (s) { return s.sessionProgress > 0; }).length;
    var firstName = ((_b = user === null || user === void 0 ? void 0 : user.name) === null || _b === void 0 ? void 0 : _b.split(" ")[0]) || "Tutor";
    return (<DashboardLayout>
      <div className="space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {firstName} <Flame className="inline w-8 h-8 text-primary"/>
            </h1>
            <Badge className="bg-primary text-primary-foreground border-primary font-semibold uppercase tracking-wide text-xs px-4 py-1.5 rounded-full" data-testid="badge-pod-name">
              {assignment.pod.podName}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            You're training calm execution, one session at a time. Keep showing up!
          </p>
        </div>

        {/* Key Metrics - Prominent Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <p className="text-2xl sm:text-5xl font-bold text-foreground" data-testid="text-sessions-done">
                {totalSessions}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Sessions Done
              </p>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <p className="text-2xl sm:text-5xl font-bold text-foreground" data-testid="text-remaining">
                {remainingSessions}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Remaining
              </p>
            </div>
          </Card>

          <Card className="p-3 sm:p-8 border shadow-sm hover-elevate">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <p className="text-2xl sm:text-5xl font-bold text-foreground" data-testid="text-students-impacted">
                {studentsImpacted}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Students Impacted
              </p>
            </div>
          </Card>
        </div>

        {/* Pod Team & Transformation Formula Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Territory Director & Pod Team */}
          <Card className="p-6 border shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Territory Director & Pod Team</h2>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="w-5 h-5"/>
                <p>View your TD and fellow tutors in the pod</p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Pod Members (0/12)</span>
                  <br />
                  
                </p>
              </div>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2"/>
                View Team
              </Button>
            </div>
          </Card>

          {/* Right: Transformation Formula */}
          <Card className="p-6 border shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Transformation Process</h2>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">TT-OS Protocol</span>
                  <br />
                  Every session conditions response: 3-Layer Lens + Boss Battles + Timed Execution = Conditioned Response.
                </p>
              </div>
              {/* <Button className="w-full" asChild>
                <Link to="/tutor/blueprint">
                  <Sparkles className="w-4 h-4 mr-2"/>
                  View Blueprint
                </Link>
              </Button> */}
              <Button className="w-full" variant="outline" asChild>
                <Link to="/operational/tutor/tt-os">
                  <Lock className="w-4 h-4 mr-2"/>
                  View TT-OS Protocol
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Today's Sessions */}
        <Card className="border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Today's Sessions</h2>
              <span className="text-sm text-muted-foreground">0 scheduled</span>
            </div>
          </div>
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
            <p className="text-muted-foreground">No sessions scheduled today. Take a breather!</p>
          </div>
        </Card>

        {/* Students Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Assigned Students</h2>
          {students.length === 0 ? (<Card className="p-12 text-center border shadow-sm">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
              <h3 className="text-lg font-semibold mb-2">No Students Assigned</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Manage identity sheets and track student progress
              </p>
            </Card>) : (<div className="grid md:grid-cols-2 gap-6">
              {students.map(function (student) { return (<StudentCard key={student.id} student={student} studentIdentitySheets={studentIdentitySheets} setSelectedStudentId={setSelectedStudentId} setSelectedStudentName={setSelectedStudentName} setIdentitySheetOpen={setIdentitySheetOpen} setTrackingDialogOpen={setTrackingDialogOpen} setAssignmentsDialogOpen={setAssignmentsDialogOpen}/>); })}
            </div>)}
        </div>

        <StudentIdentitySheet open={identitySheetOpen} onOpenChange={setIdentitySheetOpen} studentId={selectedStudentId} studentName={selectedStudentName} onSaved={function () { return __awaiter(_this, void 0, void 0, function () {
            var session, headers, data_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedStudentId) return [3 /*break*/, 5];
                        return [4 /*yield*/, supabase.auth.getSession()];
                    case 1:
                        session = (_a.sent()).data.session;
                        headers = {};
                        if (session === null || session === void 0 ? void 0 : session.access_token) {
                            headers.Authorization = "Bearer ".concat(session.access_token);
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, authorizedGetJson("/api/tutor/students/".concat(selectedStudentId, "/identity-sheet"))];
                    case 3:
                        data_1 = _a.sent();
                        console.log("🔍 Data received after save:", data_1);
                        console.log("🔍 Has any data?", !!(data_1 && (data_1.identitySheet || data_1.personalProfile || data_1.emotionalInsights || data_1.academicDiagnosis)));
                        if (data_1 && (data_1.identitySheet || data_1.personalProfile || data_1.emotionalInsights || data_1.academicDiagnosis)) {
                            console.log("✅ Setting studentIdentitySheets for:", selectedStudentId);
                            setStudentIdentitySheets(function (prev) {
                                var _a;
                                var newState = __assign(__assign({}, prev), (_a = {}, _a[selectedStudentId] = data_1, _a));
                                console.log("📊 New state:", newState);
                                return newState;
                            });
                        }
                        else {
                            console.error("❌ No valid data in response");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error("❌ Failed to fetch after save:", err_1);
                        return [3 /*break*/, 5];
                    case 5:
                        queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
                        toast({
                            title: "Success",
                            description: "Identity sheet saved successfully",
                        });
                        return [2 /*return*/];
                }
            });
        }); }}/>

        <ParentOnboardingProposal open={proposalOpen} onOpenChange={setProposalOpen} studentId={selectedStudentId} studentName={selectedStudentName} tutorName={(user === null || user === void 0 ? void 0 : user.name) || "Your Tutor"} identitySheetData={studentIdentitySheets[selectedStudentId]}/>

        <ViewAssignmentsDialog open={assignmentsDialogOpen} onOpenChange={setAssignmentsDialogOpen} studentId={selectedStudentId} studentName={selectedStudentName}/>

        <ViewTrackingSystemsDialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen} studentId={selectedStudentId} studentName={selectedStudentName}/>
      </div>
    </DashboardLayout>);
}
