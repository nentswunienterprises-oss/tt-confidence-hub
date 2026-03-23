import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ScrollText } from "lucide-react";
import { useStudentWorkflowState, useMarkIntroCompleted } from "@/hooks/useStudentWorkflowState";
import { TutorIntroSessionActions } from "./TutorIntroSessionActions";

function splitReportedTopics(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return [];
  return rawValue
    .split(/[,\n;|]+/)
    .map((part) => part.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
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
  studentIdentitySheets,
  setSelectedStudentId,
  setSelectedStudentName,
  setIdentitySheetOpen,
  setTrackingDialogOpen,
  setAssignmentsDialogOpen,
  setProposalOpen,
  setReportsDialogOpen,
}) {
  const sessionProgress = student.sessionProgress || 0;
  // Determine onboarding type (pilot or commercial) from parentInfo if available
  const onboardingType = student.parentInfo?.onboarding_type || 'commercial';
  let progressLabel = 'Session Progress';
  let progressTotal = 8;
  if (onboardingType === 'pilot') {
    progressLabel = 'Trial Session Progress';
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

  const reportedTopics = splitReportedTopics(student.parentInfo?.math_struggle_areas);
  const reportedSymptoms = inferReportedSymptoms({
    struggleAreas: student.parentInfo?.math_struggle_areas,
    parentMotivation: student.parentInfo?.parent_motivation,
  });
  const suggestedTopic = reportedTopics[0] || "Current class topic with highest friction";
  const suggestedSymptoms = reportedSymptoms.slice(0, 2);

  return (
    <div className="p-6 border shadow-sm hover-elevate card">
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarFallback className="bg-accent text-foreground font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{student.name}</h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{student.grade}</span>
          </div>
          {student.parentInfo && (
            <div className="mt-2 text-sm">
              <p className="text-muted-foreground">Parent: <span className="font-medium text-foreground">{student.parentInfo.parent_full_name}</span></p>
              <p className="text-muted-foreground text-xs">{student.parentInfo.parent_email}</p>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{progressLabel}</span>
            <span className="font-semibold text-primary">
              {sessionProgress} of {progressTotal} completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full progress-gradient transition-all duration-300"
              style={{ width: `${(sessionProgress / progressTotal) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {progressTotal - sessionProgress} sessions remaining
          </p>
        </div>
        {/* Confidence Level bars removed as requested */}
        {workflowLoading && <p className="text-xs text-muted-foreground">Loading workflow...</p>}

        {/* Pre-session intelligence from parent enrollment */}
        {workflow && !workflow.introCompleted && student.parentInfo && (
          <div className="pt-4 border-t space-y-3">
            <div>
              <p className="text-xs font-semibold text-foreground">Pre-Session Intelligence</p>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              <p className="text-[11px] font-medium text-foreground">Parent-Reported Topics</p>
              {reportedTopics.length > 0 ? (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {reportedTopics.slice(0, 4).map((topic) => (
                    <li key={topic}>• {topic}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No specific topics listed by parent.</p>
              )}
            </div>

            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              <p className="text-[11px] font-medium text-foreground">Parent-Observed Symptoms</p>
              {reportedSymptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {reportedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="text-[10px]">
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

            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-foreground">Diagnostic Focus Suggestion</p>
              <p className="text-xs text-muted-foreground">Start with: <span className="text-foreground font-medium">{suggestedTopic}</span></p>
              <p className="text-xs text-muted-foreground">
                Watch for: <span className="text-foreground font-medium">{suggestedSymptoms.length > 0 ? suggestedSymptoms.join(" + ") : "Freezing + early help-seeking"}</span>
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Handle intro session confirmation */}
        {workflow && !workflow.introConfirmed && (
          <TutorIntroSessionActions
            studentId={student.id}
            parentId={student.parentInfo?.parent_id}
            tutorId={student.tutor_id}
          />
        )}

        {/* Step 2: Mark Intro Session As Completed (persisted) */}
        {workflow?.introConfirmed && !workflow.introCompleted && (
          <div className="pt-4 border-t space-y-2">
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
            {markIntroCompleted.isError && (
              <p className="text-xs text-red-600 text-center">
                {markIntroCompleted.error instanceof Error
                  ? markIntroCompleted.error.message
                  : "Failed to mark intro session completed"}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Log/Unlock Identity Sheet */}
        {workflow?.introCompleted && !workflow.identitySaved && (
          <div className="pt-4 border-t space-y-2">
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
              <FileText className="w-4 h-4 mr-2" />
              Log Identity Sheet
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Log student's identity sheet to unlock proposal.
            </p>
          </div>
        )}

        {/* Step 4: Create/Send Proposal (after identity saved) */}
        {workflow?.identitySaved && !workflow.proposalSent && (
          <div className="pt-4 border-t space-y-2">
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 text-center">
              ✓ Identity sheet saved
            </div>
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
              <FileText className="w-4 h-4 mr-2" />
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
              <FileText className="w-4 h-4 mr-2" />
              Create & Send Proposal
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Send proposal after identity sheet is saved.
            </p>
          </div>
        )}

        {/* Step 5: Wait for proposal acceptance */}
        {workflow?.proposalSent && !workflow.proposalAccepted && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Proposal sent. Waiting for parent acceptance to unlock tracking and assignments.
            </p>
          </div>
        )}

        {/* Final: Show Tracking Systems and Assignments */}
        {workflow?.proposalAccepted && (
          <div className="pt-4 border-t space-y-2">
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
              <Calendar className="w-4 h-4 mr-2" />
              View Tracking Systems
            </Button>
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setAssignmentsDialogOpen(true);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Assignments
            </Button>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStudentId(student.id);
              setSelectedStudentName(student.name);
              setReportsDialogOpen(true);
            }}
          >
            <ScrollText className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>
    </div>
  );
}
