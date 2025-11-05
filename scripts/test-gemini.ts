import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
  console.log('Testing Gemini API...\n');

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✓ API Key found:', apiKey.substring(0, 15) + '...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to list available models
    console.log('\nFetching available models...');
    try {
      const models = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      const data = await models.json();

      if (data.models) {
        console.log('\n✓ Available models:');
        data.models.forEach((model: any) => {
          console.log(`  - ${model.name} (${model.displayName})`);
        });

        // Try with the first available model
        const firstModel = data.models.find((m: any) => m.name.includes('gemini'));
        if (firstModel) {
          const modelName = firstModel.name.replace('models/', '');
          console.log(`\nTrying with model: ${modelName}`);

          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Say "Hello! I am working!" if you can hear me.');
          const response = await result.response;
          const text = response.text();

          console.log('\n✓ Gemini Response:', text);
          console.log('\n✓ Success! Gemini API is working correctly.');
        }
      } else {
        console.error('\n❌ Error listing models:', data);
      }
    } catch (listError: any) {
      console.error('\n❌ Error fetching models:', listError.message);
    }
  } catch (error: any) {
    console.error('\n❌ Gemini API Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testGemini();
