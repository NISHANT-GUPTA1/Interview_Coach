#!/usr/bin/env python3
"""
Simple OpenRouter API Key Generator/Tester
This script will help you test different OpenRouter configurations
"""

import requests
import json

def test_openrouter_models():
    """List available models from OpenRouter"""
    try:
        response = requests.get("https://openrouter.ai/api/v1/models", timeout=10)
        if response.status_code == 200:
            models = response.json()
            print("Available models:")
            for model in models['data']:
                if 'gemma' in model['id'].lower():
                    print(f"  - {model['id']}")
        else:
            print(f"Failed to get models: {response.status_code}")
    except Exception as e:
        print(f"Error getting models: {e}")

if __name__ == "__main__":
    print("OpenRouter API Helper")
    print("===================")
    print()
    print("1. To get a new API key:")
    print("   - Go to https://openrouter.ai/")
    print("   - Sign up or log in")
    print("   - Go to https://openrouter.ai/keys")
    print("   - Create a new API key")
    print()
    print("2. Available Gemma models:")
    test_openrouter_models()
    print()
    print("3. Your current API key format should be: sk-or-v1-xxxxx")
    print("   If your key doesn't start with 'sk-or-v1-', it might be invalid")
