-- =============================================================
-- profiles security + auto-provisioning
-- Applied manually to Supabase PostgreSQL; NOT a Drizzle migration.
-- Run this file once against your project database (e.g. via
-- supabase db execute or the SQL editor) after the profiles
-- table and role enum exist.
-- =============================================================

-- 1. Foreign key: profiles.user_id -> auth.users.id
-- The auth schema is managed by Supabase Auth; do not recreate it.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 2. Trigger function: auto-create a profile row on every new auth user.
-- SECURITY DEFINER: bypasses RLS on insertion; safe because the function
-- inserts a fixed, non-client-controlled profile.
-- Explicit search_path + schema-qualified relations: Supabase security guidance.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role, created_at, updated_at)
  VALUES (NEW.id, NULL, 'user', now(), now());
  RETURN NEW;
END;
$$;

-- Do not expose this function to clients; only the trigger calls it.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 3. Row Level Security on profiles.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove the default PUBLIC grants (anon + authenticated inherit PUBLIC)
-- and grant only the minimum privileges to authenticated users.
REVOKE ALL ON public.profiles FROM PUBLIC;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (username, created_at, updated_at) ON public.profiles TO authenticated;
-- No INSERT / DELETE / UPDATE(role, user_id) grants → client cannot escalate role.

-- SELECT: authenticated users see only their own row.
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT
  TO authenticated
  USING ( (SELECT auth.uid()) = user_id );

-- UPDATE: authenticated users update only their own row and cannot reassign it.
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = user_id )
  WITH CHECK ( (SELECT auth.uid()) = user_id );
