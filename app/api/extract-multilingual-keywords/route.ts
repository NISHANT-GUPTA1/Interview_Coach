import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, role, language } = await request.json()

    // TODO: Replace with real API key
    const apiKey = process.env.OPENAI_API_KEY || "sk-fake-key-for-development-replace-with-real-key"

    // Use realistic fallback keyword extraction for development
    if (!apiKey || apiKey.includes("fake")) {
      const keywords = extractMultilingualKeywords(text, role, language)
      return NextResponse.json({ keywords })
    }

    // Real GPT API call for multilingual keyword extraction
    const prompt = `Extract the most relevant technical keywords and concepts from this ${language} interview response for a ${role} position:

"${text}"

Return only the top 5 most important keywords as a JSON array of strings. Focus on:
- Technical skills and technologies
- Programming languages and frameworks
- Tools and methodologies
- Industry-specific terms in ${language}
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
            content: `You are an expert at extracting technical keywords from multilingual interview responses in ${language}.`,
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
      const fallbackKeywords = extractMultilingualKeywords(text, role, language)
      return NextResponse.json({ keywords: fallbackKeywords })
    }
  } catch (error) {
    console.error("Multilingual keyword extraction failed:", error)
    const fallbackKeywords = extractMultilingualKeywords("", "", "English")
    return NextResponse.json({ keywords: fallbackKeywords })
  }
}

function extractMultilingualKeywords(text: string, role: string, language: string): string[] {
  const technicalKeywords = {
    English: [
      "react",
      "vue",
      "angular",
      "javascript",
      "typescript",
      "node.js",
      "python",
      "java",
      "sql",
      "database",
      "api",
      "microservices",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "cloud",
      "git",
      "agile",
      "testing",
      "debugging",
      "performance",
    ],
    Hindi: [
      "रिएक्ट",
      "व्यू",
      "एंगुलर",
      "जावास्क्रिप्ट",
      "टाइपस्क्रिप्ट",
      "नोड.जेएस",
      "पायथन",
      "जावा",
      "एसक्यूएल",
      "डेटाबेस",
      "एपीआई",
      "माइक्रोसर्विसेज",
      "डॉकर",
      "कुबेरनेट्स",
      "एडब्ल्यूएस",
      "एज़्योर",
      "क्लाउड",
      "गिट",
      "एजाइल",
      "टेस्टिंग",
      "डिबगिंग",
      "प्रदर्शन",
    ],
    Bengali: [
      "রিঅ্যাক্ট",
      "ভিউ",
      "অ্যাঙ্গুলার",
      "জাভাস্ক্রিপ্ট",
      "টাইপস্ক্রিপ্ট",
      "নোড.জেএস",
      "পাইথন",
      "জাভা",
      "এসকিউএল",
      "ডেটাবেস",
      "এপিআই",
      "মাইক্রোসার্ভিস",
      "ডকার",
      "কুবারনেটিস",
      "এডাব্লিউএস",
      "অ্যাজুর",
      "ক্লাউড",
      "গিট",
      "অ্যাজাইল",
      "টেস্টিং",
      "ডিবাগিং",
      "পারফরম্যান্স",
    ],
    Tamil: [
      "ரியாக்ட்",
      "வியூ",
      "ஆங்குலர்",
      "ஜாவாஸ்கிரிப்ட்",
      "டைப்ஸ்கிரிப்ட்",
      "நோட்.ஜேஎஸ்",
      "பைதான்",
      "ஜாவா",
      "எஸ்க்யூஎல்",
      "டேட்டாபேஸ்",
      "ஏபிஐ",
      "மைக்ரோசர்வீஸ்",
      "டாக்கர்",
      "குபர்னெட்ஸ்",
      "ஏடபிள்யூஎஸ்",
      "அஸூர்",
      "கிளவுட்",
      "கிட்",
      "அஜைல்",
      "டெஸ்டிங்",
      "டிபக்கிங்",
      "செயல்திறன்",
    ],
    Telugu: [
      "రియాక్ట్",
      "వ్యూ",
      "యాంగులర్",
      "జావాస్క్రిప్ట్",
      "టైప్‌స్క్రిప్ట్",
      "నోడ్.జేఎస్",
      "పైథాన్",
      "జావా",
      "ఎస్‌క్యూఎల్",
      "డేటాబేస్",
      "ఏపిఐ",
      "మైక్రోసర్వీసెస్",
      "డాకర్",
      "కుబెర్నెట్స్",
      "ఏడబ్ల్యూఎస్",
      "అజూర్",
      "క్లౌడ్",
      "గిట్",
      "అజైల్",
      "టెస్టింగ్",
      "డిబగ్గింగ్",
      "పనితీరు",
    ],
    Marathi: [
      "रिअॅक्ट",
      "व्यू",
      "अँगुलर",
      "जावास्क्रिप्ट",
      "टाइपस्क्रिप्ट",
      "नोड.जेएस",
      "पायथन",
      "जावा",
      "एसक्यूएल",
      "डेटाबेस",
      "एपीआय",
      "मायक्रोसर्व्हिसेस",
      "डॉकर",
      "कुबेरनेट्स",
      "एडब्ल्यूएस",
      "अझुर",
      "क्लाउड",
      "गिट",
      "अजाइल",
      "टेस्टिंग",
      "डिबगिंग",
      "कामगिरी",
    ],
  }

  const keywords = technicalKeywords[language as keyof typeof technicalKeywords] || technicalKeywords.English
  const words = text.toLowerCase().split(/\s+/)
  const relevantKeywords = keywords.filter((keyword) =>
    words.some((word) => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)),
  )

  return relevantKeywords.slice(0, 5)
}
