import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";

type ParentTrainingSession = {
  id: string;
  scheduled_time: string;
  scheduled_end?: string | null;
  timezone?: string | null;
  status: string;
  type: string;
  google_meet_url?: string | null;
  parent_confirmed?: boolean;
  tutor_confirmed?: boolean;
};

type ParentTrainingSessionsResponse = {
  sessions: ParentTrainingSession[];
  operationalMode?: "training" | "certified_live";
  sessionSchedulingEnabled?: boolean;
};

export default function ParentSessions() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [slotOneDate, setSlotOneDate] = useState<Date | undefined>(undefined);
  const [slotOneTime, setSlotOneTime] = useState("15:00");
  const [slotTwoDate, setSlotTwoDate] = useState<Date | undefined>(undefined);
  const [slotTwoTime, setSlotTwoTime] = useState("17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingSessionId, setConfirmingSessionId] = useState<string | null>(null);
  const [adjustingSessionId, setAdjustingSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [adjustedTime, setAdjustedTime] = useState("");

  const formatScheduleLabel = (value?: string | Date | null) => {
    if (!value) return "Choose a date";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "Choose a date";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatSessionDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const combineDateAndTime = (date?: Date, time?: string) => {
    if (!date || !time) return "";
    const [hours, minutes] = time.split(":").map((part) => Number(part));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  };

  const getWeekValidationMessage = (values: string[]) => {
    const parsed = values.map((value) => new Date(value));
    if (parsed.some((date) => Number.isNaN(date.getTime()))) {
      return "Session dates must be valid.";
    }
    if (parsed.some((date) => {
      const day = date.getDay();
      return day < 1 || day > 6;
    })) {
      return "Session dates must fall between Monday and Saturday.";
    }
    const getWeekStart = (date: Date) => {
      const start = new Date(date);
      const mondayOffset = (start.getDay() + 6) % 7;
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - mondayOffset);
      return start.getTime();
    };
    const firstWeekStart = getWeekStart(parsed[0]);
    if (parsed.some((date) => getWeekStart(date) !== firstWeekStart)) {
      return "Both sessions must be scheduled within the same Monday-to-Saturday week.";
    }
    return null;
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/client/signup");
    }
  }, [user, isLoading, navigate]);

  const { data, isLoading: sessionsLoading } = useQuery<ParentTrainingSessionsResponse>({
    queryKey: ["/api/parent/training-sessions"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`${API_URL}/api/parent/training-sessions`, {
        credentials: "include",
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const handleScheduleWeek = async () => {
    const slotOne = combineDateAndTime(slotOneDate, slotOneTime);
    const slotTwo = combineDateAndTime(slotTwoDate, slotTwoTime);

    if (!slotOne || !slotTwo) {
      toast({
        title: "Missing times",
        description: "Choose both session dates before scheduling the week.",
        variant: "destructive",
      });
      return;
    }

    const weekValidationMessage = getWeekValidationMessage([slotOne, slotTwo]);
    if (weekValidationMessage) {
      toast({
        title: "Invalid week",
        description: weekValidationMessage,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${API_URL}/api/parent/training-sessions/schedule-week`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Johannesburg",
          slots: [
            { scheduledStart: new Date(slotOne).toISOString() },
            { scheduledStart: new Date(slotTwo).toISOString() },
          ],
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to schedule this week's sessions");
      }

      toast({
        title: "Week Scheduled",
        description:
          payload?.createdCount > 0
            ? "Two weekly session times were proposed. Your tutor must confirm both dates before Meet links are created."
            : "Those weekly session times already exist.",
      });

      setSlotOneDate(undefined);
      setSlotOneTime("15:00");
      setSlotTwoDate(undefined);
      setSlotTwoTime("17:00");
      queryClient.invalidateQueries({ queryKey: ["/api/parent/training-sessions"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule this week's sessions.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSession = async (sessionId: string) => {
    setConfirmingSessionId(sessionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${API_URL}/api/parent/training-sessions/respond`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ sessionId, action: "confirm" }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to confirm session");
      }

      toast({
        title: "Session Confirmed",
        description:
          payload?.googleMeetSync === "google_calendar"
            ? "The session is confirmed and the Google Meet link has been attached."
            : payload?.googleMeetError || "The session is confirmed.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/parent/training-sessions"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm session.",
        variant: "destructive",
      });
    } finally {
      setConfirmingSessionId(null);
    }
  };

  const handleAdjustSession = async (sessionId: string) => {
    if (!adjustedTime) {
      toast({
        title: "Missing time",
        description: "Choose a new date and time before sending the adjustment.",
        variant: "destructive",
      });
      return;
    }

    const weekValidationMessage = getWeekValidationMessage([adjustedTime, adjustedTime]);
    if (weekValidationMessage) {
      toast({
        title: "Invalid date",
        description: weekValidationMessage,
        variant: "destructive",
      });
      return;
    }

    setAdjustingSessionId(sessionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${API_URL}/api/parent/training-sessions/respond`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          sessionId,
          action: "reschedule",
          scheduledStart: new Date(adjustedTime).toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Johannesburg",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to adjust session");
      }

      toast({
        title: "Session Updated",
        description: "The new time was sent back to the tutor for confirmation.",
      });

      setAdjustedTime("");
      setAdjustingSessionId(null);
      setEditingSessionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/parent/training-sessions"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to adjust session.",
        variant: "destructive",
      });
      setAdjustingSessionId(null);
    }
  };

  const sessions = data?.sessions || [];
  const schedulingEnabled = data?.sessionSchedulingEnabled ?? true;
  const actionableSessions = sessions.filter(
    (session) => !["completed", "cancelled", "flagged"].includes(String(session.status || "")),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-3xl font-bold">Sessions</h1>
      </div>

      {!schedulingEnabled ? (
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-base font-semibold text-foreground">Live session booking is disabled</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your assigned tutor is currently in TT training mode, so Google Meet scheduling is off for now. Training is being run directly inside TT instead of through booked lesson windows.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:gap-6">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base sm:text-xl font-semibold">Schedule This Week</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose two Monday-to-Saturday training session times in the same week. Your tutor must confirm both dates before TT creates the Meet links.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border p-3">
              <label className="text-sm font-medium">Session 1</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formatScheduleLabel(slotOneDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={slotOneDate}
                    onSelect={setSlotOneDate}
                    disabled={(date) => {
                      const day = date.getDay();
                      return day < 1 || day > 6 || date < new Date(new Date().setHours(0, 0, 0, 0));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input type="time" value={slotOneTime} onChange={(e) => setSlotOneTime(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                {slotOneDate ? `${formatScheduleLabel(slotOneDate)} at ${slotOneTime}` : "Pick a Monday-Saturday date and time."}
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-3">
              <label className="text-sm font-medium">Session 2</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formatScheduleLabel(slotTwoDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={slotTwoDate}
                    onSelect={setSlotTwoDate}
                    disabled={(date) => {
                      const day = date.getDay();
                      return day < 1 || day > 6 || date < new Date(new Date().setHours(0, 0, 0, 0));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input type="time" value={slotTwoTime} onChange={(e) => setSlotTwoTime(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                {slotTwoDate ? `${formatScheduleLabel(slotTwoDate)} at ${slotTwoTime}` : "Pick a Monday-Saturday date and time."}
              </p>
            </div>
          </div>

          <Button onClick={handleScheduleWeek} disabled={isSubmitting || !schedulingEnabled}>
            {!schedulingEnabled ? "Scheduling Disabled" : isSubmitting ? "Scheduling..." : "Schedule Week"}
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Upcoming Sessions</h2>
          {sessionsLoading ? (
            <p className="text-sm sm:text-base text-muted-foreground">Loading sessions...</p>
          ) : actionableSessions.length === 0 ? (
            <p className="text-sm sm:text-base text-muted-foreground">No sessions scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {actionableSessions.map((session) => (
                <div key={session.id} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">TT Training Session</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSessionDateTime(session.scheduled_time)}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {String(session.status || "").replaceAll("_", " ")}
                    </span>
                  </div>

                  {session.status === "pending_tutor_confirmation" ? (
                    <p className="text-sm text-blue-700">
                      Waiting for tutor confirmation. Meet link will only appear after both parties confirm this date.
                    </p>
                  ) : null}

                  {session.status === "pending_parent_confirmation" ? (
                    <div className="space-y-2">
                      <p className="text-sm text-amber-700">
                        Waiting for your confirmation.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmSession(session.id)}
                          disabled={confirmingSessionId === session.id || adjustingSessionId === session.id}
                        >
                          {confirmingSessionId === session.id ? "Confirming..." : "Confirm Session"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSessionId((current) => current === session.id ? null : session.id);
                            setAdjustedTime(new Date(session.scheduled_time).toISOString().slice(0, 16));
                          }}
                          disabled={adjustingSessionId === session.id}
                        >
                          Adjust Time
                        </Button>
                      </div>
                      {editingSessionId === session.id ? (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
                          <Input
                            type="datetime-local"
                            value={adjustedTime}
                            onChange={(e) => setAdjustedTime(e.target.value)}
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustSession(session.id)}
                              disabled={adjustingSessionId === session.id}
                            >
                              {adjustingSessionId === session.id ? "Sending..." : "Send New Time"}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {["confirmed", "ready", "live"].includes(String(session.status || "")) ? (
                    <div className="space-y-1">
                      <p className="text-sm text-green-700">Session confirmed.</p>
                      {session.google_meet_url ? (
                        <a
                          href={session.google_meet_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-sm text-primary underline underline-offset-2"
                        >
                          Join Google Meet
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Meet link pending calendar sync.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
