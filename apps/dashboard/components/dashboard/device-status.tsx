'use client';

import { Card } from '@/components/ui/card';
import { Smartphone, CheckCircle } from 'lucide-react';

interface DeviceStatusProps {
  secure: number;
  total: number;
}

export function DeviceStatus({ secure, total }: DeviceStatusProps) {
  const percentage = total > 0 ? Math.round((secure / total) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Device Security
        </h3>
        <Smartphone className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {percentage}%
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {secure} of {total} devices secure
        </p>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-green-600 h-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-2 mt-4 text-green-600 dark:text-green-400 text-xs font-medium">
        <CheckCircle className="h-3.5 w-3.5" />
        {percentage === 100 ? 'All devices secure' : `${total - secure} needs attention`}
      </div>
    </Card>
  );
}
