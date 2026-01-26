import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * OAuth Callback Handler
 * DISABLED - Google OAuth removed for affiliates
 * Redirects users back to auth page
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("⚠️  OAuth callback disabled - redirecting to auth");
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing...</h1>
        <p className="text-gray-600">Redirecting to authentication...</p>
      </div>
    </div>
  );
}
