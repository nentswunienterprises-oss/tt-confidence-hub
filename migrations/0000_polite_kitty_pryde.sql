CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."certification_status" AS ENUM('pending', 'passed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."phase" AS ENUM('foundation', 'scale_test');--> statement-breakpoint
CREATE TYPE "public"."pod_status" AS ENUM('active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."pod_type" AS ENUM('training', 'commercial');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('tutor', 'td', 'coo');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('all', 'tds', 'tutors');--> statement-breakpoint
CREATE TABLE "academic_tracker" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"target_mark" integer NOT NULL,
	"current_mark" integer,
	"strategy_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcasts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"sender_role" "role" NOT NULL,
	"visibility" "visibility" DEFAULT 'all' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "future_expansion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"Payfast_payment_status" varchar,
	"affiliate_id" varchar,
	"revenue_split" jsonb,
	"mpl_em_wave_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pod_name" varchar NOT NULL,
	"pod_type" "pod_type" DEFAULT 'training' NOT NULL,
	"phase" "phase" DEFAULT 'foundation' NOT NULL,
	"td_id" varchar,
	"status" "pod_status" DEFAULT 'active' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reflections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"reflection_text" text NOT NULL,
	"habit_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutoring_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"notes" text,
	"confidence_score_delta" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"grade" varchar NOT NULL,
	"tutor_id" varchar NOT NULL,
	"session_progress" integer DEFAULT 0 NOT NULL,
	"concept_mastery" jsonb,
	"confidence_score" real,
	"parent_contact" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"full_names" varchar NOT NULL,
	"age" integer NOT NULL,
	"phone_number" varchar NOT NULL,
	"email" varchar NOT NULL,
	"city" varchar NOT NULL,
	"current_status" varchar NOT NULL,
	"who_influences" text,
	"environment" text,
	"mindset_data" jsonb,
	"grades_equipped" text[] NOT NULL,
	"can_explain_clearly" varchar NOT NULL,
	"tool_confidence" jsonb,
	"student_not_improving" varchar,
	"psychological_data" jsonb,
	"vision_data" jsonb,
	"video_url" varchar,
	"bootcamp_available" varchar NOT NULL,
	"commit_to_trial" boolean NOT NULL,
	"referral_source" varchar,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" varchar NOT NULL,
	"pod_id" varchar NOT NULL,
	"student_count" integer DEFAULT 1 NOT NULL,
	"certification_status" "certification_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"password" varchar,
	"role" "role" DEFAULT 'tutor' NOT NULL,
	"name" varchar NOT NULL,
	"grade" varchar,
	"school" varchar,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_docs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" varchar NOT NULL,
	"file_url_agreement" varchar,
	"file_url_consent" varchar,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL UNIQUE,
	"full_name" varchar NOT NULL,
	"grade" varchar NOT NULL,
	"school" varchar,
	"latest_term_report" text,
	"my_thoughts" text,
	"current_challenges" text,
	"recent_wins" text,
	"upcoming_exams_projects" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "struggle_targets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"topic_concept" varchar NOT NULL,
	"my_struggle" text NOT NULL,
	"strategy" text NOT NULL,
	"consolidation_date" timestamp,
	"overcame" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_tracker" ADD CONSTRAINT "academic_tracker_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pods" ADD CONSTRAINT "pods_td_id_users_id_fk" FOREIGN KEY ("td_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_applications" ADD CONSTRAINT "tutor_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_applications" ADD CONSTRAINT "tutor_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_assignments" ADD CONSTRAINT "tutor_assignments_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_assignments" ADD CONSTRAINT "tutor_assignments_pod_id_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."pods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_docs" ADD CONSTRAINT "verification_docs_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_profiles" ADD CONSTRAINT "academic_profiles_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "struggle_targets" ADD CONSTRAINT "struggle_targets_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");