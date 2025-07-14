// Language service for comprehensive language support
// Supports Indian regional languages and international languages via APIs

export interface Language {
  code: string
  name: string
  nativeName: string
  category: 'indian-regional' | 'international' | 'popular'
  rtl?: boolean
}

export interface LanguageService {
  translateText: (text: string, targetLanguage: string) => Promise<string>
  detectLanguage: (text: string) => Promise<string>
  getSupportedLanguages: () => Language[]
}

// Comprehensive language list
export const SUPPORTED_LANGUAGES: Language[] = [
  // Popular International Languages
  { code: 'en', name: 'English', nativeName: 'English', category: 'popular' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', category: 'popular' },
  { code: 'fr', name: 'French', nativeName: 'Français', category: 'popular' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', category: 'popular' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', category: 'popular' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', category: 'popular' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', category: 'popular' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', category: 'popular' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', category: 'popular' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', category: 'popular' },

  // Indian Regional Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', category: 'indian-regional' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', category: 'indian-regional' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', category: 'indian-regional' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', category: 'indian-regional' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', category: 'indian-regional' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', category: 'indian-regional' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', category: 'indian-regional' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', category: 'indian-regional' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', category: 'indian-regional' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', category: 'indian-regional' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', category: 'indian-regional' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', category: 'indian-regional', rtl: true },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', category: 'indian-regional' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', category: 'indian-regional' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', category: 'indian-regional', rtl: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', category: 'indian-regional' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', category: 'indian-regional' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', category: 'indian-regional' },

  // More International Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', category: 'international', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', category: 'international', rtl: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', category: 'international', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', category: 'international' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', category: 'international' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', category: 'international' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', category: 'international' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', category: 'international' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', category: 'international' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', category: 'international' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', category: 'international' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', category: 'international' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', category: 'international' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', category: 'international' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', category: 'international' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', category: 'international' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', category: 'international' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', category: 'international' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', category: 'international' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', category: 'international' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', category: 'international' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', category: 'international' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', category: 'international' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', category: 'international' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', category: 'international' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', category: 'international' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', category: 'international' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', category: 'international' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', category: 'international' },
]

// Multiple translation service providers
export class GoogleTranslateService implements LanguageService {
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          format: 'text'
        })
      })
      
      const data = await response.json()
      return data.data.translations[0].translatedText
    } catch (error) {
      console.error('Google Translate API error:', error)
      throw new Error('Translation failed')
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      })
      
      const data = await response.json()
      return data.data.detections[0][0].language
    } catch (error) {
      console.error('Language detection error:', error)
      throw new Error('Language detection failed')
    }
  }

  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES
  }
}

export class AzureTranslatorService implements LanguageService {
  private subscriptionKey: string
  private region: string
  
  constructor(subscriptionKey: string, region: string) {
    this.subscriptionKey = subscriptionKey
    this.region = region
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLanguage}`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Ocp-Apim-Subscription-Region': this.region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }])
      })
      
      const data = await response.json()
      return data[0].translations[0].text
    } catch (error) {
      console.error('Azure Translator API error:', error)
      throw new Error('Translation failed')
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch('https://api.cognitive.microsofttranslator.com/detect?api-version=3.0', {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Ocp-Apim-Subscription-Region': this.region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }])
      })
      
      const data = await response.json()
      return data[0].language
    } catch (error) {
      console.error('Language detection error:', error)
      throw new Error('Language detection failed')
    }
  }

  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES
  }
}

// Mock service for development
export class MockLanguageService implements LanguageService {
  async translateText(text: string, targetLanguage: string): Promise<string> {
    // Mock translation - in development mode
    console.log(`Mock translating "${text}" to ${targetLanguage}`)
    return `[${targetLanguage.toUpperCase()}] ${text}`
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple mock detection
    if (/[हिन्दी]/.test(text)) return 'hi'
    if (/[বাংলা]/.test(text)) return 'bn'
    if (/[தமிழ்]/.test(text)) return 'ta'
    if (/[తెలుగు]/.test(text)) return 'te'
    return 'en'
  }

  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES
  }
}

// Language service factory
export function createLanguageService(): LanguageService {
  const provider = process.env.LANGUAGE_SERVICE_PROVIDER || 'mock'
  
  switch (provider) {
    case 'google':
      if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
        console.warn('Google Translate API key not found, using mock service')
        return new MockLanguageService()
      }
      return new GoogleTranslateService(process.env.GOOGLE_TRANSLATE_API_KEY)
    
    case 'azure':
      if (!process.env.AZURE_TRANSLATOR_KEY || !process.env.AZURE_TRANSLATOR_REGION) {
        console.warn('Azure Translator credentials not found, using mock service')
        return new MockLanguageService()
      }
      return new AzureTranslatorService(
        process.env.AZURE_TRANSLATOR_KEY,
        process.env.AZURE_TRANSLATOR_REGION
      )
    
    default:
      return new MockLanguageService()
  }
}

// Utility functions
export function getLanguagesByCategory(category: Language['category']): Language[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang.category === category)
}

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

export function searchLanguages(query: string): Language[] {
  const lowercaseQuery = query.toLowerCase()
  return SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(lowercaseQuery) ||
    lang.nativeName.toLowerCase().includes(lowercaseQuery) ||
    lang.code.toLowerCase().includes(lowercaseQuery)
  )
}

// Browser speech recognition language mapping
export function getBrowserSpeechLanguage(languageCode: string): string {
  const speechLanguageMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'mr': 'mr-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ur': 'ur-IN',
    'ne': 'ne-NP',
    'si': 'si-LK',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'pt': 'pt-BR',
    'ru': 'ru-RU',
    'it': 'it-IT',
    'ar': 'ar-SA',
    'tr': 'tr-TR',
    'nl': 'nl-NL',
    'sv': 'sv-SE',
    'da': 'da-DK',
    'no': 'no-NO',
    'fi': 'fi-FI',
    'pl': 'pl-PL',
    'cs': 'cs-CZ',
    'hu': 'hu-HU',
    'ro': 'ro-RO',
    'bg': 'bg-BG',
    'hr': 'hr-HR',
    'sr': 'sr-RS',
    'sl': 'sl-SI',
    'et': 'et-EE',
    'lv': 'lv-LV',
    'lt': 'lt-LT',
    'el': 'el-GR',
    'th': 'th-TH',
    'vi': 'vi-VN',
    'id': 'id-ID',
    'ms': 'ms-MY',
    'tl': 'tl-PH',
    'sw': 'sw-KE',
    'af': 'af-ZA',
  }
  
  return speechLanguageMap[languageCode] || 'en-US'
}

export default createLanguageService
