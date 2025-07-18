"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { translationService } from '@/lib/translations';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => Promise<string>;
  tSync: (text: string) => string;
  isLoading: boolean;
  error: string | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export function TranslationProvider({ children, defaultLanguage = 'en' }: TranslationProviderProps) {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState(defaultLanguage);
  const [cache, setCache] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get language from URL params
  useEffect(() => {
    const urlLang = searchParams.get('language');
    if (urlLang && urlLang !== language) {
      setLanguage(urlLang);
    }
  }, [searchParams, language]);

  const t = async (text: string): Promise<string> => {
    if (language === 'en') return text;
    
    const cacheKey = `${language}_${text}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    setIsLoading(true);
    setError(null);

    try {
      const translated = await translationService.getUITranslation(text, language);
      
      setCache(prev => ({
        ...prev,
        [cacheKey]: translated
      }));
      
      return translated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMsg);
      return text;
    } finally {
      setIsLoading(false);
    }
  };

  const tSync = (text: string): string => {
    if (language === 'en') return text;
    
    const cacheKey = `${language}_${text}`;
    return cache[cacheKey] || text;
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    tSync,
    isLoading,
    error
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}

// Utility component for automatic text translation
interface TranslatedTextProps {
  text: string;
  language?: string;
  fallback?: string;
  className?: string;
}

export function TranslatedText({ text, language, fallback, className }: TranslatedTextProps) {
  const { language: contextLang, t } = useTranslationContext();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  const targetLang = language || contextLang;

  useEffect(() => {
    if (targetLang === 'en') {
      setTranslatedText(text);
      return;
    }

    const translateText = async () => {
      setIsLoading(true);
      try {
        const translated = await t(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Failed to translate text:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, targetLang, t, fallback]);

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{translatedText}</span>;
}
