'use client';

import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Bell, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

          <UserButton afterSignOutUrl="/auth/sign-in" />
        </div>
      </div>
    </header>
  );
}
