import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Assignment {
  id: string;
  title: string;
  description: string;
  problems_assigned: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  student_result: string | null;
  student_work: string | null;
  created_at: string;
}

interface ViewAssignmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  apiBasePath?: string; // e.g., "/api/coo" for COO view, defaults to "/api/tutor"
}

export default function ViewAssignmentsDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  apiBasePath = "/api/tutor",
}: ViewAssignmentsDialogProps) {
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: [`${apiBasePath}/students/${studentId}/assignments`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open && !!studentId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl border border-primary/15 bg-background p-0 shadow-sm">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Assignment Review</p>
            <DialogTitle className="mt-2 flex items-center gap-2 text-xl tracking-[-0.01em]">
              <FileText className="w-5 h-5" />
              {studentName}'s Assignments
            </DialogTitle>
            <DialogDescription className="mt-1">
              View all assignment submissions and student work.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-2xl border border-primary/15 bg-background shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !assignments || assignments.length === 0 ? (
            <Card className="rounded-2xl border border-primary/15 bg-muted/20 p-12 text-center shadow-sm">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
              <p className="text-muted-foreground">
                No assignments have been created for this student.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="rounded-2xl border border-primary/15 bg-background shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {assignment.is_completed ? (
                            <Badge variant="outline" className="border-primary/20 bg-muted/20 text-foreground">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-primary/20 text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {assignment.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Description */}
                    {assignment.description && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      </div>
                    )}

                    {/* Problems Assigned */}
                    {assignment.problems_assigned && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Problems Assigned</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {assignment.problems_assigned}
                        </p>
                      </div>
                    )}

                    {/* Student Work */}
                    {assignment.is_completed && (
                      <>
                        {assignment.student_work && (
                          <div className="rounded-xl border border-primary/20 bg-muted/20 p-4">
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Student Work</h4>
                            <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                              {assignment.student_work}
                            </p>
                          </div>
                        )}

                        {assignment.student_result && (
                          <div className="rounded-xl border border-primary/20 bg-muted/20 p-4">
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Result</h4>
                            <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                              {assignment.student_result}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Submitted on {new Date(assignment.completed_at!).toLocaleDateString()} at{" "}
                          {new Date(assignment.completed_at!).toLocaleTimeString()}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
