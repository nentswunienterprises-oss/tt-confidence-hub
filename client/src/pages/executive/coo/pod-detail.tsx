import { useEffect, useState } from "react";
import "./pod-detail.mobile.css";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BattleTestHistoryDialog from "@/components/battle-testing/BattleTestHistoryDialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import BattleTestRunnerDialog from "@/components/battle-testing/BattleTestRunnerDialog";
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
  Settings,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  ChevronDown,
  FileText,
  UserMinus,
  School,
  Wifi,
  CalendarDays,
  Target,
  CircleAlert,
  ArrowRight,
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

function formatEnrollmentTopics(rawValue: string | null | undefined) {
  const ignoredContexts = new Set([
    "word problems",
    "tests",
    "timed work",
    "new topics",
    "careless errors",
  ]);

  return String(rawValue || "")
    .split(/[,\n;|]+/)
    .map((part) => part.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean)
    .filter((part) => !ignoredContexts.has(part.toLowerCase()))
    .join(", ");
}

function splitEnrollmentItems(rawValue: string | null | undefined) {
  return String(rawValue || "")
    .split(/[,\n;|]+/)
    .map((part) => part.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function formatPhaseLabel(value: string | null | undefined) {
  return String(value || "")
    .split("_")
    .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : ""))
    .join(" ")
    .trim();
}

function getBattleTestStateBadgeClass(state: string | null | undefined) {
  if (state === "locked") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (state === "watchlist") return "bg-amber-100 text-amber-900 border-amber-200";
  if (state === "fail") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatAuditTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function extractLegacySymptomsFromParentNote(rawValue: string | null | undefined) {
  const normalized = String(rawValue || "")
    .replace(/process alignment:\s*yes/gi, "")
    .replace(/process alignment:\s*no/gi, "")
    .replace(/observed response symptoms:\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,;\s]+/, "")
    .trim()
    .toLowerCase();
  if (!normalized) return [];

  const knownLabels = RESPONSE_SYMPTOM_GROUPS.flatMap((group) => group.options.map((option) => option.label))
    .filter((label) => !/^none of the above$/i.test(label) && !/^i don't know \/ not sure$/i.test(label))
    .sort((a, b) => b.length - a.length);

  return knownLabels.filter((label) => normalized.includes(label.toLowerCase()));
}
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
import { API_URL } from "@/lib/config";
import { isUnauthorizedError } from "@/lib/authUtils";
import StudentIdentitySheet from "@/components/tutor/StudentIdentitySheet";
import ViewAssignmentsDialog from "@/components/tutor/ViewAssignmentsDialog";
import ViewTrackingSystemsDialog from "@/components/tutor/ViewTrackingSystemsDialog";
import StudentTopicConditioningDialog from "@/components/tutor/StudentTopicConditioningDialog";
import StudentCommunicationDialog from "@/components/communications/StudentCommunicationDialog";
import type { Pod, User } from "@shared/schema";
import { RESPONSE_SYMPTOM_GROUPS } from "@shared/responseSymptomMapping";
import {
  getBattleTestStateLabel,
  type BattleTestPhaseDefinition,
  type BattleTestResponseInput,
  type PodBattleTestingSummary,
} from "@shared/battleTesting";

const MAX_TUTORS_PER_POD = 12;
const getMaxStudentsPerTutorForVehicle = (vehicle?: string | null) => {
  switch (vehicle) {
    case "6_seater":
      return 6;
    case "5_seater":
      return 5;
    case "4_seater":
    default:
      return 4;
  }
};

interface ParentEnrollment {
  id: string;
  parent_full_name: string;
  parent_email: string;
  parent_phone: string;
  parent_city: string;
  student_full_name: string;
  student_grade: string;
  school_name: string;
  math_struggle_areas: string;
  previous_tutoring?: string | null;
  internet_access?: string | null;
  parent_motivation?: string | null;
  status: string;
  created_at?: string | null;
  parentInfo?: {
    response_symptoms?: string[];
    topic_response_symptoms?: Record<string, string[]>;
    topic_recommended_starting_phases?: Record<
      string,
      {
        phase?: string | null;
        supportingSymptoms?: string[];
        rationale?: string | null;
      }
    >;
  };
}

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
  const [topicConditioningDialogOpen, setTopicConditioningDialogOpen] = useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [selectedStudentRecord, setSelectedStudentRecord] = useState<any | null>(null);
  const [tdBattleTestOpen, setTdBattleTestOpen] = useState(false);
  const [activeTutorHistory, setActiveTutorHistory] = useState<{ assignmentId: string; tutorName: string } | null>(null);
  const [tdHistoryOpen, setTdHistoryOpen] = useState(false);

  if (!podId) {
    navigate("/coo/pods");
    return null;
  }

  // @ts-ignore - React Query generic inference issue, safe at runtime
  const { data: pods, isLoading: podLoading } = useQuery<Pod[]>({
    queryKey: ["/api/coo/pods"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const currentPod: Pod | undefined = pods?.find((p: Pod) => p.id === podId);

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

  const {
    data: assignedTutorIds,
    isLoading: assignedTutorsLoading,
  } = useQuery<string[]>({
    queryKey: ["/api/coo/all-tutor-assignments"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const {
    data: podTutors,
    isLoading: podTutorsLoading,
    refetch: refetchPodTutors,
  } = useQuery<any[]>({
    queryKey: [`/api/coo/pods/${podId}/tutors`],
    enabled: isAuthenticated && !authLoading && !!podId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const {
    data: podStats,
    isLoading: statsLoading,
  } = useQuery<{ totalTutors: number; totalStudents: number; sessionsCompleted: number }>({
    queryKey: [`/api/coo/pods/${podId}/stats`],
    enabled: isAuthenticated && !authLoading && !!podId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const {
    data: battleTestingSummary,
    isLoading: battleTestingLoading,
  } = useQuery<PodBattleTestingSummary>({
    queryKey: [`/api/battle-tests/pods/${podId}/summary`],
    enabled: isAuthenticated && !authLoading && !!podId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const { data: tdBattleTestPhases = [] } = useQuery<BattleTestPhaseDefinition[]>({
    queryKey: ["/api/battle-tests/banks/td"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/battle-tests/banks/td`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load TD battle-testing bank");
      return response.json();
    },
  });

  const { data: enrollments = [] } = useQuery<ParentEnrollment[]>({
    queryKey: ["/api/hr/enrollments"],
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 5000,
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

  const unassignStudentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      await apiRequest("POST", `/api/hr/enrollments/${enrollmentId}/unassign-tutor`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/coo/pods/${podId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: [`/api/coo/pods/${podId}/stats`] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      toast({
        title: "Student unassigned",
        description: "Student was unassigned safely and preserved for reassignment.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unassign failed",
        description: error?.message || "Failed to unassign student.",
        variant: "destructive",
      });
    },
  });

  const assignAwaitingEnrollmentMutation = useMutation({
    mutationFn: async ({ enrollmentId, tutorId }: { enrollmentId: string; tutorId: string }) => {
      await apiRequest("POST", `/api/hr/enrollments/${enrollmentId}/assign-tutor`, {
        tutorId,
        podId,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/enrollments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/coo/pods/${podId}/tutors`] });
      queryClient.invalidateQueries({ queryKey: [`/api/coo/pods/${podId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/coo/tutors/${variables.tutorId}/students`] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      toast({
        title: "Parent assigned",
        description: "The parent was assigned to the tutor from this pod view.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment failed",
        description: error?.message || "Failed to assign parent to tutor.",
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

  const submitTdBattleTestMutation = useMutation({
    mutationFn: async ({ responses }: { responses: BattleTestResponseInput[] }) => {
      if (!(currentPod as Pod).tdId) {
        throw new Error("This pod has no TD assigned.");
      }
      await apiRequest("POST", `/api/coo/pods/${podId}/td-battle-tests`, {
        tdId: (currentPod as Pod).tdId,
        responses,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/battle-tests/pods/${podId}/summary`] });
      queryClient.invalidateQueries({ queryKey: ["/api/coo/pods"] });
      toast({
        title: "TD battle test saved",
        description: "TD system-integrity results were logged successfully.",
      });
      setTdBattleTestOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "TD battle test failed",
        description: error?.message || "Failed to save TD battle test.",
        variant: "destructive",
      });
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

  if (podLoading || tdsLoading || tutorsLoading || authLoading || statsLoading || battleTestingLoading) {
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
  const maxTutors = MAX_TUTORS_PER_POD;
  const availableSlots = maxTutors - tutorCount;
  const maxStudentsPerTutor = getMaxStudentsPerTutorForVehicle((currentPod as Pod).vehicle);

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

  const awaitingAssignments = enrollments.filter(
    (enrollment) => String(enrollment.status || "").toLowerCase().trim() === "awaiting_assignment"
  );

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
        <div className="coo-pod-stats grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Tutors</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
                {podStats?.totalTutors || 0}
              </p>
            </div>
          </Card>

          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Students</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
                {podStats?.totalStudents || 0}
              </p>
            </div>
          </Card>
          
          <Card className="border-primary/15 bg-background shadow-sm">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Sessions Done</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
                {podStats?.sessionsCompleted || 0}
              </p>
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

            {/* Territory Director with TD Integrity */}
            <Card className="p-4 sm:p-6 border">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase">Territory Director</p>
              </div>
              <p className="font-medium text-sm sm:text-base mb-4">{tdName}</p>
              
              {/* TD Integrity Sub-section */}
              {battleTestingSummary?.tdSummary && (
                <div className="pt-4 border-t space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">TD Integrity</p>
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <Badge className={getBattleTestStateBadgeClass(battleTestingSummary.tdSummary.state)}>
                      {getBattleTestStateLabel(battleTestingSummary.tdSummary.state)}
                    </Badge>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setTdHistoryOpen(true)}>
                      TD History
                    </Button>
                    <Button size="sm" className="w-full sm:w-auto" onClick={() => setTdBattleTestOpen(true)}>
                      Run TD Audit
                    </Button>
                  </div>
                </div>
              )}
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
                      const tutorAudit = battleTestingSummary?.tutorSummaries.find(
                        (entry) => entry.assignmentId === assignment.id
                      );
                      return (
                        <div
                          key={assignment.id}
                          className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors"
                        >
                          <div className="p-3 sm:p-4">
                            <div className="flex flex-col gap-3 sm:gap-4">
                              <div className="flex items-start justify-between gap-2 sm:gap-4">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold text-primary shrink-0">
                                  {assignment.tutorName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm sm:text-base truncate">{assignment.tutorName}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{assignment.tutorEmail}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge className={`${getCertificationColor(assignment.certification_status || "pending")} border`}>
                                      {assignment.certification_status || "pending"}
                                    </Badge>
                                    <Badge variant={(assignment.operational_mode || assignment.operationalMode || "training") === "training" ? "secondary" : "default"}>
                                      {(assignment.operational_mode || assignment.operationalMode || "training") === "training"
                                        ? "Training Mode"
                                        : "Certified Live"}
                                    </Badge>
                                    <Badge className={getBattleTestStateBadgeClass(tutorAudit?.state)}>
                                      {getBattleTestStateLabel(tutorAudit?.state)}
                                    </Badge>
                                    <Badge variant="outline">
                                      {tutorAudit?.alignmentPercent == null
                                        ? "Audit N/A"
                                        : `Audit ${Math.round(tutorAudit.alignmentPercent)}%`}
                                    </Badge>
                                  </div>
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
                              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
                                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                    Tutor Audit
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {tutorAudit?.phaseScores?.length ? (
                                      tutorAudit.phaseScores.map((phase) => (
                                        <Badge key={`${assignment.id}-${phase.phaseKey}`} variant="outline">
                                          {phase.title}: {Math.round(phase.percent)}%
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        No tutor audit has been logged yet.
                                      </span>
                                    )}
                                  </div>
                                  {tutorAudit?.actionRequired ? (
                                    <p className="mt-3 text-sm text-muted-foreground">{tutorAudit.actionRequired}</p>
                                  ) : null}
                                  {tutorAudit?.lastAuditAt ? (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      Last audit: {formatAuditTimestamp(tutorAudit.lastAuditAt)}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
                                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                    Tutor Controls
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (!tutorAudit) return;
                                        setActiveTutorHistory({
                                          assignmentId: assignment.id,
                                          tutorName: tutorAudit.tutorName,
                                        });
                                      }}
                                      disabled={!tutorAudit}
                                    >
                                      Audit History
                                    </Button>
                                  </div>
                                  <p className="mt-3 text-sm text-muted-foreground">
                                    {assignment.student_count || 0}/{maxStudentsPerTutor} students assigned.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <TutorStudentsSection 
                                assignmentId={assignment.id}
                                tutorId={assignment.tutorId}
                                tutorName={assignment.tutorName}
                                studentCount={assignment.student_count || 0}
                                maxStudentsPerTutor={maxStudentsPerTutor}
                                awaitingAssignments={awaitingAssignments}
                                unassignStudentMutation={unassignStudentMutation}
                                assignAwaitingEnrollmentMutation={assignAwaitingEnrollmentMutation}
                                onViewTrackingSystems={(studentId, studentName) => {
                                  setSelectedStudentId(studentId);
                                  setSelectedStudentName(studentName);
                                  setTrackingDialogOpen(true);
                                }}
                                onViewTopicConditioning={(student) => {
                                  setSelectedStudentId(student.id);
                                  setSelectedStudentName(student.name);
                                  setSelectedStudentRecord(student);
                                  setTopicConditioningDialogOpen(true);
                                }}
                                onViewCommunication={(student) => {
                                  setSelectedStudentId(student.id);
                                  setSelectedStudentName(student.name);
                                  setSelectedStudentRecord(student);
                                  setCommunicationDialogOpen(true);
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

        {battleTestingSummary ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Weekly Alignment</p>
              <p className="mt-2 text-2xl font-semibold">
                {battleTestingSummary.weeklyAlignmentPercent == null
                  ? "N/A"
                  : `${Math.round(battleTestingSummary.weeklyAlignmentPercent)}%`}
              </p>
            </Card>
            <Card className="border p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Violation Spikes</p>
              <p className="mt-2 text-2xl font-semibold">{battleTestingSummary.driftIncidents}</p>
            </Card>

            <Card className="border p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Tutor Risk</p>
              <p className="mt-2 text-2xl font-semibold">
                {battleTestingSummary.watchlistTutors + battleTestingSummary.failTutors}
              </p>
            </Card>
          </div>
        ) : null}
      </div>

      <BattleTestRunnerDialog
        open={tdBattleTestOpen}
        onOpenChange={setTdBattleTestOpen}
        title={`TD System Integrity - ${tdName}`}
        description={`Run the COO-side TD integrity drill for ${tdName} inside ${podName}.`}
        phaseOptions={tdBattleTestPhases}
        selectionMode="fixed"
        submitLabel="Save TD Battle Test"
        onSubmit={async ({ responses }) => {
          await submitTdBattleTestMutation.mutateAsync({
            responses,
          });
        }}
      />

      <BattleTestHistoryDialog
        open={!!activeTutorHistory}
        onOpenChange={(open) => {
          if (!open) setActiveTutorHistory(null);
        }}
        title={
          activeTutorHistory
            ? `Tutor Audit History - ${activeTutorHistory.tutorName}`
            : "Tutor Audit History"
        }
        description="Stored tutor battle-test runs and rep-level detail for this pod."
        historyQueryKey={`battle-test-runs-${podId}`}
        historyEndpoint={`/api/battle-tests/pods/${podId}/runs`}
        filter={(run) =>
          !!activeTutorHistory && run.subjectType === "tutor" && run.tutorAssignmentId === activeTutorHistory.assignmentId
        }
      />

      <BattleTestHistoryDialog
        open={tdHistoryOpen}
        onOpenChange={setTdHistoryOpen}
        title={`TD Audit History - ${tdName}`}
        description="Stored TD system-integrity battle tests for this pod."
        historyQueryKey={`battle-test-runs-${podId}`}
        historyEndpoint={`/api/battle-tests/pods/${podId}/runs`}
        filter={(run) => run.subjectType === "td"}
      />

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

      <StudentTopicConditioningDialog
        open={topicConditioningDialogOpen}
        onOpenChange={setTopicConditioningDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        studentGrade={(selectedStudentRecord?.grade as string) || null}
        parentTopics={
          (selectedStudentRecord?.parentInfo?.response_topics as string) ||
          (selectedStudentRecord?.parentInfo?.math_struggle_areas as string) ||
          (selectedStudentRecord?.struggleAreas as string) ||
          null
        }
        parentTopicSymptoms={
          selectedStudentRecord?.parentInfo?.topic_response_symptoms &&
          typeof selectedStudentRecord.parentInfo.topic_response_symptoms === "object"
            ? selectedStudentRecord.parentInfo.topic_response_symptoms
            : null
        }
        parentTopicRecommendations={
          selectedStudentRecord?.parentInfo?.topic_recommended_starting_phases &&
          typeof selectedStudentRecord.parentInfo.topic_recommended_starting_phases === "object"
            ? selectedStudentRecord.parentInfo.topic_recommended_starting_phases
            : null
        }
        topicConditioning={
          selectedStudentRecord?.topicConditioning ||
          selectedStudentRecord?.topic_conditioning ||
          null
        }
        persistedTopicStates={
          selectedStudentRecord?.conceptMastery?.topicConditioning?.topics ||
          selectedStudentRecord?.concept_mastery?.topicConditioning?.topics ||
          null
        }
        readOnly={true}
        mapOnly={true}
        apiBasePath="/api/coo"
      />

      <StudentCommunicationDialog
        open={communicationDialogOpen}
        onOpenChange={setCommunicationDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        readOnly={true}
        apiBasePath="/api/coo"
      />
    </DashboardLayout>
  );
}

// Component to display tutor's students in expanded section
interface TutorStudentsSectionProps {
  assignmentId: string;
  tutorId: string;
  tutorName: string;
  studentCount: number;
  maxStudentsPerTutor: number;
  awaitingAssignments: ParentEnrollment[];
  unassignStudentMutation: any;
  assignAwaitingEnrollmentMutation: any;
  onViewTrackingSystems: (studentId: string, studentName: string) => void;
  onViewTopicConditioning: (student: any) => void;
  onViewCommunication: (student: any) => void;
}

function TutorStudentsSection({
  assignmentId,
  tutorId,
  tutorName,
  studentCount,
  maxStudentsPerTutor,
  awaitingAssignments,
  unassignStudentMutation,
  assignAwaitingEnrollmentMutation,
  onViewTrackingSystems,
  onViewTopicConditioning,
  onViewCommunication,
}: TutorStudentsSectionProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { data: students, isLoading } = useQuery<any[]>({
    queryKey: [`/api/coo/tutors/${tutorId}/students`],
    enabled: !!tutorId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const activeStudentCount = students?.length || studentCount || 0;
  const tutorAtCapacity = activeStudentCount >= maxStudentsPerTutor;

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Assigned Students</p>
          <p className="text-sm text-muted-foreground">
            Drill down into the students currently assigned to {tutorName}.
          </p>
        </div>
        <Badge variant="outline">{activeStudentCount}/{maxStudentsPerTutor}</Badge>
      </div>

      {/* Students List */}
      <div>
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
                          Sessions this cycle: {((student.sessionProgress || 0) % 8) || (student.sessionProgress % 8 === 0 && student.sessionProgress > 0 ? 8 : 0)}/8
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
                      onClick={() => onViewTopicConditioning(student)}
                    >
                      <Settings className="w-3 h-3 mr-1.5" />
                      Topic Conditioning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onViewTrackingSystems(student.id, student.name)}
                    >
                      <Calendar className="w-3 h-3 mr-1.5" />
                      Tracking Systems
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onViewCommunication(student)}
                    >
                      <Mail className="w-3 h-3 mr-1.5" />
                      Communication
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                      disabled={!student.assignedEnrollmentId || unassignStudentMutation.isPending}
                      onClick={() => {
                        if (!student.assignedEnrollmentId) return;
                        const confirmed = window.confirm(
                          `Unassign ${student.name} from ${tutorName}?\n\nStudent data will be preserved for reassignment.`
                        );
                        if (!confirmed) return;
                        unassignStudentMutation.mutate(student.assignedEnrollmentId);
                      }}
                    >
                      <UserMinus className="w-3 h-3 mr-1.5" />
                      {unassignStudentMutation.isPending ? "Unassigning..." : "Unassign"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Awaiting Parents</p>
            <p className="text-sm text-muted-foreground">
              Assign directly from the unassigned parent queue without leaving this pod.
            </p>
            {tutorAtCapacity && (
              <p className="mt-1 text-xs text-amber-700">
                This tutor is at vehicle capacity and cannot receive more students from quick actions.
              </p>
            )}
          </div>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={awaitingAssignments.length === 0 || assignAwaitingEnrollmentMutation.isPending || tutorAtCapacity}
              >
                Assign Parent
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(96vw,72rem)] max-w-6xl">
              <DialogHeader>
                <DialogTitle>Assign Parent to {tutorName}</DialogTitle>
                <DialogDescription>
                  Select an unassigned parent enrollment from the awaiting list.
                </DialogDescription>
              </DialogHeader>

              {awaitingAssignments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No parents are currently awaiting assignment.
                </div>
              ) : (
                <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
                  {awaitingAssignments.map((enrollment) => (
                    <Card
                      key={enrollment.id}
                      className="overflow-hidden border-[#e8dcc2] bg-gradient-to-br from-[#fffaf0] via-white to-[#fff7e8] shadow-sm"
                    >
                      {(() => {
                        const topics = Array.from(
                          new Set([
                            ...splitEnrollmentItems(formatEnrollmentTopics(enrollment.math_struggle_areas)),
                            ...Object.keys(enrollment.parentInfo?.topic_response_symptoms || {}),
                            ...Object.keys(enrollment.parentInfo?.topic_recommended_starting_phases || {}),
                          ])
                        );
                        const fallbackSymptoms =
                          enrollment.parentInfo?.response_symptoms && enrollment.parentInfo.response_symptoms.length > 0
                            ? enrollment.parentInfo.response_symptoms
                            : extractLegacySymptomsFromParentNote(enrollment.parent_motivation);
                        const topicSymptoms = enrollment.parentInfo?.topic_response_symptoms || {};
                        const topicRecommendations = enrollment.parentInfo?.topic_recommended_starting_phases || {};
                        const derivedTopicSymptoms =
                          topics.length === 1 && fallbackSymptoms.length > 0 && !topicSymptoms[topics[0]]
                            ? { ...topicSymptoms, [topics[0]]: fallbackSymptoms }
                            : topicSymptoms;

                        return (
                          <>
                            <div className="border-b border-[#eadfca] bg-[#fff8ea]/80 px-5 pb-5 pt-5">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-2xl font-semibold tracking-tight text-slate-950">
                                      {enrollment.student_full_name}
                                    </p>
                                    <p className="mt-1 text-base text-slate-600">
                                      Parent: {enrollment.parent_full_name || "Unknown"}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="border-[#e7d7b3] bg-white/80 text-slate-700">
                                      <BookOpen className="mr-1 h-3.5 w-3.5" />
                                      {enrollment.student_grade || "Grade not provided"}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                                    Awaiting Assignment
                                  </Badge>
                                  <Badge variant="outline" className="border-[#eadfca] bg-white/80 text-slate-600">
                                    <CalendarDays className="mr-1 h-3.5 w-3.5" />
                                    {enrollment.created_at ? new Date(enrollment.created_at).toLocaleDateString() : "Unknown"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6 p-5">
                              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-xl border border-[#eadfca] bg-white/80 p-4">
                                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                    <Mail className="h-3.5 w-3.5" />
                                    Email
                                  </div>
                                  <p className="mt-2 break-all text-sm font-medium text-slate-900">
                                    {enrollment.parent_email || "Not provided"}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-[#eadfca] bg-white/80 p-4">
                                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                    <Phone className="h-3.5 w-3.5" />
                                    Phone
                                  </div>
                                  <p className="mt-2 text-sm font-medium text-slate-900">
                                    {enrollment.parent_phone || "Not provided"}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-[#eadfca] bg-white/80 p-4">
                                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Location
                                  </div>
                                  <p className="mt-2 text-sm font-medium text-slate-900">
                                    {enrollment.parent_city || "Not provided"}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-[#eadfca] bg-white/80 p-4">
                                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                    <School className="h-3.5 w-3.5" />
                                    School
                                  </div>
                                  <p className="mt-2 text-sm font-medium text-slate-900">
                                    {enrollment.school_name || "Not provided"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-4 2xl:grid-cols-[1.15fr,0.85fr]">
                                <div className="rounded-2xl border border-[#eadfca] bg-white/85 p-5">
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-[#946c16]" />
                                    <p className="text-sm font-semibold text-slate-900">Enrollment Focus</p>
                                  </div>

                                  <div className="mt-4 space-y-4">
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Topics</p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {topics.length > 0 ? (
                                          topics.map((topic) => (
                                            <Badge key={topic} variant="secondary" className="bg-[#f6edd7] text-[#6a4d0b] hover:bg-[#f6edd7]">
                                              {topic}
                                            </Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-slate-500">No topics recorded</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="rounded-xl border border-dashed border-[#eadfca] bg-[#fffaf2] p-3">
                                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Previous Tutoring</p>
                                        <p className="mt-2 text-sm font-medium text-slate-900">
                                          {enrollment.previous_tutoring || "Not provided"}
                                        </p>
                                      </div>
                                      <div className="rounded-xl border border-dashed border-[#eadfca] bg-[#fffaf2] p-3">
                                        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                          <Wifi className="h-3.5 w-3.5" />
                                          Internet Access
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-900">
                                          {enrollment.internet_access || "Not provided"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-[#eadfca] bg-white/85 p-5">
                                  <div className="flex items-center gap-2">
                                    <CircleAlert className="h-4 w-4 text-[#946c16]" />
                                    <p className="text-sm font-semibold text-slate-900">Parent Intake Signal</p>
                                  </div>

                                  <div className="mt-4 space-y-3">
                                    {topics.length > 0 ? (
                                      topics.map((topic) => {
                                        const symptoms = derivedTopicSymptoms[topic] || [];
                                        const recommendation = topicRecommendations[topic];
                                        return (
                                          <div key={topic} className="rounded-xl border border-[#eadfca] bg-[#fffdf8] p-4">
                                            <p className="text-sm font-semibold text-slate-900">{topic}</p>
                                            {recommendation?.phase ? (
                                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                                Suggested diagnostic start: {formatPhaseLabel(recommendation.phase)}
                                              </p>
                                            ) : null}

                                            <div className="mt-3">
                                              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Observed Signals</p>
                                              <div className="mt-2 flex flex-wrap gap-2">
                                                {symptoms.length > 0 ? (
                                                  symptoms.map((symptom) => (
                                                    <Badge key={`${topic}-${symptom}`} variant="outline" className="border-[#ecdcb7] bg-white text-slate-700">
                                                      {symptom}
                                                    </Badge>
                                                  ))
                                                ) : (
                                                  <span className="text-sm text-slate-500">No topic-specific symptom map recorded yet.</span>
                                                )}
                                              </div>
                                            </div>

                                            {recommendation?.rationale ? (
                                              <div className="mt-3 rounded-lg bg-[#faf4e5] p-3 text-sm text-slate-700">
                                                {recommendation.rationale}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })
                                    ) : fallbackSymptoms.length > 0 ? (
                                      <div className="rounded-xl border border-[#eadfca] bg-[#fffdf8] p-4">
                                        <p className="text-sm font-semibold text-slate-900">Observed Signals</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {fallbackSymptoms.map((symptom) => (
                                            <Badge key={symptom} variant="outline" className="border-[#ecdcb7] bg-white text-slate-700">
                                              {symptom}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed border-[#eadfca] bg-[#fffdf8] p-4 text-sm text-slate-500">
                                        No symptom mapping was captured for this enrollment.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 border-t border-[#eadfca] pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium text-slate-800">Submitted:</span>{" "}
                                  {enrollment.created_at ? new Date(enrollment.created_at).toLocaleString() : "Unknown"}
                                </div>

                                <Button
                                  disabled={assignAwaitingEnrollmentMutation.isPending || tutorAtCapacity}
                                  onClick={async () => {
                                    try {
                                      await assignAwaitingEnrollmentMutation.mutateAsync({
                                        enrollmentId: enrollment.id,
                                        tutorId,
                                      });
                                      setAssignDialogOpen(false);
                                    } catch {
                                      // Toast is handled by the mutation error callback.
                                    }
                                  }}
                                >
                                  {assignAwaitingEnrollmentMutation.isPending ? "Assigning..." : `Assign to ${tutorName}`}
                                  {!assignAwaitingEnrollmentMutation.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                                </Button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
