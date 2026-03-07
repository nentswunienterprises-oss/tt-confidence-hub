import { Button } from "@/components/ui/button";
import { useScheduledSession, useTutorRespondToSession } from "@/hooks/useScheduledSession";
import { useState } from "react";
export function TutorIntroSessionActions(_a) {
    var studentId = _a.studentId;
    var _b = useScheduledSession(studentId), data = _b.data, isLoading = _b.isLoading, error = _b.error;
    var respond = useTutorRespondToSession(studentId);
    var _c = useState(""), newDate = _c[0], setNewDate = _c[1];
    var _d = useState(""), newTime = _d[0], setNewTime = _d[1];
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    if (isLoading)
      return <div className="text-xs text-muted-foreground">Loading...</div>;
    if (error)
      return <div className="text-xs text-red-600">Error loading session</div>;
    if (!data || !data.scheduled_time)
      return <div className="text-xs text-muted-foreground">No intro session proposed.</div>;
    var proposed = new Date(data.scheduled_time);
    var formatted = proposed.toLocaleString();
    return (
      <div className="space-y-1">
        <div className="text-xs">
          <span className="font-semibold">Proposed:</span> {formatted}
        </div>
        {data.status === "pending_tutor_confirmation" && (
          <div className="flex gap-1 items-center">
            <Button size="sm" onClick={() => respond.mutate({ action: "accept" })} disabled={respond.isLoading}>
              Confirm
            </Button>
            <span className="mx-1 text-muted-foreground">or</span>
            <button
              type="button"
              className="border rounded px-1 py-0.5 text-xs w-[110px] bg-white"
              onClick={() => setShowDatePicker(true)}
            >
              {newDate ? newDate : "Pick date"}
            </button>
            {showDatePicker && (
              <input
                type="date"
                value={newDate}
                onChange={e => {
                  setNewDate(e.target.value);
                  setShowDatePicker(false);
                }}
                className="absolute z-10"
                style={{ left: 0 }}
                autoFocus
              />
            )}
            <button
              type="button"
              className="border rounded px-1 py-0.5 text-xs w-[90px] bg-white"
              onClick={() => setShowTimePicker(true)}
            >
              {newTime ? newTime : "Pick time"}
            </button>
            {showTimePicker && (
              <input
                type="time"
                value={newTime}
                onChange={e => {
                  setNewTime(e.target.value);
                  setShowTimePicker(false);
                }}
                className="absolute z-10"
                style={{ left: 120 }}
                autoFocus
              />
            )}
            <Button size="sm" variant="outline" onClick={() => respond.mutate({ action: "propose_adjustment", newDate, newTime })} disabled={respond.isLoading || !newDate || !newTime}>
              Adjust
            </Button>
          </div>
        )}
        {(newDate && newTime && data.status === "pending_tutor_confirmation") && (
          <div className="text-[11px] text-muted-foreground">New: {newDate} {newTime}</div>
        )}
        {data.status === "pending_parent_confirmation" && (
          <div className="text-[11px] text-yellow-700">Waiting for parent confirmation...</div>
        )}
        {data.status === "confirmed" && (
          <div className="text-[11px] text-green-700">Session confirmed!</div>
        )}
        {respond.isError && <div className="text-[11px] text-red-600">{respond.error.message}</div>}
        {respond.isSuccess && <div className="text-[11px] text-green-600">Response sent!</div>}
      </div>
    );
}
