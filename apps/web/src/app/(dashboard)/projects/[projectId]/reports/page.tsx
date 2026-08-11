'use client';

import Link from 'next/link';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, ClipboardList, CloudSun, Trash2 } from 'lucide-react';

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

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/trunk/daily-reports/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/trunk/daily-reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
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
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-7">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
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
