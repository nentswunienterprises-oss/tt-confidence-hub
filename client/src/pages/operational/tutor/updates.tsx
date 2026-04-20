import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";
import StudentCommunicationDialog from "@/components/communications/StudentCommunicationDialog";

function TutorCommunicationRow({
  student,
  onOpen,
}: {
  student: any;
  onOpen: () => void;
}) {
  const workflow = student?.workflow || {};
  const isActive = !!workflow?.proposalAccepted;

  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ["/api/tutor/students", student.id, "communications", "unread-count"],
    enabled: !!student?.id && isActive,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/tutor/students/${student.id}/communications/unread-count`
      );
      return res.json();
    },
    refetchInterval: 30000,
  });

  const unreadCount = Number(unreadData?.unreadCount || 0);

  return (
    <Card className="border-primary/15 bg-background shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{student.name}</p>
            {student.grade && (
              <Badge variant="secondary" className="text-[10px]">
                {student.grade}
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isActive
              ? "Open the TT communication thread for this student."
              : "Communication becomes available after active training starts."}
          </p>
        </div>
        <Button onClick={onOpen} disabled={!isActive}>
          Open
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TutorUpdates() {
  const [activeTab, setActiveTab] = useState<"messages" | "updates">("messages");
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");

  const { data: podData } = useQuery<any>({
    queryKey: ["/api/tutor/pod"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tutor/pod");
      return res.json();
    },
  });

  const communicationStudents = useMemo(
    () =>
      ((podData?.students as any[]) || []).filter(
        (student) => student?.workflow?.proposalAccepted
      ),
    [podData]
  );

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "messages" | "updates")}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto rounded-xl border border-primary/15 bg-muted/20 p-1 gap-1">
          <TabsTrigger value="messages" className="text-xs sm:text-sm py-2 px-2">
            Messages
          </TabsTrigger>
          <TabsTrigger value="updates" className="text-xs sm:text-sm py-2 px-2">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Tutor Inbox</h1>
              <p className="text-muted-foreground">
                Open TT communication threads for your active students.
              </p>
            </div>

            {communicationStudents.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <Users className="mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm font-medium text-foreground">No active communication threads yet.</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Once a student is in active training, their TT communication thread will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {communicationStudents.map((student) => (
                  <TutorCommunicationRow
                    key={student.id}
                    student={student}
                    onOpen={() => {
                      setSelectedStudentId(student.id);
                      setSelectedStudentName(student.name || "Student");
                      setCommunicationDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="updates">
          <NotificationInbox
            title="Updates"
            description="Action-required items and informational notifications for tutors."
            emptyMessage="No notifications yet. You'll see action-required and informational updates here."
          />
        </TabsContent>
      </Tabs>

      <StudentCommunicationDialog
        open={communicationDialogOpen}
        onOpenChange={setCommunicationDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
      />
    </div>
  );
}
