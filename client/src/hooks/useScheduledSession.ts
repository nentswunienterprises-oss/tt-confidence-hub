import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

export function useScheduledSession(studentId) {
  return useQuery({
    queryKey: ["/api/tutor/student/intro-session-details", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await fetch(`${API_URL}/api/tutor/student/${studentId}/intro-session-details`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch intro session details");
      return await res.json();
    },
    enabled: !!studentId,
    refetchInterval: 10000,
  });
}

export function useTutorRespondToSession(studentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ action, newDate, newTime }) => {
      const res = await fetch(`${API_URL}/api/tutor/student/${studentId}/intro-session-response`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, newDate, newTime }),
      });
      if (!res.ok) throw new Error("Failed to respond to session");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/student/intro-session-details", studentId] });
    },
  });
}
