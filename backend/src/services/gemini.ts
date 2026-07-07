import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const rawApiKey = process.env.GEMINI_API_KEY;
const apiKey = rawApiKey ? rawApiKey.replace(/^["']|["']$/g, '') : undefined;
let aiClient: any = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
    console.log(`🌱 Gemini Client Initialized successfully. Key length: ${apiKey.length}`);
  } catch (err) {
    console.error('Failed to initialize Gemini Client with provided key:', err);
  }
} else {
  console.warn('⚠️ Warning: GEMINI_API_KEY is not defined in environment variables.');
}

/**
 * Smart Crop Recommendation System
 */
export async function getCropRecommendation(params: {
  soilReport: { ph: number; nitrogen: number; phosphorus: number; potassium: number; organicCarbon: number };
  location: string;
  rainfallForecast: number;
  groundwater: string;
  season: string;
  soilType: string;
}) {
  const prompt = `You are an expert AI Agronomist specializing in Indian agriculture.
Recommend the best crop to cultivate based on the following details:
- Soil pH: ${params.soilReport.ph}
- Nitrogen (N): ${params.soilReport.nitrogen} mg/kg
- Phosphorus (P): ${params.soilReport.phosphorus} mg/kg
- Potassium (K): ${params.soilReport.potassium} mg/kg
- Organic Carbon: ${params.soilReport.organicCarbon}%
- Soil Type: ${params.soilType}
- Location: ${params.location}
- Forecasted Rainfall: ${params.rainfallForecast} mm
- Groundwater availability: ${params.groundwater}
- Sowing Season: ${params.season}

Respond in strict JSON format:
{
  "recommendedCrop": "Name of the crop",
  "confidenceScore": 0.0 to 1.0,
  "reasoning": "Detailed agronomic explanation including localized recommendations",
  "waterRequirement": "High/Medium/Low with specific irrigation details",
  "expectedYield": "Expected yield range per acre",
  "riskLevel": "Low/Medium/High with details on pests or drought risk"
}`;

  if (!apiKey || !aiClient) {
    throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in backend/.env file.');
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error('Gemini crop recommendation error:', error);
    throw new Error(`Gemini crop recommendation failed: ${error.message || error}`);
  }
}

/**
 * Image-based Disease Detection & Leaf Analysis
 */
export async function detectCropDisease(imageBase64: string, mimeType: string = 'image/jpeg') {
  const prompt = `You are a Plant Pathologist. Analyze the provided leaf or crop image.
Identify if any disease is present, specify confidence level, and recommend treatments.

Respond in strict JSON format:
{
  "diseaseName": "Name of the disease (or 'Healthy')",
  "confidenceScore": 0.0 to 1.0,
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "treatment": "Step-by-step organic and chemical treatment instructions",
  "suggestedFertilizer": "Recommended fertilizer to boost recovery",
  "suggestedPesticide": "Suggested fungicide or pesticide name",
  "expertEscalationRequired": true/false
}`;

  if (!apiKey || !aiClient) {
    throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in backend/.env file.');
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      }
    ]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error('Gemini Disease Detection error:', error);
    throw new Error(`Gemini disease detection failed: ${error.message || error}`);
  }
}

/**
 * Voice Query Assistant
 */
export async function processVoiceQuery(transcription: string, language: string = 'en') {
  const prompt = `You are Kisan Alert Voice Assistant. A farmer is asking the following query in language/accent: "${transcription}" (User language preference: ${language}).
Provide a direct, concise, and helpful farming advice answer in clear text.
Also provide the response translated to the target language: ${language}.

Respond in strict JSON format:
{
  "englishResponse": "Detailed answer in English",
  "translatedResponse": "Translated response in ${language}"
}`;

  if (!apiKey || !aiClient) {
    throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in backend/.env file.');
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    return JSON.parse(result.response.text());
  } catch (error: any) {
    console.error('Gemini Voice Assistant error:', error);
    throw new Error(`Gemini voice assistant query failed: ${error.message || error}`);
  }
}

/**
 * Extract Soil Report Parameters using Gemini Vision
 */
export async function extractSoilReportFromImage(imageBase64: string, mimeType: string = 'image/jpeg') {
  const prompt = `You are an expert soil chemist. Analyze the provided image of a Soil Health Card or Soil Testing Report.
Extract the chemical values: pH, Nitrogen (N), Phosphorus (P), Potassium (K), and Organic Carbon.
If any value is missing or illegible in the card, make an educated agronomic guess based on standard Indian soil profiles.

Respond in strict JSON format:
{
  "ph": 0.0,
  "nitrogen": 0.0,
  "phosphorus": 0.0,
  "potassium": 0.0,
  "organicCarbon": 0.0
}`;

  if (!apiKey || !aiClient) {
    throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in backend/.env file.');
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      }
    ]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error('Gemini Soil Extraction error:', error);
    throw new Error(`Gemini soil report extraction failed: ${error.message || error}`);
  }
}

