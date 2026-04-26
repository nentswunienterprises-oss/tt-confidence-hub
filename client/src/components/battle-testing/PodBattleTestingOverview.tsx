import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PodBattleTestingSummary } from "@shared/battleTesting";
import { getBattleTestStateLabel } from "@shared/battleTesting";

interface PodBattleTestingOverviewProps {
  summary: PodBattleTestingSummary;
  readOnly?: boolean;
  showTdControl?: boolean;
  onStartTutorBattleTest?: (assignmentId: string) => void;
  onStartTdBattleTest?: () => void;
  onViewTutorHistory?: (assignmentId: string) => void;
  onViewTdHistory?: () => void;
}

function getStateBadgeClass(state: string | null | undefined) {
  if (state === "locked") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (state === "watchlist") return "bg-amber-100 text-amber-900 border-amber-200";
  if (state === "fail") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function PodBattleTestingOverview({
  summary,
  readOnly = false,
  showTdControl = false,
  onStartTutorBattleTest,
  onStartTdBattleTest,
  onViewTutorHistory,
  onViewTdHistory,
}: PodBattleTestingOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Weekly Alignment</p>
              <p className="text-2xl font-semibold text-foreground">
                {summary.weeklyAlignmentPercent == null ? "N/A" : `${Math.round(summary.weeklyAlignmentPercent)}%`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-50 p-3 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Violation Spikes</p>
              <p className="text-2xl font-semibold text-foreground">{summary.driftIncidents}</p>
            </div>
          </div>
        </Card>

        <Card className="border p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Locked Tutors</p>
              <p className="text-2xl font-semibold text-foreground">{summary.lockedTutors}</p>
            </div>
          </div>
        </Card>

        <Card className="border p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">At Risk</p>
              <p className="text-2xl font-semibold text-foreground">{summary.watchlistTutors + summary.failTutors}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">Alignment Integrity</p>
              <p className="text-sm text-muted-foreground">
                Phase-specific weaknesses and drift concentration across the pod.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {summary.phaseWeaknesses.length > 0 ? (
              summary.phaseWeaknesses.map((weakness) => (
                <div key={weakness.phaseKey} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{weakness.title}</p>
                    <Badge variant="outline">{Math.round(weakness.averagePercent)}%</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {weakness.affectedTutors} tutor{weakness.affectedTutors === 1 ? "" : "s"} currently weak here.
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No weak phases have been logged yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="border p-5">
          <p className="text-lg font-semibold text-foreground">Phase Scores</p>
          <p className="text-sm text-muted-foreground">Last checked scores aggregated from the latest tutor battle tests.</p>
          <div className="mt-5 space-y-3">
            {summary.phaseScores.length > 0 ? (
              summary.phaseScores.map((phase) => (
                <div key={phase.phaseKey} className="rounded-xl border border-border/70 bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{phase.title}</p>
                    <Badge className={getStateBadgeClass(phase.state)}>{Math.round(phase.percent)}%</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No phase scores recorded yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">TD Integrity</p>
            <p className="text-sm text-muted-foreground">
              COO can audit the assigned TD against the system-integrity drilling set.
            </p>
          </div>
          {showTdControl && !readOnly && summary.tdSummary?.tdId ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onViewTdHistory}>
                View History
              </Button>
              <Button onClick={onStartTdBattleTest}>
                <Swords className="mr-2 h-4 w-4" />
                Start TD Battle Test
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{summary.tdSummary?.tdName || "No TD assigned"}</p>
              <p className="text-sm text-muted-foreground">
                {summary.tdSummary?.lastAuditAt
                  ? `Last audited ${new Date(summary.tdSummary.lastAuditAt).toLocaleDateString()}`
                  : "No TD integrity audit recorded yet."}
              </p>
            </div>
            <Badge className={getStateBadgeClass(summary.tdSummary?.state)}>
              {getBattleTestStateLabel(summary.tdSummary?.state)}
            </Badge>
          </div>
          {summary.tdSummary?.actionRequired ? (
            <p className="mt-3 text-sm text-muted-foreground">{summary.tdSummary.actionRequired}</p>
          ) : null}
        </div>
      </Card>

      <Card className="border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">Tutor Audit Cards</p>
            <p className="text-sm text-muted-foreground">
              Latest alignment state for each tutor inside this pod.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {summary.tutorSummaries.length > 0 ? (
            summary.tutorSummaries.map((tutor) => (
              <div key={tutor.assignmentId} className="rounded-2xl border border-border/70 bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{tutor.tutorName}</p>
                    <p className="text-sm text-muted-foreground">{tutor.tutorEmail}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tutor.studentCount} students</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStateBadgeClass(tutor.state)}>{getBattleTestStateLabel(tutor.state)}</Badge>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {tutor.alignmentPercent == null ? "N/A" : `${Math.round(tutor.alignmentPercent)}%`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.phaseScores.length > 0 ? (
                    tutor.phaseScores.map((phase) => (
                      <Badge key={`${tutor.assignmentId}-${phase.phaseKey}`} variant="outline">
                        {phase.title}: {Math.round(phase.percent)}%
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tutor battle test logged yet.</span>
                  )}
                </div>

                {tutor.actionRequired ? (
                  <p className="mt-4 text-sm text-muted-foreground">{tutor.actionRequired}</p>
                ) : null}

                {!readOnly && onStartTutorBattleTest ? (
                  <div className="mt-4 flex gap-2">
                    <Button variant="ghost" onClick={() => onViewTutorHistory?.(tutor.assignmentId)}>
                      View History
                    </Button>
                    <Button variant="outline" onClick={() => onStartTutorBattleTest(tutor.assignmentId)}>
                      <Swords className="mr-2 h-4 w-4" />
                      Start Battle Test
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No tutors are available for battle-testing in this pod yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
