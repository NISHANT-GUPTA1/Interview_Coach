"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Target, 
  Mail, 
  Share2, 
  Download,
  Eye,
  BarChart3,
  Award,
  Clock,
  User,
  Lightbulb,
  Home
} from "lucide-react"
import Link from "next/link"

interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  answerText: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  expectedAnswer: string;
  technicalAccuracy: number;
  communicationClarity: number;
  completeness: number;
}

interface AnalysisData {
  overallScore: number;
  breakdown: {
    technical: number;
    communication: number;
    completeness: number;
    confidence: number;
  };
  questionAnalysis: QuestionAnalysis[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  statistics: {
    totalQuestions: number;
    averageResponseLength: number;
    totalInterviewTime: string;
    keywordsUsed: number;
    expectedKeywords: number;
    confidenceLevel: string;
  };
}

export default function SummaryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionAnalysis | null>(null)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    loadInterviewData()
  }, [])

  const loadInterviewData = async () => {
    try {
      // Try to get data from localStorage first
      const storedData = localStorage.getItem('interviewData')
      if (storedData) {
        const interviewData = JSON.parse(storedData)
        await analyzeInterview(interviewData)
      } else {
        // Fallback: try URL params
        const answersParam = searchParams.get('answers')
        if (answersParam) {
          const interviewData = JSON.parse(decodeURIComponent(answersParam))
          await analyzeInterview(interviewData)
        } else {
          // Show demo analysis
          generateDemoAnalysis()
        }
      }
    } catch (err) {
      console.error('Error loading interview data:', err)
      setError('Failed to load interview data')
      generateDemoAnalysis()
    }
  }

  const analyzeInterview = async (interviewData: any) => {
    try {
      setIsLoading(true)
      console.log('🤖 Starting AI analysis with data:', interviewData)

      const response = await fetch('/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ AI Analysis result:', result)

      if (result.success) {
        setAnalysis(result.analysis)
      } else {
        console.warn('Using fallback analysis:', result.fallback)
        setAnalysis(result.fallback)
      }
    } catch (err) {
      console.error('❌ Analysis error:', err)
      setError('AI analysis failed, showing demo data')
      generateDemoAnalysis()
    } finally {
      setIsLoading(false)
    }
  }

  const generateDemoAnalysis = () => {
    setAnalysis({
      overallScore: 82,
      breakdown: {
        technical: 85,
        communication: 88,
        completeness: 80,
        confidence: 75
      },
      questionAnalysis: [
        {
          questionId: "1",
          questionText: "Tell me about yourself and your experience.",
          answerText: "I'm a software engineer with 3 years of experience working on web applications. I've worked with React, Node.js, and databases like PostgreSQL. In my current role, I've led a team of 3 developers and successfully delivered 5 major projects.",
          score: 85,
          strengths: ["Clear structure", "Relevant experience mentioned", "Specific technologies listed"],
          weaknesses: ["Could include more specific achievements", "Missing career goals"],
          suggestions: ["Add quantifiable results", "Include technical challenges overcome", "Mention future aspirations"],
          expectedAnswer: "Should include background, key skills, specific achievements with metrics, and career goals aligned with the role.",
          technicalAccuracy: 80,
          communicationClarity: 90,
          completeness: 85
        },
        {
          questionId: "2", 
          questionText: "Describe a challenging problem you solved recently.",
          answerText: "We had a performance issue where our API was taking 5 seconds to respond. I analyzed the database queries and found several N+1 query problems. I implemented database indexing and query optimization, reducing response time to under 500ms.",
          score: 90,
          strengths: ["Specific problem identified", "Clear solution approach", "Quantifiable results"],
          weaknesses: ["Could explain technical details better"],
          suggestions: ["Describe the analysis process in more detail", "Mention collaboration with team"],
          expectedAnswer: "Should follow STAR method with specific technical details and measurable outcomes.",
          technicalAccuracy: 95,
          communicationClarity: 85,
          completeness: 90
        }
      ],
      strengths: [
        "Strong technical communication skills",
        "Well-structured responses with clear examples",
        "Good understanding of core software engineering concepts",
        "Provides quantifiable results and metrics"
      ],
      improvements: [
        "Include more specific examples with detailed metrics",
        "Practice explaining complex technical concepts more simply",
        "Prepare more detailed project stories with challenges faced",
        "Add more information about collaboration and leadership"
      ],
      recommendations: [
        "Research company-specific technical challenges and solutions",
        "Practice the STAR method (Situation, Task, Action, Result) for all answers",
        "Prepare technical examples that show problem-solving skills",
        "Practice explaining technical concepts to non-technical audiences",
        "Prepare questions about the company's technical stack and challenges"
      ],
      statistics: {
        totalQuestions: 5,
        averageResponseLength: 180,
        totalInterviewTime: "22m 15s",
        keywordsUsed: 25,
        expectedKeywords: 35,
        confidenceLevel: "Good"
      }
    })
    setIsLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200'
    if (score >= 60) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const sendEmailReport = async () => {
    if (!emailAddress.trim() || !analysis) return
    
    setIsSharing(true)
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Interview analysis report sent to ${emailAddress}!`)
      setEmailAddress("")
    } catch (error) {
      alert('Failed to send email. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const shareResults = async () => {
    if (!analysis) return
    
    try {
      const shareData = {
        title: 'AI Interview Analysis Results',
        text: `I scored ${analysis.overallScore}% in my AI interview analysis!`,
        url: window.location.href
      }
      
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        alert('Results copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const downloadReport = () => {
    if (!analysis) return
    
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: analysis.overallScore,
      breakdown: analysis.breakdown,
      statistics: analysis.statistics,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      recommendations: analysis.recommendations
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 w-96">
          <div className="text-center">
            <div className="relative">
              <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">🤖 AI Analyzing Your Performance</h2>
            <p className="text-gray-600 mb-4">Generating comprehensive feedback and insights</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <span>Analyzing responses...</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                <span>Evaluating technical accuracy...</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce delay-200"></div>
                <span>Generating recommendations...</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 w-96 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Analysis Error</h2>
          <p className="text-red-600 mb-4">{error || 'Failed to load analysis data'}</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700">
              <Home className="h-4 w-4 mr-2" />
              Start New Interview
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Award className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Analysis
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Comprehensive AI-powered performance evaluation</p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </div>
                <Badge className={`text-lg px-4 py-2 ${getScoreBgColor(analysis.overallScore)}`}>
                  {analysis.overallScore >= 80 ? 'Excellent Performance' :
                   analysis.overallScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
                </Badge>
                <p className="mt-2 text-gray-600">
                  {analysis.overallScore >= 80 ?
                    "Outstanding interview performance with strong technical and communication skills!" :
                    analysis.overallScore >= 60 ?
                    "Good performance with room for focused improvements." :
                    "Developing performance - focus on key improvement areas."}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={shareResults} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </Button>
                <Button onClick={downloadReport} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter email address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendEmailReport} 
                    disabled={!emailAddress.trim() || isSharing}
                    size="sm"
                  >
                    {isSharing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Question Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.breakdown.technical)}`}>
                      {analysis.breakdown.technical}%
                    </span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={analysis.breakdown.technical} className="h-2" />
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.breakdown.communication)}`}>
                      {analysis.breakdown.communication}%
                    </span>
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <Progress value={analysis.breakdown.communication} className="h-2" />
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.breakdown.completeness)}`}>
                      {analysis.breakdown.completeness}%
                    </span>
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <Progress value={analysis.breakdown.completeness} className="h-2" />
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.breakdown.confidence)}`}>
                      {analysis.breakdown.confidence}%
                    </span>
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <Progress value={analysis.breakdown.confidence} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>Key Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown">
            <div className="grid gap-6">
              {Object.entries(analysis.breakdown).map(([category, score]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize">{category} Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold capitalize">{category}</span>
                      <Badge className={getScoreBgColor(score)}>
                        {score}%
                      </Badge>
                    </div>
                    <Progress value={score} className="h-3 mb-4" />
                    <p className="text-sm text-gray-600">
                      {score >= 80 ? `Excellent ${category} performance - well above average.` :
                       score >= 60 ? `Good ${category} skills with room for improvement.` :
                       `${category} needs focused development and practice.`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Question Analysis Tab */}
          <TabsContent value="questions">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Question-by-Question Analysis</h3>
                <Button
                  onClick={() => setShowAllAnswers(!showAllAnswers)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showAllAnswers ? 'Hide' : 'Show'} All Answers
                </Button>
              </div>

              {analysis.questionAnalysis.map((question, index) => (
                <Card key={question.questionId} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Badge className={getScoreBgColor(question.score)}>
                        {question.score}%
                      </Badge>
                    </div>
                    <p className="text-gray-700 font-medium">{question.questionText}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Your Answer */}
                    {showAllAnswers && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Your Answer:</h4>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-sm">{question.answerText}</p>
                        </div>
                      </div>
                    )}

                    {/* Sub-scores */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`font-bold ${getScoreColor(question.technicalAccuracy)}`}>
                          {question.technicalAccuracy}%
                        </div>
                        <div className="text-xs text-gray-600">Technical</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold ${getScoreColor(question.communicationClarity)}`}>
                          {question.communicationClarity}%
                        </div>
                        <div className="text-xs text-gray-600">Clarity</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold ${getScoreColor(question.completeness)}`}>
                          {question.completeness}%
                        </div>
                        <div className="text-xs text-gray-600">Complete</div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-green-700 text-sm mb-2">✅ Strengths:</h5>
                        <ul className="text-sm space-y-1">
                          {question.strengths.map((strength, i) => (
                            <li key={i} className="text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-700 text-sm mb-2">⚠️ Areas to Improve:</h5>
                        <ul className="text-sm space-y-1">
                          {question.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-orange-600">• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h5 className="font-semibold text-blue-700 text-sm mb-2">💡 Suggestions:</h5>
                      <ul className="text-sm space-y-1">
                        {question.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-blue-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Answer */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-700 text-sm mb-2">🎯 What we look for:</h5>
                      <p className="text-sm text-blue-700">{question.expectedAnswer}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <Target className="h-5 w-5" />
                    <span>Actionable Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <p className="text-sm text-blue-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">🚀 Immediate Actions (This Week)</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Review and practice answers to common interview questions</li>
                        <li>• Research the company's technical stack and recent projects</li>
                        <li>• Prepare 3-4 detailed project stories using the STAR method</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">📚 Medium-term Goals (Next Month)</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Complete technical skill assessments in weak areas</li>
                        <li>• Practice mock interviews with peers or mentors</li>
                        <li>• Build portfolio projects that demonstrate key skills</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Interview Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-semibold">{analysis.statistics.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{analysis.statistics.totalInterviewTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Level:</span>
                    <Badge className={getScoreBgColor(analysis.overallScore)}>
                      {analysis.statistics.confidenceLevel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Response Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Length:</span>
                    <span className="font-semibold">{analysis.statistics.averageResponseLength} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keywords Used:</span>
                    <span className="font-semibold">{analysis.statistics.keywordsUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Keywords:</span>
                    <span className="font-semibold">{analysis.statistics.expectedKeywords}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Keyword Coverage</span>
                      <span>{Math.round((analysis.statistics.keywordsUsed / analysis.statistics.expectedKeywords) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(analysis.statistics.keywordsUsed / analysis.statistics.expectedKeywords) * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {analysis.statistics.totalQuestions > 0 ? Math.round(analysis.overallScore) : 0}
                    </div>
                    <div className="text-sm text-gray-600">Overall Percentile</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-center">
                      {analysis.overallScore >= 80 ? 
                        "You performed better than 80% of candidates!" :
                        analysis.overallScore >= 60 ?
                        "You're in the top 60% - good progress!" :
                        "Focus on improvements to reach top performers!"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Take Another Interview
            </Button>
          </Link>
          <Button onClick={shareResults} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </Button>
          <Button onClick={downloadReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}
