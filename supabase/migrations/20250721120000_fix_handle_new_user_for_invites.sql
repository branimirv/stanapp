-- Fix profile creation when Auth invites/signups create auth.users rows.
-- Without SET search_path and conflict handling, invites can fail with
-- "Database error saving new user".

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'User'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure Auth can write profiles through the trigger (Supabase standard grants).
GRANT USAGE ON SCHEMA public TO postgres, supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO postgres, supabase_auth_admin;
