-- Add 'in_renovation' usage status to properties (run on existing Supabase projects)

ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS properties_usage_status_check;

ALTER TABLE properties
  ADD CONSTRAINT properties_usage_status_check
  CHECK (usage_status IN ('rented', 'personal_use', 'vacant', 'in_renovation'));
