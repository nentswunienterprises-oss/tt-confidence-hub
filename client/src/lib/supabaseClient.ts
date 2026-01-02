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
    // Disable persisting sessions to localStorage to avoid cross-tab session mixing
    persistSession: false,
    detectSessionInUrl: true,
    storage: undefined,
    autoRefreshToken: false,
  }
});

// Clear any legacy Supabase auth token that may exist in localStorage (fixes cross-tab mixing on upgrade)
if (typeof window !== 'undefined') {
  try {
    const key = `sb-${supabaseUrl?.split('/').pop()}-auth-token`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Error clearing legacy auth token:", e);
  }
}
