import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { initScheduler } from './services/scheduler';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('🚀 Bootstrapping Kisan Alert API...');
  
  // Try connecting to database
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn('⚠️ Warning: Prisma could not connect to PostgreSQL. Run docker-compose up or configure DATABASE_URL. Starting in fallback/offline mode.');
  }

  app.listen(PORT, () => {
    console.log(`✅ Kisan Alert Backend running on http://localhost:${PORT}`);
    initScheduler();
  });
}

bootstrap();
