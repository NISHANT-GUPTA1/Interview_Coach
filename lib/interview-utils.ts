// Utility functions for the AI Interview Coach

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const calculateScore = (metrics: {
  clarity: number
  confidence: number
  eyeContact: number
  pace: number
}): number => {
  const weights = {
    clarity: 0.3,
    confidence: 0.25,
    eyeContact: 0.25,
    pace: 0.2
  }
  
  return Math.round(
    metrics.clarity * weights.clarity +
    metrics.confidence * weights.confidence +
    metrics.eyeContact * weights.eyeContact +
    metrics.pace * weights.pace
  )
}

export const getScoreLevel = (score: number): {
  level: string
  color: string
  description: string
} => {
  if (score >= 90) {
    return {
      level: "Excellent",
      color: "green",
      description: "Outstanding performance with excellent communication skills"
    }
  } else if (score >= 80) {
    return {
      level: "Good",
      color: "blue", 
      description: "Strong performance with good communication abilities"
    }
  } else if (score >= 70) {
    return {
      level: "Fair",
      color: "yellow",
      description: "Decent performance with room for improvement"
    }
  } else {
    return {
      level: "Needs Work",
      color: "red",
      description: "Significant improvement needed in communication skills"
    }
  }
}

export const analyzeText = (text: string) => {
  const words = text.trim().split(/\s+/)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Count filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'basically', 'actually']
  const fillerCount = words.reduce((count, word) => {
    return count + (fillerWords.includes(word.toLowerCase()) ? 1 : 0)
  }, 0)
  
  // Calculate readability (simplified Flesch reading score)
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = words.reduce((total, word) => {
    return total + countSyllables(word)
  }, 0) / words.length
  
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    fillerWordCount: fillerCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    readabilityScore: Math.max(0, Math.min(100, Math.round(fleschScore)))
  }
}

function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

export const generateFeedback = (analysis: {
  confidence: number
  clarity: number
  eyeContact: number
  pace: number
  fillerWords: number
}) => {
  const feedback = []
  
  if (analysis.confidence >= 85) {
    feedback.push("🎯 Great confidence level! You came across as self-assured and professional.")
  } else if (analysis.confidence >= 70) {
    feedback.push("👍 Good confidence, but try to project more authority in your voice.")
  } else {
    feedback.push("💪 Work on building confidence - practice power poses before interviews.")
  }
  
  if (analysis.clarity >= 85) {
    feedback.push("🗣️ Excellent speech clarity! Your words were clear and easy to understand.")
  } else if (analysis.clarity >= 70) {
    feedback.push("📢 Good clarity, but slow down slightly for even better articulation.")
  } else {
    feedback.push("🎯 Focus on speaking more clearly - practice articulation exercises.")
  }
  
  if (analysis.eyeContact >= 80) {
    feedback.push("👁️ Great eye contact! You maintained good visual engagement.")
  } else {
    feedback.push("👀 Try to look at the camera more frequently to simulate eye contact.")
  }
  
  if (analysis.fillerWords <= 2) {
    feedback.push("✨ Minimal filler words - very professional speech pattern!")
  } else if (analysis.fillerWords <= 5) {
    feedback.push("📝 Some filler words detected - practice pausing instead of saying 'um'.")
  } else {
    feedback.push("⚠️ Too many filler words - practice speaking in complete thoughts.")
  }
  
  return feedback
}

export const getInterviewQuestions = (role: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
  const questionBank = {
    'Software Engineer': {
      easy: [
        "Tell me about yourself and your programming background.",
        "What programming languages are you most comfortable with?",
        "Describe a simple project you've worked on recently.",
        "How do you debug code when something isn't working?",
        "What development tools do you use regularly?"
      ],
      medium: [
        "Describe a challenging technical problem you solved.",
        "How do you approach code reviews?",
        "Explain the difference between SQL and NoSQL databases.",
        "What is your experience with version control systems?",
        "How do you ensure code quality in your projects?"
      ],
      hard: [
        "Design a system to handle millions of concurrent users.",
        "Explain how you would implement a distributed cache.",
        "Walk me through optimizing a slow database query.",
        "How would you design a real-time messaging system?",
        "Describe your experience with microservices architecture."
      ]
    },
    'Data Scientist': {
      easy: [
        "What drew you to data science?",
        "Explain what a correlation coefficient means.",
        "How do you handle missing data in a dataset?",
        "What's the difference between supervised and unsupervised learning?",
        "Name some common data visualization tools you've used."
      ],
      medium: [
        "Walk me through your typical data science workflow.",
        "How do you validate a machine learning model?",
        "Explain the bias-variance tradeoff.",
        "What's your experience with A/B testing?",
        "How do you communicate technical findings to stakeholders?"
      ],
      hard: [
        "Design an algorithm to detect anomalies in real-time data.",
        "How would you build a recommendation system for millions of users?",
        "Explain different ensemble methods and when to use them.",
        "How do you handle class imbalance in machine learning?",
        "Design an experiment to measure the impact of a new feature."
      ]
    }
  }
  
  return questionBank[role as keyof typeof questionBank]?.[difficulty] || questionBank['Software Engineer'][difficulty]
}

export const simulateWebcamAnalysis = () => {
  // Simulate real-time analysis values
  return {
    confidence: Math.floor(Math.random() * 20) + 80, // 80-100
    engagement: Math.floor(Math.random() * 25) + 75, // 75-100
    eyeContact: Math.floor(Math.random() * 30) + 70, // 70-100
    posture: Math.floor(Math.random() * 15) + 85,    // 85-100
    gestures: Math.floor(Math.random() * 20) + 70    // 70-90
  }
}

export const exportToPDF = async (sessionData: any) => {
  // This would integrate with jsPDF to generate a PDF report
  console.log('Exporting session data to PDF:', sessionData)
  
  // Mock PDF generation
  return {
    success: true,
    filename: `interview-report-${new Date().toISOString().split('T')[0]}.pdf`,
    downloadUrl: '#'
  }
}
