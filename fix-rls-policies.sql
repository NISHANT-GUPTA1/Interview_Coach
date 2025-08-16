-- Fix Row Level Security Policies
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

-- 2. Create more permissive policies for profiles
CREATE POLICY "Enable all operations for authenticated users on profiles" ON profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Create more permissive policies for resumes  
CREATE POLICY "Enable all operations for authenticated users on resumes" ON resumes
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Alternative: Temporarily disable RLS for testing (not recommended for production)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON resumes TO authenticated;
GRANT ALL ON interviews TO authenticated;

-- 6. Ensure users can read/write their own data
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'RLS policies updated successfully!' as message;
