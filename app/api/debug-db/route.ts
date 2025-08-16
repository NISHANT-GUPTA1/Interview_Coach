import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseRouteClient()
    
    // Check if tables exist and their structure
    const results: any = {}
    
    // Check profiles table
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      results.profiles = {
        exists: !profilesError,
        error: profilesError?.message,
        sampleData: profiles
      }
    } catch (error: any) {
      results.profiles = {
        exists: false,
        error: error.message
      }
    }
    
    // Check resumes table
    try {
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .limit(1)
      
      results.resumes = {
        exists: !resumesError,
        error: resumesError?.message,
        sampleData: resumes
      }
    } catch (error: any) {
      results.resumes = {
        exists: false,
        error: error.message
      }
    }
    
    // Check interviews table
    try {
      const { data: interviews, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .limit(1)
      
      results.interviews = {
        exists: !interviewsError,
        error: interviewsError?.message,
        sampleData: interviews
      }
    } catch (error: any) {
      results.interviews = {
        exists: false,
        error: error.message
      }
    }
    
    // Check storage buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      results.storage = {
        buckets: buckets,
        error: bucketsError?.message
      }
    } catch (error: any) {
      results.storage = {
        buckets: null,
        error: error.message
      }
    }
    
    return NextResponse.json({
      success: true,
      database_status: results,
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
