'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Mail,
  Smartphone,
  Key,
  Globe,
  BookOpen,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { label: 'Email Security', icon: Mail, href: '/dashboard/email' },
  { label: 'Devices', icon: Smartphone, href: '/dashboard/devices' },
  { label: 'Passwords', icon: Key, href: '/dashboard/passwords' },
  { label: 'Network', icon: Globe, href: '/dashboard/network' },
  { label: 'Training', icon: BookOpen, href: '/dashboard/training' },
  { label: 'Employees', icon: Users, href: '/dashboard/employees' },
  { label: 'Reports', icon: FileText, href: '/dashboard/reports' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-lg">ShieldDesk</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
        className={cn(
          'transition-all duration-300',
          isOpen ? 'ml-64' : 'ml-20'
        )}
      />
    </>
  );
}
