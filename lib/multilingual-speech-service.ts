// Enhanced multilingual speech service for both Indian and International languages
export class MultilanguageSpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentLanguage: string = 'en';
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private isInitialized: boolean = false;

  // Comprehensive language mapping for speech recognition
  private speechLanguageMap: { [key: string]: string } = {
    // International languages
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
    'th': 'th-TH',
    'vi': 'vi-VN',
    'id': 'id-ID',
    'ms': 'ms-MY',
    'tl': 'tl-PH',
    'tr': 'tr-TR',
    'pl': 'pl-PL',
    'cs': 'cs-CZ',
    'hu': 'hu-HU',
    'ro': 'ro-RO',
    'nl': 'nl-NL',
    'sv': 'sv-SE',
    'da': 'da-DK',
    'no': 'no-NO',
    'fi': 'fi-FI',
    
    // Indian languages - comprehensive mapping
    'hi': 'hi-IN',    // Hindi
    'bn': 'bn-IN',    // Bengali
    'te': 'te-IN',    // Telugu
    'ta': 'ta-IN',    // Tamil
    'mr': 'mr-IN',    // Marathi
    'gu': 'gu-IN',    // Gujarati
    'kn': 'kn-IN',    // Kannada
    'ml': 'ml-IN',    // Malayalam
    'pa': 'pa-IN',    // Punjabi
    'or': 'or-IN',    // Odia
    'as': 'as-IN',    // Assamese
    'ur': 'ur-PK',    // Urdu
    'ne': 'ne-NP',    // Nepali
    'si': 'si-LK'     // Sinhala
  };

  // Indian languages list for special handling
  private indianLanguages = ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'ne', 'si'];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  // Initialize speech services
  private initialize(): boolean {
    try {
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognitionDefaults();
        console.log('✅ Speech Recognition initialized');
      } else {
        console.warn('⚠️ Speech Recognition not supported in this browser');
        return false;
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
        console.log('✅ Speech Synthesis initialized');
      } else {
        console.warn('⚠️ Speech Synthesis not supported in this browser');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize speech services:', error);
      return false;
    }
  }

  // Setup default recognition settings
  private setupRecognitionDefaults(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    // Setup event handlers
    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Call result callback
      if (this.onResultCallback) {
        if (finalTranscript) {
          this.onResultCallback(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.onResultCallback(interimTranscript.trim(), false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle different types of errors
      let errorMessage = '';
      switch (event.error) {
        case 'network':
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permission and refresh the page.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly into the microphone.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please try again.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
      
      // Auto-retry for network errors
      if (event.error === 'network') {
        console.log('🔄 Auto-retrying speech recognition after network error...');
        setTimeout(() => {
          if (this.recognition && this.onResultCallback) {
            try {
              this.recognition.start();
              console.log('🔄 Speech recognition restarted after network error');
            } catch (retryError) {
              console.error('Failed to restart recognition:', retryError);
            }
          }
        }, 2000);
      }
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized && this.recognition !== null;
  }

  // Set language for speech recognition
  setLanguage(languageCode: string): boolean {
    if (!this.recognition) {
      console.warn('Speech recognition not initialized');
      return false;
    }

    try {
      this.currentLanguage = languageCode;
      const speechLang = this.speechLanguageMap[languageCode] || 'en-US';
      
      this.recognition.lang = speechLang;
      
      // Special handling for Indian languages
      if (this.indianLanguages.includes(languageCode)) {
        console.log(`🇮🇳 Configured Indian language speech recognition: ${languageCode} -> ${speechLang}`);
        
        // Enhanced settings for Indian languages
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 5; // More alternatives for better accuracy
      } else {
        console.log(`🌍 Configured international language speech recognition: ${languageCode} -> ${speechLang}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to set speech recognition language:', error);
      return false;
    }
  }

  // Start speech recognition
  startRecognition(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): boolean {
    if (!this.isReady()) {
      onError('Speech recognition not available. Please check browser support.');
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    try {
      // Stop any existing recognition
      this.stopRecognition();
      
      // Ensure language is set
      if (!this.recognition.lang) {
        this.setLanguage(this.currentLanguage);
      }
      
      console.log(`🎤 Starting speech recognition for: ${this.currentLanguage} (${this.recognition.lang})`);
      
      // Add a small delay to prevent rapid restart issues
      setTimeout(() => {
        try {
          this.recognition.start();
          console.log(`✅ Speech recognition started successfully for ${this.currentLanguage}`);
        } catch (startError) {
          console.error('Failed to start speech recognition:', startError);
          onError(`Failed to start speech recognition: ${startError}`);
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      onError(`Failed to initialize speech recognition: ${error}`);
      return false;
    }
  }

  // Stop speech recognition
  stopRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('🛑 Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  // Text-to-speech with multilingual support
  async speak(text: string, languageCode?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.synthesis) {
        reject('Speech synthesis not available');
        return;
      }

      const lang = languageCode || this.currentLanguage;
      const speechLang = this.speechLanguageMap[lang] || 'en-US';

      try {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        // Wait a bit for the cancel to take effect
        await new Promise(resolve => setTimeout(resolve, 100));

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang;
        
        // Adjust speech parameters based on language
        if (this.indianLanguages.includes(lang)) {
          utterance.rate = 0.7; // Slower for Indian languages for clarity
          utterance.pitch = 1.1; // Slightly higher pitch
        } else {
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
        }
        
        utterance.volume = 0.9;

        // Wait for voices to be available
        const voices = await this.waitForVoices();
        const preferredVoice = this.findBestVoice(voices, lang);
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log(`🗣️ Speaking in ${lang} using voice: ${preferredVoice.name}`);
        } else {
          console.log(`🗣️ Speaking in ${lang} using default voice (no specific voice found)`);
        }

        utterance.onend = () => {
          console.log(`✅ Speech synthesis completed for ${lang}`);
          resolve();
        };

        utterance.onerror = (error) => {
          console.error(`❌ Speech synthesis error for ${lang}:`, error);
          reject(error);
        };

        // Start speaking
        this.synthesis.speak(utterance);
        
        // Add a timeout to prevent hanging
        setTimeout(() => {
          if (this.synthesis && this.synthesis.speaking) {
            console.log('⏰ Speech synthesis timeout, cancelling...');
            this.synthesis.cancel();
            reject('Speech synthesis timeout');
          }
        }, 30000); // 30 second timeout
        
      } catch (error) {
        console.error('Failed to speak:', error);
        reject(error);
      }
    });
  }

  // Find the best voice for a language
  private findBestVoice(voices: SpeechSynthesisVoice[], languageCode: string): SpeechSynthesisVoice | null {
    const targetLang = this.speechLanguageMap[languageCode] || 'en-US';
    const langPrefix = targetLang.split('-')[0];

    // Special handling for Indian languages
    if (this.indianLanguages.includes(languageCode)) {
      console.log(`🇮🇳 Finding voice for Indian language: ${languageCode} -> ${targetLang}`);
      
      // Priority for Indian languages
      const indianVoicePriorities = [
        (v: SpeechSynthesisVoice) => v.lang === targetLang && (v.name.toLowerCase().includes('indian') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('bengali')),
        (v: SpeechSynthesisVoice) => v.lang === targetLang && v.name.toLowerCase().includes('google'),
        (v: SpeechSynthesisVoice) => v.lang === targetLang && v.name.toLowerCase().includes('microsoft'),
        (v: SpeechSynthesisVoice) => v.lang === targetLang,
        (v: SpeechSynthesisVoice) => v.lang.startsWith(langPrefix),
      ];

      for (const priority of indianVoicePriorities) {
        const voice = voices.find(priority);
        if (voice) {
          console.log(`✅ Selected Indian voice: ${voice.name} (${voice.lang})`);
          return voice;
        }
      }
    }

    // Priority order for international languages
    const priorities = [
      (v: SpeechSynthesisVoice) => v.lang === targetLang && v.name.toLowerCase().includes('google'),
      (v: SpeechSynthesisVoice) => v.lang === targetLang && v.name.toLowerCase().includes('microsoft'),
      (v: SpeechSynthesisVoice) => v.lang === targetLang && v.name.toLowerCase().includes('neural'),
      (v: SpeechSynthesisVoice) => v.lang === targetLang && v.name.toLowerCase().includes('premium'),
      (v: SpeechSynthesisVoice) => v.lang === targetLang,
      (v: SpeechSynthesisVoice) => v.lang.startsWith(langPrefix)
    ];

    for (const priority of priorities) {
      const voice = voices.find(priority);
      if (voice) {
        console.log(`✅ Selected voice: ${voice.name} (${voice.lang}) for ${languageCode}`);
        return voice;
      }
    }

    // Fallback to first available voice
    const fallbackVoice = voices.length > 0 ? voices[0] : null;
    if (fallbackVoice) {
      console.log(`⚠️ Using fallback voice: ${fallbackVoice.name} (${fallbackVoice.lang})`);
    }
    return fallbackVoice;
  }

  // Wait for voices to be loaded
  async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve([]);
        return;
      }

      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Wait for voices to load
      const timeout = setTimeout(() => {
        resolve(this.synthesis?.getVoices() || []);
      }, 1000);

      this.synthesis.onvoiceschanged = () => {
        clearTimeout(timeout);
        resolve(this.synthesis?.getVoices() || []);
      };
    });
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    return Object.keys(this.speechLanguageMap);
  }

  // Check if language is supported
  isLanguageSupported(languageCode: string): boolean {
    return languageCode in this.speechLanguageMap;
  }

  // Check if language is Indian
  isIndianLanguage(languageCode: string): boolean {
    return this.indianLanguages.includes(languageCode);
  }
}

// Export singleton instance
export const multiLanguageSpeechService = new MultilanguageSpeechService();
