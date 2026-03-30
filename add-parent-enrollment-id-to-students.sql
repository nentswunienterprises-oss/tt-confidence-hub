-- Migration: Add parent_enrollment_id column to students table
ALTER TABLE students
ADD COLUMN parent_enrollment_id UUID;
