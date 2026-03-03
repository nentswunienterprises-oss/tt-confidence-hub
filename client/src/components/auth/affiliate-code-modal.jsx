import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function AffiliateCodeModal(_a) {
    var open = _a.open, onSubmit = _a.onSubmit, onClose = _a.onClose, loading = _a.loading;
    var _b = useState(""), code = _b[0], setCode = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        if (code.trim()) {
            onSubmit(code.trim().toUpperCase());
        }
    };
    return (<Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Affiliate Code</DialogTitle>
          <DialogDescription>
            Please enter the affiliate code you received. This is required to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input autoFocus placeholder="e.g., AFIX123456" value={code} onChange={function (e) { return setCode(e.target.value); }} required maxLength={16}/>
          <DialogFooter>
            <Button type="submit" disabled={loading || !code.trim()}>
              {loading ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
