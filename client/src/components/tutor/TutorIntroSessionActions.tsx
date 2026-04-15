import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function TutorIntroSessionActions({ studentId, parentId, tutorId }) {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      setError(null);
      // Try by studentId first
      let res = await fetch(`/api/tutor/student/${studentId}/intro-session-details`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.scheduled_time) {
          setSessionData(data);
          setLoading(false);
          return;
        }
      }
      // Fallback: try by parentId/tutorId
      if (parentId && tutorId) {
        let fallbackRes = await fetch(`/api/tutor/parent/${parentId}/tutor/${tutorId}/intro-session-details`, { credentials: "include" });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.scheduled_time) {
            setSessionData(fallbackData);
            setLoading(false);
            return;
          }
        }
      }
      setSessionData(null);
      setLoading(false);
      setError("No intro session found");
    }
    if (studentId || (parentId && tutorId)) fetchSession();
  }, [studentId, parentId, tutorId]);

  return (
    <div>
      <div className="text-xs bg-yellow-100 text-black p-2 mb-2 rounded">
        <b>DEBUG:</b>
        <pre className="text-xs text-left">{JSON.stringify({ studentId, parentId, tutorId, sessionData, loading, error }, null, 2)}</pre>
      </div>
      {(() => {
        if (loading) return <div className="text-sm text-muted-foreground">Loading session info...</div>;
        if (error) return <div className="text-sm text-red-600">{error}</div>;
        if (!sessionData || !sessionData.scheduled_time) {
          return (
            <div className="text-sm text-muted-foreground">
              No intro session proposed yet.
            </div>
          );
        }
        const proposed = new Date(sessionData.scheduled_time);
        const formatted = proposed.toLocaleString();
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <b>Parent proposed:</b> {formatted}
            </div>
            {sessionData.status === "pending_tutor_confirmation" && (
              <div className="flex gap-2">
                <Button size="sm">Accept</Button>
                <input type="date" className="border rounded px-2 py-1 text-sm" />
                <input type="time" className="border rounded px-2 py-1 text-sm" />
                <Button size="sm" variant="outline">Propose Adjustment</Button>
              </div>
            )}
            {sessionData.status === "pending_parent_confirmation" && (
              <div className="text-xs text-yellow-700">Waiting for parent to confirm new time.</div>
            )}
            {sessionData.status === "confirmed" && (
              <div className="text-xs text-green-700">Session confirmed!</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
