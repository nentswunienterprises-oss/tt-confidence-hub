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

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "alert" | "info";
  createdAt: string;
  isRead?: boolean;
}

export default function ODUpdates() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch broadcasts
  const { data: broadcasts = [], isLoading: broadcastsLoading, error: broadcastsError } = useQuery<Broadcast[]>({
    queryKey: ["/api/broadcasts"],
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch read broadcasts list
  const { data: readData } = useQuery<{ readBroadcasts: string[] }>({
    queryKey: ["/api/broadcasts/read-list"],
    enabled: isAuthenticated && !authLoading,
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (broadcastId: string) => {
      await apiRequest("POST", `/api/broadcasts/${broadcastId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/read-list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts/unread-count"] });
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
    if (broadcastsError && isUnauthorizedError(broadcastsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [broadcastsError, toast]);

  if (authLoading || broadcastsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const readBroadcastIds = new Set(readData?.readBroadcasts || []);
  const enrichedBroadcasts = broadcasts.map((b) => ({
    ...b,
    isRead: readBroadcastIds.has(b.id),
  }));

  const unreadCount = enrichedBroadcasts.filter((b) => !b.isRead).length;

  const getTypeIcon = (type: Broadcast["type"]) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="w-5 h-5 text-primary" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeBadge = (type: Broadcast["type"]) => {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Updates</h1>
            <p className="text-muted-foreground mt-1">
              Stay informed with the latest announcements and updates
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="w-fit">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Updates List */}
        {enrichedBroadcasts.length > 0 ? (
          <div className="space-y-4">
            {enrichedBroadcasts.map((broadcast) => (
              <Card
                key={broadcast.id}
                className={`p-4 sm:p-6 transition-colors ${
                  !broadcast.isRead ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(broadcast.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold">{broadcast.title}</h3>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(broadcast.type)}
                        {!broadcast.isRead && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                      {broadcast.message}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(broadcast.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {!broadcast.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead.mutate(broadcast.id)}
                          disabled={markAsRead.isPending}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Updates Yet</h3>
            <p className="text-muted-foreground">
              You're all caught up! Check back later for new updates.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
