import { NextRequest, NextResponse } from 'next/server';

interface InterviewAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
  category: string;
  recordingDuration: number;
}

interface AnalysisRequest {
  answers: InterviewAnswer[];
  role: string;
  experience: string;
  language: string;
  interviewDuration: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();
    const { answers, role, experience, language, interviewDuration } = body;

    console.log('🤖 Enhanced AI Interview Analysis API called:', { 
      answersCount: answers.length, 
      role, 
      experience, 
      language 
    });

    // Use OpenRouter API only (no OpenAI)
    const openrouterResult = await tryOpenRouterAnalysis(body);
    if (openrouterResult.success) {
      console.log('✅ OpenRouter analysis succeeded');
      return NextResponse.json(openrouterResult);
    }

    // Fallback: Advanced local analysis (still dynamic)
    console.log('⚠️ OpenRouter failed, using advanced fallback analysis');
    const fallbackAnalysis = await createAdvancedAnalysis(body);
    
    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      source: 'advanced_fallback'
    });

  } catch (error) {
    console.error('❌ Enhanced Analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      fallback: true
    }, { status: 500 });
  }
}

async function tryOpenAIAnalysis(data: AnalysisRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('⚠️ OpenAI API key not found');
    return { success: false };
  }

  try {
    const analysisPrompt = createAnalysisPrompt(data);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer and career coach. Analyze interviews comprehensively and provide actionable feedback.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);
    
    console.log('✅ OpenAI analysis successful');
    return {
      success: true,
      analysis,
      source: 'openai'
    };

  } catch (error) {
    console.error('❌ OpenAI analysis failed:', error);
    return { success: false };
  }
}

async function tryOpenRouterAnalysis(data: AnalysisRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log('⚠️ OpenRouter API key not found');
    return { success: false };
  }

  try {
    const analysisPrompt = createAnalysisPrompt(data);
    
    console.log('🔑 OpenRouter API Key available, attempting analysis...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Interview Coach'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'qwen/qwen-2-72b-instruct', // Use cheaper model
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer and career coach. Analyze interviews comprehensively and provide actionable feedback in JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error details:', errorText);
      
      if (response.status === 402) {
        console.error('❌ OpenRouter API: Payment Required (402) - Insufficient credits or billing issue');
      } else {
        console.error(`❌ OpenRouter API error: ${response.status} - ${errorText}`);
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);
    
    console.log('✅ OpenRouter analysis successful');
    return {
      success: true,
      analysis,
      source: 'openrouter'
    };

  } catch (error) {
    console.error('❌ OpenRouter analysis failed:', error);
    return { success: false };
  }
}

function createAnalysisPrompt(data: AnalysisRequest): string {
  const { answers, role, experience, language, interviewDuration } = data;
  
  // Determine response language
  const getLanguageInfo = (lang: string) => {
    const languageMap: Record<string, { isNonEnglish: boolean; name: string }> = {
      'hi': { isNonEnglish: true, name: 'Hindi' },
      'es': { isNonEnglish: true, name: 'Spanish' },
      'fr': { isNonEnglish: true, name: 'French' },
      'de': { isNonEnglish: true, name: 'German' },
      'it': { isNonEnglish: true, name: 'Italian' },
      'pt': { isNonEnglish: true, name: 'Portuguese' },
      'ru': { isNonEnglish: true, name: 'Russian' },
      'zh': { isNonEnglish: true, name: 'Chinese' },
      'ja': { isNonEnglish: true, name: 'Japanese' },
      'ko': { isNonEnglish: true, name: 'Korean' },
      'ar': { isNonEnglish: true, name: 'Arabic' },
      'bn': { isNonEnglish: true, name: 'Bengali' },
      'te': { isNonEnglish: true, name: 'Telugu' },
      'ta': { isNonEnglish: true, name: 'Tamil' },
      'mr': { isNonEnglish: true, name: 'Marathi' },
      'gu': { isNonEnglish: true, name: 'Gujarati' },
      'kn': { isNonEnglish: true, name: 'Kannada' },
      'ml': { isNonEnglish: true, name: 'Malayalam' },
      'pa': { isNonEnglish: true, name: 'Punjabi' },
      'ur': { isNonEnglish: true, name: 'Urdu' },
      'en': { isNonEnglish: false, name: 'English' }
    };
    
    return languageMap[lang] || { isNonEnglish: false, name: 'English' };
  };
  
  const languageInfo = getLanguageInfo(language);
  const isHindi = language === 'hi';
  
  return `
**INTERVIEW ANALYSIS REQUEST**

${isHindi ? 'भूमिका' : 'Role'}: ${role}
${isHindi ? 'अनुभव' : 'Experience'}: ${experience}
${isHindi ? 'भाषा' : 'Language'}: ${language}
${isHindi ? 'अवधि' : 'Duration'}: ${Math.floor(interviewDuration / 60)}m ${interviewDuration % 60}s

**${isHindi ? 'प्रश्न और उत्तर:' : 'QUESTIONS & ANSWERS:'}**
${answers.map((answer, index) => `
${isHindi ? 'प्रश्न' : 'Question'} ${index + 1}: ${answer.questionText}
${isHindi ? 'उत्तर' : 'Answer'}: ${answer.answerText}
${isHindi ? 'श्रेणी' : 'Category'}: ${answer.category}
---`).join('\n')}

**${isHindi ? 'विश्लेषण आवश्यकताएं:' : 'ANALYSIS REQUIREMENTS:'}**

${languageInfo.isNonEnglish ? `
IMPORTANT: Provide the entire analysis in ${languageInfo.name} language. All feedback, suggestions, strengths, and improvements must be in ${languageInfo.name}.

Please provide detailed analysis in the following JSON format in ${languageInfo.name}:
` : 'Please provide detailed analysis in the following JSON format in English:'}

${isHindi ? `
कृपया निम्नलिखित JSON प्रारूप में विस्तृत विश्लेषण प्रदान करें:

{
  "overallScore": 85,
  "breakdown": {
    "technical": 82,
    "communication": 88,
    "completeness": 80,
    "confidence": 87
  },
  "questionAnalysis": [
    {
      "questionId": "q1",
      "questionText": "प्रश्न यहाँ",
      "answerText": "उत्तर यहाँ", 
      "score": 85,
      "strengths": ["विशिष्ट शक्तियाँ"],
      "weaknesses": ["सुधार के क्षेत्र"],
      "suggestions": ["सुझाव"],
      "expectedAnswer": "आदर्श उत्तर का विवरण",
      "technicalAccuracy": 85,
      "communicationClarity": 90,
      "completeness": 80
    }
  ],
  "strengths": ["मुख्य शक्तियाँ"],
  "improvements": ["सुधार के सुझाव"],
  "recommendations": ["भविष्य की सिफारिशें"],
  "statistics": {
    "totalQuestions": ${answers.length},
    "averageResponseLength": 150,
    "totalInterviewTime": "${Math.floor(interviewDuration / 60)}m ${interviewDuration % 60}s",
    "keywordsUsed": 25,
    "expectedKeywords": 35,
    "confidenceLevel": "अच्छा"
  }
}

सभी फीडबैक हिंदी में दें।
` : `
Please provide detailed analysis in the following JSON format:

{
  "overallScore": 85,
  "breakdown": {
    "technical": 82,
    "communication": 88,
    "completeness": 80,
    "confidence": 87
  },
  "questionAnalysis": [
    {
      "questionId": "q1",
      "questionText": "Question here",
      "answerText": "Answer here",
      "score": 85,
      "strengths": ["Specific strengths"],
      "weaknesses": ["Areas for improvement"],
      "suggestions": ["Actionable suggestions"],
      "expectedAnswer": "Description of ideal answer",
      "technicalAccuracy": 85,
      "communicationClarity": 90,
      "completeness": 80
    }
  ],
  "strengths": ["Overall strengths"],
  "improvements": ["Improvement suggestions"],
  "recommendations": ["Future recommendations"],
  "statistics": {
    "totalQuestions": ${answers.length},
    "averageResponseLength": 150,
    "totalInterviewTime": "${Math.floor(interviewDuration / 60)}m ${interviewDuration % 60}s",
    "keywordsUsed": 25,
    "expectedKeywords": 35,
    "confidenceLevel": "Good"
  }
}

Provide all feedback in English.
`}

**${isHindi ? 'महत्वपूर्ण:' : 'IMPORTANT:'}**
- ${isHindi ? 'प्रत्येक उत्तर का गहन विश्लेषण करें' : 'Analyze each answer thoroughly'}
- ${isHindi ? 'तकनीकी सटीकता पर ध्यान दें' : 'Focus on technical accuracy'}
- ${isHindi ? 'व्यावहारिक सुझाव दें' : 'Provide actionable suggestions'}
- ${isHindi ? 'केवल JSON प्रारूप में उत्तर दें' : 'Respond only in JSON format'}
`;
}

async function createAdvancedAnalysis(data: AnalysisRequest) {
  const { answers, role, experience, language, interviewDuration } = data;
  
  // Determine response language
  const getLanguageInfo = (lang: string) => {
    const languageMap: Record<string, { isNonEnglish: boolean; name: string }> = {
      'hi': { isNonEnglish: true, name: 'Hindi' },
      'es': { isNonEnglish: true, name: 'Spanish' },
      'fr': { isNonEnglish: true, name: 'French' },
      'de': { isNonEnglish: true, name: 'German' },
      'it': { isNonEnglish: true, name: 'Italian' },
      'pt': { isNonEnglish: true, name: 'Portuguese' },
      'ru': { isNonEnglish: true, name: 'Russian' },
      'zh': { isNonEnglish: true, name: 'Chinese' },
      'ja': { isNonEnglish: true, name: 'Japanese' },
      'ko': { isNonEnglish: true, name: 'Korean' },
      'ar': { isNonEnglish: true, name: 'Arabic' },
      'bn': { isNonEnglish: true, name: 'Bengali' },
      'te': { isNonEnglish: true, name: 'Telugu' },
      'ta': { isNonEnglish: true, name: 'Tamil' },
      'mr': { isNonEnglish: true, name: 'Marathi' },
      'gu': { isNonEnglish: true, name: 'Gujarati' },
      'kn': { isNonEnglish: true, name: 'Kannada' },
      'ml': { isNonEnglish: true, name: 'Malayalam' },
      'pa': { isNonEnglish: true, name: 'Punjabi' },
      'ur': { isNonEnglish: true, name: 'Urdu' },
      'en': { isNonEnglish: false, name: 'English' }
    };
    
    return languageMap[lang] || { isNonEnglish: false, name: 'English' };
  };
  
  const languageInfo = getLanguageInfo(language);
  const isHindi = language === 'hi';
  
  // Advanced analysis without AI but still dynamic
  const questionAnalysis = answers.map((answer, index) => {
    const answerText = answer.answerText.toLowerCase();
    const wordCount = answer.answerText.split(' ').length;
    const answerLength = answer.answerText.length;
    
    // Advanced scoring algorithm
    let score = 50; // Base score
    
    // Content quality indicators
    const hasExamples = /\b(example|instance|experience|project|when|time|उदाहरण|अनुभव|प्रोजेक्ट)\b/i.test(answerText);
    const hasTechnical = /\b(code|algorithm|database|api|framework|system|कोड|एल्गोरिदम|डेटाबेस|सिस्टम)\b/i.test(answerText);
    const hasMetrics = /\b(\d+%|\d+ (users|hours|days|months|years)|improved|increased|decreased|यूजर्स|घंटे|दिन|महीने|साल)\b/i.test(answerText);
    const hasStructure = /\b(first|second|then|finally|next|पहले|दूसरे|फिर|अंत में|अगला)\b/i.test(answerText);
    
    // Length-based scoring
    if (wordCount >= 50) score += 15;
    else if (wordCount >= 30) score += 10;
    else if (wordCount >= 15) score += 5;
    
    // Content quality bonuses
    if (hasExamples) score += 12;
    if (hasTechnical) score += 10;
    if (hasMetrics) score += 15;
    if (hasStructure) score += 8;
    
    // Cap the score
    score = Math.min(95, Math.max(45, score));
    
    // Generate dynamic feedback
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];
    
    if (isHindi) {
      if (wordCount >= 50) strengths.push('विस्तृत और पूर्ण उत्तर दिया');
      if (hasExamples) strengths.push('अच्छे उदाहरण शामिल किए');
      if (hasTechnical) strengths.push('तकनीकी ज्ञान प्रदर्शित किया');
      if (hasMetrics) strengths.push('मापने योग्य परिणाम दिए');
      if (hasStructure) strengths.push('संरचित उत्तर दिया');
      
      if (wordCount < 30) weaknesses.push('उत्तर बहुत संक्षिप्त है');
      if (!hasExamples) weaknesses.push('अधिक उदाहरण जोड़ें');
      if (!hasTechnical && answer.category && answer.category.toLowerCase().includes('technical')) weaknesses.push('तकनीकी विवरण बढ़ाएं');
      if (!hasMetrics) weaknesses.push('मापने योग्य परिणाम जोड़ें');
      
      // Dynamic suggestions based on actual content
      if (wordCount < 30) suggestions.push('अपने उत्तर को और विस्तार से बताएं');
      if (!hasExamples) suggestions.push('अपने अनुभव से कोई विशिष्ट उदाहरण दें');
      if (!hasMetrics) suggestions.push('संख्याओं या मेट्रिक्स के साथ अपनी उपलब्धियों को बताएं');
      if (!hasTechnical && answer.category && answer.category.toLowerCase().includes('technical')) {
        suggestions.push('तकनीकी शब्दावली और विधियों का उपयोग करें');
      }
    } else if (language === 'es') {
      if (wordCount >= 50) strengths.push('Proporcionó una respuesta completa y detallada');
      if (hasExamples) strengths.push('Incluyó ejemplos relevantes');
      if (hasTechnical) strengths.push('Demostró conocimiento técnico');
      if (hasMetrics) strengths.push('Incluyó resultados cuantificables');
      if (hasStructure) strengths.push('Respuesta bien estructurada');
      
      if (wordCount < 30) weaknesses.push('Respuesta muy breve, necesita más detalle');
      if (!hasExamples) weaknesses.push('Agregar más ejemplos específicos');
      if (!hasTechnical && answer.category && answer.category.toLowerCase().includes('technical')) weaknesses.push('Incluir más detalles técnicos');
      if (!hasMetrics) weaknesses.push('Agregar resultados medibles');
      
      // Dynamic suggestions based on actual content  
      if (wordCount < 30) suggestions.push('Expanda su respuesta con más detalle');
      if (!hasExamples) suggestions.push('Incluya un ejemplo específico de su experiencia');
      if (!hasMetrics) suggestions.push('Agregue números o métricas para cuantificar sus logros');
      if (!hasTechnical && answer.category && answer.category.toLowerCase().includes('technical')) {
        suggestions.push('Use terminología técnica y metodologías');
      }
    } else {
      if (wordCount >= 50) strengths.push('Provided comprehensive and detailed answer');
      if (hasExamples) strengths.push('Included relevant examples');
      if (hasTechnical) strengths.push('Demonstrated technical knowledge');
      if (hasMetrics) strengths.push('Included quantifiable results');
      if (hasStructure) strengths.push('Well-structured response');
      
      if (wordCount < 30) weaknesses.push('Response too brief, needs more detail');
      if (!hasExamples) weaknesses.push('Add more specific examples');
      if (!hasTechnical && answer.category && answer.category.toLowerCase().includes('technical')) weaknesses.push('Include more technical details');
      if (!hasMetrics) weaknesses.push('Add measurable outcomes');
      
      // Dynamic suggestions based on actual content
      if (wordCount < 30) suggestions.push('Expand your answer with more detail');
      if (!hasExamples) suggestions.push('Include a specific example from your experience');
      if (!hasMetrics) suggestions.push('Add numbers or metrics to quantify your achievements');
      if (!hasTechnical && answer.category && answer.category.toLowerCase().includes('technical')) {
        suggestions.push('Use technical terminology and methodologies');
      }
    }
    
    return {
      questionId: answer.questionId,
      questionText: answer.questionText,
      answerText: answer.answerText,
      score,
      strengths,
      weaknesses,
      suggestions,
      expectedAnswer: isHindi 
        ? `इस ${answer.category} प्रश्न के लिए आदर्श उत्तर में विशिष्ट उदाहरण, मेट्रिक्स और स्पष्ट समस्या-समाधान दृष्टिकोण शामिल होना चाहिए।`
        : `For this ${answer.category} question, ideal answers should include specific examples, metrics, and clear problem-solving approaches.`,
      technicalAccuracy: Math.min(95, score + Math.random() * 10 - 5),
      communicationClarity: Math.min(95, score + Math.random() * 10 - 5),
      completeness: Math.min(95, score + Math.random() * 10 - 5)
    };
  });
  
  // Calculate overall scores
  const scores = questionAnalysis.map(q => q.score);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  return {
    overallScore,
    breakdown: {
      technical: Math.round(questionAnalysis.reduce((sum, q) => sum + q.technicalAccuracy, 0) / questionAnalysis.length),
      communication: Math.round(questionAnalysis.reduce((sum, q) => sum + q.communicationClarity, 0) / questionAnalysis.length),
      completeness: Math.round(questionAnalysis.reduce((sum, q) => sum + q.completeness, 0) / questionAnalysis.length),
      confidence: Math.min(95, overallScore + 5)
    },
    questionAnalysis,
    // Dynamic strengths based on actual analysis
    strengths: generateDynamicStrengths(questionAnalysis, overallScore, language),
    // Dynamic improvements based on actual weaknesses found
    improvements: generateDynamicImprovements(questionAnalysis, overallScore, language),
    // Dynamic recommendations based on performance gaps
    recommendations: generateDynamicRecommendations(questionAnalysis, role, overallScore, language),
    statistics: {
      totalQuestions: answers.length,
      averageResponseLength: Math.round(answers.reduce((sum, a) => sum + a.answerText.length, 0) / answers.length),
      totalInterviewTime: `${Math.floor(interviewDuration / 60)}m ${interviewDuration % 60}s`,
      keywordsUsed: Math.max(5, answers.length * 3),
      expectedKeywords: answers.length * 5,
      confidenceLevel: isHindi ? 
        (overallScore >= 80 ? 'उत्कृष्ट' : overallScore >= 70 ? 'अच्छा' : overallScore >= 60 ? 'मध्यम' : 'सुधार की आवश्यकता') :
        (overallScore >= 80 ? 'Excellent' : overallScore >= 70 ? 'Good' : overallScore >= 60 ? 'Moderate' : 'Needs Improvement')
    }
  };
}

// Dynamic helper functions for generating contextual feedback
function generateDynamicStrengths(questionAnalysis: any[], overallScore: number, language: string): string[] {
  const strengths = [];
  const avgWordCount = questionAnalysis.reduce((sum, q) => sum + q.answerText.split(' ').length, 0) / questionAnalysis.length;
  const highScoringQuestions = questionAnalysis.filter(q => q.score >= 80).length;
  
  // Multilingual support
  const translations: Record<string, Record<string, string>> = {
    'hi': {
      'excellent_performance': 'उत्कृष्ट समग्र प्रदर्शन दिखाया',
      'detailed_answers': 'विस्तृत और व्यापक उत्तर प्रदान किए',
      'strong_majority': 'अधिकांश प्रश्नों में मजबूत प्रदर्शन',
      'good_examples': 'व्यावहारिक उदाहरणों का अच्छा उपयोग',
      'technical_knowledge': 'तकनीकी ज्ञान की अच्छी समझ',
      'completed_interview': 'साक्षात्कार पूरा किया'
    },
    'es': {
      'excellent_performance': 'Excelente rendimiento general en la entrevista',
      'detailed_answers': 'Proporcionó respuestas detalladas y completas',
      'strong_majority': 'Rendimiento sólido en la mayoría de preguntas',
      'good_examples': 'Buen uso de ejemplos prácticos',
      'technical_knowledge': 'Fuerte conocimiento técnico y comprensión',
      'completed_interview': 'Completó la entrevista exitosamente'
    },
    'fr': {
      'excellent_performance': 'Excellente performance globale à l\'entretien',
      'detailed_answers': 'Fourni des réponses détaillées et complètes',
      'strong_majority': 'Performance solide sur la majorité des questions',
      'good_examples': 'Bon usage d\'exemples pratiques',
      'technical_knowledge': 'Forte connaissance technique et compréhension',
      'completed_interview': 'A terminé l\'entretien avec succès'
    },
    'en': {
      'excellent_performance': 'Excellent overall interview performance',
      'detailed_answers': 'Provided detailed and comprehensive answers',
      'strong_majority': 'Strong performance on majority of questions',
      'good_examples': 'Good use of practical examples',
      'technical_knowledge': 'Strong technical knowledge and understanding',
      'completed_interview': 'Completed the interview'
    }
  };
  
  const lang = translations[language] || translations['en'];
  
  if (overallScore >= 80) strengths.push(lang.excellent_performance);
  if (avgWordCount > 50) strengths.push(lang.detailed_answers);
  if (highScoringQuestions > questionAnalysis.length / 2) strengths.push(lang.strong_majority);
  if (questionAnalysis.some(q => q.strengths.some((s: string) => s.includes('example') || s.includes('उदाहरण') || s.includes('ejemplo')))) strengths.push(lang.good_examples);
  if (questionAnalysis.some(q => q.strengths.some((s: string) => s.includes('technical') || s.includes('तकनीकी') || s.includes('técnico')))) strengths.push(lang.technical_knowledge);
  
  return strengths.length > 0 ? strengths : [lang.completed_interview];
}

function generateDynamicImprovements(questionAnalysis: any[], overallScore: number, language: string): string[] {
  const improvements = [];
  const avgWordCount = questionAnalysis.reduce((sum, q) => sum + q.answerText.split(' ').length, 0) / questionAnalysis.length;
  const lowScoringQuestions = questionAnalysis.filter(q => q.score < 60).length;
  
  // Multilingual support
  const translations: Record<string, Record<string, string>> = {
    'hi': {
      'improve_quality': 'समग्र उत्तर की गुणवत्ता में सुधार करें',
      'detailed_answers': 'अधिक विस्तृत उत्तर प्रदान करें',
      'focus_weak_areas': 'कमजोर प्रश्न क्षेत्रों पर फोकस करें',
      'more_examples': 'अधिक व्यावहारिक उदाहरण शामिल करें',
      'technical_depth': 'तकनीकी ज्ञान की गहराई बढ़ाएं',
      'continue_practice': 'निरंतर अभ्यास करें'
    },
    'es': {
      'improve_quality': 'Mejorar la calidad y profundidad de las respuestas',
      'detailed_answers': 'Proporcionar respuestas más detalladas y completas',
      'focus_weak_areas': 'Enfocarse en mejorar el rendimiento en áreas débiles',
      'more_examples': 'Incluir más ejemplos específicos de la experiencia',
      'technical_depth': 'Fortalecer el conocimiento técnico y la terminología',
      'continue_practice': 'Continuar practicando regularmente'
    },
    'fr': {
      'improve_quality': 'Améliorer la qualité et la profondeur des réponses',
      'detailed_answers': 'Fournir des réponses plus détaillées et complètes',
      'focus_weak_areas': 'Se concentrer sur l\'amélioration des domaines faibles',
      'more_examples': 'Inclure plus d\'exemples spécifiques de l\'expérience',
      'technical_depth': 'Renforcer les connaissances techniques et la terminologie',
      'continue_practice': 'Continuer à pratiquer régulièrement'
    },
    'en': {
      'improve_quality': 'Improve overall response quality and depth',
      'detailed_answers': 'Provide more detailed and comprehensive answers',
      'focus_weak_areas': 'Focus on improving performance in weaker areas',
      'more_examples': 'Include more specific examples from experience',
      'technical_depth': 'Strengthen technical knowledge and terminology',
      'continue_practice': 'Continue practicing'
    }
  };
  
  const lang = translations[language] || translations['en'];
  
  if (overallScore < 70) improvements.push(lang.improve_quality);
  if (avgWordCount < 30) improvements.push(lang.detailed_answers);
  if (lowScoringQuestions > 0) improvements.push(lang.focus_weak_areas);
  if (questionAnalysis.some(q => q.weaknesses.some((w: string) => w.includes('example') || w.includes('उदाहरण') || w.includes('ejemplo')))) improvements.push(lang.more_examples);
  if (questionAnalysis.some(q => q.weaknesses.some((w: string) => w.includes('technical') || w.includes('तकनीकी') || w.includes('técnico')))) improvements.push(lang.technical_depth);
  
  return improvements.length > 0 ? improvements : [lang.continue_practice];
}

function generateDynamicRecommendations(questionAnalysis: any[], role: string, overallScore: number, language: string): string[] {
  const recommendations = [];
  const lowScoringQuestions = questionAnalysis.filter(q => q.score < 60);
  
  // Multilingual support
  const translations: Record<string, Record<string, string>> = {
    'hi': {
      'focus_skills': `${role} के लिए विशिष्ट तकनीकी कौशल पर फोकस करें`,
      'mock_interviews': 'मॉक इंटरव्यू का अधिक अभ्यास करें',
      'comprehensive_answers': 'अधिक विस्तृत उत्तर देने का अभ्यास करें',
      'extra_preparation': 'कमजोर क्षेत्रों में अतिरिक्त तैयारी करें'
    },
    'es': {
      'focus_skills': `Enfocarse en habilidades técnicas específicas requeridas para ${role}`,
      'mock_interviews': 'Realizar más entrevistas simuladas para practicar',
      'comprehensive_answers': 'Trabajar en proporcionar explicaciones más comprensivas',
      'extra_preparation': 'Dedicar tiempo extra de preparación a las áreas más débiles'
    },
    'fr': {
      'focus_skills': `Se concentrer sur les compétences techniques spécifiques requises pour ${role}`,
      'mock_interviews': 'Mener plus d\'entretiens simulés pour la pratique',
      'comprehensive_answers': 'Travailler à fournir des explications plus complètes',
      'extra_preparation': 'Consacrer un temps de préparation supplémentaire aux domaines faibles'
    },
    'en': {
      'focus_skills': `Focus on specific technical skills required for ${role}`,
      'mock_interviews': 'Conduct more mock interviews for practice',
      'comprehensive_answers': 'Work on providing more comprehensive explanations',
      'extra_preparation': 'Dedicate extra preparation time to weaker areas'
    }
  };
  
  const lang = translations[language] || translations['en'];
  
  recommendations.push(lang.focus_skills);
  recommendations.push(lang.mock_interviews);
  if (overallScore < 75) recommendations.push(lang.comprehensive_answers);
  if (lowScoringQuestions.length > 0) recommendations.push(lang.extra_preparation);
  
  return recommendations;
}
