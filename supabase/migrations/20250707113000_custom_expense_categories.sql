-- Add per-user custom expense categories for irregular expenses.

ALTER TABLE expense_categories
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE expense_categories
  DROP CONSTRAINT IF EXISTS expense_categories_key_key;

CREATE UNIQUE INDEX IF NOT EXISTS expense_categories_global_key_unique
  ON expense_categories (key)
  WHERE user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS expense_categories_user_key_unique
  ON expense_categories (user_id, key);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view expense categories" ON expense_categories;
CREATE POLICY "Authenticated users can view expense categories"
  ON expense_categories FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own expense categories" ON expense_categories;
CREATE POLICY "Users can insert own expense categories"
  ON expense_categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own expense categories" ON expense_categories;
CREATE POLICY "Users can delete own expense categories"
  ON expense_categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
