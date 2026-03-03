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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { authorizedGetJson } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
export default function AffiliateUpdates() {
    var _this = this;
    var toast = useToast().toast;
    var _a = useState([]), broadcasts = _a[0], setBroadcasts = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), expandedId = _c[0], setExpandedId = _c[1];
    var _d = useState(new Map()), markingIds = _d[0], setMarkingIds = _d[1];
    var readData = useQuery({
        queryKey: ["/api/broadcasts/read-list"],
    }).data;
    useEffect(function () {
        fetchBroadcasts();
    }, []);
    var fetchBroadcasts = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, authorizedGetJson("/api/broadcasts?role=affiliate")];
                case 1:
                    data = _a.sent();
                    setBroadcasts(data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching broadcasts:", error_1);
                    toast({
                        title: "Error",
                        description: "Failed to load updates",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var markAsRead = function (broadcastId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
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
                    toast({
                        title: "Success",
                        description: "Update marked as read",
                    });
                    // Refresh broadcasts to update UI
                    fetchBroadcasts();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error marking broadcast as read:", error_2);
                    toast({
                        title: "Error",
                        description: error_2.message || "Failed to mark update as read",
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
    return (<DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Updates</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Stay informed with announcements from leadership</p>
        </div>

        {loading ? (<Card className="p-6 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">Loading updates...</p>
          </Card>) : broadcasts.length === 0 ? (<Card className="p-6 sm:p-12 text-center">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-2 sm:mb-3"/>
            <p className="text-sm sm:text-base text-muted-foreground">No updates yet</p>
          </Card>) : (<div className="space-y-3 sm:space-y-4">
            {broadcasts.map(function (broadcast) {
                var _a;
                var isExpanded = expandedId === broadcast.id;
                var isRead = (_a = readData === null || readData === void 0 ? void 0 : readData.readBroadcasts) === null || _a === void 0 ? void 0 : _a.includes(broadcast.id);
                var isMarking = markingIds.get(broadcast.id);
                return (<Card key={broadcast.id} className={"p-3 sm:p-6 transition-all hover:shadow-md cursor-pointer border-l-4 ".concat(isRead
                        ? "border-l-muted opacity-75 bg-card"
                        : "border-l-primary bg-primary/5")}>
                  <div className="space-y-3 sm:space-y-4" onClick={function () { return setExpandedId(isExpanded ? null : broadcast.id); }}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {!isRead && (<div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary flex-shrink-0"/>)}
                          <h3 className="font-bold text-sm sm:text-lg text-foreground break-words">
                            {broadcast.subject || "No Subject"}
                          </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                          {new Date(broadcast.createdAt).toLocaleDateString()} at{" "}
                          {new Date(broadcast.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                        </p>
                      </div>

                      {!isRead && (<Button size="sm" variant="default" onClick={function (e) {
                            e.stopPropagation();
                            markAsRead(broadcast.id);
                        }} disabled={isMarking} className="gap-2 flex-shrink-0 text-xs sm:text-sm w-full sm:w-auto">
                          <Eye className="w-4 h-4"/>
                          {isMarking ? "Marking..." : "Mark Read"}
                        </Button>)}
                    </div>

                    {isExpanded && (<div className="mt-4 pt-4 border-t border-muted">
                        <div className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: broadcast.message || "No message" }}/>
                      </div>)}
                  </div>
                </Card>);
            })}
          </div>)}
      </div>
    </DashboardLayout>);
}
