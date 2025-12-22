import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";

type Role = "coo" | "hr" | "ceo";

interface ExecutiveAuthFormProps {
  role: Role;
  mode: "signup" | "login";
  setMode: (mode: "signup" | "login") => void;
}

export function ExecutiveAuthForm({ role, mode, setMode }: ExecutiveAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const roleNames: Record<Role, string> = {
    coo: "Chief Operating Officer",
    hr: "Human Resources",
    ceo: "Chief Executive Officer",
  };

  const dashboardRoutes: Record<Role, string> = {
    coo: "/executive/coo/dashboard",
    hr: "/executive/hr/dashboard",
    ceo: "/executive/ceo/dashboard",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let redirectUrl = "/";

      if (mode === "signup") {
        // Call backend signup endpoint with executive role
        console.log("📝 Creating account with role:", role);
        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
            role,
            first_name: firstName,
            last_name: lastName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Signup failed");
        }

        console.log("✅ Backend signup successful, user created with role:", role);
        
        // Sign in to Supabase on the client side to establish client-side session
        const { error: supabaseError, data: authData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (supabaseError) {
          console.error("❌ Supabase client signin after signup failed:", supabaseError.message);
          throw new Error("Failed to establish session: " + supabaseError.message);
        }

        console.log("✅ Supabase client session established");
        redirectUrl = data.redirectUrl || dashboardRoutes[role];

        toast({
          title: "Welcome!",
          description: "Your executive account has been created successfully.",
        });

        // Navigate using React Router instead of full page reload
        navigate(redirectUrl);
        return;
        return;
      }

      if (mode === "login") {
        // Call backend signin endpoint with role validation
        console.log("📤 Sending signin request with role:", role);
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
        const { error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (supabaseError) {
          console.warn("Supabase client signin failed:", supabaseError.message);
        }

        redirectUrl = data.redirectUrl || dashboardRoutes[role];

        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      }

      // Wait a moment for session cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force page reload to ensure fresh session
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label 
                htmlFor="firstName" 
                className="text-sm font-semibold"
                style={{ color: "#1A1A1A" }}
              >
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0"
                style={{ 
                  borderColor: "#E5E5E5",
                  backgroundColor: "#FAFAFA"
                }}
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="lastName"
                className="text-sm font-semibold"
                style={{ color: "#1A1A1A" }}
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0"
                style={{ 
                  borderColor: "#E5E5E5",
                  backgroundColor: "#FAFAFA"
                }}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label 
            htmlFor="email"
            className="text-sm font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0"
            style={{ 
              borderColor: "#E5E5E5",
              backgroundColor: "#FAFAFA"
            }}
          />
        </div>

        <div className="space-y-2">
          <Label 
            htmlFor="password"
            className="text-sm font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            minLength={6}
            className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0"
            style={{ 
              borderColor: "#E5E5E5",
              backgroundColor: "#FAFAFA"
            }}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-full font-semibold text-base"
          disabled={loading}
          style={{ backgroundColor: "#E85A2C", color: "white" }}
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Toggle Mode - Hidden since parent handles toggle */}
      <div className="text-center">
        <p className="text-sm" style={{ color: "#5A5A5A" }}>
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="font-semibold hover:opacity-80"
            style={{ color: "#E85A2C" }}
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
