const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, '');

async function testSDK() {
  try {
    // Check if we can specify v1beta apiVersion
    const aiClient = new GoogleGenerativeAI(apiKey);
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' }, { apiVersion: 'v1beta' });
    const result = await model.generateContent('Hello, are you online?');
    console.log('SDK Success with v1beta options:', result.response.text());
  } catch (error) {
    console.error('SDK Error:', error.message);
  }
}

testSDK();
