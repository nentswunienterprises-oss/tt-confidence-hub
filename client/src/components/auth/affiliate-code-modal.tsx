import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AffiliateCodeModalProps {
  open: boolean;
  onSubmit: (code: string) => void;
  onClose?: () => void;
  loading?: boolean;
}

export function AffiliateCodeModal({ open, onSubmit, onClose, loading }: AffiliateCodeModalProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim().toUpperCase());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Affiliate Code</DialogTitle>
          <DialogDescription>
            Please enter the affiliate code you received. This is required to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="e.g., AFIX123456"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            maxLength={16}
          />
          <DialogFooter>
            <Button type="submit" disabled={loading || !code.trim()}>
              {loading ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
