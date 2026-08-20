'use client';

import { CommandPalette } from '@/components/ui/CommandPalette';
import { api } from '@/core/lib/api-client';
import { AuthProvider, useAuth } from '@/core/providers/auth-provider';
import { QueryProvider } from '@/core/providers/query-provider';
import { SocketProvider } from '@/core/providers/socket-provider';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/ui/Logo';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useVocabulary } from '@/core/lib/vocabulary';
import { ThemeProvider } from '@/core/providers/theme-provider';
import {
  ClipboardList,
  Clock,
  FileText,
  HardHat,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Search,
  Settings,
  Tractor
} from 'lucide-react';

const BASE_NAV_ITEMS = [
  {
    label: 'Portfolio Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'All Projects',
    href: '/projects',
    icon: <HardHat className="w-5 h-5" />,
  },
  {
    label: 'Company Fleet',
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

const PROJECT_NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Tasks & Schedule', href: '/tasks', icon: <ListTodo className="w-5 h-5" /> },
  { label: 'Field Operations', href: '/reports', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Project Fleet', href: '/equipment', icon: <Tractor className="w-5 h-5" /> },
  { label: 'Documents', href: '/documents', icon: <FileText className="w-5 h-5" /> },
  { label: 'Timesheets', href: '/timesheets', icon: <Clock className="w-5 h-5" /> },
  { label: 'Finance', href: '/finance', icon: <Settings className="w-5 h-5" /> },
  { label: 'Procurement', href: '/procurement', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Compliance', href: '/compliance', icon: <HardHat className="w-5 h-5" /> },
  { label: 'Directory', href: '/directory', icon: <Settings className="w-5 h-5" /> },
];

const AGRICULTURE_PROJECT_NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Tasks & Activities', href: '/tasks', icon: <ListTodo className="w-5 h-5" /> },
  { label: 'Field Reports', href: '/reports', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Farm Equipment', href: '/equipment', icon: <Tractor className="w-5 h-5" /> },
  { label: 'Documents', href: '/documents', icon: <FileText className="w-5 h-5" /> },
  { label: 'Timesheets', href: '/timesheets', icon: <Clock className="w-5 h-5" /> },
  { label: 'Crop Cycles', href: '/crop-cycles', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Scouting', href: '/scouting', icon: <HardHat className="w-5 h-5" /> },
  { label: 'Harvests', href: '/harvests', icon: <Settings className="w-5 h-5" /> },
  { label: 'Compliance', href: '/agr-compliance', icon: <FileText className="w-5 h-5" /> },
  { label: 'Directory', href: '/directory', icon: <Settings className="w-5 h-5" /> },
];

const INSPECTION_PROJECT_NAV_ITEMS = [
  { label: 'Site Overview', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Work Orders', href: '/tasks', icon: <ListTodo className="w-5 h-5" /> },
  { label: 'Inspector Logs', href: '/reports', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Inspection Kits', href: '/equipment', icon: <HardHat className="w-5 h-5" /> },
  { label: 'Documents', href: '/documents', icon: <FileText className="w-5 h-5" /> },
  { label: 'Inspections', href: '/inspections', icon: <Search className="w-5 h-5" /> },
  { label: 'Findings', href: '/findings', icon: <FileText className="w-5 h-5" /> },
  { label: 'Certifications', href: '/certifications', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Corrective Actions', href: '/corrective-actions', icon: <ListTodo className="w-5 h-5" /> },
  { label: 'Directory', href: '/directory', icon: <Settings className="w-5 h-5" /> },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const vocabulary = useVocabulary();
  
  // Detect if we are inside a project workspace
  const projectMatch = pathname.match(/^\/projects\/([a-f\d]{24})\//i);
  const projectId = projectMatch ? projectMatch[1] : null;
  
  const { data: organization } = useQuery({
    queryKey: ['organization', user?.orgId],
    queryFn: async () => {
      const res = await api.get<any>(`/root/organizations/${user?.orgId}`);
      return res;
    },
    enabled: !!user?.orgId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/trunk/projects/${projectId}`);
      return res;
    },
    enabled: !!projectId,
  });

  let activeProjectNavItems = PROJECT_NAV_ITEMS;
  if (project?.industry === 'AGRICULTURE') {
    activeProjectNavItems = AGRICULTURE_PROJECT_NAV_ITEMS;
  } else if (project?.industry === 'INSPECTION_SERVICES') {
    activeProjectNavItems = INSPECTION_PROJECT_NAV_ITEMS;
  }

  const mappedBaseNav = BASE_NAV_ITEMS.map(item => 
    item.href === '/projects' ? { ...item, label: vocabulary.projects } : item
  );

  const baseNavWithAddons = [...mappedBaseNav];
  if (organization?.industry === 'AGRICULTURE') {
    baseNavWithAddons.push({
      label: 'Inputs Inventory',
      href: '/inputs',
      icon: <ClipboardList className="w-5 h-5" />,
    });
  }

  const currentNavItems = projectId 
    ? activeProjectNavItems.map(item => ({ ...item, href: `/projects/${projectId}${item.href}` }))
    : baseNavWithAddons;


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-900/40 dark:bg-brand-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-64 flex flex-col
          border-r border-brand-200 dark:border-brand-800 bg-white dark:bg-brand-950 shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Context Switcher */}
        <div className="flex flex-col justify-center px-5 h-16 border-b border-brand-200 dark:border-brand-800">
          <div className="flex items-center gap-3">
            {projectId && (
              <Link href="/projects" className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-md shadow-accent-500/20 shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-display font-bold text-brand-900 dark:text-white tracking-tight truncate">
                {projectId ? (project?.name || 'Loading Project...') : <Logo />}
              </span>
              {projectId && (
                <span className="text-[10px] text-brand-500 dark:text-brand-400 font-medium truncate uppercase tracking-wider">
                  Return to Portfolio
                </span>
              )}
            </div>
            
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="ml-auto p-1.5 rounded-lg text-brand-500 dark:text-brand-400 hover:text-brand-900 dark:hover:text-white hover:bg-brand-100 dark:hover:bg-white/10 lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search shortcut */}
        <div className="px-3 pt-4 pb-2">
          <button 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800 text-sm text-brand-500 dark:text-brand-400 hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-900 dark:hover:text-brand-200 transition-all duration-200"
          >
            <Search className="w-4 h-4" />
            <span>Search {projectId ? 'Project' : 'Portfolio'}...</span>
            <kbd className="ml-auto text-[10px] text-brand-400 dark:text-brand-500 font-mono bg-white dark:bg-brand-950 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800 hidden sm:inline">⌘K</kbd>
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto mt-2">
          {currentNavItems.map((item) => {
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
        <div className="px-3 py-2 space-y-1 border-t border-brand-200 dark:border-brand-800">
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
        <div className="px-3 py-3 border-t border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 border border-brand-200 dark:border-brand-400/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {(user?.name?.[0] || user?.role?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-900 dark:text-brand-100 truncate">
                {user?.name || user?.role || 'User'}
              </p>
              <p className="text-xs text-brand-500 dark:text-brand-400 truncate">
                {user?.role || 'Role'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-brand-500 dark:text-brand-400 hover:text-brand-900 dark:hover:text-white hover:bg-brand-200 dark:hover:bg-brand-800 transition-all duration-200 shrink-0"
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
  const vocabulary = useVocabulary();
  
  // Detect if we are inside a project workspace
  const projectMatch = pathname.match(/^\/projects\/([a-f\d]{24})/i);
  const projectId = projectMatch ? projectMatch[1] : null;
  
  // Fetch project to get the name (this uses React Query cache from Sidebar)
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/trunk/projects/${projectId}`);
      return res;
    },
    enabled: !!projectId,
  });
  
  // Combine all possible nav items
  const projectNavItems = projectId 
    ? PROJECT_NAV_ITEMS.map(item => ({ ...item, href: `/projects/${projectId}${item.href}` }))
    : [];
    
  const mappedBaseNav = BASE_NAV_ITEMS.map(item => 
    item.href === '/projects' ? { ...item, label: vocabulary.projects } : item
  );
  
  const allNavItems = [...projectNavItems, ...mappedBaseNav].sort((a, b) => b.href.length - a.href.length);
  const pageTitle = allNavItems.find(i => pathname.includes(i.href))?.label || 'Dashboard';

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
        <div className="flex items-center lg:hidden scale-75 origin-left">
          <Logo />
        </div>

        {/* Page Title (Desktop) */}
        <div className="hidden lg:flex items-center text-sm font-medium text-brand-900 dark:text-brand-100">
          {projectId && project ? (
            <>
              <span className="text-brand-500 dark:text-brand-400">{project.name}</span>
              <span className="mx-2 text-brand-300 dark:text-brand-700">/</span>
              <span>{pageTitle}</span>
            </>
          ) : (
            <span>{pageTitle}</span>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Detect if we are inside a project workspace
  const projectMatch = pathname.match(/^\/projects\/([a-f\d]{24})/i);
  const projectId = projectMatch ? projectMatch[1] : null;

  const { data: organization } = useQuery({
    queryKey: ['organization', user?.orgId],
    queryFn: async () => {
      const res = await api.get<any>(`/root/organizations/${user?.orgId}`);
      return res;
    },
    enabled: !!user?.orgId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/trunk/projects/${projectId}`);
      return res;
    },
    enabled: !!projectId,
  });

  const activeIndustry = project?.industry || organization?.industry;

  useEffect(() => {
    if (activeIndustry) {
      localStorage.setItem('pulse-industry', activeIndustry);
      document.documentElement.setAttribute('data-industry', activeIndustry);
    }
  }, [activeIndustry]);

  import('react').then((React) => {
    // expose setCmdOpen
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
