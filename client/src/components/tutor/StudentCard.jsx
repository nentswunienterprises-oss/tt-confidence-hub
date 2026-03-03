import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { useIntroSessionStatus } from "@/hooks/useIntroSessionStatus";
import React from "react";
import { TutorIntroSessionActions } from "./TutorIntroSessionActions";
export function StudentCard(_a) {
    var student = _a.student, studentIdentitySheets = _a.studentIdentitySheets, setSelectedStudentId = _a.setSelectedStudentId, setSelectedStudentName = _a.setSelectedStudentName, setIdentitySheetOpen = _a.setIdentitySheetOpen, setTrackingDialogOpen = _a.setTrackingDialogOpen, setAssignmentsDialogOpen = _a.setAssignmentsDialogOpen;
    var sessionProgress = student.sessionProgress || 0;
    var confidenceLevel = student.confidenceScore || 0;
    var initials = student.name
        .split(" ")
        .map(function (n) { return n[0]; })
        .join("")
        .toUpperCase()
        .slice(0, 2);
    var introSessionStatus = useIntroSessionStatus(student.id).data;
    var showResources = (introSessionStatus === null || introSessionStatus === void 0 ? void 0 : introSessionStatus.status) === "confirmed";
    return (<div className="p-6 border shadow-sm hover-elevate card">
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarFallback className="bg-accent text-foreground font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{student.name}</h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{student.grade}</span>
          </div>
          {student.parentInfo && (<div className="mt-2 text-sm">
              <p className="text-muted-foreground">Parent: <span className="font-medium text-foreground">{student.parentInfo.parent_full_name}</span></p>
              <p className="text-muted-foreground text-xs">{student.parentInfo.parent_email}</p>
            </div>)}
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Session Progress</span>
            <span className="font-semibold text-primary">
              {sessionProgress} of 16 completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full progress-gradient transition-all duration-300" style={{ width: "".concat((sessionProgress / 16) * 100, "%") }}/>
          </div>
          <p className="text-xs text-muted-foreground">
            {16 - sessionProgress} sessions remaining
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Confidence Level</span>
            <span className="font-semibold text-primary">
              {confidenceLevel.toFixed(0)}/10
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground transition-all duration-300" style={{ width: "".concat((confidenceLevel / 10) * 100, "%") }}/>
          </div>
        </div>
        {/* Show session proposal and actions if not confirmed */}
        {!showResources && (<TutorIntroSessionActions studentId={student.id}/>)}
        {showResources ? (<div className="pt-4 border-t space-y-2">
            <Button className="w-full" variant="outline" size="sm" onClick={function () {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setIdentitySheetOpen(true);
            }}>
              <FileText className="w-4 h-4 mr-2"/>
              {studentIdentitySheets[student.id] ? "View Identity Sheet" : "Log Identity Sheet"}
            </Button>
            <Button className="w-full" variant="outline" size="sm" onClick={function () {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setTrackingDialogOpen(true);
            }}>
              <Calendar className="w-4 h-4 mr-2"/>
              View Tracking Systems
            </Button>
            <Button className="w-full" variant="outline" size="sm" onClick={function () {
                setSelectedStudentId(student.id);
                setSelectedStudentName(student.name);
                setAssignmentsDialogOpen(true);
            }}>
              <FileText className="w-4 h-4 mr-2"/>
              View Assignments
            </Button>
          </div>) : (<div className="pt-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Resources will unlock after the student's intro session is confirmed.
            </p>
          </div>)}
      </div>
    </div>);
}
