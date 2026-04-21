import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

export interface StudentWorkflowState {
  assignmentAccepted: boolean;
  introConfirmed: boolean;
  introCompleted: boolean;
  handoverVerificationRequired: boolean;
  handoverSessionConfirmed: boolean;
  handoverCompleted: boolean;
  identitySaved: boolean;
  proposalSent: boolean;
  proposalAccepted: boolean;
}

export function useStudentWorkflowState(studentId: string) {
  return useQuery<StudentWorkflowState>({
    queryKey: ["/api/tutor/students", studentId, "workflow-state"],
    queryFn: async () => {
      if (!studentId) {
        return {
          assignmentAccepted: false,
          introConfirmed: false,
          introCompleted: false,
          handoverVerificationRequired: false,
          handoverSessionConfirmed: false,
          handoverCompleted: false,
          identitySaved: false,
          proposalSent: false,
          proposalAccepted: false,
        };
      }

      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/workflow-state`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch student workflow state");
      }

      return await res.json();
    },
    enabled: !!studentId,
    refetchInterval: 10000,
  });
}

export function useMarkIntroCompleted(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/workflow/intro-completed`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || "Failed to mark intro completed");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "workflow-state"] });
    },
  });
}

export function useMarkHandoverCompleted(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/workflow/handover-completed`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || "Failed to mark handover completed");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "workflow-state"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students/intro-session-details", studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
    },
  });
}

export function useRespondToAssignment(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (decision: "accept" | "decline") => {
      const res = await fetch(`${API_URL}/api/tutor/students/${studentId}/workflow/assignment-decision`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || "Failed to submit assignment decision");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/students", studentId, "workflow-state"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
    },
  });
}
