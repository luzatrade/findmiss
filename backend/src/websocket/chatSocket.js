const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        // URL esplicito da env (può essere https)
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.FRONTEND_URL?.replace('http://', 'https://'),
        // Localhost
        'http://localhost:3000',
        'https://localhost:3000',
        // Reti locali
        /^http:\/\/192\.168\.\d+\.\d+:3000$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
        // Dominio pubblico
        'https://findmiss.it',
        'https://www.findmiss.it',
        // Dominio Vercel
        'https://findmiss.vercel.app'
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware autenticazione
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        // Permetti connessioni anonime per funzionalità base
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, nickname: true, role: true }
      });

      if (!user) {
        return next(new Error('Utente non trovato'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Errore autenticazione WebSocket:', error.message);
      // Permetti connessione ma senza utente autenticato
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connesso: ${socket.id} (User: ${socket.user?.email || 'anonimo'})`);

    // Unisciti a una room conversazione
    socket.on('join_conversation', async (conversationId) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Autenticazione richiesta' });
        return;
      }

      try {
        // Verifica che l'utente faccia parte della conversazione
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        if (!conversation || 
            (conversation.user1_id !== socket.user.id && conversation.user2_id !== socket.user.id)) {
          socket.emit('error', { message: 'Non autorizzato' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`📨 ${socket.user.email} joined conversation:${conversationId}`);
      } catch (error) {
        console.error('Errore join conversazione:', error);
        socket.emit('error', { message: 'Errore server' });
      }
    });

    // Lascia una room conversazione
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`📭 ${socket.user?.email || 'anonimo'} left conversation:${conversationId}`);
    });

    // Nuovo messaggio (alternativo all'API REST)
    socket.on('send_message', async (data) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Autenticazione richiesta' });
        return;
      }

      try {
        const { conversation_id, content, message_type = 'text' } = data;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversation_id }
        });

        if (!conversation || 
            (conversation.user1_id !== socket.user.id && conversation.user2_id !== socket.user.id)) {
          socket.emit('error', { message: 'Non autorizzato' });
          return;
        }

        const receiverId = conversation.user1_id === socket.user.id 
          ? conversation.user2_id 
          : conversation.user1_id;

        const message = await prisma.message.create({
          data: {
            conversation_id,
            sender_id: socket.user.id,
            receiver_id: receiverId,
            content,
            message_type
          },
          include: {
            sender: { select: { id: true, nickname: true, email: true } },
            receiver: { select: { id: true, nickname: true, email: true } }
          }
        });

        // Aggiorna timestamp conversazione
        await prisma.conversation.update({
          where: { id: conversation_id },
          data: { updated_at: new Date() }
        });

        // Invia a tutti nella room
        io.to(`conversation:${conversation_id}`).emit('new_message', message);
        
        // Conferma al mittente
        socket.emit('message_sent', { success: true, message });

      } catch (error) {
        console.error('Errore invio messaggio:', error);
        socket.emit('error', { message: 'Errore invio messaggio' });
      }
    });

    // Typing indicator
    socket.on('typing_start', (conversationId) => {
      if (!socket.user) return;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        user_id: socket.user.id,
        nickname: socket.user.nickname || socket.user.email
      });
    });

    socket.on('typing_stop', (conversationId) => {
      if (!socket.user) return;
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        user_id: socket.user.id
      });
    });

    // Messaggio letto
    socket.on('message_read', async (data) => {
      if (!socket.user) return;

      try {
        const { message_id, conversation_id } = data;

        await prisma.message.update({
          where: { id: message_id },
          data: {
            is_read: true,
            read_at: new Date()
          }
        });

        socket.to(`conversation:${conversation_id}`).emit('message_read_update', {
          message_id,
          read_by: socket.user.id,
          read_at: new Date()
        });
      } catch (error) {
        console.error('Errore marcatura messaggio letto:', error);
      }
    });

    // Online status
    socket.on('set_online', () => {
      if (socket.user) {
        socket.broadcast.emit('user_online', { user_id: socket.user.id });
      }
    });

    socket.on('set_offline', () => {
      if (socket.user) {
        socket.broadcast.emit('user_offline', { user_id: socket.user.id });
      }
    });

    // Disconnessione
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnesso: ${socket.id}`);
      if (socket.user) {
        socket.broadcast.emit('user_offline', { user_id: socket.user.id });
      }
    });
  });

  return io;
}

module.exports = { initializeSocket };
