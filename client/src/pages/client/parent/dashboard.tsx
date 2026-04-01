import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProposalView from "@/components/parent/ProposalView";
import { useLocation } from "wouter";

interface StudentStats {
  bossBattlesCompleted: number;
  solutionsUnlocked: number;
  confidenceGrowth: number;
  sessionsCompleted: number;
  currentStreak: number;
  totalCommitments: number;
}

interface TutorInfo {
  id: string;
  name: string;
  email?: string;
  bio?: string;
}

interface IntroSessionInfo {
  status:
    | "not_scheduled"
    | "awaiting_tutor_acceptance"
    | "pending_tutor_confirmation"
    | "pending_parent_confirmation"
    | "confirmed";
  scheduled_time?: string;
  introCompleted?: boolean;
}

const PHASE_SEQUENCE = ["Clarity", "Structured Execution", "Controlled Discomfort", "Time Pressure Stability"] as const;
const STABILITY_SEQUENCE = ["Low", "Medium", "High"] as const;

type PhaseLabel = (typeof PHASE_SEQUENCE)[number];
type StabilityLabel = (typeof STABILITY_SEQUENCE)[number];

type ParentStateCopy = {
  status: string;
  meaning: string;
  focus: string;
};

type ParentTopicState = {
  topic: string;
  phase: string | null;
  stability: string | null;
  lastUpdated?: string | null;
  previousPhase?: string | null;
  previousStability?: string | null;
  movement?: "none" | "improved" | "regressed" | "changed";
  bucket?: "active" | "recent" | "older";
};

const PARENT_STATE_ENGINE: Record<PhaseLabel, Record<StabilityLabel, ParentStateCopy>> = {
  Clarity: {
    Low: {
      status: "Your child is still building a clear understanding of this topic.",
      meaning: "They are not yet fully comfortable with the terms, steps, or logic involved.",
      focus: "We are rebuilding the foundation so they can clearly recognize and understand the problem.",
    },
    Medium: {
      status: "Your child is beginning to understand this topic more clearly.",
      meaning: "They can follow explanations, but still need reinforcement to apply it independently.",
      focus: "We are increasing practice and helping them apply the method more consistently.",
    },
    High: {
      status: "Your child now understands this topic clearly.",
      meaning: "They can recognize the problem and explain the steps with confidence.",
      focus: "We are moving into independent problem-solving to build execution.",
    },
  },
  "Structured Execution": {
    Low: {
      status: "Your child is learning to apply the steps correctly.",
      meaning: "They understand the topic but struggle to follow the method consistently on their own.",
      focus: "We are reinforcing a clear step-by-step approach so they can start and complete problems reliably.",
    },
    Medium: {
      status: "Your child is becoming more consistent in solving problems.",
      meaning: "They can follow the method in many cases, but still show occasional inconsistency.",
      focus: "We are increasing independent practice to strengthen consistency.",
    },
    High: {
      status: "Your child can now solve problems consistently in this topic.",
      meaning: "They are able to follow the correct steps independently with minimal support.",
      focus: "We are introducing more challenging questions to strengthen their response under difficulty.",
    },
  },
  "Controlled Discomfort": {
    Low: {
      status: "Your child is starting to face more challenging problems in this topic.",
      meaning: "They can solve basic problems, but struggle when questions become less familiar.",
      focus: "We are helping them stay calm and start correctly even when the problem feels difficult.",
    },
    Medium: {
      status: "Your child is improving in handling difficult questions.",
      meaning: "They can work through unfamiliar problems, but still show hesitation at times.",
      focus: "We are increasing exposure to harder questions to build confidence under difficulty.",
    },
    High: {
      status: "Your child is handling difficult problems well.",
      meaning: "They are able to stay structured and solve unfamiliar questions with stability.",
      focus: "We are preparing them to perform under time pressure.",
    },
  },
  "Time Pressure Stability": {
    Low: {
      status: "Your child is learning to stay structured under time pressure.",
      meaning: "They can solve problems, but may lose structure when working against the clock.",
      focus: "We are helping them maintain their method while working within time limits.",
    },
    Medium: {
      status: "Your child is becoming more stable under time pressure.",
      meaning: "They are improving their ability to complete problems within time while staying structured.",
      focus: "We are increasing timed practice to strengthen consistency.",
    },
    High: {
      status: "Your child is performing consistently under time pressure.",
      meaning: "They can solve problems accurately and maintain structure even under time constraints.",
      focus: "We are maintaining performance and preparing them to transfer this skill to new topics.",
    },
  },
};

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;|]+/)
    .map((item) => item.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function extractTopicConditioning(proposal: any) {
  if (!proposal) {
    return { topic: null, entryPhase: null, stability: null };
  }

  if (proposal.topicConditioning) {
    return {
      topic: proposal.topicConditioning.topic?.trim() || null,
      entryPhase: proposal.topicConditioning.entryPhase?.trim() || null,
      stability: proposal.topicConditioning.stability?.trim() || null,
    };
  }

  const noteText = String(proposal.tutorNotes || "");
  const justificationText = String(proposal.justification || "");

  return {
    topic: String(proposal.currentTopics || "").trim() || null,
    entryPhase:
      noteText.match(/Entry Phase:\s*([^\n\r]+)/i)?.[1]?.trim() ||
      justificationText.match(/Entry phase\s*([^|\.]+)/i)?.[1]?.trim() ||
      null,
    stability:
      noteText.match(/Stability:\s*([^\n\r]+)/i)?.[1]?.trim() ||
      justificationText.match(/Stability\s*([^|\.]+)/i)?.[1]?.trim() ||
      null,
  };
}

function getProgressSignals(proposal: any) {
  const signals = splitList(proposal?.childWillWin);
  if (signals.length > 0) return signals;

  return [
    "Earlier independent starts",
    "Less hesitation under difficulty",
    "More consistent method use",
    "Calmer response when work becomes uncomfortable",
  ];
}

function normalizePhaseLabel(phase?: string | null) {
  if (!phase) return null;
  const normalized = phase.trim().toLowerCase();
  const matched = PHASE_SEQUENCE.find((item) => item.toLowerCase() === normalized);
  return matched || null;
}

function normalizeStabilityLabel(stability?: string | null): StabilityLabel | null {
  const v = String(stability || "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("medium")) return "Medium";
  if (v.includes("low")) return "Low";
  return null;
}

function stabilityIndicator(stability: StabilityLabel | null): "Developing" | "Strengthening" | "Stable" | "Unconfirmed" {
  if (!stability) return "Unconfirmed";
  if (stability === "High") return "Stable";
  if (stability === "Medium") return "Strengthening";
  return "Developing";
}

function parentCopyForState(phase?: string | null, stability?: string | null): ParentStateCopy {
  const normalizedPhase = normalizePhaseLabel(phase);
  const normalizedStability = normalizeStabilityLabel(stability);

  if (!normalizedPhase || !normalizedStability) {
    return {
      status: "This topic has been activated, but the current observed stage has not been confirmed yet.",
      meaning: "TT has the topic in conditioning, but a session-scored stage and stability label is not yet available here.",
      focus: "The next logged session will confirm where this topic currently sits and what needs reinforcing first.",
    };
  }

  return PARENT_STATE_ENGINE[normalizedPhase][normalizedStability];
}

function formatDateLabel(dateText?: string | null): string {
  if (!dateText) return "Recently updated";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCurrentStepCopy(introSession: IntroSessionInfo | null, hasProposal: boolean, hasCode: boolean) {
  if (hasCode) {
    return {
      title: "Student Access Is Ready",
      description: "Your child can now use the access code to enter the system and begin the active training journey.",
    };
  }

  if (introSession?.status === "pending_tutor_confirmation") {
    return {
      title: "Waiting For Tutor Confirmation",
      description: "A time has been proposed for the intro session. The next move is tutor confirmation.",
    };
  }

  if (introSession?.status === "pending_parent_confirmation") {
    return {
      title: "Time Needs Your Confirmation",
      description: "Your tutor proposed a new intro-session time. Confirming that time is the next move.",
    };
  }

  if (introSession?.status === "confirmed" && !introSession?.introCompleted) {
    return {
      title: "Intro Session Confirmed",
      description: "The intro session is scheduled. That session will identify the first place the work breaks down.",
    };
  }

  if (introSession?.status === "confirmed" && introSession?.introCompleted && hasProposal) {
    return {
      title: "Training Plan Is Active",
      description: "The intro session has been completed and TT is now training from the identified breakpoint.",
    };
  }

  return {
    title: "System Is In Motion",
    description: "Your dashboard reflects the current training state and the next thing TT is moving forward.",
  };
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);

  const { data: proposal, isLoading: proposalLoading, error: proposalError } = useQuery<any>({
    queryKey: ["/api/parent/proposal"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StudentStats>({
    queryKey: ["/api/parent/student-stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const { data: studentInfo, isLoading: studentInfoLoading, error: studentInfoError } = useQuery<any>({
    queryKey: ["/api/parent/student-info"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: assignedTutor } = useQuery<TutorInfo | null>({
    queryKey: ["/api/parent/assigned-tutor"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: introSession } = useQuery<IntroSessionInfo | null>({
    queryKey: ["/api/parent/intro-session-confirmation"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: topicStatesData } = useQuery<ParentTopicState[]>({
    queryKey: ["/api/parent/topic-conditioning-states"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchInterval: (query) => (query.state.error ? false : 15000),
    refetchOnWindowFocus: true,
  });

  if (proposalLoading || statsLoading || studentInfoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (proposalError || statsError || studentInfoError) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Dashboard Loading</CardTitle>
        </CardHeader>
        <CardContent className="text-orange-800">
          <p>The dashboard could not fully load the current parent state.</p>
          <p className="mt-3 text-sm">
            {proposalError?.message || statsError?.message || studentInfoError?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const studentName = studentInfo?.name || proposal?.student?.name || "Your child";
  const studentFirstName = studentName.trim().split(/\s+/)[0] || "Your child";
  const topicConditioning = extractTopicConditioning(proposal);
  const focusArea = topicConditioning.topic || splitList(proposal?.currentTopics)[0] || "Current school topic";
  const progressSignals = getProgressSignals(proposal);
  const hasAccessCode = !!proposal?.parentCode;
  const currentStep = getCurrentStepCopy(introSession || null, !!proposal, hasAccessCode);
  const nextSessionTime = introSession?.scheduled_time
    ? new Date(introSession.scheduled_time).toLocaleString()
    : null;
  const introStatusesWithSchedule = new Set([
    "pending_tutor_confirmation",
    "pending_parent_confirmation",
    "confirmed",
  ]);
  const showScheduledTime = Boolean(
    nextSessionTime &&
      introSession?.status &&
      introStatusesWithSchedule.has(introSession.status) &&
      !hasAccessCode
  );
  const firstParentName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Parent";

  const normalizedTopicStates = (topicStatesData || [])
    .map((item) => ({
      ...item,
      phase: normalizePhaseLabel(item.phase),
      stability: normalizeStabilityLabel(item.stability),
      topic: String(item.topic || "").trim(),
    }))
    .filter((item) => item.topic.length > 0)
    .slice(0, 6);

  const fallbackTopicCards = topicConditioning.topic
    ? [{
        topic: topicConditioning.topic,
        phase: normalizePhaseLabel(topicConditioning.entryPhase),
        stability: normalizeStabilityLabel(topicConditioning.stability),
        lastUpdated: null,
        movement: "none" as const,
        bucket: "active" as const,
      }]
    : [];

  const topicCards = normalizedTopicStates.length > 0 ? normalizedTopicStates : fallbackTopicCards;

  const sessionMarkers = [
    {
      label: "Sessions Completed",
      value: stats?.sessionsCompleted || 0,
    },
  ];

  const trainingMarkers = [
    {
      label: "Challenge Exposure",
      value: stats?.bossBattlesCompleted || 0,
    },
    {
      label: "Structured Solutions",
      value: stats?.solutionsUnlocked || 0,
    },
    {
      label: "Topics In Conditioning",
      value: topicCards.length,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background p-5 sm:p-7">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.08em] text-foreground/65">Parent Dashboard</p>
            <p className="text-sm text-foreground/70 mt-1.5">Hi {firstParentName}, here is the live TT operating view.</p>
            <h1
              className="text-2xl sm:text-[2.1rem] font-semibold tracking-[-0.01em] leading-tight mt-2"
              style={{ fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif' }}
            >
              Current training state for {studentName}
            </h1>
            <p className="text-sm sm:text-base text-foreground/75 mt-2.5 max-w-2xl leading-relaxed">
              Stay aligned with how TT is training {studentFirstName} right now.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {studentInfo?.grade && <Badge variant="outline" className="border-primary/30 bg-background/70">{studentInfo.grade}</Badge>}
            {studentInfo?.podName && <Badge className="bg-primary/90 text-primary-foreground">{studentInfo.podName}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl font-semibold tracking-[-0.01em]">Topic Focus</CardTitle>
          </CardHeader>
          <CardContent>
            {topicCards.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Topic cards appear as soon as a topic is activated or a scored session confirms its current state.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {topicCards.map((row) => {
                  const copy = parentCopyForState(row.phase, row.stability);
                  const hasProgressUpdate = row.movement === "improved";

                  return (
                    <div key={`${row.topic}-${row.phase}-${row.stability}`} className="rounded-xl border border-primary/20 bg-background p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-base font-semibold tracking-tight text-foreground">{row.topic}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-primary/30 bg-background/80">
                            {stabilityIndicator(row.stability as StabilityLabel | null)}
                          </Badge>
                          {row.bucket === "recent" && (
                            <Badge variant="secondary">Recently Trained</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-primary/30 bg-background/80">
                          Stage: {row.phase || "Unknown"}
                        </Badge>
                        <Badge variant="outline" className="border-primary/30 bg-background/80">
                          Stability: {row.stability || "Unknown"}
                        </Badge>
                      </div>

                      {hasProgressUpdate && (
                        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
                          <p className="text-sm font-medium text-green-800">Progress Update</p>
                          <p className="text-xs text-green-700">Your child has improved in this topic this week.</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Current Status</p>
                          <p className="text-sm text-foreground leading-relaxed">{copy.status}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">What This Means</p>
                          <p className="text-sm text-foreground leading-relaxed">{copy.meaning}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Current Focus</p>
                          <p className="text-sm text-foreground leading-relaxed">{copy.focus}</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">Last updated: {formatDateLabel(row.lastUpdated)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-[-0.01em]">
                <UserRound className="w-5 h-5" />
                Tutor Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Assigned tutor</p>
                <p className="font-semibold text-foreground">{assignedTutor?.name || "Assigned inside TT"}</p>
              </div>
              {assignedTutor?.bio && (
                <p className="text-muted-foreground">{assignedTutor.bio}</p>
              )}
              <div className="pt-2 border-t">
                <p className="text-muted-foreground">Parent role now</p>
                <p className="font-medium text-foreground">Hold consistency. Do not rescue the struggle too early.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold tracking-[-0.01em]">Next System Step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{currentStep.title}</p>
              <p className="text-muted-foreground leading-relaxed">{currentStep.description}</p>
              {showScheduledTime && (
                <p className="text-xs text-muted-foreground">Scheduled time: {nextSessionTime}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">How Topic Conditioning Progresses</CardTitle>
          <CardDescription>
            Each topic can sit at a different stage. The topic cards above show the current observed stage for each topic when known.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {PHASE_SEQUENCE.map((phase, idx) => {
              return (
                <div
                  key={phase}
                  className="rounded-lg border p-3 bg-background"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Stage {idx + 1}</p>
                  </div>
                  <p className="text-sm mt-2 font-medium leading-snug text-foreground">{phase}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            Parent view note: stage is tracked per topic, not as one global student stage.
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-primary/15">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">What is Being Observed</CardTitle>
            <CardDescription>The training is taking hold:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              {progressSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/25 bg-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">Parent Role</CardTitle>
            <CardDescription>What helps the system work as intended outside the session:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>Keep session attendance steady and protected.</li>
              <li>Let discomfort happen before stepping in with reassurance.</li>
              <li>Look for calmer starts and steadier attempts, not only marks.</li>
              <li>Use the tutor and training plan as the operating reference.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 border-primary/15">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">Training Plan</CardTitle>
            <CardDescription>The accepted plan is the current operating reference for this student.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                {proposal
                  ? `TT is operating from ${studentFirstName}'s current breakpoint inside ${focusArea}.`
                  : `The training plan is still being loaded for ${studentFirstName}.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setProposalDialogOpen(true)} disabled={!proposal} className="sm:flex-1 bg-primary hover:bg-primary/90">
                View Full Training Plan
              </Button>
              {proposal?.parentCode && (
                <Button
                  variant="outline"
                  className="sm:flex-1"
                  onClick={() => navigator.clipboard.writeText(proposal.parentCode)}
                >
                  Copy Student Access Code
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/15">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">Parent Controls</CardTitle>
            <CardDescription>Use these when you need to make the next move quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setProposalDialogOpen(true)}>
              Review Training Plan
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setLocation("/client/parent/gateway")}>
              Review Onboarding Flow
            </Button>
            {proposal?.parentCode && (
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigator.clipboard.writeText(proposal.parentCode)}>
                Copy Student Code
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-primary/20 bg-background shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">Session Markers</CardTitle>
            <CardDescription>Operational secondary signals. Useful context, not the main TT outcome layer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sessionMarkers.map((item) => {
                return (
                  <div key={item.label} className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.07em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-[-0.01em]">Training Markers</CardTitle>
            <CardDescription>TT-specific secondary signals that show conditioning pressure and response structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trainingMarkers.map((item) => {
                const displayValue = item.value ?? "Unknown";
                return (
                  <div key={item.label} className="rounded-xl border border-primary/20 bg-muted/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.07em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground break-words">{displayValue}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {proposal && (
        <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{studentName} Training Plan</DialogTitle>
            </DialogHeader>
            <ProposalView proposal={proposal} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}