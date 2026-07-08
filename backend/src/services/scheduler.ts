import cron from 'node-cron';
import prisma from '../config/db';
import { fetchWeatherData } from './weather';
import { AIService } from './gemini';
import { sendNotification } from './notification';

/**
 * Kisan Alert Backend Scheduler
 * Coordinates daily 6:00 AM agricultural alerts directly in Express.
 */
export function initScheduler() {
  console.log('⏰ Initializing Kisan Alert Backend Scheduler...');

  // Schedule task to run every day at 6:00 AM
  // Cron pattern: '0 6 * * *'
  cron.schedule('0 6 * * *', () => {
    runWeatherAnalysis();
  });

  // Run asynchronously on server boot after 5 seconds to ensure active demo dashboard data
  setTimeout(() => {
    console.log('🌱 Seeding startup weather advisory briefing...');
    runWeatherAnalysis();
  }, 5000);
}

async function runWeatherAnalysis() {
  console.log('🌱 Starting Daily 6:00 AM Weather Analysis & Advisory job...');
  try {
    const farms = await prisma.farm.findMany({
      include: {
        user: { select: { language: true, name: true, phone: true } }
      }
    });

    console.log(`Analyzing weather for ${farms.length} active farms...`);

    for (const farm of farms) {
      try {
        // 1. Fetch latest weather metrics
        const weather = await fetchWeatherData(farm.latitude, farm.longitude);

        // 2. Generate dynamic advisory via Gemini in the farmer's language preference
        const userLang = farm.user?.language || 'en';
        let aiAdvisory = '';
        try {
          aiAdvisory = await AIService.generateWeatherAdvice(
            weather.temperature,
            weather.rainfall,
            userLang
          );
        } catch (geminiErr: any) {
          console.warn(`Failed to generate Gemini advisory for Farm "${farm.name}", falling back to rule-based:`, geminiErr.message);
          aiAdvisory = weather.advisory;
        }

        // 3. Save results to PostgreSQL database
        const weatherAlert = await prisma.weatherAlert.create({
          data: {
            farmId: farm.id,
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
            windSpeed: weather.windSpeed,
            advisory: aiAdvisory || weather.advisory,
            warning: weather.warning || null,
          }
        });

        console.log(`✅ Advisory generated & saved for Farm "${farm.name}" (Lang: ${userLang})`);

        // 4. Dispatch alert through modular notification handler if severity warning exists
        if (weather.warning) {
          await sendNotification({
            userId: farm.userId,
            type: 'WEATHER_ALERT',
            title: `${weather.warning} Alert`,
            message: aiAdvisory || weather.advisory,
            channels: ['push']
          });
        }

      } catch (farmErr: any) {
        console.error(`Failed to process weather analysis for Farm ID ${farm.id}:`, farmErr.message);
      }
    }
    console.log('🏁 Weather Analysis & Advisory job finished successfully.');
  } catch (err: any) {
    console.error('Failed to run daily weather analysis scheduler job:', err);
  }
}
export default initScheduler;
