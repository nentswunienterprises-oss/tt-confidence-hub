import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Users,
  FolderKanban,
  FileCheck,
  Bell,
  LogOut,
  Menu,
  X,
  BookOpen,
  TrendingUp,
  Calendar,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isTutor, isTD, isCOO, isAffiliate, isParent, getRoleName } from "@/lib/roles";
import { logout } from "@/lib/auth";
import { ROLE_NAVIGATION } from "@shared/portals";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Pod, TutorAssignment, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

interface PodData {
  assignment: TutorAssignment & { pod: Pod };
  students: any[];
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check for student authentication (separate system)
  const [studentUser, setStudentUser] = useState<any>(null);
  const [isStudentAuth, setIsStudentAuth] = useState(false);
  
  useEffect(() => {
    // Check if student is authenticated
    const checkStudentAuth = async () => {
      try {
        const response = await fetch("/api/student/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          console.log("🎓 Student authenticated:", data);
          setStudentUser(data);
          setIsStudentAuth(true);
        }
      } catch (err) {
        // Not a student or not authenticated
      }
    };
    
    if (!user && !isAuthenticated) {
      checkStudentAuth();
    }
  }, [user, isAuthenticated]);
  
  // Use student user if available, otherwise use regular user
  const effectiveUser = isStudentAuth ? {
    ...studentUser,
    role: "student",
    name: `${studentUser?.firstName || ""} ${studentUser?.lastName || ""}`.trim(),
    email: studentUser?.email,
  } : user;
  
  const effectiveIsAuth = isAuthenticated || isStudentAuth;

  console.log("🎯 DashboardLayout render:");
  console.log("  isAuthenticated:", isAuthenticated);
  console.log("  isStudentAuth:", isStudentAuth);
  console.log("  user:", user);
  console.log("  studentUser:", studentUser);
  console.log("  effectiveUser:", effectiveUser);
  console.log("  effectiveUser.role:", effectiveUser?.role);
  console.log("  location.pathname:", location.pathname);

  // Fetch pod data for tutors - only when user is authenticated and is a tutor
  const { data: tutorPodData } = useQuery<PodData>({
    queryKey: ["/api/tutor/pod"],
    enabled: effectiveIsAuth && !!effectiveUser && isTutor(effectiveUser),
    retry: false,
  });

  // Fetch parent student info (includes pod name)
  const { data: parentStudentInfo } = useQuery<{ name: string; grade: string; podName: string | null }>({
    queryKey: ["/api/parent/student-info"],
    enabled: effectiveIsAuth && !!effectiveUser && isParent(effectiveUser),
    retry: false,
  });

  console.log("👨‍👩‍👧 Parent student info:", parentStudentInfo);

  // Fetch unread broadcast count
  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ["/api/broadcasts/unread-count"],
    enabled: effectiveIsAuth && !!effectiveUser,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch all broadcasts to filter unread ones
  const { data: broadcasts } = useQuery<any[]>({
    queryKey: ["/api/broadcasts"],
    enabled: effectiveIsAuth && !!effectiveUser,
  });

  // Fetch read broadcasts list
  const { data: readData } = useQuery<{ readBroadcasts: string[] }>({
    queryKey: ["/api/broadcasts/read-list"],
    enabled: effectiveIsAuth && !!effectiveUser,
  });

  // Filter unread broadcasts
  const unreadBroadcasts = broadcasts?.filter(
    (b: any) => !readData?.readBroadcasts?.includes(b.id)
  ) || [];

  // Mark broadcast as read mutation
  const markAsRead = useMutation({
    mutationFn: async (broadcastId: string) => {
      await apiRequest("POST", `/api/broadcasts/${broadcastId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/read-list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/unread-count"] });
    },
  });

  const getNavIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("dashboard") || lowerLabel.includes("home")) return <Home className="w-5 h-5" />;
    if (lowerLabel.includes("session")) return <Calendar className="w-5 h-5" />;
    if (lowerLabel.includes("progress") || lowerLabel.includes("growth")) return <TrendingUp className="w-5 h-5" />;
    if (lowerLabel.includes("academic")) return <BookOpen className="w-5 h-5" />;
    if (lowerLabel.includes("assignment")) return <FileCheck className="w-5 h-5" />;
    if (lowerLabel.includes("update")) return <Bell className="w-5 h-5" />;
    if (lowerLabel.includes("disc") || lowerLabel.includes("discover")) return <FolderKanban className="w-5 h-5" />;
    if (lowerLabel.includes("track")) return <TrendingUp className="w-5 h-5" />;
    if (lowerLabel.includes("pod")) return <FolderKanban className="w-5 h-5" />;
    return <Home className="w-5 h-5" />;
  };

  const tutorNav: NavItem[] = [
    { label: "My Pod", path: "/tutor/pod", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Growth", path: "/tutor/growth", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Academics", path: "/tutor/academics", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Sessions", path: "/tutor/sessions", icon: <Calendar className="w-5 h-5" /> },
    { label: "Updates", path: "/tutor/updates", icon: <Bell className="w-5 h-5" /> },
  ];

  const tdNav: NavItem[] = [
    { label: "Dashboard", path: "/td/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "My Pods", path: "/td/overview", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Reports", path: "/td/reports", icon: <FileCheck className="w-5 h-5" /> },
    { label: "Updates", path: "/td/updates", icon: <Bell className="w-5 h-5" /> },
  ];

  const cooNav: NavItem[] = [
    { label: "Dashboard", path: "/coo/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "Tutor Applications", path: "/coo/tutor-applications", icon: <FileCheck className="w-5 h-5" /> },
    { label: "Pods", path: "/coo/pods", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Broadcast", path: "/coo/broadcast", icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const studentNav: NavItem[] = [
    { label: "Dashboard", path: "/client/student/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "Growth", path: "/client/student/growth", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Academic Tracker", path: "/client/student/academic-tracker", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Assignments", path: "/client/student/assignments", icon: <FileCheck className="w-5 h-5" /> },
    { label: "Updates", path: "/client/student/updates", icon: <Bell className="w-5 h-5" /> },
  ];

  const getRoleNavigation = (): NavItem[] => {
    if (!effectiveUser?.role) {
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
    
    // For all other roles, use ROLE_NAVIGATION config
    const roleNav = ROLE_NAVIGATION[effectiveUser.role];
    console.log("  → Using ROLE_NAVIGATION for role:", effectiveUser.role);
    console.log("  → Role nav config:", roleNav);
    
    if (!roleNav) {
      console.error("❌ No navigation config found for role:", effectiveUser.role);
      return [];
    }
    
    // Map role navigation items to NavItems with icons
    return roleNav.map((item) => ({
      label: item.label,
      path: item.path,
      icon: getNavIcon(item.label),
    }));
  };

  const navItems = getRoleNavigation();

  const getUserFullName = (u: User | undefined): string => {
    if (!u) return "User";
    if (u.name && u.name.trim()) return u.name;
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    if (u.firstName) return u.firstName;
    if (u.email) return u.email.split("@")[0];
    return "User";
  };

  const getUserFirstName = (u: User | undefined): string => {
    const fullName = getUserFullName(u);
    return fullName.split(" ")[0] || "User";
  };

  const getInitials = (u: User | undefined): string => {
    if (!u) return "U";
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    if (u.name && u.name.trim()) {
      return u.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (u.email) {
      return u.email[0].toUpperCase();
    }
    return "U";
  };

  const getRoleLabel = (u: User | undefined): string => {
    if (!u?.role) return "";
    return getRoleName(u.role);
  };

  const getPodLabel = () => {
    // Show pod name only when tutor has an actual pod assignment
    // Note: TDs without pods are redirected to /td/no-pod, so they won't see this header
    if (isTutor(effectiveUser) && tutorPodData?.assignment?.pod) {
      return tutorPodData.assignment.pod.podName;
    }
    // Show pod name for parents based on their assigned tutor's pod
    if (isParent(effectiveUser) && parentStudentInfo?.podName) {
      console.log("🎯 Returning parent pod name:", parentStudentInfo.podName);
      return parentStudentInfo.podName;
    }
    // Show pod name for students based on their tutor's pod
    if (isStudentAuth && studentUser?.podName) {
      console.log("🎓 Returning student pod name:", studentUser.podName);
      return studentUser.podName;
    }
    console.log("❌ No pod label to show. effectiveUser.role:", effectiveUser?.role, "parentStudentInfo:", parentStudentInfo, "studentUser:", studentUser);
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="h-16 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <Link to="/" className="flex items-center gap-3">
              <div className="hidden sm:block">
                <div className="font-bold text-base tracking-tight">TT Confidence Hub</div>
                {effectiveUser && (
                  <div className="text-xs text-muted-foreground">
                    {getRoleLabel(effectiveUser)}
                    {getPodLabel() && ` • ${getPodLabel()}`}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant="ghost" size="sm" className="gap-2 font-medium relative">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.label === "Updates" && unreadBroadcasts && unreadBroadcasts.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                      {unreadBroadcasts.length > 9 ? "9+" : unreadBroadcasts.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 hover-elevate"
                  data-testid="button-user-menu"
                >
                  <Avatar className="w-9 h-9 border-2 border-primary/20">
                    <AvatarImage src={effectiveUser?.profileImageUrl || undefined} alt={getUserFullName(effectiveUser)} />
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
                      <AvatarImage src={effectiveUser?.profileImageUrl || undefined} alt={getUserFullName(effectiveUser)} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(effectiveUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none" data-testid="text-user-full-name">{getUserFullName(effectiveUser)}</p>
                      <p className="text-xs leading-none text-muted-foreground">{effectiveUser?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {effectiveUser?.role ? getRoleName(effectiveUser.role) : "Unknown"}
                  </Badge>
                  {isTutor(effectiveUser) && (
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/tutor/profile" className="text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive gap-2 font-medium"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-card px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start gap-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
