import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";

export function useAuth() {
  const [, setLocation] = useLocation();
  const [supabaseReady, setSupabaseReady] = useState(false);
  
  // Wait for Supabase to initialize and check for existing session
  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setSupabaseReady(true);
    });
  }, []);
  
  // Fetch DB user data from backend - use returnNull for 401 so we don't throw errors on unauthorized
  // Only enable query once Supabase is ready (session restored from localStorage)
  const { data: user, isLoading: userLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 60 * 5, // Keep user data fresh for 5 minutes to avoid unnecessary refetches
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    enabled: supabaseReady, // Only fetch once Supabase session is ready
  });

  console.log("🔐 useAuth state:", { 
    user: user?.name || null, 
    isLoading: userLoading || !supabaseReady, 
    isAuthenticated: !!user,
    supabaseReady,
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

      // Clear ALL React Query cache to prevent stale user data showing for next user
      queryClient.clear();

      // Redirect to landing page
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear cache even on error
      queryClient.clear();
    }
  };

  return {
    user: user || undefined,
    isLoading: userLoading || !supabaseReady,
    isAuthenticated: !!user,
    logout,
  };
}
