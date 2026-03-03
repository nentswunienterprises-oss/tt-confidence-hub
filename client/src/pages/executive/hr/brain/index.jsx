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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Brain, Users, ListTodo, Target, Lightbulb, Plus, User, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2, Search, Filter, } from "lucide-react";
export default function BrainModule() {
    var _this = this;
    var user = useAuth().user;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _a = useState("people"), activeTab = _a[0], setActiveTab = _a[1];
    // Modal states
    var _b = useState(false), showPersonModal = _b[0], setShowPersonModal = _b[1];
    var _c = useState(false), showDetailModal = _c[0], setShowDetailModal = _c[1];
    var _d = useState(false), showProjectModal = _d[0], setShowProjectModal = _d[1];
    var _e = useState(false), showIdeaModal = _e[0], setShowIdeaModal = _e[1];
    var _f = useState(null), selectedPerson = _f[0], setSelectedPerson = _f[1];
    var _g = useState(null), selectedIdea = _g[0], setSelectedIdea = _g[1];
    // Filter states
    var _h = useState("all"), statusFilter = _h[0], setStatusFilter = _h[1];
    var _j = useState(""), searchQuery = _j[0], setSearchQuery = _j[1];
    // Fetch data
    var _k = useQuery({
        queryKey: ["/api/hr/brain/people"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), _l = _k.data, people = _l === void 0 ? [] : _l, peopleLoading = _k.isLoading;
    var _m = useQuery({
        queryKey: ["/api/hr/brain/details"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), _o = _m.data, details = _o === void 0 ? [] : _o, detailsLoading = _m.isLoading;
    var _p = useQuery({
        queryKey: ["/api/hr/brain/projects"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), _q = _p.data, projects = _q === void 0 ? [] : _q, projectsLoading = _p.isLoading;
    var _r = useQuery({
        queryKey: ["/api/hr/brain/ideas"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }), _s = _r.data, ideas = _s === void 0 ? [] : _s, ideasLoading = _r.isLoading;
    // Mutations
    var createPerson = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/hr/brain/people", data)];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/people"] });
            setShowPersonModal(false);
            toast({ title: "Person added to registry" });
        },
    });
    var createDetail = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/hr/brain/details", data)];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/details"] });
            setShowDetailModal(false);
            toast({ title: "Detail assigned" });
        },
    });
    var markDetailDone = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("PATCH", "/api/hr/brain/details/".concat(id, "/done"), {})];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/details"] });
            toast({ title: "Detail marked as done" });
        },
    });
    var createProject = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/hr/brain/projects", data)];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/projects"] });
            setShowProjectModal(false);
            toast({ title: "Project created" });
        },
    });
    var updateIdeaStatus = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var id = _b.id, status = _b.status, notes = _b.notes;
            return __generator(this, function (_c) {
                return [2 /*return*/, apiRequest("PATCH", "/api/hr/brain/ideas/".concat(id, "/status"), { status: status, notes: notes })];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/ideas"] });
            setShowIdeaModal(false);
            toast({ title: "Idea status updated" });
        },
    });
    var convertIdeaToProject = useMutation({
        mutationFn: function (ideaId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiRequest("POST", "/api/hr/brain/ideas/".concat(ideaId, "/convert"), {})];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/ideas"] });
            queryClient.invalidateQueries({ queryKey: ["/api/hr/brain/projects"] });
            setShowIdeaModal(false);
            toast({ title: "Idea converted to project" });
        },
    });
    // Filter functions
    var filteredPeople = people.filter(function (p) {
        if (statusFilter !== "all" && p.status !== statusFilter)
            return false;
        if (searchQuery && !p.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
            return false;
        return true;
    });
    var pendingDetails = details.filter(function (d) { return d.status === "pending"; });
    var doneDetails = details.filter(function (d) { return d.status === "done"; });
    var missedDetails = details.filter(function (d) { return d.status === "missed"; });
    var activeProjects = projects.filter(function (p) { return p.status === "active"; });
    var atRiskProjects = projects.filter(function (p) { return p.status === "at_risk"; });
    var completedProjects = projects.filter(function (p) { return p.status === "completed"; });
    var newIdeas = ideas.filter(function (i) { return i.status === "new"; });
    var reviewedIdeas = ideas.filter(function (i) { return i.status === "reviewed"; });
    var approvedIdeas = ideas.filter(function (i) { return i.status === "approved"; });
    var userRole = user === null || user === void 0 ? void 0 : user.role;
    return (<ExecutivePortalGuard role={userRole}>
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary"/>
            <h1 className="text-3xl font-bold tracking-tight">Brain</h1>
          </div>
          <p className="text-muted-foreground">
            The thinking, execution, and institutional memory of the company
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="people" className="gap-2">
              <Users className="w-4 h-4"/>
              <span className="hidden sm:inline">People</span>
              <Badge variant="secondary" className="ml-1">{people.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <ListTodo className="w-4 h-4"/>
              <span className="hidden sm:inline">Details</span>
              <Badge variant="secondary" className="ml-1">{pendingDetails.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Target className="w-4 h-4"/>
              <span className="hidden sm:inline">Projects</span>
              <Badge variant="secondary" className="ml-1">{activeProjects.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4"/>
              <span className="hidden sm:inline">Ideas</span>
              <Badge variant="secondary" className="ml-1">{newIdeas.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* People Registry Tab */}
          <TabsContent value="people" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input placeholder="Search people..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-9"/>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2"/>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="exiting">Exiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={function () { return setShowPersonModal(true); }} className="gap-2">
                <Plus className="w-4 h-4"/>
                Add Person
              </Button>
            </div>

            {peopleLoading ? (<Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground"/>
              </Card>) : filteredPeople.length === 0 ? (<Card className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">No people in registry</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If you're not in the registry, you don't exist operationally.
                </p>
              </Card>) : (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPeople.map(function (person) { return (<PersonCard key={person.id} person={person} onSelect={function () { return setSelectedPerson(person); }}/>); })}
              </div>)}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={function () { return setShowDetailModal(true); }} className="gap-2">
                <Plus className="w-4 h-4"/>
                Assign Detail
              </Button>
            </div>

            {detailsLoading ? (<Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground"/>
              </Card>) : details.length === 0 ? (<Card className="p-12 text-center">
                <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">No details assigned</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You manage youth with visible commitments, not time sheets.
                </p>
              </Card>) : (<>
                {pendingDetails.length > 0 && (<DetailSection title="Pending" icon={<Clock className="w-5 h-5 text-yellow-500"/>} details={pendingDetails} onMarkDone={function (id) { return markDetailDone.mutate(id); }}/>)}
                {missedDetails.length > 0 && (<DetailSection title="Missed" icon={<XCircle className="w-5 h-5 text-red-500"/>} details={missedDetails} showMissedWarning/>)}
                {doneDetails.length > 0 && (<DetailSection title="Done" icon={<CheckCircle2 className="w-5 h-5 text-green-500"/>} details={doneDetails}/>)}
              </>)}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={function () { return setShowProjectModal(true); }} className="gap-2" disabled={people.length === 0}>
                <Plus className="w-4 h-4"/>
                Create Project
              </Button>
            </div>

            {projectsLoading ? (<Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground"/>
              </Card>) : projects.length === 0 ? (<Card className="p-12 text-center">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Projects only exist if they move revenue, reputation, or systems.
                </p>
              </Card>) : (<>
                {atRiskProjects.length > 0 && (<ProjectSection title="At Risk" icon={<AlertTriangle className="w-5 h-5 text-red-500"/>} projects={atRiskProjects}/>)}
                {activeProjects.length > 0 && (<ProjectSection title="Active" icon={<Target className="w-5 h-5 text-blue-500"/>} projects={activeProjects}/>)}
                {completedProjects.length > 0 && (<ProjectSection title="Completed" icon={<CheckCircle2 className="w-5 h-5 text-green-500"/>} projects={completedProjects}/>)}
              </>)}
          </TabsContent>

          {/* Ideas Tab */}
          <TabsContent value="ideas" className="space-y-6">
            {ideasLoading ? (<Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground"/>
              </Card>) : ideas.length === 0 ? (<Card className="p-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">No ideas submitted</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ideas don't move the company. Approved ideas do.
                </p>
              </Card>) : (<>
                {newIdeas.length > 0 && (<IdeaSection title="New Ideas" icon={<Lightbulb className="w-5 h-5 text-yellow-500"/>} ideas={newIdeas} onReview={function (idea) { setSelectedIdea(idea); setShowIdeaModal(true); }}/>)}
                {reviewedIdeas.length > 0 && (<IdeaSection title="Under Review" icon={<Clock className="w-5 h-5 text-blue-500"/>} ideas={reviewedIdeas} onReview={function (idea) { setSelectedIdea(idea); setShowIdeaModal(true); }}/>)}
                {approvedIdeas.length > 0 && (<IdeaSection title="Approved" icon={<CheckCircle2 className="w-5 h-5 text-green-500"/>} ideas={approvedIdeas} onReview={function (idea) { setSelectedIdea(idea); setShowIdeaModal(true); }}/>)}
              </>)}
          </TabsContent>
        </Tabs>

        {/* Add Person Modal */}
        <AddPersonModal open={showPersonModal} onOpenChange={setShowPersonModal} onSubmit={function (data) { return createPerson.mutate(data); }} isLoading={createPerson.isPending}/>

        {/* Add Detail Modal */}
        <AddDetailModal open={showDetailModal} onOpenChange={setShowDetailModal} people={people} onSubmit={function (data) { return createDetail.mutate(data); }} isLoading={createDetail.isPending}/>

        {/* Add Project Modal */}
        <AddProjectModal open={showProjectModal} onOpenChange={setShowProjectModal} people={people} onSubmit={function (data) { return createProject.mutate(data); }} isLoading={createProject.isPending}/>

        {/* Review Idea Modal */}
        {selectedIdea && (<ReviewIdeaModal open={showIdeaModal} onOpenChange={setShowIdeaModal} idea={selectedIdea} onUpdateStatus={function (status, notes) { return updateIdeaStatus.mutate({ id: selectedIdea.id, status: status, notes: notes }); }} onConvertToProject={function () { return convertIdeaToProject.mutate(selectedIdea.id); }} isLoading={updateIdeaStatus.isPending || convertIdeaToProject.isPending}/>)}
      </div>
    </ExecutivePortalGuard>);
}
// ============================================
// SUB-COMPONENTS
// ============================================
function PersonCard(_a) {
    var person = _a.person, onSelect = _a.onSelect;
    var statusColors = {
        active: "bg-green-100 text-green-800",
        paused: "bg-yellow-100 text-yellow-800",
        exiting: "bg-red-100 text-red-800",
    };
    return (<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary"/>
            </div>
            <div>
              <CardTitle className="text-base">{person.fullName}</CardTitle>
              <CardDescription>{person.roleTitle}</CardDescription>
            </div>
          </div>
          <Badge className={statusColors[person.status]}>{person.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {person.shortBio && <p className="line-clamp-2">{person.shortBio}</p>}
        {person.startDate && (<p className="mt-2 flex items-center gap-1">
            <Calendar className="w-3 h-3"/>
            Started {format(new Date(person.startDate), "MMM yyyy")}
          </p>)}
      </CardContent>
    </Card>);
}
function DetailSection(_a) {
    var title = _a.title, icon = _a.icon, details = _a.details, onMarkDone = _a.onMarkDone, showMissedWarning = _a.showMissedWarning;
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title} ({details.length})</h2>
        {showMissedWarning && (<Badge variant="outline" className="text-red-600 border-red-300">
            HR Signal
          </Badge>)}
      </div>
      <div className="grid gap-3">
        {details.map(function (detail) {
            var _a;
            return (<Card key={detail.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{detail.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3"/>
                    {((_a = detail.person) === null || _a === void 0 ? void 0 : _a.fullName) || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3"/>
                    Due {format(new Date(detail.dueDate), "MMM d")}
                  </span>
                </div>
              </div>
              {onMarkDone && detail.status === "pending" && (<Button size="sm" variant="outline" onClick={function () { return onMarkDone(detail.id); }}>
                  <CheckCircle2 className="w-4 h-4 mr-1"/>
                  Done
                </Button>)}
            </div>
          </Card>);
        })}
      </div>
    </div>);
}
function ProjectSection(_a) {
    var title = _a.title, icon = _a.icon, projects = _a.projects;
    var horizonLabels = {
        "30": "30 days",
        "60": "60 days",
        "90": "90 days",
    };
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title} ({projects.length})</h2>
      </div>
      <div className="grid gap-4">
        {projects.map(function (project) {
            var _a;
            return (<Card key={project.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <p className="text-muted-foreground mt-1">{project.objective}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <Badge variant="outline">{horizonLabels[project.horizon]}</Badge>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3"/>
                    {((_a = project.owner) === null || _a === void 0 ? void 0 : _a.fullName) || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </Card>);
        })}
      </div>
    </div>);
}
function IdeaSection(_a) {
    var title = _a.title, icon = _a.icon, ideas = _a.ideas, onReview = _a.onReview;
    var pillarColors = {
        revenue: "bg-green-100 text-green-800",
        reputation: "bg-blue-100 text-blue-800",
        systems: "bg-purple-100 text-purple-800",
        culture: "bg-orange-100 text-orange-800",
        other: "bg-gray-100 text-gray-800",
    };
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title} ({ideas.length})</h2>
      </div>
      <div className="grid gap-4">
        {ideas.map(function (idea) { return (<Card key={idea.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={function () { return onReview(idea); }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{idea.title}</h3>
                  <Badge className={pillarColors[idea.pillar]}>{idea.pillar}</Badge>
                </div>
                <p className="text-muted-foreground mt-2 line-clamp-2">{idea.description}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Submitted by {idea.submitterName || "Unknown"} • {format(new Date(idea.createdAt), "MMM d")}
                </p>
              </div>
              <Button variant="outline" size="sm">Review</Button>
            </div>
          </Card>); })}
      </div>
    </div>);
}
// ============================================
// MODAL COMPONENTS
// ============================================
function AddPersonModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSubmit = _a.onSubmit, isLoading = _a.isLoading;
    var _b = useState({
        fullName: "",
        roleTitle: "",
        roleDescription: "",
        shortBio: "",
        teamName: "",
        email: "",
        phone: "",
        status: "active",
    }), formData = _b[0], setFormData = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSubmit(formData);
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to People Registry</DialogTitle>
          <DialogDescription>
            Add a new person to the organizational registry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={formData.fullName} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { fullName: e.target.value })); }} required/>
            </div>
            <div>
              <Label htmlFor="roleTitle">Role Title *</Label>
              <Input id="roleTitle" value={formData.roleTitle} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { roleTitle: e.target.value })); }} required/>
            </div>
            <div>
              <Label htmlFor="roleDescription">Role Description (What winning looks like)</Label>
              <Textarea id="roleDescription" value={formData.roleDescription} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { roleDescription: e.target.value })); }} rows={2}/>
            </div>
            <div>
              <Label htmlFor="shortBio">Short Bio (How they see themselves)</Label>
              <Textarea id="shortBio" value={formData.shortBio} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { shortBio: e.target.value })); }} rows={2}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }}/>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { phone: e.target.value })); }}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">Team / Pod</Label>
                <Input id="teamName" value={formData.teamName} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { teamName: e.target.value })); }}/>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { status: v })); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="exiting">Exiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Add Person
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
function AddDetailModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, people = _a.people, onSubmit = _a.onSubmit, isLoading = _a.isLoading;
    var _b = useState({
        personId: "",
        description: "",
        dueDate: "",
    }), formData = _b[0], setFormData = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSubmit(formData);
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Weekly Detail</DialogTitle>
          <DialogDescription>
            Assign a deliverable to a team member. No essays - just execution signals.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="personId">Assign To *</Label>
            <Select value={formData.personId} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { personId: v })); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select person"/>
              </SelectTrigger>
              <SelectContent>
                {people.filter(function (p) { return p.status === "active"; }).map(function (person) { return (<SelectItem key={person.id} value={person.id}>
                    {person.fullName} - {person.roleTitle}
                  </SelectItem>); })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="What needs to be delivered?" required/>
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input id="dueDate" type="date" value={formData.dueDate} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { dueDate: e.target.value })); }} required/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.personId}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Assign Detail
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
function AddProjectModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, people = _a.people, onSubmit = _a.onSubmit, isLoading = _a.isLoading;
    var _b = useState({
        name: "",
        ownerId: "",
        horizon: "30",
        objective: "",
    }), formData = _b[0], setFormData = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSubmit(formData);
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Projects only exist if they move revenue, reputation, or systems.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required/>
          </div>
          <div>
            <Label htmlFor="ownerId">Owner (Single Throat to Choke) *</Label>
            <Select value={formData.ownerId} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { ownerId: v })); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner"/>
              </SelectTrigger>
              <SelectContent>
                {people.filter(function (p) { return p.status === "active"; }).map(function (person) { return (<SelectItem key={person.id} value={person.id}>
                    {person.fullName}
                  </SelectItem>); })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="horizon">Time Horizon *</Label>
            <Select value={formData.horizon} onValueChange={function (v) { return setFormData(__assign(__assign({}, formData), { horizon: v })); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="objective">Objective (1 sentence) *</Label>
            <Textarea id="objective" value={formData.objective} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { objective: e.target.value })); }} placeholder="What is this project trying to achieve?" rows={2} required/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.ownerId}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
function ReviewIdeaModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, idea = _a.idea, onUpdateStatus = _a.onUpdateStatus, onConvertToProject = _a.onConvertToProject, isLoading = _a.isLoading;
    var _b = useState(""), notes = _b[0], setNotes = _b[1];
    var pillarColors = {
        revenue: "bg-green-100 text-green-800",
        reputation: "bg-blue-100 text-blue-800",
        systems: "bg-purple-100 text-purple-800",
        culture: "bg-orange-100 text-orange-800",
        other: "bg-gray-100 text-gray-800",
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{idea.title}</DialogTitle>
          <DialogDescription>
            Review and take action on this idea.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={pillarColors[idea.pillar]}>{idea.pillar}</Badge>
            <span className="text-sm text-muted-foreground">
              by {idea.submitterName || "Unknown"} • {format(new Date(idea.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="mt-1">{idea.description}</p>
          </div>
          {idea.problemSolved && (<div>
              <Label className="text-muted-foreground">Problem Solved</Label>
              <p className="mt-1">{idea.problemSolved}</p>
            </div>)}
          <div>
            <Label htmlFor="notes">Review Notes</Label>
            <Textarea id="notes" value={notes} onChange={function (e) { return setNotes(e.target.value); }} placeholder="Add any notes about this idea..." rows={2}/>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={function () { return onUpdateStatus("archived", notes); }} disabled={isLoading}>
            Archive
          </Button>
          <Button variant="outline" onClick={function () { return onUpdateStatus("reviewed", notes); }} disabled={isLoading}>
            Mark Reviewed
          </Button>
          {idea.status !== "approved" && (<Button onClick={function () { return onUpdateStatus("approved", notes); }} disabled={isLoading}>
              Approve
            </Button>)}
          {idea.status === "approved" && !idea.convertedToProjectId && (<Button onClick={onConvertToProject} disabled={isLoading} className="gap-2">
              <Target className="w-4 h-4"/>
              Convert to Project
            </Button>)}
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
