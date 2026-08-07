'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, Tractor } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { SlideOver } from '@/components/ui/SlideOver';
import { EquipmentForm } from './_components/EquipmentForm';
import { CreateEquipmentInput } from '@pulse/validators';

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
  ];

  const filteredEquipment = equipment?.filter((e: any) => e.name.toLowerCase().includes(search.toLowerCase())) || [];

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
          { label: "Active Fleet", value: "34" },
          { label: "In Maintenance", value: "2", trend: "Normal", trendDirection: "neutral" },
          { label: "Utilization Rate", value: "87%", trend: "+5%", trendDirection: "up" },
          { label: "Alerts", value: "0", trendDirection: "neutral" },
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
