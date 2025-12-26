import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Megaphone, CheckCircle2, Clock } from "lucide-react";
import { useEffect } from "react";

interface Broadcast {
  id: string;
  title: string;
  content: string;
  visibility: string;
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: string;
  isRead: boolean;
}

export default function ParentUpdates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch broadcasts
  const { data: broadcasts = [] } = useQuery<Broadcast[]>({
    queryKey: ["/api/parent/broadcasts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Mark broadcast as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (broadcastId: string) => {
      const response = await fetch(`/api/broadcasts/${broadcastId}/mark-read`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent/broadcasts"] });
    },
  });

  // Auto-mark as read when viewing
  useEffect(() => {
    broadcasts.forEach(broadcast => {
      if (!broadcast.isRead) {
        markAsReadMutation.mutate(broadcast.id);
      }
    });
  }, [broadcasts.length]);

  const unreadCount = broadcasts.filter(b => !b.isRead).length;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 sm:w-8 sm:h-8" />
                Updates
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground">Important announcements from the Confidence Hub team</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>

        {broadcasts.length === 0 ? (
          <Card>
            <CardContent className="p-4 sm:pt-6 text-center text-sm sm:text-base text-muted-foreground">
              <Megaphone className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p>No updates yet. You'll be notified when there are important announcements.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {broadcasts.map((broadcast) => (
              <Card 
                key={broadcast.id}
                className={`${!broadcast.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                        {broadcast.title}
                        {!broadcast.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-1 sm:gap-3 mt-1 sm:mt-2 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
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
                    {broadcast.isRead && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Read
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{broadcast.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
