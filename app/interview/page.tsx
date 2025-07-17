"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot, Globe } from "lucide-react"

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
    'nl': 'nl-NL',
    'ca': 'ca-ES',
    'eu': 'eu-ES',
    'gl': 'gl-ES',
    'cy': 'cy-GB',
    'ga': 'ga-IE',
    'mt': 'mt-MT',
    'sq': 'sq-AL',
    'mk': 'mk-MK',
    'sr': 'sr-RS',
    'bs': 'bs-BA',
    'he': 'he-IL',
    'fa': 'fa-IR',
    'ka': 'ka-GE',
    'hy': 'hy-AM',
    'az': 'az-AZ',
    'uz': 'uz-UZ',
    'kk': 'kk-KZ',
    'ky': 'ky-KG',
    'mn': 'mn-MN'
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
    'nl': 'Nederlands',
    'ca': 'Català',
    'eu': 'Euskera',
    'gl': 'Galego',
    'cy': 'Cymraeg',
    'ga': 'Gaeilge',
    'mt': 'Malti',
    'sq': 'Shqip',
    'mk': 'Македонски',
    'sr': 'Српски',
    'bs': 'Bosanski',
    'he': 'עברית',
    'fa': 'فارسی',
    'ka': 'ქართული',
    'hy': 'Հայերեն',
    'az': 'Azərbaycan',
    'uz': 'O\'zbek',
    'kk': 'Қазақ',
    'ky': 'Кыргыз',
    'mn': 'Монгол'
  }

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
          autoGainControl: true,
          sampleRate: 44100
        }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Got media stream:', mediaStream)
      
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream
        
        videoRef.current.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loaded')
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing successfully')
              setStream(mediaStream)
              setIsVideoReady(true)
            }).catch(err => {
              console.error('Video play error:', err)
              setCameraError('Video playback failed')
            })
          }
        }, { once: true })
        
        videoRef.current.load()
      }
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera/microphone access denied. Please allow permissions and refresh.')
        } else if (error.name === 'NotFoundError') {
          setCameraError('Camera/microphone not found. Please check your devices.')
        } else if (error.name === 'NotReadableError') {
          setCameraError('Camera/microphone is being used by another application.')
        } else {
          setCameraError('Could not access camera/microphone: ' + error.message)
        }
      } else {
        setCameraError('Could not access camera/microphone. Please check permissions.')
      }
    }
  }

  const translateText = async (text: string, sourceLang: string, targetLang: string) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang
        })
      })
      
      if (!response.ok) {
        throw new Error('Translation failed')
      }
      
      const data = await response.json()
      return data.translatedText
    } catch (error) {
      console.error('Translation error:', error)
      return text // Return original text if translation fails
    }
  }

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognitionInstance = new SpeechRecognition()
    
    // Enhanced settings for better multilingual support
    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    
    // Set language based on selected language
    const speechLang = languageMap[selectedLanguage as keyof typeof languageMap] || 'en-US'
    recognitionInstance.lang = speechLang
    console.log('Setting speech recognition language to:', speechLang)
    
    recognitionInstance.maxAlternatives = 3
    
    recognitionInstance.onresult = async (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        console.log('Speech result:', transcript, 'isFinal:', event.results[i].isFinal)
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      // Update interim text for real-time feedback
      setInterimText(interimTranscript)
      
      if (finalTranscript.trim()) {
        const cleanedText = finalTranscript.trim()
        console.log('Final transcript:', cleanedText)
        
        // Update current answer immediately
        setCurrentAnswer(prev => {
          const newAnswer = prev ? prev + ' ' + cleanedText : cleanedText
          console.log('Updated answer:', newAnswer)
          return newAnswer
        })
        
        // If interview language is not English, translate for internal processing
        if (selectedLanguage !== 'en' && cleanedText) {
          try {
            setIsTranslating(true)
            console.log('Translating from', selectedLanguage, 'to English:', cleanedText)
            const translatedResponse = await translateText(cleanedText, selectedLanguage, 'en')
            if (translatedResponse && translatedResponse !== cleanedText) {
              setTranslatedText(translatedResponse)
              setDetectedLanguage(selectedLanguage)
              console.log('Translation result:', translatedResponse)
            }
          } catch (error) {
            console.error('Translation error:', error)
          } finally {
            setIsTranslating(false)
          }
        }
        
        setInterimText('')
        setSpeechError(null)
      }
      
      // Reset timeout for continuous listening
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current)
      }
      
      recognitionTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          try {
            console.log('Restarting speech recognition...')
            recognitionInstance.stop()
            setTimeout(() => {
              if (isRecording) {
                recognitionInstance.start()
              }
            }, 100)
          } catch (e) {
            console.log('Recognition restart failed:', e)
          }
        }
      }, 5000) // Increased timeout to 5 seconds
    }
    
    recognitionInstance.onstart = () => {
      setIsListening(true)
      setSpeechError(null)
      console.log('Speech recognition started for language:', selectedLanguage)
    }
    
    recognitionInstance.onend = () => {
      setIsListening(false)
      console.log('Speech recognition ended')
      
      // Auto-restart if still recording
      if (isRecording) {
        setTimeout(() => {
          try {
            if (recognitionInstance && isRecording) {
              console.log('Auto-restarting speech recognition...')
              recognitionInstance.start()
            }
          } catch (e) {
            console.log('Auto-restart failed:', e)
            setSpeechError('Speech recognition stopped. Please click the microphone button to restart.')
          }
        }, 500)
      }
    }
    
    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setInterimText('')
      
      const languageName = languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()
      
      switch (event.error) {
        case 'no-speech':
          setSpeechError(`No speech detected. Please speak clearly in ${languageName}.`)
          break
        case 'audio-capture':
          setSpeechError('Microphone not accessible. Please check permissions and try again.')
          break
        case 'not-allowed':
          setSpeechError('Microphone permission denied. Please allow access and refresh the page.')
          break
        case 'network':
          setSpeechError('Network error. Please check your internet connection.')
          break
        case 'language-not-supported':
          setSpeechError(`${languageName} language not supported for speech recognition. Try English instead.`)
          break
        default:
          setSpeechError(`Speech recognition error: ${event.error}. Please try again.`)
      }
      
      // Auto-retry for recoverable errors
      if (event.error === 'no-speech' && isRecording) {
        setTimeout(() => {
          try {
            recognitionInstance.start()
          } catch (e) {
            console.log('Auto-retry failed:', e)
          }
        }, 2000)
      }
    }
    
    setRecognition(recognitionInstance)
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
      
      if (response.ok) {
        const data = await response.json()
        const generatedQuestions = data.questions || generateFallbackQuestions()
        setQuestions(generatedQuestions)
        
        // Translate and speak the first question
        setTimeout(async () => {
          if (generatedQuestions.length > 0) {
            await speakQuestionAI(generatedQuestions[0].text)
          }
        }, 2000)
      } else {
        throw new Error('Failed to generate questions')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      const fallbackQuestions = generateFallbackQuestions()
      setQuestions(fallbackQuestions)
      setTimeout(async () => {
        await speakQuestionAI(fallbackQuestions[0].text)
      }, 2000)
    } finally {
      setIsLoading(false)
      setIsInterviewStarted(true)
    }
  }

  const generateFallbackQuestions = (): Question[] => {
    // Generate questions directly in selected language
    const baseQuestions = [
      { 
        id: 1, 
        text: `Hello! I'm your AI interviewer today. Please introduce yourself and tell me about your background as a ${selectedRole}.`, 
        category: 'Introduction', 
        difficulty: 'junior' as const 
      },
      { 
        id: 2, 
        text: `What motivated you to pursue a career in ${selectedRole}? What aspects of this field excite you the most?`, 
        category: 'Motivation', 
        difficulty: 'junior' as const 
      },
      { 
        id: 3, 
        text: `Tell me about a recent project you worked on. What was your role and what technologies or methods did you use?`, 
        category: 'Experience', 
        difficulty: 'mid' as const 
      },
      { 
        id: 4, 
        text: `How do you approach learning new technologies or skills in your field? Can you give me an example?`, 
        category: 'Learning', 
        difficulty: 'mid' as const 
      },
      { 
        id: 5, 
        text: `Describe a challenging problem you encountered in your work. How did you solve it?`, 
        category: 'Problem Solving', 
        difficulty: 'mid' as const 
      },
      { 
        id: 6, 
        text: `How do you ensure quality in your work? What processes or practices do you follow?`, 
        category: 'Quality', 
        difficulty: 'senior' as const 
      },
      { 
        id: 7, 
        text: `Tell me about a time when you had to work with difficult stakeholders or team members. How did you handle the situation?`, 
        category: 'Soft Skills', 
        difficulty: 'senior' as const 
      },
      { 
        id: 8, 
        text: `How do you stay updated with the latest trends and developments in ${selectedRole}?`, 
        category: 'Continuous Learning', 
        difficulty: 'mid' as const 
      },
      { 
        id: 9, 
        text: `What do you think are the most important skills for someone in your position? How do you develop these skills?`, 
        category: 'Skills', 
        difficulty: 'senior' as const 
      },
      { 
        id: 10, 
        text: `Where do you see yourself in the next 3-5 years? What are your career goals? Do you have any questions about this role?`, 
        category: 'Career Goals', 
        difficulty: 'mid' as const 
      }
    ]
    
    // If not English, we'll translate these in real-time
    return baseQuestions
  }

  const speakQuestionAI = async (text: string) => {
    if (!speechSynthesis) {
      console.log('Speech synthesis not available')
      setQuestionStartTime(new Date())
      return
    }
    
    speechSynthesis.cancel()
    setAiAvatarSpeaking(true)
    
    let textToSpeak = text
    
    // If selected language is not English, translate the question
    if (selectedLanguage !== 'en') {
      try {
        console.log('Translating question to', selectedLanguage)
        const translatedQuestion = await translateText(text, 'en', selectedLanguage)
        if (translatedQuestion && translatedQuestion !== text) {
          textToSpeak = translatedQuestion
          console.log('Translated question:', translatedQuestion)
        }
      } catch (error) {
        console.error('Question translation error:', error)
      }
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 0.9
    
    // Enhanced voice selection
    const setVoiceAndSpeak = () => {
      const voices = speechSynthesis.getVoices()
      const targetLang = selectedLanguage
      
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`))
      
      // Find the best voice for the selected language
      const preferredVoice = voices.find(voice => {
        const voiceLang = voice.lang.toLowerCase()
        return voiceLang.startsWith(targetLang.toLowerCase()) && (
          voice.name.toLowerCase().includes('google') ||
          voice.name.toLowerCase().includes('microsoft') ||
          voice.name.toLowerCase().includes('neural') ||
          voice.name.toLowerCase().includes('premium')
        )
      }) || voices.find(voice => voice.lang.toLowerCase().startsWith(targetLang.toLowerCase()))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
        utterance.lang = preferredVoice.lang
        console.log('Using voice:', preferredVoice.name, 'for language:', preferredVoice.lang)
      } else {
        const fallbackLang = languageMap[selectedLanguage as keyof typeof languageMap] || 'en-US'
        utterance.lang = fallbackLang
        console.log('Using fallback language:', fallbackLang)
      }
      
      utterance.onend = () => {
        setAiAvatarSpeaking(false)
        setQuestionStartTime(new Date())
      }
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error)
        setAiAvatarSpeaking(false)
        setQuestionStartTime(new Date())
      }
      
      speechSynthesis.speak(utterance)
    }
    
    // Wait for voices to be loaded
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true })
    } else {
      setVoiceAndSpeak()
    }
  }

  const startRecording = async () => {
    if (!stream) {
      console.error('No media stream available')
      setCameraError('Camera/microphone not ready. Please check permissions and try again.')
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
      setSpeechError('Microphone is disabled. Please enable it using the audio button.')
      return
    }
    
    console.log('Starting recording for language:', selectedLanguage)
    setIsRecording(true)
    setRecordingDuration(0)
    setCurrentAnswer("")
    setInterimText("")
    setSpeechError(null)
    setTranslatedText("")
    setDetectedLanguage(null)
    
    // Start speech recognition
    if (recognition) {
      try {
        console.log('Starting speech recognition for language:', selectedLanguage)
        recognition.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setSpeechError('Failed to start speech recognition. Please try again.')
      }
    } else {
      setSpeechError('Speech recognition not available. Please check browser compatibility.')
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
                <p className="text-gray-600">
                  Generating personalized questions for {selectedRole} in {languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()}...
                </p>
                <div className="text-sm text-gray-500">
                  Role: {selectedRole} | Level: {candidateProfile.level} | Language: {languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage}
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
                        🎤 Listening ({languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage.toUpperCase()})
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
                
                {/* Enhanced Speech Error Display */}
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
                          if (recognition) {
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
                      disabled={!stream}
                      className={`flex items-center space-x-2 transition-all ${
                        isListening ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
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
                      disabled={!currentAnswer.trim() || isAIThinking}
                      className="flex items-center space-x-2"
                    >
                      <span>Submit Answer</span>
                    </Button>
                  </div>
                </div>
                
                {/* Enhanced response info */}
                {currentAnswer.length > 0 && (
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>
                      Words: {currentAnswer.trim().split(/\s+/).length}
                      {detectedLanguage && selectedLanguage !== 'en' && (
                        <span className="ml-2">| Language: {languageNames[detectedLanguage as keyof typeof languageNames] || detectedLanguage.toUpperCase()}</span>
                      )}
                    </span>
                    <span>Time: {formatTime(Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000))}</span>
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
