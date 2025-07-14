import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transcript, question, role } = await request.json()

    // Simulate AI analysis
    const wordCount = transcript.split(" ").length
    const hasSpecificExamples =
      transcript.toLowerCase().includes("example") ||
      transcript.toLowerCase().includes("project") ||
      transcript.toLowerCase().includes("experience")

    const feedbackOptions = [
      "Excellent response! Your answer was well-structured and included specific examples.",
      "Good technical depth. Consider adding more concrete examples to strengthen your answer.",
      "Clear communication. Try to be more specific about your role in the projects you mentioned.",
      "Strong answer! Your enthusiasm for the role comes through clearly.",
      "Well explained. Consider quantifying your achievements with specific metrics.",
      "Good structure. Adding more details about the challenges you faced would enhance your response.",
    ]

    let score = 70 + Math.floor(Math.random() * 25) // Base score 70-95

    // Adjust score based on response quality
    if (wordCount < 50) score -= 10
    if (wordCount > 200) score += 5
    if (hasSpecificExamples) score += 10

    const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]

    const analysis = {
      score: Math.min(score, 100),
      feedback,
      metrics: {
        wordCount,
        estimatedDuration: Math.floor(wordCount / 2), // Rough estimate: 2 words per second
        hasExamples: hasSpecificExamples,
        clarity: Math.floor(Math.random() * 30) + 70, // 70-100
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        relevance: Math.floor(Math.random() * 20) + 80, // 80-100
      },
      suggestions: [
        wordCount < 100 ? "Try to provide more detailed explanations" : null,
        !hasSpecificExamples ? "Include specific examples from your experience" : null,
        "Practice maintaining eye contact with the camera",
        "Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions",
      ].filter(Boolean),
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing response:", error)
    return NextResponse.json({ error: "Failed to analyze response" }, { status: 500 })
  }
}
