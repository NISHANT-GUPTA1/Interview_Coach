"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot, Globe, Brain } from "lucide-react"
import { multiLanguageSpeechService } from "@/lib/multilingual-speech-service"
import { translationService } from "@/lib/translations"
import { getQuickTranslation } from "@/lib/quick-translations"

export default function WorkingInterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Camera states
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
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [isRecognitionInitialized, setIsRecognitionInitialized] = useState(false)
  const [isClientSideReady, setIsClientSideReady] = useState(false)
  
  // Translation states
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState("")
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)
  
  // AI speaking state
  const [aiAvatarSpeaking, setAiAvatarSpeaking] = useState(false)
  
  // Configuration states
  const [selectedRole, setSelectedRole] = useState("Software Engineer")
  const [selectedExperience, setSelectedExperience] = useState("2-3 years")
  const [selectedCount, setSelectedCount] = useState(5)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [configLoaded, setConfigLoaded] = useState(false)
  
  // Questions loading states
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsReady, setQuestionsReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("Initializing AI Interview...")
  
  // Questions state
  const [questions, setQuestions] = useState([
    { id: 1, text: "Tell me about yourself and your experience as a software engineer.", category: "Introduction" },
    { id: 2, text: "Describe a challenging technical problem you solved recently.", category: "Technical" },
    { id: 3, text: "How do you approach debugging complex issues?", category: "Technical" },
    { id: 4, text: "What are your career goals for the next 5 years?", category: "Career" }
  ])
  
  // Refs for timers
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Language mapping for better speech recognition
  const languageMap = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
    'bn': 'bn-BD',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ur': 'ur-PK',
    'ne': 'ne-NP',
    'si': 'si-LK',
    'my': 'my-MM',
    'th': 'th-TH',
    'vi': 'vi-VN',
    'id': 'id-ID',
    'ms': 'ms-MY',
    'tl': 'tl-PH',
    'sw': 'sw-KE',
    'am': 'am-ET',
    'tr': 'tr-TR',
    'pl': 'pl-PL',
    'cs': 'cs-CZ',
    'hu': 'hu-HU',
    'ro': 'ro-RO',
    'bg': 'bg-BG',
    'hr': 'hr-HR',
    'sk': 'sk-SK',
    'sl': 'sl-SI',
    'et': 'et-EE',
    'lv': 'lv-LV',
    'lt': 'lt-LT',
    'fi': 'fi-FI',
    'da': 'da-DK',
    'no': 'no-NO',
    'sv': 'sv-SE',
    'is': 'is-IS',
    'nl': 'nl-NL'
  }

  // Language display names
  const languageNames = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'bn': 'বাংলা',
    'te': 'తెలుగు',
    'ta': 'தமிழ்',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'kn': 'ಕನ್ನಡ',
    'ml': 'മലയാളം',
    'pa': 'ਪੰਜਾਬੀ',
    'or': 'ଓଡ଼ିଆ',
    'as': 'অসমীয়া',
    'ur': 'اردو',
    'ne': 'नेपाली',
    'si': 'සිංහල',
    'my': 'မြန်မာ',
    'th': 'ไทย',
    'vi': 'Tiếng Việt',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'tl': 'Filipino',
    'sw': 'Kiswahili',
    'am': 'አማርኛ',
    'tr': 'Türkçe',
    'pl': 'Polski',
    'cs': 'Čeština',
    'hu': 'Magyar',
    'ro': 'Română',
    'bg': 'Български',
    'hr': 'Hrvatski',
    'sk': 'Slovenčina',
    'sl': 'Slovenščina',
    'et': 'Eesti',
    'lv': 'Latviešu',
    'lt': 'Lietuvių',
    'fi': 'Suomi',
    'da': 'Dansk',
    'no': 'Norsk',
    'sv': 'Svenska',
    'is': 'Íslenska',
    'nl': 'Nederlands'
  }

  // Get configuration from localStorage or URL params
  const getInterviewConfig = () => {
    if (typeof window !== 'undefined') {
      const storedConfig = localStorage.getItem('interviewConfig')
      if (storedConfig) {
        try {
          return JSON.parse(storedConfig)
        } catch (error) {
          console.error('Error parsing stored config:', error)
        }
      }
    }
    
    // Fallback to URL params
    return {
      role: searchParams.get('role') || 'Software Engineer',
      experience: searchParams.get('experience') || '2-3 years',
      count: parseInt(searchParams.get('count') || '5'),
      language: searchParams.get('language') || 'en'
    }
  }

  // Translation function using enhanced service
  const translateText = async (text: string, sourceLang: string, targetLang: string) => {
    try {
      return await translationService.translateText(text, sourceLang, targetLang)
    } catch (error) {
      console.error('Translation error:', error)
      return text // Return original text if translation fails
    }
  }

  // Initialize speech recognition with enhanced service
  const initializeSpeechRecognition = () => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      return
    }

    if (!multiLanguageSpeechService.isReady()) {
      setSpeechError('Speech recognition not available. Please refresh the page.')
      return
    }

    // Set the language for speech recognition
    const success = multiLanguageSpeechService.setLanguage(selectedLanguage)
    if (success) {
      setIsRecognitionInitialized(true)
      setSpeechError(null)
    } else {
      setSpeechError(`Speech recognition not available for ${selectedLanguage}. Using English fallback.`)
      multiLanguageSpeechService.setLanguage('en')
      setIsRecognitionInitialized(true)
    }
  }

  // Speak question using AI service
  const speakQuestionAI = async (questionText: string) => {
    setAiAvatarSpeaking(true)
    
    try {
      const success = await multiLanguageSpeechService.speak(questionText, selectedLanguage)
      if (!success) {
        throw new Error('Primary speech service failed')
      }
    } catch (error) {
      console.error('Speech synthesis error:', error)
      
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(questionText)
          const speechLang = languageMap[selectedLanguage as keyof typeof languageMap] || selectedLanguage
          utterance.lang = speechLang
          utterance.rate = 0.9
          utterance.pitch = 1.0
          
          const voices = window.speechSynthesis.getVoices()
          const voice = voices.find(v => v.lang.startsWith(speechLang.split('-')[0]))
          if (voice) {
            utterance.voice = voice
          }
          
          utterance.onend = () => setAiAvatarSpeaking(false)
          utterance.onerror = () => setAiAvatarSpeaking(false)
          window.speechSynthesis.speak(utterance)
        } catch (fallbackError) {
          console.error('Fallback speech synthesis error:', fallbackError)
          setAiAvatarSpeaking(false)
        }
      } else {
        setAiAvatarSpeaking(false)
      }
    }
  }

  // Load configuration on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const config = getInterviewConfig()
      setSelectedRole(config.role)
      setSelectedExperience(config.experience)
      setSelectedCount(config.count)
      setSelectedLanguage(config.language)
      setConfigLoaded(true)
      setIsClientSideReady(true)
    }
  }, [])

  // Initialize speech recognition when config is loaded
  useEffect(() => {
    if (configLoaded && selectedLanguage) {
      initializeSpeechRecognition()
    }
  }, [configLoaded, selectedLanguage])

  // Load questions when configuration is ready
  useEffect(() => {
    if (!configLoaded) return

    const loadQuestionsWithProgress = async () => {
      let progressInterval: NodeJS.Timeout | null = null
      
      try {
        setQuestionsLoading(true)
        setLoadingProgress(0)
        setLoadingMessage("🤖 Connecting to AI Interview System...")
        
        // Simulate progress updates
        progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 70) return prev + 10
            return prev
          })
        }, 200)

        setLoadingMessage("🧠 AI is generating personalized questions...")
        
        const response = await fetch('/api/ai-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: selectedRole,
            experience: selectedExperience,
            count: selectedCount,
            language: selectedLanguage
          })
        })
        
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }
        setLoadingProgress(90)
        setLoadingMessage("✨ Finalizing your interview setup...")

        if (response.ok) {
          const data = await response.json()
          
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
            setLoadingProgress(100)
            setLoadingMessage("🎉 Your AI interview is ready!")
            
            // Short delay then mark as ready
            setTimeout(() => {
              setQuestionsLoading(false)
              setQuestionsReady(true)
              
              // Start speaking first question after interface is ready
              setTimeout(async () => {
                await speakQuestionAI(data.questions[0].text)
              }, 1000)
            }, 1000)
            
            console.log('✅ Questions loaded:', data.questions)
          } else {
            throw new Error('No questions received from API')
          }
        } else {
          throw new Error(`API error: ${response.status}`)
        }
      } catch (error) {
        console.error('❌ Error loading questions:', error)
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        
        // Fallback to default questions
        setLoadingMessage("⚠️ Using backup questions...")
        setLoadingProgress(100)
        
        setTimeout(() => {
          setQuestionsLoading(false)
          setQuestionsReady(true)
          
          setTimeout(async () => {
            await speakQuestionAI(questions[0].text)
          }, 1000)
        }, 1000)
      }
    }
    
    loadQuestionsWithProgress()
  }, [configLoaded, selectedRole, selectedExperience, selectedCount, selectedLanguage])

  // Start camera function
  const startCamera = async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setIsVideoReady(true)
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Camera access denied. Please allow camera permissions.')
    }
  }

  // Start recording function
  const startRecording = () => {
    if (!isRecognitionInitialized) {
      setSpeechError('Speech recognition not initialized')
      return
    }

    const success = multiLanguageSpeechService.startListening((result) => {
      if (result.isFinal) {
        setCurrentAnswer(prev => prev + ' ' + result.transcript)
        setInterimText('')
      } else {
        setInterimText(result.transcript)
      }
    })

    if (success) {
      setIsRecording(true)
      setIsListening(true)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      setSpeechError('Failed to start speech recognition')
    }
  }

  // Stop recording function
  const stopRecording = () => {
    multiLanguageSpeechService.stopListening()
    setIsRecording(false)
    setIsListening(false)
    setInterimText('')
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  // Submit answer and move to next question
  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before continuing.')
      return
    }
    
    console.log('Submitting answer:', currentAnswer)
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setCurrentAnswer("")
      setRecordingDuration(0)
      setTranslatedText("")
      setDetectedLanguage(null)
      
      // Speak next question
      setTimeout(async () => {
        if (questions[currentQuestionIndex + 1]) {
          await speakQuestionAI(questions[currentQuestionIndex + 1].text)
        }
      }, 1000)
    } else {
      // Interview complete
      alert('Interview completed! Thank you.')
      router.push('/summary')
    }
  }

  // Start interview timer on mount
  useEffect(() => {
    if (questionsReady) {
      interviewTimerRef.current = setInterval(() => {
        setInterviewTimer(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
      }
    }
  }, [questionsReady])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
      }
    }
  }, [stream])

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Show loading screen while questions are being generated
  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI Interview Setup
                </h2>
                <p className="text-gray-600 mb-6">
                  {loadingMessage}
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <Progress value={loadingProgress} className="h-3" />
              </div>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>👤 Role:</span>
                  <span className="font-medium">{selectedRole}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>📈 Experience:</span>
                  <span className="font-medium">{selectedExperience}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>🔢 Questions:</span>
                  <span className="font-medium">{selectedCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>🌍 Language:</span>
                  <span className="font-medium">{languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage}</span>
                </div>
              </div>
              
              {loadingProgress < 100 && (
                <div className="mt-6 text-xs text-gray-400">
                  This may take 10-30 seconds depending on AI processing...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - only show when config is loaded */}
        {configLoaded && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedRole}
                </Badge>
                <Badge variant="outline" className="px-2 py-1">
                  📈 {selectedExperience}
                </Badge>
                <Badge variant="outline" className="px-2 py-1">
                  🔢 {selectedCount} Questions
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>{languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()}</span>
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
        )}

        {/* Main Interview Interface - only show when questions are ready */}
        {questionsReady && (
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
                    <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto ${aiAvatarSpeaking ? 'animate-pulse ring-4 ring-green-300' : ''}`}>
                      <Bot className="h-16 w-16 text-white" />
                    </div>
                    {aiAvatarSpeaking && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    )}
                  </div>

                  {/* Current Question */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{currentQuestion.category}</Badge>
                      <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {currentQuestion.text}
                    </p>
                  </div>

                  {/* AI Actions */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => speakQuestionAI(currentQuestion.text)}
                      variant="outline"
                      size="sm"
                      disabled={aiAvatarSpeaking}
                    >
                      🔊 Repeat Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Response Section */}
            <div className="space-y-6">
              {/* Video Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <span>Your Video</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {!stream ? (
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">Camera not started</p>
                          <Button onClick={startCamera} variant="outline">
                            <Video className="h-4 w-4 mr-2" />
                            Start Camera
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          className="w-full h-64 object-cover rounded-lg"
                          autoPlay
                          muted
                          playsInline
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          {isRecording && (
                            <Badge className="bg-red-500 text-white animate-pulse">
                              🔴 REC {formatTime(recordingDuration)}
                            </Badge>
                          )}
                          <Badge className="bg-green-500 text-white">
                            ✅ Camera Active
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {cameraError}
                      </div>
                    )}

                    {isVideoReady && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-700 text-sm">✅ Camera Ready - You can now start recording your response</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Response Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>Your Response</span>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>{languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage}</span>
                      </Badge>
                    </div>
                    <Badge variant={isListening ? "default" : "outline"} className={isListening ? "text-green-600" : ""}>
                      {isListening ? "🎤 Listening" : "🎤 Ready"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Recording Controls */}
                    <div className="flex space-x-4">
                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={!isRecognitionInitialized || !isVideoReady}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                      
                      <Button
                        onClick={submitAnswer}
                        disabled={!currentAnswer.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Answer
                      </Button>
                    </div>

                    {/* Answer Text Area */}
                    <div className="space-y-2">
                      <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Your answer will appear here as you speak, or you can type directly..."
                        className="min-h-32"
                      />
                      
                      {interimText && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                          <em>Listening: "{interimText}"</em>
                        </div>
                      )}
                    </div>

                    {/* Speech Status */}
                    {speechError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {speechError}
                      </div>
                    )}

                    {isRecording && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-green-500 rounded animate-pulse"></div>
                          <div className="w-1 h-3 bg-green-400 rounded animate-pulse delay-75"></div>
                          <div className="w-1 h-4 bg-green-500 rounded animate-pulse delay-150"></div>
                          <div className="w-1 h-2 bg-green-400 rounded animate-pulse delay-300"></div>
                        </div>
                        <span>Recording in {languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()}: {formatTime(recordingDuration)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Interview Controls */}
        {questionsReady && (
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
        )}

        {/* Enhanced Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug:</strong> Stream: {stream ? '✅' : '❌'} | Video Ready: {isVideoReady ? '✅' : '❌'} | Recording: {isRecording ? '🔴' : '⭕'} | Listening: {isListening ? '🎤' : '⭕'} | Language: {selectedLanguage} | Client Ready: {isClientSideReady ? '✅' : '❌'} | Speech Service: {isRecognitionInitialized ? '✅' : '❌'} | Error: {cameraError || speechError || 'None'}</p>
        </div>
      </div>
    </div>
  )
}
