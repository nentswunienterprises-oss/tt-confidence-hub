-- Check if parent_enrollment_id is set for Emo (Go Hard)
SELECT id, name, parent_enrollment_id, tutor_id FROM students WHERE id = '975a874e-78b7-4098-9933-bdca38f35916';

-- Check for onboarding proposal for Emo's enrollment and tutor
SELECT * FROM onboarding_proposals
WHERE enrollment_id = 'a78193bf-9a4f-41dd-92a0-77432f946b86'
  AND tutor_id = 'c9873790-52f1-49ef-88c1-28c5be6ac08f';

-- Optionally, check parent_enrollments for reference
SELECT * FROM parent_enrollments WHERE id = 'a78193bf-9a4f-41dd-92a0-77432f946b86';
