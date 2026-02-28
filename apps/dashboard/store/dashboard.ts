import { create } from 'zustand';

export interface DashboardState {
  stats: {
    activeThreats: number;
    devicesSecure: number;
    devicesTotal: number;
    emailsBlocked: number;
    mfaEnabled: boolean;
    breachedPasswords: number;
    securityScore: number;
    employees: number;
  };
  loading: boolean;
  error: string | null;
  setStats: (stats: DashboardState['stats']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSecurityScore: (score: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    activeThreats: 0,
    devicesSecure: 0,
    devicesTotal: 0,
    emailsBlocked: 0,
    mfaEnabled: false,
    breachedPasswords: 0,
    securityScore: 0,
    employees: 0,
  },
  loading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateSecurityScore: (score) =>
    set((state) => ({
      stats: { ...state.stats, securityScore: score },
    })),
}));

export interface UserState {
  userId: string | null;
  orgId: string | null;
  role: 'admin' | 'manager' | 'user' | null;
  setUser: (userId: string, orgId: string, role: 'admin' | 'manager' | 'user') => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  orgId: null,
  role: null,
  setUser: (userId, orgId, role) => set({ userId, orgId, role }),
  logout: () => set({ userId: null, orgId: null, role: null }),
}));

export interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
  }>;
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (type, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now().toString(),
          type,
          message,
          timestamp: Date.now(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
