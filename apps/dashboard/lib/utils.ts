import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSecurityColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getSecurityBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 dark:bg-green-950';
  if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950';
  return 'bg-red-50 dark:bg-red-950';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'success':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export function calculateSecurityScore(data: {
  mfaEnabled: boolean;
  devicesSecure: number;
  devicesTotal: number;
  emailsBlocked: number;
  passwordsBreached: number;
  trainingCompleted: number;
  trainingTotal: number;
}): number {
  let score = 0;

  if (data.mfaEnabled) score += 20;
  if (data.devicesTotal > 0) {
    const deviceSecurity = (data.devicesSecure / data.devicesTotal) * 20;
    score += deviceSecurity;
  }
  if (data.emailsBlocked > 0) score += 15;
  if (data.passwordsBreached === 0) score += 20;
  if (data.trainingTotal > 0) {
    const trainingProgress = (data.trainingCompleted / data.trainingTotal) * 25;
    score += trainingProgress;
  }

  return Math.min(100, Math.round(score));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
