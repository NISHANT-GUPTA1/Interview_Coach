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
import { useTranslationContext, TranslatedText } from "@/contexts/TranslationContext"

export default function HomePage() {
  const { language, setLanguage, t } = useTranslationContext()
  const [selectedRole, setSelectedRole] = useState("Software Engineer")
  const [selectedExperience, setSelectedExperience] = useState("2-3 years")
  const [selectedCount, setSelectedCount] = useState(5)
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

  // Available roles for technical interviews
  const availableRoles = [
    "Software Engineer",
    "Frontend Developer", 
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "System Administrator",
    "Cloud Architect",
    "Product Manager"
  ]

  // Available experience levels
  const experienceLevels = [
    "Entry Level",
    "2-3 years", 
    "5+ years",
    "Senior"
  ]

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

  // Calculate progress based on selections
  useEffect(() => {
    let progress = 0
    
    // Role is always selected (default)
    progress += 25
    
    if (selectedLanguage) progress += 25
    
    // Experience is always selected (default)
    progress += 25
    
    // Count is always selected (default)
    progress += 25
    
    setProgressValue(progress)
    setIsReady(selectedLanguage !== "")
  }, [selectedLanguage])

  const handleStartInterview = () => {
    // Save selections to localStorage
    localStorage.setItem('interviewConfig', JSON.stringify({
      role: selectedRole,
      experience: selectedExperience,
      count: selectedCount,
      language: selectedLanguage
    }))
    
    // Navigate to interview page
    window.location.href = '/working-interview'
  }

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
              <TranslatedText text="Master Your" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}<TranslatedText text="Communication Skills" />
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              <TranslatedText text="AI-powered interview coaching with real-time feedback on your speech, body language, and responses. Get ready for your dream job with personalized training." />
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
              Customize your practice session in 4 simple steps
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
            {/* Step 1: Role Selection */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  <TranslatedText text="Select Your Role" />
                  <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Choose the technical role you're preparing for" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your target role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 2: Experience Level */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  <TranslatedText text="Experience Level" />
                  <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Select your professional experience level" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedExperience} 
                  onValueChange={setSelectedExperience}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your experience level..." />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 3: Question Count */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  <TranslatedText text="Number of Questions" />
                  <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="How many questions would you like to practice?" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[3, 5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSelectedCount(count)}
                      className={`p-4 text-center rounded-lg border-2 transition-colors ${
                        selectedCount === count
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Language Selection */}
            <Card className={`border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
                  <TranslatedText text="Choose Language" />
                  {selectedLanguage && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Select your preferred interview language" />
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
            <Button 
              size="lg" 
              className={`px-8 py-3 text-lg ${
                isReady 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!isReady}
              onClick={handleStartInterview}
            >
              {isReady ? (
                <>
                  <TranslatedText text="Start AI Interview" /> <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <TranslatedText text="Complete Setup to Continue" />
              )}
            </Button>
            {isReady && (
              <p className="mt-2 text-sm text-gray-600">
                👤 {selectedRole} • 📈 {selectedExperience} • � {selectedCount} questions • 🌍 {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
