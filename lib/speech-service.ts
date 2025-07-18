// Enhanced Speech Service with Free APIs
export class SpeechService {
  private recognition: any = null
  private synthesis: SpeechSynthesis | null = null
  private currentLanguage: string = 'en'
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null
  private isInitialized: boolean = false

  // Enhanced language mapping with more comprehensive support
  private languageMap: { [key: string]: string } = {
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

  // TTS voice mapping for better language support
  private ttsVoiceMap: { [key: string]: string } = {
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
    'bn': 'bn-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'th': 'th-TH',
    'vi': 'vi-VN',
    'id': 'id-ID',
    'tr': 'tr-TR',
    'nl': 'nl-NL'
  }

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis
      this.initializeSpeechRecognition()
      this.isInitialized = true
    }
  }

  // Initialize speech recognition with enhanced error handling
  private initializeSpeechRecognition() {
    // Check if we're on client side
    if (typeof window === 'undefined') {
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.onErrorCallback?.('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    this.recognition = new SpeechRecognition()

    // Enhanced settings for better recognition
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 3

    this.recognition.onresult = (event: any) => {
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

      // Call the callback with interim results
      if (interimTranscript) {
        this.onResultCallback?.(interimTranscript, false)
      }

      // Call the callback with final results
      if (finalTranscript.trim()) {
        this.onResultCallback?.(finalTranscript.trim(), true)
      }
    }

    this.recognition.onerror = (event: any) => {
      this.handleSpeechError(event.error)
    }

    this.recognition.onend = () => {
      console.log('Speech recognition ended')
    }
  }

  // Enhanced error handling
  private handleSpeechError(error: string) {
    console.log('Speech recognition error:', error)
    
    switch (error) {
      case 'network':
        console.log('Network error - continuing with offline recognition')
        // Don't show error for network issues, just continue
        break
      case 'no-speech':
        this.onErrorCallback?.('No speech detected. Please speak clearly.')
        break
      case 'audio-capture':
        this.onErrorCallback?.('Microphone not accessible. Please check permissions.')
        break
      case 'not-allowed':
        this.onErrorCallback?.('Microphone permission denied. Please allow access.')
        break
      case 'language-not-supported':
        this.onErrorCallback?.('Language not supported. Switching to English.')
        this.setLanguage('en')
        break
      default:
        this.onErrorCallback?.(`Speech recognition error: ${error}`)
    }
  }

  // Set language for speech recognition
  setLanguage(language: string) {
    this.currentLanguage = language
    if (this.recognition && this.isInitialized) {
      const speechLang = this.languageMap[language] || 'en-US'
      this.recognition.lang = speechLang
      console.log('Set speech recognition language to:', speechLang)
    }
  }

  // Start speech recognition
  startRecognition(onResult: (text: string, isFinal: boolean) => void, onError: (error: string) => void) {
    if (!this.isInitialized) {
      onError('Speech recognition not initialized (client-side only)')
      return false
    }

    if (!this.recognition) {
      onError('Speech recognition not initialized')
      return false
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError

    try {
      this.recognition.start()
      console.log('Speech recognition started for language:', this.currentLanguage)
      return true
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      onError('Failed to start speech recognition')
      return false
    }
  }

  // Stop speech recognition
  stopRecognition() {
    if (this.recognition && this.isInitialized) {
      try {
        this.recognition.stop()
        console.log('Speech recognition stopped')
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    }
  }

  // Text-to-speech with enhanced language support
  async speak(text: string, language: string = 'en'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized) {
        reject('Speech synthesis not initialized (client-side only)')
        return
      }

      if (!this.synthesis) {
        reject('Speech synthesis not supported')
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 0.9

      // Set language
      const ttsLang = (this.ttsVoiceMap as any)[language] || (this.languageMap as any)[language] || 'en-US'
      utterance.lang = ttsLang

      // Find the best voice for the language
      const voices = this.synthesis.getVoices()
      const preferredVoice = this.findBestVoice(voices, language)
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
        console.log('Using voice:', preferredVoice.name, 'for language:', preferredVoice.lang)
      } else {
        console.log('Using default voice for language:', ttsLang)
      }

      utterance.onend = () => {
        console.log('Speech synthesis completed')
        resolve()
      }

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error)
        reject(error)
      }

      try {
        this.synthesis.speak(utterance)
      } catch (error) {
        console.error('Failed to speak:', error)
        reject(error)
      }
    })
  }

  // Find the best voice for a given language
  private findBestVoice(voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null {
    const targetLang = (this.ttsVoiceMap as any)[language] || (this.languageMap as any)[language] || 'en-US'
    
    // Priority order: Google > Microsoft > Neural > Default
    const priorities = ['google', 'microsoft', 'neural', 'default']
    
    for (const priority of priorities) {
      const voice = voices.find(v => {
        const voiceLang = v.lang.toLowerCase()
        const voiceName = v.name.toLowerCase()
        return voiceLang.startsWith(targetLang.toLowerCase().split('-')[0]) && 
               voiceName.includes(priority)
      })
      
      if (voice) return voice
    }
    
    // Fallback to any voice that matches the language
    return voices.find(v => {
      const voiceLang = v.lang.toLowerCase()
      return voiceLang.startsWith(targetLang.toLowerCase().split('-')[0])
    }) || null
  }

  // Wait for voices to be loaded
  async waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis || !this.isInitialized) {
        resolve()
        return
      }

      const voices = this.synthesis.getVoices()
      if (voices.length > 0) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        console.log('Voice loading timeout')
        resolve()
      }, 3000)

      this.synthesis.addEventListener('voiceschanged', () => {
        clearTimeout(timeout)
        console.log('Voices loaded:', this.synthesis!.getVoices().length)
        resolve()
      }, { once: true })
    })
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    return Object.keys(this.languageMap)
  }

  // Check if language is supported
  isLanguageSupported(language: string): boolean {
    return language in this.languageMap
  }

  // Check if service is initialized
  isReady(): boolean {
    return this.isInitialized
  }
}

// Free translation service using enhanced API
export class TranslationService {
  private cache: Map<string, string> = new Map()

  async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    const cacheKey = `${fromLang}-${toLang}-${text}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const response = await fetch('/api/speech-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'translate',
          text,
          sourceLang: fromLang,
          targetLang: toLang
        })
      })
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.translatedText) {
        this.cache.set(cacheKey, data.translatedText)
        return data.translatedText
      } else {
        throw new Error(`Translation failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Translation error:', error)
      return text // Return original text if translation fails
    }
  }

  // Detect language
  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch('/api/speech-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'detect-language',
          text
        })
      })
      
      if (!response.ok) {
        throw new Error(`Language detection API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.detectedLanguage || 'en'
    } catch (error) {
      console.error('Language detection error:', error)
      return 'en'
    }
  }

  // Get supported languages
  async getSupportedLanguages(): Promise<{ [key: string]: string }> {
    try {
      const response = await fetch('/api/speech-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-supported-languages'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Supported languages API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.languages || {}
    } catch (error) {
      console.error('Get supported languages error:', error)
      return {}
    }
  }
}

// Create singleton instances (client-side only)
let speechServiceInstance: SpeechService | null = null
let translationServiceInstance: TranslationService | null = null

export const getSpeechService = (): SpeechService => {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService()
  }
  return speechServiceInstance
}

export const getTranslationService = (): TranslationService => {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService()
  }
  return translationServiceInstance
}

// For backward compatibility - lazy initialization
export const speechService = {
  setLanguage: (language: string) => {
    if (typeof window !== 'undefined') {
      getSpeechService().setLanguage(language)
    }
  },
  startRecognition: (onResult: (text: string, isFinal: boolean) => void, onError: (error: string) => void) => {
    if (typeof window !== 'undefined') {
      return getSpeechService().startRecognition(onResult, onError)
    }
    return false
  },
  stopRecognition: () => {
    if (typeof window !== 'undefined') {
      getSpeechService().stopRecognition()
    }
  },
  speak: (text: string, language?: string) => {
    if (typeof window !== 'undefined') {
      return getSpeechService().speak(text, language)
    }
    return Promise.resolve()
  },
  waitForVoices: () => {
    if (typeof window !== 'undefined') {
      return getSpeechService().waitForVoices()
    }
    return Promise.resolve()
  },
  isReady: () => {
    if (typeof window !== 'undefined') {
      return getSpeechService().isReady()
    }
    return false
  },
  getSupportedLanguages: () => {
    if (typeof window !== 'undefined') {
      return getSpeechService().getSupportedLanguages()
    }
    return []
  },
  isLanguageSupported: (language: string) => {
    if (typeof window !== 'undefined') {
      return getSpeechService().isLanguageSupported(language)
    }
    return false
  }
}

export const translationService = {
  translate: (text: string, fromLang: string, toLang: string) => 
    getTranslationService().translate(text, fromLang, toLang),
  detectLanguage: (text: string) => getTranslationService().detectLanguage(text),
  getSupportedLanguages: () => getTranslationService().getSupportedLanguages()
}
