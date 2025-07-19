import { type NextRequest, NextResponse } from "next/server"
import { translationService } from "@/lib/translations"

// Question interface
interface Question {
  id: number;
  text: string;
  category: string;
  originalText?: string;
}

// Use our comprehensive translation service with multiple API fallbacks
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  try {
    const result = await translationService.translateText(text, sourceLang, targetLang)
    return result
  } catch (error) {
    console.error('Translation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { role, goal, previousQuestions, userResponse, language = 'en', questionCount = 4 } = await request.json()

    // Enhanced question structure with categories
    const questions: Record<string, Question[]> = {
      "Software Engineer": [
        { id: 1, text: "Tell me about yourself and your experience as a software engineer.", category: "Introduction" },
        { id: 2, text: "Describe a challenging technical problem you solved recently.", category: "Technical" },
        { id: 3, text: "How do you approach debugging complex issues?", category: "Technical" },
        { id: 4, text: "What are your career goals for the next 5 years?", category: "Career" },
        { id: 5, text: "Tell me about a challenging bug you've encountered and how you solved it.", category: "Technical" },
        { id: 6, text: "How do you approach code reviews and what do you look for?", category: "Process" },
        { id: 7, text: "Describe your experience with system design and scalability.", category: "Architecture" },
        { id: 8, text: "What's your preferred development methodology and why?", category: "Process" },
        { id: 9, text: "How do you stay updated with new technologies and frameworks?", category: "Learning" },
      ],
      "Frontend Developer": [
        { id: 1, text: "Tell me about yourself and your frontend development experience.", category: "Introduction" },
        { id: 2, text: "How do you ensure cross-browser compatibility in your applications?", category: "Technical" },
        { id: 3, text: "Describe your approach to responsive web design.", category: "Design" },
        { id: 4, text: "What's your experience with modern JavaScript frameworks?", category: "Technical" },
        { id: 5, text: "How do you optimize web application performance?", category: "Performance" },
        { id: 6, text: "Tell me about your experience with CSS preprocessors and build tools.", category: "Tools" },
        { id: 7, text: "How do you handle state management in large applications?", category: "Architecture" },
        { id: 8, text: "What's your approach to testing frontend applications?", category: "Testing" },
      ],
      "Data Scientist": [
        { id: 1, text: "Tell me about yourself and your data science background.", category: "Introduction" },
        { id: 2, text: "Walk me through your approach to a typical data science project.", category: "Process" },
        { id: 3, text: "How do you handle missing or dirty data in your datasets?", category: "Data Cleaning" },
        { id: 4, text: "Describe a machine learning model you've built and deployed.", category: "ML" },
        { id: 5, text: "What's your experience with A/B testing and statistical analysis?", category: "Statistics" },
        { id: 6, text: "How do you communicate complex findings to non-technical stakeholders?", category: "Communication" },
        { id: 7, text: "What tools and frameworks do you prefer for data analysis?", category: "Tools" },
        { id: 8, text: "How do you validate and evaluate your machine learning models?", category: "ML" },
      ],
      "Product Manager": [
        { id: 1, text: "Tell me about yourself and your product management experience.", category: "Introduction" },
        { id: 2, text: "How do you prioritize features in a product roadmap?", category: "Strategy" },
        { id: 3, text: "Describe how you would gather and analyze user feedback.", category: "User Research" },
        { id: 4, text: "How do you work with engineering teams to deliver products?", category: "Collaboration" },
        { id: 5, text: "What metrics do you use to measure product success?", category: "Analytics" },
        { id: 6, text: "Tell me about a product launch you managed.", category: "Execution" },
        { id: 7, text: "How do you handle conflicting stakeholder requirements?", category: "Stakeholder Management" },
        { id: 8, text: "What's your approach to competitive analysis?", category: "Market Research" },
      ],
      "Marketing Manager": [
        { id: 1, text: "Tell me about yourself and your marketing experience.", category: "Introduction" },
        { id: 2, text: "How do you measure the success of a marketing campaign?", category: "Analytics" },
        { id: 3, text: "Describe your approach to understanding target audiences.", category: "Strategy" },
        { id: 4, text: "What's your experience with digital marketing channels?", category: "Digital Marketing" },
        { id: 5, text: "How do you develop and manage marketing budgets?", category: "Budget Management" },
        { id: 6, text: "Tell me about a successful campaign you've led.", category: "Campaign Management" },
        { id: 7, text: "How do you collaborate with sales teams?", category: "Collaboration" },
        { id: 8, text: "What's your approach to brand management?", category: "Brand Strategy" },
      ],
    }

    const roleQuestions = questions[role as keyof typeof questions] || questions["Software Engineer"]
    
    // If this is for generating a full question set
    if (questionCount && questionCount > 1) {
      const selectedQuestions = roleQuestions.slice(0, questionCount)
      
      // If language is not English, translate the questions
      if (language !== 'en') {
        const translatedQuestions: Question[] = await Promise.all(
          selectedQuestions.map(async (question): Promise<Question> => {
            const translatedText = await translateText(question.text, 'en', language)
            return {
              ...question,
              text: translatedText || question.text, // Fallback to English if translation fails
              originalText: question.text
            }
          })
        )

        return NextResponse.json({
          questions: translatedQuestions,
          language,
          role
        })
      }

      return NextResponse.json({
        questions: selectedQuestions,
        language: 'en',
        role
      })
    }

    // Original single question generation logic
    const randomQuestion = roleQuestions[Math.floor(Math.random() * roleQuestions.length)]
    
    // Translate if needed
    let finalQuestion: Question = randomQuestion
    if (language !== 'en') {
      const translatedText = await translateText(randomQuestion.text, 'en', language)
      if (translatedText) {
        finalQuestion = {
          ...randomQuestion,
          text: translatedText,
          originalText: randomQuestion.text
        }
      }
    }

    return NextResponse.json({
      question: finalQuestion.text,
      category: finalQuestion.category,
      followUp: Math.random() > 0.5 ? "Can you provide a specific example?" : null,
    })
  } catch (error) {
    console.error("Error generating question:", error)
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
