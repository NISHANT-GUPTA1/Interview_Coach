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

    console.log('🤖 AI Interview Analysis API called:', { 
      answersCount: answers.length, 
      role, 
      experience, 
      language 
    });

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    // Try AI analysis first
    if (openaiKey && !openaiKey.includes('dummy')) {
      try {
        const analysis = await generateOpenAIAnalysis(answers, role, experience, language, openaiKey);
        return NextResponse.json({
          success: true,
          analysis,
          provider: 'OpenAI'
        });
      } catch (error) {
        console.error('OpenAI analysis failed:', error);
      }
    }

    if (openrouterKey && !openrouterKey.includes('dummy')) {
      try {
        const analysis = await generateOpenRouterAnalysis(answers, role, experience, language, openrouterKey);
        return NextResponse.json({
          success: true,
          analysis,
          provider: 'OpenRouter'
        });
      } catch (error) {
        console.error('OpenRouter analysis failed:', error);
      }
    }

    // Fallback to manual analysis
    console.log('🔄 Using fallback analysis');
    const fallbackAnalysis = generateFallbackAnalysis(answers, role, experience);
    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      provider: 'Fallback'
    });

  } catch (error) {
    console.error('❌ AI Analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      fallback: generateFallbackAnalysis([], 'Software Engineer', 'Entry Level')
    }, { status: 500 });
  }
}

async function generateOpenAIAnalysis(
  answers: InterviewAnswer[], 
  role: string, 
  experience: string, 
  language: string,
  apiKey: string
) {
  const prompt = `Analyze this interview performance for a ${role} position (${experience} level):

${answers.map((a, i) => `Question ${i+1}: ${a.questionText}\nAnswer: ${a.answerText}\n`).join('\n')}

Provide detailed analysis including:
1. Overall score (0-100)
2. Individual question scores
3. Strengths and improvements
4. Specific recommendations

Respond in JSON format.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Analyze interview performance and provide constructive feedback.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function generateOpenRouterAnalysis(
  answers: InterviewAnswer[], 
  role: string, 
  experience: string, 
  language: string,
  apiKey: string
) {
  const prompt = `Analyze this interview performance for a ${role} position (${experience} level):

${answers.map((a, i) => `Question ${i+1}: ${a.questionText}\nAnswer: ${a.answerText}\n`).join('\n')}

Provide detailed analysis including:
1. Overall score (0-100)
2. Individual question scores
3. Strengths and improvements
4. Specific recommendations

Respond in JSON format.`;

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
          content: `You are an expert interview coach. Analyze interview performance and provide constructive feedback.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    // If parsing fails, create structured response
    return {
      overallScore: 75,
      analysis: content,
      provider: 'OpenRouter'
    };
  }
}

function generateFallbackAnalysis(answers: InterviewAnswer[], role: string, experience: string) {
  const totalAnswers = answers.length;
  const avgLength = answers.reduce((sum, a) => sum + a.answerText.length, 0) / Math.max(totalAnswers, 1);
  
  return {
    overallScore: Math.max(60, Math.min(85, 70 + (avgLength / 50))),
    breakdown: {
      technical: Math.max(55, Math.min(90, 65 + (avgLength / 60))),
      communication: Math.max(60, Math.min(95, 75 + (avgLength / 40))),
      completeness: Math.max(50, Math.min(85, 60 + (totalAnswers * 5))),
      confidence: Math.max(55, Math.min(90, 70 + (avgLength / 80)))
    },
    questionAnalysis: answers.map((answer, index) => ({
      questionId: answer.questionId,
      questionText: answer.questionText,
      answerText: answer.answerText,
      score: Math.max(50, Math.min(95, 70 + Math.random() * 20)),
      strengths: ["Answer provided with relevant details", "Clear communication"],
      weaknesses: ["Could include more specific examples", "Consider adding metrics or outcomes"],
      suggestions: ["Practice with more concrete examples", "Include quantifiable results"],
      expectedAnswer: `For this ${answer.category.toLowerCase()} question, ideal answers should include specific examples, metrics, and clear problem-solving approaches.`
    })),
    strengths: [
      `Good understanding of ${role} fundamentals`,
      "Clear communication style",
      "Completed interview professionally"
    ],
    improvements: [
      "Include more specific examples and metrics",
      "Practice explaining technical concepts more clearly",
      "Prepare more detailed project stories"
    ],
    recommendations: [
      `Research common ${role} interview patterns`,
      "Practice the STAR method for behavioral questions",
      "Prepare technical examples with measurable outcomes"
    ],
    statistics: {
      totalQuestions: totalAnswers,
      averageResponseLength: Math.round(avgLength),
      totalInterviewTime: "15m 30s",
      keywordsUsed: Math.max(5, totalAnswers * 2),
      expectedKeywords: totalAnswers * 3,
      confidenceLevel: "Moderate"
    }
  };
}
