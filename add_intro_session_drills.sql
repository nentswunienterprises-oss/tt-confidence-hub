-- Migration: Create intro_session_drills table for storing intro session drill results
-- For Supabase/Postgres

create table if not exists public.intro_session_drills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references tutors(id) on delete cascade,
  drill jsonb not null,
  submitted_at timestamptz not null default now()
);

-- Optional: Add index for faster queries by student or tutor
create index if not exists idx_intro_session_drills_student_id on public.intro_session_drills(student_id);
create index if not exists idx_intro_session_drills_tutor_id on public.intro_session_drills(tutor_id);
