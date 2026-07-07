import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('🌱 Successfully connected to PostgreSQL Database via Prisma!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default prisma;
