import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: any = null;

if (apiKey) {
  try {
    // Initialise GoogleGenerativeAI client
    aiClient = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('Failed to initialize Gemini Client with provided key:', err);
  }
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
    // Fallback Mock Response
    return {
      recommendedCrop: params.soilType.toLowerCase().includes('black') ? 'Cotton' : 'Rice (Paddy)',
      confidenceScore: 0.88,
      reasoning: `Based on your soil parameters (pH: ${params.soilReport.ph}) and Sowing Season (${params.season}), the soil contains favorable nitrogen and organic carbon. Since groundwater is ${params.groundwater}, this crop is highly optimal.`,
      waterRequirement: params.groundwater === 'High' ? 'Medium to High' : 'Low to Medium',
      expectedYield: '15-22 Quintals per acre',
      riskLevel: 'Low'
    };
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini crop recommendation error:', error);
    return {
      recommendedCrop: 'Wheat',
      confidenceScore: 0.75,
      reasoning: 'Fallback recommendation due to AI API limit or error. Suitable for typical Indian winter sowing.',
      waterRequirement: 'Medium',
      expectedYield: '12-18 Quintals per acre',
      riskLevel: 'Medium'
    };
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
    // Fallback Mock Response
    return {
      diseaseName: 'Tomato Early Blight',
      confidenceScore: 0.85,
      severity: 'MEDIUM' as const,
      treatment: 'Remove infected lower leaves. Avoid overhead watering. Apply copper-based fungicide if needed.',
      suggestedFertilizer: 'Balanced N-P-K (10-10-10) with micronutrients',
      suggestedPesticide: 'Chlorothalonil or Copper Fungicide',
      expertEscalationRequired: false
    };
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
  } catch (error) {
    console.error('Gemini Disease Detection error:', error);
    return {
      diseaseName: 'Suspected Leaf Spot',
      confidenceScore: 0.6,
      severity: 'LOW' as const,
      treatment: 'Keep the field clean and rotate crops. Limit humidity around the crop.',
      suggestedFertilizer: 'Organic Compost',
      suggestedPesticide: 'Neem Oil spray',
      expertEscalationRequired: true
    };
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
    return {
      englishResponse: `To control leaf turning yellow, check soil moisture and add nitrogen fertilizer.`,
      translatedResponse: `पत्तियों के पीले होने को रोकने के लिए, मिट्टी की नमी की जांच करें और नाइट्रोजन उर्वरक डालें।`
    };
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini Voice Assistant error:', error);
    return {
      englishResponse: 'Please consult the local agricultural officer for crop leaf yellowing issues.',
      translatedResponse: 'कृपया फसल की पत्तियों के पीले होने की समस्या के लिए स्थानीय कृषि अधिकारी से संपर्क करें।'
    };
  }
}
