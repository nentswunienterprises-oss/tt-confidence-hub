var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
export function SubmitIdeaModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var user = useAuth().user;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useState({
        title: "",
        description: "",
        pillar: "other",
        problemSolved: "",
    }), formData = _b[0], setFormData = _b[1];
    var submitIdea = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/ideas/submit", data)];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/ideas"] });
            onOpenChange(false);
            setFormData({ title: "", description: "", pillar: "other", problemSolved: "" });
            toast({
                title: "Idea submitted!",
                description: "Your idea has been sent to HR for review.",
            });
        },
        onError: function () {
            toast({
                title: "Failed to submit",
                description: "Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (formData.description.length > 500) {
            toast({
                title: "Description too long",
                description: "Please keep it under 500 words.",
                variant: "destructive",
            });
            return;
        }
        submitIdea.mutate(__assign(__assign({}, formData), { submitterName: (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.email) || "Unknown", submitterRole: (user === null || user === void 0 ? void 0 : user.role) || "unknown" }));
    };
    var pillarDescriptions = {
        revenue: "Directly impacts income or growth",
        reputation: "Affects brand or public perception",
        systems: "Improves internal processes",
        culture: "Enhances team dynamics or values",
        other: "General improvement idea",
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500"/>
            Submit an Idea
          </DialogTitle>
          <DialogDescription>
            Share your idea with the team. Ideas don't move the company - approved ideas do.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Idea Title *</Label>
            <Input id="title" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} placeholder="Give your idea a clear name" required/>
          </div>

          <div>
            <Label htmlFor="description">Description (3-5 sentences) *</Label>
            <Textarea id="description" value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="Explain your idea clearly and concisely..." rows={4} required/>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.split(/\s+/).filter(Boolean).length} / 500 words
            </p>
          </div>

          <div>
            <Label htmlFor="pillar">Which pillar does this affect? *</Label>
            <Select value={formData.pillar} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { pillar: v })); }}>
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
            <Textarea id="problemSolved" value={formData.problemSolved} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { problemSolved: e.target.value })); }} placeholder="Describe the problem this idea addresses..." rows={2}/>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitIdea.isPending}>
              {submitIdea.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Submit Idea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
