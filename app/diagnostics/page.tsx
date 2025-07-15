"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticsPage() {
  const [permissions, setPermissions] = useState<any>({})
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [streamInfo, setStreamInfo] = useState<any>(null)

  const checkPermissions = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      
      setPermissions({
        camera: cameraPermission.state,
        microphone: microphonePermission.state
      })
    } catch (error) {
      console.error('Permission check error:', error)
      setPermissions({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const checkDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      setDevices(deviceList)
    } catch (error) {
      console.error('Device enumeration error:', error)
    }
  }

  const testStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setStreamInfo({
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().map(track => ({
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        })),
        audioTracks: stream.getAudioTracks().map(track => ({
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        }))
      })
      
      // Stop stream after testing
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Stream test error:', error)
      setStreamInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  useEffect(() => {
    checkPermissions()
    checkDevices()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Media Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Permissions</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {JSON.stringify(permissions, null, 2)}
              </pre>
              <Button onClick={checkPermissions} className="mt-2">
                Check Permissions
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Available Devices</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {JSON.stringify(devices.map(d => ({
                  kind: d.kind,
                  label: d.label,
                  deviceId: d.deviceId.substring(0, 20) + '...'
                })), null, 2)}
              </pre>
              <Button onClick={checkDevices} className="mt-2">
                Check Devices
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Stream Test</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {streamInfo ? JSON.stringify(streamInfo, null, 2) : 'Not tested yet'}
              </pre>
              <Button onClick={testStream} className="mt-2">
                Test Stream
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Browser Info</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {JSON.stringify({
                  userAgent: navigator.userAgent,
                  mediaDevicesSupported: !!navigator.mediaDevices,
                  getUserMediaSupported: !!navigator.mediaDevices?.getUserMedia,
                  speechRecognitionSupported: !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
