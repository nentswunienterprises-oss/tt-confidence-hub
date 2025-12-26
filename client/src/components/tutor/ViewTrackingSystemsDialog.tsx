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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, MessageSquare, Trophy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TutoringSession {
  id: string;
  session_date: string;
  duration: number;
  topics_covered: string;
  student_mood: string | null;
  confidence_score: number | null;
  boss_battles_count: number | null;
  solutions_count: number | null;
  notes: string | null;
  created_at: string;
}

interface ParentReport {
  id: string;
  report_text: string;
  wins: string | null;
  challenges: string | null;
  next_focus: string | null;
  created_at: string;
}

interface TDFeedback {
  id: string;
  reflection_text: string;
  wins: string | null;
  struggles: string | null;
  support_needed: string | null;
  created_at: string;
}

interface TrackingData {
  sessions: TutoringSession[];
  parentReports: ParentReport[];
  tdFeedback: TDFeedback[];
}

interface ViewTrackingSystemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

export default function ViewTrackingSystemsDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: ViewTrackingSystemsDialogProps) {
  const { data: trackingData, isLoading } = useQuery<TrackingData>({
    queryKey: [`/api/tutor/students/${studentId}/tracking`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open && !!studentId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            {studentName}'s Tracking
          </DialogTitle>
          <DialogDescription className="text-sm">
            View sessions, parent reports, and TD feedback
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="sessions" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sessions</span>
              <span className="sm:hidden">Sess</span>
              <span className="ml-1">({trackingData?.sessions?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Rep</span>
              <span className="ml-1">({trackingData?.parentReports?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Feedback</span>
              <span className="sm:hidden">Feed</span>
              <span className="ml-1">({trackingData?.tdFeedback?.length || 0})</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] sm:h-[55vh] mt-4">
            {/* Sessions Tab */}
            <TabsContent value="sessions">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !trackingData?.sessions || trackingData.sessions.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Sessions Logged</h3>
                  <p className="text-muted-foreground">
                    No tutoring sessions have been logged for this student yet.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {trackingData.sessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader className="p-3 sm:p-6">
                        <div className="flex flex-col gap-2">
                          <div>
                            <CardTitle className="text-base sm:text-lg">
                              Session on {new Date(session.session_date).toLocaleDateString()}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{session.duration} min</Badge>
                              {session.student_mood && (
                                <Badge variant="secondary" className="text-xs">Mood: {session.student_mood}</Badge>
                              )}
                              {session.confidence_score && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Conf: {session.confidence_score}/10
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
                        {/* Topics Covered */}
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Topics Covered</h4>
                          <p className="text-sm text-muted-foreground">{session.topics_covered}</p>
                        </div>

                        {/* Gamification Stats */}
                        {(session.boss_battles_count || session.solutions_count) && (
                          <div className="flex items-center gap-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                            {session.boss_battles_count !== null && session.boss_battles_count > 0 && (
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-semibold text-purple-900">
                                  {session.boss_battles_count} Boss {session.boss_battles_count === 1 ? 'Battle' : 'Battles'}
                                </span>
                              </div>
                            )}
                            {session.solutions_count !== null && session.solutions_count > 0 && (
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-semibold text-purple-900">
                                  {session.solutions_count} {session.solutions_count === 1 ? 'Solution' : 'Solutions'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {session.notes && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Parent Reports Tab */}
            <TabsContent value="reports">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !trackingData?.parentReports || trackingData.parentReports.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Parent Reports</h3>
                  <p className="text-muted-foreground">
                    No parent reports have been sent for this student yet.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {trackingData.parentReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Report - {new Date(report.created_at).toLocaleDateString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {report.report_text && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Summary</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {report.report_text}
                            </p>
                          </div>
                        )}

                        {report.wins && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 text-green-900">🎉 Wins</h4>
                            <p className="text-sm text-green-800 whitespace-pre-wrap">{report.wins}</p>
                          </div>
                        )}

                        {report.challenges && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 text-orange-900">💪 Challenges</h4>
                            <p className="text-sm text-orange-800 whitespace-pre-wrap">{report.challenges}</p>
                          </div>
                        )}

                        {report.next_focus && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 text-blue-900">🎯 Next Focus</h4>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{report.next_focus}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TD Feedback Tab */}
            <TabsContent value="feedback">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !trackingData?.tdFeedback || trackingData.tdFeedback.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No TD Feedback</h3>
                  <p className="text-muted-foreground">
                    No Training Director feedback has been logged yet.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {trackingData.tdFeedback.map((feedback) => (
                    <Card key={feedback.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Feedback - {new Date(feedback.created_at).toLocaleDateString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {feedback.reflection_text && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Reflection</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {feedback.reflection_text}
                            </p>
                          </div>
                        )}

                        {feedback.wins && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 text-green-900">🎉 Wins</h4>
                            <p className="text-sm text-green-800 whitespace-pre-wrap">{feedback.wins}</p>
                          </div>
                        )}

                        {feedback.struggles && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 text-orange-900">💭 Struggles</h4>
                            <p className="text-sm text-orange-800 whitespace-pre-wrap">{feedback.struggles}</p>
                          </div>
                        )}

                        {feedback.support_needed && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 text-blue-900">🤝 Support Needed</h4>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{feedback.support_needed}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
