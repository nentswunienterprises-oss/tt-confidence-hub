-- Migration: Create topic_conditioning_activations table
CREATE TABLE IF NOT EXISTS topic_conditioning_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id character varying NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id character varying NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_conditioning_activations_student_id ON topic_conditioning_activations(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_conditioning_activations_tutor_id ON topic_conditioning_activations(tutor_id);
