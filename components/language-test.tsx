import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Mic, Volume2 } from 'lucide-react'

interface LanguageTestProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  onTest: (type: 'speech' | 'tts') => void
}

const supportedLanguages = {
  // English
  'en': 'English',
  
  // Indian Languages
  'hi': 'हिन्दी (Hindi)',
  'bn': 'বাংলা (Bengali)',
  'te': 'తెలుగు (Telugu)',
  'ta': 'தமிழ் (Tamil)',
  'mr': 'मराठी (Marathi)',
  'gu': 'ગુજરાતી (Gujarati)',
  'kn': 'ಕನ್ನಡ (Kannada)',
  'ml': 'മലയാളം (Malayalam)',
  'pa': 'ਪੰਜਾਬੀ (Punjabi)',
  'or': 'ଓଡ଼ିଆ (Odia)',
  'as': 'অসমীয়া (Assamese)',
  'ur': 'اردو (Urdu)',
  'ne': 'नेपाली (Nepali)',
  'si': 'සිංහල (Sinhala)',
  
  // Asian Languages
  'zh': '中文 (Chinese)',
  'ja': '日本語 (Japanese)',
  'ko': '한국어 (Korean)',
  'th': 'ไทย (Thai)',
  'vi': 'Tiếng Việt (Vietnamese)',
  'id': 'Bahasa Indonesia',
  'ms': 'Bahasa Melayu',
  'tl': 'Filipino',
  'my': 'မြန်မာ (Myanmar)',
  
  // European Languages
  'es': 'Español (Spanish)',
  'fr': 'Français (French)',
  'de': 'Deutsch (German)',
  'it': 'Italiano (Italian)',
  'pt': 'Português (Portuguese)',
  'ru': 'Русский (Russian)',
  'pl': 'Polski (Polish)',
  'nl': 'Nederlands (Dutch)',
  'cs': 'Čeština (Czech)',
  'hu': 'Magyar (Hungarian)',
  'ro': 'Română (Romanian)',
  'bg': 'Български (Bulgarian)',
  'hr': 'Hrvatski (Croatian)',
  'sk': 'Slovenčina (Slovak)',
  'sl': 'Slovenščina (Slovenian)',
  'et': 'Eesti (Estonian)',
  'lv': 'Latviešu (Latvian)',
  'lt': 'Lietuvių (Lithuanian)',
  'fi': 'Suomi (Finnish)',
  'da': 'Dansk (Danish)',
  'no': 'Norsk (Norwegian)',
  'sv': 'Svenska (Swedish)',
  'is': 'Íslenska (Icelandic)',
  
  // Middle Eastern & African Languages
  'ar': 'العربية (Arabic)',
  'tr': 'Türkçe (Turkish)',
  'sw': 'Kiswahili (Swahili)',
  'am': 'አማርኛ (Amharic)',
}

export default function LanguageTest({ selectedLanguage, onLanguageChange, onTest }: LanguageTestProps) {
  const groupedLanguages = {
    'Indian Languages': ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'ne', 'si'],
    'Asian Languages': ['zh', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'tl', 'my'],
    'European Languages': ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'pl', 'nl', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'fi', 'da', 'no', 'sv', 'is'],
    'Other Languages': ['ar', 'tr', 'sw', 'am']
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Language Selection & Testing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Selection */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              Current Language
            </Badge>
            <span className="font-medium">
              {supportedLanguages[selectedLanguage as keyof typeof supportedLanguages] || selectedLanguage}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onTest('speech')}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Mic className="h-4 w-4" />
              <span>Test Speech</span>
            </Button>
            <Button
              onClick={() => onTest('tts')}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Volume2 className="h-4 w-4" />
              <span>Test TTS</span>
            </Button>
          </div>
        </div>

        {/* Language Groups */}
        {Object.entries(groupedLanguages).map(([groupName, languages]) => (
          <div key={groupName} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">{groupName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  variant={selectedLanguage === lang ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-auto py-2 px-3 justify-start"
                >
                  {supportedLanguages[lang as keyof typeof supportedLanguages]}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
