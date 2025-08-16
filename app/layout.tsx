import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { TranslationProvider } from '@/contexts/TranslationContext'
import { AuthProvider } from '@/contexts/SupabaseAuthContext'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'AI Interview Coach',
  description: 'Multilingual AI-powered interview preparation platform',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <TranslationProvider>
              {children}
              <Toaster />
            </TranslationProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
