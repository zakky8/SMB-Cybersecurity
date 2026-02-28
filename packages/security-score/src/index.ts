import { Employee, Device, Threat, Simulation, TrainingAssignment } from '@shielddesk/types';

/**
 * Security Score Calculator for ShieldDesk
 * 
 * Scoring breakdown:
 * - MFA Enrollment: 25 points
 * - Agent Installation: 20 points
 * - No Breach History: 20 points
 * - Training Completion: 15 points
 * - Simulation Performance: 10 points
 * - Strong Password Policy: 10 points
 */

interface SecurityScoreInput {
  employees: Employee[];
  devices: Device[];
  threats: Threat[];
  simulations: Simulation[];
  trainingAssignments: TrainingAssignment[];
  totalEmployees: number;
  totalDevices: number;
}

interface ScoreBreakdown {
  mfaScore: number;
  agentScore: number;
  breachScore: number;
  trainingScore: number;
  simulationScore: number;
  passwordScore: number;
}

interface SecurityScoreResult {
  overallScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'excellent';
  breakdown: ScoreBreakdown;
  details: string[];
}

export function calculateSecurityScore(input: SecurityScoreInput): SecurityScoreResult {
  const breakdown: ScoreBreakdown = {
    mfaScore: calculateMFAScore(input.employees),
    agentScore: calculateAgentScore(input.devices),
    breachScore: calculateBreachScore(input.threats),
    trainingScore: calculateTrainingScore(input.trainingAssignments, input.totalEmployees),
    simulationScore: calculateSimulationScore(input.simulations),
    passwordScore: calculatePasswordScore(input.employees),
  };

  const overallScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
  const riskLevel = getRiskLevel(overallScore);
  const details = generateDetails(breakdown, input);

  return {
    overallScore: Math.round(overallScore),
    riskLevel,
    breakdown,
    details,
  };
}

/**
 * MFA Score: Up to 25 points
 * Maximum 25 points if 100% of employees have MFA enabled
 */
function calculateMFAScore(employees: Employee[]): number {
  if (employees.length === 0) return 0;

  const mfaEnabled = employees.filter(emp => emp.mfaEnabled).length;
  const percentage = (mfaEnabled / employees.length) * 100;
  
  // Linear scaling: 0% = 0 points, 100% = 25 points
  return (percentage / 100) * 25;
}

/**
 * Agent Score: Up to 20 points
 * Maximum 20 points if 100% of devices have agent installed and online
 */
function calculateAgentScore(devices: Device[]): number {
  if (devices.length === 0) return 0;

  const onlineAgents = devices.filter(dev => dev.agentStatus === 'online').length;
  const percentage = (onlineAgents / devices.length) * 100;
  
  // Linear scaling: 0% = 0 points, 100% = 20 points
  return (percentage / 100) * 20;
}

/**
 * Breach Score: Up to 20 points
 * Deduct points for breach history and unresolved threats
 */
function calculateBreachScore(threats: Threat[]): number {
  let score = 20;

  // Deduct 2 points for each unresolved high/critical threat
  const unresolvedCriticalThreats = threats.filter(
    t => t.status !== 'resolved' && (t.severity === 'critical' || t.severity === 'high')
  ).length;
  score -= unresolvedCriticalThreats * 2;

  // Deduct 1 point for each unresolved medium threat
  const unresolvedMediumThreats = threats.filter(
    t => t.status !== 'resolved' && t.severity === 'medium'
  ).length;
  score -= unresolvedMediumThreats * 1;

  // Deduct 0.5 points for each resolved threat in the past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentResolvedThreats = threats.filter(
    t => t.status === 'resolved' && t.resolvedAt && t.resolvedAt > thirtyDaysAgo
  ).length;
  score -= recentResolvedThreats * 0.5;

  return Math.max(0, score);
}

/**
 * Training Score: Up to 15 points
 * Maximum 15 points if all employees have completed required training
 */
function calculateTrainingScore(assignments: TrainingAssignment[], totalEmployees: number): number {
  if (totalEmployees === 0) return 0;

  const completed = assignments.filter(a => a.status === 'completed').length;
  const uniqueEmployees = new Set(assignments.map(a => a.employeeId)).size;
  
  // Count employees who have completed at least one training
  const employeesWithTraining = new Set(
    assignments.filter(a => a.status === 'completed').map(a => a.employeeId)
  ).size;

  const percentage = (employeesWithTraining / totalEmployees) * 100;
  
  // Linear scaling: 0% = 0 points, 100% = 15 points
  return (percentage / 100) * 15;
}

/**
 * Simulation Score: Up to 10 points
 * Based on overall click rate: lower click rate = higher score
 */
function calculateSimulationScore(simulations: Simulation[]): number {
  if (simulations.length === 0) return 10; // Full score if no data available

  const totalOpenRate = simulations.reduce((sum, sim) => sum + sim.metrics.openRate, 0);
  const totalClickRate = simulations.reduce((sum, sim) => sum + sim.metrics.clickRate, 0);
  
  const avgClickRate = (totalClickRate / simulations.length);
  
  // Inverse scoring: lower click rate is better
  // 0% = 10 points, 50% = 5 points, 100% = 0 points
  const score = Math.max(0, 10 - (avgClickRate / 10));
  
  return score;
}

/**
 * Password Score: Up to 10 points
 * Based on password policy compliance
 */
function calculatePasswordScore(employees: Employee[]): number {
  if (employees.length === 0) return 0;

  // Check password age (should be changed within 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const compliantPasswords = employees.filter(emp => {
    return emp.passwordLastChanged > ninetyDaysAgo;
  }).length;

  const percentage = (compliantPasswords / employees.length) * 100;
  
  // Linear scaling: 0% = 0 points, 100% = 10 points
  return (percentage / 100) * 10;
}

/**
 * Determine risk level based on overall score
 */
function getRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' | 'excellent' {
  if (score < 20) return 'critical';
  if (score < 40) return 'high';
  if (score < 60) return 'medium';
  if (score < 80) return 'low';
  return 'excellent';
}

/**
 * Generate human-readable details about the score
 */
function generateDetails(breakdown: ScoreBreakdown, input: SecurityScoreInput): string[] {
  const details: string[] = [];

  // MFA Details
  if (breakdown.mfaScore < 20) {
    const mfaPercentage = Math.round((breakdown.mfaScore / 25) * 100);
    details.push(`MFA enrollment at ${mfaPercentage}% - Encourage all employees to enable MFA`);
  }

  // Agent Details
  if (breakdown.agentScore < 16) {
    const agentPercentage = Math.round((breakdown.agentScore / 20) * 100);
    details.push(`Agent installation at ${agentPercentage}% - Deploy agent to remaining devices`);
  }

  // Breach Details
  const unresolvedThreats = input.threats.filter(t => t.status !== 'resolved').length;
  if (unresolvedThreats > 0) {
    details.push(`${unresolvedThreats} unresolved threat(s) - Review and remediate threats in dashboard`);
  }

  // Training Details
  if (breakdown.trainingScore < 12) {
    details.push('Low training completion - Assign mandatory security training modules');
  }

  // Simulation Details
  if (breakdown.simulationScore < 7) {
    details.push('High phishing click rate - Consider additional training and simulations');
  }

  // Password Details
  if (breakdown.passwordScore < 8) {
    details.push('Password compliance issues - Enforce strong password policies');
  }

  // Positive feedback
  if (details.length === 0) {
    details.push('All security metrics are in good shape');
  }

  return details;
}

/**
 * Calculate trend over time
 */
export interface ScoreTrendInput {
  date: Date;
  score: number;
  category: string;
}

export function calculateScoreTrend(scores: ScoreTrendInput[]): ScoreTrendInput[] {
  return scores.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Generate recommendations based on security score
 */
export function generateRecommendations(breakdown: ScoreBreakdown, input: SecurityScoreInput) {
  const recommendations = [];

  // MFA Recommendations
  if (breakdown.mfaScore < 25) {
    recommendations.push({
      id: 'mfa-001',
      priority: 'critical' as const,
      title: 'Increase MFA Enrollment',
      description: 'Multi-factor authentication significantly reduces account compromise risks',
      action: 'mfa_enrollment_campaign',
      estimatedImpact: 25 - breakdown.mfaScore,
      implementationDifficulty: 'easy' as const,
    });
  }

  // Agent Recommendations
  if (breakdown.agentScore < 20) {
    recommendations.push({
      id: 'agent-001',
      priority: 'critical' as const,
      title: 'Deploy Agent to All Devices',
      description: 'The security agent provides real-time threat detection and response',
      action: 'agent_deployment',
      estimatedImpact: 20 - breakdown.agentScore,
      implementationDifficulty: 'medium' as const,
    });
  }

  // Training Recommendations
  if (breakdown.trainingScore < 15) {
    recommendations.push({
      id: 'training-001',
      priority: 'high' as const,
      title: 'Increase Training Completion',
      description: 'Security awareness training is crucial for employee preparedness',
      action: 'training_assignment',
      estimatedImpact: 15 - breakdown.trainingScore,
      implementationDifficulty: 'easy' as const,
    });
  }

  // Password Recommendations
  if (breakdown.passwordScore < 10) {
    recommendations.push({
      id: 'password-001',
      priority: 'high' as const,
      title: 'Strengthen Password Policies',
      description: 'Enforce regular password changes and complexity requirements',
      action: 'password_policy_update',
      estimatedImpact: 10 - breakdown.passwordScore,
      implementationDifficulty: 'medium' as const,
    });
  }

  return recommendations;
}

export { ScoreBreakdown, SecurityScoreResult, SecurityScoreInput };
