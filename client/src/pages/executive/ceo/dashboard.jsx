import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
export default function CEODashboard() {
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading, user = _a.user;
    var toast = useToast().toast;
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "Please log in first",
                variant: "destructive",
            });
        }
    }, [isAuthenticated, authLoading, toast]);
    if (authLoading) {
        return <div>Loading...</div>;
    }
    var userRole = user === null || user === void 0 ? void 0 : user.role;
    return (<ExecutivePortalGuard role={userRole}>
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chief Executive Officer</h1>
          <p className="text-muted-foreground">Strategic Overview & Performance Metrics</p>
        </div>

        {/* Executive KPIs */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Pods</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-green-600 mt-2">+0% this month</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">R0</p>
            <p className="text-xs text-green-600 mt-2">+0% this month</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Students Impacted</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-green-600 mt-2">Active Learning</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
            <p className="text-3xl font-bold">-%</p>
            <p className="text-xs text-muted-foreground mt-2">Transformations</p>
          </Card>
        </div>

        {/* Strategic Sections */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Overview</h2>
          <p className="text-sm text-muted-foreground">
            Executive dashboard showing organizational health, growth trajectory, and strategic initiatives.
          </p>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Organizational Health</h2>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Growth Trajectory</h2>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </Card>
        </div>
      </div>
    </ExecutivePortalGuard>);
}
