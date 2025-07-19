"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot, Globe } from "lucide-react"
import { multiLanguageSpeechService } from "@/lib/multilingual-speech-service"
import { translationService } from "@/lib/translations"

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
  
  // Search params
  const selectedRole = searchParams.get('role') || 'Software Engineer'
  const selectedLanguage = searchParams.get('language') || 'en'
  
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
      console.log(`🎤 Speech recognition initialized for language: ${selectedLanguage}`)
    } else {
      setSpeechError(`Failed to initialize speech recognition for ${selectedLanguage}`)
      console.error(`❌ Failed to set language for speech recognition: ${selectedLanguage}`)
    }
  }

  // Enhanced speak question function using speech service
  const speakQuestionAI = async (text: string) => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return
      }

      if (!multiLanguageSpeechService.isReady()) {
        console.log('Speech service not ready, skipping TTS')
        return
      }

      setAiAvatarSpeaking(true)
      
      let textToSpeak = text
      
      // Always translate questions for non-English languages
      if (selectedLanguage !== 'en') {
        try {
          console.log(`🌍 Translating question from English to ${selectedLanguage}`)
          textToSpeak = await translationService.translateText(text, 'en', selectedLanguage)
          console.log('✅ Translated question:', textToSpeak)
        } catch (translationError) {
          console.warn('Translation failed, using original text:', translationError)
          // If translation fails, still use the original text but set proper language for TTS
        }
      }
      
      // Wait for voices to be loaded
      await multiLanguageSpeechService.waitForVoices()
      
      // Set language before speaking
      multiLanguageSpeechService.setLanguage(selectedLanguage)
      
      // Speak the question in the selected language
      await multiLanguageSpeechService.speak(textToSpeak, selectedLanguage, () => {
        setAiAvatarSpeaking(false);
      });
      
      console.log(`✅ Question spoken successfully in ${selectedLanguage}`)
    } catch (error) {
      console.error('Speech synthesis error:', error)
      
      // Enhanced fallback to basic browser speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          console.log('🔄 Using fallback TTS...')
          const utterance = new SpeechSynthesisUtterance(text)
          
          // Use proper language mapping
          const speechLang = languageMap[selectedLanguage as keyof typeof languageMap] || 'en-US'
          utterance.lang = speechLang
          utterance.rate = 0.8
          utterance.volume = 0.9
          
          // Find best voice for the language
          const voices = window.speechSynthesis.getVoices()
          const voice = voices.find(v => v.lang.startsWith(speechLang.split('-')[0]))
          if (voice) {
            utterance.voice = voice
            console.log(`🗣️ Fallback using voice: ${voice.name}`)
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

  // Initialize speech recognition and load questions on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // Set client-side ready
    setIsClientSideReady(true)

    initializeSpeechRecognition()
    
    // Load questions based on language
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: selectedRole,
            language: selectedLanguage,
            questionCount: 4
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions)
          console.log('✅ Questions loaded:', data.questions)
          
          // Speak first question after loading (with delay to ensure everything is ready)
          setTimeout(async () => {
            if (data.questions.length > 0) {
              await speakQuestionAI(data.questions[0].text)
            }
          }, 3000) // Increased delay to allow proper initialization
        }
      } catch (error) {
        console.error('❌ Error loading questions:', error)
        // Keep default questions if API fails
        setTimeout(async () => {
          await speakQuestionAI(questions[0].text)
        }, 3000)
      }
    }
    
    loadQuestions()
  }, [selectedLanguage])

  // Start camera function with enhanced error handling
  const startCamera = async () => {
    try {
      setCameraError(null)
      console.log('🎥 Starting camera and microphone...')
      
      // Check for media device support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser')
      }
      
      // Request permissions with enhanced audio constraints
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      console.log('🎥 Got stream with tracks:', newStream.getTracks().map(t => `${t.kind}: ${t.label}`))
      
      // Check audio tracks
      const audioTracks = newStream.getAudioTracks()
      if (audioTracks.length === 0) {
        console.warn('⚠️ No audio tracks found')
        setSpeechError('No microphone access. Please allow microphone permission.')
      } else {
        console.log('🎤 Audio tracks available:', audioTracks.length)
        setSpeechError(null)
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        console.log('🎥 Set video source')
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Metadata loaded')
          videoRef.current?.play().then(() => {
            console.log('🎥 Playing!')
            setStream(newStream)
            setIsVideoReady(true)
            
            // Initialize speech recognition after camera is ready
            setTimeout(() => {
              initializeSpeechRecognition()
            }, 500)
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

  // Test speech recognition function
  const testSpeechRecognition = () => {
    if (!multiLanguageSpeechService.isReady()) {
      setSpeechError('Speech recognition not available. Please refresh the page.')
      return
    }

    console.log(`🧪 Testing speech recognition for ${selectedLanguage}...`)
    setSpeechError(null)
    
    const success = multiLanguageSpeechService.startRecognition(
      (text: string, isFinal: boolean) => {
        if (isFinal) {
          console.log('🧪 Test result:', text)
          setSpeechError(`Test successful! Detected: "${text}"`)
          multiLanguageSpeechService.stopRecognition()
        } else {
          console.log('🧪 Interim:', text)
        }
      },
      (error: string) => {
        console.error('🧪 Test failed:', error)
        setSpeechError(`Test failed: ${error}`)
      }
    )

    if (success) {
      setSpeechError('🧪 Test started. Please say something...')
      setTimeout(() => {
        multiLanguageSpeechService.stopRecognition()
        setSpeechError('Test completed.')
      }, 5000)
    } else {
      setSpeechError('Failed to start test.')
    }
  }

  // Enhanced start recording function
  const startRecording = () => {
    if (!stream) {
      alert('Please start your camera first!')
      return
    }
    
    if (!isRecognitionInitialized) {
      setSpeechError('Speech recognition not initialized. Please refresh the page.')
      return
    }
    
    // Check if microphone is available
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) {
      setSpeechError('No microphone detected. Please connect a microphone and refresh the page.')
      return
    }
    
    // Check if audio track is enabled
    if (!audioTracks[0].enabled) {
      setSpeechError('Microphone is disabled. Please enable it.')
      return
    }
    
    setIsRecording(true)
    setRecordingDuration(0)
    setCurrentAnswer("")
    setInterimText("")
    setSpeechError(null)
    setTranslatedText("")
    setDetectedLanguage(null)
    console.log('🎤 Recording started for language:', selectedLanguage)
    
    // Start speech recognition using enhanced service
    console.log(`🎤 Initializing speech recognition for language: ${selectedLanguage}`)
    
    // Ensure language is set correctly
    multiLanguageSpeechService.setLanguage(selectedLanguage)
    
    const success = multiLanguageSpeechService.startRecognition(
      async (text: string, isFinal: boolean) => {
        if (isFinal) {
          console.log('✅ Final transcript:', text)
          
          setCurrentAnswer(prev => {
            const newAnswer = prev ? prev + ' ' + text : text
            console.log('📝 Updated answer:', newAnswer)
            return newAnswer
          })
          
          // If interview language is not English, translate for internal processing
          if (selectedLanguage !== 'en' && text) {
            try {
              setIsTranslating(true)
              console.log('🌍 Translating from', selectedLanguage, 'to English:', text)
              const translatedResponse = await translationService.translateText(text, selectedLanguage, 'en')
              if (translatedResponse && translatedResponse !== text) {
                setTranslatedText(translatedResponse)
                setDetectedLanguage(selectedLanguage)
                console.log('✅ Translation result:', translatedResponse)
              }
            } catch (error) {
              console.error('❌ Translation error:', error)
            } finally {
              setIsTranslating(false)
            }
          }
          
          setInterimText('')
          setSpeechError(null)
        } else {
          // Show interim results
          setInterimText(text)
        }
      },
      (error: string) => {
        console.error('❌ Speech recognition error:', error)
        setSpeechError(error)
        setIsListening(false)
        setInterimText('')
      }
    )
    
    if (success) {
      setIsListening(true)
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      setIsRecording(false)
      setSpeechError('Failed to start speech recognition. Please try again.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsListening(false)
    setInterimText("")
    console.log('🎤 Recording stopped')
    
    // Clear recognition timeout
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current)
    }
    
    // Stop speech recognition using enhanced service
    multiLanguageSpeechService.stopRecognition()
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  const submitAnswer = async () => {
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
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current)
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

            {/* Enhanced Answer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>Your Response</span>
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isListening && (
                      <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">
                        🎤 Listening
                      </Badge>
                    )}
                    {isTranslating && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        🔄 Translating
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
                    placeholder={`Speak in ${languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()} or type your answer here...`}
                    className={`min-h-[120px] resize-none transition-all ${
                      isListening ? 'border-green-300 bg-green-50' : ''
                    } ${speechError ? 'border-red-300 bg-red-50' : ''} ${
                      isTranslating ? 'border-blue-300 bg-blue-50' : ''
                    }`}
                  />
                  {interimText && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 italic">
                      {interimText.length > 20 ? '...' + interimText.slice(-20) : interimText}
                    </div>
                  )}
                </div>
                
                {/* Translation Display */}
                {translatedText && selectedLanguage !== 'en' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Translation ({languageNames[detectedLanguage as keyof typeof languageNames] || detectedLanguage?.toUpperCase()} → English)
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700">{translatedText}</p>
                  </div>
                )}
                
                {/* Speech Error Display */}
                {speechError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Microphone Issue</p>
                        <p>{speechError}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSpeechError(null)
                          // Reset retry counter for manual retry
                          multiLanguageSpeechService.resetRetryCount()
                          if (isRecognitionInitialized && isRecording) {
                            const success = multiLanguageSpeechService.startRecognition(
                              async (text: string, isFinal: boolean) => {
                                if (isFinal) {
                                  setCurrentAnswer(prev => prev ? prev + ' ' + text : text)
                                  setInterimText('')
                                } else {
                                  setInterimText(text)
                                }
                              },
                              (error: string) => {
                                setSpeechError(error)
                                setIsListening(false)
                              }
                            )
                            if (success) {
                              setIsListening(true)
                            }
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Speech Recognition Test */}
                {isVideoReady && !isRecording && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">Speech Recognition Test</p>
                        <p className="text-sm text-blue-600">Test if microphone works for {selectedLanguage.toUpperCase()}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={testSpeechRecognition}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Test Mic 🎤
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className={`flex items-center space-x-2 ${
                        isListening ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                      disabled={!isVideoReady}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>
                        {isRecording 
                          ? (isListening ? `Recording (${languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()})` : 'Recording...') 
                          : `Record Answer (${languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()})`
                        }
                      </span>
                      {isListening && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
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
                    <span>
                      Words: {currentAnswer.trim().split(/\s+/).length}
                      {detectedLanguage && selectedLanguage !== 'en' && (
                        <span className="ml-2">| Language: {languageNames[detectedLanguage as keyof typeof languageNames] || detectedLanguage.toUpperCase()}</span>
                      )}
                    </span>
                    {isRecording && <span>Recording: {formatTime(recordingDuration)}</span>}
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
                    <span>Recording in {languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()}: {formatTime(recordingDuration)}</span>
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

        {/* Enhanced Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug:</strong> Stream: {stream ? '✅' : '❌'} | Video Ready: {isVideoReady ? '✅' : '❌'} | Recording: {isRecording ? '🔴' : '⭕'} | Listening: {isListening ? '🎤' : '⭕'} | Language: {selectedLanguage} | Client Ready: {isClientSideReady ? '✅' : '❌'} | Speech Service: {isRecognitionInitialized ? '✅' : '❌'} | Error: {cameraError || speechError || 'None'}</p>
        </div>
      </div>
    </div>
  )
}
