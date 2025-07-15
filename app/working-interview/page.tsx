"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot, CheckCircle } from "lucide-react"

export default function WorkingInterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Camera states (copied from working simple-camera)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Interview states
  const [isRecording, setIsRecording] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [interviewTimer, setInterviewTimer] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions] = useState([
    { id: 1, text: "Tell me about yourself and your experience as a software engineer.", category: "Introduction" },
    { id: 2, text: "Describe a challenging technical problem you solved recently.", category: "Technical" },
    { id: 3, text: "How do you approach debugging complex issues?", category: "Technical" },
    { id: 4, text: "What are your career goals for the next 5 years?", category: "Career" }
  ])
  
  // Refs for timers
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Search params
  const selectedRole = searchParams.get('role') || 'Software Engineer'
  
  // Start camera function (copied exactly from working simple-camera)
  const startCamera = async () => {
    try {
      setCameraError(null)
      console.log('🎥 Starting camera test...')
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      console.log('🎥 Got stream:', newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        console.log('🎥 Set video source')
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Metadata loaded')
          videoRef.current?.play().then(() => {
            console.log('🎥 Playing!')
            setStream(newStream)
            setIsVideoReady(true)
          }).catch(err => {
            console.error('🎥 Play failed:', err)
            setCameraError(`Play failed: ${err.message}`)
          })
        }
      }
      
    } catch (err) {
      console.error('🎥 Camera failed:', err)
      setCameraError(`Camera failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Start recording function
  const startRecording = () => {
    if (!stream) {
      alert('Please start your camera first!')
      return
    }
    
    setIsRecording(true)
    setRecordingDuration(0)
    console.log('🎤 Recording started')
    
    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    console.log('🎤 Recording stopped')
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before submitting.')
      return
    }
    
    console.log('Submitting answer:', currentAnswer)
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setCurrentAnswer("")
      setRecordingDuration(0)
    } else {
      // Interview complete
      alert('Interview completed! Thank you.')
      router.push('/summary')
    }
  }

  // Start interview timer on mount
  useEffect(() => {
    interviewTimerRef.current = setInterval(() => {
      setInterviewTimer(prev => prev + 1)
    }, 1000)
    
    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedRole}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTime(interviewTimer)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Interviewer Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>AI Interviewer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* AI Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Bot className="h-16 w-16 text-white" />
                  </div>
                </div>
                
                {/* Current Question */}
                {currentQuestion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{currentQuestion.category}</Badge>
                    </div>
                    <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Candidate Section */}
          <div className="space-y-6">
            {/* Video Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Your Video</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-48 bg-black rounded-lg -scale-x-100"
                  />
                  
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📹</div>
                        <p className="mb-3">Click to start camera</p>
                        <Button 
                          onClick={startCamera} 
                          disabled={isVideoReady}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isVideoReady ? 'Camera Active ✅' : 'Start Camera 📹'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isVideoReady && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                      ✅ Camera Active
                    </div>
                  )}
                  
                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900 rounded-lg">
                      <div className="text-white text-center p-4">
                        <VideoOff className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium mb-1">Camera Error</p>
                        <p className="text-xs opacity-75 mb-3">{cameraError}</p>
                        <Button 
                          onClick={startCamera}
                          variant="outline"
                          size="sm"
                          className="text-white border-white hover:bg-white hover:text-black"
                        >
                          Retry Camera
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>REC {formatTime(recordingDuration)}</span>
                    </div>
                  )}
                </div>
                
                {/* Status Messages */}
                {cameraError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    <p className="font-medium">Camera Error</p>
                    <p>{cameraError}</p>
                  </div>
                )}
                
                {isVideoReady && !cameraError && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    <p className="font-medium">✅ Camera Ready</p>
                    <p>You can now start recording your response</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Answer Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[120px] resize-none"
                />
                
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  💡 <strong>Note:</strong> Please type your response in the text area above. Speech recognition is currently not available.
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className="flex items-center space-x-2"
                      disabled={!isVideoReady}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim()}
                      className="flex items-center space-x-2"
                    >
                      <span>Submit Answer</span>
                    </Button>
                  </div>
                </div>
                
                {currentAnswer.length > 0 && (
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Word count: {currentAnswer.trim().split(/\\s+/).length}</span>
                    {isRecording && <span>Recording: {formatTime(recordingDuration)}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interview Controls */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            End Interview
          </Button>
          
          {currentQuestionIndex > 0 && (
            <Button
              onClick={() => {
                setCurrentQuestionIndex(prev => prev - 1)
                setCurrentAnswer("")
              }}
              variant="outline"
            >
              Previous Question
            </Button>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug:</strong> Stream: {stream ? '✅' : '❌'} | Video Ready: {isVideoReady ? '✅' : '❌'} | Recording: {isRecording ? '🔴' : '⭕'} | Error: {cameraError || 'None'}</p>
        </div>
      </div>
    </div>
  )
}
