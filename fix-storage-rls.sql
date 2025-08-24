-- Fix Storage RLS Policies for Resume Uploads
-- Run this in your Supabase SQL Editor

-- First, check if the bucket exists and create it if not
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing RLS policies if any
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for resumes" ON storage.objects;

-- Create proper RLS policies for resume storage
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Alternative: If the above doesn't work, disable RLS completely for storage
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Also ensure the resumes table has proper policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;

-- Create proper policies for resumes table
CREATE POLICY "Users can view own resumes"
ON resumes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
ON resumes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
ON resumes FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- If you're still having issues, you can temporarily disable RLS:
-- ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
