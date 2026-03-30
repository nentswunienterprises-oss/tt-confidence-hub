-- Backfill parent_enrollment_id for students missing it
-- This script will update all students where parent_enrollment_id is NULL
-- It tries to find the correct parent_enrollment_id by matching parent_id and tutor_id
-- If not found, it tries by parent_contact (email) and tutor_id

UPDATE students s
SET parent_enrollment_id = pe.id
FROM parent_enrollments pe
WHERE s.parent_enrollment_id IS NULL
  AND (
    (s.parent_id = pe.user_id AND s.tutor_id::text = pe.assigned_tutor_id::text)
    OR (s.parent_contact = pe.parent_email AND s.tutor_id::text = pe.assigned_tutor_id::text)
  );

-- To preview affected rows before running the update, use:
-- SELECT s.id, s.name, s.parent_id, s.tutor_id, s.parent_contact, pe.id AS matched_enrollment_id
-- FROM students s
-- JOIN parent_enrollments pe
--   ON (
--     (s.parent_id = pe.user_id AND s.tutor_id::text = pe.assigned_tutor_id::text)
--     OR (s.parent_contact = pe.parent_email AND s.tutor_id::text = pe.assigned_tutor_id::text)
--   )
-- WHERE s.parent_enrollment_id IS NULL;