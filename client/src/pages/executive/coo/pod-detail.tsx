import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  Calendar,
  Zap,
  Settings,
  Trash2,
  Plus,
  Mail,
  Award,
  ChevronDown,
  FileText,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
import type { Pod, User } from "@shared/schema";

export default function PodDetail() {
  const { podId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [addTutorsOpen, setAddTutorsOpen] = useState(false);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
  const [tutorToRemove, setTutorToRemove] = useState<string | null>(null);
  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());
  
  // Student dialog state
  const [identitySheetOpen, setIdentitySheetOpen] = useState(false);
  const [assignmentsDialogOpen, setAssignmentsDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  if (!podId) {
    navigate("/coo/pods");
    return null;
  }

  // @ts-ignore - React Query generic inference issue, safe at runtime
  const { data: pods, isLoading: podLoading } = useQuery<Pod[]>({
    queryKey: ["/api/coo/pods"],
    enabled: isAuthenticated && !authLoading,
  });

  const currentPod: Pod | undefined = pods?.find((p: Pod) => p.id === podId);

  const {
    data: tds,
    isLoading: tdsLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/coo/tds"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: approvedTutors,
    isLoading: tutorsLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/coo/approved-tutors"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: assignedTutorIds,
    isLoading: assignedTutorsLoading,
  } = useQuery<string[]>({
    queryKey: ["/api/coo/all-tutor-assignments"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: podTutors,
    isLoading: podTutorsLoading,
    refetch: refetchPodTutors,
  } = useQuery<any[]>({
    queryKey: [`/api/coo/pods/${podId}/tutors`],
    enabled: isAuthenticated && !authLoading && !!podId,
  });

  const {
    data: podStats,
    isLoading: statsLoading,
  } = useQuery<{ totalTutors: number; totalStudents: number; sessionsCompleted: number }>({
    queryKey: [`/api/coo/pods/${podId}/stats`],
    enabled: isAuthenticated && !authLoading && !!podId,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  useEffect(() => {
    console.log("📊 Pod detail data loaded:");
    console.log("  - assignedTutorIds:", assignedTutorIds);
    console.log("  - assignedTutorsLoading:", assignedTutorsLoading);
    console.log("  - approvedTutors:", approvedTutors?.length);
    console.log("  - tutorsLoading:", tutorsLoading);
  }, [assignedTutorIds, assignedTutorsLoading, approvedTutors, tutorsLoading]);

  const removeTutorMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("DELETE", `/api/coo/pods/${podId}/tutors/${assignmentId}`);
    },
    onSuccess: () => {
      refetchPodTutors();
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/all-tutor-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/approved-tutors"] });
      setTutorToRemove(null);
      toast({
        title: "Success",
        description: "Tutor removed from pod.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove tutor from pod.",
        variant: "destructive",
      });
    },
  });

  const addTutorsMutation = useMutation({
    mutationFn: async (tutorIds: string[]) => {
      await apiRequest("POST", `/api/coo/pods/${podId}/tutors`, { tutorIds });
    },
    onSuccess: () => {
      refetchPodTutors();
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      setAddTutorsOpen(false);
      setSelectedTutorIds([]);
      toast({
        title: "Success",
        description: "Tutors added to pod.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tutors to pod.",
        variant: "destructive",
      });
    },
  });

  // Delete Pod mutation (soft delete) ✅
  const deletePodMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/coo/pods/${podId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/tds"] });
      toast({ title: "Pod deleted", description: "Pod deleted successfully." });
      navigate("/coo/pods");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete pod.", variant: "destructive" });
    },
  });

  const getTDName = (tdId: string | null) => {
    if (!tdId) return "Unassigned";
    return tds?.find((td) => td.id === tdId)?.name || "Unknown";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getCertificationColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-300";
      case "failed":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-amber-100 text-amber-700 border border-amber-300";
    }
  };

  const toggleTutorExpand = (tutorId: string) => {
    const newExpanded = new Set(expandedTutors);
    if (newExpanded.has(tutorId)) {
      newExpanded.delete(tutorId);
    } else {
      newExpanded.add(tutorId);
    }
    setExpandedTutors(newExpanded);
  };

  if (podLoading || tdsLoading || tutorsLoading || authLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-1 h-64" />
            <Skeleton className="lg:col-span-2 h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!pods) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Pod not found</p>
          <Button onClick={() => navigate("/coo/pods")}>Back to Pods</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentPod) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Pod not found</p>
          <Button onClick={() => navigate("/coo/pods")}>Back to Pods</Button>
        </div>
      </DashboardLayout>
    );
  }

  const podName = (currentPod as Pod).podName;
  const tdName = getTDName((currentPod as Pod).tdId);
  const tutorCount = podTutors?.length || 0;
  const maxTutors = 10;
  const availableSlots = maxTutors - tutorCount;

  // Debug logging
  console.log("🔍 Approved tutors:", approvedTutors?.map((t: any) => ({ id: t.id, name: t.name })));
  console.log("🔍 Assigned tutor IDs (raw):", assignedTutorIds);
  console.log("🔍 Is assignedTutorIds an array?", Array.isArray(assignedTutorIds));
  console.log("🔍 Assigned tutor IDs type:", typeof assignedTutorIds);
  
  const availableTutors = approvedTutors?.filter((tutor) => {
    // Ensure we're comparing strings to strings
    const tutorIdStr = String(tutor.id).trim();
    const isInList = assignedTutorIds && assignedTutorIds.length > 0 
      ? assignedTutorIds.some(id => String(id).trim() === tutorIdStr)
      : false;
    
    if (!isInList) {
      console.log(`✅ ${tutor.name} (${tutor.id}): NOT assigned - will show in dialog`);
    } else {
      console.log(`❌ ${tutor.name} (${tutor.id}): ASSIGNED - will NOT show in dialog`);
    }
    return !isInList;
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/coo/pods")}
            className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate flex-1">{podName}</h1>

          {/* Delete Pod (soft delete) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Pod?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will soft-delete the pod and clear its Territory Director assignment. The pod can be viewed in Deleted Pods but this action cannot be undone from the app.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePodMutation.mutate()}
                className="bg-red-600 hover:bg-red-700"
                disabled={deletePodMutation.isPending}
              >
                {deletePodMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Students</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{podStats?.totalStudents || 0}</p>
              </div>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Sessions</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{podStats?.sessionsCompleted || 0}</p>
              </div>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Pod Info Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Status */}
            <Card className="p-4 sm:p-6 border">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Status</p>
              <div className="mt-2 sm:mt-3">
                <Badge className={`${getStatusColor((currentPod as Pod).status)} border font-semibold text-xs`}>
                  {(currentPod as Pod).status}
                </Badge>
              </div>
            </Card>

            {/* Territory Director */}
            <Card className="p-4 sm:p-6 border">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Territory Director</p>
              </div>
              <p className="font-medium text-sm sm:text-base">{tdName}</p>
            </Card>

            {/* Start Date */}
            {(currentPod as Pod).startDate && (
              <Card className="p-4 sm:p-6 border">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Started</p>
                </div>
                <p className="font-medium text-sm sm:text-base">
                  {new Date((currentPod as Pod).startDate).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </p>
              </Card>
            )}
          </div>

          {/* Right Column - Tutors */}
          <div>
            <Card className="p-4 sm:p-6 border">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b pb-3 sm:pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <h2 className="font-semibold text-sm sm:text-base">Assigned Tutors</h2>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {tutorCount}/{maxTutors}
                  </span>
                </div>

                {/* Tutors List */}
                {podTutorsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                  </div>
                ) : !podTutors || podTutors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tutors assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {podTutors.map((assignment: any) => {
                      const isExpanded = expandedTutors.has(assignment.id);
                      return (
                        <div
                          key={assignment.id}
                          className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors"
                        >
                          <div className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold text-primary shrink-0">
                                  {assignment.tutorName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm sm:text-base truncate">{assignment.tutorName}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{assignment.tutorEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTutorExpand(assignment.id)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                      onClick={() => setTutorToRemove(assignment.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Tutor?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove {assignment.tutorName} from this pod?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeTutorMutation.mutate(assignment.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={removeTutorMutation.isPending}
                                    >
                                      {removeTutorMutation.isPending ? "Removing..." : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <TutorStudentsSection 
                                tutorId={assignment.tutorId}
                                tutorName={assignment.tutorName}
                                certificationStatus={assignment.certification_status || "pending"}
                                studentCount={assignment.student_count || 0}
                                getCertificationColor={getCertificationColor}
                                onViewIdentitySheet={(studentId, studentName) => {
                                  setSelectedStudentId(studentId);
                                  setSelectedStudentName(studentName);
                                  setIdentitySheetOpen(true);
                                }}
                                onViewTrackingSystems={(studentId, studentName) => {
                                  setSelectedStudentId(studentId);
                                  setSelectedStudentName(studentName);
                                  setTrackingDialogOpen(true);
                                }}
                                onViewAssignments={(studentId, studentName) => {
                                  setSelectedStudentId(studentId);
                                  setSelectedStudentName(studentName);
                                  setAssignmentsDialogOpen(true);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Tutors Button */}
                {availableSlots > 0 && (
                  <Dialog open={addTutorsOpen} onOpenChange={setAddTutorsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
                        <Plus className="w-4 h-4" />
                        Add Tutor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Tutors to Pod</DialogTitle>
                        <DialogDescription>
                          Select tutors to add. You can add {availableSlots} more tutor{availableSlots !== 1 ? "s" : ""}.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        {availableTutors.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No available tutors
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {availableTutors.map((tutor) => (
                              <div
                                key={tutor.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted"
                              >
                                <Checkbox
                                  id={`add-tutor-${tutor.id}`}
                                  checked={selectedTutorIds.includes(tutor.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      if (selectedTutorIds.length >= availableSlots) {
                                        toast({
                                          title: "Slot limit reached",
                                          description: `You can only add ${availableSlots} more tutor${availableSlots !== 1 ? "s" : ""}.`,
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      setSelectedTutorIds([...selectedTutorIds, tutor.id]);
                                    } else {
                                      setSelectedTutorIds(
                                        selectedTutorIds.filter((id) => id !== tutor.id)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`add-tutor-${tutor.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <p className="font-medium text-sm">{tutor.name}</p>
                                  <p className="text-xs text-muted-foreground">{tutor.email}</p>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAddTutorsOpen(false);
                            setSelectedTutorIds([]);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => addTutorsMutation.mutate(selectedTutorIds)}
                          disabled={selectedTutorIds.length === 0 || addTutorsMutation.isPending}
                        >
                          {addTutorsMutation.isPending ? "Adding..." : "Add"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Student Dialogs - COO read-only view */}
      <StudentIdentitySheet
        open={identitySheetOpen}
        onOpenChange={setIdentitySheetOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        readOnly={true}
        apiBasePath="/api/coo"
      />
      
      <ViewAssignmentsDialog
        open={assignmentsDialogOpen}
        onOpenChange={setAssignmentsDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        apiBasePath="/api/coo"
      />
      
      <ViewTrackingSystemsDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        apiBasePath="/api/coo"
      />
    </DashboardLayout>
  );
}

// Component to display tutor's students in expanded section
interface TutorStudentsSectionProps {
  tutorId: string;
  tutorName: string;
  certificationStatus: string;
  studentCount: number;
  getCertificationColor: (status: string) => string;
  onViewIdentitySheet: (studentId: string, studentName: string) => void;
  onViewTrackingSystems: (studentId: string, studentName: string) => void;
  onViewAssignments: (studentId: string, studentName: string) => void;
}

function TutorStudentsSection({
  tutorId,
  tutorName,
  certificationStatus,
  studentCount,
  getCertificationColor,
  onViewIdentitySheet,
  onViewTrackingSystems,
  onViewAssignments,
}: TutorStudentsSectionProps) {
  const { data: students, isLoading } = useQuery<any[]>({
    queryKey: [`/api/coo/tutors/${tutorId}/students`],
    enabled: !!tutorId,
  });

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Certification Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Certification</p>
          <Badge
            className={`${getCertificationColor(certificationStatus)} mt-2 border`}
          >
            {certificationStatus}
          </Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Students</p>
          <p className="font-semibold mt-2">{students?.length || studentCount || 0}</p>
        </div>
      </div>

      {/* Students List */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Assigned Students</p>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !students || students.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center bg-muted/30 rounded-lg">
            No students assigned to this tutor yet
          </p>
        ) : (
          <div className="space-y-3">
            {students.map((student: any) => {
              const initials = student.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={student.id}
                  className="p-3 sm:p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarFallback className="bg-accent text-foreground font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{student.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {student.grade || "No grade"}
                        </Badge>
                      </div>
                      {student.sessionProgress !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Sessions: {student.sessionProgress || 0}/16
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onViewIdentitySheet(student.id, student.name)}
                    >
                      <FileText className="w-3 h-3 mr-1.5" />
                      Identity Sheet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onViewTrackingSystems(student.id, student.name)}
                    >
                      <Calendar className="w-3 h-3 mr-1.5" />
                      Tracking
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onViewAssignments(student.id, student.name)}
                    >
                      <FileText className="w-3 h-3 mr-1.5" />
                      Assignments
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
