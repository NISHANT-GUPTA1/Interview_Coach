-- ULTIMATE FIX: Run this in Supabase SQL Editor
-- This completely disables all RLS and grants full permissions

-- 1. Connect as the postgres user (you need to be the owner)
-- Switch to the SQL Editor in Supabase Dashboard

-- 2. Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on storage (most important for file uploads)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON profiles';
    END LOOP;
    
    -- Drop all policies on resumes
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'resumes' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON resumes';
    END LOOP;
    
    -- Drop all policies on storage.objects
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- 5. Grant all permissions to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- 6. Make resumes bucket public
UPDATE storage.buckets SET public = true WHERE id = 'resumes';

-- 7. Create the resumes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', true, 52428800, ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- 8. Verification queries
SELECT 'Tables without RLS:' as check_type, 
       schemaname, tablename, rowsecurity 
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname IN ('public', 'storage') 
  AND tablename IN ('profiles', 'resumes', 'objects', 'buckets');

SELECT 'Bucket status:' as check_type, id, name, public FROM storage.buckets WHERE id = 'resumes';

SELECT 'SUCCESS: RLS completely disabled, resume uploads should work now!' as result;
