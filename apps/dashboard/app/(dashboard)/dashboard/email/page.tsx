'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Mail, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Email {
  id: string;
  from: string;
  subject: string;
  timestamp: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

export default function EmailPage() {
  const [threats, setThreats] = useState<Email[]>([]);
  const [quarantine, setQuarantine] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'threats' | 'quarantine'>('threats');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [threatsRes, quarantineRes] = await Promise.all([
          apiClient.getEmailThreats(),
          apiClient.getQuarantineEmails(),
        ]);
        setThreats(threatsRes.data || []);
        setQuarantine(quarantineRes.data || []);
      } catch (error) {
        console.error('Failed to fetch email data:', error);
        toast.error('Failed to load email data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRelease = async (id: string) => {
    try {
      await apiClient.releaseQuarantineEmail(id);
      setQuarantine(quarantine.filter(e => e.id !== id));
      toast.success('Email released successfully');
    } catch (error) {
      toast.error('Failed to release email');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteQuarantineEmail(id);
      setQuarantine(quarantine.filter(e => e.id !== id));
      toast.success('Email deleted successfully');
    } catch (error) {
      toast.error('Failed to delete email');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Email Security
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor and manage email threats and quarantine
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('threats')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'threats'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          Active Threats ({threats.length})
        </button>
        <button
          onClick={() => setActiveTab('quarantine')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'quarantine'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          Quarantine ({quarantine.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading email data...</div>
        </div>
      ) : activeTab === 'threats' ? (
        <div className="space-y-4">
          {threats.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No active email threats detected
              </p>
            </Card>
          ) : (
            threats.map((email) => (
              <Card key={email.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {email.subject}
                      </p>
                      <Badge className={getRiskColor(email.risk)}>
                        {email.risk}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      From: {email.from}
                    </p>
                    <p className="text-sm text-slate-500">
                      Reason: {email.reason}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(email.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    Review
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {quarantine.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No quarantined emails
              </p>
            </Card>
          ) : (
            quarantine.map((email) => (
              <Card key={email.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">
                      {email.subject}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      From: {email.from}
                    </p>
                    <p className="text-sm text-slate-500 mb-2">
                      Reason: {email.reason}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(email.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRelease(email.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Release
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(email.id)}
                      className="flex items-center gap-1 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
