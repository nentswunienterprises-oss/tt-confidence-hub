import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send } from "lucide-react";

type Audience = "parent" | "student";

interface CommunicationMessage {
  id: string;
  senderRole: "tutor" | "parent" | "student" | string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface CommunicationThread {
  threadId: string;
  audience: Audience;
  messages: CommunicationMessage[];
}

interface CommunicationBundle {
  student: { id: string; name: string; grade: string | null };
  parent: { id: string | null; name: string; available: boolean };
  tutor: { id: string; name: string } | null;
  threads: Record<Audience, CommunicationThread>;
}

interface StudentCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  apiBasePath?: string;
  readOnly?: boolean;
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

function ThreadPanel({
  title,
  description,
  messages,
  composerValue,
  onComposerChange,
  onSend,
  isSending,
  readOnly,
  disabled,
}: {
  title: string;
  description: string;
  messages: CommunicationMessage[];
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  readOnly: boolean;
  disabled?: boolean;
}) {
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  return (
    <Card className="flex h-[68vh] min-h-[440px] flex-col overflow-hidden border border-border/60 bg-background shadow-sm">
      <div className="border-b border-border/60 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div ref={messagesRef} className="flex-1 overflow-y-auto bg-muted/10 px-3 py-4 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
            <p>No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isTutor = message.senderRole === "tutor";

              return (
                <div
                  key={message.id}
                  className={`flex ${isTutor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[75%] ${
                      isTutor
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-background text-foreground"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-[11px] opacity-80">
                      <span className="font-medium">{message.senderName}</span>
                      <span>{formatTimestamp(message.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 bg-background px-3 py-3 sm:px-5">
        {readOnly ? (
          <p className="text-xs text-muted-foreground">Read-only COO view.</p>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={composerValue}
              onChange={(e) => onComposerChange(e.target.value)}
              placeholder={`Type a message for ${title.toLowerCase()}...`}
              className="min-h-[88px] resize-none"
              disabled={disabled || isSending}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Communication stays inside TT.
              </p>
              <Button
                onClick={onSend}
                disabled={disabled || isSending || !composerValue.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function StudentCommunicationDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  apiBasePath = "/api/tutor",
  readOnly = false,
}: StudentCommunicationDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Audience>("parent");
  const [drafts, setDrafts] = useState<Record<Audience, string>>({
    parent: "",
    student: "",
  });

  const queryKey = useMemo(
    () => [apiBasePath, "students", studentId, "communications"],
    [apiBasePath, studentId]
  );

  const { data, isLoading, error } = useQuery<CommunicationBundle>({
    queryKey,
    enabled: open && !!studentId,
    queryFn: async () => {
      const res = await apiRequest("GET", `${apiBasePath}/students/${studentId}/communications`);
      return res.json();
    },
  });

  useEffect(() => {
    if (open) {
      setActiveTab("parent");
    }
  }, [open, studentId]);

  const sendMessage = useMutation({
    mutationFn: async ({ audience, message }: { audience: Audience; message: string }) => {
      const res = await apiRequest("POST", `${apiBasePath}/students/${studentId}/communications`, {
        audience,
        message,
      });
      return res.json();
    },
    onSuccess: (_data, variables) => {
      setDrafts((current) => ({ ...current, [variables.audience]: "" }));
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const parentThread = data?.threads.parent;
  const studentThread = data?.threads.student;
  const parentUnavailable = data?.parent ? !data.parent.available : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border/60 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            TT Communication
          </p>
          <DialogTitle>{studentName}</DialogTitle>
          <DialogDescription>
            Parent and student messaging stays inside Territorial Tutoring.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center text-sm text-muted-foreground">
            Loading communication threads...
          </div>
        ) : error || !data ? (
          <div className="flex min-h-[420px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Unable to load communication threads. If this feature was just deployed, the database migration may still need to be run."}
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as Audience)}
            className="p-3 sm:p-4"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1 gap-1">
              <TabsTrigger value="parent" className="text-xs sm:text-sm py-2 px-2">
                Parent
              </TabsTrigger>
              <TabsTrigger value="student" className="text-xs sm:text-sm py-2 px-2">
                Student
              </TabsTrigger>
            </TabsList>

            <TabsContent value="parent" className="mt-4">
              <ThreadPanel
                title="Parent Chat"
                description={
                  parentUnavailable
                    ? "No parent account is currently linked to this student."
                    : `Messaging ${data.parent.name}`
                }
                messages={parentThread?.messages || []}
                composerValue={drafts.parent}
                onComposerChange={(value) => setDrafts((current) => ({ ...current, parent: value }))}
                onSend={() =>
                  sendMessage.mutate({ audience: "parent", message: drafts.parent.trim() })
                }
                isSending={sendMessage.isPending && sendMessage.variables?.audience === "parent"}
                readOnly={readOnly}
                disabled={parentUnavailable}
              />
            </TabsContent>

            <TabsContent value="student" className="mt-4">
              <ThreadPanel
                title="Student Chat"
                description="Direct TT communication with the student."
                messages={studentThread?.messages || []}
                composerValue={drafts.student}
                onComposerChange={(value) =>
                  setDrafts((current) => ({ ...current, student: value }))
                }
                onSend={() =>
                  sendMessage.mutate({ audience: "student", message: drafts.student.trim() })
                }
                isSending={sendMessage.isPending && sendMessage.variables?.audience === "student"}
                readOnly={readOnly}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
