"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Camera, Mic, FileText, BarChart3, Zap, Star, Users, Trophy, TrendingUp, ArrowRight, CheckCircle, Search, Globe } from "lucide-react"
import Link from "next/link"
import { SUPPORTED_LANGUAGES, getLanguagesByCategory, searchLanguages, type Language } from "@/lib/language-service"

export default function HomePage() {
  const [selectedGoal, setSelectedGoal] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [isReady, setIsReady] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [languageSearch, setLanguageSearch] = useState("")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  // Get filtered languages based on search
  const filteredLanguages = languageSearch 
    ? searchLanguages(languageSearch)
    : SUPPORTED_LANGUAGES

  const popularLanguages = getLanguagesByCategory('popular')
  const indianLanguages = getLanguagesByCategory('indian-regional')
  const internationalLanguages = getLanguagesByCategory('international')

  const goals = [
    {
      id: "interview",
      name: "Technical Interview",
      icon: Brain,
      description: "Practice coding and system design interviews",
      color: "bg-blue-500",
      features: ["Live coding", "System design", "Behavioral questions"]
    },
    {
      id: "presentation",
      name: "Presentation Skills",
      icon: FileText,
      description: "Improve public speaking and presentation delivery",
      color: "bg-green-500",
      features: ["Voice analysis", "Gesture tracking", "Confidence building"]
    },
    {
      id: "group-discussion",
      name: "Group Discussion",
      icon: BarChart3,
      description: "Enhance group communication and leadership",
      color: "bg-purple-500",
      features: ["Leadership skills", "Team dynamics", "Debate techniques"]
    },
    {
      id: "fluency",
      name: "Language Fluency",
      icon: Zap,
      description: "Build confidence in spoken communication",
      color: "bg-orange-500",
      features: ["Pronunciation", "Grammar check", "Vocabulary building"]
    },
  ]

  // Dynamic roles based on selected goal
  const getRolesByGoal = (goalId: string): string[] => {
    switch (goalId) {
      case "interview":
        return [
          "Software Engineer",
          "Frontend Developer", 
          "Backend Developer",
          "Full Stack Developer",
          "Data Scientist",
          "ML Engineer",
          "DevOps Engineer",
          "Product Manager",
          "System Architect",
          "Tech Lead",
          "Engineering Manager",
          "QA Engineer",
          "Mobile Developer",
          "UI/UX Designer",
          "Business Analyst"
        ]
      case "presentation":
        return [
          "Sales Executive",
          "Marketing Manager",
          "Team Lead",
          "Project Manager",
          "CEO/Founder",
          "Business Development",
          "Public Speaker",
          "Trainer/Coach",
          "Consultant",
          "Product Manager",
          "Account Manager",
          "HR Manager",
          "Event Manager",
          "Academic Presenter"
        ]
      case "group-discussion":
        return [
          "Team Leader",
          "Project Manager",
          "Department Head",
          "HR Manager",
          "Consultant",
          "Business Analyst",
          "Product Owner",
          "Scrum Master",
          "Operations Manager",
          "Marketing Lead",
          "Strategy Manager",
          "Community Manager",
          "Facilitator",
          "Group Coordinator"
        ]
      case "fluency":
        return [
          "Customer Service Representative",
          "Sales Representative",
          "Teacher/Instructor",
          "Interpreter/Translator",
          "Tour Guide",
          "Call Center Agent",
          "Content Creator",
          "Public Relations",
          "Radio/TV Host",
          "Language Coach",
          "International Business",
          "Diplomat",
          "Travel Consultant",
          "Voice Over Artist"
        ]
      default:
        return [
          "Software Engineer",
          "Product Manager",
          "Sales Executive",
          "Team Leader"
        ]
    }
  }

  const currentRoles = selectedGoal ? getRolesByGoal(selectedGoal) : []

  // Handle goal selection and clear incompatible role
  const handleGoalSelection = (goalId: string) => {
    setSelectedGoal(goalId)
    
    // Clear role if it's not valid for the new goal
    if (selectedRole) {
      const newValidRoles = getRolesByGoal(goalId)
      if (!newValidRoles.includes(selectedRole)) {
        setSelectedRole("")
      }
    }
  }

  const features = [
    {
      icon: Camera,
      title: "Real-time Video Analysis",
      description: "AI analyzes your body language, eye contact, and facial expressions"
    },
    {
      icon: Mic,
      title: "Speech Intelligence",
      description: "Voice tone analysis, pace detection, and filler word identification"
    },
    {
      icon: Brain,
      title: "Smart AI Interviewer",
      description: "Dynamic questions based on your responses and industry best practices"
    },
    {
      icon: Trophy,
      title: "Performance Insights",
      description: "Detailed feedback with scores and personalized improvement suggestions"
    }
  ]

  const stats = [
    { label: "Success Rate", value: "94%", icon: TrendingUp },
    { label: "Users Trained", value: "10K+", icon: Users },
    { label: "Average Score Improvement", value: "40%", icon: Trophy },
    { label: "Expert Rating", value: "4.9/5", icon: Star }
  ]

  // Clear role selection when goal changes
  useEffect(() => {
    if (selectedGoal && selectedRole) {
      const validRoles = getRolesByGoal(selectedGoal)
      if (!validRoles.includes(selectedRole)) {
        setSelectedRole("")
      }
    }
  }, [selectedGoal, selectedRole])

  // Calculate progress based on selections
  useEffect(() => {
    let progress = 0
    if (selectedGoal) progress += 33
    if (selectedRole) progress += 33
    if (selectedLanguage) progress += 34
    
    setProgressValue(progress)
    setIsReady(progress === 100)
  }, [selectedGoal, selectedRole, selectedLanguage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              🚀 Powered by Advanced AI
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Communication Skills
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered interview coaching with real-time feedback on your speech, body language, 
              and responses. Get ready for your dream job with personalized training.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => {
                const IconComponent = stat.icon
                return (
                  <div key={stat.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AI Interview Coach?
            </h2>
            <p className="text-lg text-gray-600">
              Advanced AI technology meets practical interview preparation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your AI Interview Session
            </h2>
            <p className="text-lg text-gray-600">
              Customize your practice session in 3 simple steps
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Setup Progress</span>
              <span>{Math.round(progressValue)}% Complete</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="grid gap-8">
            {/* Step 1: Goal Selection */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  Choose Your Goal
                  {selectedGoal && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  Select what type of practice session you want
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const IconComponent = goal.icon
                    return (
                      <Card 
                        key={goal.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedGoal === goal.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleGoalSelection(goal.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${goal.color} rounded-lg flex items-center justify-center`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {goal.features.map((feature) => (
                                  <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Role Selection */}
            <Card className={`border-2 border-dashed ${selectedGoal ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 opacity-50'} transition-colors`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 ${selectedGoal ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>2</span>
                  Select Your Role
                  {selectedRole && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  {selectedGoal ? (
                    <>
                      Roles for <strong>{goals.find(g => g.id === selectedGoal)?.name}</strong> - Choose your target position
                    </>
                  ) : (
                    "Choose the role you're preparing for (select a goal first)"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                  disabled={!selectedGoal}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      selectedGoal 
                        ? `Choose from ${currentRoles.length} ${goals.find(g => g.id === selectedGoal)?.name.toLowerCase()} roles...`
                        : "Select a goal first..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {currentRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 3: Language Selection */}
            <Card className={`border-2 border-dashed ${selectedRole ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 opacity-50'} transition-colors`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 ${selectedRole ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>3</span>
                  Choose Language
                  {selectedLanguage && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  Select your preferred interview language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search languages..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="pl-10"
                      disabled={!selectedRole}
                    />
                  </div>
                  
                  {languageSearch ? (
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {filteredLanguages.slice(0, 10).map((language) => (
                          <button
                            key={language.code}
                            onClick={() => {
                              setSelectedLanguage(language.code)
                              setLanguageSearch("")
                            }}
                            className={`p-3 text-left rounded-lg border transition-colors ${
                              selectedLanguage === language.code
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            disabled={!selectedRole}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{language.name}</span>
                                <span className="text-sm text-gray-500 ml-2">{language.nativeName}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {language.category === 'indian-regional' ? 'Indian' : 
                                 language.category === 'popular' ? 'Popular' : 'Intl'}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue="popular" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="popular">Popular</TabsTrigger>
                        <TabsTrigger value="indian">Indian Regional</TabsTrigger>
                        <TabsTrigger value="international">International</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="popular" className="mt-4">
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {popularLanguages.map((language) => (
                            <button
                              key={language.code}
                              onClick={() => setSelectedLanguage(language.code)}
                              className={`p-3 text-left rounded-lg border transition-colors ${
                                selectedLanguage === language.code
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                              disabled={!selectedRole}
                            >
                              <div className="font-medium">{language.name}</div>
                              <div className="text-sm text-gray-500">{language.nativeName}</div>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="indian" className="mt-4">
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {indianLanguages.map((language) => (
                            <button
                              key={language.code}
                              onClick={() => setSelectedLanguage(language.code)}
                              className={`p-3 text-left rounded-lg border transition-colors ${
                                selectedLanguage === language.code
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                              disabled={!selectedRole}
                            >
                              <div className="font-medium">{language.name}</div>
                              <div className={`text-sm text-gray-500 ${language.rtl ? 'text-right' : 'text-left'}`}>
                                {language.nativeName}
                              </div>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="international" className="mt-4">
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {internationalLanguages.map((language) => (
                            <button
                              key={language.code}
                              onClick={() => setSelectedLanguage(language.code)}
                              className={`p-3 text-left rounded-lg border transition-colors ${
                                selectedLanguage === language.code
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                              disabled={!selectedRole}
                            >
                              <div className="font-medium">{language.name}</div>
                              <div className={`text-sm text-gray-500 ${language.rtl ? 'text-right' : 'text-left'}`}>
                                {language.nativeName}
                              </div>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                  
                  {selectedLanguage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          Selected: {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                          <span className="ml-2 text-green-700">
                            ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Start Button */}
          <div className="mt-8 text-center">
            <Link href={isReady ? "/config" : "#"}>
              <Button 
                size="lg" 
                className={`px-8 py-3 text-lg ${
                  isReady 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={!isReady}
              >
                {isReady ? (
                  <>
                    Start AI Interview <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  'Complete Setup to Continue'
                )}
              </Button>
            </Link>
            {isReady && (
              <p className="mt-2 text-sm text-gray-600">
                🎯 {selectedGoal?.replace('-', ' ')} • 👤 {selectedRole} • 🌍 {selectedLanguage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
