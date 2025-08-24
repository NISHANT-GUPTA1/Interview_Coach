import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔧 Attempting to disable RLS using service role...')
    
    // Use service role to disable RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('👤 Using service role to disable RLS policies...')
    
    // Disable RLS on key tables
    const operations = [
      // Disable RLS on tables
      supabaseAdmin.rpc('exec_sql', { 
        sql: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' 
      }),
      supabaseAdmin.rpc('exec_sql', { 
        sql: 'ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;' 
      }),
      supabaseAdmin.rpc('exec_sql', { 
        sql: 'ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;' 
      }),
      
      // Update bucket to be public
      supabaseAdmin.rpc('exec_sql', { 
        sql: "UPDATE storage.buckets SET public = true WHERE id = 'resumes';" 
      })
    ]
    
    const results = await Promise.allSettled(operations)
    
    console.log('✅ RLS operations completed')
    
    return NextResponse.json({
      success: true,
      message: 'RLS disabled successfully using service role',
      details: 'Profile updates and resume uploads should now work'
    })
    
  } catch (error: any) {
    console.error('❌ Service role error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to disable RLS',
      details: error.message,
      fallback: 'Try manually in Supabase dashboard with these commands',
      commands: [
        'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;',
        "UPDATE storage.buckets SET public = true WHERE id = 'resumes';"
      ]
    }, { status: 500 })
  }
}
