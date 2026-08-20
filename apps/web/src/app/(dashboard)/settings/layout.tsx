'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Building2, Settings as SettingsIcon, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SETTINGS_TABS = [
  { label: 'Company', href: '/settings/company', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Profile', href: '/settings/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Security', href: '/settings/security', icon: <Shield className="w-5 h-5" /> },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Settings"
        description="Manage your account, profile, and security preferences."
        icon={<SettingsIcon className="w-6 h-6 text-brand-500" />}
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            {SETTINGS_TABS.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-200 dark:border-brand-800'
                      : 'text-slate-500 hover:text-brand-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-brand-300 dark:hover:bg-brand-900/30'
                  }`}
                >
                  <div className={isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}>
                    {tab.icon}
                  </div>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
