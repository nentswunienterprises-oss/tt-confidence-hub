import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom"; // ✅ React Router hook
import { getDefaultDashboardRoute } from "@shared/portals";
import type { Role } from "@shared/portals";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        
        const response = await fetch("/api/auth/signup", {
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
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        
        // Wait for session to fully propagate before redirecting
        // Increased from 100ms to 500ms to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force page reload to ensure fresh session is loaded
        window.location.href = redirectUrl;
        return; // Exit early since we're reloading
      }

      if (mode === "login") {
        // Call backend signin endpoint with role validation
        const response = await fetch("/api/auth/signin", {
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
        const { error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (supabaseError) {
          console.warn("Supabase client signin failed:", supabaseError.message);
          // Don't fail - server session should still work
        } else {
          console.log("✅ Supabase client session established");
        }

        redirectUrl = data.redirectUrl || getDefaultDashboardRoute(role);

        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      }

      // Wait for session to fully propagate before redirecting
      // Increased from 100ms to 500ms to ensure cookies are properly set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force page reload to ensure fresh session is loaded
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "signup" ? "Create Account" : "Welcome Back"}</CardTitle>
        <CardDescription>
          {mode === "signup" ? "Enter your details to get started" : "Login to your dashboard"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>

              {defaultRole === "parent" && (
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Affiliate Code
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="e.g., AFIX123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

