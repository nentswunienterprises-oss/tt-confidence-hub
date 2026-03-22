import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Session, Student } from "@shared/schema";
import { format } from "date-fns";

export default function TutorSessions() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasBossBattles, setHasBossBattles] = useState(false);
  const [assignPractice, setAssignPractice] = useState(false);
  const [has3LayerSolutions, setHas3LayerSolutions] = useState(false);
  const [hasChallenges, setHasChallenges] = useState(false);
  const [hasTechChallenges, setHasTechChallenges] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    duration: "120",
    notes: "",
    // 3-Layer Lens Teaching Model fields
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
  });

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery<Session[]>({
    queryKey: ["/api/tutor/sessions"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: students,
    isLoading: studentsLoading,
  } = useQuery<Student[]>({
    queryKey: ["/api/tutor/students"],
    enabled: isAuthenticated && !authLoading,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (sessionsError && isUnauthorizedError(sessionsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [sessionsError, toast]);

  const createSession = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/tutor/sessions", {
        studentId: data.studentId,
        duration: parseInt(data.duration),
        notes: data.notes.trim() || null,
        solutionPurpose: data.solutionPurpose.trim() || null,
        vocabularyNotes: data.vocabularyNotes.trim() || null,
        methodNotes: data.methodNotes.trim() || null,
        reasonNotes: data.reasonNotes.trim() || null,
        studentResponse: data.studentResponse.trim() || null,
        tutorGrowthReflection: data.tutorGrowthReflection.trim() || null,
        bossBattlesDone: data.bossBattlesDone.trim() || null,
        practiceProblems: data.practiceProblems.trim() || null,
        whatMisunderstood: data.whatMisunderstood.trim() || null,
        correctionHelped: data.correctionHelped.trim() || null,
        needsReinforcement: data.needsReinforcement.trim() || null,
        techChallengeDescription: data.techChallengeDescription.trim() || null,
        techChallengeResolution: data.techChallengeResolution.trim() || null,
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students"] });
      setDialogOpen(false);
      setHasBossBattles(false);
      setAssignPractice(false);
      setHas3LayerSolutions(false);
      setHasChallenges(false);
      setHasTechChallenges(false);
      setFormData({ 
        studentId: "", 
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
      });
      toast({
        title: "Session logged",
        description: "Your session has been recorded successfully.",
      });
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
        description: "Failed to log session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.duration) {
      toast({
        title: "Validation Error",
        description: "Please select a student and duration.",
        variant: "destructive",
      });
      return;
    }
    createSession.mutate(formData);
  };

  if (authLoading || sessionsLoading || studentsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const getStudentName = (studentId: string) => {
    return students?.find((s) => s.id === studentId)?.name || "Unknown";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sessions</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-log-session">
                <Plus className="w-4 h-4" />
                Log Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Log New Session</DialogTitle>
                  <DialogDescription>
                    Record your session using the 3-Layer Lens Teaching Model
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Student Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="student">Student *</Label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, studentId: value })
                      }
                    >
                      <SelectTrigger data-testid="select-student">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="30"
                      max="240"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      data-testid="input-duration"
                    />
                  </div>

                  {/* Session Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Session Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="What did you cover? Any challenges or breakthroughs?"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      data-testid="input-notes"
                    />
                  </div>

                  {/* 3-Layer Solutions Implemented */}
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
                        data-testid="switch-3-layer-solutions"
                      />
                    </div>
                    {has3LayerSolutions && (
                      <div className="space-y-3 border-t pt-3">
                        <div className="space-y-2">
                          <Label htmlFor="solutionPurpose">What solution (describe the purpose)?</Label>
                          <Textarea
                            id="solutionPurpose"
                            placeholder="What is the purpose of this solution? What problem does it solve?"
                            value={formData.solutionPurpose}
                            onChange={(e) => setFormData({ ...formData, solutionPurpose: e.target.value })}
                            rows={2}
                            data-testid="input-solution-purpose"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vocabulary">Vocabulary Notes</Label>
                          <Textarea
                            id="vocabulary"
                            placeholder="What terms/concepts did you teach?"
                            value={formData.vocabularyNotes}
                            onChange={(e) => setFormData({ ...formData, vocabularyNotes: e.target.value })}
                            rows={2}
                            data-testid="input-vocabulary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="method">Method Notes</Label>
                          <Textarea
                            id="method"
                            placeholder="What steps/process did you follow?"
                            value={formData.methodNotes}
                            onChange={(e) => setFormData({ ...formData, methodNotes: e.target.value })}
                            rows={2}
                            data-testid="input-method"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason Notes</Label>
                          <Textarea
                            id="reason"
                            placeholder="Why does this approach work?"
                            value={formData.reasonNotes}
                            onChange={(e) => setFormData({ ...formData, reasonNotes: e.target.value })}
                            rows={2}
                            data-testid="input-reason"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student Response */}
                  <div className="space-y-2">
                    <Label htmlFor="studentResponse">Student Response</Label>
                    <Textarea
                      id="studentResponse"
                      placeholder="How did the student respond to today's session?"
                      value={formData.studentResponse}
                      onChange={(e) => setFormData({ ...formData, studentResponse: e.target.value })}
                      rows={2}
                      data-testid="input-student-response"
                    />
                  </div>

                  {/* Any Challenges */}
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
                        data-testid="switch-challenges"
                      />
                    </div>
                    {hasChallenges && (
                      <div className="space-y-3 border-t pt-3">
                        <div className="space-y-2">
                          <Label htmlFor="whatMisunderstood">1. What was misunderstood?</Label>
                          <Textarea
                            id="whatMisunderstood"
                            placeholder="Describe what the student misunderstood"
                            value={formData.whatMisunderstood}
                            onChange={(e) => setFormData({ ...formData, whatMisunderstood: e.target.value })}
                            rows={2}
                            data-testid="input-what-misunderstood"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="correctionHelped">2. What correction helped?</Label>
                          <Textarea
                            id="correctionHelped"
                            placeholder="Describe the correction or approach that helped"
                            value={formData.correctionHelped}
                            onChange={(e) => setFormData({ ...formData, correctionHelped: e.target.value })}
                            rows={2}
                            data-testid="input-correction-helped"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="needsReinforcement">3. What needs to be reinforced?</Label>
                          <Textarea
                            id="needsReinforcement"
                            placeholder="Describe what concepts or skills need reinforcement"
                            value={formData.needsReinforcement}
                            onChange={(e) => setFormData({ ...formData, needsReinforcement: e.target.value })}
                            rows={2}
                            data-testid="input-needs-reinforcement"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Any Tech Challenges */}
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
                        data-testid="switch-tech-challenges"
                      />
                    </div>
                    {hasTechChallenges && (
                      <div className="space-y-3 border-t pt-3">
                        <div className="space-y-2">
                          <Label htmlFor="techChallengeDescription">1. Describe the challenge & incident</Label>
                          <Textarea
                            id="techChallengeDescription"
                            placeholder="Describe the technical challenge and what happened"
                            value={formData.techChallengeDescription}
                            onChange={(e) => setFormData({ ...formData, techChallengeDescription: e.target.value })}
                            rows={2}
                            data-testid="input-tech-challenge-description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="techChallengeResolution">2. How it ended (methods taken)</Label>
                          <Textarea
                            id="techChallengeResolution"
                            placeholder="Describe how the issue was resolved or the methods used"
                            value={formData.techChallengeResolution}
                            onChange={(e) => setFormData({ ...formData, techChallengeResolution: e.target.value })}
                            rows={2}
                            data-testid="input-tech-challenge-resolution"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tutor Growth Reflection */}
                  <div className="space-y-2">
                    <Label htmlFor="reflection">Tutor Growth Reflection/Notes</Label>
                    <Textarea
                      id="reflection"
                      placeholder="What did you learn? How can you improve?"
                      value={formData.tutorGrowthReflection}
                      onChange={(e) => setFormData({ ...formData, tutorGrowthReflection: e.target.value })}
                      rows={2}
                      data-testid="input-tutor-reflection"
                    />
                  </div>

                  {/* Boss Battles */}
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
                        data-testid="switch-boss-battles"
                      />
                    </div>
                    {hasBossBattles && (
                      <Textarea
                        placeholder="Describe the Boss Battles completed"
                        value={formData.bossBattlesDone}
                        onChange={(e) => setFormData({ ...formData, bossBattlesDone: e.target.value })}
                        rows={2}
                        data-testid="input-boss-battles"
                      />
                    )}
                  </div>

                  {/* Practice Problems */}
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
                        data-testid="switch-practice-problems"
                      />
                    </div>
                    {assignPractice && (
                      <Textarea
                        placeholder="Practice problems assigned for student"
                        value={formData.practiceProblems}
                        onChange={(e) => setFormData({ ...formData, practiceProblems: e.target.value })}
                        rows={2}
                        data-testid="input-practice-problems"
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createSession.isPending}
                    data-testid="button-submit-session"
                  >
                    {createSession.isPending ? "Saving..." : "Log Session"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">{sessions?.length || 0}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">
                {sessions?.reduce((sum, s) => sum + s.duration, 0) || 0}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Minutes</p>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">
                {sessions && sessions.length > 0
                  ? (
                      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
                    ).toFixed(0)
                  : 0}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Avg. Duration</p>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Session History</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {!sessions || sessions.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No sessions logged yet</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 space-y-3"
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{getStudentName(session.studentId)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.duration} min</p>
                        {session.confidenceScoreDelta !== null &&
                          session.confidenceScoreDelta !== 0 && (
                            <p
                              className={`text-xs font-semibold ${
                                session.confidenceScoreDelta > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {session.confidenceScoreDelta > 0 ? "+" : ""}
                              {session.confidenceScoreDelta} confidence
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {session.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
