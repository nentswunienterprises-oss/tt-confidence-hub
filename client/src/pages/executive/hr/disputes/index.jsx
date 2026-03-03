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
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Shield, AlertTriangle, FileText, BarChart3, Clock, CheckCircle2, Loader2, Eye, UserX, RefreshCw, ArrowUpRight, } from "lucide-react";
export default function DisputesModule() {
    var _this = this;
    var user = useAuth().user;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _a = useState("issues"), activeTab = _a[0], setActiveTab = _a[1];
    // Modal states
    var _b = useState(false), showResolveModal = _b[0], setShowResolveModal = _b[1];
    var _c = useState(null), selectedDispute = _c[0], setSelectedDispute = _c[1];
    var _d = useState(false), showDetailsModal = _d[0], setShowDetailsModal = _d[1];
    // Fetch data
    var _e = useQuery({
        queryKey: ["/api/hr/disputes"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), _f = _e.data, disputes = _f === void 0 ? [] : _f, disputesLoading = _e.isLoading;
    var _g = useQuery({
        queryKey: ["/api/hr/brain/people"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data, people = _g === void 0 ? [] : _g;
    var _h = useQuery({
        queryKey: ["/api/hr/disputes/patterns"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data, patterns = _h === void 0 ? [] : _h;
    // Mutations
    var resolveDispute = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/hr/disputes/".concat(data.disputeId, "/resolve"), data)];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/disputes"] });
            setShowResolveModal(false);
            setSelectedDispute(null);
            toast({ title: "Dispute resolution recorded" });
        },
    });
    var updateDisputeStatus = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var id = _b.id, status = _b.status;
            return __generator(this, function (_c) {
                return [2 /*return*/, apiRequest("PATCH", "/api/hr/disputes/".concat(id, "/status"), { status: status })];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/disputes"] });
            toast({ title: "Dispute status updated" });
        },
    });
    // Filter disputes
    var openDisputes = disputes.filter(function (d) { return d.status === "open"; });
    var underReviewDisputes = disputes.filter(function (d) { return d.status === "under_review"; });
    var escalatedDisputes = disputes.filter(function (d) { return d.status === "escalated"; });
    var resolvedDisputes = disputes.filter(function (d) { return d.status === "resolved"; });
    var userRole = user === null || user === void 0 ? void 0 : user.role;
    return (<ExecutivePortalGuard role={userRole}>
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary"/>
            <h1 className="text-3xl font-bold tracking-tight">Disputes</h1>
          </div>
          <p className="text-muted-foreground">
            Conflict resolution, accountability, and psychological hygiene
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5"/>
              <span className="text-sm font-medium">Open</span>
            </div>
            <p className="text-2xl font-bold mt-2">{openDisputes.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="w-5 h-5"/>
              <span className="text-sm font-medium">Under Review</span>
            </div>
            <p className="text-2xl font-bold mt-2">{underReviewDisputes.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <ArrowUpRight className="w-5 h-5"/>
              <span className="text-sm font-medium">Escalated</span>
            </div>
            <p className="text-2xl font-bold mt-2">{escalatedDisputes.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5"/>
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold mt-2">{resolvedDisputes.length}</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues" className="gap-2">
              <FileText className="w-4 h-4"/>
              <span className="hidden sm:inline">Issues</span>
              <Badge variant="secondary" className="ml-1">{openDisputes.length + underReviewDisputes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="gap-2">
              <CheckCircle2 className="w-4 h-4"/>
              <span className="hidden sm:inline">Resolved</span>
              <Badge variant="secondary" className="ml-1">{resolvedDisputes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <BarChart3 className="w-4 h-4"/>
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
          </TabsList>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            {disputesLoading ? (<Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground"/>
              </Card>) : openDisputes.length === 0 && underReviewDisputes.length === 0 ? (<Card className="p-12 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">No open issues</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If it's not logged, it doesn't exist.
                </p>
              </Card>) : (<>
                {escalatedDisputes.length > 0 && (<DisputeSection title="Escalated" icon={<ArrowUpRight className="w-5 h-5 text-red-500"/>} disputes={escalatedDisputes} onView={function (d) { setSelectedDispute(d); setShowDetailsModal(true); }} onResolve={function (d) { setSelectedDispute(d); setShowResolveModal(true); }} onStatusChange={function (id, status) { return updateDisputeStatus.mutate({ id: id, status: status }); }}/>)}
                {openDisputes.length > 0 && (<DisputeSection title="Open Issues" icon={<AlertTriangle className="w-5 h-5 text-yellow-500"/>} disputes={openDisputes} onView={function (d) { setSelectedDispute(d); setShowDetailsModal(true); }} onResolve={function (d) { setSelectedDispute(d); setShowResolveModal(true); }} onStatusChange={function (id, status) { return updateDisputeStatus.mutate({ id: id, status: status }); }}/>)}
                {underReviewDisputes.length > 0 && (<DisputeSection title="Under Review" icon={<Clock className="w-5 h-5 text-blue-500"/>} disputes={underReviewDisputes} onView={function (d) { setSelectedDispute(d); setShowDetailsModal(true); }} onResolve={function (d) { setSelectedDispute(d); setShowResolveModal(true); }} onStatusChange={function (id, status) { return updateDisputeStatus.mutate({ id: id, status: status }); }}/>)}
              </>)}
          </TabsContent>

          {/* Resolved Tab */}
          <TabsContent value="resolved" className="space-y-4">
            {resolvedDisputes.length === 0 ? (<Card className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">No resolved disputes yet</p>
              </Card>) : (<div className="grid gap-4">
                {resolvedDisputes.map(function (dispute) { return (<DisputeCard key={dispute.id} dispute={dispute} onView={function () { setSelectedDispute(dispute); setShowDetailsModal(true); }}/>); })}
              </div>)}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5"/>
                Pattern Detection
              </h3>
              <p className="text-muted-foreground mb-4">
                Early-warning intelligence. Great HR doesn't react—it prevents.
              </p>
              
              {disputes.length < 3 ? (<div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                  <p>Not enough data yet for pattern detection</p>
                  <p className="text-sm mt-1">Patterns emerge after 3+ disputes</p>
                </div>) : (<div className="space-y-6">
                  {/* People frequently involved */}
                  <PatternSection title="People Frequently Flagged" icon={<UserX className="w-5 h-5 text-red-500"/>} data={getFrequentPeople(disputes)}/>
                  
                  {/* Recurring dispute types */}
                  <PatternSection title="Recurring Issue Types" icon={<RefreshCw className="w-5 h-5 text-orange-500"/>} data={getRecurringTypes(disputes)}/>
                </div>)}
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Details Modal */}
        {selectedDispute && (<DisputeDetailsModal open={showDetailsModal} onOpenChange={setShowDetailsModal} dispute={selectedDispute}/>)}

        {/* Resolve Modal */}
        {selectedDispute && (<ResolveDisputeModal open={showResolveModal} onOpenChange={setShowResolveModal} dispute={selectedDispute} onResolve={function (data) { return resolveDispute.mutate(__assign({ disputeId: selectedDispute.id }, data)); }} isLoading={resolveDispute.isPending}/>)}
      </div>
    </ExecutivePortalGuard>);
}
// ============================================
// SUB-COMPONENTS
// ============================================
function DisputeSection(_a) {
    var title = _a.title, icon = _a.icon, disputes = _a.disputes, onView = _a.onView, onResolve = _a.onResolve, onStatusChange = _a.onStatusChange;
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title} ({disputes.length})</h2>
      </div>
      <div className="grid gap-4">
        {disputes.map(function (dispute) { return (<DisputeCard key={dispute.id} dispute={dispute} onView={function () { return onView(dispute); }} onResolve={function () { return onResolve(dispute); }} onStatusChange={onStatusChange}/>); })}
      </div>
    </div>);
}
function DisputeCard(_a) {
    var dispute = _a.dispute, onView = _a.onView, onResolve = _a.onResolve, onStatusChange = _a.onStatusChange;
    var typeLabels = {
        miscommunication: "Miscommunication",
        missed_responsibility: "Missed Responsibility",
        disrespect: "Disrespect",
        performance_concern: "Performance Concern",
    };
    var outcomeLabels = {
        clarity: "Clarity",
        apology: "Apology",
        decision: "Decision",
        separation: "Separation",
    };
    var statusColors = {
        open: "bg-yellow-100 text-yellow-800",
        under_review: "bg-blue-100 text-blue-800",
        escalated: "bg-red-100 text-red-800",
        resolved: "bg-green-100 text-green-800",
    };
    var typeColors = {
        miscommunication: "bg-orange-100 text-orange-800",
        missed_responsibility: "bg-red-100 text-red-800",
        disrespect: "bg-purple-100 text-purple-800",
        performance_concern: "bg-blue-100 text-blue-800",
    };
    return (<Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={typeColors[dispute.disputeType]}>
              {typeLabels[dispute.disputeType]}
            </Badge>
            <Badge className={statusColors[dispute.status]}>
              {dispute.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline">
              Wants: {outcomeLabels[dispute.desiredOutcome]}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(dispute.createdAt), "MMM d")}
          </span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Logged by: {dispute.loggedByName || "Anonymous"}
          </p>
          <p className="text-sm text-muted-foreground">
            Involved: {(dispute.involvedPartyNames || []).join(", ") || "Not specified"}
          </p>
        </div>

        <p className="line-clamp-2">{dispute.description}</p>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onView} className="gap-1">
            <Eye className="w-4 h-4"/>
            View
          </Button>
          {dispute.status !== "resolved" && onResolve && (<Button size="sm" onClick={onResolve} className="gap-1">
              <CheckCircle2 className="w-4 h-4"/>
              Resolve
            </Button>)}
          {dispute.status === "open" && onStatusChange && (<Button variant="outline" size="sm" onClick={function () { return onStatusChange(dispute.id, "under_review"); }}>
              Start Review
            </Button>)}
          {dispute.status === "under_review" && onStatusChange && (<Button variant="outline" size="sm" onClick={function () { return onStatusChange(dispute.id, "escalated"); }} className="text-red-600">
              Escalate
            </Button>)}
        </div>
      </div>
    </Card>);
}
function PatternSection(_a) {
    var title = _a.title, icon = _a.icon, data = _a.data;
    if (data.length === 0)
        return null;
    return (<div>
      <h4 className="font-medium flex items-center gap-2 mb-3">
        {icon}
        {title}
      </h4>
      <div className="space-y-2">
        {data.map(function (item, idx) { return (<div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span>{item.label}</span>
            <Badge variant="secondary">{item.count} issues</Badge>
          </div>); })}
      </div>
    </div>);
}
// ============================================
// MODAL COMPONENTS
// ============================================
function DisputeDetailsModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, dispute = _a.dispute;
    var typeLabels = {
        miscommunication: "Miscommunication",
        missed_responsibility: "Missed Responsibility",
        disrespect: "Disrespect",
        performance_concern: "Performance Concern",
    };
    var outcomeLabels = {
        clarity: "Clarity",
        apology: "Apology",
        decision: "Decision",
        separation: "Separation",
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispute Details</DialogTitle>
          <DialogDescription>
            Logged on {format(new Date(dispute.createdAt), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p className="font-medium">{typeLabels[dispute.disputeType]}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Desired Outcome</Label>
              <p className="font-medium">{outcomeLabels[dispute.desiredOutcome]}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Logged By</Label>
            <p className="font-medium">{dispute.loggedByName || "Anonymous"}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Involved Parties</Label>
            <p className="font-medium">
              {(dispute.involvedPartyNames || []).join(", ") || "Not specified"}
            </p>
          </div>

          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="mt-1 whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {dispute.resolutions && dispute.resolutions.length > 0 && (<div>
              <Label className="text-muted-foreground">Resolutions</Label>
              <div className="mt-2 space-y-3">
                {dispute.resolutions.map(function (res, idx) { return (<Card key={idx} className="p-3 bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{res.action.replace(/_/g, " ")}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(res.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm"><strong>Summary:</strong> {res.summary}</p>
                    <p className="text-sm mt-1"><strong>Decision:</strong> {res.decision}</p>
                    {res.followUpDate && (<p className="text-sm mt-1 text-muted-foreground">
                        Follow-up: {format(new Date(res.followUpDate), "MMM d, yyyy")}
                      </p>)}
                  </Card>); })}
              </div>
            </div>)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={function () { return onOpenChange(false); }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
function ResolveDisputeModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, dispute = _a.dispute, onResolve = _a.onResolve, isLoading = _a.isLoading;
    var _b = useState({
        action: "",
        summary: "",
        decision: "",
        followUpDate: "",
    }), formData = _b[0], setFormData = _b[1];
    var actionLabels = {
        clarification_requested: "Request Clarification",
        mediated_discussion: "Schedule Mediated Discussion",
        warning_issued: "Issue Warning",
        role_change_recommended: "Recommend Role Change",
        exit_recommended: "Recommend Exit",
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        onResolve({
            action: formData.action,
            summary: formData.summary,
            decision: formData.decision,
            followUpDate: formData.followUpDate || undefined,
        });
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
          <DialogDescription>
            Conflict must leave the system cleaner than it entered.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="action">Action Taken *</Label>
            <Select value={formData.action} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { action: v })); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select action"/>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(actionLabels).map(function (_a) {
            var value = _a[0], label = _a[1];
            return (<SelectItem key={value} value={value}>{label}</SelectItem>);
        })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="summary">Resolution Summary *</Label>
            <Textarea id="summary" value={formData.summary} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { summary: e.target.value })); }} placeholder="What was discussed and agreed upon?" rows={3} required/>
          </div>

          <div>
            <Label htmlFor="decision">Final Decision *</Label>
            <Textarea id="decision" value={formData.decision} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { decision: e.target.value })); }} placeholder="What is the official decision?" rows={2} required/>
          </div>

          <div>
            <Label htmlFor="followUpDate">Follow-up Date (optional)</Label>
            <Input id="followUpDate" type="date" value={formData.followUpDate} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { followUpDate: e.target.value })); }}/>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.action}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Record Resolution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
// ============================================
// HELPER FUNCTIONS
// ============================================
function getFrequentPeople(disputes) {
    var counts = {};
    disputes.forEach(function (d) {
        (d.involvedPartyNames || []).forEach(function (name) {
            counts[name] = (counts[name] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .filter(function (_a) {
        var _ = _a[0], count = _a[1];
        return count >= 2;
    })
        .map(function (_a) {
        var label = _a[0], count = _a[1];
        return ({ label: label, count: count });
    })
        .sort(function (a, b) { return b.count - a.count; })
        .slice(0, 5);
}
function getRecurringTypes(disputes) {
    var typeLabels = {
        miscommunication: "Miscommunication",
        missed_responsibility: "Missed Responsibility",
        disrespect: "Disrespect",
        performance_concern: "Performance Concern",
    };
    var counts = {};
    disputes.forEach(function (d) {
        counts[d.disputeType] = (counts[d.disputeType] || 0) + 1;
    });
    return Object.entries(counts)
        .map(function (_a) {
        var type = _a[0], count = _a[1];
        return ({ label: typeLabels[type] || type, count: count });
    })
        .sort(function (a, b) { return b.count - a.count; });
}
