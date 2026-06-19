import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  PORTAL_CONFIG,
  ROLE_TO_PORTAL,
  getDefaultDashboardRoute,
  type Role,
  type Portal,
} from "@shared/portals";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

/**
 * Portal-based route guard
 * Ensures users can only access portals and pages their role allows
 */
export function PortalGuard({
  role,
  requiredPortal,
  children,
}: {
  role: Role | null;
  requiredPortal: Portal;
  children: React.ReactNode;
}) {
  if (!role) {
    return <Navigate to="/" replace />;
  }

  const userPortal = ROLE_TO_PORTAL[role];

  // Check if user's role belongs to the required portal
  if (!PORTAL_CONFIG[requiredPortal].roles.includes(role)) {
    return <Navigate to={getDefaultDashboardRoute(role)} replace />;
  }

  return children;
}

/**
 * Executive portal specific guard
 * Only executive roles can access the executive portal
 * All others get redirected to their assigned portal
 */
export function ExecutivePortalGuard({
  role,
  children,
}: {
  role: Role | null;
  children: React.ReactNode;
}) {
  if (!role) {
    return <Navigate to="/" replace />;
  }

  const executiveRoles: Role[] = ["coo", "hr", "ceo", "cto", "cmo"];
  if (!executiveRoles.includes(role)) {
    return <Navigate to={getDefaultDashboardRoute(role)} replace />;
  }

  return children;
}

export function ExecutiveSeatGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const actualRole = (user?.role as Role | undefined) || null;
  const executiveRoles: Role[] = ["coo", "hr", "ceo", "cto", "cmo"];
  const isExecutiveRole = actualRole ? executiveRoles.includes(actualRole) : false;

  const { data, isLoading } = useQuery<{
    mySeat: { isCurrentUserAppointed: boolean } | null;
  }>({
    queryKey: ["/api/executive/gateway"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!actualRole && isExecutiveRole,
    refetchOnWindowFocus: false,
  });

  if (authLoading) {
    return <div className="p-8">Loading executive access...</div>;
  }

  if (!actualRole) {
    return <Navigate to="/" replace />;
  }

  if (!isExecutiveRole) {
    return <Navigate to={getDefaultDashboardRoute(actualRole)} replace />;
  }

  if (actualRole !== role) {
    return <Navigate to={getDefaultDashboardRoute(actualRole)} replace />;
  }

  if (isLoading) {
    return <div className="p-8">Loading executive seat status...</div>;
  }

  if (!data?.mySeat?.isCurrentUserAppointed) {
    return <Navigate to="/executive/gateway" replace />;
  }

  return children;
}

/**
 * Check if a user can access a specific route based on their role
 */
export function canUserAccessRoute(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Get the appropriate redirect path for a user's role
 */
export function getRedirectPathForRole(role: Role): string {
  const portal = ROLE_TO_PORTAL[role];
  return PORTAL_CONFIG[portal].dashboardRoute;
}
