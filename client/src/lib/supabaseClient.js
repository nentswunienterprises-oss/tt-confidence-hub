import { createClient } from "@supabase/supabase-js";
// In Vite, environment variables must start with VITE_ to be exposed to the browser
var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
var supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase credentials missing in Vite env");
    throw new Error("Missing Supabase environment variables in Vite build");
}
export var supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Enable persisting sessions to localStorage for persistent login
        persistSession: true,
        detectSessionInUrl: true,
        storage: undefined,
        autoRefreshToken: false,
        // OAuth flow configuration
        flowType: 'pkce',
    }
});
// Clear any legacy Supabase auth token that may exist in localStorage (fixes cross-tab mixing on upgrade)
if (typeof window !== 'undefined') {
    try {
        var key = "sb-".concat(supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.split('/').pop(), "-auth-token");
        localStorage.removeItem(key);
    }
    catch (e) {
        console.error("Error clearing legacy auth token:", e);
    }
}
