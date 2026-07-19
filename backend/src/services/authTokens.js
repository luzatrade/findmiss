const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

async function issueAuthTokens(user) {
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      totp_enabled: Boolean(user.totp_enabled),
    },
    token,
    refreshToken,
  };
}

function createTwoFactorChallenge(userId) {
  return jwt.sign({ userId, purpose: '2fa_login' }, JWT_SECRET, { expiresIn: '5m' });
}

function verifyTwoFactorChallenge(challengeToken) {
  const decoded = jwt.verify(challengeToken, JWT_SECRET);
  if (decoded.purpose !== '2fa_login' || !decoded.userId) {
    throw new Error('Challenge 2FA non valido');
  }
  return decoded.userId;
}

module.exports = {
  issueAuthTokens,
  createTwoFactorChallenge,
  verifyTwoFactorChallenge,
  verifyPassword: (plain, hash) => bcrypt.compare(plain, hash),
};
