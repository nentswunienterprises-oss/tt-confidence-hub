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
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Megaphone, AlertCircle, Info, Calendar } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
export default function ODUpdates() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    // Fetch broadcasts
    var _b = useQuery({
        queryKey: ["/api/broadcasts"],
        enabled: isAuthenticated && !authLoading,
    }), _c = _b.data, broadcasts = _c === void 0 ? [] : _c, broadcastsLoading = _b.isLoading, broadcastsError = _b.error;
    // Fetch read broadcasts list
    var readData = useQuery({
        queryKey: ["/api/broadcasts/read-list"],
        enabled: isAuthenticated && !authLoading,
    }).data;
    // Mark as read mutation
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
        if (broadcastsError && isUnauthorizedError(broadcastsError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [broadcastsError, toast]);
    if (authLoading || broadcastsLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48"/>
          <div className="space-y-4">
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
            <Skeleton className="h-32"/>
          </div>
        </div>
      </DashboardLayout>);
    }
    var readBroadcastIds = new Set((readData === null || readData === void 0 ? void 0 : readData.readBroadcasts) || []);
    var enrichedBroadcasts = broadcasts.map(function (b) { return (__assign(__assign({}, b), { isRead: readBroadcastIds.has(b.id) })); });
    var unreadCount = enrichedBroadcasts.filter(function (b) { return !b.isRead; }).length;
    var getTypeIcon = function (type) {
        switch (type) {
            case "announcement":
                return <Megaphone className="w-5 h-5 text-primary"/>;
            case "alert":
                return <AlertCircle className="w-5 h-5 text-destructive"/>;
            case "info":
                return <Info className="w-5 h-5 text-blue-500"/>;
            default:
                return <Bell className="w-5 h-5"/>;
        }
    };
    var getTypeBadge = function (type) {
        switch (type) {
            case "announcement":
                return <Badge variant="default">Announcement</Badge>;
            case "alert":
                return <Badge variant="destructive">Alert</Badge>;
            case "info":
                return <Badge variant="secondary">Info</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Updates</h1>
            <p className="text-muted-foreground mt-1">
              Stay informed with the latest announcements and updates
            </p>
          </div>
          {unreadCount > 0 && (<Badge variant="default" className="w-fit">
              {unreadCount} unread
            </Badge>)}
        </div>

        {/* Updates List */}
        {enrichedBroadcasts.length > 0 ? (<div className="space-y-4">
            {enrichedBroadcasts.map(function (broadcast) { return (<Card key={broadcast.id} className={"p-4 sm:p-6 transition-colors ".concat(!broadcast.isRead ? "bg-primary/5 border-primary/20" : "")}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(broadcast.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold">{broadcast.title}</h3>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(broadcast.type)}
                        {!broadcast.isRead && (<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            New
                          </Badge>)}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                      {broadcast.message}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4"/>
                        <span>
                          {formatDistanceToNow(new Date(broadcast.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {!broadcast.isRead && (<Button variant="ghost" size="sm" onClick={function () { return markAsRead.mutate(broadcast.id); }} disabled={markAsRead.isPending} className="gap-2">
                          <Check className="w-4 h-4"/>
                          Mark as read
                        </Button>)}
                    </div>
                  </div>
                </div>
              </Card>); })}
          </div>) : (<Card className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
            <h3 className="text-lg font-semibold mb-2">No Updates Yet</h3>
            <p className="text-muted-foreground">
              You're all caught up! Check back later for new updates.
            </p>
          </Card>)}
      </div>
    </DashboardLayout>);
}
