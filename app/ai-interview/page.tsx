"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Clock, User, Bot } from "lucide-react";

interface Question {
  id: number;
  text: string;
  category: string;
  difficulty?: 'junior' | 'mid' | 'senior';
}

interface Answer {
  questionId: number;
  text: string;
  timestamp: Date;
  timeSpent: number;
}

interface CandidateProfile {
  level: 'junior' | 'mid' | 'senior';
  experience: number;
  skills: string[];
}

export default function AIInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // Start with -1 for welcome
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [aiAvatarSpeaking, setAiAvatarSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [candidateProfile] = useState<CandidateProfile>({
    level: 'mid',
    experience: 3,
    skills: ['JavaScript', 'React', 'Node.js', 'Python']
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const selectedRole = searchParams.get('role') || 'Software Engineer';
  const selectedLanguage = searchParams.get('language') || 'en';
  const TOTAL_QUESTIONS = 10;

  useEffect(() => {
    const initializeInterview = async () => {
      await initializeMediaDevices();
      initializeSpeechRecognition();
      initializeSpeechSynthesis();
      
      // Start with welcome message
      setTimeout(() => {
        speakWelcomeMessage();
      }, 1000);
    };
    
    initializeInterview();
    
    return () => {
      if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const speakWelcomeMessage = () => {
    const welcomeText = `Welcome to the AI interview! I'm your virtual interviewer today. We'll be conducting an interview for the ${selectedRole} position. This interview will consist of ${TOTAL_QUESTIONS} questions and will help evaluate your skills and experience. Please ensure you're in a quiet, well-lit environment without distractions. Are you ready to begin? Let's start with our first question.`;
    
    speakQuestionAI(welcomeText, async () => {
      // After welcome message, generate and ask first question
      await generateDynamicQuestions();
      setInterviewStarted(true);
      startInterviewTimer();
      setCurrentQuestionIndex(0);
    });
  };

  const startInterviewTimer = () => {
    interviewTimerRef.current = setInterval(() => {
      setInterviewTimer(prev => prev + 1);
    }, 1000);
  };

  const initializeMediaDevices = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCameraError(`Camera access denied: ${error}`);
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true; // Enable interim results for faster processing
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      recognitionInstance.onresult = (event: any) => {
        interimTranscript = '';
        finalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the answer with both final and interim results for responsiveness
        const combinedTranscript = (finalTranscript + interimTranscript).trim();
        if (combinedTranscript) {
          setCurrentAnswer(prev => {
            // Only append new final transcript
            if (finalTranscript && !prev.includes(finalTranscript.trim())) {
              return prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim();
            }
            return prev;
          });
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          // Auto-restart on common errors
          if (isRecording) {
            restartRecognition();
          }
        }
      };
      
      recognitionInstance.onend = () => {
        if (isRecording) {
          // Auto-restart recognition if still recording
          restartRecognition();
        }
      };
      
      setRecognition(recognitionInstance);
    }
  };

  const restartRecognition = () => {
    if (recognition && isRecording) {
      recognitionRestartTimeoutRef.current = setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }, 100);
    }
  };

  const initializeSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  };

  const generateDynamicQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          questionCount: TOTAL_QUESTIONS,
          candidateLevel: candidateProfile.level,
          candidateSkills: candidateProfile.skills,
          experience: candidateProfile.experience
        })
      });
      
      const data = await response.json();
      const generatedQuestions = data.questions || generateFallbackQuestions();
      setQuestions(generatedQuestions);
      
      // Speak the first question after welcome
      if (generatedQuestions.length > 0 && interviewStarted) {
        setTimeout(() => {
          speakQuestionAI(generatedQuestions[0].text);
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      const fallbackQuestions = generateFallbackQuestions();
      setQuestions(fallbackQuestions);
      if (interviewStarted && fallbackQuestions.length > 0) {
        setTimeout(() => {
          speakQuestionAI(fallbackQuestions[0].text);
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextQuestion = async (previousAnswer: string, questionIndex: number) => {
    try {
      const response = await fetch('/api/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          question: questions[questionIndex - 1]?.text || '',
          answer: previousAnswer,
          language: selectedLanguage,
          questionIndex,
          candidateLevel: candidateProfile.level
        })
      });
      
      const data = await response.json();
      
      if (data.followUp) {
        const newQuestion: Question = {
          id: questions.length + 1,
          text: data.followUp,
          category: 'Follow-up',
          difficulty: candidateProfile.level
        };
        
        // Add the new question to the list
        setQuestions(prev => [...prev, newQuestion]);
        return newQuestion;
      }
    } catch (error) {
      console.error('Error generating follow-up question:', error);
    }
    
    // Return pre-generated question if API fails
    return questions[questionIndex];
  };

  const generateFallbackQuestions = (): Question[] => {
    return [
      { id: 1, text: `Hello! I'm your AI interviewer. Let's start with a brief introduction about yourself and your journey as a ${selectedRole}.`, category: 'Introduction', difficulty: 'junior' },
      { id: 2, text: 'What sparked your interest in this field and what keeps you passionate about it?', category: 'Motivation', difficulty: 'junior' },
      { id: 3, text: 'Tell me about a recent project you worked on that you\'re particularly proud of.', category: 'Experience', difficulty: 'mid' },
      { id: 4, text: 'How do you approach learning new technologies or skills?', category: 'Learning', difficulty: 'mid' },
      { id: 5, text: 'Describe a challenging problem you faced and how you solved it.', category: 'Problem Solving', difficulty: 'mid' },
      { id: 6, text: 'How do you handle working under pressure or tight deadlines?', category: 'Soft Skills', difficulty: 'mid' },
      { id: 7, text: 'What are your thoughts on code quality and best practices?', category: 'Technical', difficulty: 'senior' },
      { id: 8, text: 'How do you approach collaboration and teamwork?', category: 'Soft Skills', difficulty: 'senior' },
      { id: 9, text: 'What are your long-term career goals and aspirations?', category: 'Career Goals', difficulty: 'mid' },
      { id: 10, text: 'Do you have any questions about our company or this role?', category: 'Questions', difficulty: 'junior' }
    ];
  };

  const speakQuestionAI = (text: string, onComplete?: () => void) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setAiAvatarSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly faster for better experience
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      setTimeout(() => {
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.onend = () => {
          setAiAvatarSpeaking(false);
          setQuestionStartTime(new Date());
          if (onComplete) {
            onComplete();
          }
        };
        
        utterance.onerror = () => {
          setAiAvatarSpeaking(false);
          if (onComplete) {
            onComplete();
          }
        };
        
        speechSynthesis.speak(utterance);
      }, 100);
    } else if (onComplete) {
      onComplete();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setCurrentAnswer("");
    
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // If already running, just continue
      }
    }
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const timeSpent = Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000);
    
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex]?.id || 0,
      text: currentAnswer,
      timestamp: new Date(),
      timeSpent: timeSpent
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    if (isRecording) {
      stopRecording();
    }
    
    await moveToNextQuestion();
  };

  const moveToNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= TOTAL_QUESTIONS) {
      finishInterview();
      return;
    }
    
    setCurrentQuestionIndex(nextIndex);
    setCurrentAnswer("");
    
    // Generate next question based on previous answer if possible
    let nextQuestion = questions[nextIndex];
    
    if (answers.length > 0 && nextIndex < TOTAL_QUESTIONS) {
      const lastAnswer = answers[answers.length - 1];
      const generatedQuestion = await generateNextQuestion(lastAnswer.text, nextIndex);
      if (generatedQuestion) {
        nextQuestion = generatedQuestion;
      }
    }
    
    setTimeout(() => {
      if (nextQuestion) {
        speakQuestionAI(nextQuestion.text);
      }
    }, 1500);
  };

  const finishInterview = () => {
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
    if (isRecording) stopRecording();
    
    const sessionData = {
      answers,
      role: selectedRole,
      totalTime: interviewTimer,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('interviewSession', JSON.stringify(sessionData));
    router.push('/summary');
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 && currentQuestionIndex >= 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Show welcome screen before interview starts
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="text-center p-8">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transition-all duration-300 ${aiAvatarSpeaking ? 'scale-105 shadow-lg shadow-blue-300' : ''}`}>
                  <Bot className="h-16 w-16 text-white" />
                </div>
                {aiAvatarSpeaking && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-30"></div>
                )}
                <h3 className="text-xl font-semibold">🤖 AI Interview Starting</h3>
                <p className="text-gray-600">Setting up your personalized interview experience...</p>
                <div className="text-sm text-gray-500">
                  Role: {selectedRole} | Level: {candidateProfile.level} | Questions: {TOTAL_QUESTIONS}
                </div>
                {aiAvatarSpeaking && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600 animate-pulse">
                    🎤 Speaking Welcome Message...
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="text-center p-8">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <h3 className="text-xl font-semibold">🤖 Preparing Your AI Interview</h3>
                <p className="text-gray-600">Generating personalized questions based on your profile and experience...</p>
                <div className="text-sm text-gray-500">
                  Role: {selectedRole} | Level: {candidateProfile.level} | Questions: {TOTAL_QUESTIONS}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">🎯 {selectedRole}</Badge>
              <Badge variant="outline">📊 {candidateProfile.level} Level</Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTime(interviewTimer)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Question {Math.max(0, currentQuestionIndex) + 1} of {TOTAL_QUESTIONS}
              </span>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Interviewer */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className={`h-5 w-5 ${aiAvatarSpeaking ? 'text-green-500 animate-pulse' : 'text-blue-600'}`} />
                <span>🤖 AI Interviewer</span>
                {aiAvatarSpeaking && (
                  <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">
                    🎤 Speaking...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transition-all duration-300 ${aiAvatarSpeaking ? 'scale-105 shadow-lg shadow-blue-300' : ''}`}>
                    <Bot className="h-16 w-16 text-white" />
                  </div>
                  {aiAvatarSpeaking && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-30"></div>
                  )}
                </div>
                
                {currentQuestion && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">📝 {currentQuestion.category}</Badge>
                      {currentQuestion.difficulty && (
                        <Badge variant={
                          currentQuestion.difficulty === 'senior' ? 'destructive' : 
                          currentQuestion.difficulty === 'mid' ? 'default' : 
                          'secondary'
                        }>
                          {currentQuestion.difficulty === 'senior' ? '🔥' : 
                           currentQuestion.difficulty === 'mid' ? '⭐' : '🌟'} {currentQuestion.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg leading-relaxed font-medium">{currentQuestion.text}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Candidate Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>📹 Your Video</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleVideo}>
                      {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {cameraError ? (
                    <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                      <div className="text-center">
                        <VideoOff className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Camera access required</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 text-white border-white hover:bg-white hover:text-gray-900"
                          onClick={initializeMediaDevices}
                        >
                          Retry Camera Access
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-48 bg-gray-900 rounded-lg object-cover transition-opacity scale-x-[-1] ${
                        videoEnabled ? 'opacity-100' : 'opacity-30'
                      }`}
                    />
                  )}
                  {isRecording && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>🔴 REC {formatTime(recordingDuration)}</span>
                    </div>
                  )}
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>💭 Your Response</span>
                  {isRecording && (
                    <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">
                      🎤 Listening...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="🎤 Start recording to speak your answer, or type directly here..."
                  className="min-h-[120px] resize-none text-base"
                />
                
                <div className="flex justify-between items-center">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="flex items-center space-x-2"
                    disabled={!audioEnabled}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span>{isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}</span>
                  </Button>
                  
                  <Button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <span>✅ Submit Answer</span>
                  </Button>
                </div>
                
                {currentAnswer.length > 0 && (
                  <div className="text-xs text-gray-500 flex justify-between bg-gray-50 p-2 rounded">
                    <span>📝 Words: {currentAnswer.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                    <span>⏱️ Time: {formatTime(Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000))}</span>
                  </div>
                )}
                
                {!audioEnabled && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Microphone is disabled. Enable it to use voice recording.
                  </div>
                )}
                
                {isRecording && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    💡 Speak clearly and at normal pace. The AI will transcribe your speech in real-time.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={finishInterview}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            🔚 End Interview
          </Button>
          
          {currentQuestionIndex > 0 && (
            <Button
              onClick={() => {
                setCurrentQuestionIndex(prev => prev - 1);
                setCurrentAnswer("");
              }}
              variant="outline"
            >
              ⬅️ Previous Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
