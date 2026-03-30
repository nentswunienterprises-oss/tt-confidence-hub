import { supabase } from "./supabaseClient";
import { apiRequest, clearAllCache } from "./queryClient";

export async function logout(user) {
  try {
    // Call backend logout endpoint
    await apiRequest("POST", "/api/auth/logout");
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Clear ALL React Query cache (memory + localStorage) to prevent stale user data
    clearAllCache();

    // Determine redirect based on role
    if (user?.role === "tutor") {
      window.location.href = "/operational/signup?role=tutor";
    } else if (user?.role === "coo" || user?.role === "hr") {
      window.location.href = "/executive/signup";
    } else if (user?.role === "ceo") {
      window.location.href = "/executive";
    } else {
      window.location.href = "/portal-landing";
    }
  } catch (error) {
    console.error("Logout error:", error);
    clearAllCache();
    // Fallback: send to portal-landing
    window.location.href = "/portal-landing";
  }
}
