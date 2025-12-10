import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, Phone, MapPin, BookOpen } from "lucide-react";
import { format } from "date-fns";
import AssignTutorModal from "@/components/executive/AssignTutorModal";

interface ParentEnrollment {
  id: string;
  user_id: string;
  parent_full_name: string;
  parent_email: string;
  parent_phone: string;
  parent_city: string;
  student_full_name: string;
  student_grade: string;
  school_name: string;
  math_struggle_areas: string;
  previous_tutoring: string;
  confidence_level: string;
  internet_access: string;
  parent_motivation?: string;
  status: "not_enrolled" | "awaiting_assignment" | "assigned" | "session_booked" | "report_received" | "confirmed";
  current_step?: string;
  created_at: string;
}

export default function ExecutiveHRTraffic() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [assignTutorOpen, setAssignTutorOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");

  // Fetch all parent enrollments - refetch every 5 seconds
  const { data: enrollments = [], isLoading } = useQuery<ParentEnrollment[]>({
    queryKey: ["/api/hr/enrollments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Filter enrollments by status
  const awaitingAssignment = enrollments.filter((e: ParentEnrollment) => e.status === "awaiting_assignment");
  const assigned = enrollments.filter((e: ParentEnrollment) => e.status === "assigned");
  const confirmed = enrollments.filter((e: ParentEnrollment) => e.status === "confirmed");

  const handleOpenAssignModal = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setAssignTutorOpen(true);
  };

  const handleTutorAssigned = () => {
    // Refetch enrollments after assignment
    queryClient.invalidateQueries({ queryKey: ["/api/hr/enrollments"] });
  };

  const getStatusBadge = (status: ParentEnrollment["status"]) => {
    const statusConfig = {
      awaiting_assignment: { label: "Awaiting Assignment", color: "bg-yellow-100 text-yellow-800" },
      assigned: { label: "Assigned", color: "bg-blue-100 text-blue-800" },
      session_booked: { label: "Session Booked", color: "bg-purple-100 text-purple-800" },
      report_received: { label: "Report Received", color: "bg-orange-100 text-orange-800" },
      confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
      not_enrolled: { label: "Not Enrolled", color: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const EnrollmentCard = ({ enrollment }: { enrollment: ParentEnrollment }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{enrollment.student_full_name}</CardTitle>
            <CardDescription>
              Parent: {enrollment.parent_full_name}
            </CardDescription>
          </div>
          {getStatusBadge(enrollment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{enrollment.parent_email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{enrollment.parent_phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{enrollment.parent_city}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Grade</p>
              <p className="font-medium">{enrollment.student_grade}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">School</p>
            <p className="font-medium">{enrollment.school_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Math Struggle Areas</p>
            <p className="font-medium">{enrollment.math_struggle_areas || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Previous Tutoring</p>
            <p className="font-medium">{enrollment.previous_tutoring || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Confidence Level</p>
            <p className="font-medium">{enrollment.confidence_level || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Internet Access</p>
            <p className="font-medium">{enrollment.internet_access || "Not provided"}</p>
          </div>
          {enrollment.parent_motivation && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Parent Motivation</p>
              <p className="font-medium">{enrollment.parent_motivation}</p>
            </div>
          )}
          <div className="pt-2 border-t">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Submitted</p>
            <p className="text-xs">{format(new Date(enrollment.created_at), "PPp")}</p>
          </div>
        </div>

        {enrollment.status === "awaiting_assignment" && (
          <Button 
            className="w-full mt-4"
            onClick={() => handleOpenAssignModal(enrollment.id)}
          >
            Assign Tutor
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Parent Enrollment Traffic</h1>
        <p className="text-muted-foreground">Track all parent enrollments through the pipeline</p>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading enrollments...</p>
        </Card>
      ) : enrollments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">No enrollments yet</p>
        </Card>
      ) : (
        <>
          {/* Awaiting Assignment */}
          {awaitingAssignment.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <h2 className="text-xl font-semibold">Awaiting Assignment ({awaitingAssignment.length})</h2>
              </div>
              <div className="grid gap-4">
                {awaitingAssignment.map((enrollment: ParentEnrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </div>
          )}

          {/* Assigned */}
          {assigned.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h2 className="text-xl font-semibold">Assigned ({assigned.length})</h2>
              </div>
              <div className="grid gap-4">
                {assigned.map((enrollment: ParentEnrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </div>
          )}

          {/* Confirmed */}
          {confirmed.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h2 className="text-xl font-semibold">Confirmed ({confirmed.length})</h2>
              </div>
              <div className="grid gap-4">
                {confirmed.map((enrollment: ParentEnrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AssignTutorModal
        open={assignTutorOpen}
        onOpenChange={setAssignTutorOpen}
        enrollmentId={selectedEnrollmentId}
        onAssigned={handleTutorAssigned}
      />
    </div>
  );
}

