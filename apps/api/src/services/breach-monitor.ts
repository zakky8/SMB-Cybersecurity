import prisma from "../lib/db";
import { checkBreaches } from "../integrations/hibp";
import { sendEmail } from "../lib/email";

export async function monitorBreaches(organizationId: string): Promise<void> {
  const employees = await prisma.employee.findMany({
    where: { organizationId, status: "active" },
  });

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) return;

  for (const employee of employees) {
    try {
      const breaches = await checkBreaches(employee.email);

      if (breaches && breaches.length > 0) {
        // Check if we already have this breach alert
        for (const breach of breaches) {
          const existingAlert = await prisma.breachAlert.findFirst({
            where: {
              organizationId,
              breachName: breach.Name,
            },
          });

          if (!existingAlert) {
            // Create new breach alert
            const alert = await prisma.breachAlert.create({
              data: {
                organizationId,
                breachName: breach.Name,
                breachDate: new Date(breach.BreachDate),
                breachSource: "HaveIBeenPwned",
                affectedCount: breach.PwnCount,
                description: breach.Description,
                severity: calculateBreachSeverity(breach),
              },
            });

            // Create breach records for affected employees
            await prisma.breachRecord.create({
              data: {
                breachAlertId: alert.id,
                employeeId: employee.id,
                email: employee.email,
                exposedData: breach.DataClasses || [],
              },
            });

            // Send notification
            await sendEmail(employee.email, "breachAlert", {
              breachName: breach.Name,
              breachDate: breach.BreachDate,
              dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
            }).catch((err) =>
              console.error("Failed to send breach notification:", err)
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error checking breaches for ${employee.email}:`, error);
    }
  }
}

function calculateBreachSeverity(breach: any): string {
  const pwnCount = breach.PwnCount || 0;

  if (pwnCount > 1000000) return "critical";
  if (pwnCount > 100000) return "high";
  if (pwnCount > 10000) return "medium";
  return "low";
}

export async function getBreachStats(organizationId: string) {
  const [totalBreaches, affectedEmployees, criticalBreaches] = await Promise.all([
    prisma.breachAlert.count({ where: { organizationId } }),
    prisma.breachRecord.count({
      where: { breachAlert: { organizationId } },
    }),
    prisma.breachAlert.count({
      where: { organizationId, severity: "critical" },
    }),
  ]);

  return {
    totalBreaches,
    affectedEmployees,
    criticalBreaches,
  };
}
