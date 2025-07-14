import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { role, goal, language, count = 6 } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY || "sk-dummy-key-for-development-testing-12345"

    // Use realistic fallback questions for development
    if (!apiKey || apiKey.includes("dummy") || apiKey.includes("development")) {
      const questions = generateRealisticQuestions(role, goal, count)
      return NextResponse.json({ questions })
    }

    // Real GPT API call (when real key is provided)
    const prompt = `Generate ${count} professional interview questions for a ${role} position. 
    The interview goal is: ${goal}
    Language: ${language}
    
    Requirements:
    - Questions should be relevant to ${role} role
    - Mix of technical, behavioral, and situational questions
    - Progressive difficulty
    - Include follow-up potential
    - Professional and engaging tone
    
    Return only the questions as a JSON array of strings.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. Generate professional, relevant interview questions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      const questions = JSON.parse(content)
      return NextResponse.json({ questions })
    } catch (parseError) {
      const questionLines = content
        .split("\n")
        .filter((line: string) => line.trim().length > 10 && (line.includes("?") || line.match(/^\d+\./)))
      return NextResponse.json({ questions: questionLines.slice(0, count) })
    }
  } catch (error) {
    console.error("Question generation failed:", error)
    const count = 6 // Declare the count variable here
    const questions = generateRealisticQuestions(
      request.body?.role || "Software Engineer",
      request.body?.goal || "interview",
      count,
    )
    return NextResponse.json({ questions })
  }
}

function generateRealisticQuestions(role: string, goal: string, count: number): string[] {
  const questionBank: { [key: string]: string[] } = {
    "Software Engineer": [
      "Tell me about yourself and your experience in software development.",
      "What programming languages are you most comfortable with and why?",
      "Describe a challenging bug you encountered recently and how you solved it.",
      "How do you approach code reviews? What do you look for?",
      "Explain the difference between synchronous and asynchronous programming.",
      "What's your experience with version control systems like Git?",
      "How do you ensure your code is maintainable and scalable?",
      "Describe a project where you had to learn a new technology quickly.",
      "What testing strategies do you implement in your development process?",
      "How do you handle tight deadlines while maintaining code quality?",
      "What's your approach to debugging complex issues?",
      "Where do you see yourself in your software engineering career in 5 years?",
    ],
    "Frontend Developer": [
      "Tell me about your experience with modern JavaScript frameworks.",
      "How do you ensure cross-browser compatibility in your applications?",
      "What's your approach to responsive web design?",
      "Describe how you optimize web application performance.",
      "What CSS preprocessors have you worked with and why?",
      "How do you handle state management in complex applications?",
      "What's your experience with build tools and bundlers?",
      "How do you ensure accessibility in your web applications?",
      "Describe a challenging UI/UX problem you've solved.",
      "What's your approach to testing frontend applications?",
      "How do you stay updated with the latest frontend technologies?",
      "What questions do you have about our frontend tech stack?",
    ],
    "Backend Developer": [
      "Tell me about your experience with server-side technologies.",
      "How do you design and implement RESTful APIs?",
      "What's your approach to database design and optimization?",
      "Describe how you handle authentication and authorization.",
      "What's your experience with microservices architecture?",
      "How do you ensure API security and prevent common vulnerabilities?",
      "Describe a time when you had to optimize application performance.",
      "What's your approach to error handling and logging?",
      "How do you handle database migrations and schema changes?",
      "What's your experience with cloud platforms and deployment?",
      "How do you monitor and maintain production systems?",
      "What questions do you have about our backend infrastructure?",
    ],
    "Data Scientist": [
      "Walk me through your approach to a typical data science project.",
      "How do you handle missing or inconsistent data in your datasets?",
      "Describe a machine learning model you've built and deployed.",
      "What's your experience with statistical analysis and hypothesis testing?",
      "How do you evaluate the performance of your machine learning models?",
      "What tools and libraries do you prefer for data analysis?",
      "Describe how you communicate complex findings to non-technical stakeholders.",
      "What's your approach to feature engineering and selection?",
      "How do you ensure your models are fair and unbiased?",
      "What's your experience with big data technologies?",
      "Describe a challenging data problem you've solved.",
      "What questions do you have about our data science initiatives?",
    ],
  }

  const defaultQuestions = [
    "Tell me about yourself and your professional background.",
    "What interests you most about this role and our company?",
    "Describe a challenging project you've worked on recently.",
    "How do you handle pressure and tight deadlines?",
    "What are your greatest strengths and how do they apply to this role?",
    "Describe a time when you had to learn something new quickly.",
    "How do you approach problem-solving in your work?",
    "What motivates you in your professional life?",
    "Where do you see yourself in the next 5 years?",
    "What questions do you have for me about the role or company?",
  ]

  const roleQuestions = questionBank[role] || defaultQuestions

  // Shuffle and return the requested number of questions
  const shuffled = [...roleQuestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
