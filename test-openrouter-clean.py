#!/usr/bin/env python3
"""
Clean test script for OpenRouter API
"""
import requests
import sys

def test_openrouter_api():
    """Test the OpenRouter API with current configuration"""
    api_key = "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"
    model = "mistralai/mistral-7b-instruct:free"
    
    print(f"🔑 Using API key: {api_key[:20]}...")
    print(f"🤖 Using model: {model}")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Interview Coach Test"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Generate a simple interview question for a software engineer position."}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    try:
        print("🌐 Making test request to OpenRouter...")
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", 
                               headers=headers, 
                               json=data, 
                               timeout=30)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API test successful!")
            print(f"🎯 Generated question: {result['choices'][0]['message']['content']}")
            return True
        else:
            print(f"❌ API test failed: {response.status_code}")
            print(f"📝 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during API test: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing OpenRouter API Configuration...")
    success = test_openrouter_api()
    print(f"🏁 Test result: {'SUCCESS' if success else 'FAILED'}")
    sys.exit(0 if success else 1)
