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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { CheckCircle2, Clock, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
export default function StudentAssignments() {
    var _this = this;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _a = useState(false), submitDialogOpen = _a[0], setSubmitDialogOpen = _a[1];
    var _b = useState(null), selectedAssignment = _b[0], setSelectedAssignment = _b[1];
    var _c = useState({
        studentResult: "",
        studentWork: "",
    }), submissionForm = _c[0], setSubmissionForm = _c[1];
    // Fetch assignments
    var _d = useQuery({
        queryKey: ["/api/student/assignments"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data, assignments = _d === void 0 ? [] : _d;
    // Submit assignment mutation
    var submitAssignmentMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var assignmentId = _b.assignmentId, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch("/api/student/assignments/".concat(assignmentId, "/submit"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok)
                            throw new Error("Failed to submit assignment");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Assignment Submitted!",
                description: "Your work has been sent to your tutor.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] });
            setSubmitDialogOpen(false);
            setSubmissionForm({ studentResult: "", studentWork: "" });
            setSelectedAssignment(null);
        },
        onError: function () {
            toast({
                title: "Error",
                description: "Failed to submit assignment. Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (assignment) {
        setSelectedAssignment(assignment);
        setSubmissionForm({
            studentResult: assignment.studentResult || "",
            studentWork: assignment.studentWork || "",
        });
        setSubmitDialogOpen(true);
    };
    var handleSubmitAssignment = function () {
        if (!selectedAssignment)
            return;
        submitAssignmentMutation.mutate({
            assignmentId: selectedAssignment.id,
            data: submissionForm,
        });
    };
    var pendingAssignments = assignments.filter(function (a) { return !a.isCompleted; });
    var completedAssignments = assignments.filter(function (a) { return a.isCompleted; });
    return (<div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold">My Assignments</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Practice problems from your tutor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mb-1 sm:mb-0"/>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{pendingAssignments.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-1 sm:mb-0"/>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{completedAssignments.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-0"/>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{assignments.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Assignments */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Pending Assignments</h2>
          {pendingAssignments.length === 0 ? (<Card>
              <CardContent className="p-4 sm:pt-6 text-center text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50 text-green-600"/>
                <p className="text-sm sm:text-base">All caught up! No pending assignments.</p>
              </CardContent>
            </Card>) : (<div className="grid gap-3 sm:gap-4">
              {pendingAssignments.map(function (assignment) { return (<Card key={assignment.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                          {assignment.title}
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                            Pending
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          Assigned by {assignment.tutor.name} on {new Date(assignment.createdAt).toLocaleDateString()}
                        </CardDescription>
                        {assignment.dueDate && (<p className="text-xs sm:text-sm text-orange-600 mt-1 sm:mt-2">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>)}
                      </div>
                      <Button onClick={function () { return handleSubmit(assignment); }} className="gap-2 w-full sm:w-auto" size="sm">
                        <Send className="w-4 h-4"/>
                        Submit Work
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {assignment.description && (<div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Instructions</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{assignment.description}</p>
                      </div>)}
                    
                    {assignment.problemsAssigned && (<div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Problems to Complete</h4>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">{assignment.problemsAssigned}</p>
                      </div>)}
                  </CardContent>
                </Card>); })}
            </div>)}
        </div>

        {/* Completed Assignments */}
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Completed Assignments</h2>
          {completedAssignments.length === 0 ? (<Card>
              <CardContent className="p-4 sm:pt-6 text-center text-muted-foreground">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50"/>
                <p className="text-sm sm:text-base">No completed assignments yet.</p>
              </CardContent>
            </Card>) : (<div className="grid gap-3 sm:gap-4">
              {completedAssignments.map(function (assignment) { return (<Card key={assignment.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                          {assignment.title}
                          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3"/>
                            Completed
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          Completed on {new Date(assignment.completedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {assignment.description && (<div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Instructions</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{assignment.description}</p>
                      </div>)}

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {assignment.studentResult && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-blue-900 mb-1 sm:mb-2">Your Result</h4>
                          <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-wrap">{assignment.studentResult}</p>
                        </div>)}
                      {assignment.studentWork && (<div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-purple-900 mb-1 sm:mb-2">Your Work & Reasoning</h4>
                          <p className="text-xs sm:text-sm text-purple-800 whitespace-pre-wrap">{assignment.studentWork}</p>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>); })}
            </div>)}
        </div>

        {/* Submit Assignment Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Share your work and explain your reasoning
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Result/Answer</h4>
                <Textarea placeholder="What's your answer or result?" value={submissionForm.studentResult} onChange={function (e) { return setSubmissionForm(__assign(__assign({}, submissionForm), { studentResult: e.target.value })); }} className="min-h-24"/>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Your Work (What, How, and Why)</h4>
                <Textarea placeholder="Explain what you did, how you did it, and why you think it works..." value={submissionForm.studentWork} onChange={function (e) { return setSubmissionForm(__assign(__assign({}, submissionForm), { studentWork: e.target.value })); }} className="min-h-32"/>
                <p className="text-xs text-muted-foreground mt-2">
                  This helps your tutor understand your thinking process!
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={function () {
            setSubmitDialogOpen(false);
            setSubmissionForm({ studentResult: "", studentWork: "" });
            setSelectedAssignment(null);
        }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitAssignment} disabled={!submissionForm.studentResult.trim() ||
            !submissionForm.studentWork.trim() ||
            submitAssignmentMutation.isPending} className="flex-1 gap-2">
                  <Send className="w-4 h-4"/>
                  {submitAssignmentMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>);
}
