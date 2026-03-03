import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function ViewAssignmentsDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, studentId = _a.studentId, studentName = _a.studentName, _b = _a.apiBasePath, apiBasePath = _b === void 0 ? "/api/tutor" : _b;
    var _c = useQuery({
        queryKey: ["".concat(apiBasePath, "/students/").concat(studentId, "/assignments")],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: open && !!studentId,
    }), assignments = _c.data, isLoading = _c.isLoading;
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5"/>
            {studentName}'s Assignments
          </DialogTitle>
          <DialogDescription>
            View all assignment submissions and student work
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (<div className="space-y-4">
              {[1, 2, 3].map(function (i) { return (<Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4"/>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full"/>
                  </CardContent>
                </Card>); })}
            </div>) : !assignments || assignments.length === 0 ? (<Card className="p-12 text-center border-dashed">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
              <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
              <p className="text-muted-foreground">
                No assignments have been created for this student.
              </p>
            </Card>) : (<div className="space-y-4">
              {assignments.map(function (assignment) { return (<Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {assignment.is_completed ? (<Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1"/>
                              Completed
                            </Badge>) : (<Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1"/>
                              Pending
                            </Badge>)}
                          {assignment.due_date && (<span className="text-xs text-muted-foreground">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>)}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Description */}
                    {assignment.description && (<div>
                        <h4 className="font-semibold text-sm mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      </div>)}

                    {/* Problems Assigned */}
                    {assignment.problems_assigned && (<div>
                        <h4 className="font-semibold text-sm mb-1">Problems Assigned</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {assignment.problems_assigned}
                        </p>
                      </div>)}

                    {/* Student Work */}
                    {assignment.is_completed && (<>
                        {assignment.student_work && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-2 text-blue-900">Student Work</h4>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                              {assignment.student_work}
                            </p>
                          </div>)}

                        {assignment.student_result && (<div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-2 text-green-900">Result</h4>
                            <p className="text-sm text-green-800 whitespace-pre-wrap">
                              {assignment.student_result}
                            </p>
                          </div>)}

                        <div className="text-xs text-muted-foreground">
                          Submitted on {new Date(assignment.completed_at).toLocaleDateString()} at{" "}
                          {new Date(assignment.completed_at).toLocaleTimeString()}
                        </div>
                      </>)}
                  </CardContent>
                </Card>); })}
            </div>)}
        </ScrollArea>
      </DialogContent>
    </Dialog>);
}
