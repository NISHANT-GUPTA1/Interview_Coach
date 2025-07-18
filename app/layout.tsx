import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { TranslationProvider } from '@/contexts/TranslationContext'

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
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </Suspense>
      </body>
    </html>
  )
}
