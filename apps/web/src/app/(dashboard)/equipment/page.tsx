'use client';

import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/core/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tractor, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { SlideOver } from '@/components/ui/SlideOver';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { CreateEquipmentInput } from '@pulse/validators';
import { EquipmentForm } from './_components/EquipmentForm';

export default function EquipmentPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', page],
    queryFn: () => api.get<any>(`/trunk/equipment?page=${page}&limit=20`),
  });
  
  const equipment = data|| [];

  const createMutation = useMutation({
    mutationFn: (newEq: CreateEquipmentInput) => api.post('/trunk/equipment', newEq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/trunk/equipment/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/trunk/equipment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const columns = [
    {
      header: 'Equipment',
      accessorKey: 'name',
      cell: (item: any) => (
        <div>
          <div className="font-medium text-brand-900 dark:text-brand-100">{item.name}</div>
          <div className="text-sm text-brand-500 dark:text-brand-400">
            {item.make} {item.modelName} {item.year ? `(${item.year})` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Asset Tag',
      accessorKey: 'assetTag',
      cell: (item: any) => <span className="font-mono text-sm bg-brand-100/50 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800 px-2 py-1 rounded text-brand-700 dark:text-brand-300">{item.assetTag || 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Internal Cost/Hr',
      accessorKey: 'hourlyInternalCostCents',
      cell: (item: any) => (
        <span className="font-medium text-brand-700 dark:text-brand-300">
          {item.hourlyInternalCostCents ? `$${(item.hourlyInternalCostCents / 100).toFixed(2)}/hr` : '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (item: any) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <select 
            value={item.status} 
            onChange={(e) => updateMutation.mutate({ id: item._id, status: e.target.value })}
            className="text-xs rounded-md border-brand-200 dark:border-brand-800 bg-white dark:bg-brand-900 text-brand-700 dark:text-brand-300 py-1 pl-2 pr-6 focus:ring-brand-500 cursor-pointer"
          >
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="UNDER_MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-7">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredEquipment = equipment?.filter((e: any) => e.name.toLowerCase().includes(search.toLowerCase())) || [];

  const totalEquipment = equipment?.length || 0;
  const activeFleet = equipment?.filter((e: any) => e.status === 'IN_USE').length || 0;
  const inMaintenance = equipment?.filter((e: any) => e.status === 'MAINTENANCE').length || 0;
  const available = equipment?.filter((e: any) => e.status === 'AVAILABLE').length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Equipment"
        description="Manage heavy machinery, tools, and fleet assets."
        icon={<Tractor className="w-6 h-6" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Total Equipment", value: totalEquipment.toString() },
          { label: "Active Fleet", value: activeFleet.toString() },
          { label: "In Maintenance", value: inMaintenance.toString(), trend: inMaintenance > 0 ? "Action Needed" : "Normal", trendDirection: inMaintenance > 0 ? "down" : "neutral" },
          { label: "Available", value: available.toString() },
        ]}
      />

      <div className="glass p-6">
        <FilterBar searchPlaceholder="Search equipment by name or tag..." onSearchChange={setSearch} />

        <DataTable
          columns={columns}
          data={filteredEquipment}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add Equipment"
        description="Register new fleet assets or heavy machinery."
      >
        <EquipmentForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
