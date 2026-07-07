-- Run this in Supabase SQL Editor if user_profiles does not exist yet.

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  experience_level text,
  selected_assets jsonb,
  custom_assets text,
  free_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own" ON user_profiles;
DROP POLICY IF EXISTS "select_own" ON user_profiles;
DROP POLICY IF EXISTS "update_own" ON user_profiles;

CREATE POLICY "insert_own" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "select_own" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "update_own" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);
