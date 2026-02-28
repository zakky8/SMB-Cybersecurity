import prisma from "../lib/db";
import { createCampaign, sendEmails } from "../integrations/gophish";

export async function launchPhishingSimulation(
  simulationId: string,
  organizationId: string
): Promise<void> {
  const simulation = await prisma.phishingSimulation.findUnique({
    where: { id: simulationId },
  });

  if (!simulation) {
    throw new Error("Simulation not found");
  }

  const employees = await prisma.employee.findMany({
    where: { organizationId, status: "active" },
  });

  try {
    // Create campaign in GoPhish
    const campaign = await createCampaign({
      name: simulation.name,
      description: simulation.description,
      template: simulation.templateId,
    });

    // Send phishing emails
    const emails = employees.map((emp) => ({
      email: emp.email,
      firstName: emp.firstName,
    }));

    await sendEmails(campaign.id, emails);

    // Create simulation results records
    for (const employee of employees) {
      await prisma.simulationResult.create({
        data: {
          simulationId,
          employeeId: employee.id,
          emailSent: new Date(),
          result: "no_interaction",
        },
      });
    }

    // Update simulation status
    await prisma.phishingSimulation.update({
      where: { id: simulationId },
      data: {
        status: "in_progress",
        startedAt: new Date(),
        targetCount: employees.length,
      },
    });
  } catch (error) {
    console.error("Failed to launch phishing simulation:", error);
    throw error;
  }
}

export async function completePhishingSimulation(
  simulationId: string
): Promise<void> {
  const simulation = await prisma.phishingSimulation.findUnique({
    where: { id: simulationId },
    include: { results: true },
  });

  if (!simulation) {
    throw new Error("Simulation not found");
  }

  const results = simulation.results;
  const clicked = results.filter((r) => r.linkClicked).length;
  const submitted = results.filter((r) => r.credentialsSubmitted).length;
  const reported = results.filter((r) => r.reportedAsPhishing).length;
  const total = results.length;

  await prisma.phishingSimulation.update({
    where: { id: simulationId },
    data: {
      status: "completed",
      completedAt: new Date(),
      clickRate: total > 0 ? (clicked / total) * 100 : 0,
      submissionRate: total > 0 ? (submitted / total) * 100 : 0,
      reportsRate: total > 0 ? (reported / total) * 100 : 0,
    },
  });
}

export async function getSimulationMetrics(simulationId: string) {
  const results = await prisma.simulationResult.findMany({
    where: { simulationId },
  });

  const metrics = {
    total: results.length,
    clicked: results.filter((r) => r.linkClicked).length,
    submitted: results.filter((r) => r.credentialsSubmitted).length,
    reported: results.filter((r) => r.reportedAsPhishing).length,
    noInteraction: results.filter((r) => r.result === "no_interaction").length,
  };

  return {
    ...metrics,
    clickRate: metrics.total > 0 ? (metrics.clicked / metrics.total) * 100 : 0,
    submissionRate: metrics.total > 0 ? (metrics.submitted / metrics.total) * 100 : 0,
    reportRate: metrics.total > 0 ? (metrics.reported / metrics.total) * 100 : 0,
  };
}
