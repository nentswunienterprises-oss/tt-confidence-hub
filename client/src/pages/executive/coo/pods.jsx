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
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderKanban, Plus, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
export default function COOPods() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(false), dialogOpen = _b[0], setDialogOpen = _b[1];
    var _c = useState({
        podName: "",
        podType: "training",
        vehicle: "4_seater",
        tdId: "",
        tutorIds: [],
    }), formData = _c[0], setFormData = _c[1];
    var _d = useQuery({
        queryKey: ["/api/coo/pods"],
        enabled: isAuthenticated && !authLoading,
    }), pods = _d.data, podsLoading = _d.isLoading, podsError = _d.error;
    var _e = useQuery({
        queryKey: ["/api/coo/tds"],
        enabled: isAuthenticated && !authLoading,
    }), tds = _e.data, tdsLoading = _e.isLoading;
    var _f = useQuery({
        queryKey: ["/api/coo/approved-tutors"],
        enabled: isAuthenticated && !authLoading,
    }), approvedTutors = _f.data, tutorsLoading = _f.isLoading;
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
        if (podsError && isUnauthorizedError(podsError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [podsError, toast]);
    var createPod = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/coo/pods", {
                            podName: data.podName,
                            podType: data.podType,
                            vehicle: data.vehicle,
                            tdId: data.tdId || null,
                            status: "active",
                            startDate: new Date().toISOString(),
                            tutorIds: data.tutorIds,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
            queryClient.invalidateQueries({ queryKey: ["/api/coo/stats"] });
            setDialogOpen(false);
            setFormData({ podName: "", podType: "training", vehicle: "4_seater", tdId: "", tutorIds: [] });
            toast({
                title: "Pod created",
                description: "The pod has been created successfully.",
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
                description: "Failed to create pod. Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.podName.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a pod name.",
                variant: "destructive",
            });
            return;
        }
        createPod.mutate(formData);
    };
    if (authLoading || podsLoading || tdsLoading || tutorsLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    var getStatusColor = function (status) {
        return status === "active"
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-blue-100 text-blue-800 border-blue-200";
    };
    var getTDName = function (tdId) {
        var _a;
        if (!tdId)
            return "Unassigned";
        return ((_a = tds === null || tds === void 0 ? void 0 : tds.find(function (td) { return td.id === tdId; })) === null || _a === void 0 ? void 0 : _a.name) || "Unknown";
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mentorship Group Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-create-pod">
                <Plus className="w-4 h-4"/>
                Create Pod
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Mentorship Group</DialogTitle>
                  <DialogDescription>
                    Create a new 4-Seater training pod for tutors.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="podName">Pod Name *</Label>
                    <Input id="podName" placeholder="e.g., Foundation Pod Alpha" value={formData.podName} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { podName: e.target.value }));
        }} data-testid="input-pod-name"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="podType">Type *</Label>
                    <Select value={formData.podType} onValueChange={function (value) {
            return setFormData(__assign(__assign({}, formData), { podType: value }));
        }}>
                      <SelectTrigger data-testid="select-pod-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="commercial">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle *</Label>
                    <Select value={formData.vehicle} onValueChange={function (value) {
            return setFormData(__assign(__assign({}, formData), { vehicle: value }));
        }}>
                      <SelectTrigger data-testid="select-vehicle">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4_seater">4-Seat Pod (10 tutors, 4 students each)</SelectItem>
                        <SelectItem value="5_seater">5-Seat Pod (10 tutors, 5 students each)</SelectItem>
                        <SelectItem value="6_seater">6-Seat Pod (10 tutors, 6 students each)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="td">Territory Director (Optional)</Label>
                    <Select value={formData.tdId} onValueChange={function (value) {
            return setFormData(__assign(__assign({}, formData), { tdId: value === "none" ? "" : value }));
        }}>
                      <SelectTrigger data-testid="select-td">
                        <SelectValue placeholder="Select a TD (optional)"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {tds === null || tds === void 0 ? void 0 : tds.map(function (td) { return (<SelectItem key={td.id} value={td.id}>
                            {td.name}
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Assign Tutors (Optional - max 10 per pod)</Label>
                    {!approvedTutors || approvedTutors.length === 0 ? (<p className="text-sm text-muted-foreground">
                        No approved tutors available. Tutors must have approved applications.
                      </p>) : (<div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {approvedTutors.map(function (tutor) { return (<div key={tutor.id} className="flex items-center space-x-2">
                            <Checkbox id={"tutor-".concat(tutor.id)} checked={formData.tutorIds.includes(tutor.id)} onCheckedChange={function (checked) {
                    if (checked) {
                        if (formData.tutorIds.length >= 10) {
                            toast({
                                title: "Maximum tutors reached",
                                description: "Pods can have a maximum of 10 tutors.",
                                variant: "destructive",
                            });
                            return;
                        }
                        setFormData(__assign(__assign({}, formData), { tutorIds: __spreadArray(__spreadArray([], formData.tutorIds, true), [tutor.id], false) }));
                    }
                    else {
                        setFormData(__assign(__assign({}, formData), { tutorIds: formData.tutorIds.filter(function (id) { return id !== tutor.id; }) }));
                    }
                }} data-testid={"checkbox-tutor-".concat(tutor.id)}/>
                            <label htmlFor={"tutor-".concat(tutor.id)} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                              {tutor.name} ({tutor.email})
                            </label>
                          </div>); })}
                      </div>)}
                    {formData.tutorIds.length > 0 && (<p className="text-xs text-muted-foreground">
                        {formData.tutorIds.length} tutor(s) selected
                      </p>)}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPod.isPending} data-testid="button-submit-pod">
                    {createPod.isPending ? "Creating..." : "Create Pod"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pods Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {!pods || pods.length === 0 ? (<Card className="sm:col-span-2 p-8 sm:p-12 text-center border">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
              <p className="text-muted-foreground mb-4">No pods created yet</p>
            </Card>) : (pods.map(function (pod) { return (<Link key={pod.id} to={"/coo/pods/".concat(pod.id)}>
                <Card className="p-4 sm:p-6 border space-y-3 sm:space-y-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all hover:scale-[1.02] sm:hover:scale-105" data-testid={"pod-card-".concat(pod.id)}>
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{pod.pod_name || pod.podName}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Badge className={"".concat(getStatusColor(pod.status), " border font-semibold uppercase text-[10px] sm:text-2xs")}>
                        {pod.status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"/>
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground"/>
                      <span className="text-muted-foreground">TD:</span>
                      <span className="font-medium truncate">{getTDName(pod.td_id || pod.tdId)}</span>
                    </div>
                    {(pod.start_date || pod.startDate) && (<p className="text-[10px] sm:text-xs text-muted-foreground">
                        Started: {new Date(pod.start_date || pod.startDate).toLocaleDateString()}
                      </p>)}
                  </div>
                </Card>
              </Link>); }))}
        </div>
      </div>
    </DashboardLayout>);
}
