import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clerk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  getSecurityScore: () => api.get('/dashboard/security-score'),
  getSecurityTrend: (days: number = 30) => api.get(`/dashboard/trend?days=${days}`),

  // Threats
  getThreats: (status?: string) => api.get('/threats', { params: { status } }),
  getThreatById: (id: string) => api.get(`/threats/${id}`),
  resolveThreats: (ids: string[], action: string) => api.post('/threats/resolve', { ids, action }),
  quarantineEmails: (emails: string[]) => api.post('/threats/quarantine', { emails }),

  // Devices
  getDevices: () => api.get('/devices'),
  getDeviceById: (id: string) => api.get(`/devices/${id}`),
  enrollDevice: (name: string, type: string) => api.post('/devices/enroll', { name, type }),
  updateDeviceStatus: (id: string, status: string) => api.patch(`/devices/${id}`, { status }),
  getDeviceSecurity: (id: string) => api.get(`/devices/${id}/security`),

  // Employees
  getEmployees: () => api.get('/employees'),
  getEmployeeById: (id: string) => api.get(`/employees/${id}`),
  inviteEmployee: (email: string, role: string) => api.post('/employees/invite', { email, role }),
  updateEmployee: (id: string, data: any) => api.patch(`/employees/${id}`, data),
  removeEmployee: (id: string) => api.delete(`/employees/${id}`),

  // Passwords
  getBreachedPasswords: () => api.get('/passwords/breached'),
  checkPasswordBreach: (password: string) => api.post('/passwords/check', { password }),
  getPasswordStats: () => api.get('/passwords/stats'),

  // Email
  getEmailThreats: () => api.get('/email/threats'),
  getQuarantineEmails: () => api.get('/email/quarantine'),
  releaseQuarantineEmail: (id: string) => api.post(`/email/quarantine/${id}/release`, {}),
  deleteQuarantineEmail: (id: string) => api.delete(`/email/quarantine/${id}`),

  // Network
  getDNSLogs: () => api.get('/network/dns'),
  getCloudApps: () => api.get('/network/cloud-apps'),
  updateCloudAppPermission: (id: string, permission: string) => api.patch(`/network/cloud-apps/${id}`, { permission }),

  // Training
  getSimulations: () => api.get('/training/simulations'),
  getSimulationResults: () => api.get('/training/results'),
  launchSimulation: (userIds: string[]) => api.post('/training/simulate', { userIds }),
  getTrainingCompletion: () => api.get('/training/completion'),

  // MFA
  getMFAStatus: () => api.get('/mfa/status'),
  enableMFA: (userId: string) => api.post(`/mfa/${userId}/enable`, {}),
  disableMFA: (userId: string) => api.post(`/mfa/${userId}/disable`, {}),

  // Organization
  getOrgSettings: () => api.get('/organization/settings'),
  updateOrgSettings: (settings: any) => api.patch('/organization/settings', settings),
  getBillingInfo: () => api.get('/organization/billing'),
  getIntegrations: () => api.get('/organization/integrations'),
  connectIntegration: (type: string, credentials: any) => api.post('/organization/integrations', { type, credentials }),

  // Reports
  getMonthlyReport: (month: string) => api.get(`/reports/monthly?month=${month}`),
  generateReport: (format: 'pdf' | 'csv') => api.get(`/reports/generate?format=${format}`),
  getReportSchedule: () => api.get('/reports/schedule'),
  updateReportSchedule: (schedule: any) => api.patch('/reports/schedule', schedule),

  // Onboarding
  completeOnboardingStep: (step: number) => api.post(`/onboarding/steps/${step}/complete`, {}),
  getOnboardingStatus: () => api.get('/onboarding/status'),
};

export default api;
