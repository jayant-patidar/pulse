'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, HardHat } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => api.get<any[]>(`/trunk/projects?page=${page}&limit=10`),
  });

  const columns = [
    {
      header: 'Project Name',
      accessorKey: 'name',
      cell: (item: any) => (
        <div>
          <div className="font-medium text-brand-900">{item.name}</div>
          {item.location?.city && (
            <div className="text-sm text-brand-500">{item.location.city}, {item.location.state}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Budget',
      accessorKey: 'budget',
      cell: (item: any) => (
        <span className="font-medium">
          {item.budget ? `$${(item.budget / 100).toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (item: any) => <span className="text-brand-500">{new Date(item.createdAt).toLocaleDateString()}</span>,
    },
  ];

  const filteredProjects = projects?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Projects"
        description="Manage all construction projects and their lifecycles."
        icon={<HardHat className="w-6 h-6" />}
        actions={
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Active Projects", value: "12", trend: "+2", trendDirection: "up" },
          { label: "Total Budget", value: "$4.2M" },
          { label: "Projects On Hold", value: "3", trend: "-1", trendDirection: "down" },
          { label: "Avg Schedule Variance", value: "+4 Days", trend: "Needs Attention", trendDirection: "down" },
        ]}
      />

      <div className="glass p-6">
        <FilterBar searchPlaceholder="Search projects..." onSearchChange={setSearch}>
          <Button variant="outline" className="hidden sm:flex">
            Export
          </Button>
        </FilterBar>

        <DataTable
          columns={columns}
          data={filteredProjects}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
