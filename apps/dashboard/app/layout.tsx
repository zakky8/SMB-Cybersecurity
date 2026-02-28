import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ShieldDesk - Cybersecurity Dashboard',
  description: 'Complete cybersecurity management for SMBs',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-white dark:bg-slate-950">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
