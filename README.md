# 🤖 AI Fluency & Interview Coach: Real-Time Multi-Modal Communication Mentor

## 📌 Overview
This is a full-scale AI-powered web application that helps users improve their communication skills through real-time interview simulation, presentation practice, and language fluency coaching. It uses LLMs, real-time webcam/mic analysis, and NLP techniques to analyze responses, provide personalized feedback, and generate progress reports.

## 🎯 Features
- **Goal-based coaching**: Select between interview, presentation, GD, etc.
- **Domain-specific simulation**: Choose Java Developer, ML Engineer, etc.
- **Language selection**: Choose preferred language for AI conversation.
- **Real-time feedback**: Webcam and mic used to analyze eye contact, tone, pauses.
- **Speech-to-text transcription**: Track response time, fluency, and filler words.
- **NLP-powered reporting**: Summarizes strengths, weaknesses, and suggests improvements.
- **Voice-based AI Interviewer**: AI assistant speaks questions aloud like a real interviewer using selected language.
- **Dynamic question flow**: AI generates follow-up questions based on user’s answers and role type.
- **Resume integration (Planned)**: Customize interview questions based on uploaded resume.
<!-- - **Stealth AI Assistant (Future)**: Real-time AI during live interviews/calls (like Cluely). -->
- **PDF Report Export**: Automatically generate and export session summaries.

## 🧠 Tech Stack
### Frontend:
- **React.js**: UI development
- **JavaScript + HTML/CSS**: Base structure and styling
- **WebRTC API**: Webcam and microphone access
- **Web Speech API**: Text-to-speech for AI interviewer
- **Chart.js or Plotly.js**: Data visualization for feedback
- **jsPDF + html2canvas**: Export report to PDF

### Backend:
- **Node.js + Express**: API server
- **MongoDB + Mongoose**: Store interview logs and reports
- **OpenAI GPT-4 API**: Question generation, answer analysis
- **LangChain**: Prompt chaining, contextual follow-up logic

### AI/ML:
- **Whisper (OpenAI)**: Speech-to-text transcription
- **Transformers (Hugging Face)**: For language understanding
- **OpenCV + MediaPipe**: Real-time facial emotion analysis

## 🚀 Setup Instructions (Phase 1: Local Dev Environment)
### Prerequisites:
- Node.js + npm
- Python 3.9+
- Git

### Steps:
1. **Clone the Repository**
```bash
git clone https://github.com/your-username/ai-fluency-interview-coach.git
cd ai-fluency-interview-coach
```
2. **Install Frontend Dependencies**
```bash
cd client
npm install
```
3. **Run Backend Server**
```bash
cd server
npm install
npm run dev
```
4. **Run Frontend Dev Server**
```bash
cd client
npm start
```

## 📁 Project Structure (MVP)
```
ai-fluency-interview-coach/
├── client/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── pages/         # Interview, Reports, Settings, Summary
│   │   ├── utils/         # Camera, Mic utils
│   │   └── App.js
├── server/                # Node.js backend
│   ├── routes/            # API endpoints (e.g., /generate-question)
│   ├── services/          # OpenAI integration, feedback logic
│   └── models/            # User and Session schemas
├── ai/                    # Python scripts for Whisper, OpenCV
│   ├── whisper_transcribe.py
│   └── face_analysis.py
├── database/              # MongoDB setup
├── README.md
└── .env
```
