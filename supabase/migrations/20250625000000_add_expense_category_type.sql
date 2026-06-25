-- Add regular/irregular type to expense categories (run on existing Supabase projects)

ALTER TABLE expense_categories
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'regular'
  CHECK (type IN ('regular', 'irregular'));

UPDATE expense_categories SET type = 'irregular'
  WHERE key IN ('maintenance', 'repair', 'other');

UPDATE expense_categories SET type = 'regular'
  WHERE key IN ('electricity', 'water', 'gas', 'internet', 'communal', 'insurance', 'property_tax');
