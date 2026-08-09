-- Tighten storage uploads to owner folders and add hot-path query indexes.
-- Receipt / property-photo paths must be: {auth.uid()}/...

-- ---------------------------------------------------------------------------
-- Storage RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own property photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own property photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own property photos" ON storage.objects;

CREATE POLICY "Users can upload own receipts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own receipts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own receipts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload own property photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own property photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'property-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own property photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Query indexes (expenses / tenants / rent_payments)
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_expenses_property_billing_date
  ON expenses (property_id, billing_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_property_due_unpaid
  ON expenses (property_id, due_date)
  WHERE paid_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_property_id
  ON tenants (property_id);

CREATE INDEX IF NOT EXISTS idx_tenants_property_active
  ON tenants (property_id, is_active);

CREATE INDEX IF NOT EXISTS idx_rent_payments_property_period
  ON rent_payments (property_id, period_year DESC, period_month DESC);

CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant_id
  ON rent_payments (tenant_id);

CREATE INDEX IF NOT EXISTS idx_rent_payments_status_period
  ON rent_payments (status, period_year, period_month);
