'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, signInWithGoogle, loading, user } = useAuth()

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    const wasRemembered = localStorage.getItem('rememberMe') === 'true'
    
    if (wasRemembered && savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
      if (savedPassword) {
        setPassword(savedPassword)
      }
    }
  }, [])

  // Check if Supabase is configured
  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  // Check for auth errors from URL params
  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      toast({
        title: "Authentication Error",
        description: decodeURIComponent(errorParam),
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
      localStorage.setItem('rememberedPassword', password)
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberMe')
    }

    const { data, error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Successfully logged in!",
      })
      router.push('/profile')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    const { data, error } = await signInWithGoogle()

    if (error) {
      setError(error.message)
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your AI Interview Coach account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupabaseConfigured && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                ⚠️ Authentication is not configured. Please add Supabase environment variables to enable login functionality.
                <br />
                <span className="text-sm text-yellow-600 mt-1 block">
                  You can still use the app in demo mode by going back to the homepage.
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember my login details
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isSupabaseConfigured}>
              {loading ? 'Signing in...' : !isSupabaseConfigured ? 'Authentication Not Configured' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading || !isSupabaseConfigured}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm space-y-2">
            <div>
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <div>
              <Link href="/" className="text-gray-600 hover:underline">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
