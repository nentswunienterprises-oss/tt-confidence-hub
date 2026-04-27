import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, ShieldAlert, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { stripWhatThisDoesSection } from "@/components/battle-testing/textUtils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type {
  BattleTestPhaseDefinition,
  BattleTestResponseInput,
  BattleTestScore,
} from "@shared/battleTesting";
import { BATTLE_TEST_SCORE_POINTS } from "@shared/battleTesting";

interface BattleTestRunnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  phaseOptions: BattleTestPhaseDefinition[];
  selectionMode?: "multiple" | "fixed";
  submitLabel: string;
  onSubmit: (payload: {
    selectedPhases: BattleTestPhaseDefinition[];
    responses: BattleTestResponseInput[];
  }) => Promise<void>;
}

type ResponseDraft = {
  score?: BattleTestScore;
  note: string;
  isCriticalFail: boolean;
};

const SCORE_META: Record<
  BattleTestScore,
  { label: string; description: string; className: string; icon: LucideIcon }
> = {
  clear: {
    label: "CLEAR",
    description: "Fully aligned",
    className: "border-emerald-300 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  partial: {
    label: "PARTIAL",
    description: "Some alignment, some drift",
    className: "border-amber-300 bg-amber-50 text-amber-800",
    icon: AlertTriangle,
  },
  fail: {
    label: "FAIL",
    description: "System misunderstanding",
    className: "border-rose-300 bg-rose-50 text-rose-800",
    icon: ShieldAlert,
  },
};

function getQuestionId(phaseKey: string, questionKey: string) {
  return `${phaseKey}:${questionKey}`;
}

export default function BattleTestRunnerDialog({
  open,
  onOpenChange,
  title,
  description,
  phaseOptions,
  selectionMode = "multiple",
  submitLabel,
  onSubmit,
}: BattleTestRunnerDialogProps) {
  const initialPhaseKeys = useMemo(
    () =>
      selectionMode === "fixed"
        ? phaseOptions.map((phase) => phase.key)
        : phaseOptions.length > 0
        ? [phaseOptions[0].key]
        : [],
    [phaseOptions, selectionMode]
  );
  const [selectedPhaseKeys, setSelectedPhaseKeys] = useState<string[]>(initialPhaseKeys);
  const [hasStarted, setHasStarted] = useState(selectionMode === "fixed");
  const [responses, setResponses] = useState<Record<string, ResponseDraft>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runSummaryExpanded, setRunSummaryExpanded] = useState(true);

  useEffect(() => {
    if (!open) return;
    setSelectedPhaseKeys(initialPhaseKeys);
    setHasStarted(selectionMode === "fixed");
    setResponses({});
    setIsSubmitting(false);
  }, [open, initialPhaseKeys, selectionMode]);

  const selectedPhases = useMemo(
    () =>
      selectedPhaseKeys
        .map((phaseKey) => phaseOptions.find((phase) => phase.key === phaseKey))
        .filter((phase): phase is BattleTestPhaseDefinition => !!phase),
    [phaseOptions, selectedPhaseKeys]
  );

  const questions = useMemo(
    () =>
      selectedPhases.flatMap((phase) =>
        phase.questions.map((question) => ({
          phase,
          question,
          questionId: getQuestionId(phase.key, question.key),
        }))
      ),
    [selectedPhases]
  );

  const answeredCount = questions.filter(({ questionId }) => responses[questionId]?.score).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const hasMissingNotes = questions.some(({ questionId }) => {
    const response = responses[questionId];
    return !!response?.score &&
      (response.score === "partial" || response.score === "fail") &&
      !response.note.trim();
  });
  const estimatedPoints = questions.reduce((sum, { questionId }) => {
    const score = responses[questionId]?.score;
    return sum + (score ? BATTLE_TEST_SCORE_POINTS[score] : 0);
  }, 0);

  const handlePhaseToggle = (phaseKey: string, checked: boolean) => {
    setSelectedPhaseKeys((current) => {
      if (selectionMode === "fixed") return current;
      if (checked) return Array.from(new Set([...current, phaseKey]));
      if (current.length === 1) return current;
      return current.filter((key) => key !== phaseKey);
    });
  };

  const handleScoreChange = (phaseKey: string, questionKey: string, score: BattleTestScore) => {
    const questionId = getQuestionId(phaseKey, questionKey);
    setResponses((current) => {
      const previous = current[questionId];
      return {
        ...current,
        [questionId]: {
          score,
          note: previous?.note || "",
          isCriticalFail: score === "fail" ? previous?.isCriticalFail || false : false,
        },
      };
    });
  };

  const handleSubmit = async () => {
    if (!allAnswered || hasMissingNotes || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payloadResponses: BattleTestResponseInput[] = questions.map(({ phase, question, questionId }) => {
        const response = responses[questionId];
        return {
          phaseKey: phase.key,
          questionKey: question.key,
          score: response.score!,
          note: response.note.trim() || undefined,
          isCriticalFail: question.autoCriticalOnFail
            ? response.score === "fail"
            : response.score === "fail"
            ? response.isCriticalFail
            : false,
        };
      });
      await onSubmit({
        selectedPhases,
        responses: payloadResponses,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95dvh] w-[calc(100vw-1rem)] max-w-6xl flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[92vh] sm:w-[min(96vw,88rem)]">
        <div className="border-b px-4 py-4 sm:px-6 sm:py-5">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[1.4fr,0.6fr] lg:gap-0">
          <div className="min-h-0 min-w-0 lg:order-1">
            {!hasStarted ? (
              <ScrollArea className="h-[58dvh] sm:h-auto sm:max-h-none lg:h-full">
                <div className="space-y-5 p-4 sm:p-6">
                  <div>
                    <p className="text-sm font-medium text-foreground">Select phases to drill</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      TD picks the exact tutor transformation phases to battle-test in this run.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {phaseOptions.map((phase) => (
                      <Card key={phase.key} className="border border-border/70 p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedPhaseKeys.includes(phase.key)}
                            onCheckedChange={(checked) => handlePhaseToggle(phase.key, checked === true)}
                            id={`phase-${phase.key}`}
                          />
                          <div className="space-y-1">
                            <Label htmlFor={`phase-${phase.key}`} className="text-sm font-semibold text-foreground">
                              {phase.title}
                            </Label>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                            <Badge variant="outline">{phase.questions.length} reps</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button disabled={selectedPhaseKeys.length === 0} onClick={() => setHasStarted(true)}>
                      Start Battle Test
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="lg:h-full h-screen lg:h-auto">
                <div className="space-y-5 p-4 sm:p-6 pb-20 sm:pb-24 lg:pb-6">
                  {questions.map(({ phase, question, questionId }, index) => {
                    const response = responses[questionId] || { note: "", isCriticalFail: false };
                    return (
                      <Card key={questionId} className="border border-border/70 p-4 sm:p-5">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{phase.title}</Badge>
                            <Badge variant="outline">{question.section}</Badge>
                            <span className="text-xs text-muted-foreground">Rep {index + 1}</span>
                          </div>

                          <div className="space-y-2">
                            <p className="text-base font-semibold text-foreground">
                              {stripWhatThisDoesSection(question.prompt)}
                            </p>
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto px-0 text-sm text-muted-foreground">
                                  Show expected answer and fail indicators
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-3 rounded-xl border bg-muted/30 p-4">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Expected Answer
                                  </p>
                                  <p className="mt-2 text-sm text-foreground">
                                    {stripWhatThisDoesSection(question.expectedAnswer)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Fail Indicators
                                  </p>
                                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                                    {question.failIndicators.map((indicator) => (
                                      <li key={indicator}>{indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>

                          <RadioGroup
                            value={response.score}
                            onValueChange={(value) =>
                              handleScoreChange(phase.key, question.key, value as BattleTestScore)
                            }
                            className="grid gap-3 md:grid-cols-3"
                          >
                            {(["clear", "partial", "fail"] as BattleTestScore[]).map((score) => {
                              const meta = SCORE_META[score];
                              const Icon = meta.icon;
                              return (
                                <Label
                                  key={score}
                                  htmlFor={`${questionId}-${score}`}
                                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${meta.className} ${
                                    response.score === score ? "ring-2 ring-primary/30" : ""
                                  }`}
                                >
                                  <RadioGroupItem id={`${questionId}-${score}`} value={score} className="mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span className="font-semibold">{meta.label}</span>
                                    </div>
                                    <p className="mt-1 text-xs opacity-80">{meta.description}</p>
                                  </div>
                                </Label>
                              );
                            })}
                          </RadioGroup>

                          {(response.score === "partial" || response.score === "fail") && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor={`${questionId}-note`}>TD note</Label>
                                <Textarea
                                  id={`${questionId}-note`}
                                  value={response.note}
                                  onChange={(event) =>
                                    setResponses((current) => ({
                                      ...current,
                                      [questionId]: {
                                        score: response.score,
                                        note: event.target.value,
                                        isCriticalFail: response.isCriticalFail,
                                      },
                                    }))
                                  }
                                  placeholder="Log the exact drift, violation, or incomplete understanding."
                                  rows={3}
                                />
                              </div>
                              {response.score === "fail" && !question.autoCriticalOnFail ? (
                                <Label className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                                  <Checkbox
                                    checked={response.isCriticalFail}
                                    onCheckedChange={(checked) =>
                                      setResponses((current) => ({
                                        ...current,
                                        [questionId]: {
                                          score: response.score,
                                          note: response.note,
                                          isCriticalFail: checked === true,
                                        },
                                      }))
                                    }
                                  />
                                  Mark this fail as a critical override
                                </Label>
                              ) : null}
                              {response.score === "fail" && question.autoCriticalOnFail ? (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                                  This question auto-triggers a critical fail when scored as FAIL.
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                  <div className="h-28 lg:hidden" />
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Mobile: Fixed at bottom when started */}
          {hasStarted && (
            <div className="fixed bottom-0 left-0 right-0 z-10 lg:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-hidden">
              <Button
                variant="ghost"
                onClick={() => setRunSummaryExpanded(!runSummaryExpanded)}
                className="w-full justify-between px-4 py-1 text-left font-medium hover:bg-muted/50 h-auto border-b"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Run Summary
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {answeredCount}/{questions.length}
                  </span>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform ${runSummaryExpanded ? 'rotate-180' : ''}`} />
              </Button>
              {runSummaryExpanded && (
                <div className="max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-100px)] overflow-y-auto">
                  <div className="space-y-4 p-4 sm:p-6">
                    <div>
                      <p className="text-3xl font-semibold text-foreground">
                        {answeredCount}/{questions.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Reps logged</p>
                    </div>

                    <Card className="border border-border/70 p-4">
                      <p className="text-sm font-medium text-foreground">Estimated alignment score</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {questions.length > 0 ? Math.round((estimatedPoints / questions.length) * 100) : 0}%
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Based on current CLEAR / PARTIAL / FAIL entries.
                      </p>
                    </Card>

                    <div className="space-y-2">
                      {selectedPhases.map((phase) => (
                        <div key={phase.key} className="rounded-xl border border-border/70 bg-background px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">{phase.title}</span>
                            <Badge variant="outline">{phase.questions.length} reps</Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
                      Notes are required for every PARTIAL or FAIL score. Critical fail overrides can be marked on FAIL reps.
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full" disabled={!allAnswered || hasMissingNotes || isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? "Saving..." : submitLabel}
                      </Button>
                      {!allAnswered ? (
                        <p className="text-xs text-amber-700">Every rep must be scored before submission.</p>
                      ) : null}
                      {allAnswered && hasMissingNotes ? (
                        <p className="text-xs text-amber-700">Add notes for each PARTIAL and FAIL score.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop: Always show sidebar */}
          <div className="hidden lg:block lg:border-l lg:bg-muted/20 lg:min-h-0 lg:overflow-y-auto">
            <Collapsible open={runSummaryExpanded} onOpenChange={setRunSummaryExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-6 py-3 text-left font-medium hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Run Summary
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {answeredCount}/{questions.length} reps
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${runSummaryExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 p-6">
                  <div>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {answeredCount}/{questions.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Reps logged</p>
                  </div>

                  <Card className="border border-border/70 p-4">
                    <p className="text-sm font-medium text-foreground">Estimated alignment score</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {questions.length > 0 ? Math.round((estimatedPoints / questions.length) * 100) : 0}%
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on current CLEAR / PARTIAL / FAIL entries.
                    </p>
                  </Card>

                  <div className="space-y-2">
                    {selectedPhases.map((phase) => (
                      <div key={phase.key} className="rounded-xl border border-border/70 bg-background px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground">{phase.title}</span>
                          <Badge variant="outline">{phase.questions.length} reps</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
                    Notes are required for every PARTIAL or FAIL score. Critical fail overrides can be marked on FAIL reps.
                  </div>

                  {hasStarted && (
                    <div className="space-y-3">
                      <Button className="w-full" disabled={!allAnswered || hasMissingNotes || isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? "Saving..." : submitLabel}
                      </Button>
                      {!allAnswered ? (
                        <p className="text-xs text-amber-700">Every rep must be scored before submission.</p>
                      ) : null}
                      {allAnswered && hasMissingNotes ? (
                        <p className="text-xs text-amber-700">Add notes for each PARTIAL and FAIL score.</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
