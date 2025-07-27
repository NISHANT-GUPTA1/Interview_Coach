import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role = 'Software Engineer', experience = '2-3 years', count = 5, language = 'en' } = body;

    console.log('🤖 OpenRouter AI Question Generation API called:', { role, experience, count, language });

    // Prepare input data for Python script
    const inputData = JSON.stringify({ role, experience, count, language });

    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'lib', 'ai_openrouter_api.py')
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
          OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
          OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL
        }
      });

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        const errorString = data.toString();
        errorData += errorString;
        console.log('Python stderr:', errorString);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code: ${code}`);
        
        if (code !== 0) {
          console.error('Python process failed. Error output:', errorData);
          resolve(NextResponse.json({
            success: false,
            error: 'Failed to generate AI questions',
            details: errorData
          }, { status: 500 }));
          return;
        }

        try {
          const result = JSON.parse(outputData);
          resolve(NextResponse.json({
            success: true,
            ...result
          }));
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Raw output:', outputData);
          resolve(NextResponse.json({
            success: false,
            error: 'Invalid response from AI service',
            details: outputData
          }, { status: 500 }));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        resolve(NextResponse.json({
          success: false,
          error: 'Failed to start AI service',
          details: error.message
        }, { status: 500 }));
      });

      // Send input data to Python script
      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
