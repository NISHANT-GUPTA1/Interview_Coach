'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase-auth'
import { Upload, FileText, Calendar, Award, User, LogOut, Home } from 'lucide-react'
import Link from 'next/link'

interface Resume {
  id: string
  filename: string
  original_name: string
  file_url: string
  file_size: number
  is_default: boolean
  created_at: string
  skills?: string[]
  experience?: any[]
  education?: any[]
}

interface Interview {
  id: string
  role: string
  experience_level: string
  language: string
  overall_score: number | null
  status: string
  started_at: string
  completed_at: string | null
}

export default function ProfilePage() {
  const { user, signOut, loading: authLoading, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setName(profile.name || '')
      }

      // Load resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (resumesData) {
        setResumes(resumesData)
      }

      // Load interviews
      const { data: interviewsData } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10)

      if (interviewsData) {
        setInterviews(interviewsData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      console.log('🔄 Starting profile update for user:', user.id, 'with name:', name)
      console.log('🔍 Supabase URL check:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
      console.log('🔍 Supabase Key check:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
      
      // Test API call instead of direct Supabase
      const response = await fetch('/api/test-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      })

      const result = await response.json()
      console.log('🔍 API Response:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Update failed')
      }

      console.log('✅ Profile updated successfully via API')

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      
      // Reload user data to show updated name
      await loadUserData()
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOC, DOCX, or TXT files only.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      console.log('🔄 Starting resume upload for file:', file.name)
      
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload using API (try simple method first)
      const response = await fetch('/api/upload-resume-simple', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log('🔍 Upload API Response:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Upload failed')
      }

      console.log('✅ Resume uploaded successfully via API')

      toast({
        title: "🎉 Resume Uploaded Successfully!",
        description: `${file.name} has been uploaded and is now available in your resume collection.`,
      })
      
      // Reload user data to show uploaded resume
      await loadUserData()
      
    } catch (error: any) {
      console.error('❌ Resume upload error:', error)
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {name || user.email}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/working-interview">
              <Button>Start Interview</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="resumes" className="relative">
              Resumes
              {resumes.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {resumes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="interviews">Interview History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumes">
            <Card>
              <CardHeader>
                <CardTitle>Resume Management</CardTitle>
                <CardDescription>
                  Upload and manage your resumes for tailored interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {resumes.length > 0 ? 'Upload Another Resume' : 'Upload Your First Resume'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    PDF, DOC, DOCX, or TXT files (max 5MB)
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={loading}
                    className="max-w-xs mx-auto"
                  />
                  {loading && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Uploading your resume...</p>
                          <p className="text-xs text-blue-700">Please wait while we process your file</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumes List */}
                {resumes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Your Resumes ({resumes.length})</h3>
                      <Badge variant="outline" className="text-xs">
                        {resumes.filter(r => r.is_default).length > 0 ? 'Default Set' : 'No Default'}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3">
                      {resumes.map((resume, index) => (
                        <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">{resume.original_name}</p>
                                {resume.is_default && (
                                  <Badge variant="default" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span>
                                  📅 {new Date(resume.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span>
                                  📁 {(resume.file_size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // View resume - handle both base64 and URL formats
                                if (resume.file_url.startsWith('data:')) {
                                  // For base64 data, create a download link
                                  const link = document.createElement('a')
                                  link.href = resume.file_url
                                  link.download = resume.original_name
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  
                                  toast({
                                    title: "Resume Downloaded",
                                    description: `${resume.original_name} has been downloaded to your computer`,
                                  })
                                } else {
                                  // For regular URLs, open in new tab
                                  window.open(resume.file_url, '_blank')
                                }
                              }}
                            >
                              📄 View/Download
                            </Button>
                            
                            {!resume.is_default && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from('resumes')
                                      .update({ is_default: false })
                                      .eq('user_id', user.id)
                                    
                                    if (!error) {
                                      const { error: setDefaultError } = await supabase
                                        .from('resumes')
                                        .update({ is_default: true })
                                        .eq('id', resume.id)
                                      
                                      if (!setDefaultError) {
                                        await loadUserData()
                                        toast({
                                          title: "Success",
                                          description: "Default resume updated!",
                                        })
                                      }
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to set as default",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                              >
                                ⭐ Set Default
                              </Button>
                            )}
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this resume?')) {
                                  try {
                                    const { error } = await supabase
                                      .from('resumes')
                                      .delete()
                                      .eq('id', resume.id)
                                    
                                    if (!error) {
                                      await loadUserData()
                                      toast({
                                        title: "Success",
                                        description: "Resume deleted successfully!",
                                      })
                                    } else {
                                      throw error
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete resume",
                                      variant: "destructive",
                                    })
                                  }
                                }
                              }}
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">No resumes uploaded yet</p>
                    <p className="text-sm text-gray-500">Upload your first resume to get started with personalized interviews</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
                <CardDescription>
                  Review your past interviews and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews.length > 0 ? (
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <div key={interview.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{interview.role}</h3>
                            <p className="text-sm text-gray-600">
                              {interview.experience_level} • {interview.language}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(interview.started_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {interview.overall_score && (
                              <div className="text-lg font-bold text-blue-600">
                                {interview.overall_score}/100
                              </div>
                            )}
                            <Badge 
                              variant={interview.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {interview.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No interviews yet</p>
                    <Link href="/working-interview">
                      <Button className="mt-4">Start Your First Interview</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Analytics coming soon</p>
                  <p className="text-sm text-gray-500">Complete more interviews to see your progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
