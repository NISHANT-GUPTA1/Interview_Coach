import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role = 'Software Engineer', experience = '2-3 years', count = 5, language = 'en' } = body;

    console.log('🤖 AI Question Generation API called:', { role, experience, count, language });

    // Check for OpenRouter API key - MANDATORY for real-time generation
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    console.log('🔑 OpenRouter API Key:', openrouterKey ? `${openrouterKey.substring(0, 7)}...${openrouterKey.substring(openrouterKey.length - 4)}` : 'None');
    
    if (!openrouterKey || openrouterKey.includes('dummy')) {
      console.error('❌ NO VALID OPENROUTER API KEY - Cannot generate real-time questions');
      return NextResponse.json({
        success: false,
        error: 'OpenRouter API key required for real-time question generation',
        message: "CRITICAL: Configure OpenRouter API key for AI-generated questions. No fallback questions will be provided.",
        questions: [],
        real: false
      }, { status: 400 });
    }

    // ALWAYS use OpenRouter API for real-time generation - NO FALLBACKS
    try {
      console.log('🚀 Using OpenRouter API for REAL-TIME question generation...');
      const rawQuestions = await generateOpenRouterQuestions(role, experience, language, count, openrouterKey);
      
      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error('OpenRouter returned empty questions array');
      }
      
      console.log('✅ OpenRouter API succeeded, generated', rawQuestions.length, 'REAL-TIME questions');
      console.log('📋 Generated questions preview:', rawQuestions.slice(0, 2));
      
      // Convert strings to proper question objects
      const questions = rawQuestions.map((questionText: string, index: number) => ({
        id: index + 1,
        text: questionText,
        category: getQuestionCategory(questionText, index),
        generated: 'real-time',
        timestamp: new Date().toISOString()
      }));
      
      console.log('🔄 Formatted', questions.length, 'real-time questions for', language);
      
      return NextResponse.json({
        success: true,
        questions,
        real: true,
        provider: 'OpenRouter',
        language: language,
        generated: 'real-time',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ OpenRouter API failed:', error);
      
      // NO FALLBACK - Return error instead
      return NextResponse.json({
        success: false,
        error: 'Real-time question generation failed',
        message: 'OpenRouter API failed. Please check API key and try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
        questions: [],
        real: false
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI questions',
      details: error instanceof Error ? error.message : 'Unknown error',
      questions: [],
      real: false
    }, { status: 500 });
  }
}

async function generateOpenRouterQuestions(
  role: string, 
  experience: string, 
  language: string, 
  count: number,
  apiKey: string
): Promise<string[]> {
  try {
    console.log('🌐 OpenRouter Real-time Generation for:', { role, experience, language, count });
    
    // Enhanced language-specific prompts for AI generation
    const languagePrompts = {
      'hi': `Generate ${count} professional interview questions in Hindi (हिंदी) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Hindi script. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ta': `Generate ${count} professional interview questions in Tamil (தமிழ்) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Tamil script (தமிழ் எழுத்துக்கள் மட்டும்). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'te': `Generate ${count} professional interview questions in Telugu (తెలుగు) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Telugu script (తెలుగు లిపి మాత్రమే). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'kn': `Generate ${count} professional interview questions in Kannada (ಕನ್ನಡ) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Kannada script (ಕನ್ನಡ ಲಿಪಿ ಮಾತ್ರ). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ml': `Generate ${count} professional interview questions in Malayalam (മലയാളം) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Malayalam script (മലയാളം ലിപി മാത്രം). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'mr': `Generate ${count} professional interview questions in Marathi (मराठी) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Marathi script (मराठी लिपी फक्त). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'gu': `Generate ${count} professional interview questions in Gujarati (ગુજરાતી) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Gujarati script (ગુજરાતી લિપિ જ). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'pa': `Generate ${count} professional interview questions in Punjabi (ਪੰਜਾਬੀ) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Punjabi script (ਪੰਜਾਬੀ ਲਿਪੀ ਹੀ). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'bn': `Generate ${count} professional interview questions in Bengali (বাংলা) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Bengali script (বাংলা লিপি শুধুমাত্র). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ur': `Generate ${count} professional interview questions in Urdu (اردو) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Urdu script (صرف اردو رسم الخط). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'sa': `Generate ${count} professional interview questions in Sanskrit (संस्कृत) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Sanskrit script (संस्कृत लिपि केवल). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'or': `Generate ${count} professional interview questions in Odia (ଓଡ଼ିଆ) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Odia script (ଓଡ଼ିଆ ଲିପି ମାତ୍र). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'as': `Generate ${count} professional interview questions in Assamese (অসমীয়া) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Assamese script (অসমীয়া লিপি কেৱল). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ne': `Generate ${count} professional interview questions in Nepali (नेपाली) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Nepali script (नेपाली लिपी मात्र). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'si': `Generate ${count} professional interview questions in Sinhala (සිංහල) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Sinhala script (සිංහල අකුරු පමණක්). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'my': `Generate ${count} professional interview questions in Burmese (မြန်မာ) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Burmese script (မြန်မာအက္ခရာများသာ). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ar': `Generate ${count} professional interview questions in Arabic (العربية) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Arabic script (النص العربي فقط). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'es': `Generate ${count} professional interview questions in Spanish (Español) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Spanish. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'fr': `Generate ${count} professional interview questions in French (Français) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in French. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'de': `Generate ${count} professional interview questions in German (Deutsch) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in German. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'it': `Generate ${count} professional interview questions in Italian (Italiano) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Italian. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'pt': `Generate ${count} professional interview questions in Portuguese (Português) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Portuguese. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ru': `Generate ${count} professional interview questions in Russian (Русский) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Russian script (кириллица только). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'zh': `Generate ${count} professional interview questions in Chinese (中文) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Chinese characters (中文字符只). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ja': `Generate ${count} professional interview questions in Japanese (日本語) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Japanese script (日本語文字のみ). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ko': `Generate ${count} professional interview questions in Korean (한국어) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Korean script (한글만). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'th': `Generate ${count} professional interview questions in Thai (ไทย) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Thai script (ตัวอักษรไทยเท่านั้น). Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'vi': `Generate ${count} professional interview questions in Vietnamese (Tiếng Việt) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Vietnamese. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'id': `Generate ${count} professional interview questions in Indonesian (Bahasa Indonesia) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Indonesian. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'ms': `Generate ${count} professional interview questions in Malay (Bahasa Melayu) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Malay. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'tl': `Generate ${count} professional interview questions in Filipino/Tagalog (Filipino) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Filipino. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'tr': `Generate ${count} professional interview questions in Turkish (Türkçe) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Turkish. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'pl': `Generate ${count} professional interview questions in Polish (Polski) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Polish. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'nl': `Generate ${count} professional interview questions in Dutch (Nederlands) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Dutch. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'sv': `Generate ${count} professional interview questions in Swedish (Svenska) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Swedish. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'no': `Generate ${count} professional interview questions in Norwegian (Norsk) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Norwegian. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'da': `Generate ${count} professional interview questions in Danish (Dansk) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Danish. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'fi': `Generate ${count} professional interview questions in Finnish (Suomi) for a ${role} position with ${experience} experience. Questions must be technical, relevant, and completely in Finnish. Each question should test skills, problem-solving, and expertise. Format: Return only the questions, one per line.`,
      
      'default': `Generate ${count} professional technical interview questions for a ${role} position with ${experience} experience. Focus on practical skills, problem-solving abilities, and relevant technical knowledge. Each question should be clear, specific, and designed to assess the candidate's expertise in their field. Format: Return only the questions, one per line.`
    };
    
    const systemPrompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.default;
    
    console.log('📝 AI Prompt for', language, ':', systemPrompt.substring(0, 100) + '...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-interview-coach.vercel.app',
        'X-Title': 'AI Interview Coach - Question Generator'
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b', // Multi-lingual support
        messages: [
          {
            role: 'system',
            content: `You are an expert technical interview question generator. You MUST generate questions ONLY in the requested language script. Never mix languages or use English unless specifically requested. Be precise and professional.`
          },
          {
            role: 'user',
            content: systemPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 OpenRouter API response data available');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenRouter response structure:', data);
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = data.choices[0].message.content;
    console.log('📋 Raw AI generated content length:', content.length);
    
    // Parse questions from response
    const questions = content
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((question: string) => question.length > 10);
    
    console.log('✅ Parsed', questions.length, 'AI-generated questions for', language);
    console.log('🔍 Sample questions:', questions.slice(0, 2));
    
    if (questions.length === 0) {
      throw new Error('Failed to parse questions from AI response');
    }
    
    return questions.slice(0, count);
    
  } catch (error) {
    console.error('❌ OpenRouter question generation failed:', error);
    throw error;
  }
}

function getQuestionCategory(questionText: string, index: number): string {
  const lowerText = questionText.toLowerCase();
  
  if (lowerText.includes('code') || lowerText.includes('program') || lowerText.includes('algorithm') || lowerText.includes('debug')) {
    return 'Coding';
  } else if (lowerText.includes('team') || lowerText.includes('project') || lowerText.includes('challenge') || lowerText.includes('experience')) {
    return 'Behavioral';
  } else if (lowerText.includes('design') || lowerText.includes('architecture') || lowerText.includes('system')) {
    return 'System Design';
  } else {
    return ['Technical', 'Problem Solving', 'Conceptual'][index % 3];
  }
}
