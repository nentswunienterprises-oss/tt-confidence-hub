-- Migration: Add student_id column to scheduled_sessions
ALTER TABLE scheduled_sessions
ADD COLUMN student_id uuid;

-- (Optional) If you want to enforce that every session has a student, add NOT NULL after uuid above (if all existing rows can be backfilled)
-- (Optional) Add a foreign key constraint if you have a students table:
-- ALTER TABLE scheduled_sessions ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id);
