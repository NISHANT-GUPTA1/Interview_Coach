"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface FeedbackData {
  overallScore: number
  breakdown: {
    technical: number
    communication: number
    completeness: number
  }
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  statistics: {
    totalQuestions: number
    averageResponseLength: number
    totalInterviewTime: string
    keywordsUsed: number
    expectedKeywords: number
  }
  nextSteps: string[]
}

export default function SummaryPage() {
  const searchParams = useSearchParams()
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const answersParam = searchParams.get('answers')
    if (answersParam) {
      try {
        const interviewData = JSON.parse(decodeURIComponent(answersParam))
        generateFeedback(interviewData)
      } catch (err) {
        console.error('Error parsing interview data:', err)
        setError('Invalid interview data')
        setIsLoading(false)
      }
    } else {
      // Generate sample feedback for demo
      generateSampleFeedback()
    }
  }, [searchParams])

  const generateFeedback = async (interviewData: any) => {
    try {
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: interviewData.answers || [],
          role: interviewData.role || 'Software Engineer',
          language: interviewData.language || 'en',
          interviewDuration: 1200 // 20 minutes sample
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate feedback')
      }

      const data = await response.json()
      setFeedback(data.feedback)
    } catch (err) {
      console.error('Error generating feedback:', err)
      generateSampleFeedback()
    } finally {
      setIsLoading(false)
    }
  }

  const generateSampleFeedback = () => {
    // Sample feedback for demonstration
    setFeedback({
      overallScore: 87,
      breakdown: {
        technical: 85,
        communication: 90,
        completeness: 85
      },
      strengths: [
        'Strong technical knowledge demonstrated with relevant Software Engineer concepts',
        'Clear and articulate communication style',
        'Detailed responses showing thorough thinking process',
        'Comprehensive interview completion showing commitment'
      ],
      improvements: [
        'Incorporate more specific examples of system design experience',
        'Discuss performance optimization techniques in more detail',
        'Provide more concrete metrics when describing project impact',
        'Practice explaining complex algorithms more concisely'
      ],
      recommendations: [
        'Practice explaining complex algorithms in simple terms',
        'Prepare examples that demonstrate system design thinking',
        'Be ready to discuss code optimization and performance trade-offs',
        'Practice the STAR method (Situation, Task, Action, Result) for behavioral questions',
        'Prepare specific examples that demonstrate your problem-solving skills',
        'Research the company and prepare thoughtful questions about the role'
      ],
      statistics: {
        totalQuestions: 6,
        averageResponseLength: 245,
        totalInterviewTime: '18m 32s',
        keywordsUsed: 12,
        expectedKeywords: 15
      },
      nextSteps: [
        'Practice with mock interviews focusing on your improvement areas',
        'Research common interview questions for your target role',
        'Prepare compelling stories that demonstrate your key skills',
        'Practice explaining technical concepts to different audiences'
      ]
    })
    setIsLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">🤖 AI Analyzing Your Performance...</h2>
            <p className="text-gray-600">Generating comprehensive feedback and recommendations</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error Loading Feedback</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to generate feedback'}</p>
          <Link href="/">
            <Button>Return to Homepage</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-100 text-green-700">
            ✅ Interview Complete
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Interview Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Your personalized feedback and performance insights
          </p>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(feedback.overallScore)}`}>
                {feedback.overallScore}%
              </div>
              <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(feedback.overallScore)}`}>
                {feedback.overallScore >= 80 ? 'Excellent Performance' : 
                 feedback.overallScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
              </Badge>
              <p className="text-gray-600 mt-4 text-lg">
                {feedback.overallScore >= 80 ? 
                  'Outstanding! You demonstrated strong skills across all areas.' :
                  feedback.overallScore >= 60 ?
                  'Good job! There are some areas to focus on for improvement.' :
                  'Keep practicing! Focus on the improvement areas below.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Technical Knowledge</span>
                  <span className={`font-bold ${getScoreColor(feedback.breakdown.technical)}`}>
                    {feedback.breakdown.technical}%
                  </span>
                </div>
                <Progress value={feedback.breakdown.technical} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Communication Skills</span>
                  <span className={`font-bold ${getScoreColor(feedback.breakdown.communication)}`}>
                    {feedback.breakdown.communication}%
                  </span>
                </div>
                <Progress value={feedback.breakdown.communication} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Interview Completeness</span>
                  <span className={`font-bold ${getScoreColor(feedback.breakdown.completeness)}`}>
                    {feedback.breakdown.completeness}%
                  </span>
                </div>
                <Progress value={feedback.breakdown.completeness} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback Tabs */}
        <Tabs defaultValue="strengths" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">🌟 Your Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <p className="text-gray-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">🎯 Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-600 text-sm">!</span>
                      </div>
                      <p className="text-gray-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">💡 AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">📊 Interview Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{feedback.statistics.totalQuestions}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{feedback.statistics.averageResponseLength}</div>
                    <div className="text-sm text-gray-600">Avg. Response Length</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{feedback.statistics.totalInterviewTime}</div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {feedback.statistics.keywordsUsed}/{feedback.statistics.expectedKeywords}
                    </div>
                    <div className="text-sm text-gray-600">Keywords Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-indigo-600">🚀 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              🏠 Start New Interview
            </Button>
          </Link>
          <Link href="/config">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              🔄 Practice Again
            </Button>
          </Link>
          <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            📧 Email Results
          </Button>
          <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            📤 Share Results
          </Button>
        </div>
      </div>
    </div>
  )
}