import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Fetch intro session details by parentId and tutorId (before student exists)
export function useParentIntroSessionStatus(parentId: string, tutorId: string) {
  return useQuery({
    queryKey: ["/api/tutor/parent/intro-session-details", parentId, tutorId],
    queryFn: async () => {
      if (!parentId || !tutorId) return null;
      const res = await apiRequest("GET", `/api/tutor/parent/${parentId}/tutor/${tutorId}/intro-session-details`);
      return await res.json();
    },
    enabled: !!parentId && !!tutorId,
    refetchInterval: 10000,
  });
}
