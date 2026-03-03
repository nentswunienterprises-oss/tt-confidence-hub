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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { API_URL } from "@/lib/config";
import { Target, Plus, CheckCircle2, Flame, Calendar, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function StudentGrowth() {
    var _this = this;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _a = useState(false), commitmentDialogOpen = _a[0], setCommitmentDialogOpen = _a[1];
    var _b = useState(false), reflectionDialogOpen = _b[0], setReflectionDialogOpen = _b[1];
    var _c = useState(null), editingCommitment = _c[0], setEditingCommitment = _c[1];
    var _d = useState({
        name: "",
        description: "",
        whyCommitment: "",
        dailyAction: "",
    }), commitmentForm = _d[0], setCommitmentForm = _d[1];
    var _e = useState({
        reflectionText: "",
        mood: "",
    }), reflectionForm = _e[0], setReflectionForm = _e[1];
    // Fetch commitments
    var _f = useQuery({
        queryKey: ["/api/student/commitments"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data, commitments = _f === void 0 ? [] : _f;
    // Fetch reflections
    var _g = useQuery({
        queryKey: ["/api/student/reflections"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data, reflections = _g === void 0 ? [] : _g;
    // Create/Update commitment mutation
    var saveCommitmentMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var url, method, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = data.id
                            ? "".concat(API_URL, "/api/student/commitments/").concat(data.id)
                            : "".concat(API_URL, "/api/student/commitments");
                        method = data.id ? "PUT" : "POST";
                        return [4 /*yield*/, fetch(url, {
                                method: method,
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    name: data.name,
                                    description: data.description,
                                    why_important: data.whyCommitment,
                                    daily_action: data.dailyAction,
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to save commitment");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Success",
                description: editingCommitment ? "Commitment updated!" : "New commitment created!",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/student/commitments"] });
            setCommitmentDialogOpen(false);
            setCommitmentForm({ name: "", description: "", whyCommitment: "", dailyAction: "" });
            setEditingCommitment(null);
        },
    });
    // Log commitment completion mutation
    var completeCommitmentMutation = useMutation({
        mutationFn: function (commitmentId) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(API_URL, "/api/student/commitments/").concat(commitmentId, "/complete"), {
                            method: "POST",
                            credentials: "include",
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to log completion");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Great job!",
                description: "Commitment logged for today! 🔥",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/student/commitments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/student/stats"] });
        },
    });
    // Delete commitment mutation
    var deleteCommitmentMutation = useMutation({
        mutationFn: function (commitmentId) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(API_URL, "/api/student/commitments/").concat(commitmentId), {
                            method: "DELETE",
                            credentials: "include",
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to delete commitment");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Commitment deleted",
                description: "Your commitment has been removed.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/student/commitments"] });
        },
    });
    // Create reflection mutation
    var createReflectionMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(API_URL, "/api/student/reflections"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                reflection_text: data.reflectionText,
                                mood: data.mood,
                                date: new Date().toISOString(),
                            }),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to create reflection");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Reflection saved",
                description: "Your thoughts have been recorded.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/student/reflections"] });
            setReflectionDialogOpen(false);
            setReflectionForm({ reflectionText: "", mood: "" });
        },
    });
    var handleSaveCommitment = function () {
        if (editingCommitment) {
            saveCommitmentMutation.mutate(__assign(__assign({}, commitmentForm), { id: editingCommitment.id }));
        }
        else {
            saveCommitmentMutation.mutate(commitmentForm);
        }
    };
    var handleEditCommitment = function (commitment) {
        setEditingCommitment(commitment);
        setCommitmentForm({
            name: commitment.name,
            description: commitment.description || "",
            whyCommitment: commitment.whyCommitment || "",
            dailyAction: commitment.dailyAction || "",
        });
        setCommitmentDialogOpen(true);
    };
    var handleNewCommitment = function () {
        setEditingCommitment(null);
        setCommitmentForm({ name: "", description: "", whyCommitment: "", dailyAction: "" });
        setCommitmentDialogOpen(true);
    };
    var canCompleteToday = function (commitment) {
        if (!commitment.lastCompletedDate)
            return true;
        var lastCompleted = new Date(commitment.lastCompletedDate);
        var today = new Date();
        return lastCompleted.toDateString() !== today.toDateString();
    };
    return (<div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold">Growth</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Build habits and reflect on your journey</p>
      </div>

      <Tabs defaultValue="commitments" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-auto">
            <TabsTrigger value="commitments" className="text-xs sm:text-sm py-2 sm:py-2.5">Commitments</TabsTrigger>
            <TabsTrigger value="reflections" className="text-xs sm:text-sm py-2 sm:py-2.5">Reflections</TabsTrigger>
          </TabsList>

          <TabsContent value="commitments" className="space-y-4 sm:space-y-6">
            {/* Add New Commitment Button */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-4 sm:pt-6">
                <Button onClick={handleNewCommitment} className="w-full gap-2" size="default">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5"/>
                  Add New Commitment
                </Button>
              </CardContent>
            </Card>

            {/* Active Commitments */}
            {commitments.length === 0 ? (<Card>
                <CardContent className="p-4 sm:pt-6 text-center text-muted-foreground">
                  <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50"/>
                  <p className="text-sm sm:text-base">No commitments yet. Create your first goal to start building habits!</p>
                </CardContent>
              </Card>) : (<div className="grid gap-3 sm:gap-4">
                {commitments.filter(function (c) { return c.isActive; }).map(function (commitment) { return (<Card key={commitment.id} className="border-l-4 border-l-primary">
                    <CardHeader className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                        <div className="flex-1">
                          <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                            {commitment.name}
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <Flame className="w-3 h-3"/>
                              {commitment.streakCount} day streak
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-1">{commitment.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={function () { return handleEditCommitment(commitment); }}>
                            <Edit2 className="w-4 h-4"/>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={function () { return deleteCommitmentMutation.mutate(commitment.id); }}>
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                      {/* Why and Daily Action */}
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-blue-900 mb-1">Why This Matters</h4>
                          <p className="text-xs sm:text-sm text-blue-800">{commitment.whyCommitment}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-green-900 mb-1">Daily Action</h4>
                          <p className="text-xs sm:text-sm text-green-800">{commitment.dailyAction}</p>
                        </div>
                      </div>

                      {/* Complete Today Button */}
                      <Button onClick={function () { return completeCommitmentMutation.mutate(commitment.id); }} disabled={!canCompleteToday(commitment)} className="w-full gap-2" variant={canCompleteToday(commitment) ? "default" : "secondary"}>
                        {canCompleteToday(commitment) ? (<>
                            <CheckCircle2 className="w-4 h-4"/>
                            Complete Today
                          </>) : (<>
                            <CheckCircle2 className="w-4 h-4"/>
                            Completed Today!
                          </>)}
                      </Button>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </TabsContent>

          <TabsContent value="reflections" className="space-y-4 sm:space-y-6">
            {/* Add New Reflection Button */}
            <Card className="bg-gradient-to-r from-purple/10 to-purple/5">
              <CardContent className="p-4 sm:pt-6">
                <Button onClick={function () { return setReflectionDialogOpen(true); }} className="w-full gap-2" size="default">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5"/>
                  Write a Reflection
                </Button>
              </CardContent>
            </Card>

            {/* Past Reflections */}
            {reflections.length === 0 ? (<Card>
                <CardContent className="p-4 sm:pt-6 text-center text-muted-foreground">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50"/>
                  <p className="text-sm sm:text-base">No reflections yet. Start journaling your thoughts and growth!</p>
                </CardContent>
              </Card>) : (<div className="grid gap-3 sm:gap-4">
                {reflections.map(function (reflection) { return (<Card key={reflection.id}>
                    <CardHeader className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <CardTitle className="text-sm sm:text-base">
                            {new Date(reflection.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
                          </CardTitle>
                          {reflection.mood && (<Badge variant="secondary" className="mt-2 text-xs">
                              Mood: {reflection.mood}
                            </Badge>)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                        {reflection.reflectionText}
                      </p>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </TabsContent>
        </Tabs>

        {/* Commitment Dialog */}
        <Dialog open={commitmentDialogOpen} onOpenChange={setCommitmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCommitment ? "Edit Commitment" : "New Commitment"}
              </DialogTitle>
              <DialogDescription>
                Create a goal or habit to track daily
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={commitmentForm.name} onChange={function (e) { return setCommitmentForm(__assign(__assign({}, commitmentForm), { name: e.target.value })); }} placeholder="e.g., Practice math daily"/>
              </div>
              <div>
                <Label htmlFor="description">Description (What)</Label>
                <Textarea id="description" value={commitmentForm.description} onChange={function (e) { return setCommitmentForm(__assign(__assign({}, commitmentForm), { description: e.target.value })); }} placeholder="What is this commitment about?"/>
              </div>
              <div>
                <Label htmlFor="why">Why This Matters</Label>
                <Textarea id="why" value={commitmentForm.whyCommitment} onChange={function (e) { return setCommitmentForm(__assign(__assign({}, commitmentForm), { whyCommitment: e.target.value })); }} placeholder="Why is this important to you?"/>
              </div>
              <div>
                <Label htmlFor="action">Daily Action</Label>
                <Textarea id="action" value={commitmentForm.dailyAction} onChange={function (e) { return setCommitmentForm(__assign(__assign({}, commitmentForm), { dailyAction: e.target.value })); }} placeholder="What will you do each day?"/>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={function () {
            setCommitmentDialogOpen(false);
            setCommitmentForm({ name: "", description: "", whyCommitment: "", dailyAction: "" });
            setEditingCommitment(null);
        }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveCommitment} disabled={!commitmentForm.name.trim() || saveCommitmentMutation.isPending} className="flex-1">
                  {saveCommitmentMutation.isPending ? "Saving..." : "Save Commitment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reflection Dialog */}
        <Dialog open={reflectionDialogOpen} onOpenChange={setReflectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Reflection</DialogTitle>
              <DialogDescription>
                Journal your thoughts, wins, or challenges
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mood">Mood (optional)</Label>
                <Input id="mood" value={reflectionForm.mood} onChange={function (e) { return setReflectionForm(__assign(__assign({}, reflectionForm), { mood: e.target.value })); }} placeholder="How are you feeling?"/>
              </div>
              <div>
                <Label htmlFor="reflection">Reflection</Label>
                <Textarea id="reflection" value={reflectionForm.reflectionText} onChange={function (e) { return setReflectionForm(__assign(__assign({}, reflectionForm), { reflectionText: e.target.value })); }} placeholder="Write your thoughts..." className="min-h-32"/>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={function () {
            setReflectionDialogOpen(false);
            setReflectionForm({ reflectionText: "", mood: "" });
        }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={function () { return createReflectionMutation.mutate(reflectionForm); }} disabled={!reflectionForm.reflectionText.trim() || createReflectionMutation.isPending} className="flex-1">
                  {createReflectionMutation.isPending ? "Saving..." : "Save Reflection"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>);
}
