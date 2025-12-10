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
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Megaphone className="w-8 h-8" />
                Updates
              </h1>
              <p className="text-muted-foreground">Important announcements from the Confidence Hub team</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-lg px-4 py-2">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>

        {broadcasts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No updates yet. You'll be notified when there are important announcements.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <Card 
                key={broadcast.id}
                className={`${!broadcast.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {broadcast.title}
                        {!broadcast.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(broadcast.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span>From: {broadcast.createdBy.name} ({broadcast.createdBy.role.toUpperCase()})</span>
                      </CardDescription>
                    </div>
                    {broadcast.isRead && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Read
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{broadcast.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
