const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/premium-plans - Get all premium plans
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.premiumPlan.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });

    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching premium plans:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/boost-options - Get all boost options
router.get('/boosts', async (req, res) => {
  try {
    // Return static boost options for now
    const boosts = [
      {
        id: 1,
        name: 'Boost 24h',
        description: 'Aumenta la visibilità del tuo annuncio per 24 ore',
        price: 9.99,
        duration_hours: 24,
        multiplier: 2,
        icon: '⚡'
      },
      {
        id: 2,
        name: 'Boost Settimanale',
        description: 'Posizionamento premium per 7 giorni',
        price: 29.99,
        duration_hours: 168,
        multiplier: 3,
        icon: '🚀'
      },
      {
        id: 3,
        name: 'Highlight',
        description: 'Bordo colorato e badge speciale',
        price: 4.99,
        duration_hours: 72,
        multiplier: 1.5,
        icon: '✨'
      }
    ];

    res.json({ success: true, data: boosts });
  } catch (error) {
    console.error('Error fetching boost options:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/premium-plans/subscribe - Subscribe to a plan
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { plan_id, announcement_id } = req.body;

    const plan = await prisma.premiumPlan.findUnique({
      where: { id: plan_id }
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Piano non trovato' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        announcement_id: announcement_id || null,
        amount: plan.price,
        payment_type: 'premium',
        status: 'pending',
        metadata: { plan_id: plan.id, plan_name: plan.name }
      }
    });

    // In production, integrate with payment gateway here
    // For now, auto-complete the payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'completed' }
    });

    // Update user premium status
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        premium_level: plan.slug,
        premium_expires_at: expiresAt
      }
    });

    res.json({ 
      success: true, 
      data: { 
        payment_id: payment.id,
        expires_at: expiresAt
      } 
    });
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/premium-plans/boost - Apply boost to announcement
router.post('/boost', authenticate, async (req, res) => {
  try {
    const { announcement_id, boost_type } = req.body;

    const announcement = await prisma.announcement.findFirst({
      where: { id: announcement_id, user_id: req.user.id }
    });

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    const boostPrices = { '24h': 9.99, 'weekly': 29.99, 'highlight': 4.99 };
    const boostDurations = { '24h': 24, 'weekly': 168, 'highlight': 72 };

    const price = boostPrices[boost_type] || 9.99;
    const durationHours = boostDurations[boost_type] || 24;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        announcement_id,
        amount: price,
        payment_type: 'boost',
        status: 'completed',
        metadata: { boost_type }
      }
    });

    // Update announcement
    const boostExpiresAt = new Date();
    boostExpiresAt.setHours(boostExpiresAt.getHours() + durationHours);

    await prisma.announcement.update({
      where: { id: announcement_id },
      data: {
        is_boosted: true,
        boost_expires_at: boostExpiresAt
      }
    });

    res.json({ 
      success: true, 
      data: { 
        payment_id: payment.id,
        boost_expires_at: boostExpiresAt
      } 
    });
  } catch (error) {
    console.error('Error applying boost:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

