import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useStudentWorkflowState, useMarkIntroCompleted, useRespondToAssignment } from "@/hooks/useStudentWorkflowState";
import { TutorIntroSessionActions } from "./TutorIntroSessionActions";

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
  const sessionProgress = student.sessionProgress || 0;
  // Determine onboarding type (pilot or commercial) from parentInfo if available
  const onboardingType = student.parentInfo?.onboarding_type || 'commercial';
  let progressLabel = 'Program Progress';
  let progressTotal = 8;
  if (onboardingType === 'pilot') {
    progressLabel = 'Trial Progress';
    progressTotal = 9;
  }
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { data: workflow, isLoading: workflowLoading } = useStudentWorkflowState(student.id);
  const markIntroCompleted = useMarkIntroCompleted(student.id);
  const respondToAssignment = useRespondToAssignment(student.id);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

  const explicitReportedTopics = (Array.isArray(student.parentInfo?.reported_topics) ? student.parentInfo.reported_topics : [])
    .filter(Boolean)
    .map((topic) => String(topic).trim())
    .filter(Boolean);
  const fallbackReportedTopics = splitReportedTopics(student.parentInfo?.math_struggle_areas);
  const reportedTopics = explicitReportedTopics.length > 0 ? explicitReportedTopics : fallbackReportedTopics;

  const inferredSymptoms = inferReportedSymptoms({
    struggleAreas: student.parentInfo?.math_struggle_areas,
    parentMotivation: student.parentInfo?.parent_motivation,
  });
  const reportedSymptoms =
    (Array.isArray(student.parentInfo?.response_symptoms) ? student.parentInfo.response_symptoms : []).filter(Boolean)
      .map((symptom) => String(symptom).trim())
      .filter(Boolean);
  const symptomSignals = reportedSymptoms.length > 0 ? reportedSymptoms : inferredSymptoms;

  const suggestedTopic = reportedTopics[0] || "Current class topic with highest friction";
  const suggestedSymptoms = symptomSignals.slice(0, 2);
  const topicConditioning = student.topicConditioning;

  // Prefer live session-derived topic states over the immutable proposal snapshot
  const persistedTopics: Record<string, any> =
    (student as any)?.conceptMastery?.topicConditioning?.topics &&
    typeof (student as any).conceptMastery.topicConditioning.topics === "object"
      ? (student as any).conceptMastery.topicConditioning.topics
      : {};

  // Find the most-recently-updated topic entry from session logs
  const latestPersistedEntry = Object.values(persistedTopics)
    .filter((entry: any) => entry?.topic && entry?.lastUpdated)
    .sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0] as any | undefined;

  const hasPersistedTopics = !!latestPersistedEntry;

  const displayTopic = (hasPersistedTopics
    ? normalizeTopicLabel(latestPersistedEntry.topic)
    : normalizeTopicLabel(topicConditioning?.topic)) || reportedTopics[0] || "Current class topic";
  const displayPhase = (hasPersistedTopics
    ? normalizePhaseLabel(latestPersistedEntry.phase)
    : normalizePhaseLabel(topicConditioning?.entry_phase)) || "Structured Execution";
  const displayStability = (hasPersistedTopics
    ? normalizeStabilityLabel(latestPersistedEntry.stability)
    : normalizeStabilityLabel(topicConditioning?.stability)) || "Low";

  const topicConditioningLastUpdatedRaw = hasPersistedTopics
    ? latestPersistedEntry.lastUpdated
    : topicConditioning?.lastUpdated || topicConditioning?.last_updated || null;
  const topicConditioningLastUpdated = topicConditioningLastUpdatedRaw
    ? new Date(topicConditioningLastUpdatedRaw)
    : null;
  const hasTopicConditioningTimestamp = !!(
    topicConditioningLastUpdated && !Number.isNaN(topicConditioningLastUpdated.getTime())
  );
  const workflowLabel = getWorkflowLabel(workflow);

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
            <div className="flex flex-col items-start mt-2">
              <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground text-left pl-0 sm:pl-0 w-full" style={{paddingLeft: 0}}>
                {student.grade || "Grade pending"}
              </div>
              {student.parentInfo && (
                <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-left w-full" style={{paddingLeft: 0}}>
                  <p className="text-muted-foreground">Parent: <span className="font-medium text-foreground">{student.parentInfo.parent_full_name}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5 break-all">{student.parentInfo.parent_email}</p>
                </div>
              )}
            </div>
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
              {Math.max(0, progressTotal - sessionProgress)} sessions remaining
            </p>
          </div>
        )}

        {workflowLoading && <p className="text-xs text-muted-foreground">Loading workflow...</p>}

        {(topicConditioning || hasPersistedTopics || reportedTopics.length > 0) && (
          <div className="pt-4 border-t border-border/60 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Topic Conditioning</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Topic</p>
                <p className="mt-2 text-sm font-medium text-foreground break-words">{displayTopic}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Topic Phase</p>
                <p className="mt-2 text-sm font-medium text-foreground break-words">{displayPhase}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Stability</p>
                <p className="mt-2 text-sm font-medium text-foreground">{displayStability}</p>
              </div>
            </div>
            {hasTopicConditioningTimestamp && (
              <p
                className="text-xs text-muted-foreground"
                title={`Last updated ${topicConditioningLastUpdated?.toLocaleDateString()} at ${topicConditioningLastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              >
                Updated {formatRelativeTime(topicConditioningLastUpdated)}
              </p>
            )}
          </div>
        )}

        {workflow && !workflow.introCompleted && student.parentInfo && (
          <div className="pt-4 border-t border-border/60 space-y-3">
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
        )}

        {workflow && !workflow.assignmentAccepted && (
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

        {workflow?.assignmentAccepted && !workflow.introConfirmed && (
          <TutorIntroSessionActions
            studentId={student.id}
            parentId={student.parentInfo?.parent_id}
            tutorId={student.tutor_id}
          />
        )}

        {workflow?.assignmentAccepted && workflow?.introConfirmed && !workflow.introCompleted && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <Button
              className="w-full"
              variant="primary"
              size="sm"
              onClick={() => markIntroCompleted.mutate()}
              disabled={markIntroCompleted.isPending}
            >
              {markIntroCompleted.isPending ? "Saving..." : "Mark Intro Session As Completed"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Complete the intro session before logging the identity sheet.
            </p>
            {(workflow?.identitySaved || workflow?.proposalSent || workflow?.proposalAccepted) && (
              <p className="text-xs text-amber-700 text-center">
                Workflow data appears ahead of intro completion. Mark intro complete to re-sync this student flow.
              </p>
            )}
            {markIntroCompleted.isError && (
              <p className="text-xs text-red-600 text-center">
                {markIntroCompleted.error instanceof Error
                  ? markIntroCompleted.error.message
                  : "Failed to mark intro session completed"}
              </p>
            )}
          </div>
        )}

        {workflow?.assignmentAccepted && workflow?.introCompleted && !workflow.identitySaved && !workflow?.proposalSent && !workflow?.proposalAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setIdentitySheetOpen(true);
              }}
            >
              Log Identity Sheet
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Log student's identity sheet to unlock proposal.
            </p>
          </div>
        )}

        {workflow?.assignmentAccepted && workflow?.identitySaved && !workflow.proposalSent && !workflow?.proposalAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-3">
            <div className="rounded-xl border border-primary/20 bg-muted/20 px-3 py-2 text-xs text-center text-foreground">
              Identity sheet saved
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSelectedStudentName(student.name);
                  setIdentitySheetOpen(true);
                }}
              >
                View / Edit Identity Sheet
              </Button>
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
            <p className="text-xs text-muted-foreground text-center">
              Send proposal after identity sheet is saved.
            </p>
          </div>
        )}

        {workflow?.assignmentAccepted && workflow?.proposalSent && !workflow.proposalAccepted && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Proposal sent. Waiting for parent acceptance to unlock reports.
            </p>
          </div>
        )}

        {workflow?.introCompleted && (
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
