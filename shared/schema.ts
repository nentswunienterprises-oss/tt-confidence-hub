import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  real,
  serial,
  bigint,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// ENUMS
// ============================================

// Client Portal: parent, student
// Affiliate Portal: affiliate, od (outreach director)
// Operational Portal: tutor, td (territory director)
// Executive Portal: coo, hr, ceo
export const roleEnum = pgEnum("role", [
  "parent",
  "student",
  "tutor",
  "td",
  "affiliate",
  "od",
  "coo",
  "hr",
  "ceo",
]);
export const podTypeEnum = pgEnum("pod_type", ["training", "paid"]);
export const vehicleEnum = pgEnum("vehicle", ["4_seater", "5_seater", "6_seater"]);
export const phaseEnum = pgEnum("phase", ["foundation", "scale_test"]);
export const podStatusEnum = pgEnum("pod_status", ["active", "completed"]);
export const certificationStatusEnum = pgEnum("certification_status", [
  "pending",
  "passed",
  "failed",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);
export const visibilityEnum = pgEnum("visibility", ["all", "tds", "tutors", "parents", "students", "affiliates", "od", "hr", "ceo"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "not_enrolled",
  "awaiting_assignment",
  "assigned",
  "proposal_sent",
  "session_booked",
  "report_received",
  "confirmed",
]);
export const reportTypeEnum = pgEnum("report_type", ["weekly", "monthly"]);

// ============================================
// SESSION STORAGE (Required for Replit Auth)
// ============================================

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// ============================================
// USERS TABLE
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Supabase auth fields
  password: varchar("password"), // Hashed password (optional - Supabase handles auth)
  
  // TT-specific fields
  role: roleEnum("role").notNull().default("tutor"),
  name: varchar("name").notNull(),
  grade: varchar("grade"), // For tutors only
  school: varchar("school"), // For tutors only
  verified: boolean("verified").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  name: true,
  role: true,
  grade: true,
  school: true,
});

// ============================================
// PODS TABLE
// ============================================

export const pods = pgTable("pods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podName: varchar("pod_name").notNull(),
  podType: podTypeEnum("pod_type").notNull().default("training"),
  vehicle: vehicleEnum("vehicle").notNull().default("4_seater"),
  phase: phaseEnum("phase").notNull().default("foundation"),
  tdId: varchar("td_id").references(() => users.id),
  status: podStatusEnum("status").notNull().default("active"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Pod = typeof pods.$inferSelect;
export type InsertPod = typeof pods.$inferInsert;

export const insertPodSchema = createInsertSchema(pods).omit({
  id: true,
  createdAt: true,
});

// ============================================
// TUTOR ASSIGNMENTS TABLE
// ============================================

export const tutorAssignments = pgTable("tutor_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  podId: varchar("pod_id")
    .notNull()
    .references(() => pods.id),
  studentCount: integer("student_count").notNull().default(1),
  certificationStatus: certificationStatusEnum("certification_status")
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TutorAssignment = typeof tutorAssignments.$inferSelect;
export type InsertTutorAssignment = typeof tutorAssignments.$inferInsert;

export const insertTutorAssignmentSchema = createInsertSchema(
  tutorAssignments
).omit({
  id: true,
  createdAt: true,
});

// ============================================
// STUDENTS TABLE
// ============================================

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  grade: varchar("grade").notNull(),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  sessionProgress: integer("session_progress").notNull().default(0),
  conceptMastery: jsonb("concept_mastery"),
  confidenceScore: real("confidence_score"),
  parentContact: varchar("parent_contact"),
  personalProfile: jsonb("personal_profile"),
  emotionalInsights: jsonb("emotional_insights"),
  academicDiagnosis: jsonb("academic_diagnosis"),
  identitySheet: jsonb("identity_sheet"),
  identitySheetCompletedAt: timestamp("identity_sheet_completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  sessionProgress: true,
});

// ============================================
// SESSIONS TABLE
// ============================================

export const sessionsTable = pgTable("tutoring_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  notes: text("notes"),
  
  // 3-Layer Lens Teaching Model fields
  vocabularyNotes: text("vocabulary_notes"), // Vocabulary layer notes
  methodNotes: text("method_notes"), // Method layer notes
  reasonNotes: text("reason_notes"), // Reason layer notes
  studentResponse: text("student_response"), // How student responded to session
  confidenceChange: integer("confidence_change"), // Scale 1-5 for + or -
  tutorGrowthReflection: text("tutor_growth_reflection"), // Tutor's reflection/notes
  bossBattlesDone: text("boss_battles_done"), // Boss battles done in session
  practiceProblems: text("practice_problems"), // Practice problems assigned
  
  confidenceScoreDelta: real("confidence_score_delta"), // Legacy field
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
  createdAt: true,
});

// ============================================
// REFLECTIONS TABLE
// ============================================

export const reflections = pgTable("reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  reflectionText: text("reflection_text").notNull(),
  habitScore: integer("habit_score"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Reflection = typeof reflections.$inferSelect;
export type InsertReflection = typeof reflections.$inferInsert;

export const insertReflectionSchema = createInsertSchema(reflections).omit({
  id: true,
  createdAt: true,
});

// ============================================
// WEEKLY CHECK-INS TABLE (Tutor Weekly Reports)
// ============================================

export const weeklyCheckIns = pgTable("weekly_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  podId: varchar("pod_id")
    .notNull()
    .references(() => pods.id),
  weekStartDate: timestamp("week_start_date").notNull(), // Start of the week
  sessionsSummary: text("sessions_summary"), // How sessions went this week
  wins: text("wins"), // Wins this week
  challenges: text("challenges"), // Challenges faced
  emotions: text("emotions"), // Emotions felt and thoughts
  skillImprovement: text("skill_improvement"), // Working on improving about student transformation
  helpNeeded: text("help_needed"), // Help needed or questions
  nextWeekGoals: text("next_week_goals"), // Goals for next week
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WeeklyCheckIn = typeof weeklyCheckIns.$inferSelect;
export type InsertWeeklyCheckIn = typeof weeklyCheckIns.$inferInsert;

export const insertWeeklyCheckInSchema = createInsertSchema(weeklyCheckIns).omit({
  id: true,
  submittedAt: true,
  createdAt: true,
}).extend({
  sessionsSummary: z.string().min(1, "Please describe your sessions"),
  wins: z.string().min(1, "Please share your wins"),
  challenges: z.string().min(1, "Please describe challenges"),
  emotions: z.string().min(1, "Please share your emotions and thoughts"),
  skillImprovement: z.string().min(1, "Please describe what you're working on"),
  helpNeeded: z.string().optional(),
  nextWeekGoals: z.string().min(1, "Please set goals for next week"),
});

// ============================================
// ACADEMIC PROFILES TABLE (School Tracker)
// ============================================

export const academicProfiles = pgTable("academic_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id)
    .unique(),
  fullName: varchar("full_name").notNull(),
  grade: varchar("grade").notNull(),
  school: varchar("school"),
  latestTermReport: text("latest_term_report"),
  myThoughts: text("my_thoughts"),
  currentChallenges: text("current_challenges"),
  recentWins: text("recent_wins"),
  upcomingExamsProjects: text("upcoming_exams_projects"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AcademicProfile = typeof academicProfiles.$inferSelect;
export type InsertAcademicProfile = typeof academicProfiles.$inferInsert;

export const insertAcademicProfileSchema = createInsertSchema(
  academicProfiles
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// STRUGGLE TARGETS TABLE (Target Center)
// ============================================

export const struggleTargets = pgTable("struggle_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  subject: varchar("subject").notNull(),
  topicConcept: varchar("topic_concept").notNull(),
  myStruggle: text("my_struggle").notNull(),
  strategy: text("strategy").notNull(),
  consolidationDate: timestamp("consolidation_date"),
  overcame: boolean("overcame").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StruggleTarget = typeof struggleTargets.$inferSelect;
export type InsertStruggleTarget = typeof struggleTargets.$inferInsert;

export const insertStruggleTargetSchema = createInsertSchema(
  struggleTargets
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  overcame: true,
});

// ============================================
// VERIFICATION DOCS TABLE
// ============================================

export const verificationDocs = pgTable("verification_docs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  fileUrlAgreement: varchar("file_url_agreement"),
  fileUrlConsent: varchar("file_url_consent"),
  status: verificationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VerificationDoc = typeof verificationDocs.$inferSelect;
export type InsertVerificationDoc = typeof verificationDocs.$inferInsert;

export const insertVerificationDocSchema = createInsertSchema(
  verificationDocs
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

// ============================================
// TUTOR APPLICATIONS TABLE
// ============================================

export const tutorApplications = pgTable("tutor_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Personal & Environmental Profile
  fullNames: varchar("full_names").notNull(),
  age: integer("age").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  email: varchar("email").notNull(),
  city: varchar("city").notNull(),
  currentStatus: varchar("current_status").notNull(), // High School Student, University Student, etc.
  whoInfluences: text("who_influences"),
  environment: text("environment"),
  
  // Mindset & Mission (stored as JSONB for flexibility)
  mindsetData: jsonb("mindset_data"), // Contains: whyTutor, whatIsConfidenceMentor, resilienceStory, reactionToStudent, beliefInConfidence, pressureWeak, motivationQuote
  
  // Academic Confidence
  gradesEquipped: text("grades_equipped").array().notNull(), // Array of grades: Grade 6, 7, 8, 9
  canExplainClearly: varchar("can_explain_clearly").notNull(), // Yes definitely, I think so, I'd need guidance
  toolConfidence: jsonb("tool_confidence"), // Ratings for Google Meet, OneNote, Screen Sharing
  studentNotImproving: varchar("student_not_improving"), // A/B/C/D choice
  
  // Psychological Fit (stored as JSONB)
  psychologicalData: jsonb("psychological_data"), // Contains: statementHits, feedbackResponse, quitReason, teamMeaning, whatScares
  
  // Vision & Long-term
  visionData: jsonb("vision_data"), // Contains: futurePersonality, earningsUse, studentRemembrance, impactVsScale
  
  // Video Introduction
  videoUrl: varchar("video_url"),
  
  // Availability & Commitment
  bootcampAvailable: varchar("bootcamp_available").notNull(), // Yes, Maybe, No
  commitToTrial: boolean("commit_to_trial").notNull(),
  referralSource: varchar("referral_source"), // School, Friend, Social Media, WhatsApp, Other
  
  // Application Status
  status: applicationStatusEnum("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id), // COO who approved/rejected
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  
  // Onboarding Documents
  trialAgreementUrl: varchar("trial_agreement_url"),
  trialAgreementUploadedAt: timestamp("trial_agreement_uploaded_at"),
  trialAgreementVerified: boolean("trial_agreement_verified").default(false),
  trialAgreementVerifiedBy: varchar("trial_agreement_verified_by").references(() => users.id),
  trialAgreementVerifiedAt: timestamp("trial_agreement_verified_at"),
  parentConsentUrl: varchar("parent_consent_url"),
  parentConsentUploadedAt: timestamp("parent_consent_uploaded_at"),
  parentConsentVerified: boolean("parent_consent_verified").default(false),
  parentConsentVerifiedBy: varchar("parent_consent_verified_by").references(() => users.id),
  parentConsentVerifiedAt: timestamp("parent_consent_verified_at"),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TutorApplication = typeof tutorApplications.$inferSelect;
export type InsertTutorApplication = typeof tutorApplications.$inferInsert;

export const insertTutorApplicationSchema = createInsertSchema(tutorApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
});

// ============================================
// BROADCASTS TABLE
// ============================================

export const broadcasts = pgTable("broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject"),
  message: text("message").notNull(),
  senderRole: roleEnum("sender_role").notNull(),
  visibility: visibilityEnum("visibility").notNull().default("all"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = typeof broadcasts.$inferInsert;

export const insertBroadcastSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  senderRole: z.enum(["parent", "student", "tutor", "td", "affiliate", "od", "coo", "hr", "ceo"]),
  visibility: z.enum(["all", "tds", "tutors", "parents", "students", "affiliates", "od", "hr", "ceo"]),
});

// ============================================
// BROADCAST READS TABLE (Track which broadcasts users have read)
// ============================================

export const broadcastReads = pgTable("broadcast_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  broadcastId: varchar("broadcast_id")
    .notNull()
    .references(() => broadcasts.id),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export type BroadcastRead = typeof broadcastReads.$inferSelect;
export type InsertBroadcastRead = typeof broadcastReads.$inferInsert;

// ============================================
// ROLE AUTHORIZATION (In-Memory)
// ============================================
// Track which emails are authorized for TD/COO roles

export interface RolePermission {
  email: string;
  role: "td" | "coo";
  assignedPodId?: string | null;
}

export const roleAuthorizationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["td", "coo"]),
  assignedPodId: z.string().nullable().optional(),
});

// ============================================
// AFFILIATE PROSPECTING SYSTEM
// ============================================

// Enums for affiliate prospecting
export const encounterStatusEnum = pgEnum("encounter_status", [
  "prospect",
  "objected",
]);

// Affiliate Codes - Unique code for each affiliate to give to parents
export const affiliateCodes = pgTable("affiliate_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id")
    .notNull()
    .references(() => users.id),
  code: varchar("code").notNull().unique(), // e.g., "AFIX001"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AffiliateCode = typeof affiliateCodes.$inferSelect;
export type InsertAffiliateCode = typeof affiliateCodes.$inferInsert;

export const insertAffiliateCodeSchema = createInsertSchema(affiliateCodes).omit({
  id: true,
  createdAt: true,
});

// Encounters - Parent meets affiliate, gets their code
export const encounters = pgTable("encounters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id")
    .notNull()
    .references(() => users.id),
  // Parent Info
  parentName: varchar("parent_name").notNull(),
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  // Child Info
  childName: varchar("child_name"),
  childGrade: varchar("child_grade"),
  // Encounter Properties
  dateMet: timestamp("date_met"),
  contactMethod: varchar("contact_method"), // "phone", "dm", "referral", "school_outreach", etc.
  discoveryOutcome: text("discovery_outcome"), // Parent's pain points
  deliveryNotes: text("delivery_notes"), // How TT's solution was positioned
  finalOutcome: varchar("final_outcome"), // "enrolled", "objected", "follow_up_needed"
  result: text("result"), // What's next
  confidenceRating: integer("confidence_rating"), // 1-5
  myThoughts: text("my_thoughts"), // Self-review: what I did well, what to adjust
  // Legacy
  notes: text("notes"),
  status: encounterStatusEnum("status").notNull().default("prospect"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Encounter = typeof encounters.$inferSelect;
export type InsertEncounter = typeof encounters.$inferInsert;

export const insertEncounterSchema = createInsertSchema(encounters)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    affiliateId: true, // Set by server from session
  })
  .extend({
    parentName: z.string().min(1, "Parent name is required"),
    parentEmail: z.string().email().optional(),
    parentPhone: z.string().optional(),
    dateMet: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    contactMethod: z.string().optional(),
    discoveryOutcome: z.string().optional(),
    deliveryNotes: z.string().optional(),
    finalOutcome: z.string().optional(),
    result: z.string().optional(),
    confidenceRating: z.number().min(1).max(5).optional(),
    myThoughts: z.string().optional(),
  });

// Leads - Parent created account with affiliate's code
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id")
    .notNull()
    .references(() => users.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id)
    .unique(), // One lead per parent
  encounterId: varchar("encounter_id").references(() => encounters.id),
  convertedAt: timestamp("converted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  convertedAt: true,
  createdAt: true,
});

// Closes - Parent committed to tutoring journey (assigned tutor)
export const closes = pgTable("closes", {
  id: serial("id").primaryKey(),
  affiliateId: varchar("affiliate_id")
    .notNull()
    .references(() => users.id),
  parentId: varchar("parent_id").references(() => users.id),
  leadId: bigint("lead_id", { mode: "number" }).references(() => leads.id),
  childId: bigint("child_id", { mode: "number" }).references(() => students.id),
  podAssignmentId: bigint("pod_assignment_id", { mode: "number" }),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  commissionStatus: varchar("commission_status", { length: 50 }).default("pending"),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Close = typeof closes.$inferSelect;
export type InsertClose = typeof closes.$inferInsert;

export const insertCloseSchema = createInsertSchema(closes).omit({
  id: true,
  closedAt: true,
  createdAt: true,
});

// Affiliate Reflections - Reflections on first read of Sales Psychology blueprint
export const affiliateReflections = pgTable("affiliate_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id")
    .notNull()
    .references(() => users.id)
    .unique(), // One set of initial reflections per affiliate
  reflectionText: text("reflection_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AffiliateReflection = typeof affiliateReflections.$inferSelect;
export type InsertAffiliateReflection = typeof affiliateReflections.$inferInsert;

export const insertAffiliateReflectionSchema = createInsertSchema(
  affiliateReflections
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// FUTURE EXPANSION PLACEHOLDERS (6-Seater)
// ============================================
// These fields anticipate 6-Seater + DDAN integration
// but stay dormant in Phase 1

export const futureExpansionFields = pgTable("future_expansion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripePaymentStatus: varchar("stripe_payment_status"),
  affiliateId: varchar("affiliate_id"),
  revenueSplit: jsonb("revenue_split"),
  mplEmWaveId: varchar("mpl_em_wave_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// PARENT ENROLLMENTS TABLE
// ============================================
// Stores parent enrollment applications from gateway

export const parentEnrollments = pgTable("parent_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id")
    .notNull()
    .references(() => users.id),
  // Parent Info
  parentFullName: varchar("parent_full_name").notNull(),
  parentPhone: varchar("parent_phone").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  parentCity: varchar("parent_city").notNull(),
  // Student Info
  studentFullName: varchar("student_full_name").notNull(),
  studentGrade: varchar("student_grade").notNull(),
  schoolName: varchar("school_name").notNull(),
  mathStruggleAreas: text("math_struggle_areas").notNull(),
  // Background
  previousTutoring: varchar("previous_tutoring").notNull(),
  confidenceLevel: varchar("confidence_level").notNull(),
  internetAccess: varchar("internet_access").notNull(),
  parentMotivation: text("parent_motivation"),
  // Assignment tracking
  status: enrollmentStatusEnum("status").notNull().default("awaiting_assignment"),
  assignedTutorId: varchar("assigned_tutor_id").references(() => users.id),
  assignedStudentId: varchar("assigned_student_id").references(() => students.id),
  proposalId: varchar("proposal_id"),
  assignedAt: timestamp("assigned_at"),
  proposalSentAt: timestamp("proposal_sent_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ParentEnrollment = typeof parentEnrollments.$inferSelect;
export type InsertParentEnrollment = typeof parentEnrollments.$inferInsert;

export const insertParentEnrollmentSchema = createInsertSchema(parentEnrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// ONBOARDING PROPOSALS TABLE
// ============================================
// Stores tutor-created parent onboarding proposals

export const onboardingProposals = pgTable("onboarding_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id")
    .notNull()
    .references(() => parentEnrollments.id),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  // Identity & Emotional Profile
  primaryIdentity: varchar("primary_identity"),
  mathRelationship: text("math_relationship"),
  confidenceTriggers: text("confidence_triggers"),
  confidenceKillers: text("confidence_killers"),
  pressureResponse: varchar("pressure_response"),
  growthDrivers: text("growth_drivers"),
  // Academic Diagnosis
  currentTopics: text("current_topics"),
  immediateStruggles: text("immediate_struggles"),
  gapsIdentified: text("gaps_identified"),
  tutorNotes: text("tutor_notes"),
  // Psychological Anchor
  futureIdentity: text("future_identity"),
  wantToRemembered: text("want_to_remembered"),
  hiddenMotivations: text("hidden_motivations"),
  internalConflict: text("internal_conflict"),
  // Recommendation
  recommendedPlan: varchar("recommended_plan").notNull(),
  justification: text("justification").notNull(),
  childWillWin: text("child_will_win"),
  // Metadata
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  viewedCount: integer("viewed_count").notNull().default(0),
  acceptedAt: timestamp("accepted_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  parentCode: varchar("parent_code", { length: 8 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OnboardingProposal = typeof onboardingProposals.$inferSelect;
export type InsertOnboardingProposal = typeof onboardingProposals.$inferInsert;

export const insertOnboardingProposalSchema = createInsertSchema(onboardingProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// STUDENT USERS TABLE (Student Authentication)
// ============================================

export const studentUsers = pgTable("student_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // Hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  studentId: varchar("student_id").references(() => students.id),
  parentCode: varchar("parent_code", { length: 8 }).references(() => onboardingProposals.parentCode),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export type StudentUser = typeof studentUsers.$inferSelect;
export type InsertStudentUser = typeof studentUsers.$inferInsert;

export const insertStudentUserSchema = createInsertSchema(studentUsers).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// ============================================
// STUDENT COMMITMENTS TABLE
// ============================================
// Stores student's goals/habits/commitments

export const studentCommitments = pgTable("student_commitments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  name: varchar("name").notNull(),
  description: text("description"),
  whyCommitment: text("why_commitment"), // Why this commitment matters
  dailyAction: text("daily_action"), // What to do daily
  streakCount: integer("streak_count").notNull().default(0),
  lastCompletedDate: timestamp("last_completed_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StudentCommitment = typeof studentCommitments.$inferSelect;
export type InsertStudentCommitment = typeof studentCommitments.$inferInsert;

export const insertStudentCommitmentSchema = createInsertSchema(studentCommitments).omit({
  id: true,
  createdAt: true,
  streakCount: true,
  lastCompletedDate: true,
});

// ============================================
// COMMITMENT LOGS TABLE
// ============================================
// Tracks daily completion of commitments

export const commitmentLogs = pgTable("commitment_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commitmentId: varchar("commitment_id")
    .notNull()
    .references(() => studentCommitments.id),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  completedDate: timestamp("completed_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommitmentLog = typeof commitmentLogs.$inferSelect;
export type InsertCommitmentLog = typeof commitmentLogs.$inferInsert;

export const insertCommitmentLogSchema = createInsertSchema(commitmentLogs).omit({
  id: true,
  createdAt: true,
});

// ============================================
// STUDENT REFLECTIONS TABLE
// ============================================
// Student's personal reflections (similar to tutor reflections)

export const studentReflections = pgTable("student_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  date: timestamp("date").notNull(),
  reflectionText: text("reflection_text").notNull(),
  mood: varchar("mood"), // Optional: student's mood
  tags: text("tags"), // Comma-separated tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StudentReflection = typeof studentReflections.$inferSelect;
export type InsertStudentReflection = typeof studentReflections.$inferInsert;

export const insertStudentReflectionSchema = createInsertSchema(studentReflections).omit({
  id: true,
  createdAt: true,
});

// ============================================
// ASSIGNMENTS TABLE
// ============================================
// Practice problems assigned by tutor to student

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  title: varchar("title").notNull(),
  description: text("description"),
  problemsAssigned: text("problems_assigned"), // Problems to complete
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  studentResult: text("student_result"), // Student's result/answer
  studentWork: text("student_work"), // What student did, how, and why
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  isCompleted: true,
});

// ============================================
// PARENT REPORTS TABLE
// ============================================
// Weekly/Monthly reports sent by tutor to parent

export const parentReports = pgTable("parent_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => users.id),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  parentId: varchar("parent_id")
    .notNull()
    .references(() => users.id),
  reportType: reportTypeEnum("report_type").notNull(),
  weekNumber: integer("week_number"), // For weekly reports
  monthName: varchar("month_name"), // For monthly reports
  
  // Report content
  summary: text("summary").notNull(),
  topicsLearned: text("topics_learned"),
  strengths: text("strengths"),
  areasForGrowth: text("areas_for_growth"),
  bossBattlesCompleted: integer("boss_battles_completed").notNull().default(0),
  solutionsUnlocked: integer("solutions_unlocked").notNull().default(0),
  confidenceGrowth: integer("confidence_growth"), // Percentage or score
  nextSteps: text("next_steps"),
  
  // Parent feedback
  parentFeedback: text("parent_feedback"),
  parentFeedbackAt: timestamp("parent_feedback_at"),
  
  sentAt: timestamp("sent_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ParentReport = typeof parentReports.$inferSelect;
export type InsertParentReport = typeof parentReports.$inferInsert;

export const insertParentReportSchema = createInsertSchema(parentReports).omit({
  id: true,
  createdAt: true,
  parentFeedbackAt: true,
});
