import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ParentSessions() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/client/signup");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-3xl font-bold">Sessions</h1>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Upcoming Sessions</h2>
          <p className="text-sm sm:text-base text-muted-foreground">No sessions scheduled yet.</p>
        </div>
      </div>
    </div>
  );
}
