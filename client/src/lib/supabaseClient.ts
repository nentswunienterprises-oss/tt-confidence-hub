import { createClient } from "@supabase/supabase-js";

// In Vite, environment variables must start with VITE_ to be exposed to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase credentials missing in Vite env");
  throw new Error("Missing Supabase environment variables in Vite build");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    // Don't throw on invalid/expired tokens during initialization
    // This prevents the 400 error when refresh token is not found
  }
});

// Clear any invalid sessions on initialization
supabase.auth.getSession().catch(() => {
  // If getSession fails, clear any stored auth data to start fresh
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`sb-${supabaseUrl?.split('/').pop()}-auth-token`);
    } catch (e) {
      console.error("Error clearing auth token:", e);
    }
  }
});
