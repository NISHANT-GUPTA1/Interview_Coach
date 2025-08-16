-- Fix Row Level Security Policies (Updated Version)
-- Run this in Supabase SQL Editor

-- 1. Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Enable all operations for authenticated users on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Enable all operations for authenticated users on resumes" ON resumes;
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

DROP POLICY IF EXISTS "Users can view own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can insert own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can update own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can delete own interviews" ON interviews;

-- 2. Create simple, permissive policies
CREATE POLICY "profiles_authenticated_all" ON profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "resumes_authenticated_all" ON resumes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "interviews_authenticated_all" ON interviews
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON resumes TO authenticated;
GRANT ALL ON interviews TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

SELECT 'RLS policies cleaned up and updated successfully!' as message;
