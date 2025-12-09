const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mappa viewers per stream
const streamViewers = new Map();

const initializeLiveSocket = (io) => {
  const liveNamespace = io.of('/live');

  // Middleware autenticazione opzionale
  liveNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, nickname: true, is_active: true, avatar_url: true }
        });
        socket.user = user;
      } else {
        socket.user = null;
      }
      next();
    } catch (error) {
      socket.user = null;
      next();
    }
  });

  liveNamespace.on('connection', (socket) => {
    console.log(`Live socket connected: ${socket.user?.nickname || 'anonymous'}`);

    // ============================================
    // VIEWER EVENTS
    // ============================================

    // Join live stream room
    socket.on('join_stream', async (streamId) => {
      try {
        const stream = await prisma.liveStream.findUnique({
          where: { id: streamId }
        });

        if (!stream || stream.status !== 'live') {
          socket.emit('error', { message: 'Stream non disponibile' });
          return;
        }

        socket.join(`stream:${streamId}`);
        
        // Track viewer
        if (!streamViewers.has(streamId)) {
          streamViewers.set(streamId, new Set());
        }
        streamViewers.get(streamId).add(socket.id);

        // Update viewer count
        const viewerCount = streamViewers.get(streamId).size;
        await prisma.liveStream.update({
          where: { id: streamId },
          data: { 
            viewers_count: viewerCount,
            peak_viewers: Math.max(stream.peak_viewers, viewerCount),
            total_views: { increment: 1 }
          }
        });

        // Notify all viewers
        liveNamespace.to(`stream:${streamId}`).emit('viewer_update', {
          viewers_count: viewerCount
        });

        socket.emit('joined_stream', {
          stream_id: streamId,
          viewers_count: viewerCount
        });

        console.log(`User joined stream ${streamId}, viewers: ${viewerCount}`);
      } catch (error) {
        console.error('Error joining stream:', error);
        socket.emit('error', { message: 'Errore join stream' });
      }
    });

    // Leave live stream
    socket.on('leave_stream', async (streamId) => {
      await handleLeaveStream(socket, streamId, liveNamespace);
    });

    // ============================================
    // CHAT EVENTS
    // ============================================

    // Send chat message
    socket.on('chat_message', async (data) => {
      try {
        const { stream_id, content, type = 'text' } = data;

        if (!content || content.trim().length === 0) return;

        const message = await prisma.liveMessage.create({
          data: {
            stream_id,
            user_id: socket.user?.id || null,
            nickname: socket.user?.nickname || data.nickname || 'Anonimo',
            content: content.trim(),
            type
          }
        });

        liveNamespace.to(`stream:${stream_id}`).emit('chat_message', {
          ...message,
          user: socket.user ? {
            id: socket.user.id,
            nickname: socket.user.nickname,
            avatar_url: socket.user.avatar_url
          } : null
        });
      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    });

    // ============================================
    // INTERACTION EVENTS
    // ============================================

    // Like stream
    socket.on('like', async (streamId) => {
      try {
        await prisma.liveStream.update({
          where: { id: streamId },
          data: { likes_count: { increment: 1 } }
        });

        liveNamespace.to(`stream:${streamId}`).emit('like_received', {
          user: socket.user?.nickname || 'Qualcuno'
        });
      } catch (error) {
        console.error('Error liking stream:', error);
      }
    });

    // Send tip
    socket.on('send_tip', async (data) => {
      try {
        const { stream_id, amount, message } = data;

        if (!socket.user) {
          socket.emit('error', { message: 'Devi essere loggato per inviare tip' });
          return;
        }

        const tip = await prisma.liveTip.create({
          data: {
            stream_id,
            user_id: socket.user.id,
            amount,
            message,
            is_public: true
          }
        });

        await prisma.liveStream.update({
          where: { id: stream_id },
          data: { tips_total: { increment: amount } }
        });

        // Notify stream
        liveNamespace.to(`stream:${stream_id}`).emit('tip_received', {
          user: socket.user.nickname,
          amount,
          message
        });

        // Special message in chat
        await prisma.liveMessage.create({
          data: {
            stream_id,
            user_id: socket.user.id,
            nickname: socket.user.nickname,
            content: `Ha inviato €${amount}! ${message || ''}`,
            type: 'tip'
          }
        });
      } catch (error) {
        console.error('Error sending tip:', error);
      }
    });

    // ============================================
    // BROADCASTER EVENTS
    // ============================================

    // Start streaming (broadcaster only)
    socket.on('start_stream', async (streamId) => {
      try {
        if (!socket.user) {
          socket.emit('error', { message: 'Non autorizzato' });
          return;
        }

        const stream = await prisma.liveStream.findUnique({
          where: { id: streamId }
        });

        if (!stream || stream.user_id !== socket.user.id) {
          socket.emit('error', { message: 'Non autorizzato' });
          return;
        }

        await prisma.liveStream.update({
          where: { id: streamId },
          data: {
            status: 'live',
            started_at: new Date()
          }
        });

        socket.join(`stream:${streamId}:broadcaster`);
        
        // Notify followers (broadcast globale)
        liveNamespace.emit('new_live_stream', {
          stream_id: streamId,
          user: {
            id: socket.user.id,
            nickname: socket.user.nickname
          },
          title: stream.title
        });

        socket.emit('stream_started', { stream_id: streamId });
      } catch (error) {
        console.error('Error starting stream:', error);
      }
    });

    // End streaming
    socket.on('end_stream', async (streamId) => {
      try {
        if (!socket.user) return;

        const stream = await prisma.liveStream.findUnique({
          where: { id: streamId }
        });

        if (!stream || stream.user_id !== socket.user.id) return;

        const duration = stream.started_at 
          ? Math.floor((new Date() - new Date(stream.started_at)) / 1000)
          : 0;

        await prisma.liveStream.update({
          where: { id: streamId },
          data: {
            status: 'ended',
            ended_at: new Date(),
            duration,
            viewers_count: 0
          }
        });

        liveNamespace.to(`stream:${streamId}`).emit('stream_ended', {
          stream_id: streamId,
          duration
        });

        // Clear viewers
        streamViewers.delete(streamId);
      } catch (error) {
        console.error('Error ending stream:', error);
      }
    });

    // WebRTC signaling
    socket.on('webrtc_offer', (data) => {
      socket.to(`stream:${data.stream_id}`).emit('webrtc_offer', data);
    });

    socket.on('webrtc_answer', (data) => {
      socket.to(`stream:${data.stream_id}:broadcaster`).emit('webrtc_answer', data);
    });

    socket.on('webrtc_ice_candidate', (data) => {
      socket.to(`stream:${data.stream_id}`).emit('webrtc_ice_candidate', data);
    });

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', async () => {
      console.log(`Live socket disconnected: ${socket.user?.nickname || 'anonymous'}`);
      
      // Remove from all streams
      for (const [streamId, viewers] of streamViewers.entries()) {
        if (viewers.has(socket.id)) {
          await handleLeaveStream(socket, streamId, liveNamespace);
        }
      }
    });
  });

  return liveNamespace;
};

// Helper per gestire uscita da stream
const handleLeaveStream = async (socket, streamId, namespace) => {
  try {
    socket.leave(`stream:${streamId}`);
    
    if (streamViewers.has(streamId)) {
      streamViewers.get(streamId).delete(socket.id);
      const viewerCount = streamViewers.get(streamId).size;

      await prisma.liveStream.update({
        where: { id: streamId },
        data: { viewers_count: viewerCount }
      });

      namespace.to(`stream:${streamId}`).emit('viewer_update', {
        viewers_count: viewerCount
      });
    }
  } catch (error) {
    console.error('Error leaving stream:', error);
  }
};

module.exports = { initializeLiveSocket };

