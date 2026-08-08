'use client';

import Link from 'next/link';

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

import { useParams } from 'next/navigation';

export default function DailyReportsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['daily-reports', projectId, page],
    queryFn: () => api.get<any>(`/trunk/daily-reports?projectId=${projectId}&page=${page}&limit=20`),
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

  const totalReports = reports?.length || 0;
  const reportsThisWeek = reports?.filter((r: any) => new Date(r.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
  const avgWorkers = totalReports > 0 ? Math.round(reports.reduce((acc: number, r: any) => acc + (r.totalWorkerCount || 0), 0) / totalReports) : 0;
  const weatherDelays = reports?.filter((r: any) => r.weather?.conditions?.toLowerCase().includes('rain') || r.weather?.conditions?.toLowerCase().includes('storm') || r.weather?.conditions?.toLowerCase().includes('snow')).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Daily Reports"
        description="Site logs, weather conditions, and daily progress."
        icon={<ClipboardList className="w-6 h-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/projects/${params.projectId}/reports/safety`}>
              <Button variant="outline" className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                Safety Incidents
              </Button>
            </Link>
            <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        }
      />

      <StatsGrid
        stats={[
          { label: "Total Reports", value: totalReports.toString() },
          { label: "Reports This Week", value: reportsThisWeek.toString() },
          { label: "Avg Workers/Day", value: avgWorkers.toString() },
          { label: "Weather Delays", value: weatherDelays.toString(), trend: weatherDelays > 0 ? "Needs Attention" : "Normal", trendDirection: weatherDelays > 0 ? "down" : "neutral" },
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
