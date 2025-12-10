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
import { Plus, Users, Mail, Trash2, Archive } from "lucide-react";
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
        phase: "Foundation",
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
        {/* Pods Section - VIEW ONLY */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pods</h2>
            <p className="text-sm text-muted-foreground">
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
            <div className="grid gap-4 md:grid-cols-2">
              {pods.map((pod: any) => {
                const podType = (pod as any).pod_type || pod.podType || 'training';
                const vehicle = (pod as any).vehicle || '4_seater';
                const phase = pod.phase || 'foundation';
                const tdId = (pod as any).td_id || pod.tdId;
                
                // Format display values
                const typeDisplay = podType === 'training' ? 'Training' : 'Paid';
                const phaseDisplay = phase === 'foundation' ? 'Foundation' : 'Scale Test';
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
                          <span className="font-medium">Phase:</span>
                          <span className="text-muted-foreground">{phaseDisplay}</span>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Territory Directors</h2>
            <p className="text-sm text-muted-foreground">
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
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{td.name || td.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {td.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {assignedPod ? (
                            <div className="text-right">
                              <Badge className="bg-green-600 hover:bg-green-700" data-testid={`badge-assigned-${td.id}`}>
                                Assigned
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(assignedPod as any).pod_name || assignedPod.podName}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="outline">Not Assigned</Badge>
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
