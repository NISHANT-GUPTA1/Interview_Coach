import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 POST /api/upload-resume-simple called')
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    console.log('📁 File received:', file.name, 'Size:', file.size)

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

    console.log('👤 User authenticated:', user.id)

    // Check file size (5MB limit for base64 storage)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 5MB for this method.'
      }, { status: 400 })
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.'
      }, { status: 400 })
    }

    // Convert file to base64 to bypass storage issues
    console.log('🔄 Converting file to base64...')
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    console.log('📝 File converted to base64, size:', base64Data.length)

    // Extract text content for text files
    let contentText = ''
    if (file.type === 'text/plain') {
      try {
        contentText = new TextDecoder().decode(arrayBuffer)
      } catch (error) {
        console.warn('⚠️ Could not extract text content:', error)
      }
    }

    // Check how many resumes user has
    const { data: existingResumes, error: countError } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', user.id)

    if (countError) {
      console.warn('⚠️ Could not count existing resumes:', countError)
    }

    const isFirstResume = !existingResumes || existingResumes.length === 0

    // Save resume record to database with base64 data instead of storage URL
    console.log('💾 Saving resume record to database...')
    const { data: resumeData, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        filename: `base64_${Date.now()}_${file.name}`,
        original_name: file.name,
        file_url: dataUrl, // Store base64 data URL instead of storage URL
        file_size: file.size,
        content_text: contentText,
        is_default: isFirstResume
      })
      .select()

    if (dbError) {
      console.error('❌ Database insert error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save resume record',
        details: dbError.message,
        hint: 'Database table might not exist or RLS policies are blocking insert'
      }, { status: 500 })
    }

    console.log('✅ Resume uploaded successfully (base64 method):', resumeData)

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully using fallback method',
      data: {
        filename: file.name,
        size: file.size,
        method: 'base64_database_storage'
      }
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
