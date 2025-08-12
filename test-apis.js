#!/usr/bin/env node

/**
 * 🔧 Test Local API Endpoints
 * 
 * This script tests your API endpoints locally to ensure they work before deployment.
 */

console.log('🧪 Testing Local API Endpoints...\n');

const testAPI = async (endpoint, data) => {
  try {
    console.log(`Testing ${endpoint}...`);
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint}: Working`);
      console.log(`   Response: ${JSON.stringify(result).substring(0, 100)}...\n`);
    } else {
      console.log(`❌ ${endpoint}: Error ${response.status}`);
      console.log(`   Error: ${JSON.stringify(result)}\n`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint}: ${error.message}\n`);
  }
};

const testEndpoints = async () => {
  console.log('🚀 Make sure to run "npm run dev" first!\n');
  
  // Test AI Questions API
  await testAPI('/api/ai-questions', {
    role: 'Software Engineer',
    experience: '2-3 years',
    count: 3,
    language: 'en'
  });

  // Test Generate Questions API
  await testAPI('/api/generate-questions', {
    role: 'Software Engineer',
    goal: 'technical interview',
    questionCount: 3,
    language: 'en'
  });

  // Test Analysis API
  await testAPI('/api/analyze-interview', {
    answers: [
      {
        questionId: '1',
        questionText: 'Tell me about yourself',
        answerText: 'I am a software engineer with 3 years of experience.',
        category: 'behavioral',
        recordingDuration: 30
      }
    ],
    role: 'Software Engineer',
    experience: 'intermediate',
    language: 'en',
    interviewDuration: 300
  });

  console.log('🎯 If all tests pass, your APIs are ready for deployment!');
  console.log('💡 Next steps:');
  console.log('   1. Commit and push your changes to GitHub');
  console.log('   2. Netlify will auto-deploy');
  console.log('   3. Test on your live site');
};

testEndpoints();
