import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface InterviewData {
  id: string;
  userId: string;
  role: string;
  experience: string;
  language: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    answerText: string;
    category: string;
    recordingDuration: number;
  }>;
  analysis?: any;
  timestamp: string;
  interviewDuration: number;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
  };
}

// Simple file-based database for interviews
class InterviewDatabase {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'interviews');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async saveInterview(data: InterviewData): Promise<string> {
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filePath = path.join(this.dataDir, `${interviewId}.json`);
    
    const interviewRecord = {
      ...data,
      id: interviewId,
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(interviewRecord, null, 2));
    console.log(`✅ Interview saved: ${interviewId}`);
    
    return interviewId;
  }

  async getInterview(interviewId: string): Promise<InterviewData | null> {
    const filePath = path.join(this.dataDir, `${interviewId}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Interview file not found: ${interviewId}`);
      return null;
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const interview = JSON.parse(data);
      console.log(`✅ Interview found: ${interviewId}, Language: ${interview.language || 'en'}`);
      return interview;
    } catch (error) {
      console.error(`❌ Error reading interview ${interviewId}:`, error);
      return null;
    }
  }

  async updateInterviewAnalysis(interviewId: string, analysis: any): Promise<boolean> {
    const filePath = path.join(this.dataDir, `${interviewId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.analysis = analysis;
    data.analyzedAt = new Date().toISOString();
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Analysis updated for interview: ${interviewId}`);
    
    return true;
  }

  async getUserInterviews(userId: string): Promise<InterviewData[]> {
    const files = fs.readdirSync(this.dataDir);
    const interviews: InterviewData[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(this.dataDir, file), 'utf8'));
          if (data.userId === userId) {
            interviews.push(data);
          }
        } catch (error) {
          console.warn(`⚠️ Skipping corrupted interview file: ${file}`, error);
        }
      }
    }

    console.log(`✅ Found ${interviews.length} interviews for user ${userId}`);
    return interviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getInterviewStats(): Promise<{
    totalInterviews: number;
    totalUsers: number;
    averageScore: number;
    popularRoles: Array<{role: string, count: number}>;
  }> {
    const files = fs.readdirSync(this.dataDir);
    const interviews: InterviewData[] = [];
    const userIds = new Set<string>();
    const roles: Record<string, number> = {};

    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(path.join(this.dataDir, file), 'utf8'));
        interviews.push(data);
        userIds.add(data.userId);
        roles[data.role] = (roles[data.role] || 0) + 1;
      }
    }

    const scoresWithAnalysis = interviews
      .filter(i => i.analysis && i.analysis.overallScore)
      .map(i => i.analysis.overallScore);
    
    const averageScore = scoresWithAnalysis.length > 0 
      ? scoresWithAnalysis.reduce((a, b) => a + b, 0) / scoresWithAnalysis.length 
      : 0;

    const popularRoles = Object.entries(roles)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalInterviews: interviews.length,
      totalUsers: userIds.size,
      averageScore: Math.round(averageScore),
      popularRoles
    };
  }
}

const db = new InterviewDatabase();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'save':
        const interviewId = await db.saveInterview({
          ...data,
          userId: data.userId || `user_${Date.now()}`, // Generate user ID if not provided
          timestamp: data.timestamp || new Date().toISOString(),
          deviceInfo: {
            userAgent: req.headers.get('user-agent') || '',
            platform: req.headers.get('sec-ch-ua-platform') || '',
            language: req.headers.get('accept-language') || ''
          }
        });

        return NextResponse.json({
          success: true,
          interviewId,
          message: 'Interview saved successfully'
        });

      case 'get':
        const interview = await db.getInterview(data.interviewId);
        if (!interview) {
          return NextResponse.json({
            success: false,
            error: 'Interview not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          interview
        });

      case 'update_analysis':
        const updated = await db.updateInterviewAnalysis(data.interviewId, data.analysis);
        if (!updated) {
          return NextResponse.json({
            success: false,
            error: 'Interview not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: 'Analysis updated successfully'
        });

      case 'get_user_interviews':
        const userInterviews = await db.getUserInterviews(data.userId);
        return NextResponse.json({
          success: true,
          interviews: userInterviews
        });

      case 'get_stats':
        const stats = await db.getInterviewStats();
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Interview database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database operation failed'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const interviewId = url.searchParams.get('interviewId');
    const userId = url.searchParams.get('userId');

    switch (action) {
      case 'get':
        if (!interviewId) {
          return NextResponse.json({
            success: false,
            error: 'Interview ID required'
          }, { status: 400 });
        }

        const interview = await db.getInterview(interviewId);
        if (!interview) {
          return NextResponse.json({
            success: false,
            error: 'Interview not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          interview
        });

      case 'get_user_interviews':
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID required'
          }, { status: 400 });
        }

        const userInterviews = await db.getUserInterviews(userId);
        return NextResponse.json({
          success: true,
          interviews: userInterviews
        });

      case 'get_stats':
        const stats = await db.getInterviewStats();
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Interview database GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database operation failed'
    }, { status: 500 });
  }
}
