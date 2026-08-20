import { Toaster } from '@/components/ui/Toaster';
import { ThemeProvider } from '@/core/providers/theme-provider';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var ind = localStorage.getItem('pulse-industry');
                if (ind) document.documentElement.setAttribute('data-industry', ind);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-brand-900 dark:bg-slate-950 dark:text-slate-50 antialiased selection:bg-accent-500/30 selection:text-accent-700`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
