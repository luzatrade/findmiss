const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// Esegui migrazioni e seed automaticamente all'avvio (solo in produzione)
if (process.env.NODE_ENV === 'production') {
  (async () => {
    try {
      console.log('🔄 Controllo migrazioni database...');
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Migrazioni verificate!');
      
      // Esegui seed solo se il database è vuoto
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const announcementCount = await prisma.announcement.count();
        await prisma.$disconnect();
        
        if (announcementCount === 0) {
          console.log('🌱 Database vuoto, eseguo seed...');
          execSync('node prisma/seed.js', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
          });
          console.log('✅ Database popolato!');
        } else {
          console.log(`✅ Database già popolato (${announcementCount} annunci)`);
        }
      } catch (seedError) {
        console.log('⚠️ Seed non eseguito (continua comunque):', seedError.message);
      }
    } catch (error) {
      console.error('⚠️ Errore migrazioni (continua comunque):', error.message);
    }
  })();
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Inizializza cache Redis (opzionale)
const { initRedis } = require('./services/cacheService');
initRedis();

// Inizializza WebSocket per chat real-time
const { initializeSocket } = require('./websocket/chatSocket');
const io = initializeSocket(server);

// Rendi io disponibile globalmente
app.set('io', io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve file statici (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const announcementsRoutes = require('./routes/announcements');
const reelsRoutes = require('./routes/reels');
const citiesRoutes = require('./routes/cities');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const paymentsRoutes = require('./routes/payments');
const sessionsRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const liveRoutes = require('./routes/live');
const storiesRoutes = require('./routes/stories');
const followsRoutes = require('./routes/follows');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const premiumRoutes = require('./routes/premium');

app.use('/api/announcements', announcementsRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/premium-plans', premiumRoutes);
app.use('/api/boost-options', premiumRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FindMiss API',
    version: '3.0.0',
    features: {
      websocket: true,
      upload: true,
      cache: !!process.env.REDIS_URL,
      live_streaming: true,
      stories: true,
      social: true
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API funzionante!' });
});

// Error handler globale
app.use((err, req, res, next) => {
  console.error('Errore server:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Errore server' 
  });
});

// Start server con WebSocket
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🔌 WebSocket attivo`);
  console.log(`📁 Upload path: /uploads`);
  console.log(`🌐 Server accessibile su rete locale`);
});

// Avvia scheduler uscite giornaliere (opzionale)
if (process.env.REDIS_URL) {
  try {
    require('./jobs/dailySpotsScheduler');
    console.log('⏰ Scheduler uscite giornaliere avviato');
  } catch (error) {
    console.warn('⚠️ Scheduler non disponibile');
  }
}

module.exports = { app, server, io };