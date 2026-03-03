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
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { supabase } from "./supabaseClient";
import { API_URL } from "./config";
// Check if we're online
var isOnline = function () { return typeof navigator !== 'undefined' ? navigator.onLine : true; };
// Key used by the persister in localStorage
var PERSISTER_KEY = 'REACT_QUERY_OFFLINE_CACHE';
// Key used to track current user - use sessionStorage (tab-specific) to avoid cross-tab issues
var SESSION_USER_KEY = 'SESSION_USER_ID';
// Create a custom storage adapter that uses sessionStorage (tab-specific, not shared)
// This prevents cache mixing when logging in as different users in different tabs
var sessionStorageAdapter = typeof window !== 'undefined' ? {
    getItem: function (key) { return window.sessionStorage.getItem(key); },
    setItem: function (key, value) { return window.sessionStorage.setItem(key, value); },
    removeItem: function (key) { return window.sessionStorage.removeItem(key); },
} : undefined;
// Create a persister using sessionStorage (tab-specific) instead of localStorage (shared)
export var persister = createSyncStoragePersister({
    storage: sessionStorageAdapter,
    key: PERSISTER_KEY,
});
// Function to clear both in-memory and persisted cache
export function clearAllCache() {
    // Clear in-memory cache
    queryClient.clear();
    // Clear sessionStorage persisted cache
    if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(PERSISTER_KEY);
    }
    console.log('🗑️ All query cache cleared (memory + sessionStorage)');
}
// Track current user to detect user switching within the same tab
export function setCurrentUserId(userId) {
    if (typeof window !== 'undefined') {
        if (userId) {
            window.sessionStorage.setItem(SESSION_USER_KEY, userId);
        }
        else {
            window.sessionStorage.removeItem(SESSION_USER_KEY);
        }
    }
}
export function getCurrentUserId() {
    if (typeof window !== 'undefined') {
        return window.sessionStorage.getItem(SESSION_USER_KEY);
    }
    return null;
}
// No longer needed - sessionStorage is tab-specific so no cross-tab sync required
export function setupMultiTabSync(onUserChange) {
    // Return no-op cleanup function
    return function () { };
}
function throwIfResNotOk(res) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!res.ok) return [3 /*break*/, 2];
                    return [4 /*yield*/, res.text()];
                case 1:
                    text = (_a.sent()) || res.statusText;
                    throw new Error("".concat(res.status, ": ").concat(text));
                case 2: return [2 /*return*/];
            }
        });
    });
}
export function apiRequest(method, url, data) {
    return __awaiter(this, void 0, void 0, function () {
        var fullUrl, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fullUrl = API_URL + url;
                    return [4 /*yield*/, fetch(fullUrl, {
                            method: method,
                            headers: data ? { "Content-Type": "application/json" } : {},
                            body: data ? JSON.stringify(data) : undefined,
                            credentials: "include",
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, throwIfResNotOk(res)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
export var getQueryFn = function (_a) {
    var unauthorizedBehavior = _a.on401;
    return function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var session, headers, fetchOptions, url, fullUrl, res;
        var queryKey = _b.queryKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    session = (_c.sent()).data.session;
                    headers = {};
                    // If there's a Supabase session, add the auth token
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers.Authorization = "Bearer ".concat(session.access_token);
                        console.log("📤 Sending request with Supabase auth token");
                    }
                    else {
                        console.log("⚠️  No Supabase session found, request will rely on server session cookies");
                    }
                    fetchOptions = {
                        headers: headers,
                        credentials: "include", // Always include credentials for cookies
                    };
                    url = queryKey.join("/");
                    fullUrl = API_URL + url;
                    console.log("🔗 Fetching:", fullUrl, "with headers:", Object.keys(headers));
                    return [4 /*yield*/, fetch(fullUrl, fetchOptions)];
                case 2:
                    res = _c.sent();
                    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, throwIfResNotOk(res)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _c.sent()];
            }
        });
    }); };
};
export var queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({ on401: "throw" }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: function (failureCount, error) {
                // Don't retry if offline
                if (!isOnline())
                    return false;
                // Don't retry on 401, 403, 404
                if (error instanceof Error && /^(401|403|404):/.test(error.message)) {
                    return false;
                }
                // Retry up to 2 times for other errors
                return failureCount < 2;
            },
            // Keep showing cached data even if query fails
            networkMode: 'offlineFirst',
        },
        mutations: {
            retry: false,
            // Allow mutations to queue when offline
            networkMode: 'offlineFirst',
        },
    },
});
