'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, HardHat } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { SlideOver } from '@/components/ui/SlideOver';
import { ProjectForm } from './_components/ProjectForm';
import { CreateProjectInput } from '@pulse/validators';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => api.get<any>(`/trunk/projects?page=${page}&limit=10`),
  });
  
  // Unwrap the paginated response
  const projects = data|| [];

  const createMutation = useMutation({
    mutationFn: (newProject: CreateProjectInput) => api.post('/trunk/projects', newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDrawerOpen(false);
    },
  });

  const columns = [
    {
      header: 'Project Name',
      accessorKey: 'name',
      cell: (item: any) => (
        <div>
          <div className="font-medium text-brand-900 dark:text-brand-100">{item.name}</div>
          {item.location?.city && (
            <div className="text-sm text-brand-500 dark:text-brand-400">{item.location.city}, {item.location.state}</div>
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
        <span className="font-medium dark:text-brand-300">
          {item.budget ? `$${(item.budget / 100).toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (item: any) => <span className="text-brand-500 dark:text-brand-400">{new Date(item.createdAt).toLocaleDateString()}</span>,
    },
  ];

  const filteredProjects = projects?.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const activeProjects = projects?.filter((p: any) => p.status === 'ACTIVE').length || 0;
  const projectsOnHold = projects?.filter((p: any) => p.status === 'ON_HOLD').length || 0;
  const totalBudget = projects?.reduce((acc: number, p: any) => acc + (p.budget || 0), 0) || 0;
  const formattedBudget = totalBudget >= 100000000 
    ? `$${(totalBudget / 100000000).toFixed(1)}M` 
    : `$${(totalBudget / 100).toLocaleString()}`;
  const totalProjects = projects?.length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Projects"
        description="Manage all construction projects and their lifecycles."
        icon={<HardHat className="w-6 h-6" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Active Projects", value: activeProjects.toString() },
          { label: "Total Budget", value: formattedBudget },
          { label: "Projects On Hold", value: projectsOnHold.toString() },
          { label: "Total Projects", value: totalProjects.toString() },
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
          onRowClick={(item) => window.location.href = `/projects/${item._id}/dashboard`}
        />
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create New Project"
        description="Enter the basic details to initialize a new project workspace."
      >
        <ProjectForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
