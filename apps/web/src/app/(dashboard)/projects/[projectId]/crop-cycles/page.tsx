'use client';

import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SlideOver } from '@/components/ui/SlideOver';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/core/lib/api-client';
import { CreateCropCycleInput, UpdateCropCycleInput } from '@pulse/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Sprout, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { CropCycleForm } from './_components/CropCycleForm';

export default function CropCyclesPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId || '';
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: cyclesData, isLoading } = useQuery({
    queryKey: ['crop-cycles', projectId],
    queryFn: () => api.get<any>(`/branches/agriculture/crop-cycles?projectId=${projectId}`),
    enabled: !!projectId,
  });

  const cropCycles = Array.isArray(cyclesData) ? cyclesData : (cyclesData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: CreateCropCycleInput) => api.post('/branches/agriculture/crop-cycles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-cycles', projectId] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateCropCycleInput }) => api.patch(`/branches/agriculture/crop-cycles/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-cycles', projectId] });
      setIsDrawerOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/branches/agriculture/crop-cycles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-cycles', projectId] });
    },
  });

  const columns = [
    {
      header: 'Field Name',
      accessorKey: 'fieldName',
      cell: (item: any) => (
        <span className="font-medium text-brand-900 dark:text-brand-100">{item.fieldName}</span>
      ),
    },
    {
      header: 'Crop',
      accessorKey: 'cropType',
      cell: (item: any) => (
        <div>
          <p className="font-medium text-brand-900 dark:text-brand-100">{item.cropType}</p>
          <p className="text-xs text-brand-500">{item.variety}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => (
        <StatusBadge 
          status={item.status} 
        />
      ),
    },
    {
      header: 'Planting Date',
      accessorKey: 'plantingDate',
      cell: (item: any) => <span className="text-sm">{new Date(item.plantingDate).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditingItem(item);
              setIsDrawerOpen(true);
            }}
            className="p-1 hover:bg-brand-100 dark:hover:bg-brand-800 rounded transition-colors text-brand-600 dark:text-brand-400"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteMutation.mutate(item._id)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-colors text-rose-600 dark:text-rose-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Crop Cycles"
        description="Manage crop cycles, planting dates, and harvest estimates."
        icon={<Sprout className="w-6 h-6 text-brand-500" />}
        actions={
          <Button variant="primary" onClick={() => {
            setEditingItem(null);
            setIsDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Crop Cycle
          </Button>
        }
      />
      
      <DataTable
        data={cropCycles}
        columns={columns}
        keyExtractor={(item: any) => item._id}
        isLoading={isLoading}
        emptyMessage="No crop cycles found. Add your first cycle to track growth."
      />

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Crop Cycle" : "New Crop Cycle"}
        description="Plan and track a crop cycle for a specific field."
      >
        <CropCycleForm
          projectId={projectId}
          initialData={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              updateMutation.mutate({ id: editingItem._id, payload: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
