const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nickname: true,
        phone: true,
        role: true,
        avatar_url: true,
        bio: true,
        is_verified: true,
        created_at: true,
        _count: {
          select: {
            announcements: true,
            reviews_given: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { nickname, email, phone, bio } = req.body;

    // Check if email is taken
    if (email && email !== req.user.email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: req.user.id } }
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email già in uso' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(nickname && { nickname }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        phone: true,
        role: true,
        avatar_url: true,
        bio: true,
      }
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/users/password - Change password
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Password mancanti' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'La password deve avere almeno 6 caratteri' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Password attuale non corretta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password_hash: hashedPassword }
    });

    res.json({ success: true, message: 'Password aggiornata' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/users/:id - Get public user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nickname: true,
        avatar_url: true,
        bio: true,
        is_verified: true,
        created_at: true,
        _count: {
          select: {
            announcements: { where: { status: 'active' } },
            reviews_given: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

