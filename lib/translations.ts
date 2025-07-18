// Comprehensive Translation System for AI Interview Coach
// This module provides dynamic multilingual support using free APIs

import { indianLanguageService } from './indian-language-service';

interface CachedTranslation {
  translation: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: CachedTranslation;
}

interface UITranslations {
  [key: string]: {
    [lang: string]: string;
  };
}

class TranslationService {
  private cache: TranslationCache = {};
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private apiCallCount = 0;
  private lastApiCall = 0;
  private rateLimitDelay = 1000; // 1 second between API calls

  // Core UI translations that are commonly used
  private coreUITranslations: UITranslations = {
    // Navigation and Headers
    'AI Interview Coach': {
      'es': 'Entrenador de Entrevistas AI',
      'fr': 'Coach d\'Entretien IA',
      'de': 'KI-Interview-Coach',
      'hi': 'एआई इंटरव्यू कोच',
      'zh': 'AI面试教练',
      'ja': 'AI面接コーチ',
      'ko': 'AI 면접 코치',
      'ar': 'مدرب المقابلة الذكي',
      'pt': 'Treinador de Entrevista IA',
      'ru': 'ИИ Тренер Интервью',
      'it': 'Coach per Colloquio IA'
    },
    
    // Interview Controls
    'Start Recording': {
      'es': 'Iniciar Grabación',
      'fr': 'Commencer l\'Enregistrement',
      'de': 'Aufnahme Starten',
      'hi': 'रिकॉर्डिंग शुरू करें',
      'zh': '开始录音',
      'ja': '録音開始',
      'ko': '녹음 시작',
      'ar': 'بدء التسجيل',
      'pt': 'Iniciar Gravação',
      'ru': 'Начать Запись',
      'it': 'Inizia Registrazione'
    },
    
    'Stop Recording': {
      'es': 'Detener Grabación',
      'fr': 'Arrêter l\'Enregistrement',
      'de': 'Aufnahme Stoppen',
      'hi': 'रिकॉर्डिंग बंद करें',
      'zh': '停止录音',
      'ja': '録音停止',
      'ko': '녹음 중지',
      'ar': 'إيقاف التسجيل',
      'pt': 'Parar Gravação',
      'ru': 'Остановить Запись',
      'it': 'Ferma Registrazione'
    },
    
    'Next Question': {
      'es': 'Siguiente Pregunta',
      'fr': 'Question Suivante',
      'de': 'Nächste Frage',
      'hi': 'अगला प्रश्न',
      'zh': '下一个问题',
      'ja': '次の質問',
      'ko': '다음 질문',
      'ar': 'السؤال التالي',
      'pt': 'Próxima Pergunta',
      'ru': 'Следующий Вопрос',
      'it': 'Prossima Domanda'
    },
    
    'End Interview': {
      'es': 'Finalizar Entrevista',
      'fr': 'Terminer l\'Entretien',
      'de': 'Interview Beenden',
      'hi': 'इंटरव्यू समाप्त करें',
      'zh': '结束面试',
      'ja': '面接終了',
      'ko': '면접 종료',
      'ar': 'إنهاء المقابلة',
      'pt': 'Terminar Entrevista',
      'ru': 'Завершить Интервью',
      'it': 'Termina Colloquio'
    },
    
    // Status Messages
    'Recording...': {
      'es': 'Grabando...',
      'fr': 'Enregistrement...',
      'de': 'Aufnahme läuft...',
      'hi': 'रिकॉर्डिंग...',
      'zh': '录音中...',
      'ja': '録音中...',
      'ko': '녹음 중...',
      'ar': 'جاري التسجيل...',
      'pt': 'Gravando...',
      'ru': 'Запись...',
      'it': 'Registrazione...'
    },
    
    'Listening...': {
      'es': 'Escuchando...',
      'fr': 'Écoute...',
      'de': 'Höre zu...',
      'hi': 'सुन रहा है...',
      'zh': '听取中...',
      'ja': '聞いています...',
      'ko': '듣고 있음...',
      'ar': 'يستمع...',
      'pt': 'Ouvindo...',
      'ru': 'Слушаю...',
      'it': 'Ascoltando...'
    },
    
    'Translating...': {
      'es': 'Traduciendo...',
      'fr': 'Traduction...',
      'de': 'Übersetze...',
      'hi': 'अनुवाद कर रहा है...',
      'zh': '翻译中...',
      'ja': '翻訳中...',
      'ko': '번역 중...',
      'ar': 'جاري الترجمة...',
      'pt': 'Traduzindo...',
      'ru': 'Переводим...',
      'it': 'Traduzione...'
    },
    
    // Question Categories
    'Technical': {
      'es': 'Técnica',
      'fr': 'Technique',
      'de': 'Technisch',
      'hi': 'तकनीकी',
      'zh': '技术',
      'ja': '技術',
      'ko': '기술',
      'ar': 'تقني',
      'pt': 'Técnica',
      'ru': 'Техническая',
      'it': 'Tecnica'
    },
    
    'Behavioral': {
      'es': 'Comportamental',
      'fr': 'Comportementale',
      'de': 'Verhaltens',
      'hi': 'व्यवहारिक',
      'zh': '行为',
      'ja': '行動',
      'ko': '행동',
      'ar': 'سلوكي',
      'pt': 'Comportamental',
      'ru': 'Поведенческая',
      'it': 'Comportamentale'
    },
    
    'Introduction': {
      'es': 'Introducción',
      'fr': 'Introduction',
      'de': 'Einführung',
      'hi': 'परिचय',
      'zh': '介绍',
      'ja': '紹介',
      'ko': '소개',
      'ar': 'مقدمة',
      'pt': 'Introdução',
      'ru': 'Введение',
      'it': 'Introduzione'
    },
    
    'Career': {
      'es': 'Carrera',
      'fr': 'Carrière',
      'de': 'Karriere',
      'hi': 'करियर',
      'zh': '职业',
      'ja': 'キャリア',
      'ko': '경력',
      'ar': 'مهنة',
      'pt': 'Carreira',
      'ru': 'Карьера',
      'it': 'Carriera'
    },
    
    // Placeholders and Instructions
    'Speak or type your answer here...': {
      'es': 'Habla o escribe tu respuesta aquí...',
      'fr': 'Parlez ou tapez votre réponse ici...',
      'de': 'Sprechen Sie oder tippen Sie Ihre Antwort hier...',
      'hi': 'यहाँ बोलें या अपना उत्तर टाइप करें...',
      'zh': '在这里说话或输入您的答案...',
      'ja': 'ここで話すか答えを入力してください...',
      'ko': '여기에 말하거나 답변을 입력하세요...',
      'ar': 'تكلم أو اكتب إجابتك هنا...',
      'pt': 'Fale ou digite sua resposta aqui...',
      'ru': 'Говорите или введите свой ответ здесь...',
      'it': 'Parla o digita la tua risposta qui...'
    },
    
    // Error Messages
    'Speech recognition error': {
      'es': 'Error de reconocimiento de voz',
      'fr': 'Erreur de reconnaissance vocale',
      'de': 'Spracherkennungsfehler',
      'hi': 'वाक् पहचान त्रुटि',
      'zh': '语音识别错误',
      'ja': '音声認識エラー',
      'ko': '음성 인식 오류',
      'ar': 'خطأ في التعرف على الكلام',
      'pt': 'Erro de reconhecimento de fala',
      'ru': 'Ошибка распознавания речи',
      'it': 'Errore riconoscimento vocale'
    },
    
    'Network error': {
      'es': 'Error de red',
      'fr': 'Erreur réseau',
      'de': 'Netzwerkfehler',
      'hi': 'नेटवर्क त्रुटि',
      'zh': '网络错误',
      'ja': 'ネットワークエラー',
      'ko': '네트워크 오류',
      'ar': 'خطأ في الشبكة',
      'pt': 'Erro de rede',
      'ru': 'Ошибка сети',
      'it': 'Errore di rete'
    },
    
    // Time and Duration
    'Question': {
      'es': 'Pregunta',
      'fr': 'Question',
      'de': 'Frage',
      'hi': 'प्रश्न',
      'zh': '问题',
      'ja': '質問',
      'ko': '질문',
      'ar': 'سؤال',
      'pt': 'Pergunta',
      'ru': 'Вопрос',
      'it': 'Domanda'
    },
    
    'Timer': {
      'es': 'Cronómetro',
      'fr': 'Minuteur',
      'de': 'Timer',
      'hi': 'टाइमर',
      'zh': '计时器',
      'ja': 'タイマー',
      'ko': '타이머',
      'ar': 'مؤقت',
      'pt': 'Cronômetro',
      'ru': 'Таймер',
      'it': 'Timer'
    }
  };

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('translation_cache');
        if (stored) {
          this.cache = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load translation cache:', error);
        this.cache = {};
      }
    }
  }

  private saveCache() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('translation_cache', JSON.stringify(this.cache));
      } catch (error) {
        console.warn('Failed to save translation cache:', error);
      }
    }
  }

  private getCacheKey(text: string, from: string, to: string): string {
    return `${from}_${to}_${text}`;
  }

  private isValidCachedTranslation(cached: any): boolean {
    return cached && 
           cached.timestamp && 
           (Date.now() - cached.timestamp) < this.cacheExpiry;
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

  // Get UI translation - prioritizes pre-defined translations, then API
  async getUITranslation(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en') return text;

    // Check pre-defined translations first
    if (this.coreUITranslations[text] && this.coreUITranslations[text][targetLang]) {
      return this.coreUITranslations[text][targetLang];
    }

    // Fallback to API translation
    return this.translateText(text, 'en', targetLang);
  }

  // Dynamic API-based translation with enhanced Indian language support
  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;
    if (fromLang === toLang) return text;

    const cacheKey = this.getCacheKey(text, fromLang, toLang);
    
    // Check cache first
    if (this.cache[cacheKey] && this.isValidCachedTranslation(this.cache[cacheKey])) {
      return this.cache[cacheKey].translation;
    }

    try {
      let translation: string | null = null;

      // Enhanced: Use specialized Indian language service for Indian languages
      if (indianLanguageService.isIndianLanguage(toLang)) {
        console.log(`🇮🇳 Using Indian language service for ${toLang}`);
        translation = await indianLanguageService.translateToIndianLanguage(text, toLang);
      } else {
        // Use standard international translation APIs
        translation = await this.tryMyMemoryTranslation(text, fromLang, toLang);
        
        if (!translation) {
          translation = await this.tryLibreTranslateAPI(text, fromLang, toLang);
        }
        
        if (!translation) {
          translation = await this.tryGoogleTranslateUnofficial(text, fromLang, toLang);
        }
        
        if (!translation) {
          translation = await this.tryMicrosoftTranslator(text, fromLang, toLang);
        }
      }

      if (translation && translation !== text) {
        // Cache the result
        this.cache[cacheKey] = {
          translation: translation,
          timestamp: Date.now()
        };
        this.saveCache();
        return translation;
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }

    return text; // Return original text if all translations fail
  }

  private async tryMyMemoryTranslation(text: string, fromLang: string, toLang: string): Promise<string | null> {
    try {
      const response = await this.rateLimitedFetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch (error) {
      console.warn('MyMemory translation failed:', error);
    }
    return null;
  }

  private async tryLibreTranslateAPI(text: string, fromLang: string, toLang: string): Promise<string | null> {
    try {
      // Try the public LibreTranslate instance
      const response = await this.rateLimitedFetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (error) {
      console.warn('LibreTranslate API failed:', error);
    }
    return null;
  }

  private async tryGoogleTranslateUnofficial(text: string, fromLang: string, toLang: string): Promise<string | null> {
    try {
      // Using a public Google Translate API proxy
      const response = await this.rateLimitedFetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          return data[0][0][0];
        }
      }
    } catch (error) {
      console.warn('Google Translate unofficial failed:', error);
    }
    return null;
  }

  private async tryMicrosoftTranslator(text: string, fromLang: string, toLang: string): Promise<string | null> {
    try {
      // Using Microsoft Translator public endpoint (limited)
      const response = await this.rateLimitedFetch(
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLang}&to=${toLang}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{ text }])
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].translations && data[0].translations[0]) {
          return data[0].translations[0].text;
        }
      }
    } catch (error) {
      console.warn('Microsoft Translator failed:', error);
    }
    return null;
  }

  // Translate interview questions by category
  async translateInterviewQuestions(questions: any[], targetLang: string): Promise<any[]> {
    if (targetLang === 'en') return questions;

    const translatedQuestions = await Promise.all(
      questions.map(async (question) => {
        const translatedText = await this.translateText(question.text, 'en', targetLang);
        const translatedCategory = await this.getUITranslation(question.category, targetLang);
        
        return {
          ...question,
          text: translatedText,
          category: translatedCategory,
          originalText: question.text, // Keep original for reference
          originalCategory: question.category
        };
      })
    );

    return translatedQuestions;
  }

  // Generate localized interview questions for different types
  async generateLocalizedQuestions(type: string, role: string, language: string, count: number = 5): Promise<any[]> {
    const baseQuestions = this.getBaseQuestionsByType(type, role);
    
    if (language === 'en') {
      return baseQuestions.slice(0, count);
    }

    return this.translateInterviewQuestions(baseQuestions.slice(0, count), language);
  }

  private getBaseQuestionsByType(type: string, role: string): any[] {
    const questionSets = {
      technical: [
        { id: 1, text: `Describe your experience with the key technologies required for a ${role} position.`, category: "Technical Experience" },
        { id: 2, text: "Walk me through how you would approach solving a complex technical problem you've never encountered before.", category: "Problem Solving" },
        { id: 3, text: "Explain a recent project where you had to learn a new technology quickly. How did you approach it?", category: "Learning Ability" },
        { id: 4, text: "Describe the most challenging bug you've encountered and how you debugged it.", category: "Debugging Skills" },
        { id: 5, text: "How do you stay updated with the latest trends and technologies in your field?", category: "Professional Development" },
        { id: 6, text: "Explain how you would optimize the performance of a slow application or system.", category: "Performance Optimization" },
        { id: 7, text: "Describe your experience with version control and collaborative development.", category: "Collaboration" },
        { id: 8, text: "How do you approach testing your code and ensuring quality?", category: "Quality Assurance" }
      ],
      behavioral: [
        { id: 1, text: "Tell me about a time when you had to work with a difficult team member. How did you handle it?", category: "Teamwork" },
        { id: 2, text: "Describe a situation where you had to meet a tight deadline. How did you prioritize your tasks?", category: "Time Management" },
        { id: 3, text: "Tell me about a time when you made a mistake at work. How did you handle it?", category: "Problem Resolution" },
        { id: 4, text: "Describe a situation where you had to adapt to significant changes in your work environment.", category: "Adaptability" },
        { id: 5, text: "Tell me about a time when you took initiative to improve a process or solve a problem.", category: "Leadership" },
        { id: 6, text: "Describe a situation where you had to communicate complex information to non-technical stakeholders.", category: "Communication" },
        { id: 7, text: "Tell me about a time when you received constructive criticism. How did you respond?", category: "Professional Growth" },
        { id: 8, text: "Describe a project where you had to collaborate with people from different departments or backgrounds.", category: "Cross-functional Collaboration" }
      ],
      situational: [
        { id: 1, text: `If you were starting as a ${role} at our company, what would be your priorities in the first 90 days?`, category: "Strategic Thinking" },
        { id: 2, text: "How would you handle a situation where a project deadline seems impossible to meet?", category: "Crisis Management" },
        { id: 3, text: "What would you do if you disagreed with your manager's technical decision?", category: "Conflict Resolution" },
        { id: 4, text: "How would you approach learning about our company's existing systems and processes?", category: "Learning Approach" },
        { id: 5, text: "If you noticed a security vulnerability in our system, how would you handle it?", category: "Risk Management" },
        { id: 6, text: "How would you prioritize multiple urgent requests from different stakeholders?", category: "Prioritization" },
        { id: 7, text: "What would you do if you realized you didn't have enough information to complete a task?", category: "Problem Solving" },
        { id: 8, text: "How would you handle a situation where your code change caused a production issue?", category: "Incident Response" }
      ],
      introduction: [
        { id: 1, text: "Tell me about yourself and your journey to becoming a software professional.", category: "Personal Introduction" },
        { id: 2, text: `What interests you most about this ${role} position?`, category: "Role Interest" },
        { id: 3, text: "Describe your ideal work environment and team culture.", category: "Cultural Fit" },
        { id: 4, text: "What are your long-term career goals and how does this role fit into them?", category: "Career Aspirations" },
        { id: 5, text: "What do you consider your greatest professional strength?", category: "Strengths" },
        { id: 6, text: "Tell me about a recent accomplishment you're particularly proud of.", category: "Achievements" },
        { id: 7, text: "How do you prefer to receive feedback and learn new skills?", category: "Learning Style" },
        { id: 8, text: "What motivates you to do your best work?", category: "Motivation" }
      ]
    };

    return questionSets[type as keyof typeof questionSets] || questionSets.technical;
  }

  // Clear cache for debugging
  clearCache() {
    this.cache = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem('translation_cache');
    }
  }

  // Get translation statistics
  getStats() {
    return {
      cacheSize: Object.keys(this.cache).length,
      apiCalls: this.apiCallCount,
      lastApiCall: this.lastApiCall
    };
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Helper function for quick UI translations
export const t = (text: string, language: string): Promise<string> => {
  return translationService.getUITranslation(text, language);
};

// Helper function for translating arrays of strings
export const translateArray = async (items: string[], language: string): Promise<string[]> => {
  if (language === 'en') return items;
  
  const translations = await Promise.all(
    items.map(item => translationService.getUITranslation(item, language))
  );
  
  return translations;
};
