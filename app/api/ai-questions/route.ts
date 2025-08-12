import { NextRequest, NextResponse } from 'next/server';

// Helper function to categorize questions
function getQuestionCategory(questionText: string, index: number): string {
  const text = questionText.toLowerCase();
  
  if (text.includes('yourself') || text.includes('background') || text.includes('experience')) {
    return 'Introduction';
  } else if (text.includes('challenge') || text.includes('problem') || text.includes('difficult')) {
    return 'Problem Solving';
  } else if (text.includes('skill') || text.includes('strength') || text.includes('weakness')) {
    return 'Skills & Abilities';
  } else if (text.includes('team') || text.includes('collaborate') || text.includes('leadership')) {
    return 'Teamwork';
  } else if (text.includes('learn') || text.includes('technology') || text.includes('update')) {
    return 'Learning & Growth';
  } else if (text.includes('future') || text.includes('goals') || text.includes('career')) {
    return 'Career Goals';
  } else if (text.includes('technical') || text.includes('code') || text.includes('algorithm')) {
    return 'Technical';
  } else {
    // Assign categories based on question order
    const categories = ['Introduction', 'Technical', 'Problem Solving', 'Behavioral', 'Career Goals'];
    return categories[index % categories.length];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role = 'Software Engineer', experience = '2-3 years', count = 5, language = 'en' } = body;

    console.log('🤖 AI Question Generation API called:', { role, experience, count, language });

    // Check for OpenRouter API key only
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    console.log('🔑 OpenRouter API Key:', openrouterKey ? `${openrouterKey.substring(0, 7)}...${openrouterKey.substring(openrouterKey.length - 4)}` : 'None');
    
    if (!openrouterKey || openrouterKey.includes('dummy')) {
      console.log('⚠️ No valid OpenRouter API key found, using fallback questions');
      return NextResponse.json({
        success: true,
        questions: generateFallbackQuestions(role, language, count),
        real: false,
        message: "Using fallback questions. Configure OpenRouter API key for AI-generated questions."
      });
    }

    // Use OpenRouter API directly (no OpenAI)
    try {
      console.log('🚀 Using OpenRouter API for question generation...');
      const rawQuestions = await generateOpenRouterQuestions(role, experience, language, count, openrouterKey);
      console.log('✅ OpenRouter API succeeded, generated', rawQuestions.length, 'questions');
      console.log('📋 Raw questions:', rawQuestions);
      
      // Convert strings to proper question objects
      const questions = rawQuestions.map((questionText: string, index: number) => ({
        id: index + 1,
        text: questionText,
        category: getQuestionCategory(questionText, index)
      }));
      
      console.log('🔄 Formatted questions:', questions);
      
      return NextResponse.json({
        success: true,
        questions,
        real: true,
        provider: 'OpenRouter'
      });
    } catch (error) {
      console.error('❌ OpenRouter API failed:', error);
      // Fall back to manual questions
    }

    // Fallback to manual questions
    console.log('🔄 All AI services failed, using fallback questions');
    const fallbackQuestions = generateFallbackQuestions(role, language, count);
    const questions = fallbackQuestions.map((questionText: string, index: number) => ({
      id: index + 1,
      text: questionText,
      category: getQuestionCategory(questionText, index)
    }));
    
    return NextResponse.json({
      success: true,
      questions,
      real: false,
      message: "AI services unavailable. Using fallback questions."
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function generateOpenAIQuestions(
  role: string, 
  experience: string, 
  language: string, 
  count: number,
  apiKey: string
): Promise<string[]> {
  const prompt = `Generate ${count} professional interview questions for a ${role} position with ${experience} experience level.

Requirements:
- Questions should be appropriate for ${experience} experience level
- Mix of technical, behavioral, and problem-solving questions
- Professional and realistic
- Return as JSON object with "questions" array

Example format:
{
  "questions": [
    "Question 1 here",
    "Question 2 here"
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Generate professional interview questions in ${language} for ${role} positions. Return a JSON object with a "questions" array.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error details:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    
    // Extract questions from various possible response formats
    let questions = [];
    if (Array.isArray(parsed)) {
      questions = parsed;
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      questions = parsed.questions;
    } else if (parsed.interview_questions && Array.isArray(parsed.interview_questions)) {
      questions = parsed.interview_questions;
    } else {
      // If no array found, try to extract from text
      throw new Error('No valid questions array found in response');
    }

    return questions.filter((q: any) => typeof q === 'string' && q.trim().length > 10).slice(0, count);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    // Fallback: try to extract questions from plain text
    const lines = content.split('\n')
      .filter((line: string) => line.trim().length > 10 && (line.includes('?') || line.match(/^\d+\./)))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, count);
    
    if (lines.length > 0) {
      return lines;
    }
    
    throw new Error('Could not extract questions from OpenAI response');
  }
}

async function generateOpenRouterQuestions(
  role: string, 
  experience: string, 
  language: string, 
  count: number,
  apiKey: string
): Promise<string[]> {
  const prompt = `Generate ${count} professional interview questions for a ${role} position (${experience} experience level) in ${language} language.

Requirements:
- Questions should be appropriate for ${experience} experience level
- Mix of technical, behavioral, and problem-solving questions
- Written in ${language} language
- Professional and realistic

Return only a JSON array of questions as strings.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen-2-72b-instruct',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Generate professional interview questions in ${language} for ${role} positions.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    let questions = [];
    if (Array.isArray(parsed)) {
      questions = parsed;
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      questions = parsed.questions;
    }
    return questions.filter((q: any) => typeof q === 'string' && q.trim().length > 10).slice(0, count);
  } catch (error) {
    // If JSON parsing fails, try to extract questions from text
    const lines = content.split('\n').filter((line: string) => line.trim().length > 10);
    return lines.slice(0, count);
  }
}

function generateFallbackQuestions(role: string, language: string, count: number): string[] {
  const questionBank: { [key: string]: { [key: string]: string[] } } = {
    "Software Engineer": {
      "English": [
        "Tell me about yourself and your experience as a software engineer.",
        "Describe a challenging technical problem you solved recently and walk me through your approach.",
        "How do you ensure code quality and maintainability in your projects?",
        "What's your experience with version control systems and collaborative development?",
        "How do you stay updated with new technologies and programming trends?",
        "Describe a time when you had to debug a complex issue. What was your process?",
        "How do you approach system design and scalability challenges?",
        "What testing strategies do you use to ensure your code is reliable?"
      ],
      "Hindi": [
        "अपने बारे में और सॉफ्टवेयर इंजीनियर के रूप में अपने अनुभव के बारे में बताएं।",
        "हाल ही में आपने जो चुनौतीपूर्ण तकनीकी समस्या हल की है उसका वर्णन करें।",
        "आप अपने प्रोजेक्ट्स में कोड की गुणवत्ता कैसे सुनिश्चित करते हैं?",
        "वर्जन कंट्रोल सिस्टम के साथ आपका क्या अनुभव है?",
        "आप नई तकनीकों के साथ कैसे अपडेट रहते हैं?",
        "जटिल समस्याओं को डिबग करने की आपकी प्रक्रिया क्या है?",
        "सिस्टम डिज़ाइन और स्केलेबिलिटी चुनौतियों से आप कैसे निपटते हैं?",
        "विश्वसनीय कोड के लिए आप कौन सी टेस्टिंग रणनीतियों का उपयोग करते हैं?"
      ]
    },
    "Frontend Developer": {
      "English": [
        "What's your experience with modern JavaScript frameworks and which do you prefer?",
        "How do you approach responsive web design and ensure cross-browser compatibility?",
        "Describe a complex UI component you built and the challenges you faced.",
        "How do you optimize web application performance and user experience?",
        "What's your process for collaborating with designers and backend developers?",
        "How do you handle state management in large frontend applications?",
        "What testing strategies do you use for frontend applications?",
        "How do you ensure accessibility in your web applications?"
      ],
      "Hindi": [
        "आधुनिक जावास्क्रिप्ट फ्रेमवर्क के साथ आपका क्या अनुभव है?",
        "रिस्पॉन्सिव वेब डिज़ाइन और क्रॉस-ब्राउज़र संगतता कैसे सुनिश्चित करते हैं?",
        "आपने जो जटिल UI कंपोनेंट बनाया है उसका वर्णन करें।",
        "वेब एप्लिकेशन प्रदर्शन को कैसे अनुकूलित करते हैं?",
        "डिज़ाइनर और बैकएंड डेवलपर्स के साथ सहयोग की प्रक्रिया क्या है?",
        "बड़े फ्रंटएंड एप्लिकेशन में स्टेट मैनेजमेंट कैसे करते हैं?",
        "फ्रंटएंड एप्लिकेशन के लिए आप कौन सी टेस्टिंग रणनीतियां उपयोग करते हैं?",
        "वेब एप्लिकेशन में एक्सेसिबिलिटी कैसे सुनिश्चित करते हैं?"
      ]
    }
  };

  const roleQuestions = questionBank[role] || questionBank["Software Engineer"];
  const languageQuestions = roleQuestions[language] || roleQuestions["English"];
  
  return languageQuestions.slice(0, Math.min(count, languageQuestions.length));
}
