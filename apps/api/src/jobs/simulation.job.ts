import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import prisma from '../lib/db';
import { createCampaign } from '../integrations/gophish';

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
    const { organizationId, templateId } = job.data;

    const employees = await prisma.employee.findMany({
      where: { organizationId, status: 'active' },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (employees.length === 0) {
      return { organizationId, status: 'skipped', reason: 'no active employees' };
    }

    // Create GoPhish campaign
    const campaign = await createCampaign({
      name: `ShieldDesk Sim - ${organizationId} - ${new Date().toISOString()}`,
      templateId: templateId || Math.floor(Math.random() * 10) + 1,
      targets: employees.map((e) => ({
        email: e.email,
        firstName: e.firstName,
        lastName: e.lastName,
      })),
    });

    const simulation = await prisma.phishingSimulation.create({
      data: {
        organizationId,
        name: `Monthly Simulation - ${new Date().toLocaleDateString()}`,
        templateId: String(templateId || 1),
        status: 'in_progress',
      },
    });

    return { simulationId: simulation.id, campaignId: campaign.id };
  },
  { connection: redis, concurrency: 3 }
);

simulationWorker.on('completed', (job) => {
  console.log(`Simulation job ${job.id} completed`);
});

simulationWorker.on('failed', (job, err) => {
  console.error(`Simulation job ${job?.id} failed:`, err);
});

export async function queueSimulation(
  organizationId: string,
  templateId?: number
): Promise<void> {
  await simulationQueue.add('run', { organizationId, templateId });
}
