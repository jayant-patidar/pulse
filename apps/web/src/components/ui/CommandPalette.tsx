'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search, HardHat, FileText, Tractor, CheckSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  // Use debounced query for the API call to avoid spamming
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const res = await api.get<any>(`/search?q=${encodeURIComponent(debouncedQuery)}`);
      return res;
    },
    enabled: debouncedQuery.length > 0,
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-950/40 backdrop-blur-sm flex justify-center pt-[20vh] animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 z-[-1]" 
        onClick={() => setOpen(false)}
      />
      <Command
        className="w-full max-w-2xl bg-white dark:bg-brand-900 rounded-xl shadow-2xl border border-brand-200 dark:border-brand-800 overflow-hidden"
        shouldFilter={false} // We filter on the backend
      >
        <div className="flex items-center px-4 border-b border-brand-200 dark:border-brand-800" cmdk-input-wrapper="">
          <Search className="w-5 h-5 text-brand-400 mr-2 shrink-0" />
          <Command.Input 
            value={query}
            onValueChange={setQuery}
            autoFocus
            placeholder="Search projects, tasks, documents..."
            className="flex-1 h-14 bg-transparent outline-none border-none text-brand-900 dark:text-brand-100 placeholder-brand-400 font-medium"
          />
          <button onClick={() => setOpen(false)} className="text-brand-400 hover:text-brand-600 dark:hover:text-brand-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading && <Command.Loading className="p-4 text-center text-sm text-brand-500">Searching...</Command.Loading>}
          
          {!isLoading && query && data?.projects?.length === 0 && data?.tasks?.length === 0 && data?.documents?.length === 0 && data?.equipment?.length === 0 && (
            <Command.Empty className="p-6 text-center text-sm text-brand-500">No results found.</Command.Empty>
          )}

          {!query && (
            <div className="p-4 text-center text-sm text-brand-400">
              Type to start searching...
            </div>
          )}

          {data?.projects?.length > 0 && (
            <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase">Projects</div>}>
              {data.projects.map((p: any) => (
                <Command.Item
                  key={p._id}
                  value={p._id}
                  onSelect={() => {
                    router.push(`/projects/${p._id}`);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-800 text-brand-900 dark:text-brand-100 aria-selected:bg-brand-50 dark:aria-selected:bg-brand-800"
                >
                  <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-brand-500">{p.client}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data?.tasks?.length > 0 && (
            <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase mt-4">Tasks</div>}>
              {data.tasks.map((t: any) => (
                <Command.Item
                  key={t._id}
                  value={t._id}
                  onSelect={() => {
                    router.push(`/tasks/${t._id}`);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-800 text-brand-900 dark:text-brand-100 aria-selected:bg-brand-50 dark:aria-selected:bg-brand-800"
                >
                  <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.title}</div>
                    <div className="text-xs text-brand-500">{t.status}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data?.documents?.length > 0 && (
            <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase mt-4">Documents</div>}>
              {data.documents.map((d: any) => (
                <Command.Item
                  key={d._id}
                  value={d._id}
                  onSelect={() => {
                    router.push(`/documents`);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-800 text-brand-900 dark:text-brand-100 aria-selected:bg-brand-50 dark:aria-selected:bg-brand-800"
                >
                  <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{d.name}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data?.equipment?.length > 0 && (
            <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase mt-4">Equipment</div>}>
              {data.equipment.map((e: any) => (
                <Command.Item
                  key={e._id}
                  value={e._id}
                  onSelect={() => {
                    router.push(`/equipment`);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-800 text-brand-900 dark:text-brand-100 aria-selected:bg-brand-50 dark:aria-selected:bg-brand-800"
                >
                  <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{e.name}</div>
                    <div className="text-xs text-brand-500">{e.status}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

        </Command.List>
      </Command>
    </div>
  );
}
