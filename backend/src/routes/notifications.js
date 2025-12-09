const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications - Lista notifiche utente
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.notification.count({ where: { user_id: userId } })
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Errore fetch notifiche:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/notifications/unread-count - Conta notifiche non lette
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Errore conteggio notifiche:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/notifications/:id/read - Segna notifica come letta
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Notifica non trovata' });
    }

    await prisma.notification.update({
      where: { id },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Errore marcatura notifica:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/notifications/read-all - Segna tutte come lette
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Errore marcatura notifiche:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/notifications/:id - Elimina notifica
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Notifica non trovata' });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Errore eliminazione notifica:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/notifications - Crea notifica (uso interno/admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const { user_id, type, title, message, data } = req.body;

    // Solo admin può creare notifiche per altri utenti
    if (user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accesso negato' });
    }

    const notification = await prisma.notification.create({
      data: {
        user_id: user_id || req.user.id,
        type: type || 'system',
        title: title || 'Notifica',
        message: message || '',
        data: data ? JSON.stringify(data) : null
      }
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Errore creazione notifica:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

