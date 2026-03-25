import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface StudentStats {
  bossBattlesCompleted: number;
  solutionsUnlocked: number;
  totalSessions: number;
  currentStreak: number;
  confidenceLevel: number;
}

interface StruggleTarget {
  id?: string;
  subject?: string;
  topicConcept?: string;
  topic_concept?: string;
  strategy?: string;
  myStruggle?: string;
  my_struggle?: string;
  overcame?: boolean;
}

interface TopicConditioningState {
  topic: string | null;
  phase: string | null;
  stability: string | null;
  stage: string;
  lastUpdated: string | null;
}

export default function StudentDashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading, dataUpdatedAt } = useQuery<StudentStats>({
    queryKey: ["/api/student/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: studentInfo } = useQuery<any>({
    queryKey: ["/api/student/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: struggleTargetsData } = useQuery<StruggleTarget[] | null>({
    queryKey: ["/api/student/struggle-targets"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: topicConditioningState } = useQuery<TopicConditioningState | null>({
    queryKey: ["/api/student/topic-conditioning-state"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const trainingMarkers = [
    { label: "Sessions Completed", value: stats?.totalSessions || 0 },
    { label: "Challenge Exposure", value: stats?.bossBattlesCompleted || 0 },
    { label: "Structured Solutions", value: stats?.solutionsUnlocked || 0 },
    { label: "Current Training Stage", value: topicConditioningState?.stage || "Foundation" },
  ];

  const struggleTargets = Array.isArray(struggleTargetsData) ? struggleTargetsData : [];
  const activeTarget = struggleTargets.find((target) => !target.overcame) || struggleTargets[0] || null;
  const focusTopic = activeTarget ? activeTarget.topicConcept || activeTarget.topic_concept || "Unspecified" : "No target set";
  const focusSubject = activeTarget?.subject || "No subject set";
  const focusObjective =
    activeTarget?.strategy ||
    activeTarget?.myStruggle ||
    activeTarget?.my_struggle ||
    "Your tutor will set the next objective after your upcoming session.";

  const allCoreMetricsZero =
    (stats?.totalSessions || 0) === 0 &&
    (stats?.bossBattlesCompleted || 0) === 0 &&
    (stats?.solutionsUnlocked || 0) === 0;

  const updatedLabel = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : "Pending sync";

  const quickActions = [
    {
      title: "My Assignments",
      description: "Practice problems from your tutor",
      path: "/client/student/assignments",
    },
    {
      title: "Academic Tracker",
      description: "Topics in progress and conditioning state",
      path: "/client/student/academic-tracker",
    },
    {
      title: "Updates",
      description: "Messages and notes from your tutor",
      path: "/client/student/updates",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">
          Welcome back, {studentInfo?.firstName || "Student"}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Your training overview</p>
      </div>

      <Card className="border-primary/20 bg-background shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium tracking-[-0.01em]">Next Session Focus</CardTitle>
          <CardDescription>The next objective your tutor is conditioning.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.07em] text-muted-foreground">Current Topic</p>
              <p className="mt-2 text-base font-medium text-foreground break-words">{focusTopic}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.07em] text-muted-foreground">Subject</p>
              <p className="mt-2 text-base font-medium text-foreground break-words">{focusSubject}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.07em] text-muted-foreground">Next Objective</p>
              <p className="mt-2 text-base font-medium text-foreground break-words">{focusObjective}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-background shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium tracking-[-0.01em]">Training Markers</CardTitle>
          <CardDescription>Signals from your active sessions and conditioning work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trainingMarkers.map((item) => (
              <div key={item.label} className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.07em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl md:text-3xl font-semibold tabular-nums text-foreground break-words">{item.value}</p>
              </div>
            ))}
          </div>

          {allCoreMetricsZero && (
            <div className="rounded-lg border border-primary/15 bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
              No sessions have been logged yet. Your tutor will update these markers after your first session.
            </div>
          )}

          <p className="text-xs text-muted-foreground">Last updated: {updatedLabel}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="border-primary/15 bg-background cursor-pointer transition-colors hover:bg-muted/10"
            onClick={() => setLocation(action.path)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium tracking-[-0.01em]">{action.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
