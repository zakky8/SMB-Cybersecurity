'use client';

import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface EmailWidgetProps {
  blocked: number;
}

export function EmailWidget({ blocked }: EmailWidgetProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Emails Blocked
        </h3>
        <Mail className="h-5 w-5 text-orange-500" />
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {blocked}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          This month
        </p>
      </div>

      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400"></span>
        Threats prevented
      </div>
    </Card>
  );
}
