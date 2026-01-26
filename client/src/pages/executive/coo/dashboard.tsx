import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Mail, Trash2, Archive, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function COODashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showPodForm, setShowPodForm] = useState(false);
  const [podName, setPodName] = useState("");
  const [showDeletedPods, setShowDeletedPods] = useState(false);
  const [expandedSalesStats, setExpandedSalesStats] = useState(false);

  // Fetch all pods
  const { data: pods = [], isLoading: podsLoading, error: podsError } = useQuery<any[]>({
    queryKey: ["/api/coo/pods"],
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch deleted pods
  const { data: deletedPods = [] } = useQuery<any[]>({
    queryKey: ["/api/coo/deleted-pods"],
    enabled: showDeletedPods && isAuthenticated && !authLoading,
  });

  // Fetch all TDs
  const { data: tds = [], isLoading: tdsLoading, error: tdsError } = useQuery<any[]>({
    queryKey: ["/api/coo/tds"],
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch sales stats
  const { data: salesStats = null, isLoading: salesStatsLoading } = useQuery<any>({
    queryKey: ["/api/coo/sales-stats"],
    enabled: isAuthenticated && !authLoading,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (podsError && isUnauthorizedError(podsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [podsError, toast]);

  useEffect(() => {
    if (tdsError && isUnauthorizedError(tdsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [tdsError, toast]);

  // Fetch all role permissions
  const { data: rolePermissions = [], isLoading: permissionsLoading } =
    useQuery<any[]>({
      queryKey: ["/api/coo/role-permissions"],
    });

  // Create pod mutation
  const createPodMutation = useMutation({
    mutationFn: async (podName: string) => {
      return await apiRequest("POST", "/api/coo/pods", {
        podName,
        podType: "Training",
        status: "Active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      toast({ title: "Pod created successfully!" });
      setPodName("");
      setShowPodForm(false);
    },
    onError: () => {
      toast({ title: "Failed to create pod", variant: "destructive" });
    },
  });

  // Add TD email mutation - no longer used after UI removal

  // Assign TD to pod mutation
  const assignTDMutation = useMutation({
    mutationFn: async ({
      tdId,
      podId,
      currentPodId,
    }: {
      tdId: string;
      podId: string;
      currentPodId?: string;
    }) => {
      // Check if TD is already assigned to this pod
      if (currentPodId === podId) {
        throw new Error("TD already assigned to this pod");
      }
      return await apiRequest("POST", "/api/coo/assign-td", {
        tdId,
        podId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      toast({ title: "TD assigned to pod!" });
    },
    onError: (error: Error) => {
      if (error.message === "TD already assigned to this pod") {
        toast({ title: "TD already assigned to this pod", variant: "default" });
      } else {
        toast({ title: "Failed to assign TD", variant: "destructive" });
      }
    },
  });

  // Delete pod mutation
  const deletePodMutation = useMutation({
    mutationFn: async (podId: string) => {
      return await apiRequest("DELETE", `/api/coo/pods/${podId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/deleted-pods"] });
      toast({ title: "Pod deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete pod", variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Sales Overview Section */}
        <section>
          <Card className="border">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedSalesStats(!expandedSalesStats)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <CardTitle>Sales & Affiliate Overview</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Track leads, conversions, and affiliate performance
                    </p>
                  </div>
                </div>
                {expandedSalesStats ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            
            {expandedSalesStats && (
              <CardContent className="space-y-6 pt-6">
                {salesStatsLoading ? (
                  <p className="text-muted-foreground">Loading sales stats...</p>
                ) : salesStats ? (
                  <>
                    {/* Overall Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Affiliates</p>
                        <p className="text-2xl sm:text-3xl font-bold">{salesStats.totalAffiliates}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Encounters</p>
                        <p className="text-2xl sm:text-3xl font-bold">{salesStats.totalEncounters}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Leads</p>
                        <p className="text-2xl sm:text-3xl font-bold">{salesStats.totalLeads}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Closes</p>
                        <p className="text-2xl sm:text-3xl font-bold">{salesStats.totalCloses}</p>
                      </div>
                    </div>

                    {/* Lead Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Lead Breakdown</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Affiliate Leads</span>
                            <Badge variant="default">{salesStats.leadBreakdown.affiliate}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Organic Leads</span>
                            <Badge variant="secondary">{salesStats.leadBreakdown.organic}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Other Leads</span>
                            <Badge variant="outline">{salesStats.leadBreakdown.other}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Close Breakdown */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Close Breakdown</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Affiliate Closes</span>
                            <Badge className="bg-green-600">{salesStats.closeBreakdown.affiliate}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Organic Closes</span>
                            <Badge className="bg-blue-600">{salesStats.closeBreakdown.organic}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Conversion Rate</span>
                            <Badge variant="outline">{salesStats.conversionRate}%</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Conversion Metrics */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Efficiency</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg per Affiliate</span>
                            <span className="font-medium">
                              {salesStats.totalAffiliates > 0 
                                ? (salesStats.totalLeads / salesStats.totalAffiliates).toFixed(1)
                                : 0} leads
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lead to Close</span>
                            <span className="font-medium">{salesStats.conversionRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Affiliate Rankings */}
                    {salesStats.affiliateDetails && salesStats.affiliateDetails.length > 0 && (
                      <div className="pt-4 border-t space-y-3">
                        <h3 className="font-semibold text-sm">Top Affiliates</h3>
                        <div className="space-y-2">
                          {salesStats.affiliateDetails.slice(0, 5).map((aff: any, idx: number) => (
                            <div key={aff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                              <div>
                                <p className="font-medium">{idx + 1}. {aff.name}</p>
                                <p className="text-xs text-muted-foreground">{aff.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{aff.totalLeads} leads</p>
                                <p className="text-xs text-muted-foreground">
                                  {aff.totalCloses} closes ({aff.conversionRate}%)
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {salesStats.affiliateDetails.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{salesStats.affiliateDetails.length - 5} more affiliates
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            )}
          </Card>
        </section>

        {/* Pods Section - VIEW ONLY */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Pods</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all active pods. Manage pods in Pod Management tab.
            </p>
          </div>

          {podsLoading ? (
            <p className="text-muted-foreground">Loading pods...</p>
          ) : pods.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pods created yet. Create your first pod to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pods.map((pod: any) => {
                const podType = (pod as any).pod_type || pod.podType || 'training';
                const vehicle = (pod as any).vehicle || '4_seater';
                const tdId = (pod as any).td_id || pod.tdId;
                
                // Format display values
                const typeDisplay = podType === 'training' ? 'Training' : 'Paid';
                const vehicleDisplay = vehicle.replace('_', '-').replace('seater', 'Seater');
                
                // Find TD name if assigned
                const assignedTD = tdId ? tds.find((td: any) => td.id === tdId) : null;
                
                return (
                  <Card key={pod.id} data-testid={`card-pod-${pod.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {pod.pod_name || pod.podName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge variant={pod.status === 'active' ? 'default' : 'secondary'}>
                            {pod.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Type:</span>
                          <span className="text-muted-foreground">{typeDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Vehicle:</span>
                          <span className="text-muted-foreground">{vehicleDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">TD Assigned:</span>
                          <span className="text-muted-foreground">
                            {assignedTD ? (assignedTD.name || assignedTD.email) : 'Not assigned'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Territory Directors Section - VIEW ONLY */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Territory Directors</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all TDs and their pod assignments. Manage in Pod Management tab.
            </p>
          </div>

          {tdsLoading ? (
            <p className="text-muted-foreground">Loading TDs...</p>
          ) : tds.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No Territory Directors yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tds.map((td: any) => {
                // Find assigned pod
                const assignedPod = pods.find((p: any) => (p as any).td_id === td.id || p.tdId === td.id);
                
                return (
                  <Card key={td.id} data-testid={`card-td-${td.id}`}>
                    <CardContent className="py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{td.name || td.email}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {td.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {assignedPod ? (
                            <div className="text-left sm:text-right">
                              <Badge className="bg-green-600 hover:bg-green-700 text-xs" data-testid={`badge-assigned-${td.id}`}>
                                Assigned
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(assignedPod as any).pod_name || assignedPod.podName}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">Not Assigned</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
