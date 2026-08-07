'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, ClipboardList, CloudSun } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';

export default function DailyReportsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['daily-reports', page],
    queryFn: () => api.get<any[]>(`/trunk/daily-reports?page=${page}&limit=20`),
  });

  const columns = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (item: any) => (
        <div className="font-medium text-brand-900">
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
        <div className="flex items-center gap-2 text-brand-600 text-sm">
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
      cell: (item: any) => <span className="font-medium text-brand-700">{item.totalWorkerCount || 0}</span>,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Daily Reports"
        description="Site logs, weather conditions, and daily progress."
        icon={<ClipboardList className="w-6 h-6" />}
        actions={
          <Button variant="primary">
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
          data={reports || []}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
