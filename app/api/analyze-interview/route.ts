import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

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

    // Prepare input data for Python AI analysis script
    const inputData = JSON.stringify({ 
      answers, 
      role, 
      experience, 
      language, 
      interviewDuration 
    });

    return new Promise((resolve) => {
      // Check if we should use OpenAI instead of OpenRouter
      const useOpenAI = process.env.USE_OPENAI_INSTEAD === 'true';
      
      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'lib', 'ai_interview_analyzer.py')
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          // Pass the appropriate API configuration
          ...(useOpenAI ? {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            USE_OPENAI_INSTEAD: 'true'
          } : {
            OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
            OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
            OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL
          })
        }
      });

      let outputData = '';
      let errorData = '';

      // Send input to Python script
      pythonProcess.stdin?.write(inputData);
      pythonProcess.stdin?.end();

      pythonProcess.stdout?.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr?.on('data', (data) => {
        const errorText = data.toString();
        console.log('Python stderr:', errorText);
        errorData += errorText;
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code: ${code}`);
        
        if (code === 0 && outputData.trim()) {
          try {
            const analysisResult = JSON.parse(outputData.trim());
            console.log('✅ AI Analysis successful');
            
            resolve(NextResponse.json({
              success: true,
              analysis: analysisResult
            }));
          } catch (parseError) {
            console.error('❌ Error parsing AI analysis result:', parseError);
            console.log('Raw output:', outputData);
            
            // Return fallback analysis
            resolve(NextResponse.json({
              success: false,
              error: 'Failed to parse AI analysis',
              fallback: generateFallbackAnalysis(answers, role, experience)
            }));
          }
        } else {
          console.error('❌ AI Analysis failed:', errorData);
          
          // Return fallback analysis
          resolve(NextResponse.json({
            success: false,
            error: 'AI analysis process failed',
            fallback: generateFallbackAnalysis(answers, role, experience)
          }));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        console.error('❌ Python process error:', error);
        resolve(NextResponse.json({
          success: false,
          error: 'Failed to start analysis process',
          fallback: generateFallbackAnalysis(answers, role, experience)
        }));
      });
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
