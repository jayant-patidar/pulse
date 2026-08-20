'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { SlideOver } from '@/components/ui/SlideOver';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Search, Calendar, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { InspectionForm } from './_components/InspectionForm';
import { CreateInspectionInput } from '@pulse/validators';

export default function InspectionsPage({ params }: { params: { projectId: string } }) {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['inspections', params.projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/branches/inspection/inspections?projectId=${params.projectId}`);
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInspectionInput) => api.post('/branches/inspection/inspections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInspectionInput> }) => 
      api.patch(`/branches/inspection/inspections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const handleCreateOrUpdate = (data: CreateInspectionInput) => {
    if (selectedInspection) {
      updateMutation.mutate({ id: selectedInspection._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreateForm = () => {
    setSelectedInspection(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (inspection: any) => {
    setSelectedInspection(inspection);
    setIsSlideOverOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><Calendar className="w-3 h-3" /> Scheduled</span>;
      case 'IN_PROGRESS': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'COMPLETED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default: return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'PASS': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Pass</span>;
      case 'FAIL': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">Fail</span>;
      case 'CONDITIONAL': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Conditional</span>;
      case 'PENDING': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Pending</span>;
      default: return null;
    }
  };

  const columns = [
    {
      header: 'Inspection Type',
      accessorKey: 'inspectionType',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">{(item.inspectionType || '').replace('_', ' ')}</span>
          <span className="text-xs text-gray-500 truncate max-w-[200px]">{item.scope}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'scheduledDate',
      cell: (item: any) => item.scheduledDate ? format(new Date(item.scheduledDate), 'MMM d, yyyy h:mm a') : '-',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => getStatusBadge(item.status),
    },
    {
      header: 'Result',
      accessorKey: 'overallResult',
      cell: (item: any) => getResultBadge(item.overallResult),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Inspections" 
        description="Schedule and track site inspections."
        actions={
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Inspection
          </Button>
        }
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        </div>
      ) : inspections?.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No inspections found"
          description="Schedule the first inspection for this site."
          action={
            <Button onClick={openCreateForm}>Schedule Inspection</Button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <DataTable
            data={inspections || []}
            columns={columns}
            onRowClick={openEditForm}
            keyExtractor={(item: any) => item._id}
          />
        </div>
      )}

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={selectedInspection ? 'Edit Inspection' : 'Schedule Inspection'}
      >
        <div className="p-6">
          <InspectionForm
            projectId={params.projectId}
            initialData={selectedInspection}
            onSubmit={handleCreateOrUpdate}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </SlideOver>
    </div>
  );
}
