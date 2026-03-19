var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom"; // ✅ React Router hook
import { getDefaultDashboardRoute } from "@shared/portals";
import { API_URL } from "@/lib/config";
import { clearAllCache } from "@/lib/queryClient";
export function AuthForm(_a) {
    var _this = this;
    var mode = _a.mode, _b = _a.defaultRole, defaultRole = _b === void 0 ? "parent" : _b, _c = _a.affiliateCode, affiliateCode = _c === void 0 ? "" : _c;
    // Read all tracking parameters from URL (silent tracking)
    var urlParams = new URLSearchParams(window.location.search);
    var urlAffiliateCode = urlParams.get('affiliate') || '';
    var urlTrackingSource = urlParams.get('utm_source') || '';
    var urlTrackingCampaign = urlParams.get('utm_campaign') || '';
    var _d = useState(""), email = _d[0], setEmail = _d[1];
    var _e = useState(""), password = _e[0], setPassword = _e[1];
    var _f = useState(""), firstName = _f[0], setFirstName = _f[1];
    var _g = useState(""), lastName = _g[0], setLastName = _g[1];
    // Use URL param if available, otherwise use passed prop
    var _h = useState(affiliateCode || urlAffiliateCode), code = _h[0], setCode = _h[1];
    var role = useState(defaultRole)[0];
    var _j = useState(false), loading = _j[0], setLoading = _j[1];
    var toast = useToast().toast;
    var navigate = useNavigate(); // ✅ use React Router navigate
    var redirectByRole = function (role) {
        var dashboardRoute = getDefaultDashboardRoute(role);
        window.location.href = dashboardRoute;
    };
    // Google OAuth login handler
    var handleGoogleLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        var redirectUrl, error, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔵 Google OAuth button clicked");
                    console.log("  Role:", role);
                    console.log("  Mode:", mode);
                    console.log("  Default Role:", defaultRole);
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Store the intended role and mode in sessionStorage so callback knows what to do
                    sessionStorage.setItem('oauth_role', role);
                    sessionStorage.setItem('oauth_mode', mode);
                    if (code && defaultRole === 'parent') {
                        sessionStorage.setItem('oauth_affiliate_code', code);
                    }
                    if (urlTrackingSource) {
                        sessionStorage.setItem('oauth_tracking_source', urlTrackingSource);
                    }
                    if (urlTrackingCampaign) {
                        sessionStorage.setItem('oauth_tracking_campaign', urlTrackingCampaign);
                    }
                    console.log("  Stored in sessionStorage - role:", role, "mode:", mode);
                    redirectUrl = "".concat(window.location.origin, "/auth/callback");
                    console.log("  Redirect URL:", redirectUrl);
                    console.log("  Calling supabase.auth.signInWithOAuth...");
                    return [4 /*yield*/, supabase.auth.signInWithOAuth({
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
                        })];
                case 2:
                    error = (_a.sent()).error;
                    console.log("  OAuth response received, error:", error);
                    if (error) {
                        console.error("❌ Google OAuth error:", error);
                        toast({
                            title: "Google Login Error",
                            description: error.message,
                            variant: "destructive",
                        });
                        setLoading(false);
                    }
                    else {
                        console.log("✅ OAuth initiated successfully - should redirect to Google");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("❌ Exception in handleGoogleLogin:", err_1);
                    toast({
                        title: "Error",
                        description: err_1.message || "Failed to start Google login",
                        variant: "destructive",
                    });
                    setLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var redirectUrl, body, response, data, supabaseError, response, data, _a, loginData, supabaseError, user, err_2;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 12, 13, 14]);
                    // Clear any cached user data from previous sessions to prevent role mixing
                    clearAllCache();
                    if (!(mode === "signup")) return [3 /*break*/, 6];
                    // Call backend signup endpoint
                    console.log("🚀 SIGNUP STARTING");
                    console.log("  Email:", email);
                    console.log("  Role (state value):", role);
                    console.log("  Role type:", typeof role);
                    console.log("  Affiliate Code:", code);
                    body = {
                        email: email,
                        password: password,
                        role: role,
                        first_name: firstName,
                        last_name: lastName,
                        affiliate_code: code || null,
                        tracking_source: urlTrackingSource || 'organic',
                        tracking_campaign: urlTrackingCampaign || null,
                    };
                    console.log("📤 Sending signup body:", JSON.stringify(body, null, 2));
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/auth/signup"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(body),
                        })];
                case 2:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _d.sent();
                    if (!response.ok) {
                        throw new Error(data.message || "Signup failed");
                    }
                    console.log("✅ Signup response received");
                    console.log("  Response data:", data);
                    console.log("  User role from response:", (_c = (_b = data.user) === null || _b === void 0 ? void 0 : _b.user_metadata) === null || _c === void 0 ? void 0 : _c.role);
                    console.log("  Redirect URL:", data.redirectUrl);
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 4:
                    supabaseError = (_d.sent()).error;
                    if (supabaseError) {
                        console.warn("Supabase client signin after signup failed:", supabaseError.message);
                        // Don't fail - server session should still work
                    }
                    else {
                        console.log("✅ Supabase client session established");
                    }
                    redirectUrl = data.redirectUrl || getDefaultDashboardRoute(role);
                    toast({
                        title: "Welcome!",
                        description: "Your account has been created successfully. You may log in now.",
                    });
                    // Wait for session to fully propagate before redirecting
                    // Increased from 100ms to 500ms to ensure cookies are properly set
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 5:
                    // Wait for session to fully propagate before redirecting
                    // Increased from 100ms to 500ms to ensure cookies are properly set
                    _d.sent();
                    // Force page reload to ensure fresh session is loaded
                    // Do not auto-login after signup; require email verification
                    setLoading(false);
                    return [2 /*return*/];
                case 6:
                    if (!(mode === "login")) return [3 /*break*/, 10];
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/auth/signin"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ email: email, password: password, expectedRole: role }),
                        })];
                case 7:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 8:
                    data = _d.sent();
                    if (!response.ok) {
                        throw new Error(data.message || "Login failed");
                    }
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 9:
                    _a = _d.sent(), loginData = _a.data, supabaseError = _a.error;
                    if (supabaseError) {
                        console.warn("Supabase client signin failed:", supabaseError.message);
                        // Don't fail - server session should still work
                    }
                    else {
                        user = loginData === null || loginData === void 0 ? void 0 : loginData.user;
                        if (!(user === null || user === void 0 ? void 0 : user.email_confirmed_at) && !(user === null || user === void 0 ? void 0 : user.confirmed_at)) {
                            toast({
                                title: "Email not verified",
                                description: "Please verify your email before logging in.",
                                variant: "destructive",
                            });
                            setLoading(false);
                            return [2 /*return*/];
                        }
                        console.log("✅ Supabase client session established");
                    }
                    redirectUrl = data.redirectUrl || getDefaultDashboardRoute(role);
                    toast({
                        title: "Welcome back!",
                        description: "You have been logged in successfully.",
                    });
                    _d.label = 10;
                case 10: 
                // Wait for session to fully propagate before redirecting
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 11:
                    // Wait for session to fully propagate before redirecting
                    _d.sent();
                    // Ensure redirectUrl is defined before redirecting
                    if (!redirectUrl) {
                        console.error("❌ Redirect URL is undefined, role:", role);
                        throw new Error("Could not determine redirect location. Please contact support.");
                    }
                    window.location.href = redirectUrl;
                    return [3 /*break*/, 14];
                case 12:
                    err_2 = _d.sent();
                    toast({
                        title: "Error",
                        description: err_2.message || "Something went wrong",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 14];
                case 13:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="w-full max-w-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h3>
        <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
          {mode === "signup" ? "Enter your details to get started" : "Login to your dashboard"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (<>
            <div className="space-y-2">
              <Label htmlFor="firstName" style={{ color: "#1A1A1A" }}>First Name</Label>
              <Input id="firstName" type="text" placeholder="John" value={firstName} onChange={function (e) { return setFirstName(e.target.value); }} required className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" style={{ color: "#1A1A1A" }}>Last Name</Label>
              <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={function (e) { return setLastName(e.target.value); }} required className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#1A1A1A" }}>Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#1A1A1A" }}>Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={function (e) { return setPassword(e.target.value); }} required minLength={6} className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"/>
            </div>

          </>)}

        {mode === "login" && (<>
            <div className="space-y-2">
              <Label htmlFor="login-email" style={{ color: "#1A1A1A" }}>Email</Label>
              <Input id="login-email" type="email" placeholder="your@email.com" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" style={{ color: "#1A1A1A" }}>Password</Label>
              <Input id="login-password" type="password" placeholder="Enter your password" value={password} onChange={function (e) { return setPassword(e.target.value); }} required className="rounded-lg border-gray-200 focus:border-[#E63946] focus:ring-[#E63946]"/>
            </div>
          </>)}

        <Button type="submit" className="w-full rounded-full font-semibold py-6 mt-6 border-0 shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: "#E63946", color: "white" }} disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Login"}
        </Button>
      </form>
    </div>);
}
