import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

export function useScheduledSession(studentId) {
  return useQuery({
    queryKey: ["/api/tutor/students/intro-session-details", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/intro-session-details`, {
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
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/intro-session-response`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, newDate, newTime }),
      });
      if (!res.ok) throw new Error("Failed to respond to session");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/intro-session-details", studentId] });
    },
  });
}

export function useTrainingSessions(studentId) {
  return useQuery({
    queryKey: ["/api/tutor/students/training-sessions", studentId],
    queryFn: async () => {
      if (!studentId) return { sessions: [], googleMeetConfigured: false };
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/training-sessions`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch training sessions");
      return await res.json();
    },
    enabled: !!studentId,
    refetchInterval: 15000,
  });
}

export function useCreateTrainingSession(studentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduledStart, scheduledEnd, timezone }) => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/training-sessions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledStart, scheduledEnd, timezone }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to create training session");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/training-sessions", studentId] });
    },
  });
}

export function useRetryScheduledSessionMeetSync(studentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId }) => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/scheduled-sessions/${sessionId}/retry-meet-sync`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to retry Meet sync");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/intro-session-details", studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/training-sessions", studentId] });
    },
  });
}

export function useSyncScheduledSessionArtifacts(studentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId }) => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/scheduled-sessions/${sessionId}/sync-artifacts`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to sync session artifacts");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/training-sessions", studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/intro-session-details", studentId] });
    },
  });
}

export function useConfirmTrainingSession(studentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId }) => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/training-sessions/${sessionId}/confirm`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to confirm training session");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/training-sessions", studentId] });
    },
  });
}

export function useRespondTrainingSession(studentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, action, scheduledStart, timezone }) => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/training-sessions/${sessionId}/respond`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action, scheduledStart, timezone }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to respond to training session");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/training-sessions", studentId] });
    },
  });
}
