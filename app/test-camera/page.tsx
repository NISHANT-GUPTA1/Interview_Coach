"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestCameraPage() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const initCamera = async () => {
    try {
      setError(null)
      console.log('Starting camera initialization...')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      console.log('Media stream obtained:', mediaStream)
      console.log('Video tracks:', mediaStream.getVideoTracks())
      console.log('Audio tracks:', mediaStream.getAudioTracks())
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current?.play().then(() => {
            console.log('Video playing')
            setIsReady(true)
          }).catch(err => {
            console.error('Play error:', err)
            setError(`Play error: ${err.message}`)
          })
        }
      }
      
    } catch (err) {
      console.error('Camera error:', err)
      setError(`Camera error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Camera Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-black rounded"
            />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                Click button to start camera
              </div>
            )}
          </div>
          
          <Button onClick={initCamera} disabled={isReady}>
            {isReady ? 'Camera Ready' : 'Start Camera'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {stream && (
            <div className="p-3 bg-green-100 text-green-700 rounded">
              Camera working! Video tracks: {stream.getVideoTracks().length}, Audio tracks: {stream.getAudioTracks().length}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>Debug info:</p>
            <p>Stream: {stream ? '✅' : '❌'}</p>
            <p>Ready: {isReady ? '✅' : '❌'}</p>
            <p>Error: {error || 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
