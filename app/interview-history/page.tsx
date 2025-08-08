"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  User, 
  BarChart3, 
  Calendar,
  Eye,
  Download,
  Search,
  Filter,
  TrendingUp,
  Award
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface InterviewRecord {
  id: string;
  role: string;
  experience: string;
  language: string;
  timestamp: string;
  interviewDuration: number;
  analysis?: {
    overallScore: number;
    breakdown: {
      technical: number;
      communication: number;
      completeness: number;
      confidence: number;
    };
  };
  answers: Array<{
    questionText: string;
    answerText: string;
    category: string;
  }>;
}

export default function InterviewHistoryPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadInterviewHistory()
    loadStats()
  }, [])

  useEffect(() => {
    filterInterviews()
  }, [interviews, searchQuery, selectedRole])

  const loadInterviewHistory = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/interview-database?action=get_user_interviews&userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setInterviews(result.interviews)
        console.log('✅ Loaded interview history:', result.interviews.length)
      } else {
        console.error('❌ Failed to load interview history:', result.error)
      }
    } catch (error) {
      console.error('❌ Error loading interview history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/interview-database?action=get_stats')
      const result = await response.json()

      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error)
    }
  }

  const filterInterviews = () => {
    let filtered = interviews

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(interview => 
        interview.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.experience.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter(interview => interview.role === selectedRole)
    }

    setFilteredInterviews(filtered)
  }

  const getUniqueRoles = () => {
    const roles = interviews.map(i => i.role)
    return [...new Set(roles)]
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default" // Green
    if (score >= 70) return "secondary" // Blue
    if (score >= 60) return "outline" // Yellow
    return "destructive" // Red
  }

  const viewInterview = (interviewId: string) => {
    // Store interview ID and navigate to summary
    localStorage.setItem('viewInterviewId', interviewId)
    router.push(`/summary?interviewId=${interviewId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview History</h1>
          <p className="text-gray-600">Track your progress and review past interviews</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                    <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {interviews.filter(i => i.analysis).length > 0 
                        ? Math.round(interviews.filter(i => i.analysis).reduce((sum, i) => sum + (i.analysis?.overallScore || 0), 0) / interviews.filter(i => i.analysis).length)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {interviews.filter(i => i.analysis).length > 0 
                        ? Math.max(...interviews.filter(i => i.analysis).map(i => i.analysis?.overallScore || 0))
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Improvement</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {interviews.length >= 2 ? (
                        interviews[0].analysis && interviews[1].analysis 
                          ? `+${interviews[0].analysis.overallScore - interviews[1].analysis.overallScore}`
                          : 'N/A'
                      ) : 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by role or experience..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                title="Filter by role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {getUniqueRoles().map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Interviews Found</h3>
              <p className="text-gray-600 mb-6">
                {interviews.length === 0 
                  ? "You haven't completed any interviews yet."
                  : "No interviews match your current filters."
                }
              </p>
              <Link href="/ai-interview">
                <Button>Start New Interview</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInterviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{interview.role}</CardTitle>
                      <p className="text-sm text-gray-600">{interview.experience}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {interview.analysis && (
                        <Badge variant={getScoreBadgeVariant(interview.analysis.overallScore)}>
                          {interview.analysis.overallScore}%
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {interview.language === 'hi' ? 'हिंदी' : 'English'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Interview Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(interview.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(interview.interviewDuration)}
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    {interview.analysis && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Technical</p>
                          <p className={`font-semibold ${getScoreColor(interview.analysis.breakdown.technical)}`}>
                            {interview.analysis.breakdown.technical}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Communication</p>
                          <p className={`font-semibold ${getScoreColor(interview.analysis.breakdown.communication)}`}>
                            {interview.analysis.breakdown.communication}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{interview.answers.length} questions answered</span>
                      <span>
                        Avg response: {Math.round(interview.answers.reduce((sum, a) => sum + a.answerText.length, 0) / interview.answers.length)} chars
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewInterview(interview.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Interview Button */}
        <div className="mt-12 text-center">
          <Link href="/ai-interview">
            <Button size="lg" className="px-8 py-3">
              Start New Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
