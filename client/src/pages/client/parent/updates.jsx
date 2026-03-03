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
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Megaphone, CheckCircle2, Clock } from "lucide-react";
import { useEffect } from "react";
export default function ParentUpdates() {
    var _this = this;
    var user = useAuth().user;
    var queryClient = useQueryClient();
    // Fetch broadcasts
    var _a = useQuery({
        queryKey: ["/api/parent/broadcasts"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    }).data, broadcasts = _a === void 0 ? [] : _a;
    // Mark broadcast as read mutation
    var markAsReadMutation = useMutation({
        mutationFn: function (broadcastId) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/broadcasts/".concat(broadcastId, "/mark-read"), {
                            method: "POST",
                            credentials: "include",
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to mark as read");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/parent/broadcasts"] });
        },
    });
    // Auto-mark as read when viewing
    useEffect(function () {
        broadcasts.forEach(function (broadcast) {
            if (!broadcast.isRead) {
                markAsReadMutation.mutate(broadcast.id);
            }
        });
    }, [broadcasts.length]);
    var unreadCount = broadcasts.filter(function (b) { return !b.isRead; }).length;
    return (<div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 sm:w-8 sm:h-8"/>
                Updates
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground">Important announcements from the Response Hub team</p>
            </div>
            {unreadCount > 0 && (<Badge variant="default" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
                {unreadCount} New
              </Badge>)}
          </div>
        </div>

        {broadcasts.length === 0 ? (<Card>
            <CardContent className="p-4 sm:pt-6 text-center text-sm sm:text-base text-muted-foreground">
              <Megaphone className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50"/>
              <p>No updates yet. You'll be notified when there are important announcements.</p>
            </CardContent>
          </Card>) : (<div className="space-y-3 sm:space-y-4">
            {broadcasts.map(function (broadcast) { return (<Card key={broadcast.id} className={"".concat(!broadcast.isRead ? 'border-l-4 border-l-primary bg-primary/5' : '')}>
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                        {broadcast.title}
                        {!broadcast.isRead && (<Badge variant="default" className="text-xs">
                            New
                          </Badge>)}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-1 sm:gap-3 mt-1 sm:mt-2 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3"/>
                          {new Date(broadcast.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="w-full sm:w-auto">From: {broadcast.createdBy.name}</span>
                      </CardDescription>
                    </div>
                    {broadcast.isRead && (<Badge variant="secondary" className="flex items-center gap-1 text-xs w-fit">
                        <CheckCircle2 className="w-3 h-3"/>
                        Read
                      </Badge>)}
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{broadcast.content}</p>
                  </div>
                </CardContent>
              </Card>); })}
          </div>)}
      </div>);
}
