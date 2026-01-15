import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateAffiliateCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/parent/set-affiliate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update affiliate code");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/auth/user"]);
      queryClient.invalidateQueries(["/api/affiliate/performance"]);
    },
  });
}
