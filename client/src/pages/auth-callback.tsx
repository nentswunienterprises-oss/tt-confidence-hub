import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getDefaultDashboardRoute } from "@shared/portals";
import type { Role } from "@shared/portals";

/**
 * OAuth Callback Handler
 * Handles the redirect from OAuth providers (Google, etc.)
 * Processes the session and redirects to the appropriate dashboard
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("OAuth callback error:", error);
          navigate("/auth?error=" + encodeURIComponent(error.message));
          return;
        }

        if (!session) {
          console.error("No session found after OAuth");
          navigate("/auth?error=no_session");
          return;
        }

        // Get user role from metadata
        const role = session.user.user_metadata?.role as Role | undefined;

        if (!role) {
          console.error("No role found in user metadata");
          navigate("/auth?error=no_role");
          return;
        }

        // Redirect to appropriate dashboard
        const dashboardRoute = getDefaultDashboardRoute(role);
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
