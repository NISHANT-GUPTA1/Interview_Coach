import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('🔄 Auth callback received:', { code: !!code, origin: requestUrl.origin })

  if (code) {
    const supabase = await createSupabaseRouteClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
      }
      
      console.log('✅ Auth callback successful for user:', data.user?.email)
      
      // Create profile entry if it doesn't exist
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
        
        if (profileError) {
          console.warn('⚠️ Profile creation failed:', profileError)
        }
      }
      
    } catch (error: any) {
      console.error('❌ Auth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed')}`)
    }
  }

  // Redirect to profile page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/profile`)
}
