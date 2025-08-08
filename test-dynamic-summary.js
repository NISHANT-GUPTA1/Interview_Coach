// Test script to verify dynamic summary API functionality
const testData = {
  answers: [
    {
      questionId: "q1",
      questionText: "Tell me about yourself",
      answerText: "I am a software engineer with 3 years of experience in full-stack development. I have worked on multiple React projects and have expertise in TypeScript, Node.js, and MongoDB. I led a team of 4 developers and increased system performance by 40%.",
      category: "general",
      recordingDuration: 120
    },
    {
      questionId: "q2",
      questionText: "What is your experience with React?",
      answerText: "React good",
      category: "technical",
      recordingDuration: 15
    },
    {
      questionId: "q3",
      questionText: "How do you handle debugging?",
      answerText: "I use console.log and browser developer tools to identify issues. I also use debugging tools like Chrome DevTools and VS Code debugger. Recently I solved a complex performance issue that reduced load time by 50%.",
      category: "technical",
      recordingDuration: 90
    }
  ],
  role: "Software Engineer",
  experience: "3 years",
  language: "en",
  interviewDuration: 225
};

async function testDynamicAPI() {
  try {
    console.log('Testing dynamic interview analysis API...\n');
    
    const response = await fetch('http://localhost:3001/api/enhanced-interview-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ API Response received successfully!\n');
    console.log('� Raw Response Structure:', JSON.stringify(result, null, 2));
    
    console.log('�📊 Overall Analysis:');
    console.log(`- Score: ${result.overallAnalysis?.score || 'N/A'}%`);
    console.log(`- Grade: ${result.overallAnalysis?.grade || 'N/A'}`);
    console.log(`- Confidence: ${result.overallAnalysis?.confidence || 'N/A'}%\n`);
    
    console.log('💪 Dynamic Strengths:');
    result.strengths.forEach((strength, index) => {
      console.log(`${index + 1}. ${strength}`);
    });
    
    console.log('\n🎯 Dynamic Improvements:');
    result.improvements.forEach((improvement, index) => {
      console.log(`${index + 1}. ${improvement}`);
    });
    
    console.log('\n📋 Dynamic Recommendations:');
    result.recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
    
    console.log('\n📈 Statistics:');
    console.log(`- Total Questions: ${result.statistics.totalQuestions}`);
    console.log(`- Average Response Length: ${result.statistics.averageResponseLength} characters`);
    console.log(`- Response Rate: ${result.statistics.responseRate}%\n`);
    
    // Verify no static content
    const responseText = JSON.stringify(result);
    const staticPhrases = ['STAR method', 'STAR framework', 'Good understanding of', 'Clear communication style'];
    
    console.log('🔍 Checking for static content...');
    let foundStatic = false;
    staticPhrases.forEach(phrase => {
      if (responseText.includes(phrase)) {
        console.log(`❌ Found static phrase: "${phrase}"`);
        foundStatic = true;
      }
    });
    
    if (!foundStatic) {
      console.log('✅ No static content found - all feedback is dynamic!');
    }
    
    // Verify breakdown was removed
    if (result.breakdown) {
      console.log('❌ Breakdown section still exists');
    } else {
      console.log('✅ Breakdown section successfully removed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDynamicAPI();
