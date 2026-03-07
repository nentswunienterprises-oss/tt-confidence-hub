-- Migration: Add full_name column to parents table
ALTER TABLE parents
ADD COLUMN full_name TEXT;
