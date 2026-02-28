'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface ThreatCardProps {
  threats: number;
}

export function ThreatCard({ threats }: ThreatCardProps) {
  const getThreatColor = () => {
    if (threats === 0) return 'text-green-600 dark:text-green-400';
    if (threats < 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getThreatBadge = () => {
    if (threats === 0) return 'bg-green-100 text-green-800';
    if (threats < 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Active Threats
        </h3>
        <AlertTriangle className={`h-5 w-5 ${getThreatColor()}`} />
      </div>

      <div className={`${getThreatColor()} text-4xl font-bold mb-4`}>
        {threats}
      </div>

      <Badge className={getThreatBadge()}>
        {threats === 0
          ? 'No threats'
          : threats < 5
          ? 'Low risk'
          : 'High risk'}
      </Badge>

      <p className="text-xs text-slate-500 mt-4">
        {threats === 0
          ? 'System is secure'
          : `${threats} threats detected`}
      </p>
    </Card>
  );
}
