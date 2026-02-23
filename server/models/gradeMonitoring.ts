// Grade Monitoring & Academic Compliance System - Data Model
// This is a TypeScript interface draft for backend models

export interface Tutor {
  id: string;
  name: string;
  school: string;
  academicYear: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
}

export interface Subject {
  id: string;
  tutorId: string;
  name: string;
  status: 'active' | 'discontinued';
  createdBy: 'tutor' | 'coo';
  createdAt: string;
  updatedAt: string;
  auditLog: AuditLogEntry[];
}

export interface GradeSubmission {
  id: string;
  tutorId: string;
  quarter: number;
  overallAverage: number;
  reportImageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  auditLog: AuditLogEntry[];
  subjectGrades: SubjectGrade[];
}

export interface SubjectGrade {
  id: string;
  gradeSubmissionId: string;
  subjectId: string;
  percentage: number;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'subject' | 'gradeSubmission' | 'tutor';
  entityId: string;
  action: string;
  actorId: string;
  timestamp: string;
  reason: string;
}

export interface SubjectChangeRequest {
  id: string;
  tutorId: string;
  requestedAt: string;
  reason: string;
  effectiveDate: string;
  updatedReportUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  auditLog: AuditLogEntry[];
}
