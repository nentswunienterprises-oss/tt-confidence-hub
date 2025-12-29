import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import type { PersonRegistry } from "@shared/schema";

interface LogDisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDisputeModal({ open, onOpenChange }: LogDisputeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    involvedParties: [] as string[],
    involvedPartyNames: [] as string[],
    disputeType: "",
    description: "",
    desiredOutcome: "",
  });

  // Fetch people for selection
  const { data: people = [] } = useQuery<PersonRegistry[]>({
    queryKey: ["/api/people-registry/list"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open,
  });

  const logDispute = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/disputes/log", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/disputes"] });
      onOpenChange(false);
      setFormData({
        involvedParties: [],
        involvedPartyNames: [],
        disputeType: "",
        description: "",
        desiredOutcome: "",
      });
      toast({
        title: "Issue logged",
        description: "HR will review your submission privately.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to log issue",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const wordCount = formData.description.split(/\s+/).filter(Boolean).length;
    if (wordCount > 300) {
      toast({
        title: "Description too long",
        description: "Please keep it under 300 words.",
        variant: "destructive",
      });
      return;
    }

    logDispute.mutate({
      ...formData,
      loggedByName: user?.name || user?.email || "Anonymous",
    });
  };

  const handlePersonToggle = (personId: string, personName: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        involvedParties: [...formData.involvedParties, personId],
        involvedPartyNames: [...formData.involvedPartyNames, personName],
      });
    } else {
      setFormData({
        ...formData,
        involvedParties: formData.involvedParties.filter(id => id !== personId),
        involvedPartyNames: formData.involvedPartyNames.filter(name => name !== personName),
      });
    }
  };

  const disputeTypes = [
    { value: "miscommunication", label: "Miscommunication", description: "Unclear or misunderstood communication" },
    { value: "missed_responsibility", label: "Missed Responsibility", description: "Someone didn't do what they committed to" },
    { value: "disrespect", label: "Disrespect", description: "Unprofessional or disrespectful behavior" },
    { value: "performance_concern", label: "Performance Concern", description: "Quality or consistency issues" },
  ];

  const desiredOutcomes = [
    { value: "clarity", label: "Clarity", description: "I want clear understanding of what happened" },
    { value: "apology", label: "Apology", description: "I want acknowledgment and apology" },
    { value: "decision", label: "Decision", description: "I want leadership to make a decision" },
    { value: "separation", label: "Separation", description: "This relationship should end" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Log an Issue
          </DialogTitle>
          <DialogDescription>
            This is private and confidential. Only HR and CEO will see this by default.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-3 rounded-lg text-sm mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <p className="text-muted-foreground">
              If it's not logged, it doesn't exist. This teaches us how adults handle conflict.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Involved Parties *</Label>
            <p className="text-xs text-muted-foreground mb-2">Select all people involved in this issue</p>
            <div className="border rounded-lg max-h-32 overflow-y-auto p-2 space-y-2">
              {people.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No people in registry yet</p>
              ) : (
                people.map((person) => (
                  <div key={person.id} className="flex items-center gap-2">
                    <Checkbox
                      id={person.id}
                      checked={formData.involvedParties.includes(person.id)}
                      onCheckedChange={(checked) => handlePersonToggle(person.id, person.fullName, checked as boolean)}
                    />
                    <label htmlFor={person.id} className="text-sm cursor-pointer">
                      {person.fullName} <span className="text-muted-foreground">({person.roleTitle})</span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="disputeType">Type of Issue *</Label>
            <Select value={formData.disputeType} onValueChange={(v) => setFormData({ ...formData, disputeType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {disputeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p>{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Factual Description * (max 300 words)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what happened factually, without emotional language..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.split(/\s+/).filter(Boolean).length} / 300 words
            </p>
          </div>

          <div>
            <Label htmlFor="desiredOutcome">Desired Outcome *</Label>
            <Select value={formData.desiredOutcome} onValueChange={(v) => setFormData({ ...formData, desiredOutcome: v })}>
              <SelectTrigger>
                <SelectValue placeholder="What do you want to happen?" />
              </SelectTrigger>
              <SelectContent>
                {desiredOutcomes.map((outcome) => (
                  <SelectItem key={outcome.value} value={outcome.value}>
                    <div>
                      <p>{outcome.label}</p>
                      <p className="text-xs text-muted-foreground">{outcome.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={logDispute.isPending || !formData.disputeType || !formData.desiredOutcome || formData.involvedParties.length === 0}
            >
              {logDispute.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Log Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
