const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Genera stream key unico
const generateStreamKey = () => {
  return `live_${crypto.randomBytes(16).toString('hex')}`;
};

// GET /api/live - Lista live attive
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status = 'live', category, city, limit = 20 } = req.query;

    const where = {
      status: status === 'all' ? undefined : status
    };

    const liveStreams = await prisma.liveStream.findMany({
      where,
      take: parseInt(limit),
      orderBy: [
        { viewers_count: 'desc' },
        { started_at: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
            is_verified: true
          }
        },
        announcement: {
          select: {
            id: true,
            title: true,
            stage_name: true,
            city: { select: { name: true } },
            category: { select: { name: true } }
          }
        }
      }
    });

    res.json({ success: true, data: liveStreams });
  } catch (error) {
    console.error('Errore fetch live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/live/featured - Live in evidenza (per homepage)
router.get('/featured', async (req, res) => {
  try {
    const liveStreams = await prisma.liveStream.findMany({
      where: { status: 'live' },
      take: 6,
      orderBy: [
        { is_premium: 'desc' },
        { viewers_count: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
            is_verified: true
          }
        }
      }
    });

    res.json({ success: true, data: liveStreams });
  } catch (error) {
    console.error('Errore fetch live featured:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/live/:id - Dettaglio live
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const liveStream = await prisma.liveStream.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
            is_verified: true,
            followers_count: true
          }
        },
        announcement: {
          include: {
            city: true,
            category: true,
            media: { take: 1 }
          }
        },
        messages: {
          take: 50,
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!liveStream) {
      return res.status(404).json({ success: false, error: 'Live non trovata' });
    }

    // Incrementa views
    await prisma.liveStream.update({
      where: { id },
      data: { total_views: { increment: 1 } }
    });

    res.json({ success: true, data: liveStream });
  } catch (error) {
    console.error('Errore dettaglio live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/live - Crea nuova live
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, announcement_id, is_private, is_premium, price_per_minute, scheduled_at } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Titolo richiesto' });
    }

    // Verifica se l'utente ha già una live attiva
    const existingLive = await prisma.liveStream.findFirst({
      where: {
        user_id: userId,
        status: { in: ['scheduled', 'live'] }
      }
    });

    if (existingLive) {
      return res.status(400).json({ 
        success: false, 
        error: 'Hai già una live attiva o programmata' 
      });
    }

    const streamKey = generateStreamKey();

    const liveStream = await prisma.liveStream.create({
      data: {
        user_id: userId,
        announcement_id,
        title,
        description,
        stream_key: streamKey,
        is_private: is_private || false,
        is_premium: is_premium || false,
        price_per_minute: price_per_minute || null,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        status: scheduled_at ? 'scheduled' : 'live',
        started_at: scheduled_at ? null : new Date()
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar_url: true }
        }
      }
    });

    res.json({ 
      success: true, 
      data: {
        ...liveStream,
        stream_key: streamKey, // Mostra solo al creatore
        rtmp_url: process.env.RTMP_SERVER_URL || 'rtmp://localhost/live'
      }
    });
  } catch (error) {
    console.error('Errore creazione live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/live/:id/start - Avvia live
router.put('/:id/start', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const liveStream = await prisma.liveStream.findUnique({
      where: { id }
    });

    if (!liveStream || liveStream.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Non autorizzato' });
    }

    const updated = await prisma.liveStream.update({
      where: { id },
      data: {
        status: 'live',
        started_at: new Date()
      }
    });

    // Notifica followers
    const io = req.app.get('io');
    if (io) {
      io.emit('live:started', {
        stream_id: id,
        user_id: userId,
        title: liveStream.title
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Errore avvio live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/live/:id/end - Termina live
router.put('/:id/end', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const liveStream = await prisma.liveStream.findUnique({
      where: { id }
    });

    if (!liveStream || liveStream.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Non autorizzato' });
    }

    const duration = liveStream.started_at 
      ? Math.floor((new Date() - new Date(liveStream.started_at)) / 1000)
      : 0;

    const updated = await prisma.liveStream.update({
      where: { id },
      data: {
        status: 'ended',
        ended_at: new Date(),
        duration
      }
    });

    // Notifica fine live
    const io = req.app.get('io');
    if (io) {
      io.to(`live:${id}`).emit('live:ended', { stream_id: id });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Errore fine live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/live/:id/join - Entra nella live
router.post('/:id/join', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const sessionId = req.body.session_id || crypto.randomUUID();

    const liveStream = await prisma.liveStream.findUnique({
      where: { id }
    });

    if (!liveStream || liveStream.status !== 'live') {
      return res.status(404).json({ success: false, error: 'Live non disponibile' });
    }

    // Registra viewer
    await prisma.liveViewer.create({
      data: {
        stream_id: id,
        user_id: userId || null,
        session_id: !userId ? sessionId : null
      }
    });

    // Incrementa viewers
    await prisma.liveStream.update({
      where: { id },
      data: { 
        viewers_count: { increment: 1 },
        peak_viewers: {
          set: Math.max(liveStream.peak_viewers, liveStream.viewers_count + 1)
        }
      }
    });

    // Notifica nuovo viewer
    const io = req.app.get('io');
    if (io) {
      io.to(`live:${id}`).emit('live:viewer_joined', {
        viewers_count: liveStream.viewers_count + 1
      });
    }

    res.json({ 
      success: true, 
      data: {
        playback_url: liveStream.playback_url,
        viewers_count: liveStream.viewers_count + 1
      }
    });
  } catch (error) {
    console.error('Errore join live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/live/:id/leave - Esci dalla live
router.post('/:id/leave', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.liveStream.update({
      where: { id },
      data: { viewers_count: { decrement: 1 } }
    });

    const io = req.app.get('io');
    if (io) {
      const liveStream = await prisma.liveStream.findUnique({ where: { id } });
      io.to(`live:${id}`).emit('live:viewer_left', {
        viewers_count: Math.max(0, liveStream?.viewers_count || 0)
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Errore leave live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/live/:id/message - Invia messaggio in live chat
router.post('/:id/message', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, nickname } = req.body;
    const userId = req.user?.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Messaggio vuoto' });
    }

    const message = await prisma.liveMessage.create({
      data: {
        stream_id: id,
        user_id: userId || null,
        nickname: nickname || (req.user?.nickname || 'Anonimo'),
        content: content.trim(),
        type: 'text'
      }
    });

    // Broadcast messaggio
    const io = req.app.get('io');
    if (io) {
      io.to(`live:${id}`).emit('live:message', message);
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Errore messaggio live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/live/:id/tip - Invia tip
router.post('/:id/tip', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, message, is_public = true } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, error: 'Importo non valido' });
    }

    const tip = await prisma.liveTip.create({
      data: {
        stream_id: id,
        user_id: userId,
        amount,
        message,
        is_public
      }
    });

    // Aggiorna totale tips
    await prisma.liveStream.update({
      where: { id },
      data: { tips_total: { increment: amount } }
    });

    // Notifica tip
    const io = req.app.get('io');
    if (io && is_public) {
      io.to(`live:${id}`).emit('live:tip', {
        user: req.user.nickname || 'Utente',
        amount,
        message
      });
    }

    res.json({ success: true, data: tip });
  } catch (error) {
    console.error('Errore tip:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/live/:id/like - Metti like alla live
router.post('/:id/like', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.liveStream.update({
      where: { id },
      data: { likes_count: { increment: 1 } }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`live:${id}`).emit('live:like');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Errore like live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/live/:id/messages - Storico messaggi
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const messages = await prisma.liveMessage.findMany({
      where: { stream_id: id },
      take: parseInt(limit),
      orderBy: { created_at: 'asc' }
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Errore messaggi live:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

