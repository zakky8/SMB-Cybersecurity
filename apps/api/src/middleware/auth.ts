import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@clerk/backend';

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  orgId?: string;
  orgRole?: string;
}

export async function authMiddleware(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    request.userId = payload.sub;
    request.orgId = payload.org_id as string | undefined;
    request.orgRole = payload.org_role as string | undefined;

    if (!request.orgId) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'User must belong to an organization',
      });
    }
  } catch (error) {
    request.log.error(error, 'Auth middleware failed');
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

export async function adminOnly(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  if (request.orgRole !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
}

export async function agentAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const apiKey = request.headers['x-agent-key'] as string;
    const deviceId = request.headers['x-device-id'] as string;

    if (!apiKey || !deviceId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing agent credentials',
      });
    }

    // Verify agent API key against database
    const { prisma } = await import('../lib/db');
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        apiKey: apiKey,
        status: { not: 'offline' },
      },
    });

    if (!device) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid agent credentials',
      });
    }

    // Attach device info to request
    (request as any).deviceId = device.id;
    (request as any).orgId = device.orgId;
  } catch (error) {
    request.log.error(error, 'Agent auth middleware failed');
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}
