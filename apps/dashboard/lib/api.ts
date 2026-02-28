import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Guard against SSR — localStorage and window only exist in browser
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Dashboard
  getDashboardStats: () => api.get('/v1/dashboard/stats'),
  getSecurityScore: () => api.get('/v1/dashboard/security-score'),
  getSecurityTrend: (days: number = 30) =>
    api.get(`/v1/dashboard/trend?days=${days}`),

  // Threats
  getThreats: (status?: string) =>
    api.get('/v1/threats', { params: { status } }),
  getThreatById: (id: string) => api.get(`/v1/threats/${id}`),
  resolveThreats: (ids: string[], action: string) =>
    api.post('/v1/threats/resolve', { ids, action }),

  // Devices
  getDevices: () => api.get('/v1/devices'),
  getDeviceById: (id: string) => api.get(`/v1/devices/${id}`),
  enrollDevice: (name: string, type: string) =>
    api.post('/v1/devices/enroll', { name, type }),
  updateDeviceStatus: (id: string, status: string) =>
    api.patch(`/v1/devices/${id}`, { status }),

  // Employees
  getEmployees: () => api.get('/v1/employees'),
  getEmployeeById: (id: string) => api.get(`/v1/employees/${id}`),
  inviteEmployee: (email: string, role: string) =>
    api.post('/v1/employees/invite', { email, role }),
  updateEmployee: (id: string, data: Record<string, unknown>) =>
    api.patch(`/v1/employees/${id}`, data),
  removeEmployee: (id: string) => api.delete(`/v1/employees/${id}`),

  // Breach / Passwords
  getBreachAlerts: () => api.get('/v1/breach'),
  acknowledgeBreachAlert: (id: string) =>
    api.patch(`/v1/breach/${id}/acknowledge`),
  checkPasswordBreach: (hash: string) =>
    api.post('/v1/breach/check-password', { hash }),

  // Email scans
  getEmailScans: () => api.get('/v1/email-scans'),
  getQuarantinedEmails: () =>
    api.get('/v1/email-scans', { params: { quarantined: true } }),
  releaseQuarantinedEmail: (id: string) =>
    api.post(`/v1/email-scans/${id}/release`, {}),

  // DNS
  getDNSBlocklist: () => api.get('/v1/dns/blocklist'),
  addDNSBlock: (domain: string, reason: string) =>
    api.post('/v1/dns/blocklist', { domain, reason }),
  removeDNSBlock: (id: string) => api.delete(`/v1/dns/blocklist/${id}`),

  // Simulations
  getSimulations: () => api.get('/v1/simulations'),
  launchSimulation: (templateId?: number) =>
    api.post('/v1/simulations', { templateId }),
  getSimulationResults: (id: string) =>
    api.get(`/v1/simulations/${id}/results`),

  // Training
  getTrainingModules: () => api.get('/v1/training'),
  getTrainingProgress: () => api.get('/v1/training/progress'),
  completeModule: (moduleId: string) =>
    api.post(`/v1/training/${moduleId}/complete`, {}),

  // Reports
  getMonthlyReport: (month: string) =>
    api.get(`/v1/reports/monthly?month=${month}`),
  downloadReport: () => api.get('/v1/reports/monthly/pdf', { responseType: 'blob' }),

  // Organizations
  getOrgSettings: () => api.get('/v1/organizations/settings'),
  updateOrgSettings: (settings: Record<string, unknown>) =>
    api.patch('/v1/organizations/settings', settings),

  // Billing
  createCheckoutSession: (priceId: string) =>
    api.post('/v1/billing/checkout', { priceId }),
  getBillingInfo: () => api.get('/v1/billing/info'),
  createPortalSession: () => api.post('/v1/billing/portal', {}),
};

export default api;
