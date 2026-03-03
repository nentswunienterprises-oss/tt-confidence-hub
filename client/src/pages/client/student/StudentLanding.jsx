var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { clearAllCache } from "@/lib/queryClient";
export default function StudentLanding() {
    var _this = this;
    var _a = useState("signup"), mode = _a[0], setMode = _a[1];
    var _b = useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var toast = useToast().toast;
    var navigate = useNavigate();
    // Sign Up State
    var _c = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        parentCode: "",
    }), signupData = _c[0], setSignupData = _c[1];
    // Sign In State
    var _d = useState({
        email: "",
        password: "",
    }), signinData = _d[0], setSigninData = _d[1];
    var handleSignup = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (signupData.password !== signupData.confirmPassword) {
                        toast({
                            title: "Password Mismatch",
                            description: "Passwords do not match. Please try again.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    if (signupData.password.length < 8) {
                        toast({
                            title: "Weak Password",
                            description: "Password must be at least 8 characters long.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/student/signup"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: signupData.email,
                                password: signupData.password,
                                firstName: signupData.firstName,
                                lastName: signupData.lastName,
                                parentCode: signupData.parentCode,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.message || "Failed to create account");
                    }
                    toast({
                        title: "Account Created!",
                        description: "Welcome to TT Student Portal. Redirecting...",
                    });
                    // Clear any cached data from previous user before navigating
                    clearAllCache();
                    // Redirect to student dashboard
                    setTimeout(function () {
                        navigate("/client/student/dashboard");
                    }, 1000);
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error("Signup error:", error_1);
                    toast({
                        title: "Signup Failed",
                        description: error_1.message || "Failed to create account. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSignin = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/student/signin"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                email: signinData.email,
                                password: signinData.password,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.message || "Failed to sign in");
                    }
                    toast({
                        title: "Welcome Back!",
                        description: "Signing you in...",
                    });
                    // Clear any cached data from previous user before navigating
                    clearAllCache();
                    // Redirect to student dashboard
                    setTimeout(function () {
                        navigate("/client/student/dashboard");
                    }, 500);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error("Signin error:", error_2);
                    toast({
                        title: "Sign In Failed",
                        description: error_2.message || "Invalid credentials. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Response Hub
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your training starts here
          </p>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{mode === "signup" ? "Create Your Account" : "Welcome Back"}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {mode === "signup"
            ? "Enter the code your parent gave you to get started"
            : "Sign in to access your learning dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {mode === "signup" ? (<form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                    <Input id="firstName" type="text" className="text-sm" value={signupData.firstName} onChange={function (e) { return setSignupData(__assign(__assign({}, signupData), { firstName: e.target.value })); }} required/>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                    <Input id="lastName" type="text" className="text-sm" value={signupData.lastName} onChange={function (e) { return setSignupData(__assign(__assign({}, signupData), { lastName: e.target.value })); }} required/>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                  <Input id="email" type="email" className="text-sm" placeholder="your.email@example.com" value={signupData.email} onChange={function (e) { return setSignupData(__assign(__assign({}, signupData), { email: e.target.value })); }} required/>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                  <Input id="password" type="password" className="text-sm" placeholder="At least 8 characters" value={signupData.password} onChange={function (e) { return setSignupData(__assign(__assign({}, signupData), { password: e.target.value })); }} required/>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" className="text-sm" placeholder="Re-enter your password" value={signupData.confirmPassword} onChange={function (e) { return setSignupData(__assign(__assign({}, signupData), { confirmPassword: e.target.value })); }} required/>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="parentCode" className="text-xs sm:text-sm">Parent Code</Label>
                  <Input id="parentCode" type="text" placeholder="Enter the 8-character code" value={signupData.parentCode} onChange={function (e) { return setSignupData(__assign(__assign({}, signupData), { parentCode: e.target.value.toUpperCase() })); }} maxLength={8} className="font-mono text-base sm:text-lg tracking-wider" required/>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Ask your parent for this code
                  </p>
                </div>

                <Button type="submit" className="w-full text-sm sm:text-base" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <button type="button" onClick={function () { return setMode("signin"); }} className="text-primary hover:underline font-medium">
                    Sign In
                  </button>
                </div>
              </form>) : (<form onSubmit={handleSignin} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="signin-email" className="text-xs sm:text-sm">Email</Label>
                  <Input id="signin-email" type="email" className="text-sm" placeholder="your.email@example.com" value={signinData.email} onChange={function (e) { return setSigninData(__assign(__assign({}, signinData), { email: e.target.value })); }} required/>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="signin-password" className="text-xs sm:text-sm">Password</Label>
                  <Input id="signin-password" type="password" className="text-sm" placeholder="Enter your password" value={signinData.password} onChange={function (e) { return setSigninData(__assign(__assign({}, signinData), { password: e.target.value })); }} required/>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <button type="button" onClick={function () { return setMode("signup"); }} className="text-primary hover:underline font-medium">
                    Create Account
                  </button>
                </div>
              </form>)}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by Territorial Tutoring SA (Pty) Ltd.
        </p>
      </div>
    </div>);
}
