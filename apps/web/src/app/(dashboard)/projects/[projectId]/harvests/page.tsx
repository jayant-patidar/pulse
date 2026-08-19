'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SlideOver } from '@/components/ui/SlideOver';
import { StatCard } from '@/components/ui/StatCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { HarvestForm } from './_components/HarvestForm';
import { CreateHarvestLogInput, UpdateHarvestLogInput } from '@pulse/validators';
import { Plus, Edit, Trash2, Wheat, Droplet, Scale, Tractor } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function HarvestsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId || '';
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: harvestsData, isLoading } = useQuery({
    queryKey: ['harvests', projectId],
    queryFn: () => api.get<any>(`/branches/agriculture/harvests?projectId=${projectId}`),
    enabled: !!projectId,
  });

  const harvests = Array.isArray(harvestsData) ? harvestsData : (harvestsData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: CreateHarvestLogInput) => api.post('/branches/agriculture/harvests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests', projectId] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateHarvestLogInput }) => api.patch(`/branches/agriculture/harvests/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests', projectId] });
      setIsDrawerOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/branches/agriculture/harvests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests', projectId] });
    },
  });

  const columns = [
    {
      header: 'Date',
      accessorKey: 'harvestDate',
      cell: (item: any) => <span className="font-medium text-brand-900 dark:text-brand-100">{new Date(item.harvestDate).toLocaleDateString()}</span>
    },
    {
      header: 'Field/Zone',
      accessorKey: 'fieldZone',
      cell: (item: any) => <span>{item.fieldZone || '--'}</span>
    },
    {
      header: 'Acres',
      accessorKey: 'acresHarvested',
    },
    {
      header: 'Yield (bu/ac)',
      accessorKey: 'yieldBushelsPerAcre',
      cell: (item: any) => <span>{item.yieldBushelsPerAcre || '--'}</span>
    },
    {
      header: 'Moisture (%)',
      accessorKey: 'moisturePercent',
      cell: (item: any) => <span>{item.moisturePercent || '--'}</span>
    },
    {
      header: 'Grade',
      accessorKey: 'grainQualityGrade',
      cell: (item: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.grainQualityGrade?.includes('1') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300'}`}>
          {item.grainQualityGrade || 'Unrated'}
        </span>
      )
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

  const totalYield = harvests.reduce((sum: number, item: any) => sum + ((item.acresHarvested || 0) * (item.yieldBushelsPerAcre || 0)), 0);
  const avgMoisture = harvests.length ? harvests.reduce((sum: number, item: any) => sum + (item.moisturePercent || 0), 0) / harvests.length : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Harvest Logs"
        description="Track harvest yields, moisture levels, and quality grades."
        icon={<Wheat className="w-6 h-6 text-brand-500" />}
        actions={
          <Button variant="primary" onClick={() => {
            setEditingItem(null);
            setIsDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Log Harvest
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Estimated Yield"
          value={`${Math.round(totalYield).toLocaleString()} bu`}
          icon={<Wheat className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Moisture"
          value={`${avgMoisture.toFixed(1)}%`}
          icon={<Droplet className="w-5 h-5" />}
        />
        <StatCard
          title="Logs Count"
          value={harvests.length.toString()}
          icon={<Scale className="w-5 h-5" />}
        />
        <StatCard
          title="Active Combines"
          value="3"
          icon={<Tractor className="w-5 h-5" />}
        />
      </div>

      <DataTable
        data={harvests}
        columns={columns}
        keyExtractor={(item: any) => item._id}
        isLoading={isLoading}
        emptyMessage="No harvest logs found. Add your first harvest record."
      />

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Harvest Log" : "New Harvest Log"}
        description="Record yield data, moisture content, and storage location."
      >
        <HarvestForm
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
