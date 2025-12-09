const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware admin (per ora permetti a tutti per testing)
const requireAdmin = async (req, res, next) => {
  // In produzione: if (!req.user || req.user.role !== 'admin')
  next();
};

// ==========================================
// ENDPOINT TEMPORANEO: Crea Admin (da rimuovere dopo uso)
// ==========================================

// POST /api/admin/create-admin - Crea account admin (TEMPORANEO - rimuovere dopo uso)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e password richieste' 
      });
    }

    // Verifica se esiste già
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const finalNickname = nickname || 'Admin';

    if (existing) {
      // Aggiorna account esistente
      await prisma.user.update({
        where: { email },
        data: {
          password_hash: passwordHash,
          role: 'admin',
          is_verified: true,
          is_active: true,
          nickname: finalNickname
        }
      });
      
      return res.json({ 
        success: true, 
        message: 'Account aggiornato a admin',
        data: { email, nickname: finalNickname }
      });
    } else {
      // Crea nuovo account
      const user = await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          nickname: finalNickname,
          role: 'admin',
          is_verified: true,
          is_active: true
        }
      });
      
      return res.json({ 
        success: true, 
        message: 'Account admin creato con successo',
        data: { email, nickname: finalNickname }
      });
    }
  } catch (error) {
    console.error('Errore creazione admin:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==========================================
// STATISTICHE
// ==========================================

// GET /api/admin/stats - Statistiche generali
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [
      totalAnnouncements,
      totalUsers,
      activeAnnouncements,
      pendingAnnouncements,
      totalPayments
    ] = await Promise.all([
      prisma.announcement.count(),
      prisma.user.count(),
      prisma.announcement.count({ where: { status: 'active' } }),
      prisma.announcement.count({ where: { status: 'pending' } }),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);

    res.json({
      success: true,
      data: {
        totalAnnouncements,
        totalUsers,
        activeAnnouncements,
        pendingAnnouncements,
        totalRevenue: totalPayments._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Errore stats:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// ==========================================
// PIANI PREMIUM
// ==========================================

// GET /api/admin/plans - Lista piani
router.get('/plans', authenticate, requireAdmin, async (req, res) => {
  try {
    const plans = await prisma.premiumPlan.findMany({
      orderBy: { price: 'asc' }
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/admin/plans - Crea piano
router.post('/plans', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, price, duration_days, features, is_active } = req.body;
    
    const plan = await prisma.premiumPlan.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        price: parseFloat(price) || 0,
        duration_days: parseInt(duration_days) || 30,
        features: features || [],
        is_active: is_active !== false
      }
    });
    
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Errore creazione piano:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/admin/plans/:id - Modifica piano
router.put('/plans/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration_days, features, is_active } = req.body;
    
    const plan = await prisma.premiumPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration_days && { duration_days: parseInt(duration_days) }),
        ...(features && { features }),
        ...(is_active !== undefined && { is_active })
      }
    });
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/admin/plans/:id - Elimina piano
router.delete('/plans/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.premiumPlan.delete({ where: { id } });
    res.json({ success: true, message: 'Piano eliminato' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// ==========================================
// CODICI SCONTO
// ==========================================

// GET /api/admin/discount-codes - Lista codici
router.get('/discount-codes', authenticate, requireAdmin, async (req, res) => {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: codes });
  } catch (error) {
    // Se tabella non esiste, ritorna array vuoto
    res.json({ success: true, data: [] });
  }
});

// POST /api/admin/discount-codes - Crea codice
router.post('/discount-codes', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code, discount_percent, discount_amount, max_uses, expires_at, applies_to } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, error: 'Codice richiesto' });
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        discount_percent: discount_percent ? parseInt(discount_percent) : null,
        discount_amount: discount_amount ? parseFloat(discount_amount) : null,
        max_uses: max_uses ? parseInt(max_uses) : null,
        used_count: 0,
        expires_at: expires_at ? new Date(expires_at) : null,
        applies_to: applies_to || 'all', // all, premium, boost
        is_active: true
      }
    });
    
    res.json({ success: true, data: discountCode });
  } catch (error) {
    console.error('Errore creazione codice:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Codice già esistente' });
    }
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/admin/discount-codes/:id - Modifica codice
router.put('/discount-codes/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, max_uses, expires_at } = req.body;
    
    const code = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(is_active !== undefined && { is_active }),
        ...(max_uses !== undefined && { max_uses: parseInt(max_uses) }),
        ...(expires_at !== undefined && { expires_at: expires_at ? new Date(expires_at) : null })
      }
    });
    
    res.json({ success: true, data: code });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/admin/discount-codes/:id - Elimina codice
router.delete('/discount-codes/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.discountCode.delete({ where: { id } });
    res.json({ success: true, message: 'Codice eliminato' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/admin/discount-codes/validate - Valida codice (per frontend)
router.post('/discount-codes/validate', async (req, res) => {
  try {
    const { code, type } = req.body; // type: premium, boost
    
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code: code.toUpperCase(),
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } }
        ],
        OR: [
          { applies_to: 'all' },
          { applies_to: type }
        ]
      }
    });
    
    if (!discountCode) {
      return res.status(404).json({ success: false, error: 'Codice non valido o scaduto' });
    }
    
    if (discountCode.max_uses && discountCode.used_count >= discountCode.max_uses) {
      return res.status(400).json({ success: false, error: 'Codice esaurito' });
    }
    
    res.json({
      success: true,
      data: {
        discount_percent: discountCode.discount_percent,
        discount_amount: discountCode.discount_amount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// ==========================================
// GESTIONE ANNUNCI
// ==========================================

// GET /api/admin/announcements - Lista tutti gli annunci
router.get('/announcements', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = status ? { status } : {};
    
    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, email: true, nickname: true } },
          city: { select: { name: true } },
          category: { select: { name: true } },
          media: { take: 1 }
        }
      }),
      prisma.announcement.count({ where })
    ]);
    
    res.json({
      success: true,
      data: announcements,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/admin/announcements/:id/verify - Verifica annuncio
router.put('/announcements/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { is_verified: is_verified !== false }
    });
    
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/admin/announcements/:id/vip - Imposta VIP
router.put('/announcements/:id/vip', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_vip } = req.body;
    
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { is_vip: is_vip !== false }
    });
    
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// ==========================================
// GESTIONE UTENTI
// ==========================================

// GET /api/admin/users - Lista utenti
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = role ? { role } : {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
          is_active: true,
          is_verified: true,
          created_at: true,
          _count: { select: { announcements: true } }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/admin/users/:id/role - Cambia ruolo utente
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'advertiser', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Ruolo non valido' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/admin/users/:id/ban - Banna/sbanna utente
router.put('/users/:id/ban', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { is_active: is_active !== false }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;
