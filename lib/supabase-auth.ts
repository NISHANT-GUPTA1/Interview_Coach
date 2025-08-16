import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Supabase configuration with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Authentication features will not work.')
  console.warn('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
}

// For client-side components
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client when Supabase is not configured
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        updateUser: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    } as any
  }
  return createClientComponentClient()
}

// For server-side components (only use in server components)
export const createSupabaseServerClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client when Supabase is not configured
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
      }),
    } as any
  }
  const { cookies } = await import('next/headers')
  return createServerComponentClient({ cookies })
}

// For API routes (only use in API routes)
export const createSupabaseRouteClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client when Supabase is not configured
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
      }),
    } as any
  }
  const { cookies } = await import('next/headers')
  return createRouteHandlerClient({ cookies })
}

// Basic client for non-authenticated operations (with fallback)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_name: string
          file_url: string
          file_size: number | null
          content_text: string | null
          skills: any | null
          experience: any | null
          education: any | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          original_name: string
          file_url: string
          file_size?: number | null
          content_text?: string | null
          skills?: any | null
          experience?: any | null
          education?: any | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          original_name?: string
          file_url?: string
          file_size?: number | null
          content_text?: string | null
          skills?: any | null
          experience?: any | null
          education?: any | null
          is_default?: boolean
          created_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          role: string
          experience_level: string
          language: string
          questions: any
          answers: any | null
          analysis: any | null
          overall_score: number | null
          duration: number | null
          status: string
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          role: string
          experience_level: string
          language: string
          questions: any
          answers?: any | null
          analysis?: any | null
          overall_score?: number | null
          duration?: number | null
          status?: string
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          role?: string
          experience_level?: string
          language?: string
          questions?: any
          answers?: any | null
          analysis?: any | null
          overall_score?: number | null
          duration?: number | null
          status?: string
          started_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}
