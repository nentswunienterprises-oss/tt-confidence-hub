import { Navigate } from "react-router-dom";
import {
  PORTAL_CONFIG,
  ROLE_TO_PORTAL,
  getDefaultDashboardRoute,
  type Role,
  type Portal,
} from "@shared/portals";

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
 * Only COO, HR, and CEO can access the executive portal
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

  const executiveRoles: Role[] = ["coo", "hr", "ceo"];
  if (!executiveRoles.includes(role)) {
    return <Navigate to={getDefaultDashboardRoute(role)} replace />;
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
