import { useEffect, useState } from "react";
import { getNextActionData } from "./topicConditioningEngine";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export type StudentOption = {
  id: string;
  name: string;
  grade?: string | null;
};

type TopicStatePrefill = {
  topic: string;
  phase: string;
  stability: string;
  observationNotes?: string;
  structuredObservation?: {
    observedPhase: string;
    previousStability: string;
    categories: Array<{ key: string; label: string; value: string }>;
    interventionUsed: string;
    sessionScore: number;
    phaseDecision: "remain" | "advance" | "regress";
    tutorExplanation: string;
    parentMeaning: string;
    nextAction: string;
    constraint: string;
  };
};

type SessionFormData = {
  studentId: string;
  duration: string;
  notes: string;
  solutionPurpose: string;
  vocabularyNotes: string;
  methodNotes: string;
  reasonNotes: string;
  studentResponse: string;
  tutorGrowthReflection: string;
  bossBattlesDone: string;
  practiceProblems: string;
  whatMisunderstood: string;
  correctionHelped: string;
  needsReinforcement: string;
  techChallengeDescription: string;
  techChallengeResolution: string;
};

interface TutorSessionLogFormProps {
  studentOptions: StudentOption[];
  defaultStudentId?: string;
  lockStudent?: boolean;
  topicState?: TopicStatePrefill | null;
  submitLabel?: string;
  onSuccess?: () => void;
}

function initialFormData(studentId = ""): SessionFormData {
  return {
    studentId,
    duration: "120",
    notes: "",
    solutionPurpose: "",
    vocabularyNotes: "",
    methodNotes: "",
    reasonNotes: "",
    studentResponse: "",
    tutorGrowthReflection: "",
    bossBattlesDone: "",
    practiceProblems: "",
    whatMisunderstood: "",
    correctionHelped: "",
    needsReinforcement: "",
    techChallengeDescription: "",
    techChallengeResolution: "",
  };
}

function nextActionFor(phase: string, stability: string): string {
  const validPhases = ["Clarity", "Structured Execution", "Controlled Discomfort", "Time Pressure Stability"] as const;
  const validStabilities = ["Low", "Medium", "High", "High Maintenance"] as const;
  const p = validPhases.find(v => v === phase);
  const s = validStabilities.find(v => v === stability);
  if (!p || !s) return "Run Time Pressure Stability maintenance drill";
  return getNextActionData(p, s).primaryAction;
}

export default function TutorSessionLogForm({
  studentOptions,
  defaultStudentId,
  lockStudent = false,
  topicState,
  submitLabel = "Log Session",
  onSuccess,
}: TutorSessionLogFormProps) {
  const { toast } = useToast();
  const compactTopicMode = !!topicState?.structuredObservation;
  const [formData, setFormData] = useState<SessionFormData>(initialFormData(defaultStudentId || ""));
  const [hasBossBattles, setHasBossBattles] = useState(false);
  const [assignPractice, setAssignPractice] = useState(false);
  const [has3LayerSolutions, setHas3LayerSolutions] = useState(false);
  const [hasChallenges, setHasChallenges] = useState(false);
  const [hasTechChallenges, setHasTechChallenges] = useState(false);

  useEffect(() => {
    setFormData(initialFormData(defaultStudentId || ""));
    setHasBossBattles(false);
    setAssignPractice(false);
    setHas3LayerSolutions(false);
    setHasChallenges(false);
    setHasTechChallenges(false);
  }, [defaultStudentId, topicState?.topic, topicState?.phase, topicState?.stability]);

  const durationValue = Number(formData.duration);
  const hasValidDuration = Number.isFinite(durationValue) && durationValue >= 30 && durationValue <= 240;
  const isSessionFormValid = !!formData.studentId && hasValidDuration;

  const createSession = useMutation({
    mutationFn: async (data: SessionFormData) => {
      const duration = Number(data.duration);
      if (!Number.isFinite(duration) || duration < 30 || duration > 240) {
        throw new Error("Duration must be between 30 and 240 minutes.");
      }

      const topicSummary = topicState
        ? [
            "Topic Conditioning Observation",
            `Active Topic: ${topicState.topic}`,
            `Phase Observed in Session: ${topicState.phase}`,
            `Stability Observed in Session: ${topicState.stability}`,
            `System Next Action: ${nextActionFor(topicState.phase, topicState.stability)}`,
            topicState.observationNotes?.trim() ? `Observation Notes: ${topicState.observationNotes.trim()}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        : null;

      const rawNotes = data.notes.trim();
      const normalizedRawNotes = rawNotes.toLowerCase();
      const normalizedTopic = String(topicState?.topic || "").trim().toLowerCase();
      const effectiveFreeNotes =
        rawNotes && (!topicState || (normalizedRawNotes !== normalizedTopic && normalizedRawNotes !== "topic conditioning observation"))
          ? rawNotes
          : "";

      const structuredObservation = topicState?.structuredObservation;
      const structuredSummary = structuredObservation
        ? [
            "Structured Topic Observation",
            ...structuredObservation.categories.map((entry) => `${entry.label}: ${entry.value}`),
            `Intervention Used: ${structuredObservation.interventionUsed}`,
            `Session Score: ${structuredObservation.sessionScore}`,
            `Phase Decision: ${structuredObservation.phaseDecision}`,
            `Tutor Explanation: ${structuredObservation.tutorExplanation}`,
            `Parent Meaning: ${structuredObservation.parentMeaning}`,
            `Constraint: ${structuredObservation.constraint}`,
          ].join("\n")
        : null;

      const response = await apiRequest("POST", "/api/tutor/sessions", {
        studentId: data.studentId,
        duration,
        notes: [effectiveFreeNotes, topicSummary, structuredSummary].filter(Boolean).join("\n\n") || null,
        solutionPurpose: data.solutionPurpose.trim() || (topicState ? `Topic conditioning for ${topicState.topic}` : null),
        vocabularyNotes: data.vocabularyNotes.trim() || null,
        methodNotes: [data.methodNotes.trim(), topicState ? `Active Topic: ${topicState.topic}` : null].filter(Boolean).join("\n") || null,
        reasonNotes: data.reasonNotes.trim() || null,
        studentResponse: [
          topicState ? `Phase: ${topicState.phase} | Stability: ${topicState.stability}` : null,
          structuredObservation
            ? structuredObservation.categories.map((entry) => `${entry.label}: ${entry.value}`).join(" | ")
            : null,
          data.studentResponse.trim(),
        ].filter(Boolean).join("\n") || null,
        tutorGrowthReflection: data.tutorGrowthReflection.trim() || null,
        bossBattlesDone: data.bossBattlesDone.trim() || null,
        practiceProblems: data.practiceProblems.trim() || null,
        whatMisunderstood:
          data.whatMisunderstood.trim() ||
          (structuredObservation
            ? structuredObservation.categories
                .filter((entry) => /breakdown|reason|method|structure|pace/i.test(entry.label))
                .map((entry) => `${entry.label}: ${entry.value}`)
                .join("; ")
            : null),
        correctionHelped:
          data.correctionHelped.trim() ||
          (structuredObservation ? structuredObservation.interventionUsed : null),
        needsReinforcement:
          data.needsReinforcement.trim() ||
          (structuredObservation
            ? structuredObservation.nextAction
            : topicState
            ? nextActionFor(topicState.phase, topicState.stability)
            : null),
        techChallengeDescription: data.techChallengeDescription.trim() || null,
        techChallengeResolution: data.techChallengeResolution.trim() || null,
        topicStatePayload: topicState
          ? {
              topic: topicState.topic,
              phase: topicState.phase,
              stability: topicState.stability,
              observationNotes: topicState.observationNotes?.trim() || null,
              nextAction: nextActionFor(topicState.phase, topicState.stability),
              structuredObservation: topicState.structuredObservation || null,
            }
          : null,
        date: new Date().toISOString(),
      });

      return await response.json();
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students"] });
      if (formData.studentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/tutor/students/${formData.studentId}/reports-center`] });
      }

      const inference = result?.topicInference;
      const authoritativeSummary = inference
        ? `Server confirmed ${inference.topic}: ${inference.phase} | ${inference.stability}${
            inference.phaseDecision ? ` | ${String(inference.phaseDecision).toUpperCase()}` : ""
          }`
        : "Your session has been recorded successfully.";

      toast({
        title: "Session logged",
        description: authoritativeSummary,
      });
      setFormData(initialFormData(defaultStudentId || ""));
      setHasBossBattles(false);
      setAssignPractice(false);
      setHas3LayerSolutions(false);
      setHasChallenges(false);
      setHasTechChallenges(false);
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast({ title: "Validation Error", description: "Please select a student.", variant: "destructive" });
      return;
    }
    if (!hasValidDuration) {
      toast({ title: "Validation Error", description: "Duration must be between 30 and 240 minutes.", variant: "destructive" });
      return;
    }
    // ENFORCE: topicState must have topic, phase, and stability
    if (topicState) {
      if (!topicState.topic || !topicState.phase || !topicState.stability) {
        toast({
          title: "Validation Error",
          description: "Topic, phase, and stability are required for observation logs. Please ensure all are set before submitting.",
          variant: "destructive",
        });
        return;
      }
    }
    createSession.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {topicState && (
        <Card className="p-4 space-y-2 border-primary/20 bg-primary/5">
          <p className="text-sm font-semibold">Logging on Topic</p>
          <p className="text-sm text-muted-foreground">
            {topicState.topic} | {topicState.phase} | {topicState.stability}
          </p>
          {topicState.observationNotes ? (
            <p className="text-xs text-muted-foreground">Observation context: {topicState.observationNotes}</p>
          ) : null}
        </Card>
      )}

      {!lockStudent ? (
        <div className="space-y-2">
          <Label htmlFor="student">Student *</Label>
          <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
            <SelectTrigger data-testid="select-student">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {studentOptions.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}{student.grade ? ` - ${student.grade}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Student</Label>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
            {studentOptions[0]?.name || "Selected student"}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes) *</Label>
        <Input
          id="duration"
          type="number"
          min="30"
          max="240"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          data-testid="input-duration"
        />
      </div>

      {compactTopicMode && topicState?.structuredObservation ? (
        <Card className="p-4 space-y-3 border-primary/20 bg-muted/20">
          <p className="text-sm font-semibold">Live Interpretation Preview</p>
          <p className="text-sm text-muted-foreground">
            Score: {topicState.structuredObservation.sessionScore} | Decision: {topicState.structuredObservation.phaseDecision}
          </p>
          <p className="text-sm text-muted-foreground">
            Next action: {topicState.structuredObservation.nextAction}
          </p>
          <p className="text-sm text-muted-foreground">
            Constraint: {topicState.structuredObservation.constraint}
          </p>
          <p className="text-sm text-muted-foreground">
            Tutor explanation: {topicState.structuredObservation.tutorExplanation}
          </p>
          <p className="text-sm text-muted-foreground">
            Parent meaning: {topicState.structuredObservation.parentMeaning}
          </p>
        </Card>
      ) : null}

      {!compactTopicMode ? (
        <>
      <div className="space-y-2">
        <Label htmlFor="notes">Session Notes {topicState ? "(optional context)" : ""}</Label>
        <Textarea
          id="notes"
          placeholder={
            topicState
              ? "Optional extra context beyond the topic-state block"
              : "What did you cover? Any challenges or breakthroughs?"
          }
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          data-testid="input-notes"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="has3LayerSolutions">3-Layer Solutions Implemented?</Label>
          <Switch
            id="has3LayerSolutions"
            checked={has3LayerSolutions}
            onCheckedChange={(checked) => {
              setHas3LayerSolutions(checked);
              if (!checked) {
                setFormData({ ...formData, solutionPurpose: "", vocabularyNotes: "", methodNotes: "", reasonNotes: "" });
              }
            }}
          />
        </div>
        {has3LayerSolutions && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-2">
              <Label htmlFor="solutionPurpose">What solution (describe the purpose)?</Label>
              <Textarea id="solutionPurpose" value={formData.solutionPurpose} onChange={(e) => setFormData({ ...formData, solutionPurpose: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vocabulary">Vocabulary Notes</Label>
              <Textarea id="vocabulary" value={formData.vocabularyNotes} onChange={(e) => setFormData({ ...formData, vocabularyNotes: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method Notes</Label>
              <Textarea id="method" value={formData.methodNotes} onChange={(e) => setFormData({ ...formData, methodNotes: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason Notes</Label>
              <Textarea id="reason" value={formData.reasonNotes} onChange={(e) => setFormData({ ...formData, reasonNotes: e.target.value })} rows={2} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentResponse">Student Response</Label>
        <Textarea id="studentResponse" value={formData.studentResponse} onChange={(e) => setFormData({ ...formData, studentResponse: e.target.value })} rows={2} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="hasChallenges">Any Challenges?</Label>
          <Switch
            id="hasChallenges"
            checked={hasChallenges}
            onCheckedChange={(checked) => {
              setHasChallenges(checked);
              if (!checked) {
                setFormData({ ...formData, whatMisunderstood: "", correctionHelped: "", needsReinforcement: "" });
              }
            }}
          />
        </div>
        {hasChallenges && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-2">
              <Label htmlFor="whatMisunderstood">1. What was misunderstood?</Label>
              <Textarea id="whatMisunderstood" value={formData.whatMisunderstood} onChange={(e) => setFormData({ ...formData, whatMisunderstood: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctionHelped">2. What correction helped?</Label>
              <Textarea id="correctionHelped" value={formData.correctionHelped} onChange={(e) => setFormData({ ...formData, correctionHelped: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="needsReinforcement">3. What needs to be reinforced?</Label>
              <Textarea id="needsReinforcement" value={formData.needsReinforcement} onChange={(e) => setFormData({ ...formData, needsReinforcement: e.target.value })} rows={2} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="hasTechChallenges">Any Tech Challenges?</Label>
          <Switch
            id="hasTechChallenges"
            checked={hasTechChallenges}
            onCheckedChange={(checked) => {
              setHasTechChallenges(checked);
              if (!checked) {
                setFormData({ ...formData, techChallengeDescription: "", techChallengeResolution: "" });
              }
            }}
          />
        </div>
        {hasTechChallenges && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-2">
              <Label htmlFor="techChallengeDescription">1. Describe the challenge & incident</Label>
              <Textarea id="techChallengeDescription" value={formData.techChallengeDescription} onChange={(e) => setFormData({ ...formData, techChallengeDescription: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="techChallengeResolution">2. How it ended (methods taken)</Label>
              <Textarea id="techChallengeResolution" value={formData.techChallengeResolution} onChange={(e) => setFormData({ ...formData, techChallengeResolution: e.target.value })} rows={2} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reflection">Tutor Growth Reflection/Notes</Label>
        <Textarea id="reflection" value={formData.tutorGrowthReflection} onChange={(e) => setFormData({ ...formData, tutorGrowthReflection: e.target.value })} rows={2} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="hasBossBattles">Any Boss Battles done in-session?</Label>
          <Switch
            id="hasBossBattles"
            checked={hasBossBattles}
            onCheckedChange={(checked) => {
              setHasBossBattles(checked);
              if (!checked) {
                setFormData({ ...formData, bossBattlesDone: "" });
              }
            }}
          />
        </div>
        {hasBossBattles && (
          <Textarea value={formData.bossBattlesDone} onChange={(e) => setFormData({ ...formData, bossBattlesDone: e.target.value })} rows={2} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="assignPractice">Assign Practice Problems?</Label>
          <Switch
            id="assignPractice"
            checked={assignPractice}
            onCheckedChange={(checked) => {
              setAssignPractice(checked);
              if (!checked) {
                setFormData({ ...formData, practiceProblems: "" });
              }
            }}
          />
        </div>
        {assignPractice && (
          <Textarea value={formData.practiceProblems} onChange={(e) => setFormData({ ...formData, practiceProblems: e.target.value })} rows={2} />
        )}
      </div>
        </>
      ) : null}

      <div className="space-y-2">
        <Button type="submit" disabled={createSession.isPending || !isSessionFormValid}>
          {createSession.isPending ? "Saving..." : submitLabel}
        </Button>
        {!isSessionFormValid ? (
          <p className="text-xs text-muted-foreground">Select a student and use a duration between 30 and 240 minutes.</p>
        ) : null}
      </div>
    </form>
  );
}
