-- SQL hygiene: search_path on handle_updated_at; Auth email lookup for edge invites;
-- document public property-photos SELECT (intentional — do not tighten here).

-- ---------------------------------------------------------------------------
-- handle_updated_at: pin search_path (matches other SECURITY DEFINER helpers)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- auth_user_id_by_email: service-role only (edge invite-to-properties)
-- Replaces Auth Admin listUsers pagination for "does this email exist?"
-- New UUID columns / tables should prefer gen_random_uuid() over uuid_generate_v4().
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auth_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.auth_user_id_by_email(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_user_id_by_email(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.auth_user_id_by_email(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_id_by_email(TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- Enable PostgREST embed: property_members → profiles (same id as auth.users)
-- ---------------------------------------------------------------------------

ALTER TABLE property_members
  DROP CONSTRAINT IF EXISTS property_members_profile_fkey;

ALTER TABLE property_members
  ADD CONSTRAINT property_members_profile_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- Storage: property-photos SELECT remains public ("Anyone can read property photos").
-- That matches the public bucket flag in schema. Keep unless switching to signed URLs.
-- ---------------------------------------------------------------------------
