/**
 * Portal Routing Configuration
 * Defines which roles belong to which portals and their navigation structures
 */
// Portal definitions with their roles and routes
export var PORTAL_CONFIG = {
    client: {
        roles: ["parent", "student"],
        isPublic: true,
        description: "Client Portal - Parent & Student Interface",
        dashboardRoute: "/client/parent/dashboard",
    },
    affiliate: {
        roles: ["affiliate", "od"],
        isPublic: true,
        description: "Affiliate Portal - Affiliate & Outreach Director Interface",
        dashboardRoute: "/affiliate/gateway",
    },
    operational: {
        roles: ["tutor", "td"],
        isPublic: true,
        description: "Operational Portal - Tutor & Territory Director Interface",
        dashboardRoute: "/tutor/pod",
    },
    executive: {
        roles: ["coo", "hr", "ceo"],
        isPublic: false,
        description: "Executive Portal - COO, HR & CEO Interface",
        dashboardRoute: "/executive/coo/dashboard",
    },
};
// Role-to-Portal mapping for quick lookup
export var ROLE_TO_PORTAL = {
    parent: "client",
    student: "client",
    affiliate: "affiliate",
    od: "affiliate",
    tutor: "operational",
    td: "operational",
    coo: "executive",
    hr: "executive",
    ceo: "executive",
};
// Navigation structure for each role
export var ROLE_NAVIGATION = {
    // Client Portal - Parent
    parent: [
        { label: "Dashboard", path: "/client/parent/dashboard" },
        { label: "Sessions", path: "/client/parent/sessions" },
        { label: "Progress", path: "/client/parent/progress" },
        { label: "Updates", path: "/client/parent/updates" },
    ],
    // Client Portal - Student
    student: [
        { label: "Dashboard", path: "/client/student/dashboard" },
        { label: "Growth", path: "/client/student/growth" },
        { label: "Academic Tracker", path: "/client/student/academic-tracker" },
        { label: "Assignments", path: "/client/student/assignments" },
        { label: "Updates", path: "/client/student/updates" },
    ],
    // Affiliate Portal - Affiliate
    affiliate: [
        { label: "Home", path: "/affiliate/affiliate/home" },
        { label: "Disc & Deli", path: "/affiliate/affiliate/discover-deliver" },
        { label: "Tracking", path: "/affiliate/affiliate/tracking" },
        { label: "Updates", path: "/affiliate/affiliate/updates" },
    ],
    // Affiliate Portal - Outreach Director
    od: [
        { label: "Dashboard", path: "/affiliate/od/dashboard" },
        { label: "Tracking", path: "/affiliate/od/encounters" },
        { label: "Crews", path: "/affiliate/od/crews" },
        { label: "Affiliates", path: "/affiliate/od/affiliates" },
        { label: "Updates", path: "/affiliate/od/updates" },
    ],
    // Operational Portal - Tutor
    tutor: [
        { label: "My Pod", path: "/operational/tutor/my-pod" },
        { label: "Growth", path: "/operational/tutor/growth" },
        { label: "Academic Tracker", path: "/operational/tutor/academic-tracker" },
        { label: "Sessions", path: "/operational/tutor/sessions" },
        { label: "Updates", path: "/operational/tutor/updates" },
    ],
    // Operational Portal - Territory Director
    td: [
        { label: "Dashboard", path: "/operational/td/dashboard" },
        { label: "My Pods", path: "/operational/td/my-pods" },
        { label: "Reports", path: "/operational/td/reports" },
        { label: "Updates", path: "/operational/td/updates" },
    ],
    // Executive Portal - COO
    coo: [
        { label: "Dashboard", path: "/executive/coo/dashboard" },
        { label: "Traffic", path: "/executive/coo/traffic" },
        { label: "Pods", path: "/executive/coo/pods" },
        { label: "Broadcast", path: "/executive/coo/broadcast" },
    ],
    // Executive Portal - HR
    hr: [
        { label: "Dashboard", path: "/executive/hr/dashboard" },
        { label: "Traffic", path: "/executive/hr/traffic" },
        { label: "Brain", path: "/executive/hr/brain" },
        { label: "Disputes", path: "/executive/hr/disputes" },
        { label: "Updates", path: "/executive/hr/updates" },
    ],
    // Executive Portal - CEO
    ceo: [{ label: "Dashboard", path: "/executive/ceo/dashboard" }],
};
// Public roles (can sign up without invitation)
export var PUBLIC_ROLES = ["parent", "tutor", "affiliate"];
// Roles that require invitation/admin assignment
export var ADMIN_ASSIGNED_ROLES = ["student", "td", "od", "coo", "hr", "ceo"];
/**
 * Get the portal for a given role
 */
export function getPortalForRole(role) {
    return ROLE_TO_PORTAL[role];
}
/**
 * Get all roles for a given portal
 */
export function getRolesForPortal(portal) {
    return PORTAL_CONFIG[portal].roles;
}
/**
 * Check if a role can access a portal
 */
export function canAccessPortal(role, portal) {
    return PORTAL_CONFIG[portal].roles.includes(role);
}
/**
 * Check if a portal is publicly accessible
 */
export function isPortalPublic(portal) {
    return PORTAL_CONFIG[portal].isPublic;
}
/**
 * Get the default dashboard route for a role
 */
export function getDefaultDashboardRoute(role) {
    if (!role) {
        console.warn("⚠️  No role provided to getDefaultDashboardRoute, defaulting to tutor");
        return "/operational/tutor/gateway";
    }
    // Role-specific routes
    var roleSpecificRoutes = {
        parent: "/client/parent/gateway", // Parents go to gateway first, not dashboard
        student: "/client/student/dashboard",
        affiliate: "/affiliate/gateway",
        od: "/affiliate/od/dashboard",
        tutor: "/operational/tutor/gateway", // Tutors go to gateway first
        td: "/operational/td/dashboard",
        coo: "/executive/coo/dashboard",
        hr: "/executive/hr/dashboard",
        ceo: "/executive/ceo/dashboard",
    };
    var route = roleSpecificRoutes[role];
    if (!route) {
        console.warn("⚠️  Unknown role:", role, "- defaulting to tutor");
        return "/operational/tutor/gateway";
    }
    return route;
}
/**
 * Get all navigation items for a role
 */
export function getNavigationForRole(role) {
    return ROLE_NAVIGATION[role];
}
