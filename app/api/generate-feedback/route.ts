import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { responses, role, language = 'en' } = await request.json()
    
    // Generate comprehensive AI feedback
    const feedback = generateComprehensiveFeedback(responses, role)
    
    return NextResponse.json(feedback)

  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}

function generateComprehensiveFeedback(responses: any[], role: string) {
  // Calculate performance metrics
  const totalQuestions = responses.length
  const totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0)
  const avgTimePerQuestion = totalTime / totalQuestions
  
  // Analyze response quality
  const responseLengths = responses.map(r => r.answer?.length || 0)
  const avgResponseLength = responseLengths.reduce((sum, len) => sum + len, 0) / totalQuestions
  
  // Technical depth analysis
  const technicalKeywords = [
    'algorithm', 'optimization', 'architecture', 'scalability', 'performance',
    'database', 'api', 'framework', 'design pattern', 'testing', 'security',
    'cloud', 'microservices', 'data structure', 'complexity', 'debugging'
  ]
  
  const communicationKeywords = [
    'team', 'collaboration', 'stakeholder', 'communicate', 'explain',
    'present', 'meeting', 'discussion', 'feedback', 'leadership'
  ]
  
  const problemSolvingKeywords = [
    'challenge', 'problem', 'solution', 'approach', 'strategy',
    'analyze', 'investigate', 'resolve', 'improve', 'optimize'
  ]
  
  // Count keyword mentions
  const allResponses = responses.map(r => r.answer?.toLowerCase() || '').join(' ')
  const technicalScore = technicalKeywords.filter(keyword => 
    allResponses.includes(keyword)).length
  const communicationScore = communicationKeywords.filter(keyword => 
    allResponses.includes(keyword)).length
  const problemSolvingScore = problemSolvingKeywords.filter(keyword => 
    allResponses.includes(keyword)).length
  
  // Calculate scores (0-100)
  const technical = Math.min(100, (technicalScore / technicalKeywords.length) * 100 + 
    Math.min(30, avgResponseLength / 20))
  const communication = Math.min(100, (communicationScore / communicationKeywords.length) * 100 + 
    Math.min(25, responseLengths.filter(len => len > 150).length / totalQuestions * 50))
  const problemSolving = Math.min(100, (problemSolvingScore / problemSolvingKeywords.length) * 100 + 
    Math.min(20, responses.filter(r => r.answer?.includes('approach') || 
      r.answer?.includes('strategy')).length / totalQuestions * 40))
  
  // Time management score
  const idealTimePerQuestion = 360 // 6 minutes
  const timeScore = Math.max(0, 100 - Math.abs(avgTimePerQuestion - idealTimePerQuestion) / 10)
  
  // Overall score
  const overallScore = (technical + communication + problemSolving + timeScore) / 4
  
  // Generate role-specific insights
  const roleInsights = generateRoleSpecificInsights(role, {
    technical,
    communication,
    problemSolving,
    timeScore,
    avgResponseLength,
    totalTime
  })
  
  return {
    scores: {
      overall: Math.round(overallScore),
      technical: Math.round(technical),
      communication: Math.round(communication),
      problemSolving: Math.round(problemSolving),
      timeManagement: Math.round(timeScore)
    },
    insights: roleInsights,
    statistics: {
      totalQuestions,
      totalTime: Math.round(totalTime),
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      avgResponseLength: Math.round(avgResponseLength),
      questionsWithExamples: responses.filter(r => 
        r.answer?.includes('example') || r.answer?.includes('instance')).length
    },
    recommendations: generateRecommendations(technical, communication, problemSolving, timeScore),
    strengths: generateStrengths(technical, communication, problemSolving, timeScore),
    improvements: generateImprovements(technical, communication, problemSolving, timeScore)
  }
}

function generateRoleSpecificInsights(role: string, scores: any) {
  const insights = {
    'Software Engineer': [
      scores.technical > 70 ? 'Strong technical knowledge demonstrated' : 'Consider strengthening technical fundamentals',
      scores.problemSolving > 75 ? 'Excellent problem-solving approach' : 'Work on structured problem-solving methodology',
      scores.communication > 70 ? 'Good technical communication skills' : 'Practice explaining technical concepts clearly'
    ],
    'Data Scientist': [
      scores.technical > 75 ? 'Strong analytical and technical skills' : 'Deepen knowledge in statistical methods and ML',
      scores.problemSolving > 70 ? 'Good data-driven problem solving' : 'Focus on hypothesis-driven approach',
      scores.communication > 75 ? 'Excellent at explaining complex findings' : 'Practice presenting insights to non-technical stakeholders'
    ],
    'Product Manager': [
      scores.communication > 80 ? 'Excellent stakeholder communication' : 'Strengthen cross-functional communication skills',
      scores.problemSolving > 75 ? 'Strong product thinking' : 'Develop systematic approach to product decisions',
      scores.technical > 60 ? 'Good technical understanding' : 'Improve technical collaboration with engineering teams'
    ]
  }
  
  return insights[role as keyof typeof insights] || [
    'Solid overall performance in key areas',
    'Good balance of technical and soft skills',
    'Clear potential for growth and development'
  ]
}

function generateRecommendations(technical: number, communication: number, problemSolving: number, timeScore: number) {
  const recommendations = []
  
  if (technical < 70) {
    recommendations.push('Deepen technical knowledge through hands-on projects and continuous learning')
  }
  if (communication < 70) {
    recommendations.push('Practice explaining complex concepts in simple terms to diverse audiences')
  }
  if (problemSolving < 70) {
    recommendations.push('Develop a structured approach to breaking down complex problems')
  }
  if (timeScore < 60) {
    recommendations.push('Work on time management and concise response structuring')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue leveraging your strong foundation to tackle more complex challenges')
  }
  
  return recommendations
}

function generateStrengths(technical: number, communication: number, problemSolving: number, timeScore: number) {
  const strengths = []
  
  if (technical > 75) strengths.push('Strong technical expertise')
  if (communication > 75) strengths.push('Excellent communication skills')
  if (problemSolving > 75) strengths.push('Outstanding problem-solving ability')
  if (timeScore > 75) strengths.push('Great time management')
  
  if (strengths.length === 0) {
    strengths.push('Demonstrates potential across multiple areas')
  }
  
  return strengths
}

function generateImprovements(technical: number, communication: number, problemSolving: number, timeScore: number) {
  const improvements = []
  
  if (technical < 60) improvements.push('Technical depth and implementation details')
  if (communication < 60) improvements.push('Clarity and structure in responses')
  if (problemSolving < 60) improvements.push('Systematic problem-solving approach')
  if (timeScore < 50) improvements.push('Response timing and conciseness')
  
  if (improvements.length === 0) {
    improvements.push('Continue refining advanced skills and leadership capabilities')
  }
  
  return improvements
}
