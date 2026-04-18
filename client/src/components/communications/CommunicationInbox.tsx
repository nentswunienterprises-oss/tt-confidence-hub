import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (messages.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
        <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
        <p>No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const own = message.senderRole === selfRole;
        return (
          <div
            key={message.id}
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
              own
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            <div className="mb-1 flex items-center justify-between gap-3 text-[11px] opacity-80">
              <span className="font-medium">{message.senderName}</span>
              <span>{formatTimestamp(message.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
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
  updatesContent,
}: {
  audience: "parent" | "student";
  title: string;
  description: string;
  queryKey: string[];
  getPath: string;
  postPath: string;
  updatesContent?: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data, isLoading } = useQuery<CommunicationInboxResponse>({
    queryKey,
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
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="updates">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>
                {isLoading || !data
                  ? "Loading..."
                  : `${data.student.name}${data.student.grade ? ` • ${data.student.grade}` : ""}`}
              </CardTitle>
              <CardDescription>
                {isLoading || !data
                  ? "Loading communication thread."
                  : `Your TT communication with ${data.tutor?.name || "the tutor"} stays inside the platform.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border/60 p-4">
                {isLoading || !data ? (
                  <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                    Loading messages...
                  </div>
                ) : (
                  <MessageList messages={data.thread.messages || []} selfRole={audience} />
                )}
              </div>
              <div className="space-y-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Send a message through TT..."
                  className="min-h-[96px]"
                  disabled={sendMessage.isPending}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => sendMessage.mutate(draft.trim())}
                    disabled={!draft.trim() || sendMessage.isPending}
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

        <TabsContent value="updates">
          {updatesContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
