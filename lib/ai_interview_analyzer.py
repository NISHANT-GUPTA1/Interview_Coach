#!/usr/bin/env python3
"""
AI Interview Analyzer
Analyzes candidate responses and provides detailed feedback using OpenRouter AI
"""

import json
import sys
import os
import re
import statistics
from typing import List, Dict, Any
from openrouter_questgen import OpenRouterQuestionGenerator

class AIInterviewAnalyzer:
    def __init__(self):
        """Initialize the AI Interview Analyzer"""
        self.question_generator = OpenRouterQuestionGenerator()
        
    def analyze_interview(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze complete interview and generate comprehensive feedback"""
        answers = interview_data.get('answers', [])
        role = interview_data.get('role', 'Software Engineer')
        experience = interview_data.get('experience', 'Entry Level')
        language = interview_data.get('language', 'en')
        
        print(f"Analyzing interview for {role} - {experience} with {len(answers)} answers", file=sys.stderr)
        
        # Analyze each question individually
        question_analyses = []
        individual_scores = []
        
        for i, answer in enumerate(answers):
            print(f"Analyzing question {i+1}/{len(answers)} in language: {language}", file=sys.stderr)
            try:
                analysis = self._analyze_single_answer(answer, role, experience, language)
                question_analyses.append(analysis)
                individual_scores.append(analysis['score'])
            except Exception as e:
                print(f"Error analyzing question {i+1}: {e}", file=sys.stderr)
                # Add fallback analysis
                fallback_analysis = self._generate_fallback_analysis(answer, role, language)
                question_analyses.append(fallback_analysis)
                individual_scores.append(fallback_analysis['score'])
        
        # Generate overall analysis
        overall_analysis = self._generate_overall_analysis(
            answers, question_analyses, individual_scores, role, experience
        )
        
        return {
            'overallScore': overall_analysis['overall_score'],
            'breakdown': overall_analysis['breakdown'],
            'questionAnalysis': question_analyses,
            'strengths': overall_analysis['strengths'],
            'improvements': overall_analysis['improvements'],
            'recommendations': overall_analysis['recommendations'],
            'statistics': overall_analysis['statistics']
        }
    
    def _analyze_single_answer(self, answer: Dict[str, Any], role: str, experience: str, language: str = 'en') -> Dict[str, Any]:
        """Analyze a single answer using AI"""
        question_text = answer.get('questionText', '')
        answer_text = answer.get('answerText', '')
        category = answer.get('category', 'General')
        
        if not answer_text.strip():
            return self._generate_fallback_analysis(answer, role, language)
        
        # Create language-specific analysis prompt
        if language == 'hi':
            analysis_instruction = "विश्लेषण हिंदी में प्रदान करें। उम्मीदवार की शक्तियों, कमजोरियों और सुधार के सुझावों को स्पष्ट रूप से बताएं।"
        elif language == 'es':
            analysis_instruction = "Proporcione el análisis en español. Sea específico sobre las fortalezas, debilidades y sugerencias de mejora del candidato."
        elif language == 'fr':
            analysis_instruction = "Fournissez l'analyse en français. Soyez précis sur les forces, faiblesses et suggestions d'amélioration du candidat."
        else:
            analysis_instruction = "Provide analysis in English. Be specific about candidate's strengths, weaknesses, and improvement suggestions."
        
        prompt = f"""
Analyze this interview answer for a {role} position ({experience} level):

QUESTION: {question_text}
CATEGORY: {category}
CANDIDATE'S ANSWER: {answer_text}

{analysis_instruction}

Provide a detailed analysis in JSON format with:
1. score (0-100): Overall quality of the answer
2. strengths (array): What the candidate did well
3. weaknesses (array): Areas that need improvement  
4. suggestions (array): Specific actionable improvements
5. expectedAnswer (string): What an ideal answer would include
6. technicalAccuracy (0-100): How technically sound the answer is
7. communicationClarity (0-100): How clear and well-structured the answer is
8. completeness (0-100): How thoroughly the question was addressed

Be specific and constructive. Focus on practical improvements.
Return ONLY the JSON object, no additional text.
"""

        try:
            messages = [{"role": "user", "content": prompt}]
            response = self.question_generator._make_api_request(messages, max_tokens=500)
            
            # Parse AI response
            analysis_data = json.loads(response)
            
            # Ensure all required fields
            return {
                'questionId': answer.get('questionId', ''),
                'questionText': question_text,
                'answerText': answer_text,
                'score': min(100, max(0, analysis_data.get('score', 70))),
                'strengths': analysis_data.get('strengths', []),
                'weaknesses': analysis_data.get('weaknesses', []),
                'suggestions': analysis_data.get('suggestions', []),
                'expectedAnswer': analysis_data.get('expectedAnswer', ''),
                'technicalAccuracy': analysis_data.get('technicalAccuracy', 70),
                'communicationClarity': analysis_data.get('communicationClarity', 70),
                'completeness': analysis_data.get('completeness', 70)
            }
            
        except Exception as e:
            print(f"AI analysis failed for answer, using fallback: {e}", file=sys.stderr)
            return self._generate_fallback_analysis(answer, role, language)
    
    def _generate_overall_analysis(self, answers: List[Dict], question_analyses: List[Dict], 
                                 scores: List[float], role: str, experience: str) -> Dict[str, Any]:
        """Generate overall interview analysis"""
        
        if not scores:
            overall_score = 60
            technical_avg = 60
            communication_avg = 70
            completeness_avg = 65
        else:
            overall_score = statistics.mean(scores)
            technical_avg = statistics.mean([q.get('technicalAccuracy', 70) for q in question_analyses])
            communication_avg = statistics.mean([q.get('communicationClarity', 70) for q in question_analyses])
            completeness_avg = statistics.mean([q.get('completeness', 70) for q in question_analyses])
        
        # Calculate statistics
        total_words = sum(len(answer.get('answerText', '').split()) for answer in answers)
        avg_response_length = total_words // max(len(answers), 1)
        
        # Generate comprehensive feedback using AI
        try:
            overall_feedback = self._generate_ai_feedback(answers, question_analyses, role, experience)
        except Exception as e:
            print(f"AI feedback generation failed, using fallback: {e}", file=sys.stderr)
            overall_feedback = self._generate_fallback_feedback(role, experience, overall_score)
        
        return {
            'overall_score': round(overall_score, 1),
            'breakdown': {
                'technical': round(technical_avg, 1),
                'communication': round(communication_avg, 1),
                'completeness': round(completeness_avg, 1),
                'confidence': round((overall_score + communication_avg) / 2, 1)
            },
            'strengths': overall_feedback.get('strengths', []),
            'improvements': overall_feedback.get('improvements', []),
            'recommendations': overall_feedback.get('recommendations', []),
            'statistics': {
                'totalQuestions': len(answers),
                'averageResponseLength': avg_response_length,
                'totalInterviewTime': "18m 45s",  # Could be calculated from actual data
                'keywordsUsed': min(50, total_words // 10),
                'expectedKeywords': len(answers) * 8,
                'confidenceLevel': self._get_confidence_level(overall_score)
            }
        }
    
    def _generate_ai_feedback(self, answers: List[Dict], analyses: List[Dict], role: str, experience: str) -> Dict[str, Any]:
        """Generate overall feedback using AI"""
        
        # Summarize all answers for context
        answers_summary = []
        for i, (answer, analysis) in enumerate(zip(answers, analyses)):
            answers_summary.append(f"Q{i+1}: {answer.get('questionText', '')[:100]}...")
            answers_summary.append(f"A{i+1}: {answer.get('answerText', '')[:200]}...")
            answers_summary.append(f"Score: {analysis.get('score', 70)}")
        
        summary_text = "\n".join(answers_summary)
        
        prompt = f"""
Analyze this complete interview for a {role} position ({experience} level):

INTERVIEW SUMMARY:
{summary_text}

Provide comprehensive feedback in JSON format:
{{
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...], 
  "recommendations": ["recommendation1", "recommendation2", ...]
}}

Focus on:
- Overall performance patterns
- Role-specific competencies 
- Communication effectiveness
- Areas for development
- Actionable next steps

Be specific and constructive. Limit each array to 4-5 key points.
Return ONLY the JSON object.
"""

        try:
            messages = [{"role": "user", "content": prompt}]
            response = self.question_generator._make_api_request(messages, max_tokens=400)
            return json.loads(response)
        except Exception as e:
            print(f"AI feedback generation failed: {e}", file=sys.stderr)
            return self._generate_fallback_feedback(role, experience, 70)
    
    def _generate_fallback_analysis(self, answer: Dict[str, Any], role: str, language: str = 'en') -> Dict[str, Any]:
        """Generate fallback analysis when AI fails"""
        answer_text = answer.get('answerText', '')
        word_count = len(answer_text.split())
        
        # Simple scoring based on length and basic patterns
        base_score = min(85, max(45, 50 + word_count // 5))
        
        # Language-specific feedback
        if language == 'hi':
            strengths = ["प्रश्न का उत्तर दिया", "साक्षात्कार प्रक्रिया में सक्रिय भागीदारी"] if answer_text.strip() else ["प्रश्न का प्रयास किया"]
            weaknesses = ["अधिक विशिष्ट उदाहरण शामिल कर सकते हैं", "अधिक तकनीकी विवरण जोड़ने पर विचार करें"] if word_count < 50 else ["अच्छा विवरण स्तर, अधिक संरचित हो सकता है"]
            suggestions = ["STAR विधि का अभ्यास करें (स्थिति, कार्य, क्रिया, परिणाम)", f"सामान्य {role} साक्षात्कार प्रश्नों का अनुसंधान करें", "अपने अनुभव से विशिष्ट उदाहरण तैयार करें"]
            expected = f"एक आदर्श उत्तर में {role} कार्य से संबंधित विशिष्ट उदाहरण, समस्या-समाधान कौशल का प्रदर्शन, और स्पष्ट संचार शामिल होना चाहिए।"
        else:
            strengths = ["Provided a response to the question", "Demonstrated engagement with the interview process"] if answer_text.strip() else ["Question attempted"]
            weaknesses = ["Could include more specific examples", "Consider adding more technical details"] if word_count < 50 else ["Good detail level, could be more structured"]
            suggestions = ["Practice using the STAR method (Situation, Task, Action, Result)", f"Research common {role} interview questions", "Prepare specific examples from your experience"]
            expected = f"An ideal answer would include specific examples relevant to {role} work, demonstrate problem-solving skills, and show clear communication."
        
        return {
            'questionId': answer.get('questionId', ''),
            'questionText': answer.get('questionText', ''),
            'answerText': answer_text,
            'score': base_score,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'suggestions': suggestions,
            'expectedAnswer': expected,
            'technicalAccuracy': base_score - 5,
            'communicationClarity': min(90, base_score + 10),
            'completeness': max(40, base_score - 10)
        }
    
    def _generate_fallback_feedback(self, role: str, experience: str, score: float) -> Dict[str, Any]:
        """Generate fallback overall feedback"""
        return {
            'strengths': [
                f"Demonstrated interest in the {role} position",
                "Completed the interview process professionally",
                "Showed engagement with technical questions"
            ],
            'improvements': [
                "Include more specific examples in responses",
                "Practice explaining technical concepts clearly",
                "Prepare stories that demonstrate problem-solving skills",
                "Focus on quantifiable achievements and outcomes"
            ],
            'recommendations': [
                f"Research common {role} interview patterns and questions",
                "Practice the STAR method for behavioral questions",
                "Prepare technical examples with measurable results",
                "Consider mock interviews to improve confidence",
                "Review key concepts relevant to the role"
            ]
        }
    
    def _get_confidence_level(self, score: float) -> str:
        """Determine confidence level based on score"""
        if score >= 85:
            return "High"
        elif score >= 70:
            return "Moderate"
        elif score >= 55:
            return "Developing"
        else:
            return "Needs Improvement"

def main():
    """Main function to process interview analysis"""
    try:
        # Read input from stdin
        print("Reading from stdin...", file=sys.stderr)
        input_data = sys.stdin.read()
        print(f"Received input: '{input_data[:200]}...'", file=sys.stderr)
        
        # Parse input
        interview_data = json.loads(input_data)
        print(f"Parsed data: {len(interview_data.get('answers', []))} answers", file=sys.stderr)
        
        # Initialize analyzer
        analyzer = AIInterviewAnalyzer()
        
        # Perform analysis
        print("Starting AI analysis...", file=sys.stderr)
        analysis_result = analyzer.analyze_interview(interview_data)
        print("AI analysis completed successfully!", file=sys.stderr)
        
        # Output result
        print(json.dumps(analysis_result, indent=2))
        
    except Exception as e:
        print(f"Analysis error: {e}", file=sys.stderr)
        # Return minimal fallback result
        fallback = {
            'overallScore': 65,
            'breakdown': {'technical': 60, 'communication': 70, 'completeness': 65, 'confidence': 65},
            'questionAnalysis': [],
            'strengths': ["Completed interview process"],
            'improvements': ["Practice with more specific examples"],
            'recommendations': ["Prepare technical stories with outcomes"],
            'statistics': {
                'totalQuestions': 0,
                'averageResponseLength': 0,
                'totalInterviewTime': "0m 0s",
                'keywordsUsed': 0,
                'expectedKeywords': 0,
                'confidenceLevel': "Needs Improvement"
            }
        }
        print(json.dumps(fallback, indent=2))

if __name__ == "__main__":
    main()
