import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Standardize API Key extraction
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

// Retrieve model configurations from env variables with standard fallbacks
const MODELS = {
  DEFAULT: process.env.GEMINI_DEFAULT_MODEL || 'models/gemini-2.5-flash',
  PRO: process.env.GEMINI_PRO_MODEL || 'models/gemini-2.5-pro',
  FAST: process.env.GEMINI_FAST_MODEL || 'models/gemini-2.5-flash-lite',
  AUDIO: process.env.GEMINI_AUDIO_MODEL || 'models/gemini-2.5-flash-native-audio-latest',
  IMAGE: process.env.GEMINI_IMAGE_MODEL || 'models/imagen-4.0-fast-generate-001',
  IMAGE_HQ: process.env.GEMINI_IMAGE_MODEL_HQ || 'models/imagen-4.0-ultra-generate-001',
  EMBEDDING: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-2',
};

// Supported language name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  pa: 'Punjabi',
  bn: 'Bengali',
  or: 'Odia'
};

/**
 * Build system translation prompt instruction for localized AI outputs
 */
function getMultilingualInstruction(langCode?: string): string {
  if (!langCode || langCode === 'en') return '';
  const langName = LANGUAGE_NAMES[langCode] || 'English';
  return `

==================================================
CRITICAL: MANDATORY MULTILINGUAL INSTRUCTIONS
==================================================
You MUST respond ONLY in ${langName}.
Translate everything into ${langName}.
Never use English words or characters except for scientific names or specific brand names.

Translate the following:
- Crop names (e.g. Soybean -> सोयाबीन, Cotton -> कापूस/सूती, Rice -> तांदूळ/चावल, etc.)
- Disease names (e.g. Leaf Blight -> पानावरील करपा, Rust -> तांबेरा, Wilt -> मर, etc.)
- Fertilizer names (e.g. Nitrogen -> नत्र, Phosphorus -> स्फुरद, Potassium -> पालाश, Urea -> युरिया, DAP -> डीएपी)
- Weather conditions (e.g. Heavy Rain -> मुसळधार पाऊस, Light Rain -> हलका पाऊस, Dry Spell -> कोरडा काळ, Humidity -> आर्द्रता, Wind Speed -> वाऱ्याचा वेग, Temperature -> तापमान)
- Sowing/irrigation advice, explanation, and agricultural recommendations.
- All JSON schema keys must remain in English (e.g. "recommendedCrop", "confidenceScore", "reasoning", "waterRequirement", "expectedYield", "riskLevel", "diseaseName", "severity", "treatment", "suggestedFertilizer", "suggestedPesticide", "expertEscalationRequired", "englishResponse", "translatedResponse"), but ALL JSON string values must be translated entirely to ${langName}.
- Localize all numbers into ${langName} numerals if standard in the script (e.g. 25.5 -> २५.५, 1000 -> १०००).
- Localize currency symbols and formatting (e.g. ₹1000 -> ₹१,०००).
- Localize dates, weekdays, and month names (e.g. Monday -> सोमवार, July -> जुलै).
- Localize all assessment labels (e.g. 'Low' -> 'कमी', 'Medium' -> 'मध्यम', 'High' -> 'उच्च', 'Suitable' -> 'योग्य', 'Not Suitable' -> 'अयोग्य', 'Highly Recommended' -> 'अत्यंत शिफारस केलेले', 'Risky' -> 'धोकादायक', 'Kharif' -> 'खरीप', 'Rabi' -> 'रब्बी', 'Zaid' -> 'उन्हाळी/झैद').
==================================================
`;
}

/**
 * Clean Markdown fences and parse JSON safely
 */
function cleanAndParseJSON(responseText: string): any {
  const cleaned = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error('Failed to parse JSON response. Raw response was:', responseText);
    throw new Error(`Invalid JSON format returned from Gemini API: ${error.message || error}`);
  }
}

/**
 * Exponential backoff retry handler for API calls
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000, modelName = 'unknown'): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const status = error?.status;
    const isRateLimit = status === 429 || errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota');
    const isTransient = errorMessage.toLowerCase().includes('fetch failed') || 
                        errorMessage.toLowerCase().includes('timeout') || 
                        errorMessage.toLowerCase().includes('network');

    // Log the full request details and response details
    console.error(`❌ Gemini API call failed for model "${modelName}":`, {
      requestUrl: `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent`,
      status,
      message: errorMessage,
      responseBody: error?.response?.data || error?.response || 'No detailed response body'
    });

    if (retries > 0 && (isRateLimit || isTransient)) {
      console.warn(`⚠️ Retrying Gemini API call due to: ${errorMessage}. Retries left: ${retries}. Backing off for ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2, modelName);
    }
    throw error;
  }
}

/**
 * Centralized AI Service wrapping Google Gemini
 */
export const AIService = {
  /**
   * Helper: Generate text from prompt
   */
  async generateText(prompt: string, options: { model?: string; maxOutputTokens?: number; langCode?: string } = {}) {
    if (!apiKey || !aiClient) {
      throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in environment variables.');
    }
    const targetModel = options.model || MODELS.DEFAULT;
    const finalPrompt = prompt + getMultilingualInstruction(options.langCode);
    return retryWithBackoff(async () => {
      const model = aiClient.getGenerativeModel({ model: targetModel }, { apiVersion: 'v1beta' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        generationConfig: options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : undefined
      });
      return result.response.text();
    }, 3, 1000, targetModel);
  },

  /**
   * Helper: Generate Structured JSON response
   */
  async generateStructuredJSON(prompt: string, options: { model?: string; maxOutputTokens?: number; langCode?: string } = {}) {
    if (!apiKey || !aiClient) {
      throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in environment variables.');
    }
    const targetModel = options.model || MODELS.DEFAULT;
    const finalPrompt = prompt + getMultilingualInstruction(options.langCode);
    return retryWithBackoff(async () => {
      const model = aiClient.getGenerativeModel({ model: targetModel }, { apiVersion: 'v1beta' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: options.maxOutputTokens
        }
      });
      const textResponse = result.response.text();
      return cleanAndParseJSON(textResponse);
    }, 3, 1000, targetModel);
  },

  /**
   * Helper: Analyze multimodal image
   */
  async analyzeImage(prompt: string, imageBase64: string, mimeType = 'image/jpeg', options: { model?: string; responseMimeType?: string; langCode?: string } = {}) {
    if (!apiKey || !aiClient) {
      throw new Error('Gemini API Key is not configured. Please set GEMINI_API_KEY in environment variables.');
    }
    const targetModel = options.model || MODELS.DEFAULT;
    const finalPrompt = prompt + getMultilingualInstruction(options.langCode);
    return retryWithBackoff(async () => {
      const model = aiClient.getGenerativeModel({ model: targetModel }, { apiVersion: 'v1beta' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: finalPrompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType
              }
            }
          ]
        }],
        generationConfig: options.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined
      });
      return result.response.text();
    }, 3, 1000, targetModel);
  },

  /**
   * Smart Crop Recommendation System
   */
  async getCropRecommendation(params: {
    soilReport: { ph: number; nitrogen: number; phosphorus: number; potassium: number; organicCarbon: number };
    location: string;
    rainfallForecast: number;
    groundwater: string;
    season: string;
    soilType: string;
  }, langCode?: string) {
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
    try {
      return await this.generateStructuredJSON(prompt, { model: MODELS.DEFAULT, langCode });
    } catch (error: any) {
      console.error('Gemini crop recommendation error:', error);
      throw new Error(`Gemini crop recommendation failed: ${error.message || error}`);
    }
  },

  /**
   * Image-based Disease Detection & Leaf Analysis
   */
  async diagnoseCropDisease(imageBase64: string, mimeType = 'image/jpeg', langCode?: string) {
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
    try {
      const response = await this.analyzeImage(prompt, imageBase64, mimeType, { 
        model: MODELS.DEFAULT,
        responseMimeType: 'application/json',
        langCode
      });
      return cleanAndParseJSON(response);
    } catch (error: any) {
      console.error('Gemini Disease Detection error:', error);
      throw new Error(`Gemini disease detection failed: ${error.message || error}`);
    }
  },

  /**
   * Voice Query Assistant (Farmer Voice queries, Audio logic)
   */
  async voiceConversation(transcription: string, language = 'en') {
    const prompt = `You are Kisan Alert Voice Assistant. A farmer is asking the following query in language/accent: "${transcription}" (User language preference: ${language}).
Provide a direct, concise, and helpful farming advice answer in clear text.
Also provide the response translated to the target language: ${language}.

Respond in strict JSON format:
{
  "englishResponse": "Detailed answer in English",
  "translatedResponse": "Translated response in ${language}"
}`;
    try {
      // Audio/Voice assistant uses the specific Audio model
      return await this.generateStructuredJSON(prompt, { model: MODELS.AUDIO, langCode: language });
    } catch (error: any) {
      console.warn(`⚠️ MODELS.AUDIO ("${MODELS.AUDIO}") failed or is unsupported. Falling back to MODELS.DEFAULT ("${MODELS.DEFAULT}"):`, error.message);
      return await this.generateStructuredJSON(prompt, { model: MODELS.DEFAULT, langCode: language });
    }
  },

  /**
   * Extract Soil Report Parameters using Gemini Vision
   */
  async extractSoilReport(imageBase64: string, mimeType = 'image/jpeg', langCode?: string) {
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
    try {
      const response = await this.analyzeImage(prompt, imageBase64, mimeType, { 
        model: MODELS.DEFAULT,
        responseMimeType: 'application/json',
        langCode
      });
      return cleanAndParseJSON(response);
    } catch (error: any) {
      console.error('Gemini Soil Extraction error:', error);
      throw new Error(`Gemini soil report extraction failed: ${error.message || error}`);
    }
  },

  /**
   * Weather Advisory generation
   */
  async generateWeatherAdvice(temp: number, rain: number, langCode?: string) {
    const prompt = `You are an agricultural advisor. Weather parameters: Temp ${temp}C, Rain ${rain}mm. Write a 1-sentence simple agricultural sowing/irrigation alert for the farmer.`;
    try {
      // Weather advisories use the default flash model as per requirements
      return await this.generateText(prompt, { model: MODELS.DEFAULT, maxOutputTokens: 100, langCode });
    } catch (error: any) {
      console.error('Gemini Weather Advice error:', error);
      throw new Error(`Gemini weather advisory failed: ${error.message || error}`);
    }
  },

  /**
   * Translation utility
   */
  async translate(text: string, targetLang: string) {
    const prompt = `Translate the following text into ${targetLang}. Return ONLY the direct translation without any introduction or quotes:\n\n${text}`;
    try {
      return await this.generateText(prompt, { model: MODELS.DEFAULT });
    } catch (error: any) {
      console.error('Gemini Translation error:', error);
      throw new Error(`Gemini translation failed: ${error.message || error}`);
    }
  }
};

// --- Backwards Compatibility Exports ---
export async function getCropRecommendation(params: any, langCode?: string) {
  return AIService.getCropRecommendation(params, langCode);
}

export async function detectCropDisease(imageBase64: string, mimeType = 'image/jpeg', langCode?: string) {
  return AIService.diagnoseCropDisease(imageBase64, mimeType, langCode);
}

export async function processVoiceQuery(transcription: string, language = 'en') {
  return AIService.voiceConversation(transcription, language);
}

export async function extractSoilReportFromImage(imageBase64: string, mimeType = 'image/jpeg', langCode?: string) {
  return AIService.extractSoilReport(imageBase64, mimeType, langCode);
}
