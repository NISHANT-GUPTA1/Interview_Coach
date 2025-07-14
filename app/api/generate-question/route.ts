import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { role, goal, previousQuestions, userResponse } = await request.json()

    // Simulate AI question generation
    const questions = {
      "Software Engineer": [
        "Tell me about a challenging bug you've encountered and how you solved it.",
        "How do you approach code reviews and what do you look for?",
        "Describe your experience with system design and scalability.",
        "What's your preferred development methodology and why?",
        "How do you stay updated with new technologies and frameworks?",
      ],
      "Frontend Developer": [
        "How do you ensure cross-browser compatibility in your applications?",
        "Describe your approach to responsive web design.",
        "What's your experience with modern JavaScript frameworks?",
        "How do you optimize web application performance?",
        "Tell me about your experience with CSS preprocessors and build tools.",
      ],
      "Data Scientist": [
        "Walk me through your approach to a typical data science project.",
        "How do you handle missing or dirty data in your datasets?",
        "Describe a machine learning model you've built and deployed.",
        "What's your experience with A/B testing and statistical analysis?",
        "How do you communicate complex findings to non-technical stakeholders?",
      ],
    }

    const roleQuestions = questions[role as keyof typeof questions] || questions["Software Engineer"]
    const randomQuestion = roleQuestions[Math.floor(Math.random() * roleQuestions.length)]

    return NextResponse.json({
      question: randomQuestion,
      followUp: Math.random() > 0.5 ? "Can you provide a specific example?" : null,
    })
  } catch (error) {
    console.error("Error generating question:", error)
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
