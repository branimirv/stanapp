-- Ensure expense categories are readable and seeded (existing Supabase projects)

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view expense categories" ON expense_categories;
CREATE POLICY "Authenticated users can view expense categories"
  ON expense_categories FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO expense_categories (key, icon, color, type) VALUES
  ('electricity',   'Zap',            '#F59E0B', 'regular'),
  ('water',         'Droplets',       '#3B82F6', 'regular'),
  ('gas',           'Flame',          '#EF4444', 'regular'),
  ('internet',      'Wifi',           '#8B5CF6', 'regular'),
  ('communal',      'Building2',      '#10B981', 'regular'),
  ('insurance',     'Shield',         '#6366F1', 'regular'),
  ('property_tax',  'Landmark',       '#EC4899', 'regular'),
  ('maintenance',   'Wrench',         '#14B8A6', 'irregular'),
  ('repair',        'Hammer',         '#F97316', 'irregular'),
  ('other',         'MoreHorizontal', '#6B7280', 'irregular')
ON CONFLICT (key) DO NOTHING;
