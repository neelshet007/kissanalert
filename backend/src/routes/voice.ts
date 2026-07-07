import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { processVoiceQuery } from '../services/gemini';

const router = Router();

router.post('/query', authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    const { farmId, transcription, language } = req.body;

    if (!farmId || !transcription) {
      return res.status(400).json({ error: 'farmId and transcription are required' });
    }

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Call Gemini voice assistant processor
    const aiResponse = await processVoiceQuery(transcription, language || 'en');

    // Create database entry for VoiceMessage
    const voiceMessage = await prisma.voiceMessage.create({
      data: {
        farmId,
        audioUrl: 'mock-audio-recording.wav',
        transcription,
        aiResponseText: aiResponse.translatedResponse || aiResponse.englishResponse,
      },
    });

    res.status(201).json(voiceMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET PAST VOICE MESSAGES FOR FARM
router.get('/farm/:farmId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    const voiceMessages = await prisma.voiceMessage.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(voiceMessages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
