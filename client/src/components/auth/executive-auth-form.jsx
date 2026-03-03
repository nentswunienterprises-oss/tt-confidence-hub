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
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { clearAllCache } from "@/lib/queryClient";
export function ExecutiveAuthForm(_a) {
    var _this = this;
    var role = _a.role, mode = _a.mode, setMode = _a.setMode;
    var _b = useState(""), email = _b[0], setEmail = _b[1];
    var _c = useState(""), password = _c[0], setPassword = _c[1];
    var _d = useState(""), firstName = _d[0], setFirstName = _d[1];
    var _e = useState(""), lastName = _e[0], setLastName = _e[1];
    var _f = useState(false), loading = _f[0], setLoading = _f[1];
    var toast = useToast().toast;
    var navigate = useNavigate();
    var roleNames = {
        coo: "Chief Operating Officer",
        hr: "Human Resources",
        ceo: "Chief Executive Officer",
    };
    var dashboardRoutes = {
        coo: "/executive/coo/dashboard",
        hr: "/executive/hr/dashboard",
        ceo: "/executive/ceo/dashboard",
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var redirectUrl, response, data, _a, supabaseError, authData, _b, supabaseError, supabaseData, response, data, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 11, 12, 13]);
                    // Clear any cached user data from previous sessions to prevent role mixing
                    clearAllCache();
                    if (!(mode === "signup")) return [3 /*break*/, 5];
                    // Call backend signup endpoint with executive role
                    console.log("📝 Creating account with role:", role);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/auth/signup"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                email: email,
                                password: password,
                                role: role,
                                first_name: firstName,
                                last_name: lastName,
                            }),
                        })];
                case 2:
                    response = _c.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _c.sent();
                    if (!response.ok) {
                        throw new Error(data.message || "Signup failed");
                    }
                    console.log("✅ Backend signup successful, user created with role:", role);
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 4:
                    _a = _c.sent(), supabaseError = _a.error, authData = _a.data;
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
                    if (!redirectUrl) {
                        console.error("🚨 Signup: redirectUrl is undefined, role:", role, "response:", data);
                        throw new Error("Could not determine redirect location");
                    }
                    navigate(redirectUrl);
                    return [2 /*return*/];
                case 5:
                    if (!(mode === "login")) return [3 /*break*/, 9];
                    // First sign in to Supabase on the client side to establish session
                    console.log("📤 Signing into Supabase first...");
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 6:
                    _b = _c.sent(), supabaseError = _b.error, supabaseData = _b.data;
                    if (supabaseError) {
                        throw new Error(supabaseError.message || "Login failed");
                    }
                    console.log("✅ Supabase client signin successful");
                    // Then call backend signin endpoint with role validation
                    console.log("📤 Sending signin request with role:", role);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/auth/signin"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ email: email, password: password, expectedRole: role }),
                        })];
                case 7:
                    response = _c.sent();
                    return [4 /*yield*/, response.json()];
                case 8:
                    data = _c.sent();
                    if (!response.ok) {
                        throw new Error(data.message || "Login failed");
                    }
                    redirectUrl = data.redirectUrl || dashboardRoutes[role];
                    toast({
                        title: "Welcome back!",
                        description: "You have been logged in successfully.",
                    });
                    _c.label = 9;
                case 9: 
                // Wait for session to be fully established
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 300); })];
                case 10:
                    // Wait for session to be fully established
                    _c.sent();
                    // Ensure redirectUrl is defined before redirecting
                    if (!redirectUrl) {
                        console.error("🚨 Login: redirectUrl is undefined, role:", role);
                        throw new Error("Could not determine redirect location");
                    }
                    // Force page reload to ensure fresh session
                    window.location.href = redirectUrl;
                    return [3 /*break*/, 13];
                case 11:
                    err_1 = _c.sent();
                    toast({
                        title: "Error",
                        description: err_1.message || "Something went wrong",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 13];
                case 12:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "signup" && (<>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                First Name
              </Label>
              <Input id="firstName" type="text" placeholder="John" value={firstName} onChange={function (e) { return setFirstName(e.target.value); }} required autoComplete="given-name" className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0" style={{
                borderColor: "#E5E5E5",
                backgroundColor: "#FAFAFA"
            }}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                Last Name
              </Label>
              <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={function (e) { return setLastName(e.target.value); }} required autoComplete="family-name" className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0" style={{
                borderColor: "#E5E5E5",
                backgroundColor: "#FAFAFA"
            }}/>
            </div>
          </>)}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
            Email
          </Label>
          <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={function (e) { return setEmail(e.target.value); }} required autoComplete="email" className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0" style={{
            borderColor: "#E5E5E5",
            backgroundColor: "#FAFAFA"
        }}/>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
            Password
          </Label>
          <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={function (e) { return setPassword(e.target.value); }} required autoComplete="current-password" minLength={6} className="h-12 rounded-xl border-2 focus:ring-2 focus:ring-offset-0" style={{
            borderColor: "#E5E5E5",
            backgroundColor: "#FAFAFA"
        }}/>
        </div>

        <Button type="submit" className="w-full h-12 rounded-full font-semibold text-base" disabled={loading} style={{ backgroundColor: "#E63946", color: "white" }}>
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Toggle Mode - Hidden since parent handles toggle */}
      <div className="text-center">
        <p className="text-sm" style={{ color: "#5A5A5A" }}>
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <button type="button" onClick={function () { return setMode(mode === "signup" ? "login" : "signup"); }} className="font-semibold hover:opacity-80" style={{ color: "#E63946" }}>
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>);
}
