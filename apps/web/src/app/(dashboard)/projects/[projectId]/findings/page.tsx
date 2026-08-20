'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { SlideOver } from '@/components/ui/SlideOver';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Search, AlertTriangle, Info, AlertCircle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { FindingForm } from './_components/FindingForm';
import { CreateFindingInput } from '@pulse/validators';

export default function FindingsPage({ params }: { params: { projectId: string } }) {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: findings, isLoading } = useQuery({
    queryKey: ['findings', params.projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/branches/inspection/findings?projectId=${params.projectId}`);
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFindingInput) => api.post('/branches/inspection/findings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFindingInput> }) => 
      api.patch(`/branches/inspection/findings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const handleCreateOrUpdate = (data: CreateFindingInput) => {
    if (selectedFinding) {
      updateMutation.mutate({ id: selectedFinding._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreateForm = () => {
    setSelectedFinding(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (finding: any) => {
    setSelectedFinding(finding);
    setIsSlideOverOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><AlertOctagon className="w-3 h-3" /> Critical</span>;
      case 'MAJOR': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"><AlertTriangle className="w-3 h-3" /> Major</span>;
      case 'MINOR': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"><AlertCircle className="w-3 h-3" /> Minor</span>;
      case 'INFO': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><Info className="w-3 h-3" /> Info</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">Open</span>;
      case 'IN_REMEDIATION': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">In Remediation</span>;
      case 'REINSPECTION_NEEDED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Re-inspect</span>;
      case 'RESOLVED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      case 'WAIVED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Waived</span>;
      default: return null;
    }
  };

  const columns = [
    {
      header: 'Finding Type',
      accessorKey: 'findingType',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">{(item.findingType || '').replace('_', ' ')}</span>
          <span className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</span>
        </div>
      ),
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: (item: any) => getSeverityBadge(item.severity),
    },
    {
      header: 'Code Ref',
      accessorKey: 'codeReference',
      cell: (item: any) => item.codeReference || '-',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => getStatusBadge(item.status),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Findings & Violations" 
        description="Track and manage issues discovered during inspections."
        actions={
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Log Finding
          </Button>
        }
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        </div>
      ) : findings?.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No findings logged"
          description="Log violations, deficiencies, or observations."
          action={
            <Button onClick={openCreateForm}>Log Finding</Button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <DataTable
            data={findings || []}
            columns={columns}
            onRowClick={openEditForm}
            keyExtractor={(item: any) => item._id}
          />
        </div>
      )}

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={selectedFinding ? 'Edit Finding' : 'Log Finding'}
      >
        <div className="p-6">
          <FindingForm
            projectId={params.projectId}
            initialData={selectedFinding}
            onSubmit={handleCreateOrUpdate}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </SlideOver>
    </div>
  );
}
