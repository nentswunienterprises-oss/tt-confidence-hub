import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Target, Plus, CheckCircle2, Flame, Calendar, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Commitment {
  id: string;
  name: string;
  description: string;
  whyCommitment: string;
  dailyAction: string;
  streakCount: number;
  lastCompletedDate: string | null;
  isActive: boolean;
}

interface Reflection {
  id: string;
  date: string;
  reflectionText: string;
  mood?: string;
  tags?: string;
}

export default function StudentGrowth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commitmentDialogOpen, setCommitmentDialogOpen] = useState(false);
  const [reflectionDialogOpen, setReflectionDialogOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  
  const [commitmentForm, setCommitmentForm] = useState({
    name: "",
    description: "",
    whyCommitment: "",
    dailyAction: "",
  });

  const [reflectionForm, setReflectionForm] = useState({
    reflectionText: "",
    mood: "",
  });

  // Fetch commitments
  const { data: commitments = [] } = useQuery<Commitment[]>({
    queryKey: ["/api/student/commitments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch reflections
  const { data: reflections = [] } = useQuery<Reflection[]>({
    queryKey: ["/api/student/reflections"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Create/Update commitment mutation
  const saveCommitmentMutation = useMutation({
    mutationFn: async (data: typeof commitmentForm & { id?: string }) => {
      const url = data.id 
        ? `/api/student/commitments/${data.id}` 
        : "/api/student/commitments";
      const method = data.id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          why_important: data.whyCommitment,
          daily_action: data.dailyAction,
        }),
      });
      if (!response.ok) throw new Error("Failed to save commitment");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingCommitment ? "Commitment updated!" : "New commitment created!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/commitments"] });
      setCommitmentDialogOpen(false);
      setCommitmentForm({ name: "", description: "", whyCommitment: "", dailyAction: "" });
      setEditingCommitment(null);
    },
  });

  // Log commitment completion mutation
  const completeCommitmentMutation = useMutation({
    mutationFn: async (commitmentId: string) => {
      const response = await fetch(`/api/student/commitments/${commitmentId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to log completion");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Great job!",
        description: "Commitment logged for today! 🔥",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/commitments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/stats"] });
    },
  });

  // Delete commitment mutation
  const deleteCommitmentMutation = useMutation({
    mutationFn: async (commitmentId: string) => {
      const response = await fetch(`/api/student/commitments/${commitmentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete commitment");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Commitment deleted",
        description: "Your commitment has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/commitments"] });
    },
  });

  // Create reflection mutation
  const createReflectionMutation = useMutation({
    mutationFn: async (data: typeof reflectionForm) => {
      const response = await fetch("/api/student/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reflection_text: data.reflectionText,
          mood: data.mood,
          date: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create reflection");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reflection saved",
        description: "Your thoughts have been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/reflections"] });
      setReflectionDialogOpen(false);
      setReflectionForm({ reflectionText: "", mood: "" });
    },
  });

  const handleSaveCommitment = () => {
    if (editingCommitment) {
      saveCommitmentMutation.mutate({ ...commitmentForm, id: editingCommitment.id });
    } else {
      saveCommitmentMutation.mutate(commitmentForm);
    }
  };

  const handleEditCommitment = (commitment: Commitment) => {
    setEditingCommitment(commitment);
    setCommitmentForm({
      name: commitment.name,
      description: commitment.description || "",
      whyCommitment: commitment.whyCommitment || "",
      dailyAction: commitment.dailyAction || "",
    });
    setCommitmentDialogOpen(true);
  };

  const handleNewCommitment = () => {
    setEditingCommitment(null);
    setCommitmentForm({ name: "", description: "", whyCommitment: "", dailyAction: "" });
    setCommitmentDialogOpen(true);
  };

  const canCompleteToday = (commitment: Commitment) => {
    if (!commitment.lastCompletedDate) return true;
    const lastCompleted = new Date(commitment.lastCompletedDate);
    const today = new Date();
    return lastCompleted.toDateString() !== today.toDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Growth</h1>
        <p className="text-muted-foreground">Build habits and reflect on your journey</p>
      </div>

      <Tabs defaultValue="commitments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="commitments">Commitments</TabsTrigger>
            <TabsTrigger value="reflections">Reflections</TabsTrigger>
          </TabsList>

          <TabsContent value="commitments" className="space-y-6">
            {/* Add New Commitment Button */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleNewCommitment}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  Add New Commitment
                </Button>
              </CardContent>
            </Card>

            {/* Active Commitments */}
            {commitments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No commitments yet. Create your first goal to start building habits!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {commitments.filter(c => c.isActive).map((commitment) => (
                  <Card key={commitment.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {commitment.name}
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {commitment.streakCount} day streak
                            </Badge>
                          </CardTitle>
                          <CardDescription>{commitment.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCommitment(commitment)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCommitmentMutation.mutate(commitment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Why and Daily Action */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-semibold text-sm text-blue-900 mb-1">Why This Matters</h4>
                          <p className="text-sm text-blue-800">{commitment.whyCommitment}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="font-semibold text-sm text-green-900 mb-1">Daily Action</h4>
                          <p className="text-sm text-green-800">{commitment.dailyAction}</p>
                        </div>
                      </div>

                      {/* Complete Today Button */}
                      <Button
                        onClick={() => completeCommitmentMutation.mutate(commitment.id)}
                        disabled={!canCompleteToday(commitment)}
                        className="w-full gap-2"
                        variant={canCompleteToday(commitment) ? "default" : "secondary"}
                      >
                        {canCompleteToday(commitment) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Complete Today
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Completed Today!
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reflections" className="space-y-6">
            {/* Add New Reflection Button */}
            <Card className="bg-gradient-to-r from-purple/10 to-purple/5">
              <CardContent className="pt-6">
                <Button 
                  onClick={() => setReflectionDialogOpen(true)}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  Write a Reflection
                </Button>
              </CardContent>
            </Card>

            {/* Past Reflections */}
            {reflections.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reflections yet. Start journaling your thoughts and growth!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reflections.map((reflection) => (
                  <Card key={reflection.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {new Date(reflection.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </CardTitle>
                          {reflection.mood && (
                            <Badge variant="secondary" className="mt-2">
                              Mood: {reflection.mood}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {reflection.reflectionText}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Commitment Dialog */}
        <Dialog open={commitmentDialogOpen} onOpenChange={setCommitmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCommitment ? "Edit Commitment" : "New Commitment"}
              </DialogTitle>
              <DialogDescription>
                Create a goal or habit to track daily
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={commitmentForm.name}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, name: e.target.value })}
                  placeholder="e.g., Practice math daily"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (What)</Label>
                <Textarea
                  id="description"
                  value={commitmentForm.description}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, description: e.target.value })}
                  placeholder="What is this commitment about?"
                />
              </div>
              <div>
                <Label htmlFor="why">Why This Matters</Label>
                <Textarea
                  id="why"
                  value={commitmentForm.whyCommitment}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, whyCommitment: e.target.value })}
                  placeholder="Why is this important to you?"
                />
              </div>
              <div>
                <Label htmlFor="action">Daily Action</Label>
                <Textarea
                  id="action"
                  value={commitmentForm.dailyAction}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, dailyAction: e.target.value })}
                  placeholder="What will you do each day?"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCommitmentDialogOpen(false);
                    setCommitmentForm({ name: "", description: "", whyCommitment: "", dailyAction: "" });
                    setEditingCommitment(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCommitment}
                  disabled={!commitmentForm.name.trim() || saveCommitmentMutation.isPending}
                  className="flex-1"
                >
                  {saveCommitmentMutation.isPending ? "Saving..." : "Save Commitment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reflection Dialog */}
        <Dialog open={reflectionDialogOpen} onOpenChange={setReflectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Reflection</DialogTitle>
              <DialogDescription>
                Journal your thoughts, wins, or challenges
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mood">Mood (optional)</Label>
                <Input
                  id="mood"
                  value={reflectionForm.mood}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, mood: e.target.value })}
                  placeholder="How are you feeling?"
                />
              </div>
              <div>
                <Label htmlFor="reflection">Reflection</Label>
                <Textarea
                  id="reflection"
                  value={reflectionForm.reflectionText}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, reflectionText: e.target.value })}
                  placeholder="Write your thoughts..."
                  className="min-h-32"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReflectionDialogOpen(false);
                    setReflectionForm({ reflectionText: "", mood: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createReflectionMutation.mutate(reflectionForm)}
                  disabled={!reflectionForm.reflectionText.trim() || createReflectionMutation.isPending}
                  className="flex-1"
                >
                  {createReflectionMutation.isPending ? "Saving..." : "Save Reflection"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
