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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
export function LogDisputeModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var user = useAuth().user;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useState({
        involvedParties: [],
        involvedPartyNames: [],
        disputeType: "",
        description: "",
        desiredOutcome: "",
    }), formData = _b[0], setFormData = _b[1];
    // Fetch people for selection
    var _c = useQuery({
        queryKey: ["/api/people-registry/list"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        enabled: open,
    }).data, people = _c === void 0 ? [] : _c;
    var logDispute = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/disputes/log", data)];
            });
        }); },
        onSuccess: function () {
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
        onError: function () {
            toast({
                title: "Failed to log issue",
                description: "Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        var wordCount = formData.description.split(/\s+/).filter(Boolean).length;
        if (wordCount > 300) {
            toast({
                title: "Description too long",
                description: "Please keep it under 300 words.",
                variant: "destructive",
            });
            return;
        }
        logDispute.mutate(__assign(__assign({}, formData), { loggedByName: (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.email) || "Anonymous" }));
    };
    var handlePersonToggle = function (personId, personName, checked) {
        if (checked) {
            setFormData(__assign(__assign({}, formData), { involvedParties: __spreadArray(__spreadArray([], formData.involvedParties, true), [personId], false), involvedPartyNames: __spreadArray(__spreadArray([], formData.involvedPartyNames, true), [personName], false) }));
        }
        else {
            setFormData(__assign(__assign({}, formData), { involvedParties: formData.involvedParties.filter(function (id) { return id !== personId; }), involvedPartyNames: formData.involvedPartyNames.filter(function (name) { return name !== personName; }) }));
        }
    };
    var disputeTypes = [
        { value: "miscommunication", label: "Miscommunication", description: "Unclear or misunderstood communication" },
        { value: "missed_responsibility", label: "Missed Responsibility", description: "Someone didn't do what they committed to" },
        { value: "disrespect", label: "Disrespect", description: "Unprofessional or disrespectful behavior" },
        { value: "performance_concern", label: "Performance Concern", description: "Quality or consistency issues" },
    ];
    var desiredOutcomes = [
        { value: "clarity", label: "Clarity", description: "I want clear understanding of what happened" },
        { value: "apology", label: "Apology", description: "I want acknowledgment and apology" },
        { value: "decision", label: "Decision", description: "I want leadership to make a decision" },
        { value: "separation", label: "Separation", description: "This relationship should end" },
    ];
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary"/>
            Log an Issue
          </DialogTitle>
          <DialogDescription>
            This is private and confidential. Only HR and CEO will see this by default.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-3 rounded-lg text-sm mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5"/>
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
              {people.length === 0 ? (<p className="text-sm text-muted-foreground p-2">No people in registry yet</p>) : (people.map(function (person) { return (<div key={person.id} className="flex items-center gap-2">
                    <Checkbox id={person.id} checked={formData.involvedParties.includes(person.id)} onCheckedChange={function (checked) { return handlePersonToggle(person.id, person.fullName, checked); }}/>
                    <label htmlFor={person.id} className="text-sm cursor-pointer">
                      {person.fullName} <span className="text-muted-foreground">({person.roleTitle})</span>
                    </label>
                  </div>); }))}
            </div>
          </div>

          <div>
            <Label htmlFor="disputeType">Type of Issue *</Label>
            <Select value={formData.disputeType} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { disputeType: v })); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type"/>
              </SelectTrigger>
              <SelectContent>
                {disputeTypes.map(function (type) { return (<SelectItem key={type.value} value={type.value}>
                    <div>
                      <p>{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>); })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Factual Description * (max 300 words)</Label>
            <Textarea id="description" value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="Describe what happened factually, without emotional language..." rows={4} required/>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.split(/\s+/).filter(Boolean).length} / 300 words
            </p>
          </div>

          <div>
            <Label htmlFor="desiredOutcome">Desired Outcome *</Label>
            <Select value={formData.desiredOutcome} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { desiredOutcome: v })); }}>
              <SelectTrigger>
                <SelectValue placeholder="What do you want to happen?"/>
              </SelectTrigger>
              <SelectContent>
                {desiredOutcomes.map(function (outcome) { return (<SelectItem key={outcome.value} value={outcome.value}>
                    <div>
                      <p>{outcome.label}</p>
                      <p className="text-xs text-muted-foreground">{outcome.description}</p>
                    </div>
                  </SelectItem>); })}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={logDispute.isPending || !formData.disputeType || !formData.desiredOutcome || formData.involvedParties.length === 0}>
              {logDispute.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Log Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
