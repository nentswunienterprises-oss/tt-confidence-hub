import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send } from "lucide-react";

interface CommunicationMessage {
  id: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface CommunicationInboxResponse {
  student: { id: string; name: string; grade: string | null };
  tutor: { id: string; name: string } | null;
  parent?: { id: string | null; name: string; available: boolean };
  thread: {
    threadId: string;
    audience: "parent" | "student";
    messages: CommunicationMessage[];
  };
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessageList({
  messages,
  selfRole,
}: {
  messages: CommunicationMessage[];
  selfRole: "parent" | "student";
}) {
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
        <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
        <p>No messages yet.</p>
      </div>
    );
  }

  return (
    <div ref={messagesRef} className="space-y-3">
      {messages.map((message) => {
        const own = message.senderRole === selfRole;
        return (
          <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[75%] ${
                own
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-background text-foreground"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-[11px] opacity-80">
                <span className="font-medium">{message.senderName}</span>
                <span>{formatTimestamp(message.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap break-words">{message.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CommunicationInbox({
  audience,
  title,
  description,
  queryKey,
  getPath,
  postPath,
  unreadCountPath,
  updatesContent,
}: {
  audience: "parent" | "student";
  title: string;
  description: string;
  queryKey: string[];
  getPath: string;
  postPath: string;
  unreadCountPath?: string;
  updatesContent?: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"messages" | "updates">(
    updatesContent ? "updates" : "messages"
  );
  const [draft, setDraft] = useState("");
  const unreadCountQueryKey = useMemo(
    () => (unreadCountPath ? [unreadCountPath] : []),
    [unreadCountPath]
  );

  const { data: unreadCountData } = useQuery<{ unreadCount: number }>({
    queryKey: unreadCountQueryKey,
    enabled: !!unreadCountPath,
    queryFn: async () => {
      const res = await apiRequest("GET", unreadCountPath!);
      return res.json();
    },
    refetchInterval: 15000,
  });

  const unreadCount = Number(unreadCountData?.unreadCount || 0);

  const { data, isLoading, error } = useQuery<CommunicationInboxResponse>({
    queryKey,
    enabled: activeTab === "messages",
    queryFn: async () => {
      const res = await apiRequest("GET", getPath);
      return res.json();
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", postPath, { message, audience });
      return res.json();
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey });
      if (unreadCountPath) {
        queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
      }
    },
  });

  useEffect(() => {
    if (activeTab === "messages") {
      queryClient.invalidateQueries({ queryKey });
    }
    if (activeTab === "messages" && unreadCountPath) {
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
    }
  }, [activeTab, queryClient, queryKey, unreadCountPath, unreadCountQueryKey]);

  useEffect(() => {
    if (activeTab === "messages" && data && unreadCountPath) {
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
    }
  }, [activeTab, data, queryClient, unreadCountPath, unreadCountQueryKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "messages" | "updates")}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1 gap-1">
          <TabsTrigger
            value="messages"
            className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-2"
          >
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="updates" className="text-xs sm:text-sm py-2 px-2">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>
                {isLoading
                  ? "Loading..."
                  : error
                    ? "Messages unavailable"
                    : !data
                      ? "Messages"
                      : `${data.student.name}${data.student.grade ? ` - ${data.student.grade}` : ""}`}
              </CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading communication thread."
                  : error
                    ? error instanceof Error
                      ? error.message
                      : "Unable to load the TT communication thread."
                    : !data
                      ? "Open this tab to view your TT communication thread."
                      : `Your TT communication with ${data.tutor?.name || "the tutor"} stays inside the platform.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border/60 bg-muted/10 p-4">
                {activeTab !== "messages" ? (
                  <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                    Open Messages to view your TT thread.
                  </div>
                ) : isLoading ? (
                  <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                    Loading messages...
                  </div>
                ) : error ? (
                  <div className="flex min-h-[220px] items-center justify-center text-center text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Unable to load messages."}
                  </div>
                ) : (
                  <MessageList messages={data?.thread.messages || []} selfRole={audience} />
                )}
              </div>
              <div className="space-y-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Send a message through TT..."
                  className="min-h-[96px] resize-none"
                  disabled={sendMessage.isPending || activeTab !== "messages" || !!error}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Tutor communication stays inside TT.
                  </p>
                  <Button
                    onClick={() => sendMessage.mutate(draft.trim())}
                    disabled={!draft.trim() || sendMessage.isPending || activeTab !== "messages" || !!error}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendMessage.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">{updatesContent}</TabsContent>
      </Tabs>
    </div>
  );
}
