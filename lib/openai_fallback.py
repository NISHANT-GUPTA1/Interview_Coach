#!/usr/bin/env python3
"""
Fallback AI Question Generation using OpenAI API
When OpenRouter fails, use OpenAI as backup
"""

import sys
import json
import os
import openai

def generate_questions_openai(data):
    """Generate questions using OpenAI API as fallback"""
    try:
        role = data.get('role', 'Software Engineer')
        experience = data.get('experience', '2-3 years')
        count = int(data.get('count', 5))
        language = data.get('language', 'en')
        
        # Get OpenAI API key
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key:
            raise Exception("OpenAI API key not found")
        
        openai.api_key = openai_api_key
        
        # Create prompt for OpenAI
        prompt = f"""Generate {count} diverse interview questions for a {role} position with {experience} experience level.

Requirements:
- Mix of technical, behavioral, and situational questions
- Appropriate difficulty for {experience} level
- Real-world scenarios relevant to {role}
- Clear and professional language
- Return as JSON array with format: [{{"id": 1, "text": "question text", "category": "Technical/Behavioral/Situational"}}]

Focus areas for {role}:
- Technical skills and problem-solving
- Experience and past projects
- Team collaboration
- Learning and growth mindset
- Future goals and motivation

Generate exactly {count} questions and return only the JSON array, no other text."""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert interview coach. Generate professional, relevant interview questions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse the JSON response
        try:
            questions = json.loads(content)
            if isinstance(questions, list) and len(questions) > 0:
                return {"success": True, "questions": questions}
            else:
                raise Exception("Invalid response format")
        except json.JSONDecodeError:
            # If not valid JSON, create fallback
            raise Exception("Failed to parse OpenAI response")
            
    except Exception as e:
        print(f"OpenAI API error: {e}", file=sys.stderr)
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        result = generate_questions_openai(data)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
