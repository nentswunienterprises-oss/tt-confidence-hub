// Utility to fetch intro session status for a student
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

export function useIntroSessionStatus(studentId: string) {
  return useQuery({
    queryKey: ["/api/tutor/student/intro-session-status", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await fetch(`${API_URL}/api/tutor/student/${studentId}/intro-session-status`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch intro session status");
      return await res.json();
    },
    enabled: !!studentId,
  });
}
