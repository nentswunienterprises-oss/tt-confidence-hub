import { CommunicationInbox } from "@/components/communications/CommunicationInbox";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";

export default function ParentUpdates() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <CommunicationInbox
        audience="parent"
        title="Parent Inbox"
        description="Messaging with your tutor and TT platform updates live in one place."
        queryKey={["/api/parent/communications"]}
        getPath="/api/parent/communications"
        postPath="/api/parent/communications"
        updatesContent={
          <NotificationInbox
            title="Updates"
            description="Action-required items and informational notifications for parents."
            emptyMessage="No notifications yet. You'll see action-required and informational updates here."
          />
        }
      />
    </div>
  );
}
