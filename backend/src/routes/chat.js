const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/chat/conversations - Lista conversazioni
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1_id: userId },
          { user2_id: userId }
        ]
      },
      include: {
        user1: {
          select: { id: true, nickname: true, email: true }
        },
        user2: {
          select: { id: true, nickname: true, email: true }
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            protected_media: true
          }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    const formatted = conversations.map(conv => {
      const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0] || null;
      
      return {
        id: conv.id,
        other_user: otherUser,
        last_message: lastMessage,
        unread_count: 0, // Calcolare separatamente
        updated_at: conv.updated_at
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Errore fetch conversazioni:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/chat/conversations/:id/messages - Messaggi conversazione
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user1: true,
        user2: true
      }
    });

    if (!conversation || (conversation.user1_id !== userId && conversation.user2_id !== userId)) {
      return res.status(403).json({ success: false, error: 'Conversazione non trovata' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await prisma.message.findMany({
      where: { conversation_id: id },
      include: {
        sender: { select: { id: true, nickname: true } },
        receiver: { select: { id: true, nickname: true } },
        protected_media: true
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: parseInt(limit)
    });

    // Segna come letti
    await prisma.message.updateMany({
      where: {
        conversation_id: id,
        receiver_id: userId,
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    console.error('Errore fetch messaggi:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/chat/conversations/:id/messages - Invia messaggio
router.post('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, message_type = 'text', protected_media } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user1: true,
        user2: true
      }
    });

    if (!conversation || (conversation.user1_id !== userId && conversation.user2_id !== userId)) {
      return res.status(403).json({ success: false, error: 'Conversazione non trovata' });
    }

    const receiverId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;

    const message = await prisma.message.create({
      data: {
        conversation_id: id,
        sender_id: userId,
        receiver_id: receiverId,
        content,
        message_type
      },
      include: {
        sender: { select: { id: true, nickname: true } },
        receiver: { select: { id: true, nickname: true } }
      }
    });

    // Crea media protetto se presente
    if (protected_media && message_type !== 'text') {
      await prisma.protectedMedia.create({
        data: {
          message_id: message.id,
          media_url: protected_media.media_url,
          thumbnail_url: protected_media.thumbnail_url,
          type: protected_media.type || message_type,
          is_protected: protected_media.is_protected !== false,
          view_once: protected_media.view_once || false,
          expires_at: protected_media.expires_at ? new Date(protected_media.expires_at) : null,
          max_views: protected_media.max_views || 1,
          screenshot_block: protected_media.screenshot_block !== false
        }
      });
    }

    // Aggiorna updated_at conversazione
    await prisma.conversation.update({
      where: { id },
      data: { updated_at: new Date() }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Errore invio messaggio:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/chat/protected-media/:id - Visualizza media protetto
router.get('/protected-media/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const protectedMedia = await prisma.protectedMedia.findUnique({
      where: { id },
      include: {
        message: {
          include: {
            sender: true,
            receiver: true
          }
        }
      }
    });

    if (!protectedMedia) {
      return res.status(404).json({ success: false, error: 'Media non trovato' });
    }

    // Verifica permessi
    const isReceiver = protectedMedia.message.receiver_id === userId;
    const isSender = protectedMedia.message.sender_id === userId;
    
    if (!isReceiver && !isSender) {
      return res.status(403).json({ success: false, error: 'Accesso negato' });
    }

    // Verifica view limit
    if (protectedMedia.view_count >= protectedMedia.max_views) {
      return res.status(403).json({ success: false, error: 'Limite visualizzazioni raggiunto' });
    }

    // Verifica scadenza
    if (protectedMedia.expires_at && new Date(protectedMedia.expires_at) < new Date()) {
      return res.status(403).json({ success: false, error: 'Media scaduto' });
    }

    // Incrementa view count
    await prisma.protectedMedia.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    });

    // Se view_once e già visualizzato, elimina
    if (protectedMedia.view_once && protectedMedia.view_count > 0) {
      await prisma.protectedMedia.delete({ where: { id } });
    }

    res.json({
      success: true,
      data: {
        media_url: protectedMedia.media_url,
        thumbnail_url: protectedMedia.thumbnail_url,
        type: protectedMedia.type,
        is_protected: protectedMedia.is_protected,
        screenshot_block: protectedMedia.screenshot_block,
        view_count: protectedMedia.view_count + 1,
        max_views: protectedMedia.max_views
      }
    });
  } catch (error) {
    console.error('Errore visualizzazione media:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;





