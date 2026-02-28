'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Settings, CreditCard, Zap, Bell, Key } from 'lucide-react';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  lastSync: string;
}

interface BillingInfo {
  plan: string;
  status: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'integrations' | 'billing' | 'notifications'>(
    'integrations'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [intRes, billRes] = await Promise.all([
          apiClient.getIntegrations(),
          apiClient.getBillingInfo(),
        ]);
        setIntegrations(intRes.data || []);
        setBilling(billRes.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error('Failed to load settings');
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
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage organization settings, billing, and integrations
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'integrations'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          <Zap className="h-4 w-4" />
          Integrations
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Billing
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading settings...</div>
        </div>
      ) : activeTab === 'integrations' ? (
        <div className="space-y-4">
          {integrations.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No integrations connected
              </p>
              <Button className="mt-4">Browse Integrations</Button>
            </Card>
          ) : (
            integrations.map((int) => (
              <Card key={int.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {int.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Type: {int.type}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Last synced:{' '}
                      {new Date(int.lastSync).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        int.status === 'connected'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {int.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {int.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}

          <Card className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600">
            <div className="text-center">
              <Zap className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Add Integration
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Connect more security tools to ShieldDesk
              </p>
              <Button>Browse Available Integrations</Button>
            </div>
          </Card>
        </div>
      ) : activeTab === 'billing' ? (
        billing ? (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Current Plan
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    Plan
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 capitalize">
                    {billing.plan}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    Status
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-800 capitalize">
                    {billing.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Next billing date
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {new Date(billing.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600 dark:text-slate-400">
                      Amount
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {billing.currency} {billing.amount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button>Update Payment Method</Button>
                <Button variant="outline">Download Invoice</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Upgrade Plan
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Get more features and users with our premium plans
              </p>
              <Button>View Available Plans</Button>
            </Card>
          </div>
        ) : null
      ) : (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Email Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Critical Threats
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Alert when critical threats are detected
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Weekly Digest
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive weekly security summary
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Training Reminders
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Remind employees to complete training
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
            </div>
            <Button className="mt-6">Save Preferences</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
