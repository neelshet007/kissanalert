import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { getCropRecommendation } from '../services/gemini';
import { fetchWeatherData } from '../services/weather';
import { triggerN8NWebhook } from '../services/n8n';

const router = Router();

// GET ALL ACTIVE FARMS FOR n8n CRON ALERTS
router.get('/active-list', async (req: any, res: any) => {
  try {
    const n8nHeaderKey = req.headers['x-n8n-api-key'];
    const expectedKey = process.env.JWT_SECRET || 'super-secret-jwt-key-kisan-alert-local-dev';
    
    if (n8nHeaderKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid n8n API Key' });
    }

    const farms = await prisma.farm.findMany({
      include: {
        user: { select: { phone: true, name: true } }
      }
    });

    const result = farms.map(f => ({
      id: f.id,
      name: f.name,
      latitude: f.latitude,
      longitude: f.longitude,
      farmerPhone: f.user?.phone || '9876543210',
      farmerName: f.user?.name || 'Ramesh'
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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

    // Fetch crop recommendation from Gemini
    const aiRecommendation = await getCropRecommendation({
      soilReport: {
        ph: parseFloat(ph),
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        organicCarbon: parseFloat(organicCarbon),
      },
      location: farm.location,
      rainfallForecast: 15, // standard placeholder or computed
      groundwater: farm.groundwater,
      season: season || 'Kharif',
      soilType: farm.soilType,
    });

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

    // Trigger n8n notification if weather warning exists
    if (weatherData.warning) {
      await triggerN8NWebhook('WeatherAlert', {
        farmId,
        farmName: farm.name,
        warning: weatherData.warning,
        advisory: weatherData.advisory,
        farmerId: farm.userId,
      });
    }

    res.json(weatherAlert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
