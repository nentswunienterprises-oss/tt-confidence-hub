import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";

interface SubmitIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitIdeaModal({ open, onOpenChange }: SubmitIdeaModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pillar: "other",
    problemSolved: "",
  });

  const submitIdea = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/ideas/submit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/ideas"] });
      onOpenChange(false);
      setFormData({ title: "", description: "", pillar: "other", problemSolved: "" });
      toast({
        title: "Idea submitted!",
        description: "Your idea has been sent to HR for review.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.description.length > 500) {
      toast({
        title: "Description too long",
        description: "Please keep it under 500 words.",
        variant: "destructive",
      });
      return;
    }

    submitIdea.mutate({
      ...formData,
      submitterName: user?.name || user?.email || "Unknown",
      submitterRole: user?.role || "unknown",
    });
  };

  const pillarDescriptions: Record<string, string> = {
    revenue: "Directly impacts income or growth",
    reputation: "Affects brand or public perception",
    systems: "Improves internal processes",
    culture: "Enhances team dynamics or values",
    other: "General improvement idea",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Submit an Idea
          </DialogTitle>
          <DialogDescription>
            Share your idea with the team. Ideas don't move the company - approved ideas do.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Idea Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your idea a clear name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (3-5 sentences) *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain your idea clearly and concisely..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.split(/\s+/).filter(Boolean).length} / 500 words
            </p>
          </div>

          <div>
            <Label htmlFor="pillar">Which pillar does this affect? *</Label>
            <Select value={formData.pillar} onValueChange={(v) => setFormData({ ...formData, pillar: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="reputation">Reputation</SelectItem>
                <SelectItem value="systems">Systems</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {pillarDescriptions[formData.pillar]}
            </p>
          </div>

          <div>
            <Label htmlFor="problemSolved">What problem does this solve? (optional)</Label>
            <Textarea
              id="problemSolved"
              value={formData.problemSolved}
              onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
              placeholder="Describe the problem this idea addresses..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitIdea.isPending}>
              {submitIdea.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Idea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
