import { type NextRequest, NextResponse } from "next/server"
import { extractRealisticKeywords } from "./utils" // Assuming extractRealisticKeywords is moved to a separate file

export async function POST(request: NextRequest) {
  try {
    const { text, role } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY || "sk-dummy-key-for-development-testing-12345"

    // Use realistic fallback keyword extraction for development
    if (!apiKey || apiKey.includes("dummy") || apiKey.includes("development")) {
      const keywords = extractRealisticKeywords(text, role)
      return NextResponse.json({ keywords })
    }

    // Real GPT API call (when real key is provided)
    const prompt = `Extract the most relevant technical keywords and concepts from this interview response for a ${role} position:

"${text}"

Return only the top 5 most important keywords as a JSON array of strings. Focus on:
- Technical skills and technologies
- Programming languages and frameworks
- Tools and methodologies
- Industry-specific terms
- Relevant experience indicators

Example: ["react", "javascript", "api", "database", "testing"]`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting technical keywords from interview responses.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      const keywords = JSON.parse(content)
      return NextResponse.json({ keywords })
    } catch (parseError) {
      const fallbackKeywords = extractRealisticKeywords(text, role)
      return NextResponse.json({ keywords: fallbackKeywords })
    }
  } catch (error) {
    console.error("Keyword extraction failed:", error)
    const fallbackKeywords = extractRealisticKeywords("", "") // Providing empty strings as placeholders
    return NextResponse.json({ keywords: fallbackKeywords })
  }
}
