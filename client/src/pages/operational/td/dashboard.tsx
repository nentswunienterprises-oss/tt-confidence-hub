import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, TrendingDown, MessageCircle, ChevronRight, CheckCircle2, Clock, Target } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface PodOverviewLookup {
  pod: {
    id: string;
    podName: string;
    status?: string;
    phase?: string;
  };
  tutors?: Array<unknown>;
  totalStudents?: number;
  totalSessions?: number;
}

interface InsightsData {
  tutorsNeedingHelp: Array<{
    tutorName: string;
    tutorEmail: string;
    podName: string;
    helpNeeded: string;
    challenges: string;
    submittedAt: string;
  }>;
  studentsAtRisk: Array<{
    studentName: string;
    tutorName: string;
    podName: string;
    sessionProgress: number;
    confidenceScore: number;
    reason: string;
  }>;
  podsBehindSchedule: Array<{
    podName: string;
    totalStudents: number;
    totalSessions: number;
    maxSessions: number;
    progress: number;
    tutorCount: number;
  }>;
  recentCheckIns: Array<{
    tutorName: string;
    podName: string;
    wins: string;
    challenges: string;
    submittedAt: string;
  }>;
}

export default function TDDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const overviewBasePath = location.pathname.startsWith("/operational/td")
    ? "/operational/td/my-pods"
    : "/td/overview";
  
  const { data: insights, isLoading } = useQuery<InsightsData>({
    queryKey: ["/api/td/insights"],
  });
  const { data: podOverview = [] } = useQuery<PodOverviewLookup[]>({
    queryKey: ["/api/td/pod-overview"],
  });
  const safeInsights: InsightsData = insights ?? {
    tutorsNeedingHelp: [],
    studentsAtRisk: [],
    podsBehindSchedule: [],
    recentCheckIns: [],
  };

  const getPodRoute = (podName: string) => {
    const match = podOverview.find((entry) => entry.pod.podName === podName);
    return match ? `${overviewBasePath}/${match.pod.id}` : overviewBasePath;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const alertCount =
    safeInsights.tutorsNeedingHelp.length +
    safeInsights.studentsAtRisk.length +
    safeInsights.podsBehindSchedule.length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">TD Dashboard</h2>
          <p className="text-muted-foreground">
            {alertCount > 0 ? `${alertCount} items need your attention` : 'Everything looks good!'}
          </p>
        </div>

        {!insights && (
          <Card className="border-dashed">
            <CardContent className="p-4 text-sm text-muted-foreground">
              Dashboard insights are unavailable right now. Your assigned pods are still available below.
            </CardContent>
          </Card>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              My Pods
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(overviewBasePath)}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {podOverview.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No assigned pods found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {podOverview.map((entry) => (
                <button
                  key={entry.pod.id}
                  type="button"
                  onClick={() => navigate(`${overviewBasePath}/${entry.pod.id}`)}
                  className="text-left"
                >
                  <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-3">
                        <span className="truncate">{entry.pod.podName}</span>
                        <span className="text-xs font-medium text-primary shrink-0">Open pod</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={entry.pod.status === "active" ? "default" : "secondary"}>
                          {entry.pod.status || "unknown"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Tutors</p>
                          <p className="mt-1 text-2xl font-semibold">{entry.tutors?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Students</p>
                          <p className="mt-1 text-2xl font-semibold">{entry.totalStudents || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Sessions</p>
                          <p className="mt-1 text-2xl font-semibold">{entry.totalSessions || 0}</p>
                        </div>
                      </div>
                      {entry.pod.phase ? (
                        <p className="text-sm text-muted-foreground">{entry.pod.phase} phase</p>
                      ) : null}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Alert Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className={`border-l-4 ${safeInsights.tutorsNeedingHelp.length > 0 ? 'border-l-orange-500' : 'border-l-green-500'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${safeInsights.tutorsNeedingHelp.length > 0 ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
                    {safeInsights.tutorsNeedingHelp.length > 0 ? (
                      <MessageCircle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{safeInsights.tutorsNeedingHelp.length}</p>
                    <p className="text-sm text-muted-foreground">Tutors Need Help</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${safeInsights.studentsAtRisk.length > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${safeInsights.studentsAtRisk.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    {safeInsights.studentsAtRisk.length > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{safeInsights.studentsAtRisk.length}</p>
                    <p className="text-sm text-muted-foreground">Students At Risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${safeInsights.podsBehindSchedule.length > 0 ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${safeInsights.podsBehindSchedule.length > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                    {safeInsights.podsBehindSchedule.length > 0 ? (
                      <TrendingDown className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{safeInsights.podsBehindSchedule.length}</p>
                    <p className="text-sm text-muted-foreground">Pods Behind Schedule</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutors Needing Help */}
        {safeInsights.tutorsNeedingHelp.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-600" />
                Tutors Requesting Help
              </h3>
            </div>
            <div className="grid gap-4">
              {safeInsights.tutorsNeedingHelp.map((tutor, index) => (
                <Card key={index} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-lg">{tutor.tutorName}</p>
                          <Badge variant="outline" className="text-xs">{tutor.podName}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Help Needed:</p>
                            <p className="text-sm">{tutor.helpNeeded}</p>
                          </div>
                          {tutor.challenges && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Challenges:</p>
                              <p className="text-sm">{tutor.challenges}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(tutor.submittedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Students At Risk */}
        {safeInsights.studentsAtRisk.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Students At Risk
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate(overviewBasePath)}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {safeInsights.studentsAtRisk.slice(0, 6).map((student, index) => (
                <Card key={index} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{student.studentName}</p>
                        <p className="text-sm text-muted-foreground">Tutor: {student.tutorName}</p>
                        <Badge variant="destructive" className="mt-2 text-xs">{student.reason}</Badge>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Sessions:</span> {student.sessionProgress}/9
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence:</span> {student.confidenceScore}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Pods Behind Schedule */}
        {safeInsights.podsBehindSchedule.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                Pods Behind Schedule
              </h3>
            </div>
            <div className="grid gap-4">
              {safeInsights.podsBehindSchedule.map((pod, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => navigate(getPodRoute(pod.podName))}
                  className="text-left"
                >
                <Card className="border-l-4 border-l-yellow-500 transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg">{pod.podName}</p>
                        <p className="text-sm text-muted-foreground">
                          {pod.tutorCount} tutors • {pod.totalStudents} students
                        </p>
                      </div>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-700">
                        {pod.progress}% Complete
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${pod.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {pod.totalSessions}/{pod.maxSessions} sessions completed
                    </p>
                  </CardContent>
                </Card>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Check-Ins */}
        {safeInsights.recentCheckIns.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight">Recent Check-Ins</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/operational/td/reports")}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid gap-4">
              {safeInsights.recentCheckIns.map((checkIn, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{checkIn.tutorName}</p>
                        <p className="text-xs text-muted-foreground">{checkIn.podName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(checkIn.submittedAt), { addSuffix: true })}
                      </p>
                    </div>
                    {checkIn.wins && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-green-700">🎉 Wins:</p>
                        <p className="text-sm">{checkIn.wins.substring(0, 100)}{checkIn.wins.length > 100 ? '...' : ''}</p>
                      </div>
                    )}
                    {checkIn.challenges && (
                      <div>
                        <p className="text-xs font-medium text-orange-700">⚠️ Challenges:</p>
                        <p className="text-sm">{checkIn.challenges.substring(0, 100)}{checkIn.challenges.length > 100 ? '...' : ''}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Clear Message */}
        {alertCount === 0 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2">All Systems Go! 🎉</h3>
              <p className="text-muted-foreground">
                No immediate issues detected. Your pods are running smoothly.
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={() => navigate(overviewBasePath)}>
                  View Pods
                </Button>
                <Button variant="outline" onClick={() => navigate("/operational/td/tutors")}>
                  View Tutors
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
