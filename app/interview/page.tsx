"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot } from "lucide-react"

// Types for interview state
interface Question {
  id: number
  text: string
  followUp?: string
  category: string
  difficulty?: 'junior' | 'mid' | 'senior'
}

interface Answer {
  questionId: number
  text: string
  audioBlob?: Blob
  timestamp: Date
  duration: number
  timeSpent: number
}

interface CandidateProfile {
  level: 'junior' | 'mid' | 'senior'
  experience: number
  skills: string[]
  resume?: string
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Core interview state
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAIThinking, setIsAIThinking] = useState(false)
  
  // Timer and recording states
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [interviewTimer, setInterviewTimer] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())
  
  // Media and speech states
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const [aiAvatarSpeaking, setAiAvatarSpeaking] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  // Camera error state
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  
  // Enhanced speech recognition with better performance
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [speechError, setSpeechError] = useState<string | null>(null)
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Candidate profile - can be enhanced to come from user input
  const [candidateProfile] = useState<CandidateProfile>({
    level: 'mid',
    experience: 3,
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    resume: 'Experienced software developer with 3 years in full-stack development'
  })
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Search params
  const selectedGoal = searchParams.get('goal') || 'interview'
  const selectedRole = searchParams.get('role') || 'Software Engineer' 
  const selectedLanguage = searchParams.get('language') || 'en'

  // Constants
  const TOTAL_QUESTIONS = 10
  const INTERVIEW_DURATION = 60 * 60 // 1 hour in seconds

  // Initialize everything when component mounts
  useEffect(() => {
    const initializeInterview = async () => {
      console.log('Initializing interview...')
      await initializeMediaDevices()
      console.log('Media devices initialized')
      initializeSpeechRecognition()
      console.log('Speech recognition initialized')
      initializeSpeechSynthesis()
      console.log('Speech synthesis initialized')
      await generateDynamicQuestions()
      console.log('Questions generated')
      startInterviewTimer()
      setIsLoading(false)
    }
    
    initializeInterview()
    
    return () => {
      // Cleanup
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startInterviewTimer = () => {
    interviewTimerRef.current = setInterval(() => {
      setInterviewTimer(prev => prev + 1)
    }, 1000)
  }

  const initializeMediaDevices = async () => {
    try {
      setCameraError(null)
      setIsVideoReady(false)
      console.log('Requesting camera access...')
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Got media stream:', mediaStream)
      console.log('Video tracks:', mediaStream.getVideoTracks())
      
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream
        console.log('Video srcObject set')
        
        // Wait for video to load and then play
        videoRef.current.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing successfully')
              setStream(mediaStream)
              setIsVideoReady(true)
            }).catch(err => {
              console.error('Video play error:', err)
              setCameraError('Video playback failed: ' + err.message)
            })
          }
        }, { once: true })
        
        // Also handle loadeddata event as backup
        videoRef.current.addEventListener('loadeddata', () => {
          console.log('Video data loaded')
          if (!stream) {
            setStream(mediaStream)
            setIsVideoReady(true)
          }
        }, { once: true })
        
        // Handle errors
        videoRef.current.addEventListener('error', (e) => {
          console.error('Video element error:', e)
          setCameraError('Video display error')
        })
        
        // Force load
        videoRef.current.load()
      } else {
        setCameraError('Video element not available')
      }
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setCameraError('Could not access camera/microphone. Please check permissions.')
    }
  }

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      // Enhanced settings for better performance
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = selectedLanguage === 'en' ? 'en-US' : selectedLanguage
      recognitionInstance.maxAlternatives = 3 // More alternatives for better accuracy
      
      // Enhanced onresult with real-time feedback
      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // Show interim results immediately for better UX
        setInterimText(interimTranscript)
        
        if (finalTranscript.trim()) {
          setCurrentAnswer(prev => {
            const cleaned = finalTranscript.trim()
            // Avoid duplicate text
            if (prev && prev.endsWith(cleaned)) {
              return prev
            }
            return prev ? prev + ' ' + cleaned : cleaned
          })
          setInterimText('') // Clear interim when we have final text
          setSpeechError(null)
        }
        
        // Reset timeout for continuous listening
        if (recognitionTimeoutRef.current) {
          clearTimeout(recognitionTimeoutRef.current)
        }
        
        // Auto-restart if no speech for 3 seconds
        recognitionTimeoutRef.current = setTimeout(() => {
          if (isRecording && recognitionInstance.continuous) {
            try {
              recognitionInstance.stop()
              setTimeout(() => recognitionInstance.start(), 100)
            } catch (e) {
              console.log('Recognition restart failed:', e)
            }
          }
        }, 3000)
      }
      
      recognitionInstance.onstart = () => {
        setIsListening(true)
        setSpeechError(null)
        console.log('Speech recognition started')
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
        setInterimText('')
        console.log('Speech recognition ended')
        
        // Auto-restart if still recording
        if (isRecording) {
          setTimeout(() => {
            try {
              if (recognitionInstance && isRecording) {
                recognitionInstance.start()
              }
            } catch (e) {
              console.log('Recognition restart failed:', e)
              setSpeechError('Speech recognition stopped. Click to restart.')
            }
          }, 100)
        }
      }
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setInterimText('')
        
        switch (event.error) {
          case 'no-speech':
            setSpeechError('No speech detected. Try speaking louder.')
            break
          case 'audio-capture':
            setSpeechError('Microphone not available. Check permissions.')
            break
          case 'not-allowed':
            setSpeechError('Microphone permission denied.')
            break
          case 'network':
            setSpeechError('Network error. Check your connection.')
            break
          default:
            setSpeechError(`Speech recognition error: ${event.error}`)
        }
        
        // Auto-retry for certain errors
        if (event.error === 'no-speech' || event.error === 'network') {
          if (isRecording) {
            setTimeout(() => {
              try {
                recognitionInstance.start()
              } catch (e) {
                console.log('Recognition restart after error failed:', e)
              }
            }, 1500)
          }
        }
      }
      
      setRecognition(recognitionInstance)
    } else {
      setSpeechError('Speech recognition not supported in this browser')
    }
  }

  const initializeSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis)
    }
  }

  const generateDynamicQuestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          goal: selectedGoal,
          language: selectedLanguage,
          questionCount: TOTAL_QUESTIONS,
          candidateLevel: candidateProfile.level,
          candidateSkills: candidateProfile.skills,
          experience: candidateProfile.experience
        })
      })
      
      const data = await response.json()
      const generatedQuestions = data.questions || generateFallbackQuestions()
      setQuestions(generatedQuestions)
      
      // Speak the first question after a brief delay
      setTimeout(() => {
        if (generatedQuestions.length > 0) {
          speakQuestionAI(generatedQuestions[0].text)
        }
      }, 2000)
    } catch (error) {
      console.error('Error generating questions:', error)
      const fallbackQuestions = generateFallbackQuestions()
      setQuestions(fallbackQuestions)
      setTimeout(() => {
        speakQuestionAI(fallbackQuestions[0].text)
      }, 2000)
    } finally {
      setIsLoading(false)
      setIsInterviewStarted(true)
    }
  }

  const generateFallbackQuestions = (): Question[] => {
    const roleBasedQuestions = {
      'Software Engineer': [
        { id: 1, text: `Hello! I'm your AI interviewer today. Let's start with a brief introduction. Tell me about yourself and your journey as a ${selectedRole}.`, category: 'Introduction', difficulty: 'junior' as const },
        { id: 2, text: `What initially sparked your interest in software engineering? What keeps you passionate about coding?`, category: 'Motivation', difficulty: 'junior' as const },
        { id: 3, text: `Walk me through a recent project you've worked on that you're particularly proud of. What technologies did you use?`, category: 'Experience', difficulty: 'mid' as const },
        { id: 4, text: `How do you approach debugging a complex issue that you've never encountered before?`, category: 'Technical', difficulty: 'mid' as const },
        { id: 5, text: `Describe your experience with version control. How do you handle merge conflicts in a team environment?`, category: 'Technical', difficulty: 'mid' as const },
        { id: 6, text: `Tell me about a time when you had to learn a new technology quickly for a project. What was your strategy?`, category: 'Learning', difficulty: 'mid' as const },
        { id: 7, text: `How do you ensure code quality and maintainability in your projects? What practices do you follow?`, category: 'Technical', difficulty: 'senior' as const },
        { id: 8, text: `Describe a situation where you had to work with a difficult stakeholder or team member. How did you handle it?`, category: 'Soft Skills', difficulty: 'senior' as const },
        { id: 9, text: `What's your approach to system design? How would you design a simple chat application?`, category: 'Technical', difficulty: 'senior' as const },
        { id: 10, text: `Where do you see yourself in your software engineering career in the next 3-5 years? Any questions about our role?`, category: 'Career Goals', difficulty: 'mid' as const }
      ],
      'Data Scientist': [
        { id: 1, text: `Hello! I'm excited to interview you today. Tell me about your background and what led you to data science.`, category: 'Introduction', difficulty: 'junior' as const },
        { id: 2, text: `What aspects of data science do you find most compelling? How do you stay current with the field?`, category: 'Motivation', difficulty: 'junior' as const },
        { id: 3, text: `Describe a recent data science project. What was the business problem and how did you approach it?`, category: 'Experience', difficulty: 'mid' as const },
        { id: 4, text: `How do you handle missing or inconsistent data in your datasets?`, category: 'Technical', difficulty: 'mid' as const },
        { id: 5, text: `Walk me through your process for feature selection and engineering.`, category: 'Technical', difficulty: 'mid' as const },
        { id: 6, text: `How do you validate that your machine learning model is performing well and generalizing properly?`, category: 'Technical', difficulty: 'senior' as const },
        { id: 7, text: `Describe a time when your model didn't perform as expected. How did you troubleshoot and improve it?`, category: 'Problem Solving', difficulty: 'senior' as const },
        { id: 8, text: `How do you communicate complex technical findings to non-technical stakeholders?`, category: 'Soft Skills', difficulty: 'senior' as const },
        { id: 9, text: `What ethical considerations do you keep in mind when building predictive models?`, category: 'Ethics', difficulty: 'senior' as const },
        { id: 10, text: `What are your career aspirations in data science? Do you have any questions about this role?`, category: 'Career Goals', difficulty: 'mid' as const }
      ]
    }
    
    const questionsForRole = roleBasedQuestions[selectedRole as keyof typeof roleBasedQuestions] || roleBasedQuestions['Software Engineer']
    
    // Add some randomization while maintaining core structure
    return questionsForRole.map(q => ({
      ...q,
      text: q.text.replace(/\\b(project|initiative|task)\\b/g, () => {
        const alternatives = ['project', 'initiative', 'challenge', 'assignment']
        return alternatives[Math.floor(Math.random() * alternatives.length)]
      })
    }))
  }

  const speakQuestionAI = (text: string) => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
      
      setAiAvatarSpeaking(true)
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.85 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 0.9
      
      // Try to get a professional voice
      setTimeout(() => {
        const voices = speechSynthesis.getVoices()
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') ||
          voice.name.includes('Microsoft') ||
          (voice.lang.startsWith('en') && voice.name.includes('Male'))
        ) || voices.find(voice => voice.lang.startsWith('en'))
        
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
        
        utterance.onend = () => {
          setAiAvatarSpeaking(false)
          setQuestionStartTime(new Date())
        }
        
        utterance.onerror = () => {
          setAiAvatarSpeaking(false)
          setQuestionStartTime(new Date())
        }
        
        speechSynthesis.speak(utterance)
      }, 100)
    } else {
      setQuestionStartTime(new Date())
    }
  }

  const startRecording = async () => {
    if (!stream) {
      console.error('No media stream available')
      alert('Camera/microphone not ready. Please wait or check permissions.')
      return
    }
    
    console.log('Starting recording...')
    setIsRecording(true)
    setRecordingDuration(0)
    setCurrentAnswer("") // Clear previous answer
    setInterimText("") // Clear interim text
    setSpeechError(null) // Clear speech errors
    
    // Start speech recognition with enhanced error handling
    if (recognition) {
      try {
        console.log('Starting speech recognition...')
        recognition.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setSpeechError('Failed to start speech recognition. Try again.')
      }
    } else {
      console.error('Speech recognition not available')
      setSpeechError('Speech recognition not supported in this browser')
    }
    
    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
    
    // Start media recording with enhanced settings
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm',
        audioBitsPerSecond: 128000 // Higher quality audio
      })
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { 
          type: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
            ? 'audio/webm;codecs=opus' 
            : 'audio/webm'
        })
        const timeSpent = Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000)
        
        setAnswers(prev => [...prev, {
          questionId: questions[currentQuestionIndex]?.id || 0,
          text: currentAnswer,
          audioBlob,
          timestamp: new Date(),
          duration: recordingDuration,
          timeSpent: timeSpent
        }])
      }
      
      mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      setSpeechError('Audio recording failed. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsListening(false)
    setInterimText("")
    
    // Clear recognition timeout
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current)
    }
    
    // Stop speech recognition
    if (recognition) {
      try {
        recognition.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    }
    
    // Stop recording timer
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    
    // Stop media recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return
    
    // Calculate time spent on this question
    const timeSpent = Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000)
    
    // Save current answer if not already saved via recording
    if (!isRecording) {
      const newAnswer: Answer = {
        questionId: questions[currentQuestionIndex]?.id || 0,
        text: currentAnswer,
        timestamp: new Date(),
        duration: 0,
        timeSpent: timeSpent
      }
      setAnswers(prev => [...prev, newAnswer])
    }
    
    // Generate intelligent follow-up or move to next question
    setIsAIThinking(true)
    
    try {
      // Try to generate a follow-up question based on the answer
      const followUpResponse = await fetch('/api/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          question: questions[currentQuestionIndex]?.text,
          answer: currentAnswer,
          language: selectedLanguage
        })
      })
      
      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json()
        if (followUpData.followUp && Math.random() > 0.3) { // 70% chance of follow-up
          // Add follow-up as next question
          const followUpQuestion: Question = {
            id: Date.now(),
            text: followUpData.followUp,
            category: 'Follow-up',
            difficulty: questions[currentQuestionIndex]?.difficulty || 'mid'
          }
          
          setQuestions(prev => {
            const newQuestions = [...prev]
            newQuestions.splice(currentQuestionIndex + 1, 0, followUpQuestion)
            return newQuestions
          })
        }
      }
    } catch (error) {
      console.error('Error generating follow-up:', error)
    }
    
    setIsAIThinking(false)
    moveToNextQuestion()
  }

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1
    
    if (nextIndex >= questions.length) {
      // Interview complete
      finishInterview()
      return
    }
    
    setCurrentQuestionIndex(nextIndex)
    setCurrentAnswer("")
    
    // AI speaks the next question after a brief pause
    setTimeout(() => {
      if (questions[nextIndex]) {
        speakQuestionAI(questions[nextIndex].text)
      }
    }, 1500)
  }

  const finishInterview = () => {
    // Stop all timers and recording
    if (interviewTimerRef.current) {
      clearInterval(interviewTimerRef.current)
    }
    if (isRecording) {
      stopRecording()
    }
    
    // Save session and navigate to summary
    const sessionData = {
      answers,
      role: selectedRole,
      language: selectedLanguage,
      totalTime: interviewTimer,
      completedAt: new Date().toISOString()
    }
    
    localStorage.setItem('interviewSession', JSON.stringify(sessionData))
    router.push('/summary')
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="text-center p-8">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <h3 className="text-xl font-semibold">Preparing Your AI Interview</h3>
                <p className="text-gray-600">Generating personalized questions based on your profile and experience...</p>
                <div className="text-sm text-gray-500">
                  Role: {selectedRole} | Level: {candidateProfile.level} | Questions: {TOTAL_QUESTIONS}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Timer and Progress */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedRole}
              </Badge>
              <Badge variant="outline">{candidateProfile.level} Level</Badge>
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
                <Bot className={`h-5 w-5 ${aiAvatarSpeaking ? 'text-green-500 animate-pulse' : 'text-blue-600'}`} />
                <span>AI Interviewer</span>
                {aiAvatarSpeaking && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Speaking...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* AI Avatar */}
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transition-all duration-300 ${aiAvatarSpeaking ? 'scale-105 shadow-lg' : ''}`}>
                    <Bot className="h-16 w-16 text-white" />
                  </div>
                  {aiAvatarSpeaking && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-30"></div>
                  )}
                </div>
                
                {/* Current Question */}
                {currentQuestion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{currentQuestion.category}</Badge>
                      {currentQuestion.difficulty && (
                        <Badge variant={
                          currentQuestion.difficulty === 'senior' ? 'destructive' : 
                          currentQuestion.difficulty === 'mid' ? 'default' : 
                          'secondary'
                        }>
                          {currentQuestion.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
                  </div>
                )}
                
                {isAIThinking && (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">AI is analyzing your response...</span>
                    </div>
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Your Video</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleVideo}
                      className={!videoEnabled ? 'bg-red-50 text-red-600 border-red-200' : ''}
                    >
                      {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAudio}
                      className={!audioEnabled ? 'bg-red-50 text-red-600 border-red-200' : ''}
                    >
                      {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-48 bg-gray-900 rounded-lg object-cover -scale-x-100"
                    onLoadedData={() => console.log('Video loaded')}
                    onError={(e) => console.error('Video error:', e)}
                  />
                  {!stream && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                      <div className="text-white text-center">
                        <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900 rounded-lg">
                      <div className="text-white text-center p-4">
                        <VideoOff className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium mb-1">Camera Error</p>
                        <p className="text-xs opacity-75">{cameraError}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 text-white border-white"
                          onClick={initializeMediaDevices}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>REC {formatTime(recordingDuration)}</span>
                    </div>
                  )}
                </div>
                
                {/* Camera error message */}
                {cameraError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    <p className="font-medium">Camera/Microphone Error</p>
                    <p>{cameraError}</p>
                  </div>
                )}
                
                {/* Video ready state */}
                {isVideoReady && !cameraError && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    <p className="font-medium">Camera/Microphone Ready</p>
                    <p>You are all set to start the interview.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Answer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Response</span>
                  <div className="flex items-center space-x-2">
                    {isListening && (
                      <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">
                        🎤 Listening
                      </Badge>
                    )}
                    {speechError && (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={currentAnswer + (interimText ? ' ' + interimText : '')}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Your answer will appear here as you speak, or you can type directly..."
                    className={`min-h-[120px] resize-none transition-all ${
                      isListening ? 'border-green-300 bg-green-50' : ''
                    } ${speechError ? 'border-red-300 bg-red-50' : ''}`}
                  />
                  {interimText && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 italic">
                      {interimText.length > 20 ? '...' + interimText.slice(-20) : interimText}
                    </div>
                  )}
                </div>
                
                {/* Speech Error Display */}
                {speechError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Speech Recognition Issue</p>
                        <p>{speechError}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSpeechError(null)
                          if (isRecording && recognition) {
                            try {
                              recognition.start()
                            } catch (e) {
                              console.log('Failed to restart recognition:', e)
                            }
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className={`flex items-center space-x-2 transition-all ${
                        isListening ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>
                        {isRecording 
                          ? (isListening ? 'Stop Recording' : 'Recording...') 
                          : 'Start Recording'
                        }
                      </span>
                      {isListening && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim() || isAIThinking}
                      className="flex items-center space-x-2"
                    >
                      <span>Submit Answer</span>
                    </Button>
                  </div>
                </div>
                
                {currentAnswer.length > 0 && (
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Word count: {currentAnswer.trim().split(/\\s+/).length}</span>
                    <span>Response time: {formatTime(Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000))}</span>
                  </div>
                )}
                
                {/* Real-time speech feedback */}
                {isRecording && (
                  <div className="text-xs text-green-600 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1 h-3 bg-green-500 rounded animate-pulse"></div>
                      <div className="w-1 h-2 bg-green-400 rounded animate-pulse delay-75"></div>
                      <div className="w-1 h-4 bg-green-500 rounded animate-pulse delay-150"></div>
                      <div className="w-1 h-2 bg-green-400 rounded animate-pulse delay-300"></div>
                    </div>
                    <span>Recording: {formatTime(recordingDuration)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div>Stream: {stream ? '✅ Active' : '❌ Not Available'}</div>
                <div>Video Ready: {isVideoReady ? '✅ Yes' : '❌ No'}</div>
                <div>Speech Recognition: {recognition ? '✅ Available' : '❌ Not Available'}</div>
                <div>Is Listening: {isListening ? '🎤 Yes' : '⭕ No'}</div>
                <div>Speech Error: {speechError || 'None'}</div>
                <div>Camera Error: {cameraError || 'None'}</div>
                <div>Recording: {isRecording ? '🔴 Active' : '⭕ Inactive'}</div>
                <div>Answer: {currentAnswer.length} chars</div>
                <div>Interim Text: {interimText.length} chars</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Controls */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={finishInterview}
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
      </div>
    </div>
  )
}
