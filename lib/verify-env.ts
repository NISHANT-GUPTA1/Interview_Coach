/**
 * Helper function to verify that required environment variables are set
 * This helps with troubleshooting environment issues
 */

export function verifyEnvironment(): { 
  success: boolean; 
  missingVars: string[]; 
  criticalVarDetails: { [key: string]: boolean };
} {
  const missingVars: string[] = [];
  const criticalVarDetails: { [key: string]: boolean } = {};
  
  if (typeof window === 'undefined') {
    // Server-side only check
    const criticalVars = [
      'OPENROUTER_API_KEY',
      'OPENROUTER_MODEL',
      'OPENROUTER_BASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    criticalVars.forEach(varName => {
      const isPresent = !!process.env[varName];
      criticalVarDetails[varName] = isPresent;
      
      if (!isPresent) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      console.error(`❌ Missing critical environment variables: ${missingVars.join(', ')}`);
      console.error('Please check your .env.local file and ensure all required variables are set.');
    } else {
      console.log('✅ All critical environment variables found');
      
      // Log partial OpenRouter key for debugging
      if (process.env.OPENROUTER_API_KEY) {
        const key = process.env.OPENROUTER_API_KEY as string;
        console.log(`OpenRouter API Key: ${key.substring(0, 10)}...${key.substring(key.length - 5)}`);
      }
    }
  }
  
  return {
    success: missingVars.length === 0,
    missingVars,
    criticalVarDetails
  };
}
