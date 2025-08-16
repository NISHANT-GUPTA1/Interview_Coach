-- TEMPORARY: Disable RLS for testing (NOT for production)
-- Run this in Supabase SQL Editor if above fixes don't work

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;

-- Also disable for storage (if needed)
-- This will allow all authenticated users to upload/view files
DROP POLICY IF EXISTS "Allow authenticated users to upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own resumes" ON storage.objects;

CREATE POLICY "Allow all authenticated operations on storage" ON storage.objects
  FOR ALL USING (auth.uid() IS NOT NULL);

SELECT 'RLS temporarily disabled - REMEMBER to re-enable for production!' as warning;
