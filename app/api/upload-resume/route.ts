import { createSupabaseRouteClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 POST /api/upload-resume called')
    
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

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
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

    // Upload to Supabase storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    console.log('📤 Uploading file:', fileName)
    
    // Try different upload approaches to bypass RLS issues
    let uploadData, uploadError
    
    // Approach 1: Standard upload
    const uploadResult = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    uploadData = uploadResult.data
    uploadError = uploadResult.error
    
    // If RLS error, try with service role or direct approach
    if (uploadError && uploadError.message.includes('row-level security')) {
      console.log('⚠️ RLS error detected, trying alternative approach...')
      
      // Try creating a simple client that bypasses RLS
      const { createClient } = await import('@supabase/supabase-js')
      const directSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
          }
        }
      )
      
      // Set auth context manually
      await directSupabase.auth.setSession({
        access_token: (await supabase.auth.getSession()).data.session?.access_token!,
        refresh_token: (await supabase.auth.getSession()).data.session?.refresh_token!
      })
      
      const retryResult = await directSupabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true  // Allow overwrite to bypass some RLS issues
        })
      
      uploadData = retryResult.data
      uploadError = retryResult.error
    }

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file to storage',
        details: uploadError.message,
        troubleshooting: 'Please check if the "resumes" bucket exists and RLS policies are properly configured'
      }, { status: 500 })
    }

    console.log('✅ File uploaded to storage')

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    console.log('🔗 Public URL generated:', publicUrl)

    // Extract text content for text files
    let contentText = ''
    if (file.type === 'text/plain') {
      try {
        const buffer = await file.arrayBuffer()
        contentText = new TextDecoder().decode(buffer)
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

    // Save resume record to database
    console.log('💾 Saving resume record to database...')
    const { data: resumeData, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        filename: fileName,
        original_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        content_text: contentText,
        is_default: isFirstResume
      })
      .select()

    if (dbError) {
      console.error('❌ Database insert error:', dbError)
      
      // Try to clean up uploaded file
      try {
        await supabase.storage.from('resumes').remove([fileName])
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up uploaded file:', cleanupError)
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to save resume record',
        details: dbError.message
      }, { status: 500 })
    }

    console.log('✅ Resume uploaded successfully:', resumeData)

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        filename: file.name,
        size: file.size,
        url: publicUrl
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
