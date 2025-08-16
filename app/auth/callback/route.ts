import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseRouteClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${error.message}`)
    }
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
