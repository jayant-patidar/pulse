import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { ThemeProvider } from '@/core/providers/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Pulse — Field Operations Platform',
  description:
    'The Operating System for Field Operations. Manage projects, teams, documents, and operations from one intelligent platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-brand-900 antialiased selection:bg-accent-500/30 selection:text-accent-700`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
