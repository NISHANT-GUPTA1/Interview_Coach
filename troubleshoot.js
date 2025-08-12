#!/usr/bin/env node

/**
 * 🔧 AI Interview Coach - Deployment Troubleshooter
 * 
 * This script helps diagnose common deployment issues with your AI Interview Coach application.
 * Run this script to check environment variables, API connectivity, and common configuration issues.
 */

const https = require('https');

console.log('🔍 AI Interview Coach - Deployment Troubleshooter\n');

// Environment Variables Check
console.log('📋 Checking Environment Variables...');
console.log('='.repeat(50));

const envVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
  'OPENROUTER_API_KEY': process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 15)}...` : 'NOT SET',
  'OPENROUTER_MODEL': process.env.OPENROUTER_MODEL || 'NOT SET',
  'OPENROUTER_BASE_URL': process.env.OPENROUTER_BASE_URL || 'NOT SET',
  'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'
};

Object.entries(envVars).forEach(([key, value]) => {
  const status = value === 'NOT SET' ? '❌' : '✅';
  console.log(`${status} ${key}: ${value}`);
});

console.log('\n' + '='.repeat(50));

// API Connectivity Test
async function testAPIConnectivity() {
  console.log('\n🌐 Testing API Connectivity...');
  console.log('='.repeat(50));

  // Test OpenAI API
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
    try {
      console.log('🧪 Testing OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      });
      
      if (response.ok) {
        console.log('✅ OpenAI API: Connected successfully');
      } else {
        console.log(`❌ OpenAI API: Error ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ OpenAI API: Connection failed - ${error.message}`);
    }
  } else {
    console.log('⚠️  OpenAI API: No valid API key found');
  }

  // Test OpenRouter API
  if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes('dummy')) {
    try {
      console.log('🧪 Testing OpenRouter API...');
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        }
      });
      
      if (response.ok) {
        console.log('✅ OpenRouter API: Connected successfully');
      } else {
        console.log(`❌ OpenRouter API: Error ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ OpenRouter API: Connection failed - ${error.message}`);
    }
  } else {
    console.log('⚠️  OpenRouter API: No valid API key found');
  }
}

// Configuration Recommendations
function showRecommendations() {
  console.log('\n💡 Recommendations...');
  console.log('='.repeat(50));

  const issues = [];
  const solutions = [];

  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    issues.push('❌ No AI API keys configured');
    solutions.push('Add OPENAI_API_KEY or OPENROUTER_API_KEY to your environment variables');
  }

  if (process.env.NODE_ENV !== 'production') {
    issues.push('⚠️  NODE_ENV is not set to production');
    solutions.push('Set NODE_ENV=production for production deployment');
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    issues.push('⚠️  NEXT_PUBLIC_APP_URL not set');
    solutions.push('Set NEXT_PUBLIC_APP_URL to your deployed site URL');
  }

  if (issues.length === 0) {
    console.log('✅ Configuration looks good!');
  } else {
    console.log('Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
    console.log('\nSolutions:');
    solutions.forEach(solution => console.log(`  💡 ${solution}`));
  }
}

// Netlify-specific checks
function netlifyChecks() {
  console.log('\n🚀 Netlify Deployment Checks...');
  console.log('='.repeat(50));

  console.log('📋 Required Environment Variables for Netlify:');
  console.log('   1. Go to Netlify Dashboard → Site Settings → Environment Variables');
  console.log('   2. Add these variables:');
  console.log('      • OPENAI_API_KEY=sk-proj-your-key-here');
  console.log('      • OPENROUTER_API_KEY=sk-or-v1-your-key-here');
  console.log('      • NODE_ENV=production');
  console.log('      • NEXT_PUBLIC_APP_URL=https://your-site.netlify.app');
  console.log('   3. Redeploy your site after adding variables');

  console.log('\n🔧 Build Configuration:');
  console.log('   • Build command: npm run build');
  console.log('   • Publish directory: .next');
  console.log('   • Node.js version: 18.x or higher');

  console.log('\n📊 Monitoring:');
  console.log('   • Check function logs: Site Settings → Functions');
  console.log('   • Monitor errors: Site Settings → Analytics');
  console.log('   • Debug API calls in browser Network tab');
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  console.log('='.repeat(50));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoints = [
    '/api/ai-questions',
    '/api/generate-questions',
    '/api/speech-service'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing ${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'Software Engineer',
          language: 'en',
          count: 3
        })
      });

      if (response.ok) {
        console.log(`✅ ${endpoint}: Working`);
      } else {
        console.log(`❌ ${endpoint}: Error ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  try {
    await testAPIConnectivity();
    showRecommendations();
    netlifyChecks();
    
    if (process.env.NEXT_PUBLIC_APP_URL) {
      await testAPIEndpoints();
    }

    console.log('\n🎯 Summary:');
    console.log('='.repeat(50));
    console.log('If you see API errors in your deployed app:');
    console.log('1. ✅ Ensure environment variables are set in Netlify');
    console.log('2. ✅ Verify API keys are valid and have credits');
    console.log('3. ✅ Check Netlify function logs for detailed errors');
    console.log('4. ✅ Test locally first with npm run dev');
    console.log('5. ✅ Redeploy after making changes');

    console.log('\n📞 Need help? Check:');
    console.log('• Netlify function logs: Site Settings → Functions');
    console.log('• OpenAI usage: https://platform.openai.com/usage');
    console.log('• OpenRouter dashboard: https://openrouter.ai/activity');

  } catch (error) {
    console.error('❌ Troubleshooter error:', error.message);
  }
}

// Run the troubleshooter
main();
