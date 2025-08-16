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

    if (file.type !== 'application/pdf' && !file.type.includes('text')) {
      toast({
        title: "Error",
        description: "Please upload a PDF or text file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Upload file to Supabase storage - using the bucket that should exist
      const fileName = `${user.id}/${Date.now()}_${file.name}`
      
      // Check if bucket exists and create storage gracefully
      console.log('Attempting to upload file to resumes bucket...')
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        
        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          toast({
            title: "Storage Setup Required",
            description: "Please create a 'resumes' bucket in your Supabase Storage. Go to Storage > Create new bucket > Name: 'resumes' > Make it public",
            variant: "destructive",
          })
          return
        }
        
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName)

      // Extract text content (simplified)
      let contentText = ''
      if (file.type.includes('text')) {
        contentText = await file.text()
      }

      // Save resume record to database with better error handling
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          filename: fileName,
          original_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          content_text: contentText,
          is_default: resumes.length === 0, // First resume is default
        })

      if (dbError) {
        console.error('Database insert error:', dbError)
        
        // If table doesn't exist, show helpful message
        if (dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please create the 'resumes' table in your Supabase database. Check the SQL schema in your project documentation.",
            variant: "destructive",
          })
          return
        }
        
        throw dbError
      }

      await loadUserData() // Reload resumes
      
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
      })
    } catch (error: any) {
      console.error('Error uploading resume:', error)
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
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
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
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">Upload Resume</p>
                  <p className="text-gray-600 mb-4">PDF or text files only</p>
                  <Input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={loading}
                    className="max-w-xs mx-auto"
                  />
                </div>

                {resumes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Your Resumes</h3>
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{resume.original_name}</p>
                            <p className="text-sm text-gray-600">
                              Uploaded {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {resume.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
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
