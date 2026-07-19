const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validateAuthInput, sanitizeInput } = require('../middleware/validation');
const {
  issueAuthTokens,
  createTwoFactorChallenge,
  verifyTwoFactorChallenge,
} = require('../services/authTokens');
const { verifyTotpCode } = require('../services/totp');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Registrazione (anonima, solo email e password)
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, role } = req.body;
    
    // Sanitize input
    const normalizedRole = ['user', 'advertiser'].includes(role) ? role : 'user';

    const sanitizedData = {
      email: sanitizeInput(email),
      password: password, // Don't sanitize password
      nickname: nickname ? sanitizeInput(nickname) : null,
      role: normalizedRole
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
        nickname: sanitizedData.nickname,
        role: sanitizedData.role,
        is_active: true,
        is_verified: false
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        created_at: true
      }
    });

    // Genera token
    const authData = await issueAuthTokens(user);

    res.json({
      success: true,
      data: authData,
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

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    if (user.role === 'admin' && user.totp_enabled && user.totp_secret) {
      return res.json({
        success: true,
        data: {
          requires2FA: true,
          challengeToken: createTwoFactorChallenge(user.id),
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    const authData = await issueAuthTokens(user);

    res.json({
      success: true,
      data: authData,
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// Verifica codice Authenticator dopo login admin
router.post('/2fa/verify', async (req, res) => {
  try {
    const { challengeToken, code } = req.body;

    if (!challengeToken || !code) {
      return res.status(400).json({ success: false, error: 'Codice Authenticator richiesto' });
    }

    let userId;
    try {
      userId = verifyTwoFactorChallenge(challengeToken);
    } catch {
      return res.status(401).json({ success: false, error: 'Sessione 2FA scaduta, rifai login' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin' || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Accesso non autorizzato' });
    }

    if (!user.totp_enabled || !user.totp_secret) {
      return res.status(400).json({ success: false, error: '2FA non attivo su questo account' });
    }

    if (!verifyTotpCode(user.totp_secret, code)) {
      return res.status(401).json({ success: false, error: 'Codice Authenticator non valido' });
    }

    const authData = await issueAuthTokens(user);

    res.json({
      success: true,
      data: authData,
    });
  } catch (error) {
    console.error('Errore verifica 2FA:', error);
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




