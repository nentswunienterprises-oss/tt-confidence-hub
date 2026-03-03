import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
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
        // Helper functions for Select type compatibility
        const handleAffiliateTypeChange = (value: string) => setAffiliateType(value as 'person' | 'entity');
        const handleSchoolTypeChange = (value: string) => setSchoolType(value as '' | 'primary' | 'high');
      // Affiliate code/link generation UI state
      const [affiliateType, setAffiliateType] = useState<'person' | 'entity'>('person');
      const [personName, setPersonName] = useState("");
      const [entityName, setEntityName] = useState("");
      const [schoolType, setSchoolType] = useState<'primary' | 'high' | "">("");
      const [generatedCode, setGeneratedCode] = useState("");
      const [generatedLink, setGeneratedLink] = useState("");
      const [creatingAffiliate, setCreatingAffiliate] = useState(false);
      const [affiliateError, setAffiliateError] = useState("");

      // Affiliate code/link creation handler
      const handleCreateAffiliate = async () => {
        setCreatingAffiliate(true);
        setAffiliateError("");
        try {
          // Get JWT access token from Supabase
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;
          if (!accessToken) throw new Error("No access token found. Please log in again.");
          // Call backend API to create affiliate code
          const body = {
            type: affiliateType,
            personName: affiliateType === 'person' ? personName : undefined,
            entityName: affiliateType === 'entity' ? entityName : undefined,
            schoolType: affiliateType === 'entity' ? schoolType : undefined,
          };
          const res = await fetch("/api/coo/create-affiliate-code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to create affiliate");
          setGeneratedCode(data.code);
          setGeneratedLink(`${window.location.origin}/client/signup?affiliate=${data.code}`);
        } catch (err: any) {
          setAffiliateError(err.message || "Unknown error");
        }
        setCreatingAffiliate(false);
      };
    // Delete pilot request mutation
    const deletePilotRequestMutation = useMutation({
      mutationFn: async ({ id, type }: { id: string, type: 'leadership' | 'early' }) => {
        const endpoint = type === 'leadership'
          ? `/api/coo/leadership-pilot-requests/${id}`
          : `/api/coo/earlyintervention-requests/${id}`;
        return await apiRequest("DELETE", endpoint);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/coo/leadership-pilot-requests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/coo/earlyintervention-requests"] });
        toast({ title: "Pilot request deleted!" });
      },
      onError: () => {
        toast({ title: "Failed to delete pilot request", variant: "destructive" });
      },
    });
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
        {/* Grade Monitoring System Link */}
        <section>
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Academic Compliance & Grade Monitoring</h3>
                <Button size="sm" variant="default" onClick={() => window.location.href = '/executive/coo/grade-monitoring'}>
                  Go to Grade Monitoring System
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Protect institutional credibility, enforce tutor discipline, automate consequences, and maintain trust with schools. Full compliance engine for academic review.</p>
            </CardContent>
          </Card>
        </section>
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
        {/* Pilot Considerations Section - ALL PILOT SUBMISSIONS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Pilot Considerations</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              All pilot program submissions are shown below.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...(leadershipRequests || []), ...(earlyInterventionRequests || [])].map((r: any) => {
              const type = leadershipRequests.some((req: any) => req.id === r.id) ? 'leadership' : 'early';
              return (
                <Card key={r.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {r.school_name || r.schoolName || 'School name missing'}
                    </CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => deletePilotRequestMutation.mutate({ id: r.id, type })}
                      aria-label="Delete pilot request"
                      disabled={deletePilotRequestMutation.status === 'pending'}
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Contact Full Name:</span>
                        <span className="text-muted-foreground">{r.contact_person_name || r.contactName || r.submitter_name || r.submitterName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Role:</span>
                        <span className="text-muted-foreground">{r.contact_person_role || r.contactRole || r.submitter_role || r.submitterRole || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">{r.contact_person_phone || r.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span className="text-muted-foreground">{r.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Submitted:</span>
                        <span className="text-muted-foreground">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {(leadershipLoading || earlyInterventionLoading) && (
            <CardContent className="py-4 text-center text-muted-foreground">Loading pilot requests...</CardContent>
          )}
          {!leadershipLoading && !earlyInterventionLoading && ([...(leadershipRequests || []), ...(earlyInterventionRequests || [])].length === 0) && (
            <CardContent className="py-4 text-center text-muted-foreground">No pilot requests yet.</CardContent>
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

        {/* COO Affiliate Code/Link Generation UI */}
        <section>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Generate Affiliate Code/Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Affiliate Type</Label>
                  <Select value={affiliateType} onValueChange={handleAffiliateTypeChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Person</SelectItem>
                      <SelectItem value="entity">Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {affiliateType === "person" ? (
                  <div>
                    <Label>Person Name</Label>
                    <Input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Enter person name" className="mt-1" />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Entity Name</Label>
                      <Input value={entityName} onChange={e => setEntityName(e.target.value)} placeholder="Enter entity name" className="mt-1" />
                    </div>
                    <div>
                      <Label>School Type</Label>
                      <Select value={schoolType} onValueChange={handleSchoolTypeChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select school type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <Button onClick={handleCreateAffiliate} disabled={creatingAffiliate} className="w-full">
                  {creatingAffiliate ? "Generating..." : "Generate Code & Link"}
                </Button>
                {affiliateError && <p className="text-destructive text-sm mt-2">{affiliateError}</p>}
                {generatedCode && (
                  <div className="mt-4">
                    <Label>Affiliate Code</Label>
                    <Input value={generatedCode} readOnly className="mt-1" />
                  </div>
                )}
                {generatedLink && (
                  <div className="mt-2">
                    <Label>Signup Link</Label>
                    <Input value={generatedLink} readOnly className="mt-1" />
                  </div>
                )}
                {/* Track Leads Button */}
                <Button variant="outline" className="w-full mt-6" onClick={() => window.location.href = '/executive/coo/track-leads'}>
                  Track Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
