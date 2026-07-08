import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../config/db';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { AIService } from '../services/gemini';
import { triggerN8NWebhook } from '../services/n8n';
import { Severity } from '@prisma/client';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// DETECT DISEASE FROM IMAGE UPLOAD
router.post('/detect', authenticateJWT, upload.single('image'), async (req: AuthRequest, res: any) => {
  try {
    const { farmId } = req.body;
    if (!farmId) {
      return res.status(400).json({ error: 'farmId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Crop image file is required' });
    }

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Convert file to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Detect disease using Gemini Vision
    const detection = await AIService.diagnoseCropDisease(base64Image, mimeType);

    // Save report to database
    // Handle mock url or save local reference (in production upload to Cloudinary/S3)
    const mockImageUrl = `data:${mimeType};base64,${base64Image.substring(0, 100)}...`; // abbreviated for DB storage convenience

    // Map severity string to Prisma Enum
    let severityEnum: Severity = Severity.MEDIUM;
    if (detection.severity === 'LOW') severityEnum = Severity.LOW;
    if (detection.severity === 'HIGH') severityEnum = Severity.HIGH;

    const report = await prisma.diseaseReport.create({
      data: {
        farmId,
        imageUrl: mockImageUrl,
        diseaseName: detection.diseaseName,
        confidenceScore: detection.confidenceScore,
        severity: severityEnum,
        treatment: detection.treatment,
        suggestedFertilizer: detection.suggestedFertilizer,
        suggestedPesticide: detection.suggestedPesticide,
        expertEscalationRequired: detection.expertEscalationRequired || detection.confidenceScore < 0.8,
      },
    });

    // Auto escalate if confidence < 80% or if explicitly requested by AI
    let ticket = null;
    if (report.expertEscalationRequired) {
      // Find a random/first expert
      const expert = await prisma.user.findFirst({
        where: { role: 'EXPERT' },
      });

      ticket = await prisma.ticket.create({
        data: {
          farmerId: req.user!.id,
          expertId: expert?.id || null,
          diseaseReportId: report.id,
          title: `Disease Escalation: ${report.diseaseName}`,
          description: `AI disease detection confidence is low (${Math.round(report.confidenceScore * 100)}%). Manual inspection is required. Treatment recommendation: ${report.treatment}`,
        },
      });

      // Notify Expert via n8n
      await triggerN8NWebhook('ExpertEscalation', {
        ticketId: ticket.id,
        farmerName: req.user!.name,
        diseaseName: report.diseaseName,
        severity: report.severity,
        expertEmail: expert?.email,
      });
    }

    res.status(201).json({ report, ticketEscalated: !!ticket, ticket });
  } catch (error: any) {
    console.error('Disease detection route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET DISEASE REPORTS FOR FARM
router.get('/farm/:farmId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    const reports = await prisma.diseaseReport.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
