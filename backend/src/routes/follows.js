const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/follows/:userId - Segui utente
router.post('/:userId', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    if (followerId === followingId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Non puoi seguire te stesso' 
      });
    }

    // Verifica se già seguito
    const existing = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Stai già seguendo questo utente' 
      });
    }

    await prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId
      }
    });

    // Aggiorna contatori
    await prisma.user.update({
      where: { id: followerId },
      data: { following_count: { increment: 1 } }
    });

    await prisma.user.update({
      where: { id: followingId },
      data: { followers_count: { increment: 1 } }
    });

    res.json({ success: true, message: 'Ora segui questo utente' });
  } catch (error) {
    console.error('Errore follow:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/follows/:userId - Smetti di seguire
router.delete('/:userId', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    const existing = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (!existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Non segui questo utente' 
      });
    }

    await prisma.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    // Aggiorna contatori
    await prisma.user.update({
      where: { id: followerId },
      data: { following_count: { decrement: 1 } }
    });

    await prisma.user.update({
      where: { id: followingId },
      data: { followers_count: { decrement: 1 } }
    });

    res.json({ success: true, message: 'Non segui più questo utente' });
  } catch (error) {
    console.error('Errore unfollow:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/follows/:userId/followers - Lista followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const followers = await prisma.follow.findMany({
      where: { following_id: userId },
      skip,
      take: parseInt(limit),
      include: {
        follower: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
            is_verified: true
          }
        }
      }
    });

    // Nota: 'follower' non esiste come relazione, dobbiamo fare query separata
    const followerIds = followers.map(f => f.follower_id);
    const users = await prisma.user.findMany({
      where: { id: { in: followerIds } },
      select: {
        id: true,
        nickname: true,
        avatar_url: true,
        is_verified: true
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Errore lista followers:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/follows/:userId/following - Lista following
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const following = await prisma.follow.findMany({
      where: { follower_id: userId },
      skip,
      take: parseInt(limit)
    });

    const followingIds = following.map(f => f.following_id);
    const users = await prisma.user.findMany({
      where: { id: { in: followingIds } },
      select: {
        id: true,
        nickname: true,
        avatar_url: true,
        is_verified: true
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Errore lista following:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/follows/:userId/check - Verifica se segui
router.get('/:userId/check', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    const existing = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    res.json({ success: true, data: { isFollowing: !!existing } });
  } catch (error) {
    console.error('Errore check follow:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

