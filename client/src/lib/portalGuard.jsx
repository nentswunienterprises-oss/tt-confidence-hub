import { Navigate } from "react-router-dom";
import { PORTAL_CONFIG, ROLE_TO_PORTAL, } from "@shared/portals";
/**
 * Portal-based route guard
 * Ensures users can only access portals and pages their role allows
 */
export function PortalGuard(_a) {
    var role = _a.role, requiredPortal = _a.requiredPortal, children = _a.children;
    if (!role) {
        return <Navigate to="/" replace/>;
    }
    var userPortal = ROLE_TO_PORTAL[role];
    // Check if user's role belongs to the required portal
    if (!PORTAL_CONFIG[requiredPortal].roles.includes(role)) {
        // Redirect to their correct portal
        var correctPortal = PORTAL_CONFIG[userPortal];
        return <Navigate to={correctPortal.dashboardRoute} replace/>;
    }
    return children;
}
/**
 * Executive portal specific guard
 * Only COO, HR, and CEO can access the executive portal
 * All others get redirected to their assigned portal
 */
export function ExecutivePortalGuard(_a) {
    var role = _a.role, children = _a.children;
    if (!role) {
        return <Navigate to="/" replace/>;
    }
    var executiveRoles = ["coo", "hr", "ceo"];
    if (!executiveRoles.includes(role)) {
        // Non-executive users get redirected to their portal
        var userPortal = ROLE_TO_PORTAL[role];
        var portalConfig = PORTAL_CONFIG[userPortal];
        return <Navigate to={portalConfig.dashboardRoute} replace/>;
    }
    return children;
}
/**
 * Check if a user can access a specific route based on their role
 */
export function canUserAccessRoute(userRole, requiredRoles) {
    return requiredRoles.includes(userRole);
}
/**
 * Get the appropriate redirect path for a user's role
 */
export function getRedirectPathForRole(role) {
    var portal = ROLE_TO_PORTAL[role];
    return PORTAL_CONFIG[portal].dashboardRoute;
}
