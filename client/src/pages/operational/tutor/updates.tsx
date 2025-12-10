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
import type { Broadcast } from "@shared/schema";
import { format } from "date-fns";

export default function TutorUpdates() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [markingIds, setMarkingIds] = useState<Map<string, boolean>>(new Map());

  const {
    data: broadcasts,
    isLoading,
    error,
  } = useQuery<Broadcast[]>({
    queryKey: ["/api/broadcasts"],
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: readData,
  } = useQuery<{ readBroadcasts: string[] }>({
    queryKey: ["/api/broadcasts/read-list"],
    enabled: isAuthenticated && !authLoading,
  });

  const handleMarkAsRead = async (broadcastId: string) => {
    setMarkingIds(prev => new Map(prev).set(broadcastId, true));
    try {
      await apiRequest("POST", `/api/broadcasts/${broadcastId}/read`, {});
      
      // Optimistically update the read list
      queryClient.setQueryData<{ readBroadcasts: string[] }>(
        ["/api/broadcasts/read-list"],
        (old) => ({
          readBroadcasts: [...(old?.readBroadcasts || []), broadcastId]
        })
      );
      
      // Update unread count
      queryClient.setQueryData<{ unreadCount: number }>(
        ["/api/broadcasts/unread-count"],
        (old) => ({
          unreadCount: Math.max(0, (old?.unreadCount || 0) - 1)
        })
      );
      
      toast({
        title: "Success",
        description: "Update marked as read",
      });
    } catch (error: any) {
      console.error("Error marking broadcast as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark update as read",
        variant: "destructive",
      });
    } finally {
      setMarkingIds(prev => {
        const newMap = new Map(prev);
        newMap.delete(broadcastId);
        return newMap;
      });
    }
  };

  const markAsRead = useMutation({
    mutationFn: async (broadcastId: string) => {
      await apiRequest("POST", `/api/broadcasts/${broadcastId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/read-list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/unread-count"] });
      toast({
        title: "Success",
        description: "Update marked as read",
      });
    },
    onError: (error: any) => {
      console.error("Error marking broadcast as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark update as read",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [error, toast]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "coo":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "td":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Updates & Announcements</h1>

        <Card className="border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">All Updates</h2>
            </div>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {!broadcasts || broadcasts.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No updates yet</p>
              </div>
            ) : (
              broadcasts.map((broadcast) => {
                const isRead = readData?.readBroadcasts?.includes(broadcast.id);
                return (
                  <div
                    key={broadcast.id}
                    className={`p-6 space-y-3 hover-elevate transition-colors ${!isRead ? "bg-primary/5" : ""}`}
                    data-testid={`broadcast-${broadcast.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {!isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${getRoleColor(broadcast.senderRole)} border font-semibold uppercase tracking-wide text-2xs px-2 py-0.5`}
                              >
                                {broadcast.senderRole === "coo"
                                  ? "COO"
                                  : broadcast.senderRole === "td"
                                  ? "TD"
                                  : "System"}
                              </Badge>
                              {!isRead && (
                                <Badge variant="default" className="bg-primary text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              {broadcast.createdAt
                                ? format(new Date(broadcast.createdAt), "MMM d, yyyy 'at' h:mm a")
                                : "Unknown date"}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-base mb-3">{broadcast.subject}</h3>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                          dangerouslySetInnerHTML={{ __html: broadcast.message }}
                        />
                        {!isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(broadcast.id)}
                            disabled={markingIds.get(broadcast.id) === true}
                            className="mt-4 gap-2"
                          >
                            <Check className="w-4 h-4" />
                            {markingIds.get(broadcast.id) ? "Marking..." : "Mark as Read"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
