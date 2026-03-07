import { Button } from "@/components/ui/button";
import { useScheduledSession, useTutorRespondToSession } from "@/hooks/useScheduledSession";
import { useState } from "react";

export function TutorIntroSessionActions({ studentId }) {
  const { data, isLoading, error } = useScheduledSession(studentId);
  // Always show debug output at the top for diagnosis
  return (
    <div>
      <div className="text-xs bg-yellow-100 text-black p-2 mb-2 rounded">
        <b>DEBUG:</b>
        <pre className="text-xs text-left">{JSON.stringify({ studentId, data, isLoading, error }, null, 2)}</pre>
      </div>
      {/* ...existing code follows... */}
      {(() => {
        if (!studentId) {
          return <div className="text-xs text-red-600">No studentId provided to TutorIntroSessionActions.</div>;
        }
        if (isLoading) return <div className="text-sm text-muted-foreground">Loading session info for studentId: {studentId}...</div>;
        if (error) return <div className="text-sm text-red-600">Failed to load session info for studentId: {studentId}</div>;
        if (!data || !data.scheduled_time) {
          return (
            <div className="text-sm text-muted-foreground">
              No intro session proposed yet for studentId: {studentId}.
            </div>
          );
        }
        const proposed = new Date(data.scheduled_time);
        const formatted = proposed.toLocaleString();
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <b>Parent proposed:</b> {formatted}
            </div>
            {data.status === "pending_tutor_confirmation" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respond.mutate({ action: "accept" })} disabled={respond.isLoading}>
                  Accept
                </Button>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respond.mutate({ action: "propose_adjustment", newDate, newTime })}
                  disabled={respond.isLoading || !newDate || !newTime}
                >
                  Propose Adjustment
                </Button>
              </div>
            )}
            {data.status === "pending_parent_confirmation" && (
              <div className="text-xs text-yellow-700">Waiting for parent to confirm new time.</div>
            )}
            {data.status === "confirmed" && (
              <div className="text-xs text-green-700">Session confirmed!</div>
            )}
            {respond.isError && <div className="text-xs text-red-600">{respond.error.message}</div>}
            {respond.isSuccess && <div className="text-xs text-green-600">Response sent!</div>}
          </div>
        );
      })()}
    </div>
  );
}
