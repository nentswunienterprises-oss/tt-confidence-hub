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
      const data = await authorizedGetJson("/api/broadcasts?role=affiliate");
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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Updates</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Stay informed with announcements from leadership</p>
        </div>

        {loading ? (
          <Card className="p-6 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">Loading updates...</p>
          </Card>
        ) : broadcasts.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-muted-foreground">No updates yet</p>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {broadcasts.map((broadcast: any) => {
              const isExpanded = expandedId === broadcast.id;
              const isRead = readData?.readBroadcasts?.includes(broadcast.id);
              const isMarking = markingIds.get(broadcast.id);

              return (
                <Card
                  key={broadcast.id}
                  className={`p-3 sm:p-6 transition-all hover:shadow-md cursor-pointer border-l-4 ${
                    isRead 
                      ? "border-l-muted opacity-75 bg-card" 
                      : "border-l-primary bg-primary/5"
                  }`}
                >
                  <div 
                    className="space-y-3 sm:space-y-4"
                    onClick={() => setExpandedId(isExpanded ? null : broadcast.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {!isRead && (
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary flex-shrink-0" />
                          )}
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

                      {!isRead && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(broadcast.id);
                          }}
                          disabled={isMarking}
                          className="gap-2 flex-shrink-0 text-xs sm:text-sm w-full sm:w-auto"
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
