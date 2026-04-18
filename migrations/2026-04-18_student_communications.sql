DO $$ BEGIN
  CREATE TYPE communication_audience AS ENUM ('parent', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS student_communication_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  audience communication_audience NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS student_communication_threads_student_audience_idx
  ON student_communication_threads(student_id, audience);

CREATE INDEX IF NOT EXISTS student_communication_threads_tutor_idx
  ON student_communication_threads(tutor_id);

CREATE INDEX IF NOT EXISTS student_communication_threads_parent_idx
  ON student_communication_threads(parent_id);

CREATE TABLE IF NOT EXISTS student_communication_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES student_communication_threads(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  audience communication_audience NOT NULL,
  sender_role role NOT NULL,
  sender_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  sender_student_user_id uuid REFERENCES student_users(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_by_tutor_at timestamptz,
  read_by_parent_at timestamptz,
  read_by_student_at timestamptz
);

CREATE INDEX IF NOT EXISTS student_communication_messages_thread_idx
  ON student_communication_messages(thread_id, created_at);

CREATE INDEX IF NOT EXISTS student_communication_messages_student_idx
  ON student_communication_messages(student_id, created_at);
