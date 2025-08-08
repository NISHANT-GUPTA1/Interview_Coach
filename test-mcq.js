const testMCQGeneration = {
  role: 'Software Engineer',
  experience: '2-3 years',
  count: 5,
  language: 'en'
};

async function testMCQQuestionGeneration() {
  try {
    console.log('Testing MCQ question generation...\n');
    
    const response = await fetch('http://localhost:3001/api/ai-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMCQGeneration)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Question generation successful!\n');
    
    if (result.questions) {
      console.log(`📊 Generated ${result.questions.length} questions total\n`);
      
      let mcqCount = 0;
      let technicalCount = 0;
      let booleanCount = 0;
      
      result.questions.forEach((question, index) => {
        console.log(`${index + 1}. Type: ${question.type || 'technical'}`);
        console.log(`   Category: ${question.category}`);
        console.log(`   Question: ${question.text || question.question}`);
        
        if (question.options) {
          mcqCount++;
          console.log('   ✅ MCQ Options found:');
          question.options.forEach((option, optIndex) => {
            console.log(`     ${String.fromCharCode(65 + optIndex)}. ${option}`);
          });
          if (question.correct_answer) {
            console.log(`   ✅ Correct Answer: ${question.correct_answer}`);
          }
        } else if (question.answer) {
          booleanCount++;
          console.log(`   ✅ Boolean Answer: ${question.answer}`);
        } else {
          technicalCount++;
          console.log('   📝 Technical question (no options)');
        }
        console.log('');
      });
      
      console.log(`📈 Question Types Summary:`);
      console.log(`- MCQ Questions: ${mcqCount}`);
      console.log(`- Technical Questions: ${technicalCount}`);
      console.log(`- Boolean Questions: ${booleanCount}\n`);
      
      if (mcqCount === 0) {
        console.log('❌ No MCQ questions generated - MCQ feature may not be working');
      } else {
        console.log('✅ MCQ questions generated successfully!');
      }
      
    } else {
      console.log('❌ No questions found in response');
      console.log('Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMCQQuestionGeneration();
