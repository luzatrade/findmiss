const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} nickname - User nickname
 * @property {string} role - User role (user|advertiser|admin)
 * @property {boolean} is_active - Whether user is active
 * @property {boolean} is_verified - Whether user is verified
 */

/**
 * @typedef {Object} JWTPayload
 * @property {string} userId - User ID from JWT
 */

/**
 * Middleware autenticazione richiesta
 * Verifica il token JWT e aggiunge req.user
 * @param {import('express').Request & {user?: User}} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token non fornito' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
          is_active: true,
          is_verified: true
        }
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Utente non trovato' 
        });
      }

      if (!user.is_active) {
        return res.status(401).json({ 
          success: false, 
          error: 'Account disattivato' 
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Token scaduto' 
        });
      }
      return res.status(401).json({ 
        success: false, 
        error: 'Token non valido' 
      });
    }
  } catch (error) {
    console.error('Errore middleware auth:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore autenticazione' 
    });
  }
};

/**
 * Middleware autenticazione opzionale
 * Aggiunge req.user se token valido, altrimenti req.user = null
 * @param {import('express').Request & {user?: User|null}} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
          is_active: true,
          is_verified: true
        }
      });

      req.user = user && user.is_active ? user : null;
    } catch (jwtError) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Middleware ruolo richiesto
 * Verifica che l'utente autenticato abbia uno dei ruoli specificati
 * @param {...string} roles - Ruoli permessi (es. 'admin', 'advertiser', 'user')
 * @returns {import('express').RequestHandler} Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Non autenticato' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Permessi insufficienti' 
      });
    }

    next();
  };
};

/**
 * Middleware admin
 * Verifica che l'utente sia admin
 * @param {import('express').Request & {user?: User}} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Accesso riservato agli admin' 
    });
  }
  next();
};

/**
 * Middleware advertiser o admin
 * Verifica che l'utente sia advertiser o admin
 * @param {import('express').Request & {user?: User}} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const requireAdvertiser = (req, res, next) => {
  if (!req.user || !['admin', 'advertiser'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      error: 'Accesso riservato agli inserzionisti' 
    });
  }
  next();
};

/**
 * Genera token JWT
 * @param {string} userId - User ID to encode in token
 * @param {string} [expiresIn='7d'] - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};

/**
 * Verifica token JWT
 * @param {string} token - JWT token to verify
 * @returns {JWTPayload} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireAdvertiser,
  generateToken,
  verifyToken
};
