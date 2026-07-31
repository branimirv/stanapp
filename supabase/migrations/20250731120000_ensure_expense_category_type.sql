-- Ensure expense_categories.type exists (required for custom irregular category inserts).

ALTER TABLE expense_categories
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'regular';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'expense_categories_type_check'
      AND conrelid = 'public.expense_categories'::regclass
  ) THEN
    ALTER TABLE expense_categories
      ADD CONSTRAINT expense_categories_type_check
      CHECK (type IN ('regular', 'irregular'));
  END IF;
END $$;

UPDATE expense_categories
SET type = 'irregular'
WHERE key IN ('maintenance', 'repair', 'other')
   OR user_id IS NOT NULL
   OR key LIKE 'custom_%';

UPDATE expense_categories
SET type = 'regular'
WHERE key IN ('electricity', 'water', 'gas', 'internet', 'communal', 'insurance', 'property_tax');
