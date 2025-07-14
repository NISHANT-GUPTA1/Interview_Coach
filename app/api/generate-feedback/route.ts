import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transcript, keywords, emotion, question, role } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY || "sk-dummy-key-for-development-testing-12345"

    // Use realistic fallback feedback for development
    if (!apiKey || apiKey.includes("dummy") || apiKey.includes("development")) {
      const feedback = generateRealisticFeedback(transcript, keywords, emotion, question, role)
      return NextResponse.json({ feedback })
    }

    // Real GPT API call (when real key is provided)
    const emotionContext = emotion
      ? `
    Emotion Analysis:
    - Confidence: ${Math.round(emotion.confidence * 100)}%
    - Eye Contact: ${Math.round(emotion.eye_contact * 100)}%
    - Engagement: ${Math.round(emotion.engagement * 100)}%
    - Dominant Emotion: ${emotion.dominant_emotion}
    `
      : ""

    const prompt = `As an expert interviewer, provide constructive feedback for this ${role} interview response:

Question: "${question}"
Response: "${transcript}"
Keywords Detected: ${keywords.join(", ")}
${emotionContext}

Provide specific, actionable feedback that:
1. Acknowledges strengths in the response
2. Suggests specific improvements
3. References the emotion/confidence data if provided
4. Gives practical advice for better interview performance
5. Keeps feedback encouraging but honest

Limit to 2-3 sentences, professional tone.`

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
            content: "You are an expert technical interviewer providing constructive feedback.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const feedback = data.choices[0].message.content

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Feedback generation failed:", error)
    const feedback = generateRealisticFeedback("", [], null, "", "")
    return NextResponse.json({ feedback })
  }
}

function generateRealisticFeedback(
  transcript: string,
  keywords: string[],
  emotion: any,
  question: string,
  role: string,
): string {
  const wordCount = transcript
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const hasExamples =
    transcript.toLowerCase().includes("example") ||
    transcript.toLowerCase().includes("project") ||
    transcript.toLowerCase().includes("experience")

  let feedback = ""

  // Analyze response quality
  if (wordCount < 30) {
    feedback =
      "Your response was quite brief. Try to provide more detailed explanations with specific examples to demonstrate your experience and knowledge."
  } else if (wordCount > 200) {
    feedback =
      "Great detail in your response! Consider being more concise while maintaining the key points to keep the interviewer engaged."
  } else {
    feedback = "Good response length and structure. "
  }

  // Add content-specific feedback
  if (hasExamples) {
    feedback +=
      "I appreciate that you included specific examples - this really helps demonstrate your practical experience. "
  } else {
    feedback += "Consider adding a specific example from your experience to make your answer more compelling. "
  }

  // Add keyword-based feedback
  if (keywords.length > 0) {
    feedback += `I noticed you mentioned ${keywords.slice(0, 2).join(" and ")} - that's directly relevant to this ${role} role. `
  }

  // Add emotion-based feedback if available
  if (emotion) {
    if (emotion.confidence < 0.5) {
      feedback += "Try to speak with more confidence and conviction in your delivery."
    } else if (emotion.confidence > 0.7) {
      feedback += "Great confidence in your delivery!"
    }

    if (emotion.eye_contact < 0.4) {
      feedback += " Remember to maintain eye contact with the camera to create better connection."
    }

    if (emotion.engagement > 0.7) {
      feedback += " Your enthusiasm for the topic really comes through!"
    }
  }

  // Add role-specific advice
  const roleAdvice: { [key: string]: string } = {
    "Software Engineer":
      "For technical roles, consider mentioning specific technologies, methodologies, or metrics when possible.",
    "Frontend Developer": "For frontend roles, discussing user experience and performance considerations adds value.",
    "Backend Developer":
      "For backend roles, mentioning scalability, security, or system design aspects strengthens your answer.",
    "Data Scientist":
      "For data science roles, discussing your analytical approach and results interpretation is valuable.",
  }

  if (roleAdvice[role]) {
    feedback += " " + roleAdvice[role]
  }

  return feedback.trim()
}
