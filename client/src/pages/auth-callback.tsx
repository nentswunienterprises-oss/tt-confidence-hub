import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getDefaultDashboardRoute } from "@shared/portals";
import type { Role } from "@shared/portals";
import { API_URL } from "@/lib/config";

/**
 * OAuth Callback Handler
 * Handles the redirect from OAuth providers (Google, etc.)
 * Processes the session and redirects to the appropriate dashboard
 * Handles both new signups and existing user logins
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("🔵 Auth callback started");
        
        // First, check if there's a hash in the URL (OAuth response)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        console.log("  Hash params access_token:", accessToken ? "Present" : "Not found");
        
        // Wait for Supabase to process the OAuth callback
        // The session might not be immediately available
        let session = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!session && attempts < maxAttempts) {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("OAuth callback error:", error);
            navigate("/auth?error=" + encodeURIComponent(error.message));
            return;
          }
          
          if (currentSession) {
            session = currentSession;
            break;
          }
          
          console.log(`  Attempt ${attempts + 1}/${maxAttempts} - waiting for session...`);
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
        }

        console.log("  Session:", session ? "Found" : "Not found");

        if (!session) {
          console.error("No session found after OAuth - max attempts reached");
          navigate("/auth?error=no_session");
          return;
        }

        const user = session.user;
        console.log("✅ OAuth session established:", user.email);
        console.log("  User metadata:", user.user_metadata);
        
        // Get stored OAuth context (role, mode, affiliate_code)
        const intendedRole = sessionStorage.getItem('oauth_role') as Role | null;
        const mode = sessionStorage.getItem('oauth_mode'); // 'signup' or 'login'
        const affiliateCode = sessionStorage.getItem('oauth_affiliate_code');
        
        console.log("  SessionStorage - intendedRole:", intendedRole, "mode:", mode, "affiliateCode:", affiliateCode);
        
        // Clear session storage
        sessionStorage.removeItem('oauth_role');
        sessionStorage.removeItem('oauth_mode');
        sessionStorage.removeItem('oauth_affiliate_code');

        // Check if user already exists in our database
        let role = user.user_metadata?.role as Role | undefined;
        
        console.log("  User metadata role:", role);
        
        if (!role && intendedRole) {
          // New user signing up via OAuth - need to create profile
          console.log("🆕 New OAuth user, creating profile with role:", intendedRole);
          
          try {
            // Call backend to create user profile with role
            const response = await fetch(`${API_URL}/api/auth/oauth-profile`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                user_id: user.id,
                email: user.email,
                role: intendedRole,
                first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                affiliate_code: affiliateCode || null,
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.message || "Failed to create user profile");
            }
            
            const data = await response.json();
            role = data.role || intendedRole;
            console.log("✅ User profile created with role:", role);
          } catch (err: any) {
            console.error("Failed to create OAuth user profile:", err);
            navigate(`/auth?error=${encodeURIComponent(err.message)}`);
            return;
          }
        } else if (role) {
          // Existing user logging in
          console.log("👤 Existing user logging in with role:", role);
        } else {
          // No role and no intended role - shouldn't happen
          console.error("No role found in user metadata and no intended role");
          navigate("/auth?error=no_role");
          return;
        }

        // Redirect to appropriate dashboard
        const dashboardRoute = getDefaultDashboardRoute(role);
        console.log("🎯 Redirecting to:", dashboardRoute, "for role:", role);
        window.location.href = dashboardRoute;
      } catch (err) {
        console.error("Unexpected error in OAuth callback:", err);
        navigate("/auth?error=unexpected_error");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4"></div>
        <p className="text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
