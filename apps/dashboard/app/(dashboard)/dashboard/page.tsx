'use client';

import { useEffect, useState } from 'react';
import { SecurityScoreWidget } from '@/components/dashboard/security-score-widget';
import { ThreatCard } from '@/components/dashboard/threat-card';
import { DeviceStatus } from '@/components/dashboard/device-status';
import { MFAStatus } from '@/components/dashboard/mfa-status';
import { EmailWidget } from '@/components/dashboard/email-widget';
import { BreachAlert } from '@/components/dashboard/breach-alert';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

interface DashboardStats {
  activeThreats: number;
  devicesSecure: number;
  devicesTotal: number;
  emailsBlocked: number;
  mfaEnabled: boolean;
  breachedPasswords: number;
  securityScore: number;
  employees: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityTrend, setSecurityTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsRes, trendRes] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getSecurityTrend(30),
        ]);
        setStats(statsRes.data);
        setSecurityTrend(trendRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Security Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor and manage your organization's security posture
        </p>
      </div>

      {stats?.breachedPasswords > 0 && (
        <BreachAlert count={stats.breachedPasswords} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </>
        ) : stats ? (
          <>
            <SecurityScoreWidget
              score={stats.securityScore}
              trend={securityTrend}
            />
            <ThreatCard threats={stats.activeThreats} />
            <DeviceStatus
              secure={stats.devicesSecure}
              total={stats.devicesTotal}
            />
            <MFAStatus enabled={stats.mfaEnabled} employees={stats.employees} />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Security Trend (30 Days)
            </h2>
            {securityTrend.length > 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <p>Chart visualization will be rendered here</p>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                <p>No data available</p>
              </div>
            )}
          </Card>
        </div>
        <EmailWidget blocked={stats?.emailsBlocked || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Review Active Threats
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Launch Phishing Simulation
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Manage Integrations
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                New threat detected
              </span>
              <span className="text-slate-500">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                MFA enabled for user
              </span>
              <span className="text-slate-500">5 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Device scanned
              </span>
              <span className="text-slate-500">1 day ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
