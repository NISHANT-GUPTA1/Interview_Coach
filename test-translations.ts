import { translationService } from '@/lib/translations';

// Test script for translation functionality
async function testTranslations() {
  console.log('🧪 Testing Translation Service...\n');
  
  const testTexts = [
    'Start Recording',
    'End Interview', 
    'Next Question',
    'Recording...',
    'Submit Answer'
  ];
  
  const testLanguages = ['hi', 'es', 'fr', 'zh', 'ar'];
  
  for (const lang of testLanguages) {
    console.log(`\n--- Testing ${lang.toUpperCase()} ---`);
    
    for (const text of testTexts) {
      try {
        const translated = await translationService.getUITranslation(text, lang);
        console.log(`"${text}" → "${translated}"`);
      } catch (error) {
        console.error(`❌ Failed to translate "${text}" to ${lang}:`, error);
      }
    }
  }
  
  // Test stats
  console.log('\n📊 Translation Service Stats:');
  console.log(translationService.getStats());
}

// Run the test
testTranslations();
