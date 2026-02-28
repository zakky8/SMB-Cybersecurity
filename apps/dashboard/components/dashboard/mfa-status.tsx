'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface MFAStatusProps {
  enabled: boolean;
  employees: number;
}

export function MFAStatus({ enabled, employees }: MFAStatusProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          MFA Status
        </h3>
        <Shield className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-4">
        <Badge
          className={
            enabled
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      <p className="text-xs text-slate-500">
        {employees} users in organization
      </p>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          {enabled
            ? 'MFA is enabled for enhanced security'
            : 'Enable MFA to protect your accounts'}
        </p>
      </div>
    </Card>
  );
}
