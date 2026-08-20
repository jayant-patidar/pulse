'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { SlideOver } from '@/components/ui/SlideOver';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Search, ShieldCheck, AlertCircle, ShieldAlert, FileText, Trash2 } from 'lucide-react';
import { format, isPast, addDays } from 'date-fns';
import { CertificationForm } from './_components/CertificationForm';
import { CreateCertificationInput } from '@pulse/validators';

export default function CertificationsPage({ params }: { params: { projectId: string } }) {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: certifications, isLoading } = useQuery({
    queryKey: ['certifications', params.projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/branches/inspection/certifications?projectId=${params.projectId}`);
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCertificationInput) => api.post('/branches/inspection/certifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCertificationInput> }) => 
      api.patch(`/branches/inspection/certifications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/branches/inspection/certifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const handleCreateOrUpdate = (data: CreateCertificationInput) => {
    if (selectedCertification) {
      updateMutation.mutate({ id: selectedCertification._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreateForm = () => {
    setSelectedCertification(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (certification: any) => {
    setSelectedCertification(certification);
    setIsSlideOverOpen(true);
  };

  const getStatusBadge = (status: string, expiryDate?: string) => {
    if (status === 'ACTIVE' && expiryDate) {
      const exp = new Date(expiryDate);
      if (isPast(exp)) {
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><ShieldAlert className="w-3 h-3" /> Expired</span>;
      }
      if (isPast(addDays(exp, -30))) {
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"><AlertCircle className="w-3 h-3" /> Expiring Soon</span>;
      }
    }

    switch (status) {
      case 'ACTIVE': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"><ShieldCheck className="w-3 h-3" /> Active</span>;
      case 'EXPIRED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><ShieldAlert className="w-3 h-3" /> Expired</span>;
      case 'SUSPENDED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Suspended</span>;
      case 'REVOKED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">Revoked</span>;
      default: return null;
    }
  };

  const columns = [
    {
      header: 'Certification Type',
      accessorKey: 'certificationType',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">{(item.certificationType || '').replace('_', ' ')}</span>
          <span className="text-xs text-gray-500">{item.certificationNumber || 'No permit #'}</span>
        </div>
      ),
    },
    {
      header: 'Authority',
      accessorKey: 'issuedBy',
      cell: (item: any) => item.issuedBy,
    },
    {
      header: 'Issued / Expiry',
      accessorKey: 'issuedDate',
      cell: (item: any) => (
        <div className="flex flex-col text-sm">
          <span>{item.issuedDate ? format(new Date(item.issuedDate), 'MMM d, yyyy') : '-'}</span>
          <span className="text-xs text-gray-500">
            {item.expiryDate 
              ? `Exp: ${format(new Date(item.expiryDate), 'MMM d, yyyy')}`
              : 'Does not expire'
            }
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => getStatusBadge(item.status, item.expiryDate),
    },
    {
      header: '', id: 'actions',
      cell: (item: any) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-7">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Certifications & Permits" 
        description="Track active permits, clearances, and compliance certificates."
        actions={
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Certification
          </Button>
        }
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        </div>
      ) : certifications?.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No certifications found"
          description="Add building permits, occupancy certificates, or fire clearances."
          action={
            <Button onClick={openCreateForm}>Add Certification</Button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <DataTable
            data={certifications || []}
            columns={columns}
            onRowClick={openEditForm}
            keyExtractor={(item: any) => item._id}
          />
        </div>
      )}

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={selectedCertification ? 'Edit Certification' : 'Add Certification'}
      >
        <div className="p-6">
          <CertificationForm
            projectId={params.projectId}
            initialData={selectedCertification}
            onSubmit={handleCreateOrUpdate}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </SlideOver>
    </div>
  );
}
