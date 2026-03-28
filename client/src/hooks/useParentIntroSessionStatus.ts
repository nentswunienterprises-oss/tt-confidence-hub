import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

// Fetch intro session details by parentId and tutorId (before student exists)
export function useParentIntroSessionStatus(parentId: string, tutorId: string) {
  return useQuery({
    queryKey: ["/api/tutor/parent/intro-session-details", parentId, tutorId],
    queryFn: async () => {
      if (!parentId || !tutorId) return null;
      const res = await fetch(`${API_URL}/api/tutor/parent/${parentId}/tutor/${tutorId}/intro-session-details`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch intro session details");
      return await res.json();
    },
    enabled: !!parentId && !!tutorId,
    refetchInterval: 10000,
  });
}
