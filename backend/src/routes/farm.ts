import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../config/db';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { AIService } from '../services/gemini';
import { fetchWeatherData } from '../services/weather';
import { sendNotification } from '../services/notification';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit



// GET ALL FARMS FOR USER
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const farms = await prisma.farm.findMany({
      where: { userId },
      include: {
        soilReports: { orderBy: { createdAt: 'desc' }, take: 1 },
        cropRecommendations: { orderBy: { createdAt: 'desc' }, take: 1 },
        weatherAlerts: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(farms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE FARM
router.post('/', authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.id;
    const { name, location, latitude, longitude, size, soilType, groundwater } = req.body;

    if (!name || !location || !latitude || !longitude || !size || !soilType || !groundwater) {
      return res.status(400).json({ error: 'All farm fields are required' });
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        size: parseFloat(size),
        soilType,
        groundwater,
        userId: userId!,
      },
    });

    res.status(201).json(farm);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPLOAD SOIL REPORT & GET RECOMMENDATION
router.post('/:id/soil-report', authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    const { id: farmId } = req.params;
    const { ph, nitrogen, phosphorus, potassium, organicCarbon, season } = req.body;

    if (!ph || !nitrogen || !phosphorus || !potassium || !organicCarbon) {
      return res.status(400).json({ error: 'All chemical values (pH, N, P, K, Organic Carbon) are required' });
    }

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Fetch user language preference
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    const userLanguage = user?.language || 'en';

    // Save report
    const soilReport = await prisma.soilReport.create({
      data: {
        farmId,
        ph: parseFloat(ph),
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        organicCarbon: parseFloat(organicCarbon),
      },
    });

    // Fetch live weather data for rainfall forecast
    let rainfall = 15;
    try {
      const weatherData = await fetchWeatherData(farm.latitude, farm.longitude);
      rainfall = weatherData.rainfall;
    } catch (err) {
      console.warn('Failed to fetch weather data for recommendation:', err);
    }

    // Fetch crop recommendation from Gemini
    const aiRecommendation = await AIService.getCropRecommendation({
      soilReport: {
        ph: parseFloat(ph),
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        organicCarbon: parseFloat(organicCarbon),
      },
      location: farm.location,
      rainfallForecast: rainfall,
      groundwater: farm.groundwater,
      season: season || 'Kharif',
      soilType: farm.soilType,
    }, userLanguage);

    // Save Crop Recommendation
    const cropRec = await prisma.cropRecommendation.create({
      data: {
        farmId,
        recommendedCrop: aiRecommendation.recommendedCrop,
        confidenceScore: aiRecommendation.confidenceScore,
        reasoning: aiRecommendation.reasoning,
        waterRequirement: aiRecommendation.waterRequirement,
        expectedYield: aiRecommendation.expectedYield,
        riskLevel: aiRecommendation.riskLevel,
        season: season || 'Kharif',
      },
    });

    res.status(201).json({ soilReport, cropRec });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPLOAD SOIL REPORT IMAGE & DETECT parameters (pH, N, P, K)
router.post('/:id/soil-report-image', authenticateJWT, upload.single('image'), async (req: AuthRequest, res: any) => {
  try {
    const { id: farmId } = req.params;
    const { season } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Soil report image file is required' });
    }

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Fetch user language preference
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    const userLanguage = user?.language || 'en';

    // Convert file to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Extract chemical values from image using Gemini Vision
    const extractedData = await AIService.extractSoilReport(base64Image, mimeType);

    // Save report
    const soilReport = await prisma.soilReport.create({
      data: {
        farmId,
        ph: parseFloat(extractedData.ph || 6.5),
        nitrogen: parseFloat(extractedData.nitrogen || 120),
        phosphorus: parseFloat(extractedData.phosphorus || 35),
        potassium: parseFloat(extractedData.potassium || 220),
        organicCarbon: parseFloat(extractedData.organicCarbon || 0.6),
      },
    });

    // Fetch live weather data for rainfall forecast
    let rainfall = 15;
    try {
      const weatherData = await fetchWeatherData(farm.latitude, farm.longitude);
      rainfall = weatherData.rainfall;
    } catch (err) {
      console.warn('Failed to fetch weather data for recommendation:', err);
    }

    // Fetch crop recommendation from Gemini based on extracted parameters
    const aiRecommendation = await AIService.getCropRecommendation({
      soilReport: {
        ph: soilReport.ph,
        nitrogen: soilReport.nitrogen,
        phosphorus: soilReport.phosphorus,
        potassium: soilReport.potassium,
        organicCarbon: soilReport.organicCarbon,
      },
      location: farm.location,
      rainfallForecast: rainfall,
      groundwater: farm.groundwater,
      season: season || 'Kharif',
      soilType: farm.soilType,
    }, userLanguage);

    // Save Crop Recommendation
    const cropRec = await prisma.cropRecommendation.create({
      data: {
        farmId,
        recommendedCrop: aiRecommendation.recommendedCrop,
        confidenceScore: aiRecommendation.confidenceScore,
        reasoning: aiRecommendation.reasoning,
        waterRequirement: aiRecommendation.waterRequirement,
        expectedYield: aiRecommendation.expectedYield,
        riskLevel: aiRecommendation.riskLevel,
        season: season || 'Kharif',
      },
    });

    res.status(201).json({ soilReport, cropRec });
  } catch (error: any) {
    console.error('Soil extraction route error:', error);
    res.status(500).json({ error: error.message });
  }
});


// FETCH CURRENT WEATHER & GENERATE ADVISORY
router.get('/:id/weather', authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    const { id: farmId } = req.params;
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Get current weather from Open-Meteo
    const weatherData = await fetchWeatherData(farm.latitude, farm.longitude);

    // Save Weather Alert entry
    const weatherAlert = await prisma.weatherAlert.create({
      data: {
        farmId,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: weatherData.rainfall,
        windSpeed: weatherData.windSpeed,
        advisory: weatherData.advisory,
        warning: weatherData.warning || null,
      },
    });

    // Trigger modular notification if weather warning exists
    if (weatherData.warning) {
      await sendNotification({
        userId: farm.userId,
        type: 'WEATHER_ALERT',
        title: `${weatherData.warning} Alert`,
        message: weatherData.advisory,
        channels: ['push']
      });
    }

    res.json(weatherAlert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
