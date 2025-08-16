import { NextRequest, NextResponse } from 'next/server';

interface RealTimeAnalysisRequest {
  questionText: string;
  answerText: string;
  questionId: string;
  category: string;
  role: string;
  experience: string;
  language: string;
  isPartialAnswer?: boolean; // For real-time analysis during speaking
}

export async function POST(req: NextRequest) {
  try {
    const body: RealTimeAnalysisRequest = await req.json();
    const { 
      questionText, 
      answerText, 
      questionId, 
      category, 
      role, 
      experience, 
      language,
      isPartialAnswer = false
    } = body;

    console.log('🤖 Real-time multilingual analysis API called:', { 
      questionId, 
      category, 
      role, 
      experience, 
      language,
      answerLength: answerText.length,
      isPartialAnswer
    });

    // Check for API keys
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    // Try real-time AI analysis first
    if (openrouterKey && !openrouterKey.includes('dummy')) {
      try {
        const analysis = await generateRealTimeAnalysis(body, openrouterKey);
        return NextResponse.json({
          success: true,
          analysis,
          provider: 'OpenRouter',
          isRealTime: true,
          language
        });
      } catch (error) {
        console.error('Real-time AI analysis failed:', error);
      }
    }

    // Fallback to quick local analysis
    console.log('🔄 Using fallback real-time analysis');
    const fallbackAnalysis = generateQuickAnalysis(body);
    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      provider: 'Fallback',
      isRealTime: true,
      language
    });

  } catch (error) {
    console.error('❌ Real-time Analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Real-time analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function generateRealTimeAnalysis(
  data: RealTimeAnalysisRequest,
  apiKey: string
) {
  const { questionText, answerText, category, role, experience, language, isPartialAnswer } = data;
  
  // Create language-specific prompt
  const languageMap: Record<string, { nativeName: string; analysisPrompt: string }> = {
    'hi': {
      nativeName: 'हिंदी',
      analysisPrompt: `साक्षात्कार प्रश्न का वास्तविक समय विश्लेषण करें। प्रतिक्रिया केवल हिंदी में दें।`
    },
    'es': {
      nativeName: 'Español', 
      analysisPrompt: `Analice la pregunta de la entrevista en tiempo real. Responda únicamente en español.`
    },
    'fr': {
      nativeName: 'Français',
      analysisPrompt: `Analysez la question d'entretien en temps réel. Répondez uniquement en français.`
    },
    'en': {
      nativeName: 'English',
      analysisPrompt: `Analyze the interview question in real-time. Respond only in English.`
    }
  };
  
  const langInfo = languageMap[language] || languageMap['en'];
  
  const prompt = `${langInfo.analysisPrompt}

प्रश्न / Question: ${questionText}
उत्तर / Answer: ${answerText}
श्रेणी / Category: ${category}
भूमिका / Role: ${role}
अनुभव / Experience: ${experience}

${language === 'hi' ? `
कृपया निम्नलिखित JSON प्रारूप में तत्काल फीडबैक प्रदान करें (केवल हिंदी में):

{
  "score": 75,
  "quickFeedback": "आपका उत्तर अच्छा है...",
  "strengths": ["मुख्य शक्ति 1", "मुख्य शक्ति 2"],
  "improvements": ["सुधार सुझाव 1", "सुधार सुझाव 2"],
  "nextSteps": "अगला सुझाव...",
  "confidence": "अच्छा"
}

महत्वपूर्ण: सभी text हिंदी में होना चाहिए।
` : language === 'es' ? `
Proporcione comentarios inmediatos en el siguiente formato JSON (solo en español):

{
  "score": 75,
  "quickFeedback": "Su respuesta es buena...",
  "strengths": ["Fortaleza principal 1", "Fortaleza principal 2"],
  "improvements": ["Sugerencia de mejora 1", "Sugerencia de mejora 2"],
  "nextSteps": "Próxima sugerencia...",
  "confidence": "Buena"
}

Importante: Todo el texto debe estar en español.
` : `
Provide immediate feedback in the following JSON format (English only):

{
  "score": 75,
  "quickFeedback": "Your answer is good...",
  "strengths": ["Key strength 1", "Key strength 2"],
  "improvements": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "nextSteps": "Next suggestion...",
  "confidence": "Good"
}

Important: All text must be in English.
`}

Analysis type: ${isPartialAnswer ? 'Real-time partial' : 'Complete answer'}`;

  const systemPrompt = language === 'hi' 
    ? 'आप एक विशेषज्ञ साक्षात्कारकर्ता हैं। वास्तविक समय में रचनात्मक फीडबैक प्रदान करें। केवल हिंदी में JSON प्रारूप में उत्तर दें।'
    : language === 'es'
    ? 'Eres un entrevistador experto. Proporciona retroalimentación constructiva en tiempo real. Responde solo en español en formato JSON.'
    : 'You are an expert interviewer. Provide constructive real-time feedback. Respond only in English JSON format.';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'AI Interview Coach - Real-time'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen-2-72b-instruct',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.6,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    const analysis = JSON.parse(content);
    
    // Validate language consistency
    if (language === 'hi') {
      const hasHindiContent = JSON.stringify(analysis).includes('स') || 
                             JSON.stringify(analysis).includes('प्र') ||
                             JSON.stringify(analysis).includes('अ');
      if (!hasHindiContent) {
        throw new Error('Analysis not in Hindi');
      }
    }
    
    return analysis;
  } catch (error) {
    console.error('Failed to parse real-time analysis:', error);
    throw new Error('Invalid response format');
  }
}

function generateQuickAnalysis(data: RealTimeAnalysisRequest) {
  const { answerText, questionText, category, role, language } = data;
  
  // Quick scoring algorithm
  const wordCount = answerText.split(' ').length;
  const hasExamples = /\b(example|instance|experience|project|when|time|उदाहरण|अनुभव|प्रोजेक्ट|ejemplo|experiencia)\b/i.test(answerText);
  const hasTechnical = /\b(code|algorithm|database|api|framework|system|कोड|एल्गोरिदम|डेटाबेस|सिस्टम|código|algoritmo|base de datos)\b/i.test(answerText);
  
  let score = 50;
  if (wordCount >= 30) score += 20;
  if (hasExamples) score += 15;
  if (hasTechnical) score += 15;
  score = Math.min(score, 95);
  
  // Language-specific responses
  const responses: Record<string, any> = {
    'hi': {
      score,
      quickFeedback: wordCount >= 30 
        ? "अच्छा विस्तृत उत्तर! कुछ और विशिष्ट उदाहरण जोड़ सकते हैं।"
        : "उत्तर अच्छा है लेकिन और विस्तार की आवश्यकता है।",
      strengths: hasExamples 
        ? ["अच्छे उदाहरण दिए", "स्पष्ट संवाद"]
        : ["स्पष्ट संवाद", "प्रासंगिक जानकारी"],
      improvements: wordCount < 30 
        ? ["अधिक विस्तार दें", "विशिष्ट उदाहरण जोड़ें"]
        : ["तकनीकी विवरण बढ़ाएं", "मापने योग्य परिणाम दें"],
      nextSteps: "अपने अनुभव से एक और विशिष्ट उदाहरण देने की कोशिश करें।",
      confidence: score >= 75 ? "अच्छा" : score >= 60 ? "मध्यम" : "सुधार की आवश्यकता"
    },
    'es': {
      score,
      quickFeedback: wordCount >= 30 
        ? "¡Buena respuesta detallada! Podría agregar algunos ejemplos más específicos."
        : "Buena respuesta pero necesita más elaboración.",
      strengths: hasExamples 
        ? ["Buenos ejemplos", "Comunicación clara"]
        : ["Comunicación clara", "Información relevante"],
      improvements: wordCount < 30 
        ? ["Proporcionar más detalle", "Agregar ejemplos específicos"]
        : ["Mejorar detalles técnicos", "Incluir resultados medibles"],
      nextSteps: "Trate de proporcionar otro ejemplo específico de su experiencia.",
      confidence: score >= 75 ? "Buena" : score >= 60 ? "Moderada" : "Necesita mejora"
    },
    'en': {
      score,
      quickFeedback: wordCount >= 30 
        ? "Good detailed answer! Could add some more specific examples."
        : "Good answer but needs more elaboration.",
      strengths: hasExamples 
        ? ["Good examples provided", "Clear communication"]
        : ["Clear communication", "Relevant information"],
      improvements: wordCount < 30 
        ? ["Provide more detail", "Add specific examples"]
        : ["Enhance technical details", "Include measurable results"],
      nextSteps: "Try to provide another specific example from your experience.",
      confidence: score >= 75 ? "Good" : score >= 60 ? "Moderate" : "Needs improvement"
    }
  };
  
  return responses[language] || responses['en'];
}
