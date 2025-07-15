"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleCameraPage() {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    try {
      setError(null)
      console.log('🎥 Starting simple camera test...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      console.log('🎥 Got stream:', stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('🎥 Set video source')
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Metadata loaded')
          videoRef.current?.play().then(() => {
            console.log('🎥 Playing!')
            setIsActive(true)
          }).catch(err => {
            console.error('🎥 Play failed:', err)
            setError(`Play failed: ${err.message}`)
          })
        }
      }
      
    } catch (err) {
      console.error('🎥 Camera failed:', err)
      setError(`Camera failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Simple Camera Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-black rounded -scale-x-100"
            />
            
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white rounded">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <p>Click "Start Camera" to test</p>
                </div>
              </div>
            )}
            
            {isActive && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                ✅ Camera Active
              </div>
            )}
          </div>
          
          <Button onClick={startCamera} disabled={isActive} className="w-full">
            {isActive ? 'Camera Running ✅' : 'Start Camera 📹'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              ❌ {error}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Status:</strong> {isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>Video Element:</strong> {videoRef.current ? 'Ready' : 'Not Ready'}</p>
          </div>
          
          <div className="text-center">
            <a href="/working-interview" className="text-blue-600 hover:underline">
              ← Back to Interview
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
