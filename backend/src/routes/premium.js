const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function serializeMetadata(payload) {
  try {
    return JSON.stringify(payload || {});
  } catch (_) {
    return null;
  }
}

function resolvePremiumLevel(plan) {
  const name = String(plan?.name || '').toLowerCase();
  const dailyExits = Number(plan?.daily_exits || 0);
  const price = Number(plan?.price || 0);

  if (name.includes('vip') || dailyExits >= 8 || price >= 150) return 'vip';
  if (name.includes('premium') || name.includes('mensile') || dailyExits >= 4 || price >= 30) return 'premium';
  return 'basic';
}

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

    if (!plan_id || !announcement_id) {
      return res.status(400).json({
        success: false,
        error: 'plan_id e announcement_id sono richiesti'
      });
    }

    const plan = await prisma.premiumPlan.findUnique({
      where: { id: plan_id }
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Piano non trovato' });
    }

    const announcement = await prisma.announcement.findFirst({
      where: { id: announcement_id, user_id: req.user.id }
    });

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    const planDurationDays = Number.parseInt(plan.duration, 10) || 30;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + planDurationDays);
    const premiumLevel = resolvePremiumLevel(plan);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        announcement_id,
        amount: plan.price,
        currency: plan.currency || 'EUR',
        payment_type: 'premium_plan',
        status: 'pending',
        metadata: serializeMetadata({
          plan_id: plan.id,
          plan_name: plan.name,
          announcement_id,
          plan_type: plan.plan_type,
          duration_days: planDurationDays
        })
      }
    });

    // In production, integrate with payment gateway here
    // For now, auto-complete the payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        completed_at: now
      }
    });

    await prisma.announcement.update({
      where: { id: announcement_id },
      data: {
        premium_level: premiumLevel,
        plan_type: plan.plan_type,
        daily_exits: plan.daily_exits || 0,
        daily_exits_used: 0,
        plan_start_date: now,
        plan_end_date: expiresAt
      }
    });

    res.json({ 
      success: true, 
      data: { 
        payment_id: payment.id,
        announcement_id,
        premium_level: premiumLevel,
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

    if (!announcement_id) {
      return res.status(400).json({ success: false, error: 'announcement_id richiesto' });
    }

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
    const now = new Date();
    const boostExpiresAt = new Date(now);
    boostExpiresAt.setHours(boostExpiresAt.getHours() + durationHours);
    const isTopPageBoost = boost_type === 'weekly';

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        announcement_id,
        amount: price,
        payment_type: 'top_page_boost',
        status: 'completed',
        completed_at: now,
        metadata: serializeMetadata({
          boost_type,
          duration_hours: durationHours,
          announcement_id,
          top_page_boost: isTopPageBoost
        })
      }
    });

    // Update announcement
    await prisma.announcement.update({
      where: { id: announcement_id },
      data: {
        boost_active: true,
        ...(isTopPageBoost ? { top_page_boost: true, top_page_expires_at: boostExpiresAt } : {}),
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
