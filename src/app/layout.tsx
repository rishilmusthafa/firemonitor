import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/components/Providers';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "FireMonitor - Real-Time Fire Alarm Monitoring",
  description: "24/7 Fire Monitoring Dashboard for UAE Villas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundaryWrapper>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
