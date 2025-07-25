#!/usr/bin/env python3
"""
OpenRouter AI Question Generation API Script
Uses Gemma 3n 4B model for truly AI-generated interview questions
"""

import sys
import json
import traceback
from pathlib import Path

# Add the lib directory to the Python path
lib_path = Path(__file__).parent
sys.path.insert(0, str(lib_path))

try:
    from openrouter_questgen import OpenRouterQuestionGenerator
except ImportError as e:
    print(json.dumps({"error": f"Failed to import openrouter_questgen: {str(e)}"}))
    sys.exit(1)

def generate_mixed_questions(data):
    """Generate questions using OpenRouter AI only"""
    try:
        role = data.get('role', 'Software Engineer')
        experience = data.get('experience', '2-3 years')
        count = int(data.get('count', 5))
        
        print("Initializing OpenRouter AI Question Generator...", file=sys.stderr)
        generator = OpenRouterQuestionGenerator()
        
        # Generate different types of questions
        technical_count = max(1, count // 2)
        mcq_count = max(1, (count - technical_count) // 2)
        boolean_count = count - technical_count - mcq_count
        
        questions = []
        
        # Create context from role and experience
        context = f"Interview for {role} position with {experience} experience level. Technologies and skills relevant to {role} development."
        
        if technical_count > 0:
            print(f"Generating {technical_count} technical questions...", file=sys.stderr)
            tech_questions = generator.generate_technical_questions(context, role, experience, technical_count)
            questions.extend(tech_questions)
        
        if mcq_count > 0:
            print(f"Generating {mcq_count} MCQ questions...", file=sys.stderr)
            mcq_questions = generator.generate_mcq_questions(context, mcq_count)
            questions.extend(mcq_questions)
        
        if boolean_count > 0:
            print(f"Generating {boolean_count} boolean questions...", file=sys.stderr)
            bool_questions = generator.generate_boolean_questions(context, boolean_count)
            questions.extend(bool_questions)
        
        print(f"Successfully generated {len(questions)} total questions", file=sys.stderr)
        
        return {
            "questions": questions,
            "metadata": {
                "role": role,
                "experience": experience,
                "total_count": len(questions),
                "generated_by": "OpenRouter AI",
                "model": "google/gemma-3n-e4b-it:free"
            }
        }
    
    except Exception as e:
        print(f"Error in generate_mixed_questions: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        return {"error": str(e)}

# Read from command line args or stdin
if len(sys.argv) > 1:
    print("Using command line arguments", file=sys.stderr)
    input_data = ' '.join(sys.argv[1:])
    try:
        data = json.loads(input_data)
        result = generate_mixed_questions(data)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
else:
    print("Reading from stdin...", file=sys.stderr)
    try:
        input_data = sys.stdin.read().strip()
        print(f"Received input: '{input_data}'", file=sys.stderr)
        
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
        else:
            data = json.loads(input_data)
            print(f"Parsed data: {data}", file=sys.stderr)
            result = generate_mixed_questions(data)
            print(json.dumps(result))
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        print(traceback.format_exc(), file=sys.stderr)
