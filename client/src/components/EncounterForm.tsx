import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Plus, X } from "lucide-react";

interface EncounterFormProps {
  onSuccess?: () => void;
}

type FormStep = "initial" | "outcome" | "details" | "reflection";

const OUTCOME_OPTIONS = [
  { value: "enrolled", label: "✓ Enrolled" },
  { value: "objected", label: "Objected" },
  { value: "follow_up_needed", label: "Follow Up Needed" },
];

const STORAGE_KEY = "encounterFormData";

const getDefaultFormData = () => ({
  parentName: "",
  parentEmail: "",
  parentPhone: "",
  childName: "",
  childGrade: "",
  dateMet: new Date().toISOString().split("T")[0],
  contactMethod: "phone",
  discoveryOutcome: "",
  deliveryNotes: "",
  finalOutcome: "",
  result: "",
  confidenceRating: 3,
  myThoughts: "",
});

export default function EncounterForm({ onSuccess }: EncounterFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<FormStep>("initial");
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("✅ Restored form data from localStorage:", parsed);
        return parsed;
      }
      console.log("📝 No saved form data, using defaults");
      return getDefaultFormData();
    } catch (e) {
      console.error("❌ Error restoring form data:", e);
      return getDefaultFormData();
    }
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    console.log("💾 Saving form data to localStorage:", formData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const logEncounterMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!data.parentName) throw new Error("Parent name is required");
      const res = await fetch("/api/affiliate/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "Encounter logged",
      });
      // Invalidate all related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["/api", "affiliate", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "affiliate", "breakdown"] });
      // Invalidate all encounters queries regardless of filter (partial key match)
      queryClient.invalidateQueries({ queryKey: ["/api", "affiliate", "encounters"], exact: false });
      
      const defaultData = getDefaultFormData();
      setFormData(defaultData);
      localStorage.removeItem(STORAGE_KEY);
      setStep("initial");
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    logEncounterMutation.mutate(formData);
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            setStep("initial");
          }}
          className="w-full h-14 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 group font-medium shadow-sm hover:shadow-md text-lg"
        >
          <Plus className="w-5 h-5" />
          Log Encounter
        </button>
      ) : (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl bg-card">
        {/* Header */}
        <div className="px-6 py-5 border-b border-card-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-lg font-600 text-foreground">New Encounter</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setStep("initial");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step: Initial */}
          {step === "initial" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Parent Name
                </label>
                <Input
                  placeholder="Who did you meet?"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="text-base border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Child Name
                  </label>
                  <Input
                    placeholder="Optional"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Grade
                  </label>
                  <Input
                    placeholder="Optional"
                    value={formData.childGrade}
                    onChange={(e) => setFormData({ ...formData, childGrade: e.target.value })}
                    className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Outcome */}
          {step === "outcome" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-3">
                  What happened?
                </label>
                <div className="space-y-2">
                  {OUTCOME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, finalOutcome: option.value });
                        setStep("details");
                      }}
                      className="w-full px-4 py-3 text-left rounded-lg border border-card-border hover:border-primary hover:bg-accent/50 transition-all duration-150 text-sm font-500 text-foreground group flex items-center justify-between"
                    >
                      {option.label}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Their Challenge
                </label>
                <textarea
                  placeholder="What's their main pain point?"
                  value={formData.discoveryOutcome}
                  onChange={(e) => setFormData({ ...formData, discoveryOutcome: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  How You Positioned Us
                </label>
                <textarea
                  placeholder="What resonated with them?"
                  value={formData.deliveryNotes}
                  onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Next Steps
                </label>
                <textarea
                  placeholder="What's next?"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  rows={1}
                  className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-3">
                  Confidence Level
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFormData({ ...formData, confidenceRating: rating })}
                      className={`flex-1 h-8 rounded-lg text-xs font-600 transition-all duration-150 ${
                        formData.confidenceRating === rating
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-accent text-foreground hover:bg-accent/80"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Reflection */}
          {step === "reflection" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                  Reflection
                </label>
                <textarea
                  placeholder="What went well? What to improve?"
                  value={formData.myThoughts}
                  onChange={(e) => setFormData({ ...formData, myThoughts: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-card-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Optional"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-600 text-foreground uppercase tracking-wider mb-2">
                    Phone
                  </label>
                  <Input
                    placeholder="Optional"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="text-sm border-card-border rounded-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-card-border flex gap-3 bg-accent/20">
          {step !== "initial" && (
            <button
              onClick={() => {
                if (step === "outcome") setStep("initial");
                if (step === "details") setStep("outcome");
                if (step === "reflection") setStep("details");
              }}
              className="flex-1 py-2 px-4 text-foreground hover:bg-accent/50 rounded-lg text-sm font-500 transition-colors"
            >
              Back
            </button>
          )}

          {step === "initial" && (
            <button
              onClick={() => formData.parentName && setStep("outcome")}
              disabled={!formData.parentName}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          )}

          {step === "outcome" && (
            <button
              onClick={() => setStep("details")}
              disabled={!formData.finalOutcome}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          )}

          {step === "details" && (
            <button
              onClick={() => setStep("reflection")}
              disabled={!formData.discoveryOutcome || !formData.deliveryNotes}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Review
            </button>
          )}

          {step === "reflection" && (
            <button
              onClick={handleSubmit}
              disabled={logEncounterMutation.isPending}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-500 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {logEncounterMutation.isPending ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </Card>
        </div>
      )}
    </>
  );
}
