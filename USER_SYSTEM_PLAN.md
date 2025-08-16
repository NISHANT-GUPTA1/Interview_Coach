# User Authentication & Profile System Implementation Plan

## Database Setup for Netlify Deployment 🗄️

### Option 1: Supabase (Recommended for Netlify)
- **Authentication**: Built-in Google OAuth
- **Database**: PostgreSQL with real-time features
- **Storage**: File storage for resumes
- **Free tier**: 500MB database, 1GB storage
- **Perfect for**: Netlify deployment with serverless functions

### Option 2: Firebase (Alternative)
- **Authentication**: Google, email/password
- **Database**: Firestore NoSQL
- **Storage**: Firebase Storage for resumes
- **Good for**: Real-time features

## Database Schema Design 📊

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Resumes Table
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  content_text TEXT, -- Extracted text for AI analysis
  skills JSONB, -- Extracted skills array
  experience JSONB, -- Work experience array
  education JSONB, -- Education details
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Interviews Table
```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id),
  role VARCHAR(255) NOT NULL,
  experience_level VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  questions JSONB NOT NULL, -- Array of questions
  answers JSONB, -- Array of answers with timestamps
  analysis JSONB, -- AI analysis results
  overall_score INTEGER,
  duration INTEGER, -- Interview duration in seconds
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### Interview_Sessions Table (for progress tracking)
```sql
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  answer_audio_url TEXT,
  time_spent INTEGER, -- Time spent on this question
  started_at TIMESTAMP DEFAULT NOW(),
  answered_at TIMESTAMP
);
```

## Features to Implement 🚀

### 1. Authentication System
- **Google OAuth integration**
- **Automatic login persistence**
- **Profile management**
- **Session handling**

### 2. Resume Management
- **Upload resume (PDF/DOC)**
- **Text extraction using AI**
- **Skills and experience parsing**
- **Multiple resume support**
- **Default resume selection**

### 3. Profile Dashboard
- **Interview history**
- **Progress tracking**
- **Performance analytics**
- **Skill improvement suggestions**

### 4. Enhanced Interview Flow
- **Resume-based question generation**
- **Skills-specific questions**
- **Experience-based scenarios**
- **Project discussion questions**

### 5. Analytics & Progress
- **Interview performance trends**
- **Skill-wise scoring**
- **Improvement areas identification**
- **Comparative analysis**

## Implementation Order 📋

1. **Setup Supabase project**
2. **Create database schema**
3. **Implement Google OAuth**
4. **Create profile page**
5. **Add resume upload functionality**
6. **Enhance interview with resume integration**
7. **Build progress dashboard**
8. **Deploy to Netlify with environment variables**
