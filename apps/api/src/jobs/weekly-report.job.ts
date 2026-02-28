import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { prisma } from '../lib/db';
import { sendEmail } from '../lib/email';
import { calculateOrgScore } from '../services/security-score';

const QUEUE_NAME = 'weekly-report';

export const weeklyReportQueue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
  },
});

export const weeklyReportWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { orgId } = job.data;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        employees: { where: { status: 'active' } },
      },
    });

    if (!org) throw new Error(`Org ${orgId} not found`);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [threatsBlocked, emailsBlocked, devicesCount, breachAlerts] =
      await Promise.all([
        prisma.threat.count({
          where: { orgId, detectedAt: { gte: oneWeekAgo } },
        }),
        prisma.emailScan.count({
          where: {
            orgId,
            actionTaken: { in: ['flagged', 'quarantined'] },
            scannedAt: { gte: oneWeekAgo },
          },
        }),
        prisma.device.count({ where: { orgId, status: 'protected' } }),
        prisma.breachAlert.count({
          where: {
            employee: { orgId },
            detectedAt: { gte: oneWeekAgo },
            acknowledged: false,
          },
        }),
      ]);

    const score = await calculateOrgScore(orgId);

    const adminEmployees = org.employees.filter((e) => e.role === 'admin');

    for (const admin of adminEmployees) {
      await sendEmail({
        to: admin.email,
        subject: `Your security week: ${threatsBlocked} threats blocked, score ${score}/100`,
        template: 'weekly-digest',
        data: {
          orgName: org.name,
          score,
          threatsBlocked,
          emailsBlocked,
          devicesProtected: devicesCount,
          totalEmployees: org.employees.length,
          breachAlerts,
        },
      });
    }

    return { orgId, score, threatsBlocked, emailsBlocked };
  },
  { connection: redis, concurrency: 5 }
);

// Schedule weekly reports for all orgs (run every Monday at 8am)
export async function scheduleWeeklyReports() {
  const orgs = await prisma.organization.findMany({
    select: { id: true },
  });

  for (const org of orgs) {
    await weeklyReportQueue.add(
      'generate',
      { orgId: org.id },
      {
        repeat: { pattern: '0 8 * * 1' }, // Monday 8am
        jobId: `weekly-${org.id}`,
      }
    );
  }
}
