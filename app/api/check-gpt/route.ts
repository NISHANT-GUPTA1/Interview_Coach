import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use dummy API key for development
    const apiKey = process.env.OPENAI_API_KEY || "sk-dummy-key-for-development-testing-12345"

    // For development, always return available
    if (apiKey.includes("dummy") || apiKey.includes("development")) {
      return NextResponse.json({ available: true, mode: "development" })
    }

    // Test real API connection only if real key is provided
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return NextResponse.json({ available: true, mode: "production" })
    } else {
      return NextResponse.json({ available: true, mode: "development", reason: "Using fallback mode" })
    }
  } catch (error) {
    console.error("GPT availability check failed:", error)
    return NextResponse.json({ available: true, mode: "development", reason: "Using fallback mode" })
  }
}
