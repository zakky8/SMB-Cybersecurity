'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { BarChart3, Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface MonthlyReport {
  month: string;
  activeThreats: number;
  devicesManaged: number;
  emailsBlocked: number;
  trainingCompleted: number;
  securityScore: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getMonthlyReport(selectedMonth);
        setReports([res.data]);
      } catch (error) {
        console.error('Failed to fetch report:', error);
        toast.error('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedMonth]);

  const handleDownload = async (format: 'pdf' | 'csv') => {
    try {
      const res = await apiClient.generateReport(format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Security Reports
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and download detailed security reports
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleDownload('pdf')}
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleDownload('csv')}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading report...</div>
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No report available for selected month
          </p>
        </Card>
      ) : (
        reports.map((report, idx) => (
          <div key={idx} className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {new Date(report.month).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
                {''} Report
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive security metrics and insights
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Active Threats
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {report.activeThreats}
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-red-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Devices Managed
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {report.devicesManaged}
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Emails Blocked
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {report.emailsBlocked}
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-orange-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Training Completed
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {report.trainingCompleted}%
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-green-500" />
                </div>
              </Card>

              <Card className="p-6 md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Overall Security Score
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {report.securityScore}/100
                    </p>
                  </div>
                  <div className="flex-1 ml-8">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-600 to-blue-600 h-full transition-all"
                        style={{
                          width: `${report.securityScore}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Key Recommendations
              </h3>
              <ul className="space-y-2">
                {report.activeThreats > 5 && (
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Investigate and remediate active threats immediately
                    </span>
                  </li>
                )}
                {report.trainingCompleted < 80 && (
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">•</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Improve employee training completion rates
                    </span>
                  </li>
                )}
                {report.securityScore < 70 && (
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">•</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Prioritize security improvements across critical areas
                    </span>
                  </li>
                )}
              </ul>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
