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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sessions</h1>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          <p className="text-muted-foreground">No sessions scheduled yet.</p>
        </div>
      </div>
    </div>
  );
}
