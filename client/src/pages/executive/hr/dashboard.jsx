import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, Shield, Users, Target } from "lucide-react";
export default function HRDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var _j = useAuth(), isAuthenticated = _j.isAuthenticated, authLoading = _j.isLoading, user = _j.user;
    var navigate = useNavigate();
    // Fetch HR stats - refetch every 10 seconds to stay updated
    var _k = useQuery({
        queryKey: ["/api/hr/stats"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !!user,
        refetchInterval: 10000, // Refetch every 10 seconds
        refetchIntervalInBackground: true, // Keep refetching even if tab is not focused
    }), stats = _k.data, statsLoading = _k.isLoading;
    // Fetch leadership pilot requests for HR
    var _l = useQuery({
        queryKey: ["/api/hr/leadership-pilot-requests"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !!user,
        refetchInterval: 10000,
    }), _m = _l.data, leadershipRequests = _m === void 0 ? [] : _m, leadershipLoading = _l.isLoading;
    // Fetch early intervention pilot requests for HR
    var _o = useQuery({
        queryKey: ["/api/hr/earlyintervention-requests"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: isAuthenticated && !!user,
        refetchInterval: 10000,
    }), _p = _o.data, earlyInterventionRequests = _p === void 0 ? [] : _p, earlyInterventionLoading = _o.isLoading;
    if (authLoading) {
        return <div>Loading...</div>;
    }
    var userRole = user === null || user === void 0 ? void 0 : user.role;
    return (<ExecutivePortalGuard role={userRole}>
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Head of Human Resources</h1>
          <p className="text-muted-foreground">Tutor Management & Student Enrollment</p>
        </div>

        {/* Traffic Metrics */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {/* Tutor Applications - Split Card */}
          <Card className="p-4 md:p-6">
            <p className="text-sm text-muted-foreground mb-3">Tutor Applications</p>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : (_a = stats === null || stats === void 0 ? void 0 : stats.totalApplications) !== null && _a !== void 0 ? _a : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="w-px h-12 bg-border mx-3"/>
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : (_b = stats === null || stats === void 0 ? void 0 : stats.pendingApplications) !== null && _b !== void 0 ? _b : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
            </div>
          </Card>

          {/* Approved Tutors - Split Card */}
          <Card className="p-4 md:p-6">
            <p className="text-sm text-muted-foreground mb-3">Approved Tutors</p>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : (_c = stats === null || stats === void 0 ? void 0 : stats.approvedTutors) !== null && _c !== void 0 ? _c : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="w-px h-12 bg-border mx-3"/>
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : (_d = stats === null || stats === void 0 ? void 0 : stats.availableForPods) !== null && _d !== void 0 ? _d : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Available</p>
              </div>
            </div>
          </Card>

          {/* Student Enrollments - Split Card */}
          <Card className="p-4 md:p-6">
            <p className="text-sm text-muted-foreground mb-3">Student Enrollments</p>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : (_e = stats === null || stats === void 0 ? void 0 : stats.totalEnrollments) !== null && _e !== void 0 ? _e : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="w-px h-12 bg-border mx-3"/>
              <div className="text-center flex-1">
                <p className="text-3xl font-bold">{statsLoading ? "-" : (_f = stats === null || stats === void 0 ? void 0 : stats.studentEnrollments) !== null && _f !== void 0 ? _f : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Functions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Traffic</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage tutor applications and parent enrollments
            </p>
            <Button className="w-full" onClick={function () { return navigate("/executive/hr/traffic"); }}>View Traffic</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pod Assignments</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Assign approved tutors to pods and manage placements
            </p>
            <Button className="w-full" variant="outline">Manage Assignments</Button>
          </Card>
        </div>

        {/* Brain & Disputes Modules */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Brain</h2>
                <p className="text-xs text-muted-foreground">Institutional Memory</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              People Registry, Weekly Details, Projects, and Ideas. Nothing important lives only in people's heads.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4"/>
                {statsLoading ? "-" : (_g = stats === null || stats === void 0 ? void 0 : stats.peopleCount) !== null && _g !== void 0 ? _g : 0} people
              </span>
            </div>
            <Button className="w-full" onClick={function () { return navigate("/executive/hr/brain"); }}>
              Open Brain
            </Button>
          </Card>

          <Card className="p-6 border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Shield className="w-5 h-5 text-orange-500"/>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Disputes</h2>
                <p className="text-xs text-muted-foreground">Conflict Resolution</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Issue logging, resolution tracking, and pattern detection. Keep culture clean without gossip.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4"/>
                {statsLoading ? "-" : (_h = stats === null || stats === void 0 ? void 0 : stats.openDisputes) !== null && _h !== void 0 ? _h : 0} open issues
              </span>
            </div>
            <Button className="w-full" variant="outline" onClick={function () { return navigate("/executive/hr/disputes"); }}>
              View Disputes
            </Button>
          </Card>

          {/* Leadership Pilot Requests */}
          <Card className="p-6 border-amber-200/40">
            <CardHeader>
              <h3 className="text-lg font-semibold">High School leadership Pilot Considerations</h3>
              <div className="text-sm text-muted-foreground">{leadershipLoading ? 'Loading...' : "".concat(leadershipRequests.length, " requests")}</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-40 overflow-y-auto">
                {leadershipRequests.length > 0 ? (leadershipRequests.slice(0, 6).map(function (r) { return (<div key={r.id} className="p-3 rounded bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r.school_name}</div>
                          <div className="text-xs text-muted-foreground">{r.contact_person_role} • {r.email}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString()}</div>
                      </div>
                    </div>); })) : (!leadershipLoading && (<div className="py-6 text-center text-muted-foreground">No pilot requests yet.</div>))}
              </div>

              <div className="text-right">
                <Button size="sm" variant="outline" onClick={function () { return window.location.href = '/executive/hr/leadership-pilot-requests'; }}>View all</Button>
              </div>
            </CardContent>
          </Card>

          {/* Early Intervention Pilot Requests */}
          <Card className="p-6 border-amber-200/40">
            <CardHeader>
              <h3 className="text-lg font-semibold">Early Intervention pilot Considerations</h3>
              <div className="text-sm text-muted-foreground">{earlyInterventionLoading ? 'Loading...' : "".concat(earlyInterventionRequests.length, " requests")}</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-40 overflow-y-auto">
                {earlyInterventionRequests.length > 0 ? (earlyInterventionRequests.slice(0, 6).map(function (r) { return (<div key={r.id} className="p-3 rounded bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r.school_name}</div>
                          <div className="text-xs text-muted-foreground">{r.contact_person_role} • {r.email}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString()}</div>
                      </div>
                    </div>); })) : (!earlyInterventionLoading && (<div className="py-6 text-center text-muted-foreground">No pilot requests yet.</div>))}
              </div>

              <div className="text-right">
                <Button size="sm" variant="outline" onClick={function () { return window.location.href = '/executive/hr/earlyintervention-requests'; }}>View all</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExecutivePortalGuard>);
}
