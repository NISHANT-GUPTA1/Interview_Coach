import { NextRequest, NextResponse } from 'next/server'
import { createLanguageService } from '@/lib/language-service'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage } = await request.json()
    
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    const languageService = createLanguageService()
    
    let translatedText: string
    
    // If source language is not provided, detect it first
    if (!sourceLanguage) {
      try {
        const detectedLanguage = await languageService.detectLanguage(text)
        console.log(`Detected language: ${detectedLanguage}`)
        
        // If detected language is same as target, return original text
        if (detectedLanguage === targetLanguage) {
          return NextResponse.json({
            translatedText: text,
            sourceLanguage: detectedLanguage,
            targetLanguage
          })
        }
      } catch (error) {
        console.warn('Language detection failed, proceeding with translation:', error)
      }
    }
    
    // Translate the text
    translatedText = await languageService.translateText(text, targetLanguage)
    
    return NextResponse.json({
      translatedText,
      sourceLanguage: sourceLanguage || 'auto-detected',
      targetLanguage,
      originalText: text
    })
    
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const languageService = createLanguageService()
    const supportedLanguages = languageService.getSupportedLanguages()
    
    // Group languages by category for better UX
    const groupedLanguages = {
      popular: supportedLanguages.filter(lang => lang.category === 'popular'),
      'indian-regional': supportedLanguages.filter(lang => lang.category === 'indian-regional'),
      international: supportedLanguages.filter(lang => lang.category === 'international')
    }
    
    return NextResponse.json({
      languages: supportedLanguages,
      groupedLanguages,
      totalCount: supportedLanguages.length
    })
    
  } catch (error) {
    console.error('Get languages API error:', error)
    return NextResponse.json(
      { error: 'Failed to get supported languages' },
      { status: 500 }
    )
  }
}
