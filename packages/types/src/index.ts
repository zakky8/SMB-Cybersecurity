// Organization and Account Types
export interface Organization {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'cancelled' | 'expired';
  trialEndsAt: Date | null;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  enableMFA: boolean;
  enableEmailNotifications: boolean;
  enableSlackNotifications: boolean;
  enableDarkMode: boolean;
  dataRetentionDays: number;
  complianceFramework: 'hipaa' | 'pci-dss' | 'gdpr' | 'sox' | 'none';
}

// Employee Types
export interface Employee {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager' | 'analyst';
  department: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
  mfaEnabled: boolean;
  mfaMethod: 'totp' | 'sms' | 'email' | null;
  passwordLastChanged: Date;
  status: 'active' | 'inactive' | 'suspended';
  riskScore: number;
}

// Device Types
export interface Device {
  id: string;
  organizationId: string;
  employeeId: string;
  deviceId: string;
  osType: 'macos' | 'windows' | 'linux' | 'ios' | 'android';
  osVersion: string;
  agentVersion: string;
  agentStatus: 'online' | 'offline' | 'outdated';
  lastSeen: Date;
  createdAt: Date;
  riskScore: number;
  encryptionEnabled: boolean;
  firewallEnabled: boolean;
  antivirus: AntividusStatus;
  compliance: DeviceCompliance;
}

export interface AntividusStatus {
  enabled: boolean;
  lastUpdated: Date;
  definitions: number;
}

export interface DeviceCompliance {
  passwordCompliant: boolean;
  encryptionCompliant: boolean;
  firewallCompliant: boolean;
  mfaCompliant: boolean;
  agentCompliant: boolean;
}

// Threat Types
export interface Threat {
  id: string;
  organizationId: string;
  deviceId: string;
  employeeId: string;
  threatType: ThreatType;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'detected' | 'quarantined' | 'resolved' | 'false_positive';
  threatName: string;
  threatDescription: string;
  filePath: string | null;
  fileHash: string | null;
  commandLine: string | null;
  processId: number | null;
  detectedAt: Date;
  resolvedAt: Date | null;
  actionTaken: string;
  metadata: Record<string, any>;
}

export type ThreatType = 
  | 'malware'
  | 'ransomware'
  | 'trojan'
  | 'exploit'
  | 'suspicious_script'
  | 'phishing_attempt'
  | 'privilege_escalation'
  | 'lateral_movement'
  | 'credential_theft'
  | 'unauthorized_access';

// Email Scan Types
export interface EmailScan {
  id: string;
  organizationId: string;
  employeeId: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  timestamp: Date;
  scanResult: 'safe' | 'phishing' | 'malware' | 'spam' | 'suspicious';
  riskScore: number;
  detectedThreats: string[];
  attachments: EmailAttachment[];
  urls: EmailUrl[];
  messageId: string;
  isPhishingSimulation: boolean;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  hash: string;
  threatStatus: 'safe' | 'malicious' | 'suspicious' | 'unknown';
}

export interface EmailUrl {
  url: string;
  threatStatus: 'safe' | 'malicious' | 'suspicious' | 'unknown';
  category: string;
  reputation: number;
}

// Phishing Simulation Types
export interface Simulation {
  id: string;
  organizationId: string;
  campaignName: string;
  description: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  templateId: string;
  templateName: string;
  targetEmployees: string[];
  targetDepartments: string[];
  scheduledAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metrics: SimulationMetrics;
}

export interface SimulationMetrics {
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalReported: number;
  openRate: number;
  clickRate: number;
  reportRate: number;
  failedDeliveries: number;
}

export interface SimulationResult {
  id: string;
  simulationId: string;
  employeeId: string;
  email: string;
  delivered: boolean;
  opened: boolean;
  openedAt: Date | null;
  clicked: boolean;
  clickedAt: Date | null;
  reported: boolean;
  reportedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
}

// Training Module Types
export interface TrainingModule {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: 'phishing' | 'malware' | 'password' | 'mfa' | 'social_engineering' | 'data_protection';
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

export interface TrainingAssignment {
  id: string;
  organizationId: string;
  trainingModuleId: string;
  employeeId: string;
  assignedAt: Date;
  dueAt: Date;
  completedAt: Date | null;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  score: number | null;
  attempts: number;
}

// Security Breach Alert Types
export interface BreachAlert {
  id: string;
  organizationId: string;
  alertType: BreachAlertType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detectedAt: Date;
  affectedDevices: string[];
  affectedEmployees: string[];
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  actionItems: ActionItem[];
  evidence: BreachEvidence[];
  metadata: Record<string, any>;
}

export type BreachAlertType = 
  | 'data_exfiltration'
  | 'unauthorized_access'
  | 'privilege_escalation'
  | 'lateral_movement'
  | 'persistence_mechanism'
  | 'credential_compromise'
  | 'policy_violation';

export interface ActionItem {
  id: string;
  action: string;
  assignedTo: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'completed';
  completedAt: Date | null;
}

export interface BreachEvidence {
  type: string;
  description: string;
  timestamp: Date;
  sourceDevice: string;
  additionalData: Record<string, any>;
}

// Security Score Types
export interface SecurityScore {
  id: string;
  organizationId: string;
  overallScore: number;
  scoreBreakdown: {
    mfaScore: number;
    agentScore: number;
    breachScore: number;
    trainingScore: number;
    simulationScore: number;
    passwordScore: number;
  };
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'excellent';
  trends: ScoreTrend[];
  recommendations: Recommendation[];
  calculatedAt: Date;
}

export interface ScoreTrend {
  date: Date;
  score: number;
  category: string;
}

export interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  estimatedImpact: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

// Dashboard Stats Types
export interface DashboardStats {
  organizationId: string;
  totalEmployees: number;
  totalDevices: number;
  activeThreats: number;
  resolvedThreats: number;
  threatsByType: Record<ThreatType, number>;
  avgSecurityScore: number;
  compliancePercentage: number;
  phishingSimulationClickRate: number;
  trainingCompletionRate: number;
  mfaEnrollmentRate: number;
  riskyDevices: number;
  riskyEmployees: number;
  recentAlerts: BreachAlert[];
  topThreats: Threat[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Authentication Types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: string;
  permissions: string[];
}

// WebSocket Event Types
export interface WebSocketMessage {
  type: 'threat' | 'alert' | 'device' | 'user' | 'training' | 'simulation';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  data: any;
  timestamp: Date;
}

export interface ThreatDetectionEvent {
  threatId: string;
  deviceId: string;
  employeeId: string;
  threatType: ThreatType;
  severity: string;
  timestamp: Date;
}

export interface DeviceStatusEvent {
  deviceId: string;
  employeeId: string;
  status: 'online' | 'offline';
  timestamp: Date;
}

// Report Types
export interface SecurityReport {
  id: string;
  organizationId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  summary: ReportSummary;
  threats: Threat[];
  devices: Device[];
  employees: Employee[];
  recommendations: Recommendation[];
}

export interface ReportSummary {
  totalThreatsDetected: number;
  totalThreatsResolved: number;
  averageResolutionTime: number;
  mostCommonThreatType: string;
  complianceScore: number;
  securityScore: number;
  incidentsSeverity: Record<string, number>;
}

// Notification Types
export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: 'threat' | 'alert' | 'training' | 'simulation' | 'device' | 'compliance';
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  read: boolean;
  createdAt: Date;
  readAt: Date | null;
  actionUrl: string | null;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  components: {
    database: ComponentHealth;
    cache: ComponentHealth;
    messageQueue: ComponentHealth;
    externalServices: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastChecked: Date;
}
