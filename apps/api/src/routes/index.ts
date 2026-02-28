import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { apiLimiter } from '../middleware/rate-limit';

import dashboardRoutes from './dashboard';
import employeeRoutes from './employees';
import threatRoutes from './threats';
import deviceRoutes from './devices';
import emailScanRoutes from './email-scans';
import breachRoutes from './breach';
import simulationRoutes from './simulations';
import trainingRoutes from './training';
import billingRoutes from './billing';
import dnsRoutes from './dns';
import reportRoutes from './reports';
import organizationRoutes from './organizations';

export async function registerRoutes(app: FastifyInstance) {
  // Health check (no auth)
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  }));

  // Webhook routes (no auth, use webhook secret validation)
  app.register(billingRoutes, { prefix: '/api/billing' });

  // Authenticated API routes
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authMiddleware);
    protectedApp.addHook('onRequest', apiLimiter);

    protectedApp.register(dashboardRoutes, { prefix: '/api/dashboard' });
    protectedApp.register(employeeRoutes, { prefix: '/api/employees' });
    protectedApp.register(threatRoutes, { prefix: '/api/threats' });
    protectedApp.register(deviceRoutes, { prefix: '/api/devices' });
    protectedApp.register(emailScanRoutes, { prefix: '/api/email-scans' });
    protectedApp.register(breachRoutes, { prefix: '/api/breaches' });
    protectedApp.register(simulationRoutes, { prefix: '/api/simulations' });
    protectedApp.register(trainingRoutes, { prefix: '/api/training' });
    protectedApp.register(dnsRoutes, { prefix: '/api/dns' });
    protectedApp.register(reportRoutes, { prefix: '/api/reports' });
    protectedApp.register(organizationRoutes, { prefix: '/api/organizations' });
  });
}

export default registerRoutes;
