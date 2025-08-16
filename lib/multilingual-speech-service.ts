// Enhanced multilingual speech service for both Indian and International languages
export class MultilanguageSpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentLanguage: string = 'en';
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private isInitialized: boolean = false;
  private retryCount: number = 0; // Track auto-retry attempts
  private isHttps: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

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
    'si': 'si-LK',    // Sinhala
    'my': 'my-MM'     // Burmese/Myanmar
  };

  // Indian languages list for special handling
  private indianLanguages = ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'ne', 'si', 'my'];

  constructor() {
    if (typeof window !== 'undefined') {
      this.isHttps = window.location.protocol === 'https:';
      console.log(`🔒 Running on ${this.isHttps ? 'HTTPS' : 'HTTP'} - Speech features: ${this.isHttps ? 'Full' : 'Limited'}`);
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
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
        console.log('✅ Speech Synthesis initialized');
      } else {
        console.warn('⚠️ Speech Synthesis not supported in this browser');
      }

      this.isInitialized = true;
      
      // Test if speech recognition actually works
      this.testSpeechRecognitionAvailability();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize speech services:', error);
      return false;
    }
  }

  // Test if speech recognition is actually available and working
  private async testSpeechRecognitionAvailability(): Promise<void> {
    if (!this.recognition) return;
    
    try {
      // Quick test to see if speech recognition works
      const testRecognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
      testRecognition.lang = 'en-US';
      testRecognition.continuous = false;
      testRecognition.interimResults = false;
      
      testRecognition.onstart = () => {
        console.log('✅ Speech recognition test successful');
        testRecognition.stop();
      };
      
      testRecognition.onerror = (event: any) => {
        console.warn(`⚠️ Speech recognition test failed: ${event.error}`);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.log('🔄 Switching to fallback speech input method');
        }
      };
      
      // Start test (will immediately stop)
      testRecognition.start();
      
    } catch (error) {
      console.warn('Speech recognition test failed:', error);
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
      
      // Handle different types of errors with specific solutions
      let errorMessage = '';
      let solution = '';
      
      switch (event.error) {
        case 'network':
          if (!this.isHttps) {
            errorMessage = '🔒 HTTPS Required: Speech recognition needs secure connection.';
            solution = 'Please use HTTPS or deploy to a secure server. For local development, try: npx serve -s build --ssl-cert';
          } else {
            errorMessage = '🌐 Network issue with speech recognition service.';
            solution = 'Check your internet connection and try again.';
          }
          break;
        case 'not-allowed':
          errorMessage = '🎤 Microphone access denied.';
          solution = 'Please click the microphone icon in your browser address bar and allow access, then refresh the page.';
          break;
        case 'no-speech':
          errorMessage = '🔇 No speech detected.';
          solution = 'Please speak clearly into your microphone. Make sure your microphone is not muted.';
          break;
        case 'audio-capture':
          errorMessage = '🎧 Microphone connection failed.';
          solution = 'Please check your microphone connection and browser permissions.';
          break;
        case 'service-not-allowed':
          if (!this.isHttps) {
            errorMessage = '🔒 Speech service requires HTTPS.';
            solution = 'Please use HTTPS or enable microphone permissions in your browser settings.';
          } else {
            errorMessage = '🚫 Speech service blocked.';
            solution = 'Please enable microphone permissions in your browser settings.';
          }
          break;
        case 'aborted':
          errorMessage = '⏹️ Speech recognition stopped.';
          solution = 'Click the microphone button to start recording again.';
          break;
        default:
          errorMessage = `❌ Speech error: ${event.error}`;
          solution = this.isHttps ? 'Try refreshing the page or restarting your browser.' : 'Please use HTTPS for full speech recognition support.';
      }
      
      const fullMessage = `${errorMessage} ${solution}`;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(fullMessage);
      }
      
      // Enhanced auto-retry logic
      if (event.error === 'network' || event.error === 'no-speech') {
        this.handleAutoRetry(event.error);
      }
      
      // For HTTPS issues, suggest solutions
      if (!this.isHttps && (event.error === 'network' || event.error === 'service-not-allowed')) {
        setTimeout(() => {
          if (this.onErrorCallback) {
            this.onErrorCallback('💡 Tip: For local HTTPS testing, run: npx http-server -S -C cert.pem -K key.pem');
          }
        }, 2000);
      }
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    this.recognition.onstart = () => {
      console.log('Speech recognition started successfully');
      // Reset retry counter on successful start
      this.retryCount = 0;
    };
  }

  // Handle auto-retry logic
  private handleAutoRetry(errorType: string): void {
    console.log(`🔄 Auto-retrying speech recognition after ${errorType} error...`);
    
    // Increment retry count
    this.retryCount = (this.retryCount || 0) + 1;
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 10000); // Exponential backoff, max 10s
    
    if (this.retryCount <= maxRetries) {
      setTimeout(() => {
        if (this.recognition && this.onResultCallback) {
          try {
            // Clear any previous error state
            this.stopRecognition();
            
            // Brief delay before restart
            setTimeout(() => {
              try {
                this.recognition!.start();
                console.log(`🔄 Speech recognition restarted (attempt ${this.retryCount}/${maxRetries})`);
              } catch (startError) {
                console.error('Failed to start recognition on retry:', startError);
                if (this.onErrorCallback) {
                  this.onErrorCallback('Auto-retry failed. Please click "Retry" manually.');
                }
              }
            }, 500);
            
          } catch (retryError) {
            console.error('Failed to restart recognition:', retryError);
            if (this.onErrorCallback) {
              this.onErrorCallback('Auto-retry failed. Please click "Retry" manually.');
            }
          }
        }
      }, retryDelay);
    } else {
      console.log('Max retries reached. Manual retry required.');
      if (this.onErrorCallback) {
        this.onErrorCallback('Max auto-retries reached. Please click "Retry" to try again manually.');
      }
    }
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

  // Reset retry counter (useful for manual retries)
  resetRetryCount(): void {
    this.retryCount = 0;
    console.log('🔄 Retry counter reset');
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
  async speak(text: string, languageCode?: string, onComplete?: () => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.synthesis) {
        console.error('Speech synthesis not available');
        reject('Speech synthesis not available');
        return;
      }

      const lang = languageCode || this.currentLanguage;
      
      try {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use the provided text directly (translation should happen before calling this function)
        const textToSpeak = text;
        console.log(`🎙️ TTS: Speaking "${textToSpeak}" in language: ${lang}`);

        const speechLang = this.speechLanguageMap[lang] || 'en-US';
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = speechLang;
        
        // Enhanced settings for Indian languages
        if (this.indianLanguages.includes(lang)) {
          utterance.rate = 0.6; // Slower for Indian languages for clarity
          utterance.pitch = 1.1; // Slightly higher pitch
          utterance.volume = 1.0; // Full volume
          console.log(`🇮🇳 Configured for Indian language: ${lang}`);
        } else {
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
        }

        // Wait for voices and select best one
        const voices = await this.waitForVoices();
        console.log(`🔍 Available voices for ${lang}:`, voices.length);
        
        // Debug: Log some available voices for debugging
        if (voices.length > 0) {
          const relevantVoices = voices.filter(v => 
            v.lang.includes(lang) || 
            v.lang.startsWith(lang.split('-')[0]) || 
            v.name.toLowerCase().includes(lang)
          );
          console.log(`🎯 Relevant voices for ${lang}:`, relevantVoices.map(v => `${v.name} (${v.lang})`));
        }
        
        const preferredVoice = this.findBestVoice(voices, lang);
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log(`🗣️ Speaking in ${lang} using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
        } else {
          console.warn(`⚠️ No specific voice found for ${lang}, using default voice`);
          console.log(`🔍 All available voices:`, voices.map(v => `${v.name} (${v.lang})`).slice(0, 10));
        }

        utterance.onstart = () => {
          console.log(`🎙️ Started speaking in ${lang}`);
        };

        // Ensure speech synthesis is ready
        if (this.synthesis.paused) {
          this.synthesis.resume();
        }

        // Start speaking
        this.synthesis.speak(utterance);
        
        // Add a timeout to prevent hanging - increased for longer questions
        const timeoutId = setTimeout(() => {
          if (this.synthesis && this.synthesis.speaking) {
            console.log('⏰ Speech synthesis timeout after 60 seconds, cancelling...');
            this.synthesis.cancel();
            if (onComplete) onComplete();
            reject('Speech synthesis timeout');
          }
        }, 60000); // 60 second timeout for longer questions
        
        // Clear timeout when speech ends normally
        utterance.onend = () => {
          clearTimeout(timeoutId);
          console.log(`✅ Speech synthesis completed for ${lang}`);
          if (onComplete) onComplete();
          resolve();
        };

        utterance.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error(`❌ Speech synthesis error for ${lang}:`, error);
          if (onComplete) onComplete(); // Still call completion to avoid hanging UI
          reject(error);
        };
        
      } catch (error) {
        console.error('Failed to speak:', error);
        if (onComplete) onComplete();
        reject(error);
      }
    });
  }

  // Real-time translation for Indian languages
  private async translateTextRealTime(text: string, targetLang: string): Promise<string> {
    try {
      // Simple translation mappings for common interview phrases
      const quickTranslations: { [key: string]: { [lang: string]: string } } = {
        'Tell me about yourself': {
          'hi': 'अपने बारे में बताइए',
          'ta': 'உங்களைப் பற்றி சொல்லுங்கள்',
          'te': 'మీ గురించి చెప్పండి',
          'bn': 'আপনার সম্পর্কে বলুন',
          'mr': 'आपल्याबद्दल सांगा',
          'gu': 'તમારા વિશે કહો'
        },
        'What is your experience': {
          'hi': 'आपका अनुभव क्या है',
          'ta': 'உங்கள் அனுபவம் என்ன',
          'te': 'మీ అనుభవం ఏమిటి',
          'bn': 'আপনার অভিজ্ঞতা কি',
          'mr': 'तुमचा अनुभव काय आहे',
          'gu': 'તમારો અનુભવ શું છે'
        },
        'Why do you want this job': {
          'hi': 'आप यह नौकरी क्यों चाहते हैं',
          'ta': 'இந்த வேலையை ஏன் விரும்புகிறீர்கள்',
          'te': 'మీరు ఈ ఉద్యోగాన్ని ఎందుకు కోరుకుంటున్నారు',
          'bn': 'আপনি কেন এই কাজ চান',
          'mr': 'तुम्हाला ही नोकरी का हवी आहे',
          'gu': 'તમે આ નોકરી કેમ ઇચ્છો છો'
        }
      };

      // Check for quick translations first
      for (const [english, translations] of Object.entries(quickTranslations)) {
        if (text.toLowerCase().includes(english.toLowerCase())) {
          const translation = translations[targetLang];
          if (translation) {
            return translation;
          }
        }
      }

      // For longer text, use a translation API
      const response = await fetch('https://api.mymemory.translated.net/get', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.responseData?.translatedText || text;
      }

      // Fallback: return original text
      return text;
      
    } catch (error) {
      console.warn('Real-time translation failed:', error);
      return text; // Return original text if translation fails
    }
  }

  // Find the best voice for a language
  private findBestVoice(voices: SpeechSynthesisVoice[], languageCode: string): SpeechSynthesisVoice | null {
    const targetLang = this.speechLanguageMap[languageCode] || 'en-US';
    const langPrefix = targetLang.split('-')[0];

    // Special handling for Indian languages
    if (this.indianLanguages.includes(languageCode)) {
      console.log(`🇮🇳 Finding voice for Indian language: ${languageCode} -> ${targetLang}`);
      
      // Special voice patterns for specific languages
      const languageSpecificPatterns: { [key: string]: string[] } = {
        'pa': ['punjabi', 'pa-', 'pa_'],
        'hi': ['hindi', 'hi-', 'hi_'],
        'bn': ['bengali', 'bangla', 'bn-', 'bn_'],
        'ta': ['tamil', 'ta-', 'ta_'],
        'te': ['telugu', 'te-', 'te_'],
        'kn': ['kannada', 'kn-', 'kn_'],
        'ml': ['malayalam', 'ml-', 'ml_'],
        'ur': ['urdu', 'ur-', 'ur_'],
        'ne': ['nepali', 'ne-', 'ne_'],
        'gu': ['gujarati', 'gu-', 'gu_'],
        'mr': ['marathi', 'mr-', 'mr_']
      };
      
      const patterns = languageSpecificPatterns[languageCode] || [];
      
      // Priority for Indian languages with specific pattern matching
      const indianVoicePriorities = [
        // 1. Exact language match with specific language name
        (v: SpeechSynthesisVoice) => v.lang === targetLang && patterns.some(pattern => 
          v.name.toLowerCase().includes(pattern.toLowerCase())),
        // 2. Exact language match with Indian-specific keywords
        (v: SpeechSynthesisVoice) => v.lang === targetLang && (
          v.name.toLowerCase().includes('indian') || 
          v.name.toLowerCase().includes('india') || 
          v.name.toLowerCase().includes('भारत')),
        // 3. Exact language match with quality indicators
        (v: SpeechSynthesisVoice) => v.lang === targetLang && (
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('microsoft') || 
          v.name.toLowerCase().includes('neural')),
        // 4. Any exact language match
        (v: SpeechSynthesisVoice) => v.lang === targetLang,
        // 5. Language prefix match
        (v: SpeechSynthesisVoice) => v.lang.startsWith(langPrefix),
        // 6. Fallback to any voice with language pattern in name
        (v: SpeechSynthesisVoice) => patterns.some(pattern => 
          v.name.toLowerCase().includes(pattern.toLowerCase()))
      ];

      for (const priority of indianVoicePriorities) {
        const voice = voices.find(priority);
        if (voice) {
          console.log(`✅ Selected Indian voice: ${voice.name} (${voice.lang}) for ${languageCode}`);
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
