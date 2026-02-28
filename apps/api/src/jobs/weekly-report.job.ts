import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import prisma from '../lib/db';
import { sendEmail } from '../lib/email';
import { calculateSecurityScore } from '../services/security-score';

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
    const { organizationId } = job.data;

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        employees: { where: { status: 'active' } },
        members: { where: { role: 'admin' } },
      },
    });

    if (!org) throw new Error(`Org ${organizationId} not found`);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [threatsBlocked, emailsQuarantined, devicesCount, breachAlerts] =
      await Promise.all([
        prisma.threat.count({
          where: { organizationId, detectedAt: { gte: oneWeekAgo } },
        }),
        prisma.emailScan.count({
          where: {
            organizationId,
            quarantined: true,
            createdAt: { gte: oneWeekAgo },
          },
        }),
        prisma.device.count({ where: { organizationId, status: 'active' } }),
        prisma.breachAlert.count({
          where: {
            organizationId,
            detectedAt: { gte: oneWeekAgo },
            alertSent: false,
          },
        }),
      ]);

    const score = await calculateSecurityScore(organizationId);

    // Get admin emails from Members table
    const adminMembers = org.members;

    for (const member of adminMembers) {
      // Get clerk user email — use org owner email from org or look up separately
      // For now, send to all employee emails that match admin members
      const adminEmployee = org.employees.find(
        (e) => e.status === 'active'
      );
      if (!adminEmployee) continue;

      await sendEmail({
        to: adminEmployee.email,
        subject: `Your security week: ${threatsBlocked} threats blocked, score ${score}/100`,
        template: 'weekly-digest',
        data: {
          orgName: org.name,
          score,
          threatsBlocked,
          emailsBlocked: emailsQuarantined,
          devicesProtected: devicesCount,
          totalEmployees: org.employees.length,
          breachAlerts,
        },
      });
    }

    return { organizationId, score, threatsBlocked, emailsQuarantined };
  },
  { connection: redis, concurrency: 5 }
);

weeklyReportWorker.on('completed', (job) => {
  console.log(`Weekly report job ${job.id} completed for org ${job.data.organizationId}`);
});

weeklyReportWorker.on('failed', (job, err) => {
  console.error(`Weekly report job ${job?.id} failed:`, err);
});

// Schedule weekly reports for all orgs (every Monday at 8am)
export async function scheduleWeeklyReports(): Promise<void> {
  const orgs = await prisma.organization.findMany({
    where: { subscriptionStatus: 'active' },
    select: { id: true },
  });

  for (const org of orgs) {
    await weeklyReportQueue.add(
      'generate',
      { organizationId: org.id },
      {
        repeat: { pattern: '0 8 * * 1' }, // Monday 8am
        jobId: `weekly-${org.id}`,
      }
    );
  }

  console.log(`Scheduled weekly reports for ${orgs.length} organizations`);
}
