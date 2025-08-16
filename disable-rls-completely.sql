-- TEMPORARY FIX: Disable RLS completely for testing
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "profiles_authenticated_all" ON profiles;
DROP POLICY IF EXISTS "resumes_authenticated_all" ON resumes;
DROP POLICY IF EXISTS "interviews_authenticated_all" ON interviews;
DROP POLICY IF EXISTS "storage_authenticated_all" ON storage.objects;

-- 3. Grant full access to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON resumes TO authenticated;
GRANT ALL ON interviews TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 4. Make sure authenticated role can use the schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- 5. Allow public access to storage bucket for testing
UPDATE storage.buckets SET public = true WHERE id = 'resumes';

SELECT 'RLS disabled - Profile and Resume functionality should work now!' as message;
