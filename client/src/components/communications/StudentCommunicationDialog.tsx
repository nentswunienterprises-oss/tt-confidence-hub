import { useMemo, useState } from "react";
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

function ThreadColumn({
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
  return (
    <Card className="flex min-h-[520px] flex-col border-border/60">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isTutor = message.senderRole === "tutor";
            return (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
                  isTutor
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
          })
        )}
      </div>
      <div className="border-t border-border/60 px-4 py-4">
        {readOnly ? (
          <p className="text-xs text-muted-foreground">Read-only COO view.</p>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={composerValue}
              onChange={(e) => onComposerChange(e.target.value)}
              placeholder={`Message ${title.toLowerCase()}...`}
              className="min-h-[96px]"
              disabled={disabled || isSending}
            />
            <div className="flex justify-end">
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
  const [drafts, setDrafts] = useState<Record<Audience, string>>({
    parent: "",
    student: "",
  });

  const queryKey = useMemo(
    () => [apiBasePath, "students", studentId, "communications"],
    [apiBasePath, studentId]
  );

  const { data, isLoading } = useQuery<CommunicationBundle>({
    queryKey,
    enabled: open && !!studentId,
    queryFn: async () => {
      const res = await apiRequest("GET", `${apiBasePath}/students/${studentId}/communications`);
      return res.json();
    },
  });

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
      <DialogContent className="max-w-6xl p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>Communication</DialogTitle>
          <DialogDescription>
            TT-managed messaging for {studentName}. Tutor-to-parent and tutor-to-student communication stays inside the platform.
          </DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="flex min-h-[420px] items-center justify-center text-sm text-muted-foreground">
            Loading communication threads...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
            <ThreadColumn
              title="Parent Thread"
              description={parentUnavailable ? "No parent account is currently linked to this student." : `Messaging ${data.parent.name}`}
              messages={parentThread?.messages || []}
              composerValue={drafts.parent}
              onComposerChange={(value) => setDrafts((current) => ({ ...current, parent: value }))}
              onSend={() => sendMessage.mutate({ audience: "parent", message: drafts.parent.trim() })}
              isSending={sendMessage.isPending && sendMessage.variables?.audience === "parent"}
              readOnly={readOnly}
              disabled={parentUnavailable}
            />
            <ThreadColumn
              title="Student Thread"
              description="Direct TT communication with the student."
              messages={studentThread?.messages || []}
              composerValue={drafts.student}
              onComposerChange={(value) => setDrafts((current) => ({ ...current, student: value }))}
              onSend={() => sendMessage.mutate({ audience: "student", message: drafts.student.trim() })}
              isSending={sendMessage.isPending && sendMessage.variables?.audience === "student"}
              readOnly={readOnly}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
