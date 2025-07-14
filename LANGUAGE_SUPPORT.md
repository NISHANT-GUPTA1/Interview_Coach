# 🌐 Comprehensive Language Support Guide

## Overview
The AI Interview Coach now supports **70+ languages** including all major Indian regional languages and international languages through advanced translation APIs.

## Supported Languages

### 🇮🇳 Indian Regional Languages
- **Hindi** (हिन्दी) - hi
- **Bengali** (বাংলা) - bn  
- **Telugu** (తెలుగు) - te
- **Marathi** (मराठी) - mr
- **Tamil** (தமிழ்) - ta
- **Gujarati** (ગુજરાતી) - gu
- **Kannada** (ಕನ್ನಡ) - kn
- **Malayalam** (മലയാളം) - ml
- **Odia** (ଓଡ଼ିଆ) - or
- **Punjabi** (ਪੰਜਾਬੀ) - pa
- **Assamese** (অসমীয়া) - as
- **Urdu** (اردو) - ur
- **Sanskrit** (संस्कृतम्) - sa
- **Kashmiri** (कॉशुर) - ks
- **Sindhi** (سنڌي) - sd
- **Nepali** (नेपाली) - ne
- **Sinhala** (සිංහල) - si

### 🌍 International Languages
- **English, Spanish, French, German, Italian**
- **Chinese, Japanese, Korean, Russian**
- **Arabic, Hebrew, Persian, Turkish**
- **Portuguese, Dutch, Swedish, Norwegian**
- **And 35+ more languages**

## API Integration Options

### 1. Google Translate API (Recommended)
```bash
# Set in .env
LANGUAGE_SERVICE_PROVIDER=google
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

**Features:**
- Best support for Indian regional languages
- High accuracy for complex scripts (Devanagari, Bengali, Tamil, etc.)
- Real-time translation
- Language auto-detection

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Cloud Translation API
3. Create credentials and get API key
4. Add to your `.env` file

### 2. Azure Translator Service
```bash
# Set in .env
LANGUAGE_SERVICE_PROVIDER=azure
AZURE_TRANSLATOR_KEY=your_key_here
AZURE_TRANSLATOR_REGION=your_region_here
```

**Features:**
- Strong neural machine translation
- Good support for business terminology
- Regional deployments

**Setup:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create Translator resource
3. Get subscription key and region
4. Add to your `.env` file

### 3. Mock Service (Development)
```bash
# Set in .env
LANGUAGE_SERVICE_PROVIDER=mock
```

**Features:**
- No API key required
- For development and testing
- Simulates translation functionality

## Features

### 🔍 Smart Language Search
- Search by language name in English or native script
- Intelligent filtering and suggestions
- Categorized by region (Popular, Indian Regional, International)

### 🎯 Real-time Translation
- Interview questions translated to selected language
- Response analysis in user's preferred language
- Feedback provided in chosen language

### 🎤 Speech Recognition
- Native speech recognition for all supported languages
- Regional accent support for Indian languages
- Automatic language detection

### 📊 Multilingual Analytics
- Performance metrics in user's language
- Cultural context in feedback
- Region-specific interview practices

## Usage in Application

### Language Selection
```typescript
// Get supported languages
const languages = getSupportedLanguages()

// Search languages
const results = searchLanguages("हिन्दी")

// Get languages by category
const indianLanguages = getLanguagesByCategory('indian-regional')
```

### Translation
```typescript
// Translate text
const translatedText = await translateText(
  "Tell me about yourself", 
  "hi"  // Hindi
)

// Detect language
const detectedLang = await detectLanguage("मैं एक सॉफ्टवेयर इंजीनियर हूं")
```

### Speech Recognition
```typescript
// Get browser speech language code
const speechLang = getBrowserSpeechLanguage("hi") // Returns "hi-IN"
```

## API Endpoints

### `GET /api/translate`
Get list of all supported languages grouped by category.

### `POST /api/translate`
Translate text between languages.

```json
{
  "text": "How do you handle stress?",
  "targetLanguage": "hi",
  "sourceLanguage": "en"
}
```

Response:
```json
{
  "translatedText": "आप तनाव को कैसे संभालते हैं?",
  "sourceLanguage": "en",
  "targetLanguage": "hi",
  "originalText": "How do you handle stress?"
}
```

## Cost Considerations

### Google Translate API
- **Free Tier:** 500,000 characters/month
- **Paid:** $20 per million characters
- **Best for:** Production with moderate usage

### Azure Translator
- **Free Tier:** 2 million characters/month  
- **Paid:** $10 per million characters
- **Best for:** High-volume applications

### Optimization Tips
1. **Cache translations** for common interview questions
2. **Batch requests** when possible
3. **Use mock service** during development
4. **Implement rate limiting** to control costs

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Speech Recognition | ✅ | ⚠️ | ⚠️ | ✅ |
| Text Translation | ✅ | ✅ | ✅ | ✅ |
| RTL Languages | ✅ | ✅ | ✅ | ✅ |
| Complex Scripts | ✅ | ✅ | ✅ | ✅ |

## Technical Implementation

### Language Service Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Language API    │───▶│   Translation   │
│                 │    │   (Google/Azure) │    │     Service     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Speech-to-Text  │    │ Language Detection│    │ Interview Coach │
│   Processing    │    │   & Validation    │    │    Response     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### File Structure
```
lib/
├── language-service.ts      # Core language service
├── language-utils.ts        # Utility functions
└── speech-recognition.ts    # Speech processing

app/api/
├── translate/
│   └── route.ts            # Translation API endpoint
└── detect-language/
    └── route.ts            # Language detection API

components/
├── language-selector.tsx    # Language selection UI
└── multilingual-feedback.tsx # Localized feedback
```

## Troubleshooting

### Common Issues

**1. API Key Not Working**
- Verify API key is correctly set in `.env`
- Check API quotas and billing
- Ensure API is enabled in cloud console

**2. Language Not Detected**
- Text might be too short for detection
- Mixed language content
- Use manual language selection

**3. Poor Translation Quality**
- Some technical terms may not translate well
- Consider maintaining a glossary
- Use professional terminology in source language

**4. Speech Recognition Issues**
- Check browser compatibility
- Ensure microphone permissions
- Some languages have limited browser support

### Support

For language-specific issues or feature requests:
1. Check the supported languages list
2. Test with mock service first
3. Verify API credentials and quotas
4. Report issues with specific language codes

---

**Note:** This comprehensive language support makes the AI Interview Coach accessible to users across India and internationally, enabling practice in their native language for better interview preparation.
