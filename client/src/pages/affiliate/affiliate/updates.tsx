import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function AffiliateUpdates() {
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<Map<string, boolean>>(new Map());

  const { data: readData } = useQuery<{ readBroadcasts: string[] }>({
    queryKey: ["/api/broadcasts/read-list"],
  });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch("/api/broadcasts?role=affiliate", {
        credentials: "include",
      });
      const data = await res.json();
      setBroadcasts(data);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      toast({
        title: "Error",
        description: "Failed to load updates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (broadcastId: string) => {
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

      toast({
        title: "Success",
        description: "Update marked as read",
      });

      // Refresh broadcasts to update UI
      fetchBroadcasts();
    } catch (error: any) {
      console.error("Error marking broadcast as read:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark update as read",
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Updates</h1>
          <p className="text-muted-foreground">Stay informed with announcements from leadership</p>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading updates...</p>
          </Card>
        ) : broadcasts.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No updates yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast: any) => {
              const isExpanded = expandedId === broadcast.id;
              const isRead = readData?.readBroadcasts?.includes(broadcast.id);
              const isMarking = markingIds.get(broadcast.id);

              return (
                <Card
                  key={broadcast.id}
                  className={`p-6 transition-all hover:shadow-md cursor-pointer border-l-4 ${
                    isRead 
                      ? "border-l-muted opacity-75 bg-card" 
                      : "border-l-primary bg-primary/5"
                  }`}
                >
                  <div 
                    className="space-y-4"
                    onClick={() => setExpandedId(isExpanded ? null : broadcast.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          {!isRead && (
                            <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <h3 className="font-bold text-lg text-foreground break-words">
                            {broadcast.subject || "No Subject"}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(broadcast.createdAt).toLocaleDateString()} at{" "}
                          {new Date(broadcast.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {!isRead && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(broadcast.id);
                          }}
                          disabled={isMarking}
                          className="gap-2 flex-shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                          {isMarking ? "Marking..." : "Mark Read"}
                        </Button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-muted">
                        <div 
                          className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: broadcast.message || "No message" }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
