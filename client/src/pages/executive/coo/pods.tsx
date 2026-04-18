import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderKanban, Plus, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Pod, User } from "@shared/schema";

const MAX_TUTORS_PER_POD = 12;

export default function COOPods() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    podName: "",
    podType: "training",
    vehicle: "4_seater",
    tdId: "",
    tutorIds: [] as string[],
  });

  const {
    data: pods,
    isLoading: podsLoading,
    error: podsError,
  } = useQuery<Pod[]>({
    queryKey: ["/api/coo/pods"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const {
    data: tds,
    isLoading: tdsLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/coo/tds"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const {
    data: approvedTutors,
    isLoading: tutorsLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/coo/approved-tutors"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: assignedTutorIds = [] } = useQuery<string[]>({
    queryKey: ["/api/coo/all-tutor-assignments"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
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

  const createPod = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/coo/pods", {
        podName: data.podName,
        podType: data.podType,
        vehicle: data.vehicle,
        tdId: data.tdId || null,
        status: "active",
        startDate: new Date().toISOString(),
        tutorIds: data.tutorIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/stats"] });
      setDialogOpen(false);
      setFormData({ podName: "", podType: "training", vehicle: "4_seater", tdId: "", tutorIds: [] });
      toast({
        title: "Pod created",
        description: "The pod has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create pod. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.podName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a pod name.",
        variant: "destructive",
      });
      return;
    }
    createPod.mutate(formData);
  };

  if (authLoading || podsLoading || tdsLoading || tutorsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getTDName = (tdId: string | null) => {
    if (!tdId) return "Unassigned";
    return tds?.find((td) => td.id === tdId)?.name || "Unknown";
  };

  const availableTutors = approvedTutors?.filter(
    (tutor) => !assignedTutorIds.includes(tutor.id)
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pod Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-create-pod">
                <Plus className="w-4 h-4" />
                Create Pod
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Pod</DialogTitle>
                  <DialogDescription>
                    Create a pod and optionally assign up to 12 unassigned pod-eligible tutors.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="podName">Pod Name *</Label>
                    <Input
                      id="podName"
                      placeholder="e.g., Foundation Pod Alpha"
                      value={formData.podName}
                      onChange={(e) =>
                        setFormData({ ...formData, podName: e.target.value })
                      }
                      data-testid="input-pod-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="podType">Type *</Label>
                    <Select
                      value={formData.podType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, podType: value })
                      }
                    >
                      <SelectTrigger data-testid="select-pod-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle *</Label>
                    <Select
                      value={formData.vehicle}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicle: value })
                      }
                    >
                      <SelectTrigger data-testid="select-vehicle">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4_seater">4-Seat Pod (12 tutors, 4 students each)</SelectItem>
                        <SelectItem value="5_seater">5-Seat Pod (12 tutors, 5 students each)</SelectItem>
                        <SelectItem value="6_seater">6-Seat Pod (12 tutors, 6 students each)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="td">Territory Director (Optional)</Label>
                    <Select
                      value={formData.tdId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tdId: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger data-testid="select-td">
                        <SelectValue placeholder="Select a TD (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {tds?.map((td) => (
                          <SelectItem key={td.id} value={td.id}>
                            {td.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>{`Assign Tutors (Optional - max ${MAX_TUTORS_PER_POD} per pod)`}</Label>
                    {!approvedTutors || approvedTutors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No pod-eligible tutors available. Tutors must have completed onboarding and verified all documents.
                      </p>
                    ) : availableTutors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No unassigned pod-eligible tutors available.
                      </p>
                    ) : (
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {availableTutors.map((tutor) => (
                          <div key={tutor.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tutor-${tutor.id}`}
                              checked={formData.tutorIds.includes(tutor.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  if (formData.tutorIds.length >= MAX_TUTORS_PER_POD) {
                                    toast({
                                      title: "Maximum tutors reached",
                                      description: `Pods can have a maximum of ${MAX_TUTORS_PER_POD} tutors.`,
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  setFormData({
                                    ...formData,
                                    tutorIds: [...formData.tutorIds, tutor.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    tutorIds: formData.tutorIds.filter((id) => id !== tutor.id),
                                  });
                                }
                              }}
                              data-testid={`checkbox-tutor-${tutor.id}`}
                            />
                            <label
                              htmlFor={`tutor-${tutor.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {tutor.name} ({tutor.email})
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.tutorIds.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formData.tutorIds.length} tutor(s) selected
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createPod.isPending}
                    data-testid="button-submit-pod"
                  >
                    {createPod.isPending ? "Creating..." : "Create Pod"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pods Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {!pods || pods.length === 0 ? (
            <Card className="sm:col-span-2 p-8 sm:p-12 text-center border">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No pods created yet</p>
            </Card>
          ) : (
            pods.map((pod) => (
              <Link
                key={pod.id}
                to={`/coo/pods/${pod.id}`}
              >
                <Card
                  className="p-4 sm:p-6 border space-y-3 sm:space-y-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all hover:scale-[1.02] sm:hover:scale-105"
                  data-testid={`pod-card-${pod.id}`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{(pod as any).pod_name || pod.podName}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Badge
                        className={`${getStatusColor(pod.status)} border font-semibold uppercase text-[10px] sm:text-2xs`}
                      >
                        {pod.status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">TD:</span>
                      <span className="font-medium truncate">{getTDName((pod as any).td_id || pod.tdId)}</span>
                    </div>
                    {((pod as any).start_date || pod.startDate) && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Started: {new Date((pod as any).start_date || pod.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
