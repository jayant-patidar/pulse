'use client';

import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SlideOver } from '@/components/ui/SlideOver';
import { api } from '@/core/lib/api-client';
import { CreateCorrectiveActionInput } from '@pulse/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isPast } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, PlayCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CorrectiveActionForm } from './_components/CorrectiveActionForm';

export default function CorrectiveActionsPage({ params }: { params: { projectId: string } }) {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: actions, isLoading } = useQuery({
    queryKey: ['corrective-actions', params.projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/branches/inspection/corrective-actions?projectId=${params.projectId}`);
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCorrectiveActionInput) => api.post('/branches/inspection/corrective-actions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCorrectiveActionInput> }) => 
      api.patch(`/branches/inspection/corrective-actions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/branches/inspection/corrective-actions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions', params.projectId] });
      setIsSlideOverOpen(false);
    },
  });

  const handleCreateOrUpdate = (data: CreateCorrectiveActionInput) => {
    if (selectedAction) {
      updateMutation.mutate({ id: selectedAction._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreateForm = () => {
    setSelectedAction(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (action: any) => {
    setSelectedAction(action);
    setIsSlideOverOpen(true);
  };

  const getStatusBadge = (status: string, deadline: string) => {
    if (status !== 'COMPLETED' && status !== 'WAIVED' && isPast(new Date(deadline))) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><AlertCircle className="w-3 h-3" /> Overdue</span>;
    }

    switch (status) {
      case 'PENDING': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"><Clock className="w-3 h-3" /> Pending</span>;
      case 'IN_PROGRESS': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"><PlayCircle className="w-3 h-3" /> In Progress</span>;
      case 'COMPLETED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'OVERDUE': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><AlertCircle className="w-3 h-3" /> Overdue</span>;
      case 'WAIVED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Waived</span>;
      default: return null;
    }
  };

  const columns = [
    {
      header: 'Corrective Action',
      accessorKey: 'description',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[300px]">
            {item.description}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-[300px]">
            {item.assignedTo ? `Assigned to: ${item.assignedTo}` : 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Deadline',
      accessorKey: 'deadline',
      cell: (item: any) => item.deadline ? format(new Date(item.deadline), 'MMM d, yyyy') : '-',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => getStatusBadge(item.status, item.deadline),
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
        title="Corrective Actions" 
        description="Assign and track remediation tasks for inspection findings."
        actions={
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Assign Action
          </Button>
        }
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        </div>
      ) : actions?.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No corrective actions found"
          description="Create actions to resolve inspection findings."
          action={
            <Button onClick={openCreateForm}>Assign Action</Button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <DataTable
            data={actions || []}
            columns={columns}
            onRowClick={openEditForm}
            keyExtractor={(item: any) => item._id}
          />
        </div>
      )}

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={selectedAction ? 'Edit Action' : 'Assign Corrective Action'}
      >
        <div className="p-6">
          <CorrectiveActionForm
            projectId={params.projectId}
            initialData={selectedAction}
            onSubmit={handleCreateOrUpdate}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </SlideOver>
    </div>
  );
}
