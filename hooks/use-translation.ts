import { useState, useEffect, useCallback } from 'react';
import { translationService, t } from '@/lib/translations';

interface UseTranslationReturn {
  translate: (text: string) => string;
  translateAsync: (text: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  changeLanguage: (newLang: string) => void;
  currentLanguage: string;
}

export function useTranslation(initialLanguage: string = 'en'): UseTranslationReturn {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback((text: string): string => {
    const key = `${currentLanguage}_${text}`;
    return translations[key] || text;
  }, [currentLanguage, translations]);

  const translateAsync = useCallback(async (text: string): Promise<string> => {
    if (currentLanguage === 'en') return text;
    
    const key = `${currentLanguage}_${text}`;
    
    // Return cached translation if available
    if (translations[key]) {
      return translations[key];
    }

    setIsLoading(true);
    setError(null);

    try {
      const translated = await t(text, currentLanguage);
      
      // Cache the translation
      setTranslations(prev => ({
        ...prev,
        [key]: translated
      }));
      
      return translated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
      return text; // Return original text on error
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translations]);

  const changeLanguage = useCallback((newLang: string) => {
    setCurrentLanguage(newLang);
    setError(null);
  }, []);

  return {
    translate,
    translateAsync,
    isLoading,
    error,
    changeLanguage,
    currentLanguage
  };
}

// Hook for translating multiple texts at once
export function useTranslationBatch(texts: string[], language: string) {
  const [translations, setTranslations] = useState<string[]>(texts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (language === 'en') {
      setTranslations(texts);
      return;
    }

    const translateTexts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const translated = await Promise.all(
          texts.map(text => t(text, language))
        );
        setTranslations(translated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Batch translation failed';
        setError(errorMessage);
        console.error('Batch translation error:', err);
        setTranslations(texts); // Fallback to original texts
      } finally {
        setIsLoading(false);
      }
    };

    translateTexts();
  }, [texts, language]);

  return { translations, isLoading, error };
}

// Hook for translating interview questions
export function useTranslatedQuestions(questions: any[], language: string) {
  const [translatedQuestions, setTranslatedQuestions] = useState(questions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedQuestions(questions);
      return;
    }

    const translateQuestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const translated = await translationService.translateInterviewQuestions(questions, language);
        setTranslatedQuestions(translated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Question translation failed';
        setError(errorMessage);
        console.error('Question translation error:', err);
        setTranslatedQuestions(questions); // Fallback to original questions
      } finally {
        setIsLoading(false);
      }
    };

    translateQuestions();
  }, [questions, language]);

  return { translatedQuestions, isLoading, error };
}
