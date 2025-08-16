'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase-auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, running in demo mode')
      setLoading(false)
      return
    }

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Create profile if it doesn't exist
        if (event === 'SIGNED_IN' && session?.user) {
          await createUserProfile(session.user)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const createUserProfile = async (user: User) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return // Skip profile creation if Supabase is not configured
    }
    
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || null,
          })

        if (error) {
          console.error('Error creating profile:', error)
        }
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { data: null, error: { message: 'Supabase not configured. Please add environment variables.' } }
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { data: null, error: { message: 'Supabase not configured. Please add environment variables.' } }
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { data: null, error: { message: 'Supabase not configured. Please add environment variables.' } }
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { error: { message: 'Supabase not configured.' } }
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { error: { message: 'Supabase not configured.' } }
    }
    
    if (!user) return { error: { message: 'No user found' } }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
