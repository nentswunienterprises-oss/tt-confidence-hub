import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { CheckCircle2, Clock, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Assignment {
  id: string;
  title: string;
  description: string;
  problemsAssigned: string;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  studentResult: string | null;
  studentWork: string | null;
  tutor: {
    name: string;
  };
  createdAt: string;
}

export default function StudentAssignments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    studentResult: "",
    studentWork: "",
  });

  // Fetch assignments
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/student/assignments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, data }: { assignmentId: string; data: typeof submissionForm }) => {
      const response = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit assignment");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment Submitted!",
        description: "Your work has been sent to your tutor.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] });
      setSubmitDialogOpen(false);
      setSubmissionForm({ studentResult: "", studentWork: "" });
      setSelectedAssignment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionForm({
      studentResult: assignment.studentResult || "",
      studentWork: assignment.studentWork || "",
    });
    setSubmitDialogOpen(true);
  };

  const handleSubmitAssignment = () => {
    if (!selectedAssignment) return;
    submitAssignmentMutation.mutate({
      assignmentId: selectedAssignment.id,
      data: submissionForm,
    });
  };

  const pendingAssignments = assignments.filter(a => !a.isCompleted);
  const completedAssignments = assignments.filter(a => a.isCompleted);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold">My Assignments</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Practice problems from your tutor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mb-1 sm:mb-0" />
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
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-1 sm:mb-0" />
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
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-0" />
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
          {pendingAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:pt-6 text-center text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50 text-green-600" />
                <p className="text-sm sm:text-base">All caught up! No pending assignments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {pendingAssignments.map((assignment) => (
                <Card key={assignment.id} className="border-l-4 border-l-orange-500">
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
                        {assignment.dueDate && (
                          <p className="text-xs sm:text-sm text-orange-600 mt-1 sm:mt-2">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button onClick={() => handleSubmit(assignment)} className="gap-2 w-full sm:w-auto" size="sm">
                        <Send className="w-4 h-4" />
                        Submit Work
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {assignment.description && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Instructions</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{assignment.description}</p>
                      </div>
                    )}
                    
                    {assignment.problemsAssigned && (
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Problems to Complete</h4>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">{assignment.problemsAssigned}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Assignments */}
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Completed Assignments</h2>
          {completedAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:pt-6 text-center text-muted-foreground">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No completed assignments yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {completedAssignments.map((assignment) => (
                <Card key={assignment.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                          {assignment.title}
                          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          Completed on {new Date(assignment.completedAt!).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {assignment.description && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Instructions</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{assignment.description}</p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {assignment.studentResult && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-blue-900 mb-1 sm:mb-2">Your Result</h4>
                          <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-wrap">{assignment.studentResult}</p>
                        </div>
                      )}
                      {assignment.studentWork && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-purple-900 mb-1 sm:mb-2">Your Work & Reasoning</h4>
                          <p className="text-xs sm:text-sm text-purple-800 whitespace-pre-wrap">{assignment.studentWork}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                <Textarea
                  placeholder="What's your answer or result?"
                  value={submissionForm.studentResult}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, studentResult: e.target.value })}
                  className="min-h-24"
                />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Your Work (What, How, and Why)</h4>
                <Textarea
                  placeholder="Explain what you did, how you did it, and why you think it works..."
                  value={submissionForm.studentWork}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, studentWork: e.target.value })}
                  className="min-h-32"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This helps your tutor understand your thinking process!
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitDialogOpen(false);
                    setSubmissionForm({ studentResult: "", studentWork: "" });
                    setSelectedAssignment(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={
                    !submissionForm.studentResult.trim() || 
                    !submissionForm.studentWork.trim() || 
                    submitAssignmentMutation.isPending
                  }
                  className="flex-1 gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitAssignmentMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
