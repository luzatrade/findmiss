const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Salva/aggiorna sessione utente (città, categoria, filtri)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { session_id, city_id, category_id, filters } = req.body;
    const userId = req.user?.id;

    // Genera session_id se non fornito
    const finalSessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sessionData = {
      session_id: finalSessionId,
      selected_city_id: city_id || null,
      selected_category_id: category_id || null,
      filters: filters ? JSON.stringify(filters) : null,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
    };

    if (userId) {
      sessionData.user_id = userId;
    }

    const session = await prisma.userSession.upsert({
      where: { session_id: finalSessionId },
      update: sessionData,
      create: sessionData
    });

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Errore salvataggio sessione:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET sessione
router.get('/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;

    const session = await prisma.userSession.findUnique({
      where: { session_id },
      include: {
        city: true
      }
    });

    if (!session) {
      return res.json({ success: true, data: null });
    }

    const data = {
      ...session,
      filters: session.filters ? JSON.parse(session.filters) : null
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Errore fetch sessione:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;





