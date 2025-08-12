import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Test environment variables without exposing sensitive data
  const envStatus = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'MISSING',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV || 'MISSING',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'MISSING',
    timestamp: new Date().toISOString()
  };

  console.log('Environment Status Check:', envStatus);

  return NextResponse.json({
    status: 'Environment Variables Check',
    environment: envStatus,
    message: 'Check console for detailed logs'
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
