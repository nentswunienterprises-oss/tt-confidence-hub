import { supabase } from "./supabaseClient";
import { apiRequest, clearAllCache } from "./queryClient";

export async function logout() {
  try {
    // Call backend logout endpoint
    await apiRequest("POST", "/api/auth/logout");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear ALL React Query cache (memory + localStorage) to prevent stale user data
    clearAllCache();
    
    // Redirect to executive signup page
    window.location.href = "/executive";
  } catch (error) {
    console.error("Logout error:", error);
    // Clear cache even on error
    clearAllCache();
    // Force redirect even on error
    window.location.href = "/executive";
  }
}
