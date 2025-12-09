const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/stories - Lista storie attive
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    // Raggruppa storie per utente
    const stories = await prisma.story.findMany({
      where: {
        is_active: true,
        expires_at: { gt: now }
      },
      orderBy: { created_at: 'desc' },
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
            stage_name: true,
            city: { select: { name: true } }
          }
        }
      }
    });

    // Raggruppa per utente
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.json({ 
      success: true, 
      data: Object.values(groupedStories) 
    });
  } catch (error) {
    console.error('Errore fetch storie:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/stories/user/:userId - Storie di un utente
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const stories = await prisma.story.findMany({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: { gt: now }
      },
      orderBy: { created_at: 'asc' },
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

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error('Errore storie utente:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/stories - Crea storia
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, media_url, thumbnail_url, duration, announcement_id } = req.body;

    if (!type || !media_url) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo e media_url richiesti' 
      });
    }

    // Scadenza 24h
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        user_id: userId,
        announcement_id,
        type,
        media_url,
        thumbnail_url,
        duration: duration || (type === 'image' ? 5 : 15),
        expires_at
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar_url: true }
        }
      }
    });

    res.json({ success: true, data: story });
  } catch (error) {
    console.error('Errore creazione storia:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/stories/:id/view - Registra visualizzazione
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const sessionId = req.body.session_id;

    // Evita duplicati
    if (userId) {
      const existing = await prisma.storyView.findUnique({
        where: {
          story_id_user_id: { story_id: id, user_id: userId }
        }
      });

      if (!existing) {
        await prisma.storyView.create({
          data: { story_id: id, user_id: userId }
        });

        await prisma.story.update({
          where: { id },
          data: { views_count: { increment: 1 } }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Errore view storia:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/stories/:id - Elimina storia
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await prisma.story.findUnique({
      where: { id }
    });

    if (!story || story.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Non autorizzato' });
    }

    await prisma.story.delete({ where: { id } });

    res.json({ success: true, message: 'Storia eliminata' });
  } catch (error) {
    console.error('Errore eliminazione storia:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

