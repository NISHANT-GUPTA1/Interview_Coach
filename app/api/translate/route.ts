import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json()
    
    console.log('🌍 Translation request:', { text, sourceLang, targetLang })
    
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
    
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json({ 
      translatedText: text,
      sourceLang,
      targetLang,
      originalText: text,
      provider: 'Error fallback'
    }, { status: 200 })
  }
}

// Primary: MyMemory Translation API (Free)
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string) {
  const encodedText = encodeURIComponent(text.substring(0, 500))
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${targetLang}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; AI Interview Coach)'
    }
  })
  
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data.responseStatus === 200 && data.responseData) {
    return {
      translatedText: data.responseData.translatedText,
      sourceLang,
      targetLang,
      originalText: text,
      provider: 'MyMemory'
    }
  }
  
  throw new Error('MyMemory API returned error')
}

// Google Translate Free API
async function translateWithGoogleTranslateAPI(text: string, sourceLang: string, targetLang: string) {
  const encodedText = encodeURIComponent(text.substring(0, 500))
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`
  
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
      provider: 'Google Translate Free'
    }
  }
  
  throw new Error('Google Translate API returned no data')
}

// Basic phrase translation
async function basicTranslate(text: string, sourceLang: string, targetLang: string) {
  const commonPhrases: { [key: string]: { [key: string]: string } } = {
    'hello': {
      'es': 'hola', 'fr': 'bonjour', 'de': 'hallo', 'it': 'ciao', 'pt': 'olá',
      'ru': 'привет', 'zh': '你好', 'ja': 'こんにちは', 'ko': '안녕하세요',
      'ar': 'مرحبا', 'hi': 'नमस्ते', 'bn': 'হ্যালো', 'te': 'హలో',
      'ta': 'வணக்கம்', 'mr': 'नमस्कार', 'gu': 'નમસ્તે', 'kn': 'ನಮಸ್ಕಾರ',
      'ml': 'ഹലോ', 'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ur': 'سلام', 'th': 'สวัสดี',
      'vi': 'xin chào', 'id': 'halo', 'tr': 'merhaba', 'pl': 'cześć'
    },
    'thank you': {
      'es': 'gracias', 'fr': 'merci', 'de': 'danke', 'it': 'grazie', 'pt': 'obrigado',
      'ru': 'спасибо', 'zh': '谢谢', 'ja': 'ありがとう', 'ko': '감사합니다',
      'ar': 'شكرا', 'hi': 'धन्यवाद', 'bn': 'ধন্যবাদ', 'te': 'ధన్యవాదాలు',
      'ta': 'நன்றி', 'mr': 'धन्यवाद', 'gu': 'આભાર', 'kn': 'ಧನ್ಯವಾದಗಳು',
      'th': 'ขอบคุณ', 'vi': 'cảm ơn', 'id': 'terima kasih', 'tr': 'teşekkür ederim'
    },
    'tell me about yourself': {
      'es': 'cuéntame sobre ti', 'fr': 'parlez-moi de vous', 'de': 'erzählen Sie mir von sich',
      'hi': 'अपने बारे में बताएं', 'bn': 'আপনার সম্পর্কে বলুন', 'te': 'మీ గురించి చెప్పండి',
      'ta': 'உங்களைப் பற்றி சொல்லுங்கள்', 'mr': 'तुमच्या बद्दल सांगा', 'gu': 'તમારા વિશે કહો',
      'kn': 'ನಿಮ್ಮ ಬಗ್ಗೆ ಹೇಳಿ', 'ml': 'നിങ്ങളെക്കുറിച്ച് പറയൂ', 'pa': 'ਆਪਣੇ ਬਾਰੇ ਦੱਸੋ',
      'ur': 'اپنے بارے میں بتائیں', 'th': 'เล่าเกี่ยวกับตัวคุณ', 'vi': 'hãy nói về bản thân bạn'
    }
  }
  
  let translatedText = text
  const lowerText = text.toLowerCase()
  
  for (const [english, translations] of Object.entries(commonPhrases)) {
    if (lowerText.includes(english) && translations[targetLang]) {
      translatedText = translatedText.replace(
        new RegExp(english, 'gi'), 
        translations[targetLang]
      )
    }
  }
  
  if (translatedText === text) {
    throw new Error('No basic translation available')
  }
  
  return {
    translatedText,
    sourceLang,
    targetLang,
    originalText: text,
    provider: 'Basic Dictionary'
  }
}
      'mr': 'नमस्कार',
      'gu': 'નમસ્તે',
      'kn': 'ನಮಸ್ಕಾರ',
      'ml': 'ഹലോ',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      'ur': 'سلام',
      'ne': 'नमस्ते',
      'si': 'ආයුබෝවන්',
      'th': 'สวัสดี',
      'vi': 'xin chào',
      'id': 'halo',
      'ms': 'hello',
      'tl': 'hello',
      'tr': 'merhaba',
      'pl': 'cześć',
      'cs': 'ahoj',
      'hu': 'helló',
      'ro': 'salut',
      'nl': 'hallo',
      'sv': 'hej',
      'da': 'hej',
      'no': 'hei',
      'fi': 'hei'
    },
    'thank you': {
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
      'hi': 'धन्यवाद',
      'bn': 'ধন্যবাদ',
      'te': 'ధన్యవాదాలు',
      'ta': 'நன்றி',
      'mr': 'धन्यवाद',
      'gu': 'આભાર',
      'kn': 'ಧನ್ಯವಾದಗಳು',
      'ml': 'നന്ദി',
      'pa': 'ਧੰਨਵਾਦ',
      'ur': 'شکریہ',
      'ne': 'धन्यवाद',
      'si': 'ස්තුතියි',
      'th': 'ขอบคุณ',
      'vi': 'cảm ơn',
      'id': 'terima kasih',
      'ms': 'terima kasih',
      'tl': 'salamat',
      'tr': 'teşekkür ederim',
      'pl': 'dziękuję',
      'cs': 'děkuji',
      'hu': 'köszönöm',
      'ro': 'mulțumesc',
      'nl': 'dank je',
      'sv': 'tack',
      'da': 'tak',
      'no': 'takk',
      'fi': 'kiitos'
    },
    'good morning': {
      'es': 'buenos días',
      'fr': 'bonjour',
      'de': 'guten morgen',
      'it': 'buongiorno',
      'pt': 'bom dia',
      'ru': 'доброе утро',
      'zh': '早上好',
      'ja': 'おはよう',
      'ko': '좋은 아침',
      'ar': 'صباح الخير',
      'hi': 'सुप्रभात',
      'bn': 'শুভ সকাল',
      'te': 'శుభోదయం',
      'ta': 'காலை வணக்கம்',
      'mr': 'सुप्रभात',
      'gu': 'સુપ્રભાત',
      'kn': 'ಶುಭೋದಯ',
      'ml': 'സുപ്രഭാതം',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      'ur': 'صبح بخیر',
      'th': 'อรุณสวัสดิ์',
      'vi': 'chào buổi sáng',
      'id': 'selamat pagi',
      'tr': 'günaydın'
    }
  }
  
  let translatedText = text
  
  // Simple word replacement for common phrases
  const lowerText = text.toLowerCase()
  for (const [english, translations] of Object.entries(commonPhrases)) {
    if (lowerText.includes(english) && translations[targetLang]) {
      translatedText = translatedText.replace(
        new RegExp(english, 'gi'), 
        translations[targetLang]
      )
    }
  }
  
  // If no translation found, return original
  if (translatedText === text) {
    throw new Error('No basic translation available')
  }
  
  return {
    translatedText,
    sourceLang,
    targetLang,
    originalText: text,
    provider: 'Basic Dictionary'
  }
}
