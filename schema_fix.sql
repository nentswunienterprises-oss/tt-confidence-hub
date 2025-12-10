-- Create academic_profiles table without foreign key constraint (allows both tutors and students)
CREATE TABLE IF NOT EXISTS "public"."academic_profiles" (
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

-- Drop the existing foreign key if it exists
ALTER TABLE "public"."academic_profiles" DROP CONSTRAINT IF EXISTS "academic_profiles_student_id_students_id_fk";

-- Create struggle_targets table if it doesn't exist  
CREATE TABLE IF NOT EXISTS "public"."struggle_targets" (
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

-- Drop existing foreign key from struggle_targets if it exists
ALTER TABLE "public"."struggle_targets" DROP CONSTRAINT IF EXISTS "struggle_targets_student_id_students_id_fk";

-- Signal PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
