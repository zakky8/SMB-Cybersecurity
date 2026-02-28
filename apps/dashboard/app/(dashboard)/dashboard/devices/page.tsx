'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Smartphone, Monitor, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'laptop';
  status: 'secure' | 'warning' | 'critical';
  lastSeen: string;
  osVersion: string;
  threats: number;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getDevices();
        setDevices(res.data || []);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        toast.error('Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'desktop':
        return <Monitor className="h-6 w-6" />;
      default:
        return <Smartphone className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Device Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor and manage enrolled devices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Devices
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {devices.length}
              </p>
            </div>
            <Monitor className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Secure
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {devices.filter(d => d.status === 'secure').length}
              </p>
            </div>
            <Lock className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                At Risk
              </p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {devices.filter(d => d.status !== 'secure').length}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading devices...</div>
        </div>
      ) : devices.length === 0 ? (
        <Card className="p-8 text-center">
          <Monitor className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No devices enrolled yet
          </p>
          <Button className="mt-4">Enroll Device</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <Card key={device.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {device.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {device.type}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(device.status)}>
                  {device.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    OS Version:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {device.osVersion}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Active Threats:
                  </span>
                  <span
                    className={`font-medium ${
                      device.threats > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {device.threats}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Last Seen:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {new Date(device.lastSeen).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
