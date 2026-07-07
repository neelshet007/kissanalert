import { PrismaClient, Role, Severity, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean database
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.voiceMessage.deleteMany({});
  await prisma.diseaseReport.deleteMany({});
  await prisma.weatherAlert.deleteMany({});
  await prisma.cropRecommendation.deleteMany({});
  await prisma.soilReport.deleteMany({});
  await prisma.farm.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // Users
  const farmer = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar',
      email: 'farmer@kisanalert.com',
      phone: '9876543210',
      passwordHash,
      role: Role.FARMER,
      language: 'hi',
    },
  });

  const expert = await prisma.user.create({
    data: {
      name: 'Dr. Anil Patil (Rythu Seva Kendra)',
      email: 'expert@kisanalert.com',
      phone: '8765432109',
      passwordHash,
      role: Role.EXPERT,
      language: 'te',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Kisan Alert Administrator',
      email: 'admin@kisanalert.com',
      phone: '7654321098',
      passwordHash,
      role: Role.ADMIN,
      language: 'en',
    },
  });

  // Farms
  const farm1 = await prisma.farm.create({
    data: {
      name: 'Paddy & Cotton fields',
      location: 'Guntur, Andhra Pradesh',
      latitude: 16.3067,
      longitude: 80.4365,
      size: 4.5,
      soilType: 'Black Cotton Soil',
      groundwater: 'Medium',
      userId: farmer.id,
    },
  });

  // Soil Report
  await prisma.soilReport.create({
    data: {
      farmId: farm1.id,
      ph: 6.8,
      nitrogen: 120.5,
      phosphorus: 34.2,
      potassium: 240.1,
      organicCarbon: 0.65,
    },
  });

  // Crop Recommendation
  await prisma.cropRecommendation.create({
    data: {
      farmId: farm1.id,
      recommendedCrop: 'Cotton',
      confidenceScore: 0.92,
      reasoning: 'The soil parameters show optimal levels of potassium and a near-neutral pH, which is excellent for cotton crop root system. High organic carbon content ensures crop resilience.',
      waterRequirement: 'Medium',
      expectedYield: '18-24 Quintals per acre',
      riskLevel: 'Low',
      season: 'Kharif',
    },
  });

  // Weather Alert
  await prisma.weatherAlert.create({
    data: {
      farmId: farm1.id,
      temperature: 32.5,
      humidity: 78,
      rainfall: 1.2,
      windSpeed: 14,
      advisory: 'Moderate humidity. Ideal time to apply bio-fertilizers. Light watering is recommended in case rain does not manifest in 24 hours.',
    },
  });

  // Disease Report
  const diseaseReport = await prisma.diseaseReport.create({
    data: {
      farmId: farm1.id,
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
      diseaseName: 'Cotton Leaf Curl Virus',
      confidenceScore: 0.74,
      severity: Severity.HIGH,
      treatment: 'Uproot and destroy infected plants. Spray insecticides like Imidacloprid to control whiteflies which transmit the virus.',
      suggestedFertilizer: 'Increase potash application (MOP) to improve resistance.',
      suggestedPesticide: 'Imidacloprid 17.8% SL',
      expertEscalationRequired: true,
    },
  });

  // Expert Ticket
  await prisma.ticket.create({
    data: {
      farmerId: farmer.id,
      expertId: expert.id,
      diseaseReportId: diseaseReport.id,
      title: 'Severe Leaf Curling in Cotton Field',
      description: 'The cotton leaves are curling upwards and showing yellow veins. Spread is fast across the north sector of the farm.',
      status: TicketStatus.OPEN,
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
