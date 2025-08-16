import { NextRequest, NextResponse } from 'next/server';

// Real-time Multilingual Interview API - NO FALLBACKS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      operation, // 'questions' | 'analysis' | 'feedback' | 'followup'
      role = 'Software Engineer',
      experience = '2-3 years',
      language = 'en',
      count = 5,
      interviewData = null
    } = body;

    console.log('🌐 Real-time Multilingual Interview API called:', { 
      operation, 
      role, 
      experience, 
      language, 
      count 
    });

    // MANDATORY: OpenRouter API key required for ALL operations
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterKey || openrouterKey.includes('dummy')) {
      console.error('❌ NO VALID OPENROUTER API KEY - Cannot perform real-time operations');
      return NextResponse.json({
        success: false,
        error: 'OpenRouter API key required for real-time operations',
        message: "CRITICAL: Configure OpenRouter API key for AI-powered multilingual interviews. No fallback content will be provided.",
        data: null,
        real: false
      }, { status: 400 });
    }

    let result;

    try {
      switch (operation) {
        case 'questions':
          console.log('🚀 Generating REAL-TIME questions...');
          result = await generateRealTimeQuestions(role, experience, language, count, openrouterKey);
          break;
          
        case 'analysis':
          console.log('🚀 Generating REAL-TIME analysis...');
          result = await generateRealTimeAnalysis(interviewData, language, openrouterKey);
          break;
          
        case 'feedback':
          console.log('🚀 Generating REAL-TIME feedback...');
          result = await generateRealTimeFeedback(interviewData, language, openrouterKey);
          break;
          
        case 'followup':
          console.log('🚀 Generating REAL-TIME followup questions...');
          result = await generateRealTimeFollowup(interviewData, language, openrouterKey);
          break;
          
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      console.log('✅ Real-time', operation, 'completed successfully for', language);
      
      return NextResponse.json({
        success: true,
        operation,
        data: result,
        real: true,
        provider: 'OpenRouter',
        language: language,
        generated: 'real-time',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Real-time', operation, 'failed:', error);
      
      // NO FALLBACK - Return error for real-time requirement
      return NextResponse.json({
        success: false,
        operation,
        error: `Real-time ${operation} generation failed`,
        message: 'OpenRouter API failed. Please check API key and try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: null,
        real: false
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Real-time Multilingual API error:', error);
    return NextResponse.json({
      success: false,
      error: 'API operation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      real: false
    }, { status: 500 });
  }
}

async function generateRealTimeQuestions(
  role: string,
  experience: string,
  language: string,
  count: number,
  apiKey: string
): Promise<any[]> {
  
  // Language-specific prompts for pure language content
  const languagePrompts = {
    'hi': `${count} व्यावसायिक साक्षात्कार प्रश्न हिंदी में ${role} पद के लिए (${experience} अनुभव) बनाएं। केवल हिंदी भाषा में तकनीकी, व्यावसायिक प्रश्न हों।`,
    'ta': `${count} தொழில்முறை நேர்காணல் கேள்விகளை தமிழில் ${role} பதவிக்காக (${experience} அனுபவம்) உருவாக்கவும். தமிழ் மொழியில் மட்டும் தொழில்நுட்ப கேள்விகள்।`,
    'te': `${count} వృత్తిపరమైన ఇంటర్వ్యూ ప్రశ్నలను తెలుగులో ${role} స్థానం కోసం (${experience} అనుభవం) రూపొందించండి। తెలుగు భాషలో మాత్రమే సాంకేతిక ప్రశ్నలు।`,
    'kn': `${count} ವೃತ್ತಿಪರ ಸಂದರ್ಶನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ${role} ಹುದ್ದೆಗಾಗಿ (${experience} ಅನುಭವ) ರಚಿಸಿ। ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಮಾತ್ರ ತಾಂತ್ರಿಕ ಪ್ರಶ್ನೆಗಳು।`,
    'ml': `${count} പ്രൊഫഷണൽ അഭിമുഖ ചോദ്യങ്ങൾ മലയാളത്തിൽ ${role} സ്ഥാനത്തിനായി (${experience} പരിചയം) സൃഷ്ടിക്കുക। മലയാളം ഭാഷയിൽ മാത്രം സാങ്കേതിക ചോദ്യങ്ങൾ।`,
    'mr': `${count} व्यावसायिक मुलाखत प्रश्न मराठीत ${role} पदासाठी (${experience} अनुभव) तयार करा। मराठी भाषेत फक्त तांत्रिक प्रश्न।`,
    'gu': `${count} વ્યાવસાયિક ઇન્ટરવ્યુ પ્રશ્નો ગુજરાતીમાં ${role} પદ માટે (${experience} અનુભવ) બનાવો। ગુજરાતી ભાષામાં જ તકનીકી પ્રશ્નો।`,
    'pa': `${count} ਪੇਸ਼ੇਵਰ ਇੰਟਰਵਿਊ ਸਵਾਲ ਪੰਜਾਬੀ ਵਿੱਚ ${role} ਪਦ ਲਈ (${experience} ਤਜਰਬਾ) ਬਣਾਓ। ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਵਿੱਚ ਹੀ ਤਕਨੀਕੀ ਸਵਾਲ।`,
    'bn': `${count}টি পেশাদার ইন্টারভিউ প্রশ্ন বাংলায় ${role} পদের জন্য (${experience} অভিজ্ঞতা) তৈরি করুন। বাংলা ভাষায় শুধুমাত্র প্রযুক্তিগত প্রশ্ন।`,
    'ur': `${count} پیشہ ورانہ انٹرویو سوالات اردو میں ${role} عہدے کے لیے (${experience} تجربہ) بنائیں۔ صرف اردو زبان میں تکنیکی سوالات۔`,
    'default': `Generate ${count} professional technical interview questions for a ${role} position with ${experience} experience. Return only questions in pure ${language} language.`
  };

  const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.default;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ai-interview-coach.vercel.app',
      'X-Title': 'AI Interview Coach - Real-time Multilingual'
    },
    body: JSON.stringify({
      model: 'microsoft/wizardlm-2-8x22b',
      messages: [
        {
          role: 'system',
          content: `You are an expert multilingual interview question generator. Generate questions ONLY in the requested language. Never mix languages or use English unless specifically for English language requests.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const questions = content
    .split('\n')
    .filter((line: string) => line.trim())
    .map((line: string, index: number) => ({
      id: index + 1,
      text: line.replace(/^\d+\.\s*/, '').trim(),
      language: language,
      generated: 'real-time',
      timestamp: new Date().toISOString()
    }))
    .filter((q: any) => q.text.length > 10)
    .slice(0, count);

  return questions;
}

async function generateRealTimeAnalysis(
  interviewData: any,
  language: string,
  apiKey: string
): Promise<any> {
  
  const languagePrompts = {
    'hi': 'इस साक्षात्कार का हिंदी में विस्तृत विश्लेषण करें। उम्मीदवार के प्रदर्शन, मजबूत बिंदुओं और सुधार के क्षेत्रों का मूल्यांकन करें।',
    'ta': 'இந்த நேர்காணலின் தமிழில் விரிவான பகுப்பாய்வு செய்யுங்கள். வேட்பாளரின் செயல்திறன், வலிமையான புள்ளிகள் மற்றும் மேம்பாட்டுப் பகுதிகளை மதிப்பிடுங்கள்।',
    'te': 'ఈ ఇంటర్వ్యూ యొక్క తెలుగులో వివరణాత్మక విశ్లేషణ చేయండి। అభ్యర్థి పనితీరు, బలమైన అంశాలు మరియు మెరుగుదల రంగాలను అంచనా వేయండి।',
    'kn': 'ಈ ಸಂದರ್ಶನದ ಕನ್ನಡದಲ್ಲಿ ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ ಮಾಡಿ। ಅಭ್ಯರ್ಥಿಯ ಕಾರ್ಯಕ್ಷಮತೆ, ಬಲವಾದ ಅಂಶಗಳು ಮತ್ತು ಸುಧಾರಣೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ।',
    'ml': 'ഈ അഭിമുഖത്തിന്റെ മലയാളത്തിൽ വിശദമായ വിശകലനം നടത്തുക. ഉദ്ദേശിച്ച വ്യക്തിയുടെ പ്രകടനം, ശക്തമായ പോയിന്റുകൾ, മെച്ചപ്പെടുത്താവുന്ന മേഖലകൾ എന്നിവ വിലയിരുത്തുക।',
    'default': `Provide detailed interview analysis in ${language}. Evaluate candidate performance, strengths, and improvement areas.`
  };

  const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.default;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ai-interview-coach.vercel.app',
      'X-Title': 'AI Interview Coach - Real-time Analysis'
    },
    body: JSON.stringify({
      model: 'microsoft/wizardlm-2-8x22b',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview analyst. Provide analysis ONLY in ${language} language. Never mix languages.`
        },
        {
          role: 'user',
          content: `${prompt}\n\nInterview Data: ${JSON.stringify(interviewData)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    analysis: data.choices[0].message.content,
    language: language,
    generated: 'real-time',
    timestamp: new Date().toISOString()
  };
}

async function generateRealTimeFeedback(
  interviewData: any,
  language: string,
  apiKey: string
): Promise<any> {
  
  const languagePrompts = {
    'hi': 'इस साक्षात्कार के लिए हिंदी में रचनात्मक फीडबैक प्रदान करें। व्यावहारिक सुझाव और सुधार की रणनीति दें।',
    'ta': 'இந்த நேர்காணலுக்கு தமிழில் ஆக்கபூர்வமான கருத்து வழங்குங்கள். நடைமுறை பரிந்துரைகள் மற்றும் மேம்பாட்டு உத்திகளை கொடுங்கள்।',
    'te': 'ఈ ఇంటర్వ్యూకు తెలుగులో నిర్మాణాత్మక అభిప్రాయం అందించండి. ఆచరణాత్మక సూచనలు మరియు మెరుగుదల వ్యూహాలను ఇవ్వండి।',
    'kn': 'ಈ ಸಂದರ್ಶನಕ್ಕೆ ಕನ್ನಡದಲ್ಲಿ ರಚನಾತ್ಮಕ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ. ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಗಳು ಮತ್ತು ಸುಧಾರಣೆಯ ತಂತ್ರಗಳನ್ನು ನೀಡಿ।',
    'ml': 'ഈ അഭിമുഖത്തിനായി മലയാളത്തിൽ ക്രിയാത്മക ഫീഡ്ബാക്ക് നൽകുക. പ്രായോഗിക നിർദ്ദേശങ്ങളും മെച്ചപ്പെടുത്തൽ തന്ത്രങ്ങളും നൽകുക।',
    'default': `Provide constructive feedback in ${language}. Give practical suggestions and improvement strategies.`
  };

  const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.default;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'microsoft/wizardlm-2-8x22b',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Provide feedback ONLY in ${language} language.`
        },
        {
          role: 'user',
          content: `${prompt}\n\nInterview Data: ${JSON.stringify(interviewData)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    feedback: data.choices[0].message.content,
    language: language,
    generated: 'real-time',
    timestamp: new Date().toISOString()
  };
}

async function generateRealTimeFollowup(
  interviewData: any,
  language: string,
  apiKey: string
): Promise<any> {
  
  const languagePrompts = {
    'hi': 'इस साक्षात्कार के आधार पर हिंदी में अनुवर्ती प्रश्न तैयार करें। उम्मीदवार के उत्तरों को गहरा करने वाले प्रश्न बनाएं।',
    'ta': 'இந்த நேர்காணலின் அடிப்படையில் தமிழில் பின்தொடர்வுக் கேள்விகளை உருவாக்குங்கள். வேட்பாளரின் பதில்களை ஆழமாக்கும் கேள்விகளை உருவாக்குங்கள்।',
    'te': 'ఈ ఇంటర్వ్యూ ఆధారంగా తెలుగులో ఫాలో-అప్ ప్రశ్నలు రూపొందించండి. అభ్యర్థి సమాధానాలను లోతుగా చేసే ప్రశ్నలు సృష ్టించండి।',
    'kn': 'ಈ ಸಂದರ್ಶನದ ಆಧಾರದ ಮೇಲೆ ಕನ್ನಡದಲ್ಲಿ ಅನುಸರಣಾ ಪ್ರಶ್ನೆಗಳನ್ನು ರಚಿಸಿ. ಅಭ್ಯರ್ಥಿಯ ಉತ್ತರಗಳನ್ನು ಆಳವಾಗಿಸುವ ಪ್ರಶ್ನೆಗಳನ್ನು ರಚಿಸಿ।',
    'ml': 'ഈ അഭിമുഖത്തിന്റെ അടിസ്ഥാനത്തിൽ മലയാളത്തിൽ ഫോളോ-അപ്പ് ചോദ്യങ്ങൾ രൂപപ്പെടുത്തുക. ഉദ്ദേശിച്ച വ്യക്തിയുടെ ഉത്തരങ്ങൾ ആഴത്തിലാക്കുന്ന ചോദ്യങ്ങൾ സൃഷ്ടിക്കുക।',
    'default': `Generate follow-up questions in ${language} based on this interview. Create questions that deepen candidate responses.`
  };

  const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.default;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'microsoft/wizardlm-2-8x22b',
      messages: [
        {
          role: 'system',
          content: `You are an expert interviewer. Generate follow-up questions ONLY in ${language} language.`
        },
        {
          role: 'user',
          content: `${prompt}\n\nInterview Data: ${JSON.stringify(interviewData)}`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const questions = content
    .split('\n')
    .filter((line: string) => line.trim())
    .map((line: string, index: number) => ({
      id: index + 1,
      text: line.replace(/^\d+\.\s*/, '').trim(),
      type: 'followup',
      language: language,
      generated: 'real-time',
      timestamp: new Date().toISOString()
    }))
    .filter((q: any) => q.text.length > 10);

  return {
    followupQuestions: questions,
    language: language,
    generated: 'real-time',
    timestamp: new Date().toISOString()
  };
}
