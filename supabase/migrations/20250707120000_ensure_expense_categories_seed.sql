-- Ensure expense categories exist and have correct regular/irregular types.

ALTER TABLE expense_categories
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'regular'
  CHECK (type IN ('regular', 'irregular'));

UPDATE expense_categories
SET type = 'irregular'
WHERE key IN ('maintenance', 'repair', 'other');

UPDATE expense_categories
SET type = 'regular'
WHERE key IN ('electricity', 'water', 'gas', 'internet', 'communal', 'insurance', 'property_tax');

INSERT INTO expense_categories (key, icon, color, type)
SELECT v.key, v.icon, v.color, v.type
FROM (
  VALUES
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
) AS v(key, icon, color, type)
WHERE NOT EXISTS (
  SELECT 1
  FROM expense_categories ec
  WHERE ec.key = v.key
    AND ec.user_id IS NULL
);
