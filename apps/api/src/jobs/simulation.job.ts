import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { prisma } from '../lib/db';
import { GoPhishClient } from '../integrations/gophish';

const QUEUE_NAME = 'phishing-simulation';

export const simulationQueue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
  },
});

export const simulationWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { orgId, templateId } = job.data;
    const gophish = new GoPhishClient();

    const employees = await prisma.employee.findMany({
      where: { orgId, status: 'active' },
      select: { id: true, email: true, name: true },
    });

    if (employees.length === 0) {
      return { orgId, status: 'skipped', reason: 'no active employees' };
    }

    // Create GoPhish campaign
    const campaign = await gophish.createCampaign({
      name: `ShieldDesk Sim - ${orgId} - ${new Date().toISOString()}`,
      templateId: templateId || Math.floor(Math.random() * 10) + 1,
      targets: employees.map((e) => ({
        email: e.email,
        firstName: e.name.split(' ')[0],
        lastName: e.name.split(' ').slice(1).join(' '),
      })),
    });

    const simulation = await prisma.simulation.create({
      data: {
        orgId,
        templateId: templateId || 1,
        gophishCampaignId: campaign.id,
        sentAt: new Date(),
        results: {},
      },
    });

    return { simulationId: simulation.id, campaignId: campaign.id };
  },
  { connection: redis, concurrency: 3 }
);
