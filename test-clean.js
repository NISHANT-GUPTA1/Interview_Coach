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
    const analysis = result.analysis;
    
    console.log('✅ API Response received successfully!\n');
    
    console.log('📊 Overall Analysis:');
    console.log(`- Score: ${analysis.overallScore}%`);
    console.log(`- Source: ${result.source}\n`);
    
    console.log('💪 Dynamic Strengths:');
    analysis.strengths.forEach((strength, index) => {
      console.log(`${index + 1}. ${strength}`);
    });
    
    console.log('\n🎯 Dynamic Improvements:');
    analysis.improvements.forEach((improvement, index) => {
      console.log(`${index + 1}. ${improvement}`);
    });
    
    console.log('\n📋 Dynamic Recommendations:');
    analysis.recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
    
    console.log('\n📈 Question-wise Analysis:');
    analysis.questionAnalysis.forEach((qa, index) => {
      console.log(`\n${index + 1}. ${qa.questionText}`);
      console.log(`   Score: ${qa.score}%`);
      console.log(`   Strengths: ${qa.strengths.join(', ') || 'None'}`);
      console.log(`   Suggestions: ${qa.suggestions.join(', ') || 'None'}`);
    });
    
    console.log('\n📈 Statistics:');
    console.log(`- Total Questions: ${analysis.statistics.totalQuestions}`);
    console.log(`- Average Response Length: ${analysis.statistics.averageResponseLength} characters`);
    console.log(`- Confidence Level: ${analysis.statistics.confidenceLevel}\n`);
    
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

testDynamicAPI();
