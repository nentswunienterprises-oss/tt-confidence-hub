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
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Home, Users, FolderKanban, FileCheck, Bell, LogOut, BookOpen, TrendingUp, Calendar, MessageSquare, Lightbulb, Shield, } from "lucide-react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useAuth } from "@/hooks/useAuth";
import { isTutor, isTD, isCOO, isAffiliate, isOD, isParent, getRoleName, getRoleNameShort } from "@/lib/roles";
import { logout } from "@/lib/auth";
import { SubmitIdeaModal } from "@/components/SubmitIdeaModal";
import { LogDisputeModal } from "@/components/LogDisputeModal";
import { ROLE_NAVIGATION } from "@shared/portals";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_URL } from "@/lib/config";
export function DashboardLayout(_a) {
    var _this = this;
    var children = _a.children;
    var _b = useAuth(), user = _b.user, isAuthenticated = _b.isAuthenticated;
    var location = useLocation();
    // Submit Idea Modal state
    var _c = useState(false), showIdeaModal = _c[0], setShowIdeaModal = _c[1];
    // Log Dispute Modal state
    var _d = useState(false), showDisputeModal = _d[0], setShowDisputeModal = _d[1];
    // Check for student authentication (separate system)
    var _e = useState(null), studentUser = _e[0], setStudentUser = _e[1];
    var _f = useState(false), isStudentAuth = _f[0], setIsStudentAuth = _f[1];
    useEffect(function () {
        // Check if student is authenticated
        var checkStudentAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(API_URL, "/api/student/me"), { credentials: "include" })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        console.log("🎓 Student authenticated:", data);
                        setStudentUser(data);
                        setIsStudentAuth(true);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        if (!user && !isAuthenticated) {
            checkStudentAuth();
        }
    }, [user, isAuthenticated]);
    // Use student user if available, otherwise use regular user
    var effectiveUser = isStudentAuth ? __assign(__assign({}, studentUser), { role: "student", name: "".concat((studentUser === null || studentUser === void 0 ? void 0 : studentUser.firstName) || "", " ").concat((studentUser === null || studentUser === void 0 ? void 0 : studentUser.lastName) || "").trim(), email: studentUser === null || studentUser === void 0 ? void 0 : studentUser.email }) : user;
    var effectiveIsAuth = isAuthenticated || isStudentAuth;
    console.log("🎯 DashboardLayout render:");
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  isStudentAuth:", isStudentAuth);
    console.log("  user:", user);
    console.log("  studentUser:", studentUser);
    console.log("  effectiveUser:", effectiveUser);
    console.log("  effectiveUser.role:", effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.role);
    console.log("  location.pathname:", location.pathname);
    // Fetch pod data for tutors - only when user is authenticated and is a tutor
    var tutorPodData = useQuery({
        queryKey: ["/api/tutor/pod"],
        enabled: effectiveIsAuth && !!effectiveUser && isTutor(effectiveUser),
        retry: false,
    }).data;
    // Fetch parent student info (includes pod name)
    var parentStudentInfo = useQuery({
        queryKey: ["/api/parent/student-info"],
        enabled: effectiveIsAuth && !!effectiveUser && isParent(effectiveUser),
        retry: false,
    }).data;
    console.log("👨‍👩‍👧 Parent student info:", parentStudentInfo);
    // Fetch unread broadcast count
    var unreadData = useQuery({
        queryKey: ["/api/broadcasts/unread-count"],
        enabled: effectiveIsAuth && !!effectiveUser,
        refetchInterval: 30000, // Refetch every 30 seconds
    }).data;
    // Fetch all broadcasts to filter unread ones
    var broadcasts = useQuery({
        queryKey: ["/api/broadcasts"],
        enabled: effectiveIsAuth && !!effectiveUser,
    }).data;
    // Fetch read broadcasts list
    var readData = useQuery({
        queryKey: ["/api/broadcasts/read-list"],
        enabled: effectiveIsAuth && !!effectiveUser,
    }).data;
    // Filter unread broadcasts
    var unreadBroadcasts = (broadcasts === null || broadcasts === void 0 ? void 0 : broadcasts.filter(function (b) { var _a; return !((_a = readData === null || readData === void 0 ? void 0 : readData.readBroadcasts) === null || _a === void 0 ? void 0 : _a.includes(b.id)); })) || [];
    // Mark broadcast as read mutation
    var markAsRead = useMutation({
        mutationFn: function (broadcastId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/broadcasts/".concat(broadcastId, "/read"), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/read-list"] });
            queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/unread-count"] });
        },
    });
    var getNavIcon = function (label) {
        var lowerLabel = label.toLowerCase();
        if (lowerLabel.includes("dashboard") || lowerLabel.includes("home"))
            return <Home className="w-5 h-5"/>;
        if (lowerLabel.includes("session"))
            return <Calendar className="w-5 h-5"/>;
        if (lowerLabel.includes("progress") || lowerLabel.includes("growth"))
            return <TrendingUp className="w-5 h-5"/>;
        if (lowerLabel.includes("academic"))
            return <BookOpen className="w-5 h-5"/>;
        if (lowerLabel.includes("assignment"))
            return <FileCheck className="w-5 h-5"/>;
        if (lowerLabel.includes("update"))
            return <Bell className="w-5 h-5"/>;
        if (lowerLabel.includes("disc") || lowerLabel.includes("discover"))
            return <FolderKanban className="w-5 h-5"/>;
        if (lowerLabel.includes("track"))
            return <TrendingUp className="w-5 h-5"/>;
        if (lowerLabel.includes("pod"))
            return <FolderKanban className="w-5 h-5"/>;
        if (lowerLabel.includes("traffic"))
            return <Users className="w-5 h-5"/>;
        if (lowerLabel.includes("brain"))
            return <Lightbulb className="w-5 h-5"/>;
        if (lowerLabel.includes("dispute"))
            return <Shield className="w-5 h-5"/>;
        return <Home className="w-5 h-5"/>;
    };
    var tutorNav = [
        { label: "My Pod", path: "/tutor/pod", icon: <FolderKanban className="w-5 h-5"/> },
        { label: "Growth", path: "/tutor/growth", icon: <TrendingUp className="w-5 h-5"/> },
        { label: "Sessions", path: "/tutor/sessions", icon: <Calendar className="w-5 h-5"/> },
        { label: "Updates", path: "/tutor/updates", icon: <Bell className="w-5 h-5"/> },
    ];
    var tdNav = [
        { label: "Dashboard", path: "/td/dashboard", icon: <Home className="w-5 h-5"/> },
        { label: "My Pods", path: "/td/overview", icon: <FolderKanban className="w-5 h-5"/> },
        { label: "Reports", path: "/td/reports", icon: <FileCheck className="w-5 h-5"/> },
        { label: "Updates", path: "/td/updates", icon: <Bell className="w-5 h-5"/> },
    ];
    var cooNav = [
        { label: "Dashboard", path: "/coo/dashboard", icon: <Home className="w-5 h-5"/> },
        { label: "Tutor Applications", path: "/coo/tutor-applications", icon: <FileCheck className="w-5 h-5"/> },
        { label: "Pods", path: "/coo/pods", icon: <FolderKanban className="w-5 h-5"/> },
        { label: "Broadcast", path: "/coo/broadcast", icon: <MessageSquare className="w-5 h-5"/> },
    ];
    var studentNav = [
        { label: "Dashboard", path: "/client/student/dashboard", icon: <Home className="w-5 h-5"/> },
        { label: "Growth", path: "/client/student/growth", icon: <TrendingUp className="w-5 h-5"/> },
        { label: "Academic Tracker", path: "/client/student/academic-tracker", icon: <BookOpen className="w-5 h-5"/> },
        { label: "Assignments", path: "/client/student/assignments", icon: <FileCheck className="w-5 h-5"/> },
        { label: "Updates", path: "/client/student/updates", icon: <Bell className="w-5 h-5"/> },
    ];
    var affiliateNav = [
        { label: "Home", path: "/affiliate/affiliate/home", icon: <Home className="w-5 h-5"/> },
        { label: "Disc & Deli", path: "/affiliate/affiliate/discover-deliver", icon: <FolderKanban className="w-5 h-5"/> },
        { label: "Tracking", path: "/affiliate/affiliate/tracking", icon: <TrendingUp className="w-5 h-5"/> },
        { label: "Updates", path: "/affiliate/affiliate/updates", icon: <Bell className="w-5 h-5"/> },
    ];
    var odNav = [
        { label: "Dashboard", path: "/affiliate/od/dashboard", icon: <Home className="w-5 h-5"/> },
        { label: "Encounters", path: "/affiliate/od/encounters", icon: <Users className="w-5 h-5"/> },
        { label: "Affiliates", path: "/affiliate/od/affiliates", icon: <FolderKanban className="w-5 h-5"/> },
        { label: "Updates", path: "/affiliate/od/updates", icon: <Bell className="w-5 h-5"/> },
    ];
    var getRoleNavigation = function () {
        if (!(effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.role)) {
            console.log("❌ No user role available");
            return [];
        }
        console.log("📍 Getting navigation for role:", effectiveUser.role);
        // For legacy tutor/TD/COO, use hardcoded nav arrays
        if (isTutor(effectiveUser)) {
            console.log("  → Using tutor hardcoded nav");
            return tutorNav;
        }
        if (isTD(effectiveUser)) {
            console.log("  → Using TD hardcoded nav");
            return tdNav;
        }
        if (isCOO(effectiveUser)) {
            console.log("  → Using COO hardcoded nav");
            return cooNav;
        }
        // Check for student role (student auth uses different system)
        if (effectiveUser.role === "student") {
            console.log("  → Using student hardcoded nav");
            return studentNav;
        }
        // Check for affiliate role
        if (isAffiliate(effectiveUser)) {
            console.log("  → Using affiliate hardcoded nav");
            return affiliateNav;
        }
        // Check for OD role
        if (isOD(effectiveUser)) {
            console.log("  → Using OD hardcoded nav");
            return odNav;
        }
        // For all other roles, use ROLE_NAVIGATION config
        var roleNav = ROLE_NAVIGATION[effectiveUser.role];
        console.log("  → Using ROLE_NAVIGATION for role:", effectiveUser.role);
        console.log("  → Role nav config:", roleNav);
        if (!roleNav) {
            console.error("❌ No navigation config found for role:", effectiveUser.role);
            return [];
        }
        // Map role navigation items to NavItems with icons
        return roleNav.map(function (item) { return ({
            label: item.label,
            path: item.path,
            icon: getNavIcon(item.label),
        }); });
    };
    var navItems = getRoleNavigation();
    var getUserFullName = function (u) {
        if (!u)
            return "User";
        if (u.name && u.name.trim())
            return u.name;
        if (u.firstName && u.lastName)
            return "".concat(u.firstName, " ").concat(u.lastName);
        if (u.firstName)
            return u.firstName;
        if (u.email)
            return u.email.split("@")[0];
        return "User";
    };
    var getUserFirstName = function (u) {
        var fullName = getUserFullName(u);
        return fullName.split(" ")[0] || "User";
    };
    var getInitials = function (u) {
        if (!u)
            return "U";
        if (u.firstName && u.lastName) {
            return "".concat(u.firstName[0]).concat(u.lastName[0]).toUpperCase();
        }
        if (u.name && u.name.trim()) {
            return u.name
                .split(" ")
                .map(function (n) { return n[0]; })
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (u.email) {
            return u.email[0].toUpperCase();
        }
        return "U";
    };
    var getRoleLabel = function (u) {
        if (!(u === null || u === void 0 ? void 0 : u.role))
            return "";
        return getRoleName(u.role);
    };
    var getRoleLabelShort = function (u) {
        if (!(u === null || u === void 0 ? void 0 : u.role))
            return "";
        return getRoleNameShort(u.role);
    };
    var getPodLabel = function () {
        var _a;
        // Show pod name only for tutors with an actual pod assignment
        // Students and parents just see their role, not pod info
        if (isTutor(effectiveUser) && ((_a = tutorPodData === null || tutorPodData === void 0 ? void 0 : tutorPodData.assignment) === null || _a === void 0 ? void 0 : _a.pod)) {
            return tutorPodData.assignment.pod.podName;
        }
        return "";
    };
    return (<div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="h-16 px-4 flex items-center justify-between gap-4">
          {/* Mobile Layout: Role/Pod on left, Title center, Profile right */}
          <div className="sm:hidden flex items-center justify-between w-full">
            {/* Left: Role & Pod as fraction style */}
            <div className="text-xs text-muted-foreground font-medium min-w-[40px]">
              {effectiveUser && (getPodLabel() ? (<div className="flex flex-col items-start">
                    <span>{getRoleLabelShort(effectiveUser)}</span>
                    <div className="w-8 h-px bg-muted-foreground/40 my-0.5"/>
                    <span>{getPodLabel()}</span>
                  </div>) : (<span>{getRoleLabelShort(effectiveUser)}</span>))}
            </div>
            {/* Center: Title */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <div className="font-bold text-base tracking-tight whitespace-nowrap">THE RESPONSE HUB</div>
            </Link>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div>
                <div className="font-bold text-base tracking-tight">TT Response Hub</div>
                {effectiveUser && (<div className="text-xs text-muted-foreground">
                    {getRoleLabel(effectiveUser)}
                    {getPodLabel() && " \u2022 ".concat(getPodLabel())}
                  </div>)}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(function (item) { return (<Link key={item.path} to={item.path}>
                <Button variant="ghost" size="sm" className="gap-2 font-medium relative">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.label === "Updates" && unreadBroadcasts && unreadBroadcasts.length > 0 && (<Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                      {unreadBroadcasts.length > 9 ? "9+" : unreadBroadcasts.length}
                    </Badge>)}
                </Button>
              </Link>); })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover-elevate" data-testid="button-user-menu">
                  <Avatar className="w-9 h-9 border-2 border-primary/20">
                    <AvatarImage src={(effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.profileImageUrl) || undefined} alt={getUserFullName(effectiveUser)}/>
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {getInitials(effectiveUser)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-semibold" data-testid="text-user-first-name">{getUserFirstName(effectiveUser)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={(effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.profileImageUrl) || undefined} alt={getUserFullName(effectiveUser)}/>
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(effectiveUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none" data-testid="text-user-full-name">{getUserFullName(effectiveUser)}</p>
                      <p className="text-xs leading-none text-muted-foreground">{effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {(effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.role) ? getRoleName(effectiveUser.role) : "Unknown"}
                  </Badge>
                  {isTutor(effectiveUser) && (<DropdownMenuItem asChild className="p-0">
                      <Link to="/tutor/profile" className="text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer">
                        View Profile
                      </Link>
                    </DropdownMenuItem>)}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={function () { return setShowIdeaModal(true); }} className="gap-2 font-medium">
                  <Lightbulb className="w-4 h-4"/>
                  Submit Idea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={function () { return setShowDisputeModal(true); }} className="gap-2 font-medium">
                  <Shield className="w-4 h-4"/>
                  Log Issue
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={function () { return logout(); }} className="text-destructive gap-2 font-medium" data-testid="button-logout">
                  <LogOut className="w-4 h-4"/>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content - Add bottom padding on mobile for bottom nav */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 md:px-6 md:py-8 pb-20 md:pb-8">{children}</main>
      
      {/* Mobile Bottom Tab Navigator */}
      <MobileBottomNav navItems={navItems} unreadCount={(unreadBroadcasts === null || unreadBroadcasts === void 0 ? void 0 : unreadBroadcasts.length) || 0}/>
      
      {/* Submit Idea Modal */}
      <SubmitIdeaModal open={showIdeaModal} onOpenChange={setShowIdeaModal}/>
      
      {/* Log Dispute Modal */}
      <LogDisputeModal open={showDisputeModal} onOpenChange={setShowDisputeModal}/>
    </div>);
}
