import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transcript, keywords, emotion, question, role, language } = await request.json()

    console.log(`🧠 Generating real AI feedback in ${language}...`)

    // Check if we have OpenAI API key for real processing
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey.includes("dummy") || apiKey.includes("development") || apiKey.includes("fake")) {
      console.log("⚠️ No real OpenAI API key found, using fallback feedback")
      const feedback = generateFallbackFeedback(transcript, keywords, emotion, question, role, language)
      return NextResponse.json({
        feedback,
        real: false,
        message: "Using fallback feedback. Add OpenAI API key for AI-generated feedback.",
      })
    }

    // Prepare emotion context if available
    const emotionContext = emotion
      ? `
Emotion Analysis Data:
- Confidence Level: ${Math.round(emotion.confidence * 100)}%
- Eye Contact: ${Math.round(emotion.eye_contact * 100)}%
- Engagement: ${Math.round(emotion.engagement * 100)}%
- Dominant Emotion: ${emotion.dominant_emotion}
- Stress Level: ${Math.round((emotion.stress || 0) * 100)}%
`
      : ""

    const keywordContext =
      keywords && keywords.length > 0
        ? `
Detected Keywords: ${keywords.join(", ")}
`
        : ""

    // Create comprehensive prompt for real AI feedback
    const prompt = `You are an expert ${role} interviewer providing constructive feedback in ${language} language.

Interview Question: "${question}"

Candidate's Response: "${transcript}"
${keywordContext}${emotionContext}

Please provide specific, actionable feedback in ${language} that:

1. Acknowledges specific strengths in their response
2. Identifies areas for improvement with concrete suggestions
3. References technical concepts or keywords they mentioned
4. Considers their confidence and engagement level if emotion data is available
5. Gives practical advice for better interview performance
6. Maintains an encouraging but honest tone
7. Is culturally appropriate for ${language} speakers

Keep the feedback concise (2-3 sentences) but meaningful. Focus on both content and delivery aspects.

Respond only in ${language} language.`

    console.log("🚀 Calling OpenAI GPT-4 for real feedback generation...")

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
            content: `You are an expert technical interviewer providing constructive feedback in ${language}. Always respond in ${language} language with specific, actionable advice.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenAI API error:", response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const feedback = data.choices[0].message.content.trim()

    console.log("✅ Real AI feedback generated successfully")
    return NextResponse.json({ feedback, real: true })
  } catch (error) {
    console.error("Real AI feedback generation failed:", error)

    // Fallback to manual feedback
    console.log("🔄 Falling back to manual feedback...")
    const feedback = generateFallbackFeedback("", [], null, "", "", "English")

    return NextResponse.json({
      feedback,
      real: false,
      error: "Real AI feedback generation failed. Using fallback feedback.",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function generateFallbackFeedback(
  transcript: string,
  keywords: string[],
  emotion: any,
  question: string,
  role: string,
  language: string,
): string {
  console.log(`⚠️ Using fallback feedback in ${language}`)

  const wordCount = transcript
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length

  const feedbackTemplates = {
    English: [
      "Thank you for your detailed response. I can see you have relevant experience. Consider providing more specific examples with measurable outcomes to strengthen your answers.",
      "Good technical knowledge comes through in your answer. To improve, try to structure your responses using the STAR method and maintain more eye contact with the interviewer.",
      "I appreciate the depth of your response. For future interviews, consider being more concise while still covering the key points, and speak with more confidence.",
    ],
    Hindi: [
      "आपके विस्तृत उत्तर के लिए धन्यवाद। मैं देख सकता हूं कि आपके पास प्रासंगिक अनुभव है। अपने उत्तरों को मजबूत बनाने के लिए मापने योग्य परिणामों के साथ अधिक विशिष्ट उदाहरण देने पर विचार करें।",
      "आपके उत्तर में अच्छा तकनीकी ज्ञान दिखता है। सुधार के लिए, STAR पद्धति का उपयोग करके अपने उत्तरों को संरचित करने का प्रयास करें और साक्षात्कारकर्ता के साथ अधिक आंखों का संपर्क बनाए रखें।",
      "मैं आपके उत्तर की गहराई की सराहना करता हूं। भविष्य के साक्षात्कारों के लिए, मुख्य बिंदुओं को कवर करते हुए अधिक संक्षिप्त होने पर विचार करें, और अधिक आत्मविश्वास के साथ बोलें।",
    ],
    Bengali: [
      "আপনার বিস্তারিত উত্তরের জন্য ধন্যবাদ। আমি দেখতে পাচ্ছি আপনার প্রাসঙ্গিক অভিজ্ঞতা রয়েছে। আপনার উত্তরগুলি শক্তিশালী করতে পরিমাপযোগ্য ফলাফল সহ আরও নির্দিষ্ট উদাহরণ প্রদান করার কথা বিবেচনা করুন।",
      "আপনার উত্তরে ভাল প্রযুক্তিগত জ্ঞান প্রকাশ পায়। উন্নতির জন্য, STAR পদ্ধতি ব্যবহার করে আপনার উত্তরগুলি কাঠামোবদ্ধ করার চেষ্টা করুন এবং সাক্ষাৎকারকারীর সাথে আরও চোখের যোগাযোগ বজায় রাখুন।",
      "আমি আপনার উত্তরের গভীরতার প্রশংসা করি। ভবিষ্যতের সাক্ষাৎকারের জন্য, মূল বিষয়গুলি কভার করার সময় আরও সংক্ষিপ্ত হওয়ার কথা বিবেচনা করুন এবং আরও আত্মবিশ্বাসের সাথে কথা বলুন।",
    ],
  }

  const templates = feedbackTemplates[language as keyof typeof feedbackTemplates] || feedbackTemplates.English
  return templates[Math.floor(Math.random() * templates.length)]
}
