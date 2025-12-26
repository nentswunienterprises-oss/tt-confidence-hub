import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Plus,
  Target,
  Edit,
  Trash2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Student, AcademicProfile, StruggleTarget } from "@shared/schema";
import { format } from "date-fns";

export default function SchoolTracker() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    fullName: "",
    grade: "",
    school: "",
    latestTermReport: "",
    myThoughts: "",
    currentChallenges: "",
    recentWins: "",
    upcomingExamsProjects: "",
  });

  const [targetData, setTargetData] = useState({
    subject: "",
    topicConcept: "",
    myStruggle: "",
    strategy: "",
    consolidationDate: "",
  });

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<AcademicProfile | null>({
    queryKey: ["/api/tutor/profile"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: targets,
    isLoading: targetsLoading,
    refetch: refetchTargets,
  } = useQuery<StruggleTarget[]>({
    queryKey: ["/api/tutor/targets"],
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
    if (profile) {
      setProfileData({
        fullName: profile.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""),
        grade: profile.grade || "",
        school: profile.school || "",
        latestTermReport: profile.latestTermReport || "",
        myThoughts: profile.myThoughts || "",
        currentChallenges: profile.currentChallenges || "",
        recentWins: profile.recentWins || "",
        upcomingExamsProjects: profile.upcomingExamsProjects || "",
      });
    }
  }, [profile, user]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tutor/profile`, profileData);
      return await res.json();
    },
    onSuccess: () => {
      refetchProfile();
      setProfileDialogOpen(false);
      toast({
        title: "Profile saved",
        description: "Your academic profile updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveTarget = useMutation({
    mutationFn: async () => {
      try {
        if (editingTargetId) {
          const res = await apiRequest("PUT", `/api/tutor/targets/${editingTargetId}`, {
            ...targetData,
            consolidationDate: targetData.consolidationDate ? new Date(targetData.consolidationDate).toISOString() : null,
          });
          const json = await res.json();
          console.log("PUT response:", json);
          return json;
        } else {
          const res = await apiRequest("POST", `/api/tutor/targets`, {
            ...targetData,
            consolidationDate: targetData.consolidationDate ? new Date(targetData.consolidationDate).toISOString() : null,
          });
          const json = await res.json();
          console.log("POST response:", json);
          return json;
        }
      } catch (err) {
        console.error("Mutation error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      refetchTargets();
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/targets"] });
      setTargetDialogOpen(false);
      setEditingTargetId(null);
      setTargetData({
        subject: "",
        topicConcept: "",
        myStruggle: "",
        strategy: "",
        consolidationDate: "",
      });
      toast({
        title: editingTargetId ? "Target updated" : "Target added",
        description: "Struggle target saved successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save target. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleOvercame = useMutation({
    mutationFn: async ({ id, overcame }: { id: string; overcame: boolean }) => {
      await apiRequest("PUT", `/api/tutor/targets/${id}`, { overcame });
    },
    onSuccess: () => {
      refetchTargets();
      toast({
        title: "Target updated",
        description: "Status changed successfully.",
      });
    },
  });

  const deleteTarget = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tutor/targets/${id}`, {});
    },
    onSuccess: () => {
      refetchTargets();
      toast({
        title: "Target deleted",
        description: "Struggle target removed successfully.",
      });
    },
  });

  const handleEditTarget = (target: StruggleTarget) => {
    setEditingTargetId(target.id);
    setTargetData({
      subject: target.subject,
      topicConcept: target.topicConcept || "",
      myStruggle: target.myStruggle || "",
      strategy: target.strategy,
      consolidationDate: target.consolidationDate
        ? format(new Date(target.consolidationDate), "yyyy-MM-dd")
        : "",
    });
    setTargetDialogOpen(true);
  };

  if (authLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2 border-b pb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
            Academic Health Center
          </h1>
          <p className="text-muted-foreground text-lg">
            Your personal command center for academic excellence and strategic growth
          </p>
        </div>

        {/* Academic Profile Section */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                Academic Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Your command center. Answer: What's happening? How do you feel? What's next?
              </p>
            </div>
                <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" data-testid="button-edit-profile">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Update Academic Profile</DialogTitle>
                      <DialogDescription>
                        Update the student's academic profile and current status
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            data-testid="input-full-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade *</Label>
                          <Input
                            id="grade"
                            value={profileData.grade}
                            onChange={(e) => setProfileData({ ...profileData, grade: e.target.value })}
                            data-testid="input-grade"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="school">School</Label>
                        <Input
                          id="school"
                          value={profileData.school}
                          onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
                          data-testid="input-school"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="termReport">Latest Term Report</Label>
                        <Textarea
                          id="termReport"
                          placeholder="Summary of recent academic performance..."
                          value={profileData.latestTermReport}
                          onChange={(e) => setProfileData({ ...profileData, latestTermReport: e.target.value })}
                          rows={3}
                          data-testid="input-term-report"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="thoughts">My Thoughts</Label>
                        <Textarea
                          id="thoughts"
                          placeholder="How do you feel about your progress?"
                          value={profileData.myThoughts}
                          onChange={(e) => setProfileData({ ...profileData, myThoughts: e.target.value })}
                          rows={2}
                          data-testid="input-thoughts"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="challenges">Current Challenges</Label>
                        <Textarea
                          id="challenges"
                          placeholder="What's difficult right now?"
                          value={profileData.currentChallenges}
                          onChange={(e) => setProfileData({ ...profileData, currentChallenges: e.target.value })}
                          rows={2}
                          data-testid="input-challenges"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wins">Recent Wins</Label>
                        <Textarea
                          id="wins"
                          placeholder="What went well recently?"
                          value={profileData.recentWins}
                          onChange={(e) => setProfileData({ ...profileData, recentWins: e.target.value })}
                          rows={2}
                          data-testid="input-wins"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exams">Upcoming Exams/Projects</Label>
                        <Textarea
                          id="exams"
                          placeholder="What's coming up?"
                          value={profileData.upcomingExamsProjects}
                          onChange={(e) => setProfileData({ ...profileData, upcomingExamsProjects: e.target.value })}
                          rows={2}
                          data-testid="input-exams"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => saveProfile.mutate()}
                        disabled={saveProfile.isPending || !profileData.fullName || !profileData.grade}
                        data-testid="button-save-profile"
                      >
                        {saveProfile.isPending ? "Saving..." : "Save Profile"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : profile || profileData.fullName ? (
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-base">{profile?.fullName || profileData.fullName || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Grade</p>
                        <p className="text-base">{profile?.grade || profileData.grade || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">School</p>
                        <p className="text-base">{profile?.school || profileData.school || "Not set"}</p>
                      </div>
                    </div>
                    {(profile?.latestTermReport || profileData.latestTermReport) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Latest Term Report</p>
                        <p className="text-base whitespace-pre-wrap">{profile?.latestTermReport || profileData.latestTermReport}</p>
                      </div>
                    )}
                    {(profile?.myThoughts || profileData.myThoughts) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">My Thoughts</p>
                        <p className="text-base whitespace-pre-wrap">{profile?.myThoughts || profileData.myThoughts}</p>
                      </div>
                    )}
                    {(profile?.currentChallenges || profileData.currentChallenges) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Challenges</p>
                        <p className="text-base whitespace-pre-wrap">{profile?.currentChallenges || profileData.currentChallenges}</p>
                      </div>
                    )}
                    {(profile?.recentWins || profileData.recentWins) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Recent Wins</p>
                        <p className="text-base whitespace-pre-wrap">{profile?.recentWins || profileData.recentWins}</p>
                      </div>
                    )}
                    {profileData.upcomingExamsProjects && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Upcoming Exams/Projects</p>
                        <p className="text-base whitespace-pre-wrap">{profileData.upcomingExamsProjects}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No profile data yet. Click Edit to get started.</p>
                )}
              </CardContent>
            </Card>

            {/* Target Center Section */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    Strategy Center
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    From stuck to strategic. Plan your bounce-back from academic struggles.
                  </p>
                </div>
                <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2"
                      data-testid="button-add-target"
                      onClick={() => {
                        setEditingTargetId(null);
                        setTargetData({
                          subject: "",
                          topicConcept: "",
                          myStruggle: "",
                          strategy: "",
                          consolidationDate: "",
                        });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTargetId ? "Edit Struggle Target" : "New Struggle Target"}
                      </DialogTitle>
                      <DialogDescription>
                        Track a specific struggle and plan how to overcome it
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            placeholder="e.g., Mathematics"
                            value={targetData.subject}
                            onChange={(e) => setTargetData({ ...targetData, subject: e.target.value })}
                            data-testid="input-subject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="topic">Topic/Concept *</Label>
                          <Input
                            id="topic"
                            placeholder="e.g., Quadratic Equations"
                            value={targetData.topicConcept}
                            onChange={(e) => setTargetData({ ...targetData, topicConcept: e.target.value })}
                            data-testid="input-topic"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="struggle">My Struggle *</Label>
                        <Textarea
                          id="struggle"
                          placeholder="What exactly are you struggling with?"
                          value={targetData.myStruggle}
                          onChange={(e) => setTargetData({ ...targetData, myStruggle: e.target.value })}
                          rows={3}
                          data-testid="input-struggle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="strategy">Strategy *</Label>
                        <Textarea
                          id="strategy"
                          placeholder="What will you do to overcome this?"
                          value={targetData.strategy}
                          onChange={(e) => setTargetData({ ...targetData, strategy: e.target.value })}
                          rows={3}
                          data-testid="input-strategy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consolidationDate">Consolidation Date</Label>
                        <Input
                          id="consolidationDate"
                          type="date"
                          value={targetData.consolidationDate}
                          onChange={(e) => setTargetData({ ...targetData, consolidationDate: e.target.value })}
                          data-testid="input-consolidation-date"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => saveTarget.mutate()}
                        disabled={
                          saveTarget.isPending ||
                          !targetData.subject ||
                          !targetData.topicConcept ||
                          !targetData.myStruggle ||
                          !targetData.strategy
                        }
                        data-testid="button-save-target"
                      >
                        {saveTarget.isPending ? "Saving..." : editingTargetId ? "Update Target" : "Add Target"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {targetsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : !targets || targets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No struggle targets yet. Click "Add Target" to track a challenge.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {targets.map((target) => (
                      <Card key={target.id} data-testid={`card-target-${target.id}`}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{target.subject}</Badge>
                                <Badge variant="secondary">{target.topicConcept}</Badge>
                                {target.overcame ? (
                                  <Badge className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Overcame
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">In Progress</Badge>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Struggle:</p>
                                <p className="text-sm">{target.myStruggle}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Strategy:</p>
                                <p className="text-sm">{target.strategy}</p>
                              </div>
                              {target.consolidationDate && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Target:{" "}
                                    {format(
                                      new Date(target.consolidationDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`overcame-${target.id}`} className="text-xs">
                                  Overcame?
                                </Label>
                                <Switch
                                  id={`overcame-${target.id}`}
                                  checked={target.overcame}
                                  onCheckedChange={(checked) =>
                                    toggleOvercame.mutate({ id: target.id, overcame: checked })
                                  }
                                  data-testid={`switch-overcame-${target.id}`}
                                />
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditTarget(target)}
                                  data-testid={`button-edit-target-${target.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteTarget.mutate(target.id)}
                                  data-testid={`button-delete-target-${target.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </DashboardLayout>
  );
}
