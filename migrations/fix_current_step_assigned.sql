-- Migration: Ensure current_step is 'assigned' for all assigned parent_enrollments

UPDATE parent_enrollments
SET current_step = 'assigned'
WHERE status = 'assigned' AND (current_step IS NULL OR current_step != 'assigned');
