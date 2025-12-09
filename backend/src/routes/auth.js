const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validateAuthInput, sanitizeInput } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Registrazione (anonima, solo email e password)
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    // Sanitize input
    const sanitizedData = {
      email: sanitizeInput(email),
      password: password, // Don't sanitize password
      nickname: nickname ? sanitizeInput(nickname) : null
    };

    // Validate input
    const validationErrors = validateAuthInput(sanitizedData, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    // Verifica se email esiste già
    const existingUser = await prisma.user.findUnique({ where: { email: sanitizedData.email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email già registrata' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(sanitizedData.password, 12);

    // Crea utente
    const user = await prisma.user.create({
      data: {
        email: sanitizedData.email,
        password_hash,
        role: 'user',
        is_active: true,
        is_verified: false
      },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true
      }
    });

    // Genera token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

    // Salva refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email e password richiesti' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenziali non valide' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account disattivato' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Credenziali non valide' });
    }

    // Aggiorna last_login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Genera token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

    // Salva refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token richiesto' });
    }

    const tokenData = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenData || tokenData.expires_at < new Date()) {
      return res.status(401).json({ success: false, error: 'Token non valido' });
    }

    const newToken = jwt.sign(
      { userId: tokenData.user_id, email: tokenData.user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    console.error('Errore refresh token:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;





