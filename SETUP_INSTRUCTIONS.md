# SETUP INSTRUCTIONS FOR USER AUTHENTICATION SYSTEM

## Phase 1: Supabase Setup (Recommended for Netlify)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL and anon key

### 2. Database Schema Setup
Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Users profile table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Resumes table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  content_text TEXT,
  skills JSONB,
  experience JSONB,
  education JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resume policies
CREATE POLICY "Users can manage own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- Interviews table
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id),
  role VARCHAR(255) NOT NULL,
  experience_level VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB,
  analysis JSONB,
  overall_score INTEGER,
  duration INTEGER,
  status VARCHAR(50) DEFAULT 'in_progress',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Enable RLS on interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Interview policies
CREATE POLICY "Users can manage own interviews" ON public.interviews
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Storage Setup
1. Create bucket named "resumes" in Supabase Storage
2. Set public policy for authenticated users

### 4. Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - `http://localhost:3001/auth/callback` (for development)

## Phase 2: Environment Variables
Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=resumes
```

## Phase 3: Implementation Order
1. Install Supabase packages
2. Create authentication components
3. Build profile page
4. Add resume upload functionality
5. Enhance interview with user context
6. Create dashboard and analytics

## Netlify Deployment Considerations
- Set environment variables in Netlify dashboard
- Configure Supabase redirect URLs for production
- Set up Netlify Functions for server-side operations
