import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/config";
import type { BattleTestRunDetail, BattleTestRunHistoryItem } from "@shared/battleTesting";

interface BattleTestHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  historyQueryKey: string;
  historyEndpoint: string;
  filter: (run: BattleTestRunHistoryItem) => boolean;
}

function getStateBadgeClass(state: string) {
  if (state === "locked") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (state === "watchlist") return "bg-amber-100 text-amber-900 border-amber-200";
  return "bg-rose-100 text-rose-800 border-rose-200";
}

export default function BattleTestHistoryDialog({
  open,
  onOpenChange,
  title,
  description,
  historyQueryKey,
  historyEndpoint,
  filter,
}: BattleTestHistoryDialogProps) {
  const { data: runs = [], isLoading } = useQuery<BattleTestRunHistoryItem[]>({
    queryKey: [historyQueryKey],
    enabled: open,
    queryFn: async () => {
      const response = await fetch(`${API_URL}${historyEndpoint}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load battle-testing history");
      return response.json();
    },
  });
  const filteredRuns = runs.filter(filter);
  const selectedRunId = filteredRuns[0]?.runId || null;

  const { data: runDetail, isLoading: detailLoading } = useQuery<BattleTestRunDetail>({
    queryKey: [`battle-test-run-detail-${selectedRunId}`],
    enabled: open && !!selectedRunId,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/battle-tests/runs/${selectedRunId}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load battle-testing run detail");
      return response.json();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,88rem)] max-w-6xl p-0">
        <div className="border-b px-6 py-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="grid lg:grid-cols-[0.9fr,1.1fr]">
          <div className="border-r p-6">
            <p className="mb-4 text-sm font-medium text-foreground">Recent Runs</p>
            <ScrollArea className="h-[70vh] pr-3">
              <div className="space-y-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </>
                ) : filteredRuns.length > 0 ? (
                  filteredRuns.map((run) => (
                    <Card key={run.runId} className="border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{run.subjectName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(run.completedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStateBadgeClass(run.state)}>{run.stateLabel}</Badge>
                      </div>
                      <p className="mt-3 text-2xl font-semibold text-foreground">
                        {Math.round(run.alignmentPercent)}%
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {run.phaseScores.map((phase) => (
                          <Badge key={`${run.runId}-${phase.phaseKey}`} variant="outline">
                            {phase.title}: {Math.round(phase.percent)}%
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No battle-testing history recorded yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-6">
            <p className="mb-4 text-sm font-medium text-foreground">Latest Run Detail</p>
            {detailLoading ? (
              <Skeleton className="h-72" />
            ) : runDetail ? (
              <ScrollArea className="h-[70vh] pr-3">
                <div className="space-y-4">
                  <Card className="border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{runDetail.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(runDetail.completedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStateBadgeClass(runDetail.state)}>{runDetail.stateLabel}</Badge>
                    </div>
                    {runDetail.actionRequired ? (
                      <p className="mt-3 text-sm text-muted-foreground">{runDetail.actionRequired}</p>
                    ) : null}
                  </Card>

                  {runDetail.repLogs.map((rep) => (
                    <Card key={`${rep.phaseKey}:${rep.questionKey}`} className="border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{rep.phaseKey}</Badge>
                        <Badge variant="outline">{rep.section}</Badge>
                        <Badge
                          className={
                            rep.score === "clear"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : rep.score === "partial"
                              ? "bg-amber-100 text-amber-900 border-amber-200"
                              : "bg-rose-100 text-rose-800 border-rose-200"
                          }
                        >
                          {rep.score.toUpperCase()}
                        </Badge>
                        {rep.isCriticalFail ? <Badge className="bg-rose-700 text-white">Critical Fail</Badge> : null}
                      </div>
                      <p className="mt-3 font-medium text-foreground">{rep.prompt}</p>
                      <div className="mt-3 rounded-xl border bg-muted/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Expected Answer
                        </p>
                        <p className="mt-2 text-sm text-foreground">{rep.expectedAnswer}</p>
                      </div>
                      {rep.note ? (
                        <div className="mt-3 rounded-xl border bg-background p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            TD Note
                          </p>
                          <p className="mt-2 text-sm text-foreground">{rep.note}</p>
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No run detail available yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
