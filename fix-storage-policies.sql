-- Fix Storage Bucket Policies for Resume Upload (Updated Version)
-- Run this in Supabase SQL Editor

-- 1. Ensure resumes bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  true, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[];

-- 2. Drop ALL existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_all" ON storage.objects;

-- 3. Create simple storage policy for all authenticated users
CREATE POLICY "storage_authenticated_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'resumes' AND 
    auth.uid() IS NOT NULL
  );

-- 4. Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

SELECT 'Storage policies cleaned up and updated successfully!' as message;
