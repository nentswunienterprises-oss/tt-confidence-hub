import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import { buildTopics } from "./topicUtils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useStudentWorkflowState, useMarkHandoverCompleted, useRespondToAssignment } from "@/hooks/useStudentWorkflowState";
import { TutorIntroSessionActions } from "./TutorIntroSessionActions";
import { useScheduledSession } from "@/hooks/useScheduledSession";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  buildStartingPhaseRationale,
  deriveResponseSignalScores,
  getResponseSymptomLabels,
  normalizeResponseSymptoms,
  recommendStartingPhaseFromSymptoms,
} from "@shared/responseSymptomMapping";

function splitReportedTopics(rawValue) {
  const ignoredContexts = new Set([
    "word problems",
    "tests",
    "timed work",
    "new topics",
    "careless errors",
  ]);
  if (!rawValue || typeof rawValue !== "string") return [];
  return rawValue
    .split(/[,\n;|]+/)
    .map((part) => part.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean)
    .filter((part) => !ignoredContexts.has(part.toLowerCase()));
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

function normalizeTopicKey(rawValue) {
  const normalized = normalizeTopicLabel(rawValue);
  return normalized ? normalized.toLowerCase() : null;
}

function getTopicMapValue(source, topic) {
  if (!source || typeof source !== "object") return null;
  const normalizedTopic = normalizeTopicKey(topic);
  if (!normalizedTopic) return null;

  const matchedEntry = Object.entries(source).find(
    ([key]) => normalizeTopicKey(key) === normalizedTopic
  );

  return matchedEntry ? matchedEntry[1] : null;
}

function trimRationaleSignals(rawValue) {
  return String(rawValue || "")
    .replace(/\s*Most relevant signals:\s*[\s\S]*$/i, "")
    .trim();
}

function scoreTone(score) {
  if (score >= 6) return "text-red-700 border-red-200 bg-red-50";
  if (score >= 3) return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-slate-600 border-slate-200 bg-slate-50";
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
  if (workflow.handoverVerificationRequired && !workflow.handoverCompleted) {
    return workflow.handoverSessionConfirmed ? "Continuity Check Booked" : "Continuity Check";
  }
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
  operationalMode = "training",
  setSelectedStudentId,
  setSelectedStudentName,
  setIdentitySheetOpen,
  setTrackingDialogOpen,
  setAssignmentsDialogOpen,
  setProposalOpen,
  setTopicConditioningDialogOpen,
  setReportsDialogOpen,
  setCommunicationDialogOpen,
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
  const markHandoverCompleted = useMarkHandoverCompleted(student.id);
  const respondToAssignment = useRespondToAssignment(student.id, student.parentInfo?.id || null);
  const { data: introSessionDetails } = useScheduledSession(student.id);

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

  const { data: communicationUnreadData } = useQuery({
    queryKey: ["/api/tutor/students", student.id, "communications", "unread-count"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/tutor/students/${student.id}/communications/unread-count`
      );
      return res.json();
    },
    enabled: !!student.id && !!workflow?.proposalAccepted,
    refetchInterval: 30000,
  });

  const communicationUnreadCount = Number(communicationUnreadData?.unreadCount || 0);


  const reportedSymptoms =
    (Array.isArray(student.parentInfo?.response_symptoms) ? student.parentInfo.response_symptoms : []).filter(Boolean)
      .map((symptom) => String(symptom).trim())
      .filter(Boolean);
  const topicResponseSymptomsRaw =
    student.parentInfo?.topic_response_symptoms && typeof student.parentInfo.topic_response_symptoms === "object"
      ? student.parentInfo.topic_response_symptoms
      : {};
  const topicRecommendedStartingPhasesRaw =
    student.parentInfo?.topic_recommended_starting_phases && typeof student.parentInfo.topic_recommended_starting_phases === "object"
      ? student.parentInfo.topic_recommended_starting_phases
      : {};
  const topicResponseSignalScoresRaw =
    student.parentInfo?.topic_response_signal_scores && typeof student.parentInfo.topic_response_signal_scores === "object"
      ? student.parentInfo.topic_response_signal_scores
      : {};

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

  const topicIntelligence = reportedTopics.map((topic) => {
    const topicSymptomsSource = getTopicMapValue(topicResponseSymptomsRaw, topic);
    const topicSymptomIdsSource = getTopicMapValue(student.parentInfo?.topic_response_symptom_ids, topic);
    const topicSymptomIds = normalizeResponseSymptoms(topicSymptomIdsSource);
    const topicSymptoms = Array.isArray(topicSymptomsSource)
      ? (topicSymptomsSource as unknown[]).map((symptom) => String(symptom).trim()).filter(Boolean)
      : topicSymptomIds.length > 0
        ? getResponseSymptomLabels(topicSymptomIds)
        : [];
    const recommendedTopicData = getTopicMapValue(topicRecommendedStartingPhasesRaw, topic);
    const topicScoresRaw = getTopicMapValue(topicResponseSignalScoresRaw, topic) || {};
    const computedRecommendation = recommendStartingPhaseFromSymptoms(topicSymptomIds);
    const computedScores = deriveResponseSignalScores(topicSymptomIds);
    const recommendedPhase =
      normalizePhaseLabel((recommendedTopicData as any)?.phase) ||
      (topicSymptomIds.length > 0 ? computedRecommendation.phase : "Clarity");
    const recommendedReason =
      String((recommendedTopicData as any)?.rationale || "").trim() ||
      (topicSymptomIds.length > 0
        ? buildStartingPhaseRationale(computedRecommendation.phase, computedRecommendation.supportingSymptoms)
        : "Use parent-reported response patterns as the starting hypothesis, then verify performance through adaptive diagnosis.");
    const responseSignalBreakdown = [
      { phase: "Clarity", score: Number((topicScoresRaw as any).Clarity ?? computedScores.Clarity ?? 0) },
      { phase: "Structured Execution", score: Number((topicScoresRaw as any)["Structured Execution"] ?? computedScores["Structured Execution"] ?? 0) },
      { phase: "Controlled Discomfort", score: Number((topicScoresRaw as any)["Controlled Discomfort"] ?? computedScores["Controlled Discomfort"] ?? 0) },
      { phase: "Time Pressure Stability", score: Number((topicScoresRaw as any)["Time Pressure Stability"] ?? computedScores["Time Pressure Stability"] ?? 0) },
    ];
    const rankedResponseSignals = [...responseSignalBreakdown].sort((a, b) => b.score - a.score);
    const secondarySignal = rankedResponseSignals.find((entry) => entry.phase !== recommendedPhase && entry.score > 0) || null;

    return {
      topic,
      symptoms: topicSymptoms,
      recommendedStartingPhase: recommendedPhase,
      recommendedStartingReason: recommendedReason,
      responseSignalBreakdown,
      secondarySignal,
    };
  });
  const fallbackRecommendedStartingPhase = normalizePhaseLabel(student.parentInfo?.recommended_starting_phase) || "Clarity";
  const fallbackRecommendedStartingReason =
    String(student.parentInfo?.recommended_starting_reason || "").trim() ||
    "Use parent-reported response patterns as the starting hypothesis, then verify performance through adaptive diagnosis.";
  const fallbackResponseSignalScoresRaw =
    student.parentInfo?.response_signal_scores && typeof student.parentInfo.response_signal_scores === "object"
      ? student.parentInfo.response_signal_scores
      : {};
  const fallbackResponseSignalBreakdown = [
    { phase: "Clarity", score: Number(fallbackResponseSignalScoresRaw.Clarity || 0) },
    { phase: "Structured Execution", score: Number(fallbackResponseSignalScoresRaw["Structured Execution"] || 0) },
    { phase: "Controlled Discomfort", score: Number(fallbackResponseSignalScoresRaw["Controlled Discomfort"] || 0) },
    { phase: "Time Pressure Stability", score: Number(fallbackResponseSignalScoresRaw["Time Pressure Stability"] || 0) },
  ];
  const fallbackSecondarySignal = [...fallbackResponseSignalBreakdown]
    .sort((a, b) => b.score - a.score)
    .find((entry) => entry.phase !== fallbackRecommendedStartingPhase && entry.score > 0) || null;
  const primaryTopicIntelligence = topicIntelligence[0] || null;
  const suggestedTopic = primaryTopicIntelligence?.topic || reportedTopics[0] || "Current class topic with highest friction";
  const suggestedSymptoms = primaryTopicIntelligence?.symptoms || symptomSignals.slice(0, 2);
  const recommendedStartingPhase = primaryTopicIntelligence?.recommendedStartingPhase || fallbackRecommendedStartingPhase;
  const recommendedStartingReason = primaryTopicIntelligence?.recommendedStartingReason || fallbackRecommendedStartingReason;
  const responseSignalBreakdown = primaryTopicIntelligence?.responseSignalBreakdown || fallbackResponseSignalBreakdown;
  const secondarySignal = primaryTopicIntelligence?.secondarySignal || fallbackSecondarySignal;
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
      const topic = normalizeTopicLabel(entry?.topic);
      const topicKey = normalizeTopicKey(entry?.topic);
      if (!topic || !topicKey) return;

      const normalizedEntry = {
        topic,
        phase: entry?.hasObservedState
          ? (normalizePhaseLabel(entry.phase) || "Structured Execution")
          : "Unknown",
        stability: entry?.hasObservedState
          ? (normalizeStabilityLabel(entry.stability) || "Low")
          : "Unknown",
      };

      const existing = byTopic.get(topicKey);
      const nextHasObservedState = normalizedEntry.phase !== "Unknown" || normalizedEntry.stability !== "Unknown";
      const existingHasObservedState = existing
        ? existing.phase !== "Unknown" || existing.stability !== "Unknown"
        : false;

      if (!existing || (nextHasObservedState && !existingHasObservedState)) {
        byTopic.set(topicKey, normalizedEntry);
      }
    });

    const proposalTopics = Object.values(student.topicConditioning?.topics || {}) as Array<any>;
    proposalTopics.forEach((entry) => {
      const topic = normalizeTopicLabel(entry?.topic);
      const topicKey = normalizeTopicKey(entry?.topic);
      if (!topic || !topicKey) return;
      if (byTopic.has(topicKey)) return;
      byTopic.set(topicKey, {
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
  const handoverVerificationActive = Boolean(
    effectiveWorkflow?.handoverVerificationRequired && !effectiveWorkflow?.handoverCompleted
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
                    <div className="mt-2 flex flex-wrap items-start gap-2">
                      <span className="min-w-0 text-sm font-medium leading-5 text-foreground">{topic.phase}</span>
                      <span className="shrink-0 whitespace-nowrap text-xs px-2 py-0.5 rounded-full border border-primary/20 bg-muted/40 text-foreground">
                        {topic.stability}
                      </span>
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

        {handoverVerificationActive && (
          <HandoverVerificationSection
            studentId={student.id}
            studentName={student.name}
            session={introSessionDetails}
            displayTopic={displayTopic}
            displayPhase={displayPhase}
            displayStability={displayStability}
            recommendedStartingPhase={recommendedStartingPhase}
            recommendedStartingReason={recommendedStartingReason}
            onMarkCompleted={() => markHandoverCompleted.mutate()}
            isMarkingCompleted={markHandoverCompleted.isPending}
            completionError={
              markHandoverCompleted.isError
                ? markHandoverCompleted.error instanceof Error
                  ? markHandoverCompleted.error.message
                  : "Failed to mark continuity check complete"
                : ""
            }
          />
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

        {effectiveWorkflow?.assignmentAccepted && operationalMode !== "training" && !effectiveWorkflow.introConfirmed && (
          <TutorIntroSessionActions
            studentId={student.id}
            parentId={student.parentInfo?.parent_id}
            tutorId={student.tutor_id}
          />
        )}

        {effectiveWorkflow?.assignmentAccepted && handoverVerificationActive && (
          <TutorIntroSessionActions
            studentId={student.id}
            parentId={student.parentInfo?.parent_id}
            tutorId={student.tutor_id}
            sessionLabelOverride="continuity check"
          />
        )}

        {!handoverVerificationActive && effectiveWorkflow?.assignmentAccepted && (operationalMode === "training" || effectiveWorkflow?.introConfirmed) && !effectiveWorkflow.introCompleted && (
          <IntroDiagnosticTopicSection
            student={student}
            introSession={introSessionDetails}
            operationalMode={operationalMode}
            reportedTopics={reportedTopics}
            symptomSignals={symptomSignals}
            topicIntelligence={topicIntelligence}
            suggestedTopic={suggestedTopic}
            suggestedSymptoms={suggestedSymptoms}
            responseSignalBreakdown={responseSignalBreakdown}
            recommendedStartingPhase={recommendedStartingPhase}
            recommendedStartingReason={recommendedStartingReason}
            secondarySignal={secondarySignal}
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

        {workflow?.proposalAccepted && !handoverVerificationActive && (
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
                Tracking Systems
              </Button>
              <Button
                className="w-full sm:col-span-2"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSelectedStudentName(student.name);
                  setCommunicationDialogOpen(true);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <span>Communication</span>
                  {communicationUnreadCount > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {communicationUnreadCount}
                    </span>
                  ) : null}
                </span>
              </Button>
            </div>
          </div>
        )}

        {workflow?.proposalAccepted && handoverVerificationActive && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Core training systems stay gated until the continuity check is completed. This keeps inherited topic-state intact while the new tutor verifies where work should resume.
            </p>
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

function HandoverVerificationSection({
  studentId,
  studentName,
  session,
  displayTopic,
  displayPhase,
  displayStability,
  recommendedStartingPhase,
  recommendedStartingReason,
  onMarkCompleted,
  isMarkingCompleted,
  completionError,
}) {
  const sessionStatus = String(session?.status || "");
  const sessionConfirmed = ["confirmed", "ready", "live", "scheduled", "completed"].includes(sessionStatus);
  const sessionLabel = session?.type === "handover" ? "continuity check" : "handover verification";
  const latestVerification = session?.latestHandoverVerification || null;
  const latestSummary = latestVerification?.summary || null;
  const reDiagnosisRequired = !!latestSummary?.reDiagnosisRequired;
  const canMarkComplete = sessionConfirmed && !!latestSummary && !reDiagnosisRequired;

  return (
    <div className="pt-4 border-t border-border/60 space-y-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Tutor Handover Verification</p>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-2">
        <p className="text-sm font-semibold text-blue-950">Inherited training state is active for {studentName}.</p>
        <p className="text-xs text-blue-900">
          This student is not being re-onboarded. Use the continuity check to verify the carry-over topic-state before resuming standard training actions.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 space-y-2">
        <p className="text-[11px] font-medium text-foreground">Carry-Over State</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-lg border border-primary/15 bg-background/80 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Topic</p>
            <p className="mt-1 text-sm font-medium text-foreground">{displayTopic}</p>
          </div>
          <div className="rounded-lg border border-primary/15 bg-background/80 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Phase</p>
            <p className="mt-1 text-sm font-medium text-foreground">{displayPhase}</p>
          </div>
          <div className="rounded-lg border border-primary/15 bg-background/80 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Stability</p>
            <p className="mt-1 text-sm font-medium text-foreground">{displayStability}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 space-y-1">
        <p className="text-[11px] font-semibold text-foreground">System Watchpoint</p>
        <p className="text-xs text-muted-foreground">
          Re-enter verification around <span className="font-medium text-foreground">{recommendedStartingPhase}</span>.
        </p>
        <p className="text-xs text-muted-foreground">{recommendedStartingReason}</p>
      </div>

      {session?.scheduled_time ? (
        <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Scheduled {sessionLabel}</p>
          <p className="text-sm text-foreground">{new Date(session.scheduled_time).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Status: {sessionStatus || "pending"}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">Waiting for parent schedule proposal.</p>
          <p className="mt-1 text-xs text-amber-800">
            Once the parent proposes a time, confirm or adjust it here just like an intro booking.
          </p>
        </div>
      )}

      {latestSummary ? (
        <div className={`rounded-xl border px-4 py-3 space-y-2 ${reDiagnosisRequired ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <p className="text-[11px] font-semibold text-foreground">Latest Handover Result</p>
          <p className="text-sm font-medium text-foreground">{latestSummary.verificationOutcomeLabel || "Verification submitted"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-primary/15 bg-background/80 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Score</p>
              <p className="mt-1 text-sm font-medium text-foreground">{latestSummary.verificationScore ?? "-"}/100</p>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/80 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Resulting Phase</p>
              <p className="mt-1 text-sm font-medium text-foreground">{latestSummary.resultingPhase || "-"}</p>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/80 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Resulting Stability</p>
              <p className="mt-1 text-sm font-medium text-foreground">{latestSummary.resultingStability || "-"}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{latestSummary.nextAction || "No next action recorded."}</p>
          {latestSummary.constraint ? (
            <p className="text-xs text-muted-foreground">Constraint: <span className="font-medium text-foreground">{latestSummary.constraint}</span></p>
          ) : null}
        </div>
      ) : null}

      {sessionConfirmed && (
        <div className="space-y-2">
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => {
              const topicParam = encodeURIComponent(displayTopic);
              const phaseParam = `&phase=${encodeURIComponent(displayPhase)}`;
              const stabilityParam = `&stability=${encodeURIComponent(displayStability)}`;
              const sessionParam = session?.id
                ? `&scheduledSessionId=${encodeURIComponent(session.id)}`
                : "";
              window.location.href = `/tutor/intro-session/${studentId}?mode=handover&topic=${topicParam}${phaseParam}${stabilityParam}${sessionParam}`;
            }}
            disabled={!session?.id}
          >
            Open Handover Verification
          </Button>
          {reDiagnosisRequired ? (
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                const topicParam = encodeURIComponent(latestVerification?.topic || displayTopic);
                const phaseParam = `&phase=${encodeURIComponent(latestSummary?.resultingPhase || latestSummary?.phase || displayPhase)}`;
                const stabilityParam = `&stability=${encodeURIComponent(latestSummary?.resultingStability || latestSummary?.previousStability || displayStability)}`;
                const sessionParam = session?.id
                  ? `&scheduledSessionId=${encodeURIComponent(session.id)}`
                  : "";
                window.location.href = `/tutor/intro-session/${studentId}?mode=handover&rediagnosis=1&topic=${topicParam}${phaseParam}${stabilityParam}${sessionParam}`;
              }}
              disabled={!session?.id}
            >
              Open Targeted Re-Diagnosis
            </Button>
          ) : null}
          <Button
            className="w-full"
            variant="default"
            size="sm"
            onClick={onMarkCompleted}
            disabled={isMarkingCompleted || !canMarkComplete}
          >
            {isMarkingCompleted ? "Saving..." : "Mark Continuity Check Complete"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {reDiagnosisRequired
              ? "Targeted re-diagnosis is required before continuity check can be completed."
              : "Submit a clean handover result, then mark continuity check complete to clear the handover gate."}
          </p>
        </div>
      )}

      {completionError ? (
        <p className="text-xs text-red-600 text-center">{completionError}</p>
      ) : null}
    </div>
  );
}

function IntroDiagnosticTopicSection({
  student,
  introSession,
  operationalMode = "training",
  reportedTopics,
  symptomSignals,
  topicIntelligence,
  suggestedTopic,
  suggestedSymptoms,
  responseSignalBreakdown,
  recommendedStartingPhase,
  recommendedStartingReason,
  secondarySignal,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [diagnosticTopic, setDiagnosticTopic] = useState("");
  const [activationError, setActivationError] = useState("");
  const [activatedTopic, setActivatedTopic] = useState<string | null>(null);
  const [showResponseSignalBreakdown, setShowResponseSignalBreakdown] = useState(false);

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

          {topicIntelligence.length > 0 ? (
            <div className="space-y-3">
              {topicIntelligence.map((entry) => (
                <div key={entry.topic} className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-foreground">{entry.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      Start adaptive diagnosis at <span className="text-foreground font-medium">{entry.recommendedStartingPhase}</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">{trimRationaleSignals(entry.recommendedStartingReason)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Parent-Observed Symptoms</p>
                    {entry.symptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.symptoms.map((symptom) => (
                          <Badge
                            key={`${entry.topic}-${symptom}`}
                            variant="outline"
                            className="max-w-full whitespace-normal break-words text-left leading-snug text-[10px] border-primary/20 bg-background/70 text-foreground"
                          >
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No topic-specific symptom mapping was captured for this topic.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
            <p className="text-[11px] font-medium text-foreground">Parent-Observed Symptoms</p>
            {topicIntelligence.length > 0 ? (
              <div className="space-y-2">
                {topicIntelligence.slice(0, 4).map((entry) => (
                  <div key={entry.topic} className="rounded-lg border border-primary/10 bg-background/70 p-2.5 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground">
                      {entry.topic}
                    </p>
                    {entry.symptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.symptoms.map((symptom) => (
                          <Badge
                            key={`${entry.topic}-${symptom}`}
                            variant="outline"
                            className="max-w-full whitespace-normal break-words text-left leading-snug text-[10px] border-primary/20 bg-background/70 text-foreground"
                          >
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No topic-specific symptoms selected. Verify this topic live during diagnosis.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : symptomSignals.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {symptomSignals.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant="outline"
                    className="max-w-full whitespace-normal break-words text-left leading-snug text-[10px] border-primary/20 bg-background/70 text-foreground"
                  >
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
          )}

          <div className="rounded-xl border border-primary/20 bg-muted/20 p-3 space-y-1">
            <p className="text-[11px] font-semibold text-foreground">Diagnostic Focus Suggestion</p>
            <p className="text-xs text-muted-foreground">Start with: <span className="text-foreground font-medium">{suggestedTopic}</span></p>
            <p className="text-xs text-muted-foreground">
              Watch for: <span className="text-foreground font-medium">
                {suggestedSymptoms.length > 0
                  ? `the parent-observed symptoms listed above for ${suggestedTopic}`
                  : "freezing and early help-seeking during live diagnosis"}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
            <p className="text-[11px] font-semibold text-foreground">System-Recommended Starting Phase</p>
            <p className="text-xs text-muted-foreground">
              Start adaptive diagnosis at: <span className="text-foreground font-medium">{recommendedStartingPhase}</span>
            </p>
            <p className="text-xs text-muted-foreground">{trimRationaleSignals(recommendedStartingReason)}</p>
            {secondarySignal ? (
              <p className="text-xs text-muted-foreground">
                Secondary watchpoint: <span className="text-foreground font-medium">{secondarySignal.phase}</span>
              </p>
            ) : null}
            <div className="rounded-lg border border-primary/15 bg-background/80 p-2.5 space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => setShowResponseSignalBreakdown((current) => !current)}
              >
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Response Signal Breakdown</p>
                {showResponseSignalBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showResponseSignalBreakdown ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {responseSignalBreakdown.map(({ phase, score }) => (
                    <div
                      key={phase}
                      className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-[11px] ${scoreTone(score)}`}
                    >
                      <span className="font-medium">{phase}</span>
                      <span className="tabular-nums">{score}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/80 p-2.5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Tutor Launch Rule</p>
              <p className="mt-1 text-xs text-foreground">
                Start at <span className="font-medium">{recommendedStartingPhase}</span>, but let adaptive diagnosis verify it. Do not treat this recommendation as final placement.
              </p>
            </div>
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
      {operationalMode !== "training" && introSession?.scheduled_time ? (
        <div className="rounded-xl border border-primary/20 bg-muted/20 p-3 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Scheduled Intro Lesson</p>
          <p className="text-sm text-foreground">
            {new Date(introSession.scheduled_time).toLocaleString()}
          </p>
        </div>
      ) : null}
      <Button
        className="w-full"
        variant="default"
        size="sm"
        onClick={() => {
          const topicParam = encodeURIComponent(activatedTopic);
          const phaseParam = `&phase=${encodeURIComponent(recommendedStartingPhase)}`;
          const sessionParam =
            operationalMode === "training"
              ? ""
              : introSession?.id
                ? `&scheduledSessionId=${encodeURIComponent(introSession.id)}`
                : "";
          window.location.href = `/tutor/intro-session/${student.id}?topic=${topicParam}${phaseParam}${sessionParam}`;
        }}
        disabled={
          operationalMode === "training"
            ? false
            : !introSession?.id || !["confirmed", "ready", "live", "scheduled"].includes(String(introSession?.status || ""))
        }
      >
        Open Intro Drill
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Intro Diagnostic Topic: <span className="font-semibold text-foreground">{activatedTopic}</span>
      </p>
      {operationalMode !== "training" && (!introSession?.id || !["confirmed", "ready", "live", "scheduled"].includes(String(introSession?.status || ""))) ? (
        <p className="text-xs text-amber-700 text-center">
          Confirm the intro lesson before entering the drill runner.
        </p>
      ) : null}
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
        {operationalMode === "training"
          ? "Training mode is active. Launch the intro drill directly without waiting for a booked lesson window."
          : `Launch the adaptive Intro Session diagnosis starting at ${recommendedStartingPhase}. Scoring and next actions remain system-driven.`}
      </p>
    </div>
  );
}
