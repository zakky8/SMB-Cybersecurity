import prisma from "../lib/db";

export async function calculateSecurityScore(
  organizationId: string
): Promise<{
  totalScore: number;
  mfaScore: number;
  agentScore: number;
  breachScore: number;
  trainingScore: number;
  simulationScore: number;
  passwordScore: number;
}> {
  const [
    totalDevices,
    mfaEnabled,
    agentOnline,
    breachAlerts,
    trainingCompleted,
    totalTraining,
    simReported,
    totalSims,
  ] = await Promise.all([
    prisma.device.count({ where: { organizationId } }),
    prisma.device.count({
      where: { organizationId, mfaEnabled: true },
    }),
    prisma.device.count({
      where: { organizationId, agentStatus: "online" },
    }),
    prisma.breachAlert.count({ where: { organizationId } }),
    prisma.trainingProgress.count({
      where: {
        module: { organizationId },
        status: "completed",
      },
    }),
    prisma.trainingProgress.count({
      where: { module: { organizationId } },
    }),
    prisma.simulationResult.count({
      where: {
        simulation: { organizationId },
        reportedAsPhishing: true,
      },
    }),
    prisma.simulationResult.count({
      where: { simulation: { organizationId } },
    }),
  ]);

  // Calculate scores based on percentages
  const mfaPercentage = totalDevices > 0 ? mfaEnabled / totalDevices : 0;
  const agentPercentage = totalDevices > 0 ? agentOnline / totalDevices : 0;
  const breachScore = breachAlerts === 0 ? 20 : Math.max(0, 20 - breachAlerts * 5);
  const trainingPercentage = totalTraining > 0 ? trainingCompleted / totalTraining : 0;
  const simulationPercentage = totalSims > 0 ? simReported / totalSims : 0;

  const scores = {
    mfaScore: Math.round(mfaPercentage * 25), // Max 25 points
    agentScore: Math.round(agentPercentage * 20), // Max 20 points
    breachScore: Math.round(breachScore), // Max 20 points
    trainingScore: Math.round(trainingPercentage * 15), // Max 15 points
    simulationScore: Math.round(simulationPercentage * 10), // Max 10 points
    passwordScore: 10, // Placeholder - Max 10 points
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Save to database
  await prisma.securityScore.create({
    data: {
      organizationId,
      totalScore,
      ...scores,
    },
  });

  return {
    totalScore,
    ...scores,
  };
}

export async function getLatestSecurityScore(organizationId: string) {
  return await prisma.securityScore.findFirst({
    where: { organizationId },
    orderBy: { calculatedAt: "desc" },
  });
}
