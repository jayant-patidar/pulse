'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Users, Mail, Phone, MessageSquare, ShieldCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';

export default function DirectoryPage() {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const { data: membersData } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => api.get<any>('/root/memberships'),
  });

  const rawMembers = Array.isArray(membersData) ? membersData : (membersData?.data || []);

  const directory = rawMembers.map((m: any, index: number) => {
    const user = m.user || {};
    return {
      id: m._id || index,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      role: m.role || 'Member',
      company: project?.name ? project.name + ' Team' : 'Contractor', // Derive from project context
      email: user.email || '',
      phone: user.phone || 'Not Provided',
      type: m.role === 'OWNER' || m.role === 'ADMIN' ? 'INTERNAL' : 'EXTERNAL',
      access: m.permissions || ['Standard'],
    };
  });

  const groupedDirectory = directory.reduce((acc: any, user: any) => {
    if (!acc[user.type]) acc[user.type] = [];
    acc[user.type]!.push(user);
    return acc;
  }, {} as Record<string, any[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INTERNAL': return 'General Contractor (Internal)';
      case 'EXTERNAL': return 'Consultants & Architects';
      case 'SUBCONTRACTOR': return 'Subcontractors';
      default: return type;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Project Directory"
        description="Team members, contractors, and contact information."
        icon={<Users className="w-6 h-6 text-brand-500" />}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        }
      />

      <div className="space-y-10">
        {(Object.entries(groupedDirectory) as [string, any[]][]).map(([type, users]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-4 border-b border-brand-200 dark:border-brand-800 pb-2">
              {getTypeLabel(type)}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user: any) => (
                <div key={user.id} className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-5 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-900 dark:text-brand-100">{user.name}</h4>
                        <p className="text-xs font-medium text-brand-500 dark:text-brand-400">{user.role}</p>
                      </div>
                    </div>
                    {user.type === 'INTERNAL' && (
                      <div title="Verified Employee" className="inline-flex">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-80" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-sm font-medium text-brand-700 dark:text-brand-300 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 rounded-md inline-block mb-1">
                      {user.company}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${user.phone}`} className="hover:underline">{user.phone}</a>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-brand-100 dark:border-brand-800/50">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors">
                      <Mail className="w-4 h-4" /> Email
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors">
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
