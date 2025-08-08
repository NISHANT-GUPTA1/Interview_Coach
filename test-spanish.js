const testDataSpanish = {
  answers: [
    {
      questionId: "q1",
      questionText: "Háblame de ti",
      answerText: "Soy un ingeniero de software con 3 años de experiencia en desarrollo full-stack. He trabajado en múltiples proyectos React y tengo experiencia en TypeScript, Node.js y MongoDB.",
      category: "general",
      recordingDuration: 120
    },
    {
      questionId: "q2", 
      questionText: "¿Cuál es tu experiencia con React?",
      answerText: "React muy bueno",
      category: "technical",
      recordingDuration: 15
    }
  ],
  role: "Software Engineer",
  experience: "3 years",
  language: "es", // Spanish
  interviewDuration: 135
};

async function testSpanishAnalysis() {
  try {
    console.log('Testing Spanish language interview analysis...\n');
    
    const response = await fetch('http://localhost:3001/api/enhanced-interview-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDataSpanish)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.analysis;
    
    console.log('✅ Spanish Analysis received successfully!\n');
    
    console.log('💪 Dynamic Strengths (should be in Spanish):');
    analysis.strengths.forEach((strength, index) => {
      console.log(`${index + 1}. ${strength}`);
    });
    
    console.log('\n🎯 Dynamic Improvements (should be in Spanish):');
    analysis.improvements.forEach((improvement, index) => {
      console.log(`${index + 1}. ${improvement}`);
    });
    
    console.log('\n📋 Dynamic Recommendations (should be in Spanish):');
    analysis.recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
    
    console.log('\n📈 Question Analysis (should be in Spanish):');
    analysis.questionAnalysis.forEach((qa, index) => {
      console.log(`\n${index + 1}. ${qa.questionText}`);
      console.log(`   Strengths: ${qa.strengths.join(', ') || 'None'}`);
      console.log(`   Suggestions: ${qa.suggestions.join(', ') || 'None'}`);
    });
    
    // Check if content is actually in Spanish
    const allText = JSON.stringify(analysis);
    console.log('\n🔍 Language Check:');
    
    // Look for Spanish words/patterns
    const spanishIndicators = [
      'experiencia', 'técnico', 'desarrollo', 'mejora', 'ejemplo', 
      'respuesta', 'conocimiento', 'habilidad', 'proyecto'
    ];
    
    let foundSpanish = false;
    spanishIndicators.forEach(word => {
      if (allText.toLowerCase().includes(word)) {
        console.log(`✅ Found Spanish word: "${word}"`);
        foundSpanish = true;
      }
    });
    
    if (foundSpanish) {
      console.log('✅ Analysis appears to be in Spanish!');
    } else {
      console.log('❌ Analysis does not appear to be in Spanish - language consistency issue found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpanishAnalysis();
