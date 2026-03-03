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
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft } from "lucide-react";
export default function AssignTutorModal(_a) {
    var _this = this;
    var _b;
    var open = _a.open, onOpenChange = _a.onOpenChange, enrollmentId = _a.enrollmentId, onAssigned = _a.onAssigned;
    var _c = useAuth(), isAuthenticated = _c.isAuthenticated, user = _c.user;
    var _d = useState("pods"), step = _d[0], setStep = _d[1];
    var _e = useState(null), selectedPod = _e[0], setSelectedPod = _e[1];
    var _f = useState(null), selectedTutor = _f[0], setSelectedTutor = _f[1];
    var _g = useState(null), selectedTutorProfile = _g[0], setSelectedTutorProfile = _g[1];
    var _h = useState(false), isAssigning = _h[0], setIsAssigning = _h[1];
    // Fetch active pods created by COO
    var _j = useQuery({
        queryKey: ["/api/hr/active-pods"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !!user && open && step === "pods",
    }), _k = _j.data, pods = _k === void 0 ? [] : _k, podsLoading = _j.isLoading;
    var activePods = pods;
    // Fetch tutors for selected pod
    var _l = useQuery({
        queryKey: ["/api/hr/pods/".concat(selectedPod === null || selectedPod === void 0 ? void 0 : selectedPod.id, "/tutors")],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: !!selectedPod,
    }), _m = _l.data, tutors = _m === void 0 ? [] : _m, tutorsLoading = _l.isLoading;
    // Fetch full tutor profile when tutor is selected
    useEffect(function () {
        if (selectedTutor && step === "profile") {
            // Extract tutor details from the assignment
            var fetchTutorProfile = function () { return __awaiter(_this, void 0, void 0, function () {
                var response, profile, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fetch("/api/tutors/".concat(selectedTutor.tutorId), {
                                    method: "GET",
                                    headers: { "Content-Type": "application/json" },
                                })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            profile = _a.sent();
                            setSelectedTutorProfile(profile);
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            console.error("Error fetching tutor profile:", error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
            fetchTutorProfile();
        }
    }, [selectedTutor, step]);
    var handlePodSelect = function (pod) {
        setSelectedPod(pod);
        setStep("tutors");
    };
    var handleTutorSelect = function (tutor) {
        setSelectedTutor(tutor);
        setStep("profile");
    };
    var handleAssignTutor = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedTutor || !enrollmentId)
                        return [2 /*return*/];
                    setIsAssigning(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/api/hr/enrollments/".concat(enrollmentId, "/assign-tutor"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                tutorId: selectedTutor.tutorId,
                                podId: selectedPod === null || selectedPod === void 0 ? void 0 : selectedPod.id,
                            }),
                            credentials: "include",
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        onAssigned();
                        onOpenChange(false);
                        // Reset state
                        setStep("pods");
                        setSelectedPod(null);
                        setSelectedTutor(null);
                        setSelectedTutorProfile(null);
                    }
                    else {
                        console.error("Failed to assign tutor:", response.statusText);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error assigning tutor:", error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsAssigning(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Tutor to Parent</DialogTitle>
          <DialogDescription>
            Select a pod, then a tutor to assign to this parent enrollment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Select Pod */}
          {step === "pods" && (<div className="space-y-4">
              <h3 className="font-semibold text-sm">Select a Pod (Active)</h3>
              {podsLoading ? (<div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
                </div>) : activePods.length === 0 ? (<p className="text-sm text-muted-foreground">No active pods available</p>) : (<div className="grid gap-2 max-h-96 overflow-y-auto">
                  {activePods.map(function (pod) { return (<Card key={pod.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={function () { return handlePodSelect(pod); }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pod.podName}</p>
                            <p className="text-xs text-muted-foreground">
                              Type: {pod.podType} • Status: {pod.status}
                            </p>
                          </div>
                          <Badge variant="secondary">{pod.podType}</Badge>
                        </div>
                      </CardContent>
                    </Card>); })}
                </div>)}
            </div>)}

          {/* Step 2: Select Tutor */}
          {step === "tutors" && selectedPod && (<div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={function () {
                setStep("pods");
                setSelectedPod(null);
            }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4"/>
                  Back to Pods
                </button>
              </div>

              <h3 className="font-semibold text-sm">
                Tutors in {selectedPod.podName}
              </h3>

              {tutorsLoading ? (<div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
                </div>) : tutors.length === 0 ? (<p className="text-sm text-muted-foreground">
                  No tutors assigned to this pod yet
                </p>) : (<div className="grid gap-2 max-h-96 overflow-y-auto">
                  {tutors.map(function (tutor) { return (<Card key={tutor.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={function () { return handleTutorSelect(tutor); }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {tutor.tutorName || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tutor.tutorEmail}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Students: {tutor.studentCount} • Certification:{" "}
                              {tutor.certificationStatus}
                            </p>
                          </div>
                          <Badge variant={tutor.certificationStatus === "passed"
                        ? "default"
                        : "secondary"}>
                            {tutor.certificationStatus}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>); })}
                </div>)}
            </div>)}

          {/* Step 3: View Tutor Profile and Confirm Assignment */}
          {step === "profile" && selectedTutor && selectedTutorProfile && (<div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={function () {
                setStep("tutors");
                setSelectedTutor(null);
            }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4"/>
                  Back to Tutors
                </button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedTutorProfile.profileImageUrl}/>
                      <AvatarFallback>
                        {(_b = selectedTutorProfile.name) === null || _b === void 0 ? void 0 : _b.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{selectedTutorProfile.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedTutorProfile.email}
                      </p>
                      {selectedTutorProfile.phone && (<p className="text-sm text-muted-foreground">
                          {selectedTutorProfile.phone}
                        </p>)}
                      <div className="mt-2">
                        <Badge variant={selectedTutorProfile.verified ? "default" : "secondary"}>
                          {selectedTutorProfile.verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {selectedTutorProfile.bio && (<CardContent className="space-y-2">
                    <h4 className="font-semibold text-sm">Bio</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTutorProfile.bio}
                    </p>
                  </CardContent>)}
              </Card>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={function () {
                setStep("tutors");
                setSelectedTutor(null);
            }} disabled={isAssigning}>
                  Cancel
                </Button>
                <Button onClick={handleAssignTutor} disabled={isAssigning}>
                  {isAssigning && (<Loader2 className="w-4 h-4 mr-2 animate-spin"/>)}
                  Assign Tutor
                </Button>
              </div>
            </div>)}

          {/* Step 3 Loading State */}
          {step === "profile" && selectedTutor && !selectedTutorProfile && (<div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
            </div>)}
        </div>
      </DialogContent>
    </Dialog>);
}
