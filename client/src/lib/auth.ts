import { supabase } from "./supabaseClient";
import { apiRequest } from "./queryClient";

export async function logout() {
  try {
    // Call backend logout endpoint
    await apiRequest("POST", "/api/auth/logout");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Redirect to home
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
    // Force redirect even on error
    window.location.href = "/";
  }
}
