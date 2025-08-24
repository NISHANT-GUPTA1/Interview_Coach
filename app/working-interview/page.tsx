"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot, Globe, Brain, AlertTriangle } from "lucide-react"
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
  
  // Speech recognition states with better error handling
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [isRecognitionInitialized, setIsRecognitionInitialized] = useState(false)
  const [errorCount, setErrorCount] = useState(0) // Track errors for better recovery
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
  
  // Interview answers storage
  const [interviewAnswers, setInterviewAnswers] = useState<Array<{
    questionId: string;
    questionText: string;
    answerText: string;
    category: string;
    recordingDuration: number;
    timestamp: Date;
  }>>([])
  
  // Questions loading states
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsReady, setQuestionsReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("Initializing AI Interview...")
  
  // Questions state - Enhanced fallback questions based on role and experience
  const [questions, setQuestions] = useState([
    { id: 1, text: "Tell me about yourself and your experience in your field.", category: "Introduction" },
    { id: 2, text: "Describe a challenging problem you solved recently and your approach.", category: "Problem Solving" },
    { id: 3, text: "How do you stay updated with the latest trends and technologies in your industry?", category: "Learning" },
    { id: 4, text: "What are your biggest strengths and how do they help you in your work?", category: "Self Assessment" },
    { id: 5, text: "Where do you see yourself professionally in the next 3-5 years?", category: "Career Goals" }
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
    'tr': 'tr-TR',
    'pl': 'pl-PL',
    'nl': 'nl-NL',
    'sv': 'sv-SE',
    'no': 'no-NO',
    'da': 'da-DK',
    'fi': 'fi-FI',
    'sa': 'sa-IN'
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

  // Initialize speech recognition with enhanced service and improved error handling
  const initializeSpeechRecognition = async () => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      console.log('🎤 Skipping speech init on server side')
      return
    }

    console.log('🎤 Initializing speech recognition')
    
    // Check for HTTPS requirement
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      setSpeechError('🔒 Speech recognition requires HTTPS. Please use the HTTPS version of this site or use the setup-https.bat script to enable local HTTPS.')
      return
    }
    
    // Check browser compatibility - more detailed browser detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isChrome = /chrome/i.test(navigator.userAgent) && !/edg/i.test(navigator.userAgent)
    const isEdge = /edg/i.test(navigator.userAgent)
    const isFirefox = /firefox/i.test(navigator.userAgent)
    
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.log('🎤 Web Speech API not supported in this browser')
      setSpeechError(`🚫 Speech recognition is not supported in your browser (${isFirefox ? 'Firefox' : 'this browser'}). Please use Chrome, Edge, or Safari for full speech functionality.`)
      return
    }
    
    if (!multiLanguageSpeechService.isReady()) {
      console.log('🎤 Speech service not ready')
      setSpeechError(`🎤 Speech recognition initialization failed. Please try using ${isChrome ? 'the latest version of Chrome' : isEdge ? 'the latest version of Edge' : isSafari ? 'the latest version of Safari' : 'Chrome, Edge, or Safari'}.`)
      return
    }

    // Test microphone permissions
    try {
      console.log('🎤 Testing microphone permissions...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately after testing
      console.log('🎤 Microphone permissions granted')
    } catch (error) {
      console.error('🎤 Microphone permission error:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setSpeechError('Microphone access denied. Please allow microphone permissions and refresh the page.')
        } else if (error.name === 'NotFoundError') {
          setSpeechError('No microphone found. Please ensure your microphone is connected.')
        } else {
          setSpeechError('Microphone access failed. Please check your microphone settings.')
        }
      }
      return
    }

    // Set the language for speech recognition
    console.log('🎤 Setting language to:', selectedLanguage)
    const success = multiLanguageSpeechService.setLanguage(selectedLanguage)
    if (success) {
      console.log('🎤 Speech recognition initialized successfully')
      setIsRecognitionInitialized(true)
      setSpeechError(null)
    } else {
      console.log('🎤 Language not supported, using English fallback')
      setSpeechError(`Speech recognition not available for ${selectedLanguage}. Using English fallback.`)
      multiLanguageSpeechService.setLanguage('en')
      setIsRecognitionInitialized(true)
    }
  }

  // Simple test speech function
  const testSpeech = async () => {
    if (typeof window !== 'undefined') {
      console.log('🧪 Testing speech synthesis for language:', selectedLanguage)
      
      // Language-specific test text
      const testTexts: { [key: string]: string } = {
        'pa': 'ਇਹ ਇੱਕ ਪੰਜਾਬੀ ਟੈਸਟ ਹੈ',
        'hi': 'यह एक हिंदी टेस्ट है',
        'ur': 'یہ ایک اردو ٹیسٹ ہے',
        'ne': 'यो एक नेपाली परीक्षण हो',
        'bn': 'এটি একটি বাংলা পরীক্ষা',
        'ta': 'இது ஒரு தமிழ் சோதனை',
        'te': 'ఇది ఒక తెలుగు పరీక్ష',
        'kn': 'ಇದು ಒಂದು ಕನ್ನಡ ಪರೀಕ್ಷೆ',
        'ml': 'ഇത് ഒരു മലയാളം പരീക്ഷയാണ്',
        'gu': 'આ એક ગુજરાતી પરીક્ષણ છે',
        'mr': 'हे एक मराठी चाचणी आहे',
        'ar': 'هذا اختبار باللغة العربية',
        'zh': '这是一个中文测试',
        'ja': 'これは日本語のテストです',
        'ko': '이것은 한국어 테스트입니다',
        'th': 'นี่คือการทดสอบภาษาไทย',
        'vi': 'Đây là một bài kiểm tra tiếng Việt',
        'id': 'Ini adalah tes bahasa Indonesia',
        'ms': 'Ini adalah ujian bahasa Melayu',
        'tl': 'Ito ay isang pagsusulit sa Filipino',
        'tr': 'Bu bir Türkçe testidir',
        'ru': 'Это тест на русском языке',
        'es': 'Esta es una prueba en español',
        'fr': 'Ceci est un test en français',
        'de': 'Dies ist ein Test auf Deutsch',
        'it': 'Questo è un test in italiano',
        'pt': 'Este é um teste em português',
        'pl': 'To jest test w języku polskim',
        'nl': 'Dit is een test in het Nederlands',
        'sv': 'Detta är ett test på svenska',
        'no': 'Dette er en test på norsk',
        'da': 'Dette er en test på dansk',
        'fi': 'Tämä on testi suomeksi',
        'en': 'This is an English test'
      }
      
      const testText = testTexts[selectedLanguage] || 'This is a test'
      
      try {
        console.log(`🎙️ Testing with text: "${testText}" in language: ${selectedLanguage}`)
        await multiLanguageSpeechService.speak(testText, selectedLanguage)
        console.log('✅ Speech test completed successfully')
      } catch (error) {
        console.error('❌ Speech test failed:', error)
        
        // Fallback to basic speech synthesis
        if ('speechSynthesis' in window) {
          console.log('🔄 Falling back to basic speech synthesis')
          window.speechSynthesis.cancel()
          
          const utterance = new SpeechSynthesisUtterance(testText)
          const speechLang = languageMap[selectedLanguage as keyof typeof languageMap] || 'en-US'
          utterance.lang = speechLang
          utterance.rate = 0.8
          utterance.pitch = 1.0
          utterance.volume = 0.9
          
          utterance.onstart = () => console.log('🎤 Fallback speech started')
          utterance.onend = () => console.log('🎤 Fallback speech ended')
          utterance.onerror = (error) => console.error('🎤 Fallback speech error:', error)
          
          window.speechSynthesis.speak(utterance)
        }
      }
    }
  }

  // Speak question using enhanced browser speech synthesis
  const speakQuestionAI = async (questionText: string) => {
    console.log('🗣️ Starting speakQuestionAI with text:', questionText.substring(0, 50) + '...')
    console.log('🌍 Speaking in language:', selectedLanguage)
    
    // Don't start if already speaking
    if (aiAvatarSpeaking) {
      console.log('🎤 Already speaking, cancelling previous speech and starting new...')
      // Cancel any ongoing speech from both services
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      // Give a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setAiAvatarSpeaking(true)
    
    try {
      // Use enhanced multilingual speech service for better regional language support
      console.log('🎙️ Using multiLanguageSpeechService for TTS')
      
      await multiLanguageSpeechService.speak(
        questionText, 
        selectedLanguage, 
        () => {
          console.log('✅ Speech completed via multiLanguageSpeechService')
          setAiAvatarSpeaking(false)
        }
      )
      
    } catch (error) {
      console.error('❌ Enhanced speech failed, falling back to browser TTS:', error)
      
      // Only fallback if the error is a timeout or service unavailable
      const isTimeoutError = error === 'Speech synthesis timeout'
      const isServiceUnavailable = !multiLanguageSpeechService.isReady()
      
      if (isTimeoutError || isServiceUnavailable) {
        console.log('🔄 Using browser speech synthesis as fallback')
        
        // Fallback to browser speech synthesis with enhanced voice selection
        try {
          if ('speechSynthesis' in window) {
            // Cancel any ongoing speech first
            window.speechSynthesis.cancel()
            
            // Wait a moment for cancel to complete
            await new Promise(resolve => setTimeout(resolve, 100))
            
            const utterance = new SpeechSynthesisUtterance(questionText)
            const speechLang = languageMap[selectedLanguage as keyof typeof languageMap] || 'en-US'
            utterance.lang = speechLang
            
            // Enhanced settings for regional languages
            if (['hi', 'ta', 'te', 'kn', 'ml', 'pa', 'bn', 'gu', 'mr', 'or', 'as', 'ur', 'ne', 'si'].includes(selectedLanguage)) {
              utterance.rate = 0.7  // Slower for clarity
              utterance.pitch = 1.1  // Slightly higher pitch
              utterance.volume = 1.0  // Full volume
              console.log(`🇮🇳 Configured for regional language: ${selectedLanguage}`)
            } else {
              utterance.rate = 0.9
              utterance.pitch = 1.0
              utterance.volume = 0.9
            }
            
            // Enhanced voice finding algorithm
            const voices = window.speechSynthesis.getVoices()
            console.log(`🔍 Looking for ${speechLang} voice among ${voices.length} available voices`)
            
            // Priority voice selection
            let selectedVoice = null
            
            // 1. Exact language match with priority brands
            const priorityBrands = ['google', 'microsoft', 'apple']
            for (const brand of priorityBrands) {
              selectedVoice = voices.find(v => 
                v.lang.toLowerCase() === speechLang.toLowerCase() && 
                v.name.toLowerCase().includes(brand)
              )
              if (selectedVoice) break
            }
            
            // 2. Exact language match (any voice)
            if (!selectedVoice) {
              selectedVoice = voices.find(v => v.lang.toLowerCase() === speechLang.toLowerCase())
            }
            
            // 3. Base language match (e.g., 'pa' for 'pa-IN')
            if (!selectedVoice) {
              const baseLanguage = speechLang.split('-')[0]
              selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(baseLanguage.toLowerCase()))
            }
            
            // 4. Fallback to English
            if (!selectedVoice) {
              selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0]
            }
            
            if (selectedVoice) {
              utterance.voice = selectedVoice
              console.log(`✅ Selected voice: ${selectedVoice.name} (${selectedVoice.lang}) for ${selectedLanguage}`)
            } else {
              console.log(`⚠️ No suitable voice found for ${selectedLanguage}, using default`)
            }
            
            // Set up event handlers and start speaking
            utterance.onstart = () => {
              console.log(`🎤 Fallback speech started for ${selectedLanguage}`)
              setAiAvatarSpeaking(true)
            }
            
            utterance.onend = () => {
              console.log(`✅ Fallback speech completed successfully for ${selectedLanguage}`)
              setAiAvatarSpeaking(false)
            }
            
            utterance.onerror = (error) => {
              console.error(`❌ Fallback speech error for ${selectedLanguage}:`, error)
              setAiAvatarSpeaking(false)
            }
            
            // Start speaking
            window.speechSynthesis.speak(utterance)
            
          } else {
            console.log('🎤 Speech synthesis not supported in this browser')
            setAiAvatarSpeaking(false)
          }
        } catch (fallbackError) {
          console.error('❌ Fallback speech synthesis error:', fallbackError)
          setAiAvatarSpeaking(false)
        }
      } else {
        // For non-timeout errors, just log and stop
        console.error('❌ Speech synthesis failed:', error)
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

  // Load questions when configuration is ready - AI ONLY, NO FALLBACK
  useEffect(() => {
    if (!configLoaded) return

    const loadQuestionsWithProgress = async () => {
      let progressInterval: NodeJS.Timeout | null = null
      
        try {
        setQuestionsLoading(true)
        setLoadingProgress(0)
        setLoadingMessage("🤖 Connecting to OpenRouter AI (Mistral 7B)...")        // Simulate progress updates
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
        setLoadingMessage("✨ Finalizing your AI interview setup...")

        if (response.ok) {
          const data = await response.json()
          
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
            setLoadingProgress(100)
            setLoadingMessage("🎉 Your AI interview is ready!")
            
            // Short delay then mark as ready
            setTimeout(() => {
              console.log('🎯 Setting questionsReady to true with questions:', data.questions)
              setQuestionsLoading(false)
              setQuestionsReady(true)
              
              // Start speaking first question after interface is ready - with proper delay
              setTimeout(async () => {
                console.log('🗣️ Starting to speak first question:', data.questions[0]?.text)
                if (data.questions[0]?.text && !aiAvatarSpeaking) {
                  await speakQuestionAI(data.questions[0].text)
                }
              }, 2000) // 2 second delay to ensure everything is loaded
            }, 1000)
            
            console.log('✅ AI Questions loaded:', data.questions)
          } else {
            throw new Error('No questions received from AI API')
          }
        } else {
          const errorData = await response.json()
          const errorMessage = errorData.error || errorData.details || 'Unknown API error'
          throw new Error(`AI API error: ${response.status} - ${errorMessage}`)
        }
      } catch (error) {
        console.error('❌ AI Question Generation Failed:', error)
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        
        // Show error - NO FALLBACK
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setLoadingMessage(`❌ AI Question Generation Failed: ${errorMessage}`)
        setLoadingProgress(0)
        
        // Keep loading state to show error
        // User must refresh to try again
      }
    }
    
    loadQuestionsWithProgress()
  }, [configLoaded, selectedRole, selectedExperience, selectedCount, selectedLanguage])

  // Stop camera function
  const stopCamera = () => {
    console.log('📹 Stopping camera...')
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('📹 Stopped track:', track.kind)
      })
      setStream(null)
    }
    setIsVideoReady(false)
    setCameraError(null)
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Start camera function
  const startCamera = async () => {
    console.log('📹 Starting camera...')
    try {
      setCameraError(null)
      setIsVideoReady(false)
      
      // Wait a moment for DOM to be ready if video element not available
      if (!videoRef.current) {
        console.log('📹 Video element not immediately available, waiting...')
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Check if video element is available after wait
      if (!videoRef.current) {
        console.error('📹 Video element still not available')
        setCameraError('Video element not ready. This should not happen - please refresh the page.')
        return
      }
      
      console.log('📹 Video element found:', videoRef.current)
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser. Please use Chrome, Firefox, or Safari.')
      }
      
      // Check if running on HTTPS (required for camera in production)
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera requires HTTPS. Please use the HTTPS version of this site.')
      }
      
      console.log('📹 Requesting camera permissions...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: false
      })

      console.log('📹 Camera stream obtained:', mediaStream)
      console.log('📹 Stream active:', mediaStream.active)
      console.log('📹 Video tracks:', mediaStream.getVideoTracks().length)
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        console.log('📹 Setting video source...')
        videoRef.current.srcObject = mediaStream
        
        // Force video to load and play
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded')
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('📹 Video playing successfully')
              setIsVideoReady(true)
            }).catch(error => {
              console.error('📹 Error playing video:', error)
              setCameraError('Error starting video playback')
            })
          }
        }
        
        videoRef.current.onerror = (error) => {
          console.error('📹 Video element error:', error)
          setCameraError('Video element error')
        }
        
        // Try to load metadata immediately
        try {
          await videoRef.current.load()
          console.log('📹 Video load called')
        } catch (loadError) {
          console.warn('📹 Video load failed:', loadError)
        }
      } else {
        console.error('📹 Video ref is null!')
        setCameraError('Video element not found')
      }
    } catch (error) {
      console.error('📹 Camera error:', error)
      let errorMessage = 'Unknown camera error'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions in your browser and refresh the page.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure your camera is connected and not in use by another application.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.'
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera settings not supported. Trying with basic settings...'
        } else {
          errorMessage = error.message
        }
      }
      
      setCameraError(errorMessage)
      
      // If overconstrained, try with basic settings
      if (error instanceof Error && error.name === 'OverconstrainedError') {
        try {
          console.log('📹 Retrying with basic camera settings...')
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
          
          console.log('📹 Basic stream obtained:', basicStream)
          setStream(basicStream)
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream
            await videoRef.current.play()
            setIsVideoReady(true)
            setCameraError(null)
            console.log('📹 Camera started with basic settings')
          }
        } catch (basicError) {
          console.error('📹 Basic camera settings also failed:', basicError)
        }
      }
    }
  }

  // Start recording function with enhanced error handling
  const startRecording = async () => {
    console.log('🎤 Starting recording...')
    
    if (!isRecognitionInitialized) {
      setSpeechError('🔄 Speech recognition not initialized. Please refresh the page and allow microphone access when prompted.')
      return
    }

    // Double-check microphone permissions before starting
    try {
      console.log('🎤 Testing microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately after testing
      console.log('🎤 Microphone available for recording')
    } catch (error) {
      console.error('🎤 Microphone not available:', error)
      
      // More specific error messages based on error type
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setSpeechError('🎤 Microphone access denied. Please click the padlock icon in your browser address bar and allow microphone access, then refresh the page.')
        } else if (error.name === 'NotFoundError') {
          setSpeechError('🎤 No microphone found. Please ensure your microphone is properly connected to your device.')
        } else if (error.name === 'NotReadableError') {
          setSpeechError('🎤 Microphone is in use by another application. Please close other applications that might be using your microphone.')
        } else if (error.name === 'AbortError') {
          setSpeechError('🎤 Microphone access request was aborted. Please try again.')
        } else {
          setSpeechError(`🎤 Microphone error: ${error.name}. Please check your device settings and browser permissions.`)
        }
      } else {
        setSpeechError('🎤 Microphone not available. Please ensure microphone permissions are granted in your browser settings.')
      }
      return
    }

    const success = multiLanguageSpeechService.startRecognition(
      (text: string, isFinal: boolean) => {
        console.log('🎤 Recognition result:', { text, isFinal })
        if (isFinal) {
          setCurrentAnswer(prev => {
            const newAnswer = prev + (prev ? ' ' : '') + text
            console.log('🎤 Final answer updated:', newAnswer)
            return newAnswer
          })
          setInterimText('')
          setSpeechError(null) // Clear any previous errors on successful transcription
        } else {
          setInterimText(text)
        }
      },
      (error: string) => {
        console.error('🎤 Recognition error:', error)
        
        // Enhanced error messaging for users
        if (error.includes('network')) {
          setSpeechError('🌐 Network issue detected. Please check your internet connection.')
        } else if (error.includes('no-speech')) {
          setSpeechError('🔇 No speech detected. Please speak clearly into your microphone.')
        } else if (error.includes('aborted')) {
          setSpeechError('⚠️ Speech recognition was interrupted. Try speaking again.')
        } else if (error.includes('not-allowed')) {
          setSpeechError('🔒 Microphone access denied. Please allow microphone access in your browser settings.')
        } else {
          setSpeechError(`🎤 Speech recognition error: ${error}. Try refreshing the page.`)
        }
        
        setIsRecording(false)
        setIsListening(false)
      }
    )

    if (success) {
      console.log('🎤 Recording started successfully')
      setIsRecording(true)
      setIsListening(true)
      setSpeechError(null)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      console.error('🎤 Failed to start recording')
      setSpeechError('Failed to start speech recognition. Please try again.')
    }
  }

  // Stop recording function
  const stopRecording = () => {
    multiLanguageSpeechService.stopRecognition()
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
    
    // Store the current answer
    const answerData = {
      questionId: currentQuestion.id.toString(),
      questionText: currentQuestion.text,
      answerText: currentAnswer.trim(),
      category: currentQuestion.category,
      recordingDuration: recordingDuration,
      timestamp: new Date()
    }
    
    setInterviewAnswers(prev => [...prev, answerData])
    
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
      // Interview complete - store data and navigate to analysis
      const finalAnswers = [...interviewAnswers, answerData]
      const interviewData = {
        answers: finalAnswers,
        role: selectedRole,
        experience: selectedExperience,
        language: selectedLanguage,
        interviewDuration: interviewTimer,
        timestamp: new Date().toISOString()
      }
      
      // Store in localStorage for analysis page
      localStorage.setItem('interviewData', JSON.stringify(interviewData))
      
      // Navigate to analysis page
      router.push('/summary')
    }
  }

  // Start interview timer on mount
  useEffect(() => {
    console.log('🔄 Timer effect triggered, questionsReady:', questionsReady, 'stream:', !!stream)
    if (questionsReady) {
      console.log('⏰ Starting interview timer')
      interviewTimerRef.current = setInterval(() => {
        setInterviewTimer(prev => prev + 1)
      }, 1000)
      
      // Auto-start camera when interview is ready - immediate start
      if (!stream) {
        console.log('📹 Auto-starting camera immediately...')
        setTimeout(() => {
          startCamera()
        }, 500) // Very short delay to ensure DOM is ready
      }
    }

    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
      }
    }
  }, [questionsReady, stream])

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

  // Debug logging
  console.log('🐛 Render state:', { 
    questionsLoading, 
    questionsReady, 
    questionsLength: questions.length, 
    currentQuestion: currentQuestion?.text?.substring(0, 50) + '...',
    configLoaded,
    stream: !!stream,
    isVideoReady
  })

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

              {/* Interview Preparation Instructions */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Interview Preparation</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">📹</span>
                    <span>Position yourself properly in front of the camera</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">💡</span>
                    <span>Ensure good lighting on your face</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">🎤</span>
                    <span>Check that your microphone is working</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">🔊</span>
                    <span>Turn on your speakers to hear questions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">🚀</span>
                    <span>Camera will start automatically when ready</span>
                  </div>
                </div>
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
              
              {loadingProgress === 0 && loadingMessage.includes('Failed') && (
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    🔄 Retry AI Question Generation
                  </Button>
                  <p className="mt-4 text-xs text-gray-500">
                    If this keeps failing, check your OpenRouter API key in .env.local
                  </p>
                </div>
              )}
              
              {loadingProgress < 100 && !loadingMessage.includes('Failed') && (
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
        {/* HTTPS Warning */}
        {typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">HTTPS Required</h3>
                <p className="text-red-700 text-sm">
                  Camera and microphone require HTTPS. Please use: <code className="bg-red-100 px-1 rounded">npm run dev-https</code>
                </p>
              </div>
            </div>
          </div>
        )}
        
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
                    <p className="text-lg font-medium text-gray-900 mb-3">
                      {currentQuestion.text}
                    </p>
                    
                    {/* Display MCQ options if available */}
                    {(currentQuestion as any).options && (
                      <div className="mt-4 ml-4">
                        <p className="font-medium text-sm text-gray-600 mb-2">Options:</p>
                        <div className="space-y-2">
                          {(currentQuestion as any).options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-start p-2 bg-white rounded border">
                              <span className="font-medium text-blue-600 mr-3">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span className="text-gray-800">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Actions */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => speakQuestionAI(currentQuestion.text)}
                      variant="outline"
                      size="sm"
                      disabled={aiAvatarSpeaking}
                      className="flex-1"
                    >
                      {aiAvatarSpeaking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Speaking...
                        </>
                      ) : (
                        <>
                          🔊 Repeat Question
                        </>
                      )}
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
                    {/* Always render video element, show overlay when no stream */}
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover rounded-lg bg-black"
                        autoPlay
                        muted
                        playsInline
                        controls={false}
                      />
                      
                      {/* Show start camera overlay when no stream */}
                      {!stream && (
                        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Camera starting automatically...</p>
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            {cameraError && (
                              <div className="mt-4">
                                <p className="text-red-600 text-sm mb-2">{cameraError}</p>
                                <Button onClick={startCamera} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                  <Video className="h-4 w-4 mr-2" />
                                  Retry Camera
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Show camera status badges when stream exists */}
                      {stream && (
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
                      )}
                      
                      {/* Show loading overlay when stream exists but video not ready */}
                      {stream && !isVideoReady && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Loading camera...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {cameraError && stream && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {cameraError}
                        <Button
                          onClick={startCamera}
                          size="sm"
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Retry Camera
                        </Button>
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
                    {/* Status Panel */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-green-800 mb-2">✅ System Status</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Interview Ready: {questionsReady ? '✅' : '⏳'}</div>
                        <div>Camera Status: {isVideoReady ? '📹 Active' : stream ? '⏳ Loading...' : '📹 Starting...'}</div>
                        <div>Speech Ready: {isRecognitionInitialized ? '🎤 Ready' : '⏳ Loading...'}</div>
                        <div>AI Status: {aiAvatarSpeaking ? '🗣️ Speaking' : '✅ Ready'}</div>
                      </div>
                      {/* Camera debugging info - only if there's an issue */}
                      {stream && !isVideoReady && (
                        <div className="mt-2 text-xs text-blue-600">
                          Camera initializing... Stream ID: {stream.id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                    
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
