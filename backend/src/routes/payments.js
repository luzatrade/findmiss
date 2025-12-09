const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/payments/history - Get user payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          announcement: {
            select: { id: true, title: true, stage_name: true }
          }
        }
      }),
      prisma.payment.count({ where: { user_id: req.user.id } })
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/payments/:id - Get payment details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { id: parseInt(id), user_id: req.user.id },
      include: {
        announcement: {
          select: { id: true, title: true, stage_name: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pagamento non trovato' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;
