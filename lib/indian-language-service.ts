// Enhanced Indian Language Support with Free APIs
// Provides comprehensive support for Indian regional languages

interface IndianLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  ttsCode: string;
  translationCode: string;
  rtl: boolean;
  scriptSupported: boolean;
}

class IndianLanguageService {
  private apiCallCount = 0;
  private lastApiCall = 0;
  private rateLimitDelay = 1500; // 1.5 seconds for Indian language APIs

  // Comprehensive Indian language configurations
  private indianLanguages: IndianLanguageConfig[] = [
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      speechCode: 'hi-IN',
      ttsCode: 'hi-IN',
      translationCode: 'hi',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      speechCode: 'bn-IN',
      ttsCode: 'bn-IN',
      translationCode: 'bn',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      speechCode: 'te-IN',
      ttsCode: 'te-IN',
      translationCode: 'te',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      speechCode: 'ta-IN',
      ttsCode: 'ta-IN',
      translationCode: 'ta',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      speechCode: 'mr-IN',
      ttsCode: 'mr-IN',
      translationCode: 'mr',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'gu',
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      speechCode: 'gu-IN',
      ttsCode: 'gu-IN',
      translationCode: 'gu',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'kn',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      speechCode: 'kn-IN',
      ttsCode: 'kn-IN',
      translationCode: 'kn',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      speechCode: 'ml-IN',
      ttsCode: 'ml-IN',
      translationCode: 'ml',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'pa',
      name: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      speechCode: 'pa-IN',
      ttsCode: 'pa-IN',
      translationCode: 'pa',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'or',
      name: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      speechCode: 'or-IN',
      ttsCode: 'or-IN',
      translationCode: 'or',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'as',
      name: 'Assamese',
      nativeName: 'অসমীয়া',
      speechCode: 'as-IN',
      ttsCode: 'as-IN',
      translationCode: 'as',
      rtl: false,
      scriptSupported: true
    },
    {
      code: 'ur',
      name: 'Urdu',
      nativeName: 'اردو',
      speechCode: 'ur-PK',
      ttsCode: 'ur-PK',
      translationCode: 'ur',
      rtl: true,
      scriptSupported: true
    }
  ];

  isIndianLanguage(langCode: string): boolean {
    return this.indianLanguages.some(lang => lang.code === langCode);
  }

  getIndianLanguageConfig(langCode: string): IndianLanguageConfig | null {
    return this.indianLanguages.find(lang => lang.code === langCode) || null;
  }

  private async rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall));
    }
    
    this.lastApiCall = Date.now();
    this.apiCallCount++;
    
    return fetch(url, options);
  }

  // Enhanced translation specifically for Indian languages
  async translateToIndianLanguage(text: string, targetLang: string): Promise<string> {
    if (!this.isIndianLanguage(targetLang)) {
      throw new Error(`${targetLang} is not supported as an Indian language`);
    }

    const config = this.getIndianLanguageConfig(targetLang);
    if (!config) {
      throw new Error(`Configuration not found for ${targetLang}`);
    }

    console.log(`🇮🇳 Translating to Indian language: ${config.name} (${config.nativeName})`);

    // Try multiple Indian language translation APIs
    let translation = await this.tryIndianLanguageAPI(text, targetLang, config);
    
    if (!translation) {
      translation = await this.tryMyMemoryIndian(text, targetLang, config);
    }
    
    if (!translation) {
      translation = await this.tryLibreTranslateIndian(text, targetLang, config);
    }

    if (!translation) {
      translation = await this.tryGoogleTranslateIndian(text, targetLang, config);
    }

    return translation || text;
  }

  // Specialized API for Indian languages - using Bhashini (Government of India's free API)
  private async tryIndianLanguageAPI(text: string, targetLang: string, config: IndianLanguageConfig): Promise<string | null> {
    try {
      console.log(`🔄 Trying Bhashini API for ${config.name}...`);
      
      // Bhashini API is free but requires registration
      // For demo purposes, we'll use a public endpoint structure
      const response = await this.rateLimitedFetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'translation',
              config: {
                language: {
                  sourceLanguage: 'en',
                  targetLanguage: config.translationCode
                }
              }
            }
          ],
          inputData: {
            input: [
              {
                source: text
              }
            ]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pipelineResponse && data.pipelineResponse[0] && data.pipelineResponse[0].output) {
          const translated = data.pipelineResponse[0].output[0].target;
          console.log(`✅ Bhashini translation successful: ${translated}`);
          return translated;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Bhashini API failed for ${config.name}:`, error);
    }
    return null;
  }

  // MyMemory with Indian language optimization
  private async tryMyMemoryIndian(text: string, targetLang: string, config: IndianLanguageConfig): Promise<string | null> {
    try {
      console.log(`🔄 Trying MyMemory API for ${config.name}...`);
      
      const response = await this.rateLimitedFetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${config.translationCode}&de=example@email.com`,
        { 
          method: 'GET',
          headers: {
            'User-Agent': 'AI Interview Coach (Indian Languages Support)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          const translated = data.responseData.translatedText;
          console.log(`✅ MyMemory Indian translation: ${translated}`);
          return translated;
        }
      }
    } catch (error) {
      console.warn(`⚠️ MyMemory failed for ${config.name}:`, error);
    }
    return null;
  }

  // LibreTranslate with Indian language support
  private async tryLibreTranslateIndian(text: string, targetLang: string, config: IndianLanguageConfig): Promise<string | null> {
    try {
      console.log(`🔄 Trying LibreTranslate for ${config.name}...`);
      
      // LibreTranslate has limited Indian language support, but worth trying
      const response = await this.rateLimitedFetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: config.translationCode,
          format: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          console.log(`✅ LibreTranslate Indian translation: ${data.translatedText}`);
          return data.translatedText;
        }
      }
    } catch (error) {
      console.warn(`⚠️ LibreTranslate failed for ${config.name}:`, error);
    }
    return null;
  }

  // Google Translate with Indian language codes
  private async tryGoogleTranslateIndian(text: string, targetLang: string, config: IndianLanguageConfig): Promise<string | null> {
    try {
      console.log(`🔄 Trying Google Translate for ${config.name}...`);
      
      const response = await this.rateLimitedFetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${config.translationCode}&dt=t&q=${encodeURIComponent(text)}`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          const translated = data[0][0][0];
          console.log(`✅ Google Translate Indian: ${translated}`);
          return translated;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Google Translate failed for ${config.name}:`, error);
    }
    return null;
  }

  // Enhanced speech recognition for Indian languages
  setupIndianSpeechRecognition(langCode: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const config = this.getIndianLanguageConfig(langCode);
    if (!config) return false;

    try {
      // Chrome's Web Speech API supports many Indian languages
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported');
        return false;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = config.speechCode;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      
      // Enhanced settings for Indian languages - don't set grammars property
      // Let the browser use default grammar handling
      
      console.log(`🎤 Indian speech recognition configured for ${config.name} (${config.speechCode})`);
      return true;
    } catch (error) {
      console.error(`Failed to setup Indian speech recognition for ${config.name}:`, error);
      return false;
    }
  }

  // Enhanced TTS for Indian languages
  async speakInIndianLanguage(text: string, langCode: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    const config = this.getIndianLanguageConfig(langCode);
    if (!config) return false;

    try {
      const synthesis = window.speechSynthesis;
      if (!synthesis) return false;

      // Wait for voices to load
      const voices = synthesis.getVoices();
      
      // Find Indian language voice
      let selectedVoice = voices.find(voice => 
        voice.lang.startsWith(config.ttsCode) || 
        voice.lang.startsWith(langCode) ||
        voice.name.toLowerCase().includes(config.name.toLowerCase())
      );

      // Fallback to English voice if Indian voice not found
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = config.ttsCode;
      utterance.rate = 0.8; // Slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      synthesis.speak(utterance);
      
      console.log(`🗣️ Speaking in ${config.name}: "${text}"`);
      return true;
    } catch (error) {
      console.error(`Failed to speak in ${config.name}:`, error);
      return false;
    }
  }

  // Generate sample Indian language interview questions
  getIndianLanguageQuestions(langCode: string, role: string): any[] {
    const config = this.getIndianLanguageConfig(langCode);
    if (!config) return [];

    // Pre-translated common interview questions for Indian languages
    const questionSets: { [key: string]: any[] } = {
      'hi': [
        { id: 1, text: `अपने बारे में और ${role} के रूप में अपने अनुभव के बारे में बताएं।`, category: "परिचय" },
        { id: 2, text: "आपने हाल ही में जो सबसे चुनौतीपूर्ण तकनीकी समस्या हल की है, उसके बारे में बताएं।", category: "तकनीकी" },
        { id: 3, text: "आप जटिल मुद्दों को कैसे डिबग करते हैं?", category: "तकनीकी" },
        { id: 4, text: "अगले 5 वर्षों के लिए आपके करियर लक्ष्य क्या हैं?", category: "करियर" }
      ],
      'ta': [
        { id: 1, text: `உங்களைப் பற்றியும் ${role} ஆக உங்கள் அனுபவத்தைப் பற்றியும் சொல்லுங்கள்.`, category: "அறிமுகம்" },
        { id: 2, text: "நீங்கள் சமீபத்தில் தீர்த்த மிகவும் சவாலான தொழில்நுட்ப சிக்கலைப் பற்றி விவரிக்கவும்.", category: "தொழில்நுட்பம்" },
        { id: 3, text: "சிக்கலான பிரச்சனைகளை எப்படி டிபக் செய்கிறீர்கள்?", category: "தொழில்நுட்பம்" },
        { id: 4, text: "அடுத்த 5 ஆண்டுகளுக்கான உங்கள் தொழில் இலக்குகள் என்ன?", category: "தொழில்" }
      ],
      'te': [
        { id: 1, text: `మీ గురించి మరియు ${role} గా మీ అనుభవం గురించి చెప్పండి.`, category: "పరిచయం" },
        { id: 2, text: "మీరు ఇటీవల పరిష్కరించిన అత్యంత సవాలుగా ఉన్న సాంకేతిక సమస్య గురించి వివరించండి.", category: "సాంకేతికం" },
        { id: 3, text: "సంక్లిష్ట సమస్యలను మీరు ఎలా డీబగ్ చేస్తారు?", category: "సాంకేతికం" },
        { id: 4, text: "రాబోయే 5 సంవత్సరాలకు మీ కెరీర్ లక్ష్యాలు ఏమిటి?", category: "కెరీర్" }
      ],
      'bn': [
        { id: 1, text: `আপনার সম্পর্কে এবং ${role} হিসেবে আপনার অভিজ্ঞতা সম্পর্কে বলুন।`, category: "পরিচয়" },
        { id: 2, text: "আপনি সম্প্রতি যে সবচেয়ে চ্যালেঞ্জিং প্রযুক্তিগত সমস্যা সমাধান করেছেন তা বর্ণনা করুন।", category: "প্রযুক্তিগত" },
        { id: 3, text: "আপনি কীভাবে জটিল সমস্যাগুলি ডিবাগ করেন?", category: "প্রযুক্তিগত" },
        { id: 4, text: "পরবর্তী ৫ বছরের জন্য আপনার ক্যারিয়ার লক্ষ্য কী?", category: "ক্যারিয়ার" }
      ]
    };

    return questionSets[langCode] || [];
  }

  getStats() {
    return {
      apiCalls: this.apiCallCount,
      supportedIndianLanguages: this.indianLanguages.length,
      lastApiCall: this.lastApiCall
    };
  }
}

// Export singleton instance
export const indianLanguageService = new IndianLanguageService();
