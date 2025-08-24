import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔧 Attempting to fix storage RLS issues...')
    
    const supabase = await createSupabaseRouteClient()
    
    // Try to disable RLS on storage.objects table temporarily
    const { error } = await supabase.rpc('disable_storage_rls')
    
    if (error) {
      console.error('❌ Could not disable storage RLS:', error)
      // Fall back to manual SQL execution
      return NextResponse.json({
        success: false,
        error: 'Could not automatically fix storage RLS',
        message: 'Please run the SQL script provided in fix-storage-rls.sql in your Supabase dashboard',
        instructions: [
          '1. Go to your Supabase Dashboard',
          '2. Open SQL Editor',
          '3. Run: ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;',
          '4. Or copy the entire fix-storage-rls.sql script'
        ]
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Storage RLS policies fixed successfully'
    })
    
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error.message,
      fallback: 'Please manually run the SQL from fix-storage-rls.sql'
    }, { status: 500 })
  }
}
