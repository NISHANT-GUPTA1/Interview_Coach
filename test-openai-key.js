// Quick test to validate OpenAI API key

async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No OPENAI_API_KEY found in environment');
    return;
  }
  
  if (apiKey.includes('dummy')) {
    console.log('❌ OPENAI_API_KEY appears to be a dummy value');
    return;
  }
  
  console.log(`🔑 Testing OpenAI API key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    // Test with a simple models list call first
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text();
      console.log(`❌ Models API failed: ${modelsResponse.status} - ${errorText}`);
      return;
    }
    
    const models = await modelsResponse.json();
    console.log('✅ OpenAI API key is valid');
    
    // Check available models
    const availableModels = models.data.map(m => m.id).filter(id => id.includes('gpt'));
    console.log('📋 Available GPT models:', availableModels.slice(0, 5));
    
    // Test a simple completion
    const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "API test successful" if you can read this.'
          }
        ],
        max_tokens: 50,
      }),
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.log(`❌ Chat completion failed: ${testResponse.status} - ${errorText}`);
      return;
    }
    
    const testData = await testResponse.json();
    console.log('✅ Chat completion test successful:', testData.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOpenAIKey();
