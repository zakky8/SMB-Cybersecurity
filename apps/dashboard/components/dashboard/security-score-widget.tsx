'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { getSecurityColor } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SecurityScoreWidgetProps {
  score: number;
  trend: Array<{ date: string; score: number }>;
}

export function SecurityScoreWidget({
  score,
  trend,
}: SecurityScoreWidgetProps) {
  const scoreColor = getSecurityColor(score);

  return (
    <Card className="p-6 col-span-1">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Security Score
        </h3>
        <div className="flex items-end gap-4">
          <div className={`${scoreColor} text-5xl font-bold`}>
            {score}
          </div>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium mb-2">
            <TrendingUp className="h-4 w-4" />
            +2 pts
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {score >= 80
            ? 'Excellent security posture'
            : score >= 60
            ? 'Good, but improvements needed'
            : 'Critical action required'}
        </p>
      </div>

      {trend.length > 0 && (
        <div className="h-16 -mx-4 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
