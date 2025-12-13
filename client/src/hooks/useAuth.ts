import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/config";

export function useAuth() {
  const [, setLocation] = useLocation();
  
  // Fetch DB user data from backend - use returnNull for 401 so we don't throw errors on unauthorized
  const { data: user, isLoading: userLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 60 * 5, // Keep user data fresh for 5 minutes to avoid unnecessary refetches
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  console.log("🔐 useAuth state:", { 
    user: user?.name || null, 
    isLoading: userLoading, 
    isAuthenticated: !!user,
    error: error?.message 
  });

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Also sign out from Supabase client
      await supabase.auth.signOut();

      // Redirect to landing page
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user: user || undefined,
    isLoading: userLoading,
    isAuthenticated: !!user,
    logout,
  };
}
