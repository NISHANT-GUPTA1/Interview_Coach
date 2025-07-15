import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { 
      role, 
      question, 
      answer, 
      language = 'en', 
      questionIndex = 0, 
      candidateLevel = 'mid' 
    } = await request.json()
    
    // Generate intelligent follow-up based on answer content and context
    const followUp = generateContextualQuestion(role, question, answer, questionIndex, candidateLevel)
    
    return NextResponse.json({ 
      followUp,
      generated: true,
      basedOn: {
        role,
        originalQuestion: question,
        answerLength: answer.length,
        questionIndex,
        candidateLevel
      }
    })

  } catch (error) {
    console.error('Error generating follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to generate follow-up question' },
      { status: 500 }
    )
  }
}

function generateContextualQuestion(
  role: string, 
  originalQuestion: string, 
  answer: string, 
  questionIndex: number, 
  candidateLevel: 'junior' | 'mid' | 'senior'
): string {
  // Analyze answer content for keywords and depth
  const answerLower = answer.toLowerCase()
  const answerWords = answer.split(' ').length
  
  // Progressive difficulty based on question index and level
  const difficulty = questionIndex < 3 ? 'junior' : questionIndex < 7 ? 'mid' : 'senior'
  
  // Role-specific follow-up strategies with real-time adaptation
  const followUpStrategies = {
    'Software Engineer': {
      patterns: [
        { 
          keywords: ['project', 'built', 'developed', 'created'], 
          followUp: answerWords > 50 ? 
            'That sounds like a comprehensive project. What was the most challenging technical decision you had to make during development?' :
            'Can you elaborate on the technical architecture and technologies you used in that project?'
        },
        { 
          keywords: ['algorithm', 'optimization', 'performance'], 
          followUp: difficulty === 'senior' ?
            'How did you measure the performance improvement, and what trade-offs did you consider?' :
            'What specific optimization techniques did you apply, and what were the results?'
        },
        { 
          keywords: ['bug', 'debugging', 'issue', 'problem'], 
          followUp: candidateLevel === 'senior' ?
            'How would you implement preventive measures to avoid similar issues in the future?' :
            'Walk me through your debugging process step by step.'
        },
        { 
          keywords: ['team', 'collaboration', 'worked with'], 
          followUp: 'How do you handle disagreements about technical approaches within your team?'
        },
        { 
          keywords: ['database', 'data', 'sql'], 
          followUp: difficulty === 'senior' ?
            'How would you design the database schema to handle 10x the current load?' :
            'What database optimization techniques have you implemented?'
        },
        { 
          keywords: ['api', 'service', 'backend'], 
          followUp: 'How do you ensure your APIs are secure and handle errors gracefully?'
        },
        { 
          keywords: ['react', 'frontend', 'ui', 'component'], 
          followUp: 'How do you approach state management in complex React applications?'
        }
      ],
      contextual: {
        introduction: generateTechnicalFollowUp(role, candidateLevel, questionIndex),
        experience: 'Tell me about a time when you had to learn a completely new technology under pressure.',
        challenge: 'How do you prioritize technical debt versus new feature development?',
        learning: 'What emerging technologies are you most excited about and why?'
      }
    },
    'Frontend Developer': {
      patterns: [
        { 
          keywords: ['react', 'vue', 'angular', 'component'], 
          followUp: 'How do you ensure your components are reusable and maintainable across different projects?'
        },
        { 
          keywords: ['css', 'styling', 'design'], 
          followUp: 'How do you approach responsive design for modern web applications?'
        },
        { 
          keywords: ['performance', 'optimization'], 
          followUp: 'What tools do you use to measure and improve frontend performance?'
        },
        { 
          keywords: ['testing', 'test'], 
          followUp: 'How do you balance unit testing, integration testing, and end-to-end testing in frontend development?'
        }
      ],
      contextual: {
        introduction: 'What frontend framework do you prefer and why?',
        experience: 'Describe a challenging UI/UX problem you solved.',
        challenge: 'How do you handle browser compatibility issues?',
        learning: 'How do you stay updated with rapidly changing frontend technologies?'
      }
    },
    'Backend Developer': {
      patterns: [
        { 
          keywords: ['api', 'service', 'microservice'], 
          followUp: 'How do you handle service-to-service communication and error handling?'
        },
        { 
          keywords: ['database', 'sql', 'mongodb'], 
          followUp: 'How do you approach database migrations in production environments?'
        },
        { 
          keywords: ['security', 'authentication'], 
          followUp: 'What security best practices do you implement in your backend services?'
        },
        { 
          keywords: ['scale', 'performance'], 
          followUp: 'How would you design a system to handle millions of concurrent users?'
        }
      ],
      contextual: {
        introduction: 'What backend technologies do you prefer and why?',
        experience: 'Describe a complex system architecture you designed.',
        challenge: 'How do you approach debugging issues in distributed systems?',
        learning: 'How do you ensure data consistency across multiple services?'
      }
    }
  }
  
  // Get role-specific strategies or default to Software Engineer
  const roleStrategies = followUpStrategies[role as keyof typeof followUpStrategies] || followUpStrategies['Software Engineer']
  
  // Check for keyword matches first
  for (const pattern of roleStrategies.patterns) {
    if (pattern.keywords.some(keyword => answerLower.includes(keyword))) {
      return pattern.followUp
    }
  }
  
  // Use contextual questions based on question progression
  const questionTypes = ['introduction', 'experience', 'challenge', 'learning']
  const questionType = questionTypes[Math.min(questionIndex, questionTypes.length - 1)] as keyof typeof roleStrategies.contextual
  
  return roleStrategies.contextual[questionType] || generateGenericFollowUp(candidateLevel, questionIndex)
}

function generateTechnicalFollowUp(role: string, level: 'junior' | 'mid' | 'senior', index: number): string {
  const questions = {
    junior: [
      `What programming languages are you most comfortable with for ${role} work?`,
      'How do you approach learning new technologies?',
      'Tell me about a project you built that you\'re proud of.',
      'What development tools do you use daily?'
    ],
    mid: [
      `How do you ensure code quality in your ${role} projects?`,
      'Describe your experience with testing and debugging.',
      'How do you approach system design and architecture?',
      'Tell me about a time you optimized application performance.'
    ],
    senior: [
      `How do you mentor other developers in ${role} best practices?`,
      'Describe your approach to technical decision-making.',
      'How do you balance technical debt with feature development?',
      'Tell me about a complex system you architected from scratch.'
    ]
  }
  
  const levelQuestions = questions[level]
  return levelQuestions[index % levelQuestions.length]
}

function generateGenericFollowUp(level: 'junior' | 'mid' | 'senior', index: number): string {
  const genericQuestions = {
    junior: [
      'What motivates you to pursue a career in technology?',
      'How do you handle feedback and criticism?',
      'Tell me about a challenge you overcame recently.',
      'Where do you see yourself in two years?'
    ],
    mid: [
      'How do you prioritize multiple competing deadlines?',
      'Describe your ideal work environment and team culture.',
      'How do you approach professional development?',
      'Tell me about a time you had to adapt to a major change.'
    ],
    senior: [
      'How do you influence technical direction in your organization?',
      'Describe your leadership philosophy.',
      'How do you handle conflicts between team members?',
      'What strategies do you use for long-term planning?'
    ]
  }
  
  const levelQuestions = genericQuestions[level]
  return levelQuestions[index % levelQuestions.length]
}
    },
    'Data Scientist': {
      patterns: [
        { keywords: ['model', 'machine learning', 'algorithm'], followUp: 'What evaluation metrics did you use to validate your model performance?' },
        { keywords: ['data', 'dataset', 'cleaning'], followUp: 'What specific data quality issues did you encounter and how did you address them?' },
        { keywords: ['python', 'r', 'sql'], followUp: 'Can you show me how you would approach this same problem using a different tool or library?' },
        { keywords: ['visualization', 'chart', 'graph'], followUp: 'How did you decide on the most effective way to visualize this data for stakeholders?' },
        { keywords: ['business', 'stakeholder'], followUp: 'How did you translate the technical findings into actionable business insights?' }
      ],
      generic: [
        'What statistical assumptions did you validate before applying this approach?',
        'How did you ensure your model would generalize to new data?',
        'What ethical considerations did you account for in your analysis?'
      ]
    },
    'Product Manager': {
      patterns: [
        { keywords: ['user', 'customer', 'feedback'], followUp: 'How did you prioritize which user feedback to act on versus which to defer?' },
        { keywords: ['metrics', 'kpi', 'data'], followUp: 'What leading indicators did you track to predict the success of this feature?' },
        { keywords: ['roadmap', 'priority'], followUp: 'How did you communicate timeline changes to stakeholders when priorities shifted?' },
        { keywords: ['launch', 'release'], followUp: 'What was your go-to-market strategy and how did you measure launch success?' }
      ],
      generic: [
        'What frameworks or methodologies do you use for making product decisions?',
        'How do you balance user needs with business objectives?',
        'What would you have done differently in retrospect?'
      ]
    }
  }

  // Get role-specific strategies or use generic
  const roleStrategy = followUpStrategies[role as keyof typeof followUpStrategies] || {
    patterns: [],
    generic: [
      'Can you provide more specific details about that experience?',
      'What challenges did you face and how did you overcome them?',
      'How did you measure the success of that initiative?',
      'What would you do differently if you encountered a similar situation again?'
    ]
  }

  // Look for keyword matches in the answer
  for (const pattern of roleStrategy.patterns) {
    if (pattern.keywords.some(keyword => answerLower.includes(keyword))) {
      return pattern.followUp
    }
  }

  // Generate contextual follow-up based on answer characteristics
  if (answer.length < 100) {
    return 'That\'s interesting. Can you elaborate more on that with specific examples?'
  } else if (answer.length > 500) {
    return 'You\'ve covered a lot of ground there. Which aspect was most critical to the success of the project?'
  } else if (answerLower.includes('challenge') || answerLower.includes('difficult')) {
    return 'What specific steps did you take to overcome that challenge?'
  } else if (answerLower.includes('team') || answerLower.includes('colleague')) {
    return 'How did you ensure effective collaboration and communication within the team?'
  } else if (answerLower.includes('learn') || answerLower.includes('new')) {
    return 'What resources or strategies did you use to acquire that new knowledge quickly?'
  }

  // Fall back to generic follow-ups
  const genericFollowUps = roleStrategy.generic
  return genericFollowUps[Math.floor(Math.random() * genericFollowUps.length)]
}
