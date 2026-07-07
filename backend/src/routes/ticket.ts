import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { TicketStatus } from '@prisma/client';

const router = Router();

// GET ALL TICKETS FOR LOGGED-IN FARMER OR EXPERT
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let tickets;
    if (role === 'EXPERT') {
      tickets = await prisma.ticket.findMany({
        where: { OR: [{ expertId: userId }, { expertId: null }] },
        include: {
          farmer: { select: { name: true, phone: true, email: true, language: true } },
          diseaseReport: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'ADMIN') {
      tickets = await prisma.ticket.findMany({
        include: {
          farmer: { select: { name: true, phone: true } },
          expert: { select: { name: true } },
          diseaseReport: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Farmer tickets
      tickets = await prisma.ticket.findMany({
        where: { farmerId: userId },
        include: {
          expert: { select: { name: true, phone: true, email: true } },
          diseaseReport: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// RESOLVE TICKET (EXPERTS ONLY)
router.post('/:id/resolve', authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!resolutionNotes) {
      return res.status(400).json({ error: 'Resolution notes are required' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.RESOLVED,
        resolutionNotes,
        expertId: req.user!.id, // claim the ticket if not claimed already
      },
    });

    res.json(updatedTicket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
