import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import { buildTopics } from "./topicUtils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useStudentWorkflowState, useMarkIntroCompleted, useRespondToAssignment } from "@/hooks/useStudentWorkflowState";
import { TutorIntroSessionActions } from "./TutorIntroSessionActions";
import { Input } from "@/components/ui/input";

function splitReportedTopics(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return [];
  return rawValue
    .split(/[,\n;|]+/)
    .map((part) => part.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function normalizePhaseLabel(rawValue) {
  const value = String(rawValue || "").toLowerCase();
  if (value.includes("clarity")) return "Clarity";
  if (value.includes("structured")) return "Structured Execution";
  if (value.includes("discomfort")) return "Controlled Discomfort";
  if (value.includes("time") || value.includes("pressure")) return "Time Pressure Stability";
  return null;
}

function normalizeStabilityLabel(rawValue) {
  const value = String(rawValue || "").toLowerCase();
  if (value.includes("high maintenance") || value.includes("maintenance")) return "High Maintenance";
  if (value.includes("high")) return "High";
  if (value.includes("medium")) return "Medium";
  if (value.includes("low")) return "Low";
  return null;
}

function normalizeTopicLabel(rawValue) {
  const cleaned = String(rawValue || "").trim();
  if (!cleaned) return null;
  if (cleaned.toLowerCase() === "onboarding baseline diagnostic") return null;
  return cleaned;
}

function formatRelativeTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "Unknown";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60 * 1000) return "just now";
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getWorkflowLabel(workflow) {
  if (!workflow) return "Loading";
  if (!workflow.assignmentAccepted) return "Assignment Pending";
  if (!workflow.introConfirmed) return "Intro Booking";
  if (!workflow.introCompleted) return "Intro Confirmed";
  if (workflow.proposalAccepted && workflow.introCompleted) return "Active Training";
  if (!workflow.identitySaved) return "Identity Sheet";
  if (!workflow.proposalSent) return "Proposal Draft";
  if (!workflow.proposalAccepted) return "Awaiting Parent";
  return "Active Training";
}

function inferReportedSymptoms({ struggleAreas, parentMotivation }) {
  const combined = `${struggleAreas || ""} ${parentMotivation || ""}`.toLowerCase();
  const symptoms = [];

  if (/(freeze|freezes|panic|panics|stuck|blank)/.test(combined)) {
    symptoms.push("Freezes when questions look unfamiliar");
  }
  if (/(rush|rushed|careless|quickly|too fast)/.test(combined)) {
    symptoms.push("Rushes under time pressure");
  }
  if (/(guess|guesses|guessing)/.test(combined)) {
    symptoms.push("Guesses without full structure");
  }
  if (/(avoid|avoids|avoidance)/.test(combined)) {
    symptoms.push("Avoids difficult problems");
  }
  if (/(help|depends|dependent|reassurance|support)/.test(combined)) {
    symptoms.push("Seeks help early");
  }

  return symptoms;
}

export function StudentCard({
  student,
  setSelectedStudentId,
  setSelectedStudentName,
  setIdentitySheetOpen,
  setTrackingDialogOpen,
  setAssignmentsDialogOpen,
  setProposalOpen,
  setTopicConditioningDialogOpen,
  setReportsDialogOpen,
}) {
  // ...existing code...
  // State for assignment modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const completedSessions = Math.max(0, Number(student.sessionProgress || 0));
  const progressLabel = 'Program Progress';
  const progressTotal = 8;
  const sessionProgress =
    completedSessions > 0 ? (((completedSessions - 1) % progressTotal) + 1) : 0;
  const sessionsRemaining =
    sessionProgress === 0 ? progressTotal : Math.max(0, progressTotal - sessionProgress);
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { data: workflow, isLoading: workflowLoading } = useStudentWorkflowState(student.id);
  const markIntroCompleted = useMarkIntroCompleted(student.id);
  const respondToAssignment = useRespondToAssignment(student.id);

  const effectiveWorkflow = useMemo(() => {
    const baseWorkflow = {
      assignmentAccepted: false,
      introConfirmed: false,
      introCompleted: false,
      identitySaved: false,
      proposalSent: false,
      proposalAccepted: false,
      ...(workflow || {}),
    };

    return {
      ...baseWorkflow,
      assignmentAccepted: student.pendingTutorAcceptance
        ? false
        : baseWorkflow.assignmentAccepted,
    };
  }, [workflow, student.pendingTutorAcceptance]);

  // Fetch topic activations for this student (must be at the top of the function body)
  const { data: activationsData } = useQuery({
    queryKey: ["/api/tutor/students", student.id, "topic-conditioning-activations"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/tutor/students/${student.id}/topic-conditioning-activations`
      );
      return res.json();
    },
    enabled: !!student.id,
  });


  const reportedSymptoms =
    (Array.isArray(student.parentInfo?.response_symptoms) ? student.parentInfo.response_symptoms : []).filter(Boolean)
      .map((symptom) => String(symptom).trim())
      .filter(Boolean);

  // Always define inferredSymptoms to prevent ReferenceError
  const inferredSymptoms = inferReportedSymptoms({
    struggleAreas: student.parentInfo?.math_struggle_areas || student.struggleAreas || "",
    parentMotivation: student.parentInfo?.parent_motivation || ""
  });

  const symptomSignals = reportedSymptoms.length > 0 ? reportedSymptoms : inferredSymptoms;


  // Derive reportedTopics from all possible parent fields
  let reportedTopics: string[] = [];
  // 1. response_topics (legacy string)
  if (student.parentInfo?.response_topics) {
    reportedTopics = reportedTopics.concat(splitReportedTopics(student.parentInfo.response_topics));
  }
  // 2. reported_topics (array)
  if (Array.isArray(student.parentInfo?.reported_topics)) {
    reportedTopics = reportedTopics.concat(student.parentInfo.reported_topics.map(String));
  }
  // 3. math_struggle_areas (string)
  if (student.parentInfo?.math_struggle_areas) {
    reportedTopics = reportedTopics.concat(splitReportedTopics(student.parentInfo.math_struggle_areas));
  }
  // 4. struggleAreas (legacy string)
  if (student.struggleAreas) {
    reportedTopics = reportedTopics.concat(splitReportedTopics(student.struggleAreas));
  }
  // 5. Add topics from topicConditioning if present
  if (student.topicConditioning && typeof student.topicConditioning === 'object') {
    const conditioningTopics = Object.values(student.topicConditioning?.topics || {})
      .map((t: any) => t?.topic)
      .filter(Boolean);
    reportedTopics = reportedTopics.concat(conditioningTopics);
  }
  // Deduplicate and clean
  reportedTopics = Array.from(new Set(reportedTopics.map(t => String(t).trim()).filter(Boolean)));

  const suggestedTopic = reportedTopics[0] || "Current class topic with highest friction";
  const suggestedSymptoms = symptomSignals.slice(0, 2);
  const topicConditioning = student.topicConditioning;

  // Prefer live session-derived topic states over the immutable proposal snapshot
  const persistedTopics: Record<string, any> =
    (student as any)?.conceptMastery?.topicConditioning?.topics &&
    typeof (student as any).conceptMastery.topicConditioning.topics === "object"
      ? (student as any).conceptMastery.topicConditioning.topics
      : {};

  // Merge activations with persisted topics
  const activationTopics = useMemo(() => {
    if (!activationsData?.activations) return [];
    const seen = new Set();
    return activationsData.activations.filter((a) => {
      if (!a.topic) return false;
      const t = String(a.topic).trim();
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    }).map((a) => ({ topic: a.topic, activatedAt: a.created_at }));
  }, [activationsData]);

  const explicitlyActivatedTopicNames = useMemo(
    () => new Set(activationTopics.map(({ topic }) => String(topic).trim())),
    [activationTopics]
  );

  // True if there are any persisted topics
  const hasPersistedTopics = Object.keys(persistedTopics).length > 0;

  // Fetch all sessions for this student
  const { data: allSessions } = useQuery({
    queryKey: ["/api/tutor/sessions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tutor/sessions");
      return res.json();
    },
    enabled: !!student.id,
  });

  // Filter sessions for this student
  const studentSessions = useMemo(
    () => (allSessions || []).filter((session) => session.studentId === student.id),
    [allSessions, student.id]
  );

  // Build topic list using shared buildTopics utility for accurate phase/stability, then merge in activation topics
  const allTopics = useMemo(() => {
    const baseTopics = buildTopics(
      reportedTopics.join(", ") || null,
      student.topicConditioning || null,
      persistedTopics,
      studentSessions
    );
    const baseTopicNames = new Set(baseTopics.map(t => t.topic));
    const merged = [...baseTopics];
    activationTopics.forEach(({ topic, activatedAt }) => {
      if (!baseTopicNames.has(topic)) {
        merged.push({
          topic,
          phase: "Clarity",
          stability: "Low",
          hasObservedState: false,
          lastUpdated: activatedAt || null,
          lastSession: activatedAt ? formatRelativeTime(new Date(activatedAt)) : "Activated",
          trend: "Stable",
          entryDiagnosis: "Activated by tutor.",
          recentLogs: [],
          timeline: [],
        });
      }
    });
    return merged;
  }, [persistedTopics, student.topicConditioning, reportedTopics, studentSessions, activationTopics]);

  const topicsInConditioning = useMemo(() => {
    const byTopic = new Map<string, { topic: string; phase: string; stability: string }>();

    allTopics.forEach((entry) => {
      const topic = String(entry?.topic || "").trim();
      if (!topic) return;
      byTopic.set(topic, {
        topic,
        phase: entry?.hasObservedState
          ? (normalizePhaseLabel(entry.phase) || "Structured Execution")
          : "Unknown",
        stability: entry?.hasObservedState
          ? (normalizeStabilityLabel(entry.stability) || "Low")
          : "Unknown",
      });
    });

    const proposalTopics = Object.values(student.topicConditioning?.topics || {}) as Array<any>;
    proposalTopics.forEach((entry) => {
      const topic = String(entry?.topic || "").trim();
      if (!topic) return;
      if (byTopic.has(topic)) return;
      byTopic.set(topic, {
        topic,
        phase: "Unknown",
        stability: "Unknown",
      });
    });

    return Array.from(byTopic.values());
  }, [allTopics, student.topicConditioning]);

  // Pick the most recently updated topic for display
  const latestEntry = allTopics
    .filter((entry: any) => entry?.topic && entry?.lastUpdated)
    .sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0] as any | undefined;

  const hasTopics = !!latestEntry;
  const displayTopic = (hasTopics
    ? normalizeTopicLabel(latestEntry.topic)
    : normalizeTopicLabel(topicConditioning?.topic)) || reportedTopics[0] || "Current class topic";
  const displayPhase = (hasTopics
    ? (latestEntry?.hasObservedState ? normalizePhaseLabel(latestEntry.phase) : "Unknown")
    : normalizePhaseLabel(topicConditioning?.entry_phase)) || "Structured Execution";
  const displayStability = (hasTopics
    ? (latestEntry?.hasObservedState ? normalizeStabilityLabel(latestEntry.stability) : "Unknown")
    : normalizeStabilityLabel(topicConditioning?.stability)) || "Low";

  const topicConditioningLastUpdatedRaw = hasTopics
    ? latestEntry.lastUpdated
    : topicConditioning?.lastUpdated || topicConditioning?.last_updated || null;
  const topicConditioningLastUpdated = topicConditioningLastUpdatedRaw
    ? new Date(topicConditioningLastUpdatedRaw)
    : null;
  const hasTopicConditioningTimestamp = !!(
    topicConditioningLastUpdated && !Number.isNaN(topicConditioningLastUpdated.getTime())
  );
  const workflowLabel = getWorkflowLabel(effectiveWorkflow);

  return (
    <div className="relative rounded-2xl border border-black/25 bg-background p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 tutor-pod-student-card">
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-black/55" />
        <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-black/55" />
        <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-black/55" />
        <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-black/55" />
      </div>
      <div className="tutor-pod-student-card-header pb-5 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0 w-full">
          <Avatar className="w-14 h-14 border border-primary/15 flex-shrink-0">
            <AvatarFallback className="bg-muted text-foreground font-semibold text-sm tracking-[0.04em]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="tutor-pod-student-card-header-name block text-lg font-semibold tracking-[-0.01em] min-w-0" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{student.name}</span>
              <div className="flex flex-row flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="tutor-pod-student-card-header-badge text-[10px] uppercase tracking-[0.08em] border-primary/20 text-muted-foreground">
                  {workflowLabel}
                </Badge>
                <div className="rounded-xl border border-primary/20 bg-muted/20 px-3 py-1 text-right tutor-pod-student-card-header-progress">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{progressLabel} </span>
                  <span className="ml-1 text-lg font-semibold tabular-nums text-foreground">{sessionProgress}/{progressTotal}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground mt-1">
              {student.grade || "Grade pending"}
            </div>
            {student.parentInfo && (
              <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <p className="text-muted-foreground">Parent: <span className="font-medium text-foreground">{student.parentInfo.parent_full_name}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5 break-all">{student.parentInfo.parent_email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-5">
        {workflow?.proposalAccepted && (
          <div className="space-y-3">
            <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Program Progress</p>
              <p className="mt-2 text-2xl font-semibold text-foreground tabular-nums">{sessionProgress} of {progressTotal}</p>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min((sessionProgress / progressTotal) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {sessionsRemaining} sessions remaining
            </p>
            {/* --- END TOPIC SUMMARY ROW --- */}
          </div>
        )}

        {workflowLoading && <p className="text-xs text-muted-foreground">Loading workflow...</p>}

        {workflow?.proposalAccepted && topicsInConditioning.length > 0 && (
          <>

            <div className="pt-4 border-t border-border/60 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Topics In Conditioning</p>
            {topicsInConditioning.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {topicsInConditioning.map((topic) => (
                  <div key={topic.topic} className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{topic.topic}</p>
                    <div className="flex flex-row items-center gap-2 mt-2">
                      <span className="text-sm font-medium text-foreground">{topic.phase}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-primary/20 bg-muted/40 text-foreground">{topic.stability}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {hasTopicConditioningTimestamp && (
              <p
                className="text-xs text-muted-foreground"
                title={`Last updated ${topicConditioningLastUpdated?.toLocaleDateString()} at ${topicConditioningLastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              >
                Updated {formatRelativeTime(topicConditioningLastUpdated)}
              </p>
            )}
          </div>
          </>
        )}


        {effectiveWorkflow && !effectiveWorkflow.assignmentAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              New parent assignment received. Accept or decline this assignment before intro booking can begin.
            </p>
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => setAssignmentModalOpen(true)}
              disabled={respondToAssignment.isPending}
            >
              Review Assignment
            </Button>
            {respondToAssignment.isError && (
              <p className="text-xs text-red-600 text-center">
                {respondToAssignment.error instanceof Error
                  ? respondToAssignment.error.message
                  : "Failed to submit assignment decision"}
              </p>
            )}
          </div>
        )}

        {effectiveWorkflow?.assignmentAccepted && !effectiveWorkflow.introConfirmed && (
          <TutorIntroSessionActions
            studentId={student.id}
            parentId={student.parentInfo?.parent_id}
            tutorId={student.tutor_id}
          />
        )}


        {effectiveWorkflow?.assignmentAccepted && effectiveWorkflow?.introConfirmed && !effectiveWorkflow.introCompleted && (
          <IntroDiagnosticTopicSection
            student={student}
            reportedTopics={reportedTopics}
            symptomSignals={symptomSignals}
            suggestedTopic={suggestedTopic}
            suggestedSymptoms={suggestedSymptoms}
          />
        )}


        {effectiveWorkflow?.assignmentAccepted && effectiveWorkflow?.introCompleted && !effectiveWorkflow.proposalSent && !effectiveWorkflow?.proposalAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-3">
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setProposalOpen(true);
              }}
            >
              Create & Send Proposal
            </Button>
          </div>
        )}

        {effectiveWorkflow?.assignmentAccepted && effectiveWorkflow?.proposalSent && !effectiveWorkflow.proposalAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Proposal sent. Waiting for parent acceptance to unlock systems.
            </p>
          </div>
        )}

        {workflow?.proposalAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Systems</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSelectedStudentName(student.name);
                  setTopicConditioningDialogOpen(true);
                }}
              >
                Topic Conditioning
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSelectedStudentName(student.name);
                  setTrackingDialogOpen(true);
                }}
              >
                View Tracking Systems
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Parent Assignment</DialogTitle>
            <DialogDescription>
              You can accept this assignment to start onboarding, or decline it so the parent can be rematched.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Student: {student.name}</p>
            <p className="text-muted-foreground mt-1">Parent: {student.parentInfo?.parent_full_name || "Unknown"}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                respondToAssignment.mutate("decline", {
                  onSuccess: () => setAssignmentModalOpen(false),
                });
              }}
              disabled={respondToAssignment.isPending}
            >
              {respondToAssignment.isPending ? "Saving..." : "Decline Assignment"}
            </Button>
            <Button
              onClick={() => {
                respondToAssignment.mutate("accept", {
                  onSuccess: () => setAssignmentModalOpen(false),
                });
              }}
              disabled={respondToAssignment.isPending}
            >
              {respondToAssignment.isPending ? "Saving..." : "Accept Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntroDiagnosticTopicSection({
  student,
  reportedTopics,
  symptomSignals,
  suggestedTopic,
  suggestedSymptoms,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [diagnosticTopic, setDiagnosticTopic] = useState("");
  const [activationError, setActivationError] = useState("");
  const [activatedTopic, setActivatedTopic] = useState<string | null>(null);

  const storageKey = `intro-diagnostic-topic:${student.id}`;

  useEffect(() => {
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored) {
      setActivatedTopic(stored);
    }
  }, [storageKey]);

  const handleActivate = () => {
    setActivationError("");
    const nextTopic = diagnosticTopic.trim();
    if (!nextTopic) {
      setActivationError("Please enter a topic name to continue.");
      return;
    }
    window.sessionStorage.setItem(storageKey, nextTopic);
    setActivatedTopic(nextTopic);
    setDiagnosticTopic("");
    setDialogOpen(false);
  };

  if (!activatedTopic) {
    return (
      <div className="pt-4 border-t border-border/60 space-y-2">
        <div className="space-y-3 mb-2">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Pre-Session Intelligence</p>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
            <p className="text-[11px] font-medium text-foreground">Parent-Reported Topics</p>
            {reportedTopics.length > 0 ? (
              <ul className="text-xs text-muted-foreground space-y-1">
                {reportedTopics.slice(0, 4).map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No specific topics listed by parent.</p>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
            <p className="text-[11px] font-medium text-foreground">Parent-Observed Symptoms</p>
            {symptomSignals.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {symptomSignals.map((symptom) => (
                  <Badge key={symptom} variant="outline" className="text-[10px] border-primary/20 bg-background/70 text-foreground">
                    {symptom}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No explicit symptom keywords found. Observe freeze, rush, guess, avoid, and early help-seeking.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-primary/20 bg-muted/20 p-3 space-y-1">
            <p className="text-[11px] font-semibold text-foreground">Diagnostic Focus Suggestion</p>
            <p className="text-xs text-muted-foreground">Start with: <span className="text-foreground font-medium">{suggestedTopic}</span></p>
            <p className="text-xs text-muted-foreground">
              Watch for: <span className="text-foreground font-medium">{suggestedSymptoms.length > 0 ? suggestedSymptoms.join(" + ") : "Freezing + early help-seeking"}</span>
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          Add Diagnostic Topic
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Diagnostic Topic</DialogTitle>
              <DialogDescription>
                Enter the topic you will run the intro drill on. This is required before opening the intro session.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={diagnosticTopic}
              onChange={(e) => setDiagnosticTopic(e.target.value)}
              placeholder="e.g. Linear equations"
            />
            {activationError ? <p className="text-xs text-red-500 mt-1">{activationError}</p> : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleActivate}>Use This Topic</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Intro drill topic selection is required and is only used for intro diagnosis.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-border/60 space-y-2">
      <Button
        className="w-full"
        variant="default"
        size="sm"
        onClick={() => {
          const topicParam = encodeURIComponent(activatedTopic);
          window.location.href = `/tutor/intro-session/${student.id}?topic=${topicParam}`;
        }}
      >
        Open Session
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Intro Diagnostic Topic: <span className="font-semibold text-foreground">{activatedTopic}</span>
      </p>
      <Button
        className="w-full"
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
      >
        Change Diagnostic Topic
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Diagnostic Topic</DialogTitle>
            <DialogDescription>
              Update the intro-only diagnostic topic. This does not formally activate a training topic.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={diagnosticTopic}
            onChange={(e) => setDiagnosticTopic(e.target.value)}
            placeholder="e.g. Linear equations"
          />
          {activationError ? <p className="text-xs text-red-500 mt-1">{activationError}</p> : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleActivate}>Save Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-xs text-muted-foreground text-center">
        Launch the structured Intro Session drill. Scoring and next actions remain system-driven.
      </p>
    </div>
  );
}
