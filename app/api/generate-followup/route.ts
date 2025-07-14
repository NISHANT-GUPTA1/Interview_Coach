import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { keywords, answer, originalQuestion, role } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const prompt = `Based on this ${role} interview response, generate a relevant follow-up question:

Original Question: "${originalQuestion}"
Candidate's Answer: "${answer}"
Key Topics Mentioned: ${keywords.join(", ")}

Generate ONE specific follow-up question that:
1. Digs deeper into a technical concept they mentioned
2. Asks for specific examples or implementation details
3. Tests their deeper understanding
4. Is relevant to the ${role} role
5. Builds naturally from their response

Return only the follow-up question, no additional text.`

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
            content: "You are an expert technical interviewer generating insightful follow-up questions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const followUpQuestion = data.choices[0].message.content.trim()

    return NextResponse.json({ followUpQuestion })
  } catch (error) {
    console.error("Follow-up generation failed:", error)
    return NextResponse.json({ error: "Failed to generate follow-up" }, { status: 500 })
  }
}
