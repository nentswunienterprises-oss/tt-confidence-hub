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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, MessageSquare, Check } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
export default function TutorUpdates() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(new Map()), markingIds = _b[0], setMarkingIds = _b[1];
    var _c = useQuery({
        queryKey: ["/api/broadcasts"],
        enabled: isAuthenticated && !authLoading,
    }), broadcasts = _c.data, isLoading = _c.isLoading, error = _c.error;
    var readData = useQuery({
        queryKey: ["/api/broadcasts/read-list"],
        enabled: isAuthenticated && !authLoading,
    }).data;
    var handleMarkAsRead = function (broadcastId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setMarkingIds(function (prev) { return new Map(prev).set(broadcastId, true); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, apiRequest("POST", "/api/broadcasts/".concat(broadcastId, "/read"), {})];
                case 2:
                    _a.sent();
                    // Optimistically update the read list
                    queryClient.setQueryData(["/api/broadcasts/read-list"], function (old) { return ({
                        readBroadcasts: __spreadArray(__spreadArray([], ((old === null || old === void 0 ? void 0 : old.readBroadcasts) || []), true), [broadcastId], false)
                    }); });
                    // Update unread count
                    queryClient.setQueryData(["/api/broadcasts/unread-count"], function (old) { return ({
                        unreadCount: Math.max(0, ((old === null || old === void 0 ? void 0 : old.unreadCount) || 0) - 1)
                    }); });
                    toast({
                        title: "Success",
                        description: "Update marked as read",
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error marking broadcast as read:", error_1);
                    toast({
                        title: "Error",
                        description: "Failed to mark update as read",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setMarkingIds(function (prev) {
                        var newMap = new Map(prev);
                        newMap.delete(broadcastId);
                        return newMap;
                    });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var markAsRead = useMutation({
        mutationFn: function (broadcastId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/broadcasts/".concat(broadcastId, "/read"), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/read-list"] });
            queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/unread-count"] });
            toast({
                title: "Success",
                description: "Update marked as read",
            });
        },
        onError: function (error) {
            console.error("Error marking broadcast as read:", error);
            toast({
                title: "Error",
                description: "Failed to mark update as read",
                variant: "destructive",
            });
        },
    });
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [isAuthenticated, authLoading, toast]);
    useEffect(function () {
        if (error && isUnauthorizedError(error)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [error, toast]);
    if (authLoading || isLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    var getRoleColor = function (role) {
        switch (role) {
            case "coo":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "td":
                return "bg-purple-100 text-purple-800 border-purple-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Updates & Announcements</h1>

        <Card className="border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary"/>
              <h2 className="text-lg font-semibold">All Updates</h2>
            </div>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {!broadcasts || broadcasts.length === 0 ? (<div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                <p className="text-muted-foreground">No updates yet</p>
              </div>) : (broadcasts.map(function (broadcast) {
            var _a;
            var isRead = (_a = readData === null || readData === void 0 ? void 0 : readData.readBroadcasts) === null || _a === void 0 ? void 0 : _a.includes(broadcast.id);
            return (<div key={broadcast.id} className={"p-6 space-y-3 hover-elevate transition-colors ".concat(!isRead ? "bg-primary/5" : "")} data-testid={"broadcast-".concat(broadcast.id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {!isRead && (<div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>)}
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={"".concat(getRoleColor(broadcast.senderRole), " border font-semibold uppercase tracking-wide text-2xs px-2 py-0.5")}>
                                {broadcast.senderRole === "coo"
                    ? "COO"
                    : broadcast.senderRole === "td"
                        ? "TD"
                        : "System"}
                              </Badge>
                              {!isRead && (<Badge variant="default" className="bg-primary text-xs">
                                  New
                                </Badge>)}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              {broadcast.createdAt
                    ? format(new Date(broadcast.createdAt), "MMM d, yyyy 'at' h:mm a")
                    : "Unknown date"}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-base mb-3">{broadcast.subject}</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: broadcast.message }}/>
                        {!isRead && (<Button size="sm" variant="outline" onClick={function () { return handleMarkAsRead(broadcast.id); }} disabled={markingIds.get(broadcast.id) === true} className="mt-4 gap-2">
                            <Check className="w-4 h-4"/>
                            {markingIds.get(broadcast.id) ? "Marking..." : "Mark as Read"}
                          </Button>)}
                      </div>
                    </div>
                  </div>);
        }))}
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}
