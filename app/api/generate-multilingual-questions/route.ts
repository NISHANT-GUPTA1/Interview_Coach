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
      questions = questions.filter((q: any) => typeof q === "string" && q.trim().length > 10).slice(0, count)

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
    const { role = "Software Engineer", goal = "interview", language = "English" } = await request.json().catch(() => ({}))
    
    const questions = generateFallbackQuestions(
      role,
      goal,
      language,
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
      Tamil: [
        `${role} ஆக உங்கள் அனுபவத்தைப் பற்றி கூறுங்கள் மற்றும் மென்பொருள் மேம்பாட்டில் உங்களை எது ஈர்த்தது.`,
        `சமீபத்தில் நீங்கள் தீர்த்த சவாலான தொழில்நுட்ப சிக்கலை விவரித்து உங்கள் அணுகுமுறையை விளக்குங்கள்.`,
        `உங்கள் திட்டங்களில் குறியீட்டின் தரம் மற்றும் பராமரிப்பை எவ்வாறு உறுதி செய்கிறீர்கள்?`,
        `பதிப்பு கட்டுப்பாட்டு அமைப்புகள் மற்றும் கூட்டு வளர்ச்சியில் உங்கள் அனுபவம் என்ன?`,
        `புதிய தொழில்நுட்பங்கள் மற்றும் நிரலாக்க போக்குகளுடன் நீங்கள் எவ்வாறு புதுப்பித்த நிலையில் இருக்கிறீர்கள்?`,
        `சிக்கலான சிக்கலை நீங்கள் பிழைத்திருத்த வேண்டிய நேரத்தை விவரிக்கவும். உங்கள் செயல்முறை என்ன?`,
      ],
      Telugu: [
        `${role} గా మీ అనుభవం గురించి చెప్పండి మరియు సాఫ్ట్‌వేర్ డెవలప్‌మెంట్‌కు మిమ్మల్ని ఏది ఆకర్షించింది.`,
        `ఇటీవల మీరు పరిష్కరించిన సవాలుతో కూడిన సాంకేతిక సమస్యను వివరించండి మరియు మీ విధానాన్ని వివరించండి.`,
        `మీ ప్రాజెక్ట్‌లలో కోడ్ నాణ్యత మరియు నిర్వహణను ఎలా నిర్ధారిస్తారు?`,
        `వెర్షన్ కంట్రోల్ సిస్టమ్‌లు మరియు సహకార అభివృద్ధితో మీ అనుభవం ఏమిటి?`,
        `కొత్త సాంకేతిక పరిజ్ఞానాలు మరియు ప్రోగ్రామింగ్ ట్రెండ్‌లతో మీరు ఎలా అప్‌డేట్‌గా ఉంటారు?`,
        `సంక్లిష్టమైన సమస్యను మీరు డీబగ్ చేయాల్సిన సమయాన్ని వివరించండి. మీ ప్రక్రియ ఏమిటి?`,
      ],
      Kannada: [
        `${role} ಆಗಿ ನಿಮ್ಮ ಅನುಭವದ ಬಗ್ಗೆ ಹೇಳಿ ಮತ್ತು ಸಾಫ್ಟ್‌ವೇರ್ ಅಭಿವೃದ್ಧಿಗೆ ನಿಮ್ಮನ್ನು ಏನು ಆಕರ್ಷಿಸಿತು.`,
        `ಇತ್ತೀಚೆಗೆ ನೀವು ಪರಿಹರಿಸಿದ ಸವಾಲಿನ ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ ಮತ್ತು ನಿಮ್ಮ ವಿಧಾನವನ್ನು ವಿವರಿಸಿ.`,
        `ನಿಮ್ಮ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳಲ್ಲಿ ಕೋಡ್ ಗುಣಮಟ್ಟ ಮತ್ತು ನಿರ್ವಹಣೆಯನ್ನು ಹೇಗೆ ಖಚಿತಪಡಿಸುತ್ತೀರಿ?`,
        `ಆವೃತ್ತಿ ನಿಯಂತ್ರಣ ವ್ಯವಸ್ಥೆಗಳು ಮತ್ತು ಸಹಕಾರಿ ಅಭಿವೃದ್ಧಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಅನುಭವ ಏನು?`,
        `ಹೊಸ ತಂತ್ರಜ್ಞಾನಗಳು ಮತ್ತು ಪ್ರೋಗ್ರಾಮಿಂಗ್ ಪ್ರವೃತ್ತಿಗಳೊಂದಿಗೆ ನೀವು ಹೇಗೆ ನವೀಕರಿಸಿಕೊಳ್ಳುತ್ತೀರಿ?`,
        `ಸಂಕೀರ್ಣವಾದ ಸಮಸ್ಯೆಯನ್ನು ಮೀರು ಡಿಬಗ್ ಮಾಡಬೇಕಾದ ಸಮಯವನ್ನು ವಿವರಿಸಿ. ನಿಮ್ಮ ಪ್ರಕ್ರಿಯೆ ಏನು?`,
      ],
      Malayalam: [
        `${role} ആയുള്ള നിങ്ങളുടെ അനുഭവത്തെക്കുറിച്ച് പറയുക, സോഫ്റ്റ്‌വെയർ ഡെവലപ്‌മെന്റിലേക്ക് നിങ്ങളെ എന്താണ് ആകർഷിച്ചത്.`,
        `അടുത്തിടെ നിങ്ങൾ പരിഹരിച്ച വെല്ലുവിളി നിറഞ്ഞ സാങ്കേതിക പ്രശ്നം വിവരിക്കുകയും നിങ്ങളുടെ സമീപനം വിശദീകരിക്കുകയും ചെയ്യുക.`,
        `നിങ്ങളുടെ പ്രോജക്റ്റുകളിൽ കോഡ് ഗുണനിലവാരവും പരിപാലനവും എങ്ങനെ ഉറപ്പാക്കുന്നു?`,
        `വേർഷൻ കൺട്രോൾ സിസ്റ്റങ്ങളും സഹകരണ വികസനവുമായുള്ള നിങ്ങളുടെ അനുഭവം എന്താണ്?`,
        `പുതിയ സാങ്കേതികവിദ്യകളും പ്രോഗ്രാമിംഗ് ട്രെൻഡുകളും ഉപയോഗിച്ച് നിങ്ങൾ എങ്ങനെ അപ്‌ഡേറ്റ് ആയി നിലകൊള്ളുന്നു?`,
        `സങ്കീർണ്ണമായ ഒരു പ്രശ്നം നിങ്ങൾ ഡിബഗ് ചെയ്യേണ്ടി വന്ന സമയം വിവരിക്കുക. നിങ്ങളുടെ പ്രക്രിയ എന്തായിരുന്നു?`,
      ],
      Marathi: [
        `${role} म्हणून तुमच्या अनुभवाबद्दल सांगा आणि सॉफ्टवेअर डेव्हलपमेंटकडे तुम्हाला कशाने आकर्षित केले.`,
        `अलीकडे तुम्ही सोडवलेली आव्हानात्मक तांत्रिक समस्या वर्णन करा आणि तुमचा दृष्टिकोन स्पष्ट करा.`,
        `तुम्ही तुमच्या प्रकल्पांमध्ये कोड गुणवत्ता आणि देखभाल कशी सुनिश्चित करता?`,
        `आवृत्ती नियंत्रण प्रणाली आणि सहयोगी विकासासह तुमचा काय अनुभव आहे?`,
        `नवीन तंत्रज्ञान आणि प्रोग्रामिंग ट्रेंडसह तुम्ही कसे अद्यतनित राहता?`,
        `जटिल समस्या तुम्हाला डीबग करावी लागलेल्या वेळेचे वर्णन करा. तुमची प्रक्रिया काय होती?`,
      ],
      Gujarati: [
        `${role} તરીકે તમારા અનુભવ વિશે કહો અને સોફ્ટવેર ડેવલપમેન્ટ તરફ તમને શું આકર્ષિત કર્યું.`,
        `હાલમાં તમે ઉકેલેલી પડકારજનક તકનીકી સમસ્યાનું વર્ણન કરો અને તમારો અભિગમ સમજાવો.`,
        `તમે તમારા પ્રોજેક્ટ્સમાં કોડ ગુણવત્તા અને જાળવણી કેવી રીતે સુનિશ્ચિત કરો છો?`,
        `વર્ઝન કંટ્રોલ સિસ્ટમ્સ અને સહયોગી વિકાસ સાથે તમારો શું અનુભવ છે?`,
        `તમે નવી ટેકનોલોજીઓ અને પ્રોગ્રામિંગ ટ્રેન્ડ્સ સાથે કેવી રીતે અપડેટ રહો છો?`,
        `જટિલ સમસ્યાને તમે ડીબગ કરવાનો સમય વર્ણવો. તમારી પ્રક્રિયા શું હતી?`,
      ],
      Punjabi: [
        `${role} ਵਜੋਂ ਆਪਣੇ ਅਨੁਭਵ ਬਾਰੇ ਦੱਸੋ ਅਤੇ ਸਾਫਟਵੇਅਰ ਡਿਵੈਲਪਮੈਂਟ ਵਿੱਚ ਤੁਹਾਨੂੰ ਕੀ ਆਕਰਸ਼ਿਤ ਕੀਤਾ।`,
        `ਹਾਲ ਹੀ ਵਿੱਚ ਤੁਸੀਂ ਹੱਲ ਕੀਤੀ ਮੁਸ਼ਕਿਲ ਤਕਨੀਕੀ ਸਮੱਸਿਆ ਦਾ ਵਰਣਨ ਕਰੋ ਅਤੇ ਆਪਣੇ ਤਰੀਕੇ ਦੱਸੋ।`,
        `ਤੁਸੀਂ ਆਪਣੇ ਪ੍ਰੋਜੈਕਟਾਂ ਵਿੱਚ ਕੋਡ ਦੀ ਗੁਣਵੱਤਾ ਅਤੇ ਰੱਖ-ਰਖਾਅ ਕਿਵੇਂ ਯਕੀਨੀ ਬਣਾਉਂਦੇ ਹੋ?`,
        `ਵਰਜ਼ਨ ਕੰਟਰੋਲ ਸਿਸਟਮਾਂ ਅਤੇ ਸਹਿਯੋਗੀ ਵਿਕਾਸ ਨਾਲ ਤੁਹਾਡਾ ਕੀ ਅਨੁਭਵ ਹੈ?`,
        `ਤੁਸੀਂ ਨਵੀਆਂ ਤਕਨੀਕਾਂ ਅਤੇ ਪ੍ਰੋਗਰਾਮਿੰਗ ਰੁਝਾਨਾਂ ਨਾਲ ਕਿਵੇਂ ਅਪਡੇਟ ਰਹਿੰਦੇ ਹੋ?`,
        `ਕੋਈ ਗੁੰਝਲਦਾਰ ਸਮੱਸਿਆ ਤੁਸੀਂ ਡੀਬੱਗ ਕਰਨ ਦੇ ਸਮੇਂ ਦਾ ਵਰਣਨ ਕਰੋ। ਤੁਹਾਡੀ ਪ੍ਰਕਿਰਿਆ ਕੀ ਸੀ?`,
      ],
      Bengali: [
        `${role} হিসেবে আপনার অভিজ্ঞতার কথা বলুন এবং সফটওয়্যার ডেভেলপমেন্টে কী আপনাকে আকৃষ্ট করেছে।`,
        `সম্প্রতি আপনি যে চ্যালেঞ্জিং প্রযুক্তিগত সমস্যা সমাধান করেছেন তার বর্ণনা দিন এবং আপনার পদ্ধতি ব্যাখ্যা করুন।`,
        `আপনি আপনার প্রকল্পগুলিতে কোডের গুণমান এবং রক্ষণাবেক্ষণ কীভাবে নিশ্চিত করেন?`,
        `ভার্সন কন্ট্রোল সিস্টেম এবং সহযোগিতামূলক উন্নয়নের সাথে আপনার কী অভিজ্ঞতা?`,
        `আপনি নতুন প্রযুক্তি এবং প্রোগ্রামিং ট্রেন্ডের সাথে কীভাবে আপডেট থাকেন?`,
        `এমন একটি সময়ের বর্ণনা দিন যখন আপনাকে একটি জটিল সমস্যা ডিবাগ করতে হয়েছিল। আপনার প্রক্রিয়া কী ছিল?`,
      ],
      Urdu: [
        `${role} کے طور پر اپنے تجربے کے بارے میں بتائیں اور سافٹ ویئر ڈیولپمنٹ میں آپ کو کیا متوجہ کیا۔`,
        `حال ہی میں آپ نے جو مشکل تکنیکی مسئلہ حل کیا ہے اس کی وضاحت کریں اور اپنے طریقہ کار کو بیان کریں۔`,
        `آپ اپنے پروجیکٹس میں کوڈ کی کوالٹی اور برقراری کو کیسے یقینی بناتے ہیں؟`,
        `ورژن کنٹرول سسٹمز اور تعاونی ترقی کے ساتھ آپ کا کیا تجربہ ہے؟`,
        `آپ نئی ٹیکنالوجیز اور پروگرامنگ ٹرینڈز کے ساتھ کیسے اپ ڈیٹ رہتے ہیں؟`,
        `ایک پیچیدہ مسئلے کو آپ نے ڈیبگ کرنے کے وقت کی وضاحت کریں۔ آپ کا عمل کیا تھا؟`,
      ]
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
  
  // Enhanced language fallback logic
  let languageQuestions = roleQuestions[language]
  
  if (!languageQuestions) {
    console.log(`⚠️ No questions found for language: ${language}, falling back to English`)
    languageQuestions = roleQuestions["English"]
  }

  return languageQuestions.slice(0, Math.min(count, languageQuestions.length))
}
