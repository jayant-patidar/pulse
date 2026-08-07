'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/core/providers/auth-provider';
import { QueryProvider } from '@/core/providers/query-provider';
import { SocketProvider } from '@/core/providers/socket-provider';
import { CommandPalette } from '@/components/ui/CommandPalette';

import { ThemeProvider } from '@/core/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  LayoutDashboard,
  HardHat,
  ListTodo,
  ClipboardList,
  FileText,
  Tractor,
  Settings,
  LogOut,
  Search,
  Menu,
  Bell
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: <HardHat className="w-5 h-5" />,
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: <ListTodo className="w-5 h-5" />,
  },
  {
    label: 'Daily Reports',
    href: '/reports',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Equipment',
    href: '/equipment',
    icon: <Tractor className="w-5 h-5" />,
  },
];

const BOTTOM_NAV = [
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-64 flex flex-col
          border-r border-brand-800 bg-brand-950 shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-brand-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-md shadow-accent-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">Pulse</span>
          <span className="ml-auto hidden sm:inline text-[10px] font-bold text-accent-500 bg-accent-500/10 px-1.5 py-0.5 rounded-md border border-accent-500/20 uppercase tracking-wider">
            Beta
          </span>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Search shortcut */}
        <div className="px-3 pt-4 pb-2">
          <button 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-900/50 border border-brand-800 text-sm text-brand-400 hover:border-brand-600 hover:text-brand-200 transition-all duration-200"
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="ml-auto text-[10px] text-brand-500 font-mono bg-brand-950 px-1.5 py-0.5 rounded border border-brand-800 hidden sm:inline">⌘K</kbd>
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
               <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={isActive ? 'nav-item-active' : 'nav-item'}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-2 space-y-1 border-t border-brand-800">
          {BOTTOM_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={isActive ? 'nav-item-active' : 'nav-item'}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-brand-800 bg-brand-900/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 border border-brand-400/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.role?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-100 truncate">
                {user?.role || 'User'}
              </p>
              <p className="text-xs text-brand-400 truncate">
                Org: {user?.orgId?.slice(-6) || '...'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-all duration-200 shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const pageTitle = NAV_ITEMS.find(i => pathname.includes(i.href))?.label || 'Dashboard';

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-brand-200 dark:border-brand-800 transition-colors">
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900 transition-all duration-200 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </div>

        {/* Breadcrumb / Title (Desktop) */}
        <div className="hidden lg:flex items-center text-sm font-medium text-brand-400">
          <span className="hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer">Pulse</span>
          <span className="mx-2">/</span>
          <span className="text-brand-900 dark:text-brand-100">{pageTitle}</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button 
          onClick={async () => {
            const { api } = await import('@/core/lib/api-client');
            await api.get('/notifications/test-trigger');
          }}
          className="relative p-2 rounded-xl text-brand-500 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-800 hover:text-brand-900 dark:hover:text-brand-100 transition-all duration-200"
          title="Click to trigger a test notification"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white dark:ring-brand-950" />
        </button>
      </div>
    </header>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Expose setCmdOpen to the search buttons via a custom event listener
  import('react').then((React) => {
    // We already use the useEffect pattern inside CommandPalette, but to open it via click we can just listen to the same shortcut
  });

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950 text-brand-900 dark:text-brand-100 transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-8 animate-in">{children}</main>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QueryProvider>
          <SocketProvider>
            <DashboardShell>{children}</DashboardShell>
          </SocketProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
