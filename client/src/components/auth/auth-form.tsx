import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom"; // ✅ React Router hook
import { getDefaultDashboardRoute } from "@shared/portals";
import type { Role } from "@shared/portals";
import { API_URL } from "@/lib/config";
import { clearAllCache } from "@/lib/queryClient";

interface AuthFormProps {
  mode: "signup" | "login";
  defaultRole?: Role;
  affiliateCode?: string;
}

export function AuthForm({ mode, defaultRole = "parent", affiliateCode = "" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState(affiliateCode);
  const [role] = useState<Role>(defaultRole);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate(); // ✅ use React Router navigate

  const redirectByRole = (role: Role) => {
    const dashboardRoute = getDefaultDashboardRoute(role);
    window.location.href = dashboardRoute;
  };

  // Google OAuth login handler
  const handleGoogleLogin = async () => {
    console.log("🔵 Google OAuth button clicked");
    console.log("  Role:", role);
    console.log("  Mode:", mode);
    console.log("  Default Role:", defaultRole);
    
    setLoading(true);
    try {
      // Store the intended role and mode in sessionStorage so callback knows what to do
      sessionStorage.setItem('oauth_role', role);
      sessionStorage.setItem('oauth_mode', mode);
      if (code && defaultRole === 'parent') {
        sessionStorage.setItem('oauth_affiliate_code', code);
      }
      
      console.log("  Stored in sessionStorage - role:", role, "mode:", mode);
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("  Redirect URL:", redirectUrl);
      console.log("  Calling supabase.auth.signInWithOAuth...");
      
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Pass role in OAuth metadata for new signups
          scopes: 'email profile'
        }
      });
      
      console.log("  OAuth response received, error:", error);
      
      if (error) {
        console.error("❌ Google OAuth error:", error);
        toast({
          title: "Google Login Error",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      } else {
        console.log("✅ OAuth initiated successfully - should redirect to Google");
      }
      // Don't set loading to false here - user is being redirected
    } catch (err: any) {
      console.error("❌ Exception in handleGoogleLogin:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to start Google login",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear any cached user data from previous sessions to prevent role mixing
      clearAllCache();
      
      // Validate affiliate code for parents - required to track which affiliate recruited them
      // DEVELOPMENT: Allow "TEST" as bypass for testing
      if (mode === "signup" && role === "parent" && !code.trim() && code !== "TEST") {
        toast({
          title: "Error",
          description: "Affiliate code is required to complete your signup",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let redirectUrl = "/";

      if (mode === "signup") {
        // Call backend signup endpoint
        console.log("🚀 SIGNUP STARTING");
        console.log("  Email:", email);
        console.log("  Role (state value):", role);
        console.log("  Role type:", typeof role);
        console.log("  Affiliate Code:", code);
        
        const body = {
          email,
          password,
          role,
          first_name: firstName,
          last_name: lastName,
          affiliate_code: code || null,
        };
        console.log("📤 Sending signup body:", JSON.stringify(body, null, 2));
        
        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Signup failed");
        }
        
        console.log("✅ Signup response received");
        console.log("  Response data:", data);
        console.log("  User role from response:", data.user?.user_metadata?.role);
        console.log("  Redirect URL:", data.redirectUrl);

        // Sign in to Supabase on the client side to establish client session
        // IMPORTANT: Wait for this to complete before redirecting
        const { error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (supabaseError) {
          console.warn("Supabase client signin after signup failed:", supabaseError.message);
          // Don't fail - server session should still work
        } else {
          console.log("✅ Supabase client session established");
        }

        redirectUrl = data.redirectUrl || getDefaultDashboardRoute(role);

        toast({
          title: "Verify your email",
          description: "Check your email and click the verification link before logging in.",
        });
        
        // Wait for session to fully propagate before redirecting
        // Increased from 100ms to 500ms to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force page reload to ensure fresh session is loaded
        // Do not auto-login after signup; require email verification
        setLoading(false);
        return;
      }

      if (mode === "login") {
        // Call backend signin endpoint with role validation
        const response = await fetch(`${API_URL}/api/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, expectedRole: role }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Also sign in to Supabase on the client side
        // IMPORTANT: Wait for this to complete before redirecting
        const { data: loginData, error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (supabaseError) {
          console.warn("Supabase client signin failed:", supabaseError.message);
          // Don't fail - server session should still work
        } else {
          // Check if email is confirmed
          const user = loginData?.user;
          if (!user?.email_confirmed_at && !user?.confirmed_at) {
            toast({
              title: "Email not verified",
              description: "Please verify your email before logging in.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          console.log("✅ Supabase client session established");
        }
        redirectUrl = data.redirectUrl || getDefaultDashboardRoute(role);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      }

      // Wait for session to fully propagate before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h3>
        <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
          {mode === "signup" ? "Enter your details to get started" : "Login to your dashboard"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
                {/* ...existing code... */}
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="firstName" style={{ color: "#1A1A1A" }}>First Name</Label>
              <Input 
                id="firstName" 
                type="text" 
                placeholder="John" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
                className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" style={{ color: "#1A1A1A" }}>Last Name</Label>
              <Input 
                id="lastName" 
                type="text" 
                placeholder="Doe" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
                className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"
              />
            </div>

            {defaultRole === "parent" && (
              <div className="space-y-2">
                <Label htmlFor="code" style={{ color: "#1A1A1A" }}>
                  Affiliate Code
                  <span className="ml-1" style={{ color: "#E63946" }}>*</span>
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="e.g., AFIX123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" style={{ color: "#1A1A1A" }}>Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" style={{ color: "#1A1A1A" }}>Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength={6} 
            className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full rounded-full font-semibold py-6 mt-6 border-0 shadow-lg hover:shadow-xl transition-all" 
          style={{ backgroundColor: "#E63946", color: "white" }}
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Login"}
        </Button>
      </form>
    </div>
  );
}

