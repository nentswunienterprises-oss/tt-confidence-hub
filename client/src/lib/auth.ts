import { supabase } from "./supabaseClient";
import { apiRequest, queryClient } from "./queryClient";

export async function logout() {
  try {
    // Call backend logout endpoint
    await apiRequest("POST", "/api/auth/logout");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear ALL React Query cache to prevent stale user data
    queryClient.clear();
    
    // Redirect to home
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
    // Clear cache even on error
    queryClient.clear();
    // Force redirect even on error
    window.location.href = "/";
  }
}
