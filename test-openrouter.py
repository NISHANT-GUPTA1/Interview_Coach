#!/usr/bin/env python3
"""
Test script for OpenRouter API
"""
import os
import sys
import requests
import json

def test_openrouter_api():
    """Test the OpenRouter API with current configuration"""
    # Get from environment or hardcode for testing
    api_key = "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"
    model = "huggingfaceh4/zephyr-7b-beta:free"
    
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
    
    # Your new working API key
    api_key = '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'
    base_url = 'https://openrouter.ai/api/v1'
    model = 'google/gemma-3n-e4b-it:free'  # Try the original 4b model name
    
    print(f"Testing OpenRouter API...")
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    print(f"API Key: {api_key[:20]}..." + "*" * (len(api_key) - 20) if len(api_key) > 20 else api_key)
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "AI-Interview-Coach/1.0"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Say hello world"}
        ],
        "max_tokens": 10,
        "temperature": 0.8
    }
    
    try:
        response = requests.post(f"{base_url}/chat/completions", 
                               headers=headers, 
                               json=data, 
                               timeout=30)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ OpenRouter API test successful!")
            print(f"Response: {result}")
            return True
        else:
            print(f"❌ OpenRouter API test failed: {response.status_code}")
            print(f"Response body: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ OpenRouter API test error: {e}")
        return False

if __name__ == "__main__":
    success = test_openrouter_api()
    sys.exit(0 if success else 1)
