"""
OpenRouter AI Question Generation Service
Uses Gemma 3n 4B model via OpenRouter API for AI I                fallback_question = f"How would you approach solving a complex {role.lower()} challenge in a production environment?"
                questions.append({
                    "id": f"fallback_tech_{i}_{random.randint(1000, 9999)}",
                    "text": fallback_question,  # Use "text" field
                    "category": "Technical",
                    "type": "technical",
                    "difficulty": difficulty,
                    "role": role,
                    "source": "fallback",
                    "confidence": 0.8
                })oach
"""

import json
import sys
import os
import random
import requests
from typing import List, Dict, Any

class OpenRouterQuestionGenerator:
    def __init__(self):
        """Initialize the OpenRouter AI Question Generator"""
        print("Initializing OpenRouter AI Question Generator...", file=sys.stderr)
        
        # Get API key from environment variable
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        if not self.api_key:
            print("❌ OpenRouter API key not found in environment!", file=sys.stderr)
            print("Please check your .env.local file", file=sys.stderr)
            raise RuntimeError("OpenRouter API key not configured")
            
        self.base_url = os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
        self.model = os.getenv('OPENROUTER_MODEL', 'qwen/qwen-2-7b-instruct:free')
        
        print(f"Using model: {self.model}", file=sys.stderr)
        print("OpenRouter AI Question Generator initialized successfully!", file=sys.stderr)

    def _make_api_request(self, messages: List[Dict[str, str]], max_tokens: int = 200) -> str:
        """Make a request to OpenRouter API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",  # Required by OpenRouter
            "X-Title": "AI Interview Coach"  # Optional but recommended
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.8
        }
        
        try:
            # Use the correct OpenRouter endpoint
            url = "https://openrouter.ai/api/v1/chat/completions"
            print(f"Making request to: {url}", file=sys.stderr)
            print(f"Using model: {self.model}", file=sys.stderr)
            print("API Key: [REDACTED]", file=sys.stderr)
            
            response = requests.post(url, 
                                   headers=headers, 
                                   json=data, 
                                   timeout=30)
            
            print(f"Response status: {response.status_code}", file=sys.stderr)
            if not response.ok:
                print(f"Response headers: {dict(response.headers)}", file=sys.stderr)
                print(f"Response text: {response.text}", file=sys.stderr)
            
            response.raise_for_status()
            
            result = response.json()
            if 'choices' in result and len(result['choices']) > 0:
                return result['choices'][0]['message']['content']
            else:
                print(f"Unexpected response format: {result}", file=sys.stderr)
                raise RuntimeError("Invalid response format from API")
                
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}", file=sys.stderr)
            if hasattr(e, 'response') and e.response is not None:
                print(f"Error response: {e.response.text}", file=sys.stderr)
            raise RuntimeError(f"API request failed: {e}")
        except Exception as e:
            print(f"General error: {e}", file=sys.stderr)
            raise RuntimeError(f"Failed to generate content: {e}")

    def generate_technical_questions(self, context: str, role: str, difficulty: str, count: int = 3) -> List[Dict[str, Any]]:
        """Generate technical interview questions using OpenRouter API"""
        
        questions = []
        
        for i in range(count):
            try:
                prompt = f"""Generate a technical interview question for a {role} position with {difficulty} experience level.

Context: {context}

Requirements:
- Create a practical, scenario-based question
- Make it relevant to {role} role
- Appropriate for {difficulty} experience level
- Focus on real-world application
- Return only the question text, no additional formatting"""

                messages = [{"role": "user", "content": prompt}]
                question_text = self._make_api_request(messages, max_tokens=150)
                
                # Clean the response
                question_text = question_text.strip()
                if not question_text.endswith('?'):
                    question_text += '?'
                
                questions.append({
                    "id": f"openrouter_tech_{i}_{random.randint(1000, 9999)}",
                    "text": question_text,  # Use "text" field instead of "question"
                    "category": "Technical",
                    "type": "technical",
                    "difficulty": difficulty,
                    "role": role,
                    "source": "openrouter_ai",
                    "model_used": self.model,
                    "confidence": 0.95
                })
                
            except Exception as e:
                print(f"Error generating technical question {i}: {e}", file=sys.stderr)
                # Fallback question
                fallback_question = f"How would you approach solving a complex {role.lower()} challenge in a production environment?"
                questions.append({
                    "id": f"fallback_tech_{i}_{random.randint(1000, 9999)}",
                    "question": fallback_question,
                    "type": "technical",
                    "difficulty": difficulty,
                    "role": role,
                    "source": "fallback",
                    "confidence": 0.7
                })
        
        return questions

    def generate_mcq_questions(self, context: str, count: int = 3, language: str = 'en') -> List[Dict[str, Any]]:
        """Generate Multiple Choice Questions using OpenRouter API with language support"""
        
        # Language-specific prompt templates
        prompts = {
            'en': {
                'instruction': "Create a multiple choice question for a software engineering interview.",
                'requirements': [
                    "Generate a technical question with 4 options",
                    "Make it relevant to software development", 
                    "Include clear, distinct options",
                    "Make sure one option is clearly correct"
                ],
                'format': "Format your response as:\nQuestion: [Your question here]\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\nCorrect: [Letter of correct answer]"
            },
            'hi': {
                'instruction': "सॉफ्टवेयर इंजीनियरिंग साक्षात्कार के लिए एक बहुविकल्पीय प्रश्न बनाएं।",
                'requirements': [
                    "4 विकल्पों के साथ एक तकनीकी प्रश्न बनाएं",
                    "इसे सॉफ्टवेयर विकास के लिए प्रासंगिक बनाएं",
                    "स्पष्ट, अलग विकल्प शामिल करें", 
                    "सुनिश्चित करें कि एक विकल्प स्पष्ट रूप से सही है"
                ],
                'format': "अपने उत्तर को इस प्रारूप में दें:\nप्रश्न: [आपका प्रश्न यहाँ]\nक) [विकल्प 1]\nख) [विकल्प 2]\nग) [विकल्प 3]\nघ) [विकल्प 4]\nसही: [सही उत्तर का अक्षर]"
            },
            'es': {
                'instruction': "Crea una pregunta de opción múltiple para una entrevista de ingeniería de software.",
                'requirements': [
                    "Genera una pregunta técnica con 4 opciones",
                    "Hazla relevante para el desarrollo de software",
                    "Incluye opciones claras y distintas",
                    "Asegúrate de que una opción sea claramente correcta"
                ],
                'format': "Formatea tu respuesta como:\nPregunta: [Tu pregunta aquí]\nA) [Opción 1]\nB) [Opción 2]\nC) [Opción 3]\nD) [Opción 4]\nCorrecta: [Letra de la respuesta correcta]"
            }
        }
        
        # Use English as fallback if language not supported
        prompt_template = prompts.get(language, prompts['en'])
        
        mcq_questions = []
        
        for i in range(count):
            try:
                # Build language-specific prompt
                requirements_text = '\n- '.join([''] + prompt_template['requirements'])
                
                prompt = f"""{prompt_template['instruction']}

Context: {context}

Requirements:{requirements_text}

{prompt_template['format']}"""

                messages = [{"role": "user", "content": prompt}]
                response = self._make_api_request(messages, max_tokens=200)
                
                # Parse the response to extract question and options (language-aware)
                lines = response.strip().split('\n')
                question_text = ""
                options = []
                correct_answer = ""
                
                # Language-specific parsing patterns
                question_prefixes = {
                    'en': 'Question:',
                    'hi': 'प्रश्न:',
                    'es': 'Pregunta:'
                }
                
                option_patterns = {
                    'en': ('A)', 'B)', 'C)', 'D)'),
                    'hi': ('क)', 'ख)', 'ग)', 'घ)'),
                    'es': ('A)', 'B)', 'C)', 'D)')
                }
                
                correct_prefixes = {
                    'en': 'Correct:',
                    'hi': 'सही:',
                    'es': 'Correcta:'
                }
                
                question_prefix = question_prefixes.get(language, 'Question:')
                patterns = option_patterns.get(language, ('A)', 'B)', 'C)', 'D)'))
                correct_prefix = correct_prefixes.get(language, 'Correct:')
                
                for line in lines:
                    line = line.strip()
                    if line.startswith(question_prefix):
                        question_text = line.replace(question_prefix, '').strip()
                    elif line.startswith(patterns):
                        option_text = line[3:].strip()  # Remove option prefix like "A) "
                        options.append(option_text)
                    elif line.startswith(correct_prefix):
                        correct_letter = line.replace(correct_prefix, '').strip()
                        
                        # Handle different language patterns for correct answers
                        if language == 'hi':
                            # Map Hindi letters to English for indexing
                            hindi_to_index = {'क': 0, 'ख': 1, 'ग': 2, 'घ': 3}
                            if correct_letter in hindi_to_index and len(options) > hindi_to_index[correct_letter]:
                                correct_answer = options[hindi_to_index[correct_letter]]
                        else:
                            # English and Spanish use A, B, C, D
                            if correct_letter in ['A', 'B', 'C', 'D'] and len(options) > ord(correct_letter) - ord('A'):
                                correct_answer = options[ord(correct_letter) - ord('A')]
                
                # Language-specific fallbacks if parsing fails
                if not question_text:
                    fallback_questions = {
                        'en': "What is a key principle of software engineering?",
                        'hi': "सॉफ्टवेयर इंजीनियरिंग का मुख्य सिद्धांत क्या है?",
                        'es': "¿Cuál es un principio clave de la ingeniería de software?"
                    }
                    question_text = fallback_questions.get(language, fallback_questions['en'])
                    
                if len(options) < 4:
                    fallback_options = {
                        'en': [
                            "Code reusability and modularity",
                            "Writing code as fast as possible", 
                            "Using only the latest technologies",
                            "Avoiding documentation"
                        ],
                        'hi': [
                            "कोड पुन: उपयोग और मॉड्यूलरिटी",
                            "जितनी जल्दी हो सके कोड लिखना",
                            "केवल नवीनतम तकनीकों का उपयोग करना",
                            "दस्तावेजीकरण से बचना"
                        ],
                        'es': [
                            "Reutilización de código y modularidad",
                            "Escribir código lo más rápido posible",
                            "Usar solo las tecnologías más recientes", 
                            "Evitar la documentación"
                        ]
                    }
                    options = fallback_options.get(language, fallback_options['en'])
                    
                if not correct_answer:
                    correct_answer = options[0]
                
                mcq_questions.append({
                    "id": f"openrouter_mcq_{i}_{random.randint(1000, 9999)}",
                    "text": question_text,  # Use "text" field
                    "category": "Multiple Choice",
                    "options": options,
                    "correct_answer": correct_answer,
                    "type": "mcq",
                    "source": "openrouter_ai",
                    "model_used": self.model
                })
                
            except Exception as e:
                print(f"Error generating MCQ {i}: {e}", file=sys.stderr)
                # Fallback MCQ
                mcq_questions.append({
                    "id": f"fallback_mcq_{i}_{random.randint(1000, 9999)}",
                    "text": "What is a key principle of good software design?",  # Use "text" field
                    "category": "Multiple Choice",
                    "options": ["Single Responsibility Principle", "Multiple Inheritance", "Global Variables", "Tight Coupling"],
                    "correct_answer": "Single Responsibility Principle",
                    "type": "mcq",
                    "source": "fallback"
                })
        
        return mcq_questions

    def generate_boolean_questions(self, context: str, count: int = 3) -> List[Dict[str, Any]]:
        """Generate True/False questions using OpenRouter API"""
        
        boolean_questions = []
        
        for i in range(count):
            try:
                prompt = f"""Create a true/false question for a software engineering interview.

Context: {context}

Requirements:
- Generate a statement about software development
- Make it clear whether it's true or false
- Focus on best practices, concepts, or technologies
- Provide the correct answer

Format:
Statement: [Your statement here]
Answer: True/False"""

                messages = [{"role": "user", "content": prompt}]
                response = self._make_api_request(messages, max_tokens=150)
                
                # Parse response
                lines = response.strip().split('\n')
                statement = ""
                answer = ""
                
                for line in lines:
                    line = line.strip()
                    if line.startswith('Statement:'):
                        statement = line.replace('Statement:', '').strip()
                    elif line.startswith('Answer:'):
                        answer = line.replace('Answer:', '').strip()
                    elif not statement and line and not line.startswith(('True', 'False')):
                        statement = line
                
                # Ensure proper question format
                if not statement.startswith('True or False:'):
                    statement = f"True or False: {statement}"
                
                if not statement.endswith('?'):
                    statement += '?'
                
                if answer.lower() not in ['true', 'false']:
                    answer = random.choice(['True', 'False'])
                
                boolean_questions.append({
                    "id": f"openrouter_bool_{i}_{random.randint(1000, 9999)}",
                    "text": statement,  # Use "text" field
                    "category": "True/False",
                    "answer": answer.title(),
                    "type": "boolean",
                    "source": "openrouter_ai",
                    "model_used": self.model
                })
                
            except Exception as e:
                print(f"Error generating boolean question {i}: {e}", file=sys.stderr)
                # Fallback boolean question
                boolean_questions.append({
                    "id": f"fallback_bool_{i}_{random.randint(1000, 9999)}",
                    "text": "True or False: Code reviews are essential for maintaining code quality in team projects?",  # Use "text" field
                    "category": "True/False",
                    "answer": "True",
                    "type": "boolean",
                    "source": "fallback"
                })
        
        return boolean_questions
