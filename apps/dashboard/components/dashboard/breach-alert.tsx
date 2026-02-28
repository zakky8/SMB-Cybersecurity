'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BreachAlertProps {
  count?: number;
  latestBreach?: {
    name: string;
    date: string;
    dataExposed: string[];
  };
}

export function BreachAlert({ count = 0, latestBreach }: BreachAlertProps) {
  if (count === 0) {
    return (
      <Card className="p-4 border-green-200 bg-green-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-green-800">
            No breach alerts
          </span>
          <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
            Clean
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-red-200 bg-red-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-red-800">
              {count} Breach Alert{count !== 1 ? 's' : ''}
            </span>
            <Badge className="bg-red-600 text-white text-xs">{count}</Badge>
          </div>
          {latestBreach && (
            <div className="mt-1">
              <p className="text-xs text-red-700 font-medium">
                {latestBreach.name}
              </p>
              <p className="text-xs text-red-600">
                {latestBreach.dataExposed.join(', ')} exposed
              </p>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 text-xs border-red-300 text-red-700 hover:bg-red-100"
          >
            View Details
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
