const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware autenticazione richiesta
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

// Middleware autenticazione opzionale
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

// Middleware ruolo richiesto
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

// Middleware admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Accesso riservato agli admin' 
    });
  }
  next();
};

// Middleware advertiser o admin
const requireAdvertiser = (req, res, next) => {
  if (!req.user || !['admin', 'advertiser'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      error: 'Accesso riservato agli inserzionisti' 
    });
  }
  next();
};

// Genera token
const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};

// Verifica token
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
