import { Server as SocketIOServer } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { verifyToken } from '@clerk/backend';

let io: SocketIOServer;

export function initWebSocket(fastify: FastifyInstance) {
  io = new SocketIOServer(fastify.server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/ws',
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      socket.data.userId = payload.sub;
      socket.data.orgId = payload.org_id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const orgId = socket.data.orgId;

    if (orgId) {
      socket.join(`org:${orgId}`);
      fastify.log.info(`Client connected to org:${orgId}`);
    }

    socket.on('subscribe:threats', () => {
      if (orgId) socket.join(`org:${orgId}:threats`);
    });

    socket.on('subscribe:devices', () => {
      if (orgId) socket.join(`org:${orgId}:devices`);
    });

    socket.on('disconnect', () => {
      fastify.log.info(`Client disconnected from org:${orgId}`);
    });
  });

  fastify.log.info('WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('WebSocket not initialized');
  return io;
}

// Emit functions for real-time alerts
export function emitThreatAlert(orgId: string, threat: any) {
  if (!io) return;
  io.to(`org:${orgId}`).emit('threat:new', threat);
  io.to(`org:${orgId}:threats`).emit('threat:new', threat);
}

export function emitDeviceUpdate(orgId: string, device: any) {
  if (!io) return;
  io.to(`org:${orgId}`).emit('device:update', device);
  io.to(`org:${orgId}:devices`).emit('device:update', device);
}

export function emitScoreUpdate(orgId: string, score: number) {
  if (!io) return;
  io.to(`org:${orgId}`).emit('score:update', { score });
}

export function emitBreachAlert(orgId: string, breach: any) {
  if (!io) return;
  io.to(`org:${orgId}`).emit('breach:new', breach);
}
