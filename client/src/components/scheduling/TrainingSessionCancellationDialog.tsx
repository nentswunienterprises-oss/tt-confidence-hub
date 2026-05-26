import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { TrainingSessionCancellationReasonOption } from "@/lib/trainingSessionCancellation";
import { TRAINING_SESSION_CANCELLATION_OTHER_CODE } from "@/lib/trainingSessionCancellation";

type TrainingSessionCancellationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  reasonOptions: TrainingSessionCancellationReasonOption[];
  notePlaceholder?: string;
  onConfirm: (payload: { reasonCodes: string[]; reasonNote: string | null }) => Promise<void> | void;
};

export function TrainingSessionCancellationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  reasonOptions,
  notePlaceholder = "Add any operational detail that should stay with the cancellation record.",
  onConfirm,
}: TrainingSessionCancellationDialogProps) {
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [error, setError] = useState("");

  const otherSelected = selectedReasonCode === TRAINING_SESSION_CANCELLATION_OTHER_CODE;

  useEffect(() => {
    if (open) {
      setError("");
      return;
    }
    setSelectedReasonCode("");
    setReasonNote("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!otherSelected && reasonNote) {
      setReasonNote("");
    }
  }, [otherSelected, reasonNote]);

  const handleConfirm = async () => {
    if (!selectedReasonCode) {
      setError("Select a cancellation reason.");
      return;
    }

    if (otherSelected && !String(reasonNote || "").trim()) {
      setError("Add a short note when selecting Other.");
      return;
    }

    setError("");
    try {
      await onConfirm({
        reasonCodes: [selectedReasonCode],
        reasonNote: otherSelected ? String(reasonNote || "").trim() || null : null,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel the session.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={selectedReasonCode}
            onValueChange={(value) => {
              setSelectedReasonCode(value);
              if (error) {
                setError("");
              }
            }}
            className="space-y-3"
          >
            {reasonOptions.map((option) => {
              return (
                <label
                  key={option.code}
                  className="flex items-start gap-3 rounded-md border border-border bg-muted/10 px-3 py-3 text-sm"
                >
                  <RadioGroupItem
                    value={option.code}
                    id={`training-session-cancel-${option.code}`}
                    className="mt-0.5"
                  />
                  <span className="space-y-1">
                    <span className="block font-medium text-foreground">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>

          {otherSelected ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Extra note (required)</p>
              <Textarea
                placeholder={notePlaceholder}
                value={reasonNote}
                onChange={(event) => setReasonNote(event.target.value)}
                rows={4}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Keep Lesson
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
