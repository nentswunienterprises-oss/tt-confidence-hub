import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { ExecutivePortalGuard } from "@/lib/portalGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Shield,
  AlertTriangle,
  FileText,
  BarChart3,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Eye,
  MessageSquare,
  UserX,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import type { Dispute, DisputeResolution, PersonRegistry } from "@shared/schema";

interface DisputeWithResolutions extends Dispute {
  resolutions?: DisputeResolution[];
}

export default function DisputesModule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("issues");
  
  // Modal states
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithResolutions | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch data
  const { data: disputes = [], isLoading: disputesLoading } = useQuery<DisputeWithResolutions[]>({
    queryKey: ["/api/hr/disputes"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: people = [] } = useQuery<PersonRegistry[]>({
    queryKey: ["/api/hr/brain/people"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: patterns = [] } = useQuery<any[]>({
    queryKey: ["/api/hr/disputes/patterns"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Mutations
  const resolveDispute = useMutation({
    mutationFn: async (data: { disputeId: string; action: string; summary: string; decision: string; followUpDate?: string }) => {
      return apiRequest("POST", `/api/hr/disputes/${data.disputeId}/resolve`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/disputes"] });
      setShowResolveModal(false);
      setSelectedDispute(null);
      toast({ title: "Dispute resolution recorded" });
    },
  });

  const updateDisputeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/hr/disputes/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/disputes"] });
      toast({ title: "Dispute status updated" });
    },
  });

  // Filter disputes
  const openDisputes = disputes.filter(d => d.status === "open");
  const underReviewDisputes = disputes.filter(d => d.status === "under_review");
  const escalatedDisputes = disputes.filter(d => d.status === "escalated");
  const resolvedDisputes = disputes.filter(d => d.status === "resolved");

  const userRole = user?.role;

  return (
    <ExecutivePortalGuard role={userRole}>
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
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
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Open</span>
            </div>
            <p className="text-2xl font-bold mt-2">{openDisputes.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Under Review</span>
            </div>
            <p className="text-2xl font-bold mt-2">{underReviewDisputes.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <ArrowUpRight className="w-5 h-5" />
              <span className="text-sm font-medium">Escalated</span>
            </div>
            <p className="text-2xl font-bold mt-2">{escalatedDisputes.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold mt-2">{resolvedDisputes.length}</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Issues</span>
              <Badge variant="secondary" className="ml-1">{openDisputes.length + underReviewDisputes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Resolved</span>
              <Badge variant="secondary" className="ml-1">{resolvedDisputes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
          </TabsList>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            {disputesLoading ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </Card>
            ) : openDisputes.length === 0 && underReviewDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No open issues</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If it's not logged, it doesn't exist.
                </p>
              </Card>
            ) : (
              <>
                {escalatedDisputes.length > 0 && (
                  <DisputeSection
                    title="Escalated"
                    icon={<ArrowUpRight className="w-5 h-5 text-red-500" />}
                    disputes={escalatedDisputes}
                    onView={(d) => { setSelectedDispute(d); setShowDetailsModal(true); }}
                    onResolve={(d) => { setSelectedDispute(d); setShowResolveModal(true); }}
                    onStatusChange={(id, status) => updateDisputeStatus.mutate({ id, status })}
                  />
                )}
                {openDisputes.length > 0 && (
                  <DisputeSection
                    title="Open Issues"
                    icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    disputes={openDisputes}
                    onView={(d) => { setSelectedDispute(d); setShowDetailsModal(true); }}
                    onResolve={(d) => { setSelectedDispute(d); setShowResolveModal(true); }}
                    onStatusChange={(id, status) => updateDisputeStatus.mutate({ id, status })}
                  />
                )}
                {underReviewDisputes.length > 0 && (
                  <DisputeSection
                    title="Under Review"
                    icon={<Clock className="w-5 h-5 text-blue-500" />}
                    disputes={underReviewDisputes}
                    onView={(d) => { setSelectedDispute(d); setShowDetailsModal(true); }}
                    onResolve={(d) => { setSelectedDispute(d); setShowResolveModal(true); }}
                    onStatusChange={(id, status) => updateDisputeStatus.mutate({ id, status })}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* Resolved Tab */}
          <TabsContent value="resolved" className="space-y-4">
            {resolvedDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resolved disputes yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {resolvedDisputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    dispute={dispute}
                    onView={() => { setSelectedDispute(dispute); setShowDetailsModal(true); }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pattern Detection
              </h3>
              <p className="text-muted-foreground mb-4">
                Early-warning intelligence. Great HR doesn't react-it prevents.
              </p>
              
              {disputes.length < 3 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Not enough data yet for pattern detection</p>
                  <p className="text-sm mt-1">Patterns emerge after 3+ disputes</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* People frequently involved */}
                  <PatternSection
                    title="People Frequently Flagged"
                    icon={<UserX className="w-5 h-5 text-red-500" />}
                    data={getFrequentPeople(disputes)}
                  />
                  
                  {/* Recurring dispute types */}
                  <PatternSection
                    title="Recurring Issue Types"
                    icon={<RefreshCw className="w-5 h-5 text-orange-500" />}
                    data={getRecurringTypes(disputes)}
                  />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Details Modal */}
        {selectedDispute && (
          <DisputeDetailsModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            dispute={selectedDispute}
          />
        )}

        {/* Resolve Modal */}
        {selectedDispute && (
          <ResolveDisputeModal
            open={showResolveModal}
            onOpenChange={setShowResolveModal}
            dispute={selectedDispute}
            onResolve={(data) => resolveDispute.mutate({ disputeId: selectedDispute.id, ...data })}
            isLoading={resolveDispute.isPending}
          />
        )}
      </div>
    </ExecutivePortalGuard>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function DisputeSection({
  title,
  icon,
  disputes,
  onView,
  onResolve,
  onStatusChange,
}: {
  title: string;
  icon: React.ReactNode;
  disputes: DisputeWithResolutions[];
  onView: (dispute: DisputeWithResolutions) => void;
  onResolve: (dispute: DisputeWithResolutions) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title} ({disputes.length})</h2>
      </div>
      <div className="grid gap-4">
        {disputes.map((dispute) => (
          <DisputeCard
            key={dispute.id}
            dispute={dispute}
            onView={() => onView(dispute)}
            onResolve={() => onResolve(dispute)}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

function DisputeCard({
  dispute,
  onView,
  onResolve,
  onStatusChange,
}: {
  dispute: DisputeWithResolutions;
  onView: () => void;
  onResolve?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const typeLabels: Record<string, string> = {
    miscommunication: "Miscommunication",
    missed_responsibility: "Missed Responsibility",
    disrespect: "Disrespect",
    performance_concern: "Performance Concern",
  };

  const outcomeLabels: Record<string, string> = {
    clarity: "Clarity",
    apology: "Apology",
    decision: "Decision",
    separation: "Separation",
  };

  const statusColors: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    escalated: "bg-red-100 text-red-800",
    resolved: "bg-green-100 text-green-800",
  };

  const typeColors: Record<string, string> = {
    miscommunication: "bg-orange-100 text-orange-800",
    missed_responsibility: "bg-red-100 text-red-800",
    disrespect: "bg-purple-100 text-purple-800",
    performance_concern: "bg-blue-100 text-blue-800",
  };

  return (
    <Card className="p-4">
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
            <Eye className="w-4 h-4" />
            View
          </Button>
          {dispute.status !== "resolved" && onResolve && (
            <Button size="sm" onClick={onResolve} className="gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Resolve
            </Button>
          )}
          {dispute.status === "open" && onStatusChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(dispute.id, "under_review")}
            >
              Start Review
            </Button>
          )}
          {dispute.status === "under_review" && onStatusChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(dispute.id, "escalated")}
              className="text-red-600"
            >
              Escalate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function PatternSection({
  title,
  icon,
  data,
}: {
  title: string;
  icon: React.ReactNode;
  data: { label: string; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium flex items-center gap-2 mb-3">
        {icon}
        {title}
      </h4>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span>{item.label}</span>
            <Badge variant="secondary">{item.count} issues</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MODAL COMPONENTS
// ============================================

function DisputeDetailsModal({
  open,
  onOpenChange,
  dispute,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: DisputeWithResolutions;
}) {
  const typeLabels: Record<string, string> = {
    miscommunication: "Miscommunication",
    missed_responsibility: "Missed Responsibility",
    disrespect: "Disrespect",
    performance_concern: "Performance Concern",
  };

  const outcomeLabels: Record<string, string> = {
    clarity: "Clarity",
    apology: "Apology",
    decision: "Decision",
    separation: "Separation",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          {dispute.resolutions && dispute.resolutions.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Resolutions</Label>
              <div className="mt-2 space-y-3">
                {dispute.resolutions.map((res, idx) => (
                  <Card key={idx} className="p-3 bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{res.action.replace(/_/g, " ")}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(res.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm"><strong>Summary:</strong> {res.summary}</p>
                    <p className="text-sm mt-1"><strong>Decision:</strong> {res.decision}</p>
                    {res.followUpDate && (
                      <p className="text-sm mt-1 text-muted-foreground">
                        Follow-up: {format(new Date(res.followUpDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResolveDisputeModal({
  open,
  onOpenChange,
  dispute,
  onResolve,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: DisputeWithResolutions;
  onResolve: (data: { action: string; summary: string; decision: string; followUpDate?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    action: "",
    summary: "",
    decision: "",
    followUpDate: "",
  });

  const actionLabels: Record<string, string> = {
    clarification_requested: "Request Clarification",
    mediated_discussion: "Schedule Mediated Discussion",
    warning_issued: "Issue Warning",
    role_change_recommended: "Recommend Role Change",
    exit_recommended: "Recommend Exit",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve({
      action: formData.action,
      summary: formData.summary,
      decision: formData.decision,
      followUpDate: formData.followUpDate || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Select value={formData.action} onValueChange={(v) => setFormData({ ...formData, action: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(actionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="summary">Resolution Summary *</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="What was discussed and agreed upon?"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="decision">Final Decision *</Label>
            <Textarea
              id="decision"
              value={formData.decision}
              onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
              placeholder="What is the official decision?"
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="followUpDate">Follow-up Date (optional)</Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.action}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Resolution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getFrequentPeople(disputes: Dispute[]): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  
  disputes.forEach(d => {
    (d.involvedPartyNames || []).forEach((name: string) => {
      counts[name] = (counts[name] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .filter(([_, count]) => count >= 2)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getRecurringTypes(disputes: Dispute[]): { label: string; count: number }[] {
  const typeLabels: Record<string, string> = {
    miscommunication: "Miscommunication",
    missed_responsibility: "Missed Responsibility",
    disrespect: "Disrespect",
    performance_concern: "Performance Concern",
  };

  const counts: Record<string, number> = {};
  
  disputes.forEach(d => {
    counts[d.disputeType] = (counts[d.disputeType] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([type, count]) => ({ label: typeLabels[type] || type, count }))
    .sort((a, b) => b.count - a.count);
}
