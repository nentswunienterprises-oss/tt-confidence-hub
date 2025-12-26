import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Bell } from "lucide-react";

export default function StudentUpdates() {
  // Fetch broadcasts/updates
  const { data: broadcasts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/broadcasts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold">Updates</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Stay updated with the latest news and announcements</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : broadcasts && broadcasts.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id}>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {broadcast.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{broadcast.message}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
                  {new Date(broadcast.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="text-center py-8 sm:py-12">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No updates yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Check back later for announcements from your tutor</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
