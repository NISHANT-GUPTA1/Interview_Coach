import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, question, answer, questionIndex = 0, candidateLevel = 'mid' } = body
    
    const followUp = generateFollowUpQuestion(role, answer, questionIndex, candidateLevel)
    
    return NextResponse.json({ 
      followUp,
      generated: true
    })

  } catch (error) {
    console.error('Error generating follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to generate follow-up question' },
      { status: 500 }
    )
  }
}

function generateFollowUpQuestion(
  role: string, 
  answer: string, 
  questionIndex: number, 
  candidateLevel: string
): string {
  const answerLower = answer.toLowerCase()
  
  // Check for specific keywords and generate contextual follow-ups
  if (answerLower.includes('project') || answerLower.includes('built') || answerLower.includes('developed')) {
    return 'That sounds interesting. What was the most challenging technical decision you had to make during development?'
  }
  
  if (answerLower.includes('team') || answerLower.includes('collaboration')) {
    return 'How do you handle disagreements about technical approaches within your team?'
  }
  
  if (answerLower.includes('bug') || answerLower.includes('debugging') || answerLower.includes('issue')) {
    return 'Walk me through your debugging process step by step.'
  }
  
  if (answerLower.includes('performance') || answerLower.includes('optimization')) {
    return 'What specific optimization techniques did you apply, and what were the results?'
  }
  
  // Progressive contextual questions based on interview stage
  const contextualQuestions = [
    'What programming languages are you most comfortable with?',
    'Tell me about a time when you had to learn a completely new technology under pressure.',
    'How do you approach professional development and staying current with technology?',
    'What emerging technologies are you most excited about and why?',
    'How do you prioritize technical debt versus new feature development?',
    'Describe your ideal work environment and team culture.',
    'Where do you see yourself in your career in the next two years?'
  ]
  
  return contextualQuestions[questionIndex % contextualQuestions.length]
}
