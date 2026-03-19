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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, clearAllCache, setCurrentUserId, getCurrentUserId, setupMultiTabSync } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/config";
import { useState, useEffect, useRef } from "react";
export function useAuth() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState(false), supabaseReady = _b[0], setSupabaseReady = _b[1];
    var queryClient = useQueryClient();
    var previousUserIdRef = useRef(null);
    // Wait for Supabase to initialize and check for existing session
    useEffect(function () {
        supabase.auth.getSession().then(function () {
            setSupabaseReady(true);
        });
    }, []);
    // Setup multi-tab sync - clear cache and refetch when user changes in another tab
    useEffect(function () {
        var cleanup = setupMultiTabSync(function () {
            // Invalidate all queries to force refetch with new user
            queryClient.invalidateQueries();
            // Force page reload to ensure clean state
            window.location.reload();
        });
        return cleanup;
    }, [queryClient]);
    // Fetch DB user data from backend - use returnNull for 401 so we don't throw errors on unauthorized
    // Only enable query once Supabase is ready (session restored from localStorage)
    var _c = useQuery({
        queryKey: ["/api/auth/user"],
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
        staleTime: 1000 * 60 * 5, // Keep user data fresh for 5 minutes to avoid unnecessary refetches
        gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
        enabled: supabaseReady, // Only fetch once Supabase session is ready
    }), user = _c.data, userLoading = _c.isLoading, error = _c.error;
    // Track user ID changes and clear cache when user switches
    useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.id) {
            var storedUserId = getCurrentUserId();
            // If there's a different user stored, clear cache (user switched accounts)
            if (storedUserId && storedUserId !== user.id) {
                console.log('🔄 User switched from', storedUserId, 'to', user.id, '- clearing cache');
                clearAllCache();
                queryClient.invalidateQueries();
            }
            // Update stored user ID
            setCurrentUserId(user.id);
            previousUserIdRef.current = user.id;
        }
    }, [user === null || user === void 0 ? void 0 : user.id, queryClient]);
    console.log("🔐 useAuth state:", {
        user: (user === null || user === void 0 ? void 0 : user.name) || null,
        role: (user === null || user === void 0 ? void 0 : user.role) || null,
        isLoading: userLoading || !supabaseReady,
        isAuthenticated: !!user,
        supabaseReady: supabaseReady,
        error: error === null || error === void 0 ? void 0 : error.message
    });
    var logout = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Call backend logout endpoint
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/auth/logout"), {
                            method: "POST",
                            credentials: "include",
                        })];
                case 1:
                    // Call backend logout endpoint
                    _a.sent();
                    // Also sign out from Supabase client
                    return [4 /*yield*/, supabase.auth.signOut()];
                case 2:
                    // Also sign out from Supabase client
                    _a.sent();
                    // Clear stored user ID
                    setCurrentUserId(null);
                    // Clear ALL React Query cache (memory + localStorage) to prevent stale user data showing for next user
                    clearAllCache();
                    // Redirect to executive signup page
                    setLocation("/executive");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Logout error:", error_1);
                    // Clear cache even on error
                    setCurrentUserId(null);
                    clearAllCache();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return {
        user: user || undefined,
        isLoading: userLoading || !supabaseReady,
        isAuthenticated: !!user,
        logout: logout,
    };
}
