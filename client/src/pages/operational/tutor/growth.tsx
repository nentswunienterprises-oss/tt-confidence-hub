import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, TrendingUp, ClipboardList } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Reflection } from "@shared/schema";
import { format, startOfWeek } from "date-fns";

export default function TutorGrowth() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [reflectionText, setReflectionText] = useState("");
  const [habitScore, setHabitScore] = useState([5]);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInData, setCheckInData] = useState({
    sessionsSummary: "",
    wins: "",
    challenges: "",
    emotions: "",
    skillImprovement: "",
    helpNeeded: "",
    nextWeekGoals: "",
  });

  const {
    data: reflections,
    isLoading,
    error,
  } = useQuery<Reflection[]>({
    queryKey: ["/api/tutor/reflections"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: podAssignment,
  } = useQuery({
    queryKey: ["/api/tutor/pod"],
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
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [error, toast]);

  const createReflection = useMutation({
    mutationFn: async (data: { reflectionText: string; habitScore: number }) => {
      await apiRequest("POST", "/api/tutor/reflections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/reflections"] });
      setReflectionText("");
      setHabitScore([5]);
      toast({
        title: "Reflection saved",
        description: "Your reflection has been recorded successfully.",
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
        description: "Failed to save reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitWeeklyCheckIn = useMutation({
    mutationFn: async () => {
      const podId = podAssignment?.assignment?.podId;
      if (!podId) throw new Error("Pod ID not found");

      await apiRequest("POST", "/api/tutor/weekly-check-in", {
        podId,
        weekStartDate: startOfWeek(new Date()).toISOString(),
        ...checkInData,
      });
    },
    onSuccess: () => {
      setCheckInDialogOpen(false);
      setCheckInData({
        sessionsSummary: "",
        wins: "",
        challenges: "",
        emotions: "",
        skillImprovement: "",
        helpNeeded: "",
        nextWeekGoals: "",
      });
      toast({
        title: "Check-in submitted",
        description: "Your weekly check-in has been recorded and sent to your TD.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please write a reflection before submitting.",
        variant: "destructive",
      });
      return;
    }
    createReflection.mutate({
      reflectionText: reflectionText.trim(),
      habitScore: habitScore[0],
    });
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-40" />
        </div>
      </DashboardLayout>
    );
  }

  const avgHabitScore =
    reflections && reflections.length > 0
      ? reflections.reduce((sum, r) => sum + (r.habitScore || 0), 0) / reflections.length
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Growth & Reflections</h1>
          <p className="text-muted-foreground">Track your journey and celebrate every step forward</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{reflections?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Reflections</p>
            </div>
          </Card>

          <Card className="p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{avgHabitScore.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Average Habit Score</p>
            </div>
          </Card>
        </div>

        {/* New Reflection Form */}
        <Card className="p-6 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reflection" className="text-base font-semibold">
                New Reflection
              </Label>
              <Textarea
                id="reflection"
                placeholder="What went well today? What did you learn? What are you proud of?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="min-h-32 resize-none"
                data-testid="input-reflection-text"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="habit-score" className="text-base font-semibold">
                  Habit Score
                </Label>
                <span className="text-2xl font-bold text-primary">{habitScore[0]}/10</span>
              </div>
              <Slider
                id="habit-score"
                min={1}
                max={10}
                step={1}
                value={habitScore}
                onValueChange={setHabitScore}
                className="py-4"
                data-testid="input-habit-score"
              />
              <p className="text-xs text-muted-foreground">
                Rate your consistency and discipline today (1 = poor, 10 = excellent)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={createReflection.isPending}
              data-testid="button-submit-reflection"
            >
              <Plus className="w-4 h-4" />
              {createReflection.isPending ? "Saving..." : "Save Reflection"}
            </Button>
          </form>
        </Card>

        {/* Reflections History */}
        <Card className="border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Reflection History</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {!reflections || reflections.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No reflections yet</p>
                <p className="text-sm text-muted-foreground/80">Start documenting your growth journey today</p>
              </div>
            ) : (
              reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="p-6 space-y-3"
                  data-testid={`reflection-${reflection.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(reflection.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="leading-relaxed">{reflection.reflectionText}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {reflection.habitScore}
                        </span>
                      </div>
                      <span className="text-2xs text-muted-foreground uppercase tracking-wide">
                        Score
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Weekly Check-In Section */}
        <Card className="p-6 border bg-slate-50/30 border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
                <ClipboardList className="w-5 h-5 text-slate-600" />
                Weekly Check-In
              </h2>
              <p className="text-sm text-muted-foreground">
                Submit your weekly update to your Territory Director
              </p>
            </div>
          </div>

          <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" variant="default">
                <Plus className="w-4 h-4" />
                Start Weekly Check-In
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Weekly Check-In for Week of {format(startOfWeek(new Date()), "MMMM d, yyyy")}</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitWeeklyCheckIn.mutate();
                }}
                className="space-y-6"
              >
                {/* Sessions Summary */}
                <div className="space-y-2">
                  <Label htmlFor="sessions-summary" className="font-semibold">
                    How were your sessions this week?
                  </Label>
                  <Textarea
                    id="sessions-summary"
                    placeholder="Describe how your sessions went, energy levels, student engagement, etc."
                    value={checkInData.sessionsSummary}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, sessionsSummary: e.target.value })
                    }
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Wins */}
                <div className="space-y-2">
                  <Label htmlFor="wins" className="font-semibold">
+                    Wins this week
                  </Label>
                  <Textarea
                    id="wins"
                    placeholder="What went well? What are you proud of?"
                    value={checkInData.wins}
                    onChange={(e) => setCheckInData({ ...checkInData, wins: e.target.value })}
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Challenges */}
                <div className="space-y-2">
                  <Label htmlFor="challenges" className="font-semibold">
                    Challenges faced
                  </Label>
                  <Textarea
                    id="challenges"
                    placeholder="What challenges did you face this week?"
                    value={checkInData.challenges}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, challenges: e.target.value })
                    }
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Emotions & Thoughts */}
                <div className="space-y-2">
                  <Label htmlFor="emotions" className="font-semibold">
                    Emotions felt and thoughts
                  </Label>
                  <Textarea
                    id="emotions"
                    placeholder="How are you feeling? What's on your mind?"
                    value={checkInData.emotions}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, emotions: e.target.value })
                    }
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Skill Improvement */}
                <div className="space-y-2">
                  <Label htmlFor="skill-improvement" className="font-semibold">
                    Working on improving about student transformation skills
                  </Label>
                  <Textarea
                    id="skill-improvement"
                    placeholder="What aspect of your tutoring/transformation skills are you working on?"
                    value={checkInData.skillImprovement}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, skillImprovement: e.target.value })
                    }
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Help Needed */}
                <div className="space-y-2">
                  <Label htmlFor="help-needed" className="font-semibold">
                    Help needed or questions (Optional)
                  </Label>
                  <Textarea
                    id="help-needed"
                    placeholder="Is there anything you need help with or any questions for your TD?"
                    value={checkInData.helpNeeded}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, helpNeeded: e.target.value })
                    }
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Next Week Goals */}
                <div className="space-y-2">
                  <Label htmlFor="next-week-goals" className="font-semibold">
                    Goals for next week
                  </Label>
                  <Textarea
                    id="next-week-goals"
                    placeholder="What are your goals for next week?"
                    value={checkInData.nextWeekGoals}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, nextWeekGoals: e.target.value })
                    }
                    className="min-h-24 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitWeeklyCheckIn.isPending}
                >
                  {submitWeeklyCheckIn.isPending ? "Submitting..." : "Submit Check-In"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </DashboardLayout>
  );
}
