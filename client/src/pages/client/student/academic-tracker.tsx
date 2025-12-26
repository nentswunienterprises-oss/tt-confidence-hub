import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { AcademicProfile, StruggleTarget } from "@shared/schema";
import { format } from "date-fns";

export default function StudentAcademicTracker() {
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
    queryKey: ["/api/student/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const {
    data: targets,
    isLoading: targetsLoading,
    refetch: refetchTargets,
  } = useQuery<StruggleTarget[]>({
    queryKey: ["/api/student/targets"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || "",
        grade: profile.grade || "",
        school: profile.school || "",
        latestTermReport: profile.latestTermReport || "",
        myThoughts: profile.myThoughts || "",
        currentChallenges: profile.currentChallenges || "",
        recentWins: profile.recentWins || "",
        upcomingExamsProjects: profile.upcomingExamsProjects || "",
      });
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/student/profile`, profileData);
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
        window.location.href = "/student-login";
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
          const res = await apiRequest("PUT", `/api/student/targets/${editingTargetId}`, {
            ...targetData,
            consolidationDate: targetData.consolidationDate ? new Date(targetData.consolidationDate).toISOString() : null,
          });
          const json = await res.json();
          console.log("PUT response:", json);
          return json;
        } else {
          const res = await apiRequest("POST", `/api/student/targets`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/student/targets"] });
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
        window.location.href = "/student-login";
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
      await apiRequest("PUT", `/api/student/targets/${id}`, { overcame });
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
      await apiRequest("DELETE", `/api/student/targets/${id}`, {});
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

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:gap-2 border-b pb-4 sm:pb-6">
        <h1 className="text-xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Academic Health Center
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Your personal command center for academic excellence and strategic growth
        </p>
      </div>

      {/* Academic Profile Section */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 space-y-0 pb-4 border-b p-3 sm:p-6">
          <div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
              Academic Profile
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Your command center. Answer: What's happening? How do you feel? What's next?
            </p>
          </div>
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-full sm:w-auto">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Update Academic Profile</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Update your academic profile and current status
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name *</Label>
                    <Input
                      id="fullName"
                      className="text-sm"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="grade" className="text-xs sm:text-sm">Grade *</Label>
                    <Input
                      id="grade"
                      className="text-sm"
                      value={profileData.grade}
                      onChange={(e) => setProfileData({ ...profileData, grade: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="school" className="text-xs sm:text-sm">School</Label>
                  <Input
                    id="school"
                    className="text-sm"
                    value={profileData.school}
                    onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="termReport" className="text-xs sm:text-sm">Latest Term Report</Label>
                  <Textarea
                    id="termReport"
                    className="text-sm"
                    placeholder="Summary of recent academic performance..."
                    value={profileData.latestTermReport}
                    onChange={(e) => setProfileData({ ...profileData, latestTermReport: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="thoughts">My Thoughts</Label>
                  <Textarea
                    id="thoughts"
                    placeholder="How do you feel about your progress?"
                    value={profileData.myThoughts}
                    onChange={(e) => setProfileData({ ...profileData, myThoughts: e.target.value })}
                    rows={2}
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => saveProfile.mutate()}
                  disabled={saveProfile.isPending || !profileData.fullName || !profileData.grade}
                >
                  {saveProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : profile || profileData.fullName ? (
            <div className="grid gap-3 sm:gap-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-sm sm:text-base">{profile?.fullName || profileData.fullName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Grade</p>
                  <p className="text-sm sm:text-base">{profile?.grade || profileData.grade || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">School</p>
                  <p className="text-sm sm:text-base">{profile?.school || profileData.school || "Not set"}</p>
                </div>
              </div>
              {(profile?.latestTermReport || profileData.latestTermReport) && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Latest Term Report</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{profile?.latestTermReport || profileData.latestTermReport}</p>
                </div>
              )}
              {(profile?.myThoughts || profileData.myThoughts) && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">My Thoughts</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{profile?.myThoughts || profileData.myThoughts}</p>
                </div>
              )}
              {(profile?.currentChallenges || profileData.currentChallenges) && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Challenges</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{profile?.currentChallenges || profileData.currentChallenges}</p>
                </div>
              )}
              {(profile?.recentWins || profileData.recentWins) && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Recent Wins</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{profile?.recentWins || profileData.recentWins}</p>
                </div>
              )}
              {profileData.upcomingExamsProjects && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Upcoming Exams/Projects</p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{profileData.upcomingExamsProjects}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No profile data yet. Click Edit to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* Target Center Section */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 space-y-0 pb-4 border-b p-3 sm:p-6">
          <div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
              Strategy Center
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              From stuck to strategic. Plan your bounce-back from academic struggles.
            </p>
          </div>
          <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2 w-full sm:w-auto"
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
            <DialogContent className="max-w-2xl mx-2 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {editingTargetId ? "Edit Struggle Target" : "New Struggle Target"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm" className="text-xs sm:text-sm">
                  Track a specific struggle and plan how to overcome it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="subject" className="text-xs sm:text-sm">Subject *</Label>
                    <Input
                      id="subject"
                      className="text-sm"
                      placeholder="e.g., Mathematics"
                      value={targetData.subject}
                      onChange={(e) => setTargetData({ ...targetData, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="topic" className="text-xs sm:text-sm">Topic/Concept *</Label>
                    <Input
                      id="topic"
                      className="text-sm"
                      placeholder="e.g., Quadratic Equations"
                      value={targetData.topicConcept}
                      onChange={(e) => setTargetData({ ...targetData, topicConcept: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="struggle" className="text-xs sm:text-sm">My Struggle *</Label>
                  <Textarea
                    id="struggle"
                    className="text-sm"
                    placeholder="What exactly are you struggling with?"
                    value={targetData.myStruggle}
                    onChange={(e) => setTargetData({ ...targetData, myStruggle: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="strategy" className="text-xs sm:text-sm">Strategy *</Label>
                  <Textarea
                    id="strategy"
                    className="text-sm"
                    placeholder="What will you do to overcome this?"
                    value={targetData.strategy}
                    onChange={(e) => setTargetData({ ...targetData, strategy: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="consolidationDate" className="text-xs sm:text-sm">Consolidation Date</Label>
                  <Input
                    id="consolidationDate"
                    className="text-sm"
                    type="date"
                    value={targetData.consolidationDate}
                    onChange={(e) => setTargetData({ ...targetData, consolidationDate: e.target.value })}
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
                >
                  {saveTarget.isPending ? "Saving..." : editingTargetId ? "Update Target" : "Add Target"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {targetsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : !targets || targets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
              No struggle targets yet. Click "Add Target" to track a challenge.
            </p>
          ) : (
            <div className="space-y-3">
              {targets.map((target) => (
                <Card key={target.id}>
                  <CardContent className="p-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{target.subject}</Badge>
                          <Badge variant="secondary" className="text-xs">{target.topicConcept}</Badge>
                          {target.overcame ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Overcame
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">In Progress</Badge>
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Struggle:</p>
                          <p className="text-xs sm:text-sm">{target.myStruggle}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Strategy:</p>
                          <p className="text-xs sm:text-sm">{target.strategy}</p>
                        </div>
                        {target.consolidationDate && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
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
                      <div className="flex flex-row sm:flex-col gap-2 justify-between sm:justify-start">
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
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditTarget(target)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteTarget.mutate(target.id)}
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
  );
}
