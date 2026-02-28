'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Key, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BreachedPassword {
  id: string;
  service: string;
  email: string;
  breachDate: string;
  status: 'active' | 'remediated' | 'pending';
  severity: 'critical' | 'high';
}

export default function PasswordsPage() {
  const [breached, setBreached] = useState<BreachedPassword[]>([]);
  const [stats, setStats] = useState({
    totalBreaches: 0,
    remediatedCount: 0,
    activeBreaches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [breachedRes, statsRes] = await Promise.all([
          apiClient.getBreachedPasswords(),
          apiClient.getPasswordStats(),
        ]);
        setBreached(breachedRes.data || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch password data:', error);
        toast.error('Failed to load password data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Password Manager
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor password breaches and security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Breaches Detected
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {stats.totalBreaches}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Active Breaches
              </p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.activeBreaches}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Remediated
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.remediatedCount}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Key className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">
              Password Breach Tip
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Users with breached passwords should change them immediately and enable two-factor authentication.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading password data...</div>
        </div>
      ) : breached.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No breached passwords detected
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {breached.map((breach) => (
            <Card
              key={breach.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {breach.service}
                    </p>
                    <Badge
                      className={
                        breach.status === 'remediated'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {breach.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Email: {breach.email}
                  </p>
                  <p className="text-sm text-slate-500">
                    Detected: {new Date(breach.breachDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="ml-4"
                  disabled={breach.status === 'remediated'}
                >
                  {breach.status === 'remediated' ? 'Remediated' : 'Resolve'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
