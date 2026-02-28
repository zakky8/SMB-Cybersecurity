'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Globe, Cloud, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface DNSLog {
  id: string;
  domain: string;
  timestamp: string;
  category: string;
  status: 'allowed' | 'blocked';
  device: string;
}

interface CloudApp {
  id: string;
  name: string;
  category: string;
  users: number;
  riskLevel: 'low' | 'medium' | 'high';
  permissions: string[];
}

export default function NetworkPage() {
  const [dnsLogs, setDnsLogs] = useState<DNSLog[]>([]);
  const [cloudApps, setCloudApps] = useState<CloudApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dns' | 'apps'>('dns');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dnsRes, appsRes] = await Promise.all([
          apiClient.getDNSLogs(),
          apiClient.getCloudApps(),
        ]);
        setDnsLogs(dnsRes.data || []);
        setCloudApps(appsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch network data:', error);
        toast.error('Failed to load network data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Network Security
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor DNS activity and cloud application permissions
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('dns')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'dns'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          DNS Logs
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'apps'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          Cloud Applications
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading network data...</div>
        </div>
      ) : activeTab === 'dns' ? (
        <div className="space-y-4">
          {dnsLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No DNS logs available
              </p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      Domain
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      Device
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dnsLogs.slice(0, 20).map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm text-slate-900 dark:text-white">
                        {log.domain}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {log.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {log.device}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            log.status === 'allowed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {cloudApps.length === 0 ? (
            <Card className="p-8 text-center">
              <Cloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No cloud applications detected
              </p>
            </Card>
          ) : (
            cloudApps.map((app) => (
              <Card key={app.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {app.name}
                      </p>
                      <Badge className={getRiskColor(app.riskLevel)}>
                        {app.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {app.category} • {app.users} users
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.permissions.map((perm, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs"
                        >
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4">
                    Manage
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
