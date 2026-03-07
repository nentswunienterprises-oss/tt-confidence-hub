import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { useIntroSessionStatus } from "@/hooks/useIntroSessionStatus";
import React from "react";
import { TutorIntroSessionActions } from "./TutorIntroSessionActions";

export function StudentCard({
  student,
  studentIdentitySheets,
  setSelectedStudentId,
  setSelectedStudentName,
  setIdentitySheetOpen,
  setTrackingDialogOpen,
  setAssignmentsDialogOpen,
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

  const { data: introSessionStatus } = useIntroSessionStatus(student.id);
  // Local UI state for progressive unlocks
  const [introCompleted, setIntroCompleted] = React.useState(false);
  const [identitySheetLogged, setIdentitySheetLogged] = React.useState(false);
  const [proposalSent, setProposalSent] = React.useState(false);
  const [proposalAccepted, setProposalAccepted] = React.useState(false);

  // Simulate unlocks for demo: in real app, these would be set by backend events
  // Identity sheet unlocks after introCompleted
  // Proposal unlocks after identitySheetLogged
  // Tracking/Assignments unlock after proposalAccepted

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
        {/* Step 1: Show session proposal and actions if not confirmed */}
        {introSessionStatus?.status !== "confirmed" && (
          <TutorIntroSessionActions studentId={student.id} />
        )}
        {/* Step 2: Mark Intro Session As Completed */}
        {introSessionStatus?.status === "confirmed" && !introCompleted && (
          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" variant="primary" size="sm" onClick={() => setIntroCompleted(true)}>
              Mark Intro Session As Completed
            </Button>
            <p className="text-xs text-muted-foreground text-center">Complete the intro session before logging the identity sheet.</p>
          </div>
        )}
        {/* Step 3: Log/Unlock Identity Sheet */}
        {introSessionStatus?.status === "confirmed" && introCompleted && !identitySheetLogged && (
          <div className="pt-4 border-t space-y-2">
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setIdentitySheetOpen(true);
                setIdentitySheetLogged(true);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Log Identity Sheet
            </Button>
            <p className="text-xs text-muted-foreground text-center">Identity sheet unlocks after intro session completion.</p>
          </div>
        )}
        {/* Step 4: Send Proposal */}
        {introSessionStatus?.status === "confirmed" && introCompleted && identitySheetLogged && !proposalSent && (
          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" variant="outline" size="sm" onClick={() => setProposalSent(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Send Proposal
            </Button>
            <p className="text-xs text-muted-foreground text-center">Send proposal after identity sheet is saved.</p>
          </div>
        )}
        {/* Step 5: Unlock Tracking/Assignments after proposal accepted */}
        {introSessionStatus?.status === "confirmed" && introCompleted && identitySheetLogged && proposalSent && !proposalAccepted && (
          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" variant="outline" size="sm" onClick={() => setProposalAccepted(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Accept Proposal (Demo)
            </Button>
            <p className="text-xs text-muted-foreground text-center">Proposal must be accepted to unlock resources.</p>
          </div>
        )}
        {/* Final: Show Tracking Systems and Assignments */}
        {introSessionStatus?.status === "confirmed" && introCompleted && identitySheetLogged && proposalSent && proposalAccepted && (
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
      </div>
    </div>
  );
}
