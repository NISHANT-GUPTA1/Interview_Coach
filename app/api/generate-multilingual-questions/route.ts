import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { role, goal, language, count = 6 } = await request.json()

    console.log(`🧠 Generating real AI questions for ${role} in ${language}...`)

    // Check if we have OpenAI API key for real processing
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey.includes("dummy") || apiKey.includes("development") || apiKey.includes("fake")) {
      console.log("⚠️ No real OpenAI API key found, using fallback questions")
      const questions = generateFallbackQuestions(role, goal, language, count)
      return NextResponse.json({
        questions,
        real: false,
        message: "Using fallback questions. Add OpenAI API key for AI-generated questions.",
      })
    }

    // Create detailed prompt for real AI question generation
    const prompt = `You are an expert technical interviewer conducting a ${goal} interview for a ${role} position in ${language} language.

Generate ${count} professional, relevant interview questions that:

1. Are specifically tailored for a ${role} role
2. Match the interview goal: ${goal}
3. Are written in ${language} language
4. Progress from basic to advanced difficulty
5. Include a mix of:
   - Technical knowledge questions
   - Problem-solving scenarios
   - Behavioral questions
   - Experience-based questions
6. Are engaging and realistic
7. Allow for detailed responses

Requirements:
- Each question should be complete and clear
- Questions should be appropriate for the ${language} speaking region
- Avoid overly complex or trick questions
- Focus on practical, job-relevant topics
- Make questions conversational and natural

Return ONLY a JSON array of ${count} questions as strings, nothing else.

Example format: ["Question 1 in ${language}", "Question 2 in ${language}", ...]`

    console.log("🚀 Calling OpenAI GPT-4 for real question generation...")

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
            content: `You are an expert multilingual technical interviewer. Generate professional interview questions in ${language} for ${role} positions. Always respond with valid JSON array format.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenAI API error:", response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ Real AI questions generated successfully")

    try {
      // Parse the JSON response
      const content = data.choices[0].message.content
      const parsedContent = JSON.parse(content)

      // Extract questions array from the response
      let questions = []
      if (Array.isArray(parsedContent)) {
        questions = parsedContent
      } else if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
        questions = parsedContent.questions
      } else if (parsedContent.interview_questions && Array.isArray(parsedContent.interview_questions)) {
        questions = parsedContent.interview_questions
      } else {
        throw new Error("Invalid response format from AI")
      }

      // Validate questions
      questions = questions.filter((q) => typeof q === "string" && q.trim().length > 10).slice(0, count)

      if (questions.length === 0) {
        throw new Error("No valid questions generated")
      }

      console.log(`✅ Generated ${questions.length} real AI questions in ${language}`)
      return NextResponse.json({ questions, real: true })
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      throw new Error("Failed to parse AI response")
    }
  } catch (error) {
    console.error("Real AI question generation failed:", error)

    // Fallback to manual questions with clear indication
    console.log("🔄 Falling back to manual questions...")
    const questions = generateFallbackQuestions(
      request.body?.role || "Software Engineer",
      request.body?.goal || "interview",
      request.body?.language || "English",
      6,
    )

    return NextResponse.json({
      questions,
      real: false,
      error: "Real AI question generation failed. Using fallback questions.",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function generateFallbackQuestions(role: string, goal: string, language: string, count: number): string[] {
  console.log(`⚠️ Using fallback questions for ${role} in ${language}`)

  const questionBank: { [key: string]: { [key: string]: string[] } } = {
    "Software Engineer": {
      English: [
        `Tell me about your experience as a ${role} and what drew you to software development.`,
        `Describe a challenging technical problem you solved recently and walk me through your approach.`,
        `How do you ensure code quality and maintainability in your projects?`,
        `What's your experience with version control systems and collaborative development?`,
        `How do you stay updated with new technologies and programming trends?`,
        `Describe a time when you had to debug a complex issue. What was your process?`,
      ],
      Hindi: [
        `${role} के रूप में अपने अनुभव के बारे में बताएं और क्या आपको सॉफ्टवेयर डेवलपमेंट की ओर आकर्षित किया।`,
        `हाल ही में आपने जो चुनौतीपूर्ण तकनीकी समस्या हल की है, उसका वर्णन करें और अपना दृष्टिकोण बताएं।`,
        `आप अपने प्रोजेक्ट्स में कोड की गुणवत्ता और रखरखाव कैसे सुनिश्चित करते हैं?`,
        `वर्जन कंट्रोल सिस्टम और सहयोगी विकास के साथ आपका क्या अनुभव है?`,
        `आप नई तकनीकों और प्रोग्रामिंग ट्रेंड्स के साथ कैसे अपडेट रहते हैं?`,
        `एक समय का वर्णन करें जब आपको एक जटिल समस्या को डिबग करना पड़ा। आपकी प्रक्रिया क्या थी?`,
      ],
      Bengali: [
        `${role} হিসেবে আপনার অভিজ্ঞতার কথা বলুন এবং কী আপনাকে সফটওয়্যার ডেভেলপমেন্টের দিকে আকর্ষণ করেছে।`,
        `সম্প্রতি আপনি যে চ্যালেঞ্জিং প্রযুক্তিগত সমস্যা সমাধান করেছেন তার বর্ণনা দিন এবং আপনার পদ্ধতি ব্যাখ্যা করুন।`,
        `আপনি আপনার প্রকল্পগুলিতে কোডের গুণমান এবং রক্ষণাবেক্ষণ কীভাবে নিশ্চিত করেন?`,
        `ভার্সন কন্ট্রোল সিস্টেম এবং সহযোগিতামূলক উন্নয়নের সাথে আপনার কী অভিজ্ঞতা?`,
        `আপনি নতুন প্রযুক্তি এবং প্রোগ্রামিং ট্রেন্ডের সাথে কীভাবে আপডেট থাকেন?`,
        `এমন একটি সময়ের বর্ণনা দিন যখন আপনাকে একটি জটিল সমস্যা ডিবাগ করতে হয়েছিল। আপনার প্রক্রিয়া কী ছিল?`,
      ],
    },
    "Frontend Developer": {
      English: [
        `What's your experience with modern JavaScript frameworks and which do you prefer?`,
        `How do you approach responsive web design and ensure cross-browser compatibility?`,
        `Describe a complex UI component you built and the challenges you faced.`,
        `How do you optimize web application performance and user experience?`,
        `What's your process for collaborating with designers and backend developers?`,
        `How do you handle state management in large frontend applications?`,
      ],
      Hindi: [
        `आधुनिक जावास्क्रिप्ट फ्रेमवर्क के साथ आपका क्या अनुभव है और आप किसे प्राथमिकता देते हैं?`,
        `आप रिस्पॉन्सिव वेब डिज़ाइन कैसे करते हैं और क्रॉस-ब्राउज़र संगतता कैसे सुनिश्चित करते हैं?`,
        `आपने जो जटिल UI कंपोनेंट बनाया है उसका वर्णन करें और आपको किन चुनौतियों का सामना करना पड़ा।`,
        `आप वेब एप्लिकेशन प्रदर्शन और उपयोगकर्ता अनुभव को कैसे अनुकूलित करते हैं?`,
        `डिज़ाइनर और बैकएंड डेवलपर्स के साथ सहयोग करने की आपकी प्रक्रिया क्या है?`,
        `बड़े फ्रंटएंड एप्लिकेशन में आप स्टेट मैनेजमेंट कैसे करते हैं?`,
      ],
    },
  }

  const roleQuestions = questionBank[role] || questionBank["Software Engineer"]
  const languageQuestions = roleQuestions[language] || roleQuestions["English"]

  return languageQuestions.slice(0, Math.min(count, languageQuestions.length))
}
