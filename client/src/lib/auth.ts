import { supabase } from "./supabaseClient";
import { apiRequest, clearAllCache } from "./queryClient";

function getLogoutRedirect(user) {
  const pathname = window.location.pathname || "";

  if (user?.role === "tutor") {
    return "/operational/signup?role=tutor";
  }

  if (user?.role === "td") {
    return "/operational/signup?role=tutor";
  }

  if (user?.role === "coo" || user?.role === "hr" || user?.role === "ceo" || user?.role === "executive") {
    return "/executive";
  }

  // If role is missing/stale, infer the portal from the current route.
  if (pathname.startsWith("/executive")) {
    return "/executive";
  }

  if (pathname.startsWith("/operational")) {
    return "/operational/signup?role=tutor";
  }

  return "/portal-landing";
}

export async function logout(user) {
  const redirectPath = getLogoutRedirect(user);

  try {
    // Call backend logout endpoint
    await apiRequest("POST", "/api/auth/logout");
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Clear ALL React Query cache (memory + localStorage) to prevent stale user data
    clearAllCache();

    window.location.href = redirectPath;
  } catch (error) {
    console.error("Logout error:", error);
    clearAllCache();
    window.location.href = redirectPath;
  }
}
