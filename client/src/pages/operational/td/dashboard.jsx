import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingDown, MessageCircle, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
export default function TDDashboard() {
    var navigate = useNavigate();
    var _a = useQuery({
        queryKey: ["/api/td/insights"],
    }), insights = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
          </div>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    if (!insights) {
        return (<DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Unable to load dashboard insights.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>);
    }
    var alertCount = insights.tutorsNeedingHelp.length + insights.studentsAtRisk.length + insights.podsBehindSchedule.length;
    return (<DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">TD Dashboard</h2>
          <p className="text-muted-foreground">
            {alertCount > 0 ? "".concat(alertCount, " items need your attention") : 'Everything looks good!'}
          </p>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className={"border-l-4 ".concat(insights.tutorsNeedingHelp.length > 0 ? 'border-l-orange-500' : 'border-l-green-500')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={"w-10 h-10 rounded-lg flex items-center justify-center ".concat(insights.tutorsNeedingHelp.length > 0 ? 'bg-orange-500/10' : 'bg-green-500/10')}>
                    {insights.tutorsNeedingHelp.length > 0 ? (<MessageCircle className="w-5 h-5 text-orange-600"/>) : (<CheckCircle2 className="w-5 h-5 text-green-600"/>)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.tutorsNeedingHelp.length}</p>
                    <p className="text-sm text-muted-foreground">Tutors Need Help</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={"border-l-4 ".concat(insights.studentsAtRisk.length > 0 ? 'border-l-red-500' : 'border-l-green-500')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={"w-10 h-10 rounded-lg flex items-center justify-center ".concat(insights.studentsAtRisk.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10')}>
                    {insights.studentsAtRisk.length > 0 ? (<AlertTriangle className="w-5 h-5 text-red-600"/>) : (<CheckCircle2 className="w-5 h-5 text-green-600"/>)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.studentsAtRisk.length}</p>
                    <p className="text-sm text-muted-foreground">Students At Risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={"border-l-4 ".concat(insights.podsBehindSchedule.length > 0 ? 'border-l-yellow-500' : 'border-l-green-500')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={"w-10 h-10 rounded-lg flex items-center justify-center ".concat(insights.podsBehindSchedule.length > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10')}>
                    {insights.podsBehindSchedule.length > 0 ? (<TrendingDown className="w-5 h-5 text-yellow-600"/>) : (<CheckCircle2 className="w-5 h-5 text-green-600"/>)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.podsBehindSchedule.length}</p>
                    <p className="text-sm text-muted-foreground">Pods Behind Schedule</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutors Needing Help */}
        {insights.tutorsNeedingHelp.length > 0 && (<section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-600"/>
                Tutors Requesting Help
              </h3>
            </div>
            <div className="grid gap-4">
              {insights.tutorsNeedingHelp.map(function (tutor, index) { return (<Card key={index} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
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
                          {tutor.challenges && (<div>
                              <p className="text-sm font-medium text-muted-foreground">Challenges:</p>
                              <p className="text-sm">{tutor.challenges}</p>
                            </div>)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <Clock className="w-3 h-3 inline mr-1"/>
                          {formatDistanceToNow(new Date(tutor.submittedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>); })}
            </div>
          </section>)}

        {/* Students At Risk */}
        {insights.studentsAtRisk.length > 0 && (<section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600"/>
                Students At Risk
              </h3>
              <Button variant="ghost" size="sm" onClick={function () { return navigate("/operational/td/my-pods"); }}>
                View All <ChevronRight className="w-4 h-4 ml-1"/>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.studentsAtRisk.slice(0, 6).map(function (student, index) { return (<Card key={index} className="border-l-4 border-l-red-500">
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
                </Card>); })}
            </div>
          </section>)}

        {/* Pods Behind Schedule */}
        {insights.podsBehindSchedule.length > 0 && (<section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-yellow-600"/>
                Pods Behind Schedule
              </h3>
            </div>
            <div className="grid gap-4">
              {insights.podsBehindSchedule.map(function (pod, index) { return (<Card key={index} className="border-l-4 border-l-yellow-500">
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
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "".concat(pod.progress, "%") }}/>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {pod.totalSessions}/{pod.maxSessions} sessions completed
                    </p>
                  </CardContent>
                </Card>); })}
            </div>
          </section>)}

        {/* Recent Check-Ins */}
        {insights.recentCheckIns.length > 0 && (<section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight">Recent Check-Ins</h3>
              <Button variant="ghost" size="sm" onClick={function () { return navigate("/operational/td/reports"); }}>
                View All <ChevronRight className="w-4 h-4 ml-1"/>
              </Button>
            </div>
            <div className="grid gap-4">
              {insights.recentCheckIns.map(function (checkIn, index) { return (<Card key={index}>
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
                    {checkIn.wins && (<div className="mb-2">
                        <p className="text-xs font-medium text-green-700">🎉 Wins:</p>
                        <p className="text-sm">{checkIn.wins.substring(0, 100)}{checkIn.wins.length > 100 ? '...' : ''}</p>
                      </div>)}
                    {checkIn.challenges && (<div>
                        <p className="text-xs font-medium text-orange-700">⚠️ Challenges:</p>
                        <p className="text-sm">{checkIn.challenges.substring(0, 100)}{checkIn.challenges.length > 100 ? '...' : ''}</p>
                      </div>)}
                  </CardContent>
                </Card>); })}
            </div>
          </section>)}

        {/* All Clear Message */}
        {alertCount === 0 && (<Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600"/>
              <h3 className="text-xl font-bold mb-2">All Systems Go! 🎉</h3>
              <p className="text-muted-foreground">
                No immediate issues detected. Your pods are running smoothly.
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={function () { return navigate("/operational/td/my-pods"); }}>
                  View Pods
                </Button>
                <Button variant="outline" onClick={function () { return navigate("/operational/td/tutors"); }}>
                  View Tutors
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </DashboardLayout>);
}
