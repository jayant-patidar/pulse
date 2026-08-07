'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, ClipboardList, CloudSun } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { SlideOver } from '@/components/ui/SlideOver';
import { ReportForm } from './_components/ReportForm';
import { CreateDailyReportInput } from '@pulse/validators';

export default function DailyReportsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['daily-reports', page],
    queryFn: () => api.get<any>(`/trunk/daily-reports?page=${page}&limit=20`),
  });
  
  const reports = data|| [];

  const createMutation = useMutation({
    mutationFn: (newReport: CreateDailyReportInput) => api.post('/trunk/daily-reports', newReport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      setIsDrawerOpen(false);
    },
  });

  const columns = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (item: any) => (
        <div className="font-medium text-brand-900 dark:text-brand-100">
          {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Weather',
      accessorKey: 'weather',
      cell: (item: any) => (
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm">
          {item.weather?.condition ? (
            <>
              <CloudSun className="w-4 h-4 text-brand-400" />
              {item.weather.condition}, {item.weather.temperatureF}°F
            </>
          ) : '-'}
        </div>
      ),
    },
    {
      header: 'Workers',
      accessorKey: 'totalWorkerCount',
      cell: (item: any) => <span className="font-medium text-brand-700 dark:text-brand-300">{item.totalWorkerCount || 0}</span>,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Daily Reports"
        description="Site logs, weather conditions, and daily progress."
        icon={<ClipboardList className="w-6 h-6" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Pending Approval", value: "4", trend: "Needs Action", trendDirection: "down" },
          { label: "Reports This Week", value: "14" },
          { label: "Avg Workers/Day", value: "45", trend: "+5", trendDirection: "up" },
          { label: "Weather Delays", value: "0", trendDirection: "neutral" },
        ]}
      />

      <div className="glass p-6">
        <FilterBar searchPlaceholder="Search reports..." onSearchChange={setSearch} />

        <DataTable
          columns={columns}
          data={reports}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Daily Report"
        description="Log today's site activity, weather, and workforce details."
      >
        <ReportForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
