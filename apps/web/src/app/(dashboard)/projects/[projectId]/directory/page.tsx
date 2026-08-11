'use client';

import { useState } from 'react';
import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Users, Mail, Phone, MessageSquare, ShieldCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { SlideOver } from '@/components/ui/SlideOver';
import { InviteMemberForm } from './_components/InviteMemberForm';
import { toast } from 'sonner';

export default function DirectoryPage() {
  const { project, isLoading } = useProject();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();



  const { data: membersData } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => api.get<any>('/root/memberships'),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; role: string; employmentType: string; reportsTo?: string }) => api.post('/root/memberships/onboard', data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      setIsDrawerOpen(false);
      toast.success(`Employee onboarded! Email: ${res.email} | Temp Password: ${res.tempPassword}`, { duration: 10000 });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to onboard employee'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (membershipId: string) => api.patch(`/root/memberships/${membershipId}/reset-password`, {}),
    onSuccess: (res: any) => {
      toast.success(`Password Reset! New Temp Password: ${res.tempPassword}`, { duration: 15000 });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to reset password'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const rawMembers = Array.isArray(membersData) ? membersData : (membersData?.data || []);

  const directory = rawMembers.map((m: any, index: number) => {
    const user = m.userId || {};
    const manager = m.reportsTo?.userId || {};
    return {
      id: m._id || index,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      role: m.role || 'Member',
      company: project?.name ? project.name + ' Team' : 'Contractor', 
      email: user.email || '',
      phone: user.phone || 'Not Provided',
      type: m.role === 'OWNER' || m.role === 'ADMIN' ? 'INTERNAL' : 'EXTERNAL',
      access: m.permissions || ['Standard'],
      // Extra details for SlideOver
      employmentType: m.employmentType,
      employeeId: m.employeeId,
      status: m.status,
      joinedAt: m.createdAt,
      managerName: manager.firstName ? `${manager.firstName} ${manager.lastName}` : null,
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
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Onboard Employee
          </button>
        }
      />

      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Onboard New Employee"
      >
        <InviteMemberForm 
          onSubmit={(data) => inviteMutation.mutate(data)}
          isLoading={inviteMutation.isPending}
          managers={rawMembers}
        />
      </SlideOver>

      <div className="space-y-10">
        {(Object.entries(groupedDirectory) as [string, any[]][]).map(([type, users]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-4 border-b border-brand-200 dark:border-brand-800 pb-2">
              {getTypeLabel(type)}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user: any) => (
                <div 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)}
                  className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-5 hover:shadow-md transition-shadow group cursor-pointer"
                >
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

      <SlideOver 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        title="Employee Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-brand-200 dark:border-brand-800 pb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {getInitials(selectedUser.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-900 dark:text-brand-100">{selectedUser.name}</h3>
                <p className="text-brand-500 font-medium">{selectedUser.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-brand-500 block mb-1">Employee ID</span>
                <p className="font-medium text-brand-900 dark:text-brand-100">{selectedUser.employeeId || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm text-brand-500 block mb-1">Email Address</span>
                <p className="font-medium text-brand-900 dark:text-brand-100">{selectedUser.email}</p>
              </div>

              <div>
                <span className="text-sm text-brand-500 block mb-1">Employment Type</span>
                <p className="font-medium text-brand-900 dark:text-brand-100">
                  {selectedUser.employmentType?.replace('_', ' ') || 'Standard'}
                </p>
              </div>

              <div>
                <span className="text-sm text-brand-500 block mb-1">Reports To (Manager)</span>
                <p className="font-medium text-brand-900 dark:text-brand-100">{selectedUser.managerName || 'None'}</p>
              </div>

              <div>
                <span className="text-sm text-brand-500 block mb-1">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  selectedUser.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {selectedUser.status}
                </span>
              </div>

              <div>
                <span className="text-sm text-brand-500 block mb-1">Joined Date</span>
                <p className="font-medium text-brand-900 dark:text-brand-100">
                  {new Date(selectedUser.joinedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-amber-800 dark:text-amber-200 pr-4">
                    <strong>Locked out?</strong> For security reasons, temporary passwords are not stored. If an employee is locked out, you must generate a new password reset link.
                  </p>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to reset this employee\'s password? They will be locked out of their current session.')) {
                        resetPasswordMutation.mutate(selectedUser.id);
                      }
                    }}
                    disabled={resetPasswordMutation.isPending}
                    className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
