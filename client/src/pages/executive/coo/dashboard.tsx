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
import { getQueryFn } from "@/lib/queryClient";
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

  // Fetch leadership pilot requests for COO
  const { data: leadershipRequests = [], isLoading: leadershipLoading } = useQuery<any[]>({
    queryKey: ["/api/coo/leadership-pilot-requests"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 10000,
  });

  // Fetch early intervention pilot requests for COO
  const { data: earlyInterventionRequests = [], isLoading: earlyInterventionLoading } = useQuery<any[]>({
    queryKey: ["/api/coo/earlyintervention-requests"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 10000,
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

  // Affiliate Card Component
  const AffiliateCard = ({ affiliate }: { affiliate: any }) => {
    const [expanded, setExpanded] = useState(false);
    const [encounters, setEncounters] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [closes, setCloses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadAffiliateData = async () => {
      if (expanded) {
        setExpanded(false);
        return;
      }

      setLoading(true);
      try {
        // Check if this is organic traffic
        if (affiliate.isOrganic) {
          const [leadRes, closeRes] = await Promise.all([
            fetch(`/api/organic/leads`, { credentials: 'include' }),
            fetch(`/api/organic/closes`, { credentials: 'include' }),
          ]);

          const leadData = await leadRes.json();
          const closeData = await closeRes.json();

          setEncounters([]);
          setLeads(leadData || []);
          setCloses(closeData || []);
        } else {
          // Fetch affiliate-specific data
          const [encRes, leadRes, closeRes] = await Promise.all([
            fetch(`/api/affiliate/${affiliate.id}/encounters`, { credentials: 'include' }),
            fetch(`/api/affiliate/${affiliate.id}/leads`, { credentials: 'include' }),
            fetch(`/api/affiliate/${affiliate.id}/closes`, { credentials: 'include' }),
          ]);

          const encData = await encRes.json();
          const leadData = await leadRes.json();
          const closeData = await closeRes.json();

          setEncounters(encData || []);
          setLeads(leadData || []);
          setCloses(closeData || []);
        }
        setExpanded(true);
      } catch (error) {
        console.error("Error loading affiliate data:", error);
        toast({ title: "Failed to load affiliate data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Card className="border cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader 
          onClick={loadAffiliateData}
          className="hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{affiliate.name}</CardTitle>
                {affiliate.isOrganic && (
                  <Badge variant="secondary" className="text-xs">Organic</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{affiliate.email}</p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-2xl font-bold">{affiliate.totalLeads}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{affiliate.totalCloses}</p>
                <p className="text-xs text-muted-foreground">Closes</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{affiliate.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conv.</p>
              </div>
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="space-y-6 pt-4 border-t">
            {loading ? (
              <p className="text-muted-foreground">Loading data...</p>
            ) : (
              <>
                {/* Encounters Section */}
                {encounters.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Encounters ({encounters.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {encounters.map((enc: any) => (
                        <div key={enc.id} className="p-3 bg-gray-50 rounded text-sm">
                          <p className="font-medium">{enc.parent_name}</p>
                          <p className="text-xs text-muted-foreground">{enc.parent_email || enc.parent_phone}</p>
                          {enc.date_met && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(enc.date_met).toLocaleDateString()}
                            </p>
                          )}
                          {enc.status && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {enc.status}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leads Section */}
                {leads.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Leads ({leads.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {leads.map((lead: any) => (
                        <div key={lead.id} className="p-3 bg-blue-50 rounded text-sm">
                          <p className="font-medium">Lead #{lead.id?.slice(0, 8)}</p>
                          {lead.tracking_source && (
                            <Badge variant="secondary" className="text-xs">
                              {lead.tracking_source}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Closes Section */}
                {closes.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Closes ({closes.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {closes.map((close: any) => (
                        <div key={close.id} className="p-3 bg-green-50 rounded text-sm">
                          <p className="font-medium">Close #{close.id?.slice(0, 8)}</p>
                          <Badge className="bg-green-600 text-xs">Converted</Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(close.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {encounters.length === 0 && leads.length === 0 && closes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No data recorded yet</p>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Sales & Affiliates Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Affiliate Sales</h2>
          
          {salesStatsLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading affiliate data...
              </CardContent>
            </Card>
          ) : salesStats && salesStats.affiliateDetails && salesStats.affiliateDetails.length > 0 ? (
            <div className="space-y-3">
              {salesStats.affiliateDetails.map((aff: any) => (
                <AffiliateCard key={aff.id} affiliate={aff} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No affiliates yet.
              </CardContent>
            </Card>
          )}
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
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">Loading pods...</CardContent>
            </Card>
          ) : (
            <>
              {leadershipRequests && leadershipRequests.length > 0 && (
                <Card className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">High School leadership Pilot Considerations</h3>
                      <div className="text-sm text-muted-foreground">{leadershipLoading ? 'Loading...' : `${leadershipRequests.length} requests`}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="max-h-40 overflow-y-auto">
                      {leadershipRequests.slice(0,6).map((r: any) => (
                        <div key={r.id} className="p-3 rounded bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{r.school_name}</div>
                              <div className="text-xs text-muted-foreground">{r.contact_person_role} • {r.email}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline" onClick={() => window.location.href = '/executive/coo/leadership-pilot-requests'}>View all</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Early Intervention Pilot Requests */}
                {earlyInterventionRequests && earlyInterventionRequests.length > 0 && (
                  <Card className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Early Intervention pilot Considerations</h3>
                        <div className="text-sm text-muted-foreground">{earlyInterventionLoading ? 'Loading...' : `${earlyInterventionRequests.length} requests`}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="max-h-40 overflow-y-auto">
                        {earlyInterventionRequests.slice(0,6).map((r: any) => (
                          <div key={r.id} className="p-3 rounded bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{r.school_name}</div>
                                <div className="text-xs text-muted-foreground">{r.contact_person_role} • {r.email}</div>
                              </div>
                              <div className="text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline" onClick={() => window.location.href = '/executive/coo/earlyintervention-requests'}>View all</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
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
