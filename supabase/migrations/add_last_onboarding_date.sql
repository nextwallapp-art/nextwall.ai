-- Run in Supabase → SQL Editor if profile updates still fail

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_onboarding_date timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_key
ON user_profiles (user_id);

DROP POLICY IF EXISTS "update_own" ON user_profiles;

CREATE POLICY "update_own" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
