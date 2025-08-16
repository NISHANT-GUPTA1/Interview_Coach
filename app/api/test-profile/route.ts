import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()
    const supabase = await createSupabaseRouteClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated',
        details: userError?.message
      }, { status: 401 })
    }

    console.log('🔄 Testing profile update for user:', user.id)

    // Try to update profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: name,
        email: user.email || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('✅ Profile updated successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: data
    })

  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error.message
    }, { status: 500 })
  }
}
