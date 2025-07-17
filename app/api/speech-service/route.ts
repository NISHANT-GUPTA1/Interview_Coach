import { NextRequest, NextResponse } from 'next/server'

// Enhanced speech service API endpoint
export async function POST(request: NextRequest) {
  try {
    const { action, text, language, sourceLang, targetLang } = await request.json()
    
    switch (action) {
      case 'translate':
        return await handleTranslation(text, sourceLang, targetLang)
      case 'detect-language':
        return await handleLanguageDetection(text)
      case 'get-supported-languages':
        return NextResponse.json({ languages: getSupportedLanguages() })
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Speech service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Enhanced translation with multiple fallbacks
async function handleTranslation(text: string, sourceLang: string, targetLang: string) {
  if (!text || !sourceLang || !targetLang) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return NextResponse.json({ 
      translatedText: text,
      sourceLang,
      targetLang,
      originalText: text,
      provider: 'No translation needed'
    })
  }

  // Try multiple free translation services
  const translationServices = [
    () => translateWithMyMemory(text, sourceLang, targetLang),
    () => translateWithLibreTranslate(text, sourceLang, targetLang),
    () => translateWithGoogleTranslateAPI(text, sourceLang, targetLang),
    () => basicTranslate(text, sourceLang, targetLang)
  ]

  for (const service of translationServices) {
    try {
      const result = await service()
      if (result && result.translatedText && result.translatedText !== text) {
        console.log('✅ Translation successful:', result.provider)
        return NextResponse.json(result)
      }
    } catch (error) {
      console.log('❌ Translation service failed:', error)
      continue
    }
  }

  // If all services fail, return original text
  return NextResponse.json({ 
    translatedText: text,
    sourceLang,
    targetLang,
    originalText: text,
    provider: 'Fallback - original text'
  })
}

// MyMemory translation service (free)
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'AI Interview Coach'
    }
  })
  
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data.responseStatus === 200) {
    return {
      translatedText: data.responseData.translatedText,
      sourceLang,
      targetLang,
      originalText: text,
      provider: 'MyMemory'
    }
  } else {
    throw new Error(`MyMemory error: ${data.responseDetails}`)
  }
}

// LibreTranslate (free, self-hosted option)
async function translateWithLibreTranslate(text: string, sourceLang: string, targetLang: string) {
  // This would be used if you set up your own LibreTranslate instance
  // For now, we'll use the public demo (rate limited)
  const url = 'https://libretranslate.de/translate'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    })
  })
  
  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  return {
    translatedText: data.translatedText,
    sourceLang,
    targetLang,
    originalText: text,
    provider: 'LibreTranslate'
  }
}

// Google Translate API (unofficial, free)
async function translateWithGoogleTranslateAPI(text: string, sourceLang: string, targetLang: string) {
  // Using an unofficial Google Translate API
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data && data[0] && data[0][0] && data[0][0][0]) {
    return {
      translatedText: data[0][0][0],
      sourceLang,
      targetLang,
      originalText: text,
      provider: 'Google Translate'
    }
  } else {
    throw new Error('Invalid Google Translate response')
  }
}

// Basic dictionary-based translation for common phrases
async function basicTranslate(text: string, sourceLang: string, targetLang: string) {
  const basicTranslations: { [key: string]: { [key: string]: string } } = {
    'hello': {
      'hi': 'नमस्ते',
      'bn': 'হ্যালো',
      'te': 'హలో',
      'ta': 'வணக்கம்',
      'mr': 'नमस्कार',
      'gu': 'નમસ્તે',
      'kn': 'ನಮಸ್ಕಾರ',
      'ml': 'ഹലോ',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      'es': 'hola',
      'fr': 'bonjour',
      'de': 'hallo',
      'it': 'ciao',
      'pt': 'olá',
      'ru': 'привет',
      'zh': '你好',
      'ja': 'こんにちは',
      'ko': '안녕하세요',
      'ar': 'مرحبا',
      'th': 'สวัสดี',
      'vi': 'xin chào',
      'id': 'halo',
      'tr': 'merhaba',
      'pl': 'cześć',
      'nl': 'hallo'
    },
    'thank you': {
      'hi': 'धन्यवाद',
      'bn': 'ধন্যবাদ',
      'te': 'ధన్యవాదాలు',
      'ta': 'நன்றி',
      'mr': 'धन्यवाद',
      'gu': 'આભાર',
      'kn': 'ಧನ್ಯವಾದಗಳು',
      'ml': 'നന്ది',
      'pa': 'ਧੰਨਵਾਦ',
      'es': 'gracias',
      'fr': 'merci',
      'de': 'danke',
      'it': 'grazie',
      'pt': 'obrigado',
      'ru': 'спасибо',
      'zh': '谢谢',
      'ja': 'ありがとう',
      'ko': '감사합니다',
      'ar': 'شكرا',
      'th': 'ขอบคุณ',
      'vi': 'cảm ơn',
      'id': 'terima kasih',
      'tr': 'teşekkür ederim',
      'pl': 'dziękuję',
      'nl': 'dank je'
    },
    'good morning': {
      'hi': 'सुप्रभात',
      'bn': 'সুপ্রভাত',
      'te': 'శుభోదయం',
      'ta': 'காலை வணக்கம்',
      'mr': 'सुप्रभात',
      'gu': 'સુપ્રભાત',
      'kn': 'ಶುಭೋದಯ',
      'ml': 'സുപ്രഭാതം',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      'es': 'buenos días',
      'fr': 'bonjour',
      'de': 'guten Morgen',
      'it': 'buongiorno',
      'pt': 'bom dia',
      'ru': 'доброе утро',
      'zh': '早上好',
      'ja': 'おはようございます',
      'ko': '좋은 아침',
      'ar': 'صباح الخير',
      'th': 'สวัสดีตอนเช้า',
      'vi': 'chào buổi sáng',
      'id': 'selamat pagi',
      'tr': 'günaydın',
      'pl': 'dzień dobry',
      'nl': 'goedemorgen'
    }
  }
  
  const lowerText = text.toLowerCase().trim()
  
  if (basicTranslations[lowerText] && basicTranslations[lowerText][targetLang]) {
    return {
      translatedText: basicTranslations[lowerText][targetLang],
      sourceLang,
      targetLang,
      originalText: text,
      provider: 'Basic Dictionary'
    }
  }
  
  throw new Error('No basic translation available')
}

// Language detection
async function handleLanguageDetection(text: string) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData.match) {
      return NextResponse.json({
        detectedLanguage: data.responseData.match.split('-')[0],
        confidence: data.responseData.match.split('-')[1] || 1.0,
        text: text
      })
    }
    
    return NextResponse.json({
      detectedLanguage: 'en',
      confidence: 0.5,
      text: text
    })
  } catch (error) {
    console.error('Language detection error:', error)
    return NextResponse.json({
      detectedLanguage: 'en',
      confidence: 0.1,
      text: text
    })
  }
}

// Get supported languages
function getSupportedLanguages() {
  return {
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
}
