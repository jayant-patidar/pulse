'use client';

import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/core/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HardHat, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { SlideOver } from '@/components/ui/SlideOver';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { useVocabulary } from '@/core/lib/vocabulary';
import { CreateProjectInput } from '@pulse/validators';
import { ProjectForm } from './_components/ProjectForm';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const vocabulary = useVocabulary();
  
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

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/trunk/projects/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/trunk/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const columns = [
    {
      header: vocabulary.projectName,
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
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => {
            if (confirm('Are you sure you want to delete this project?')) {
              deleteMutation.mutate(item._id);
            }
          }} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-7">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
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

  const handleExport = () => {
    if (!filteredProjects || filteredProjects.length === 0) return;
    const headers = [vocabulary.projectName, 'City', 'State', 'Status', 'Budget', 'Created At'];
    const csvData = filteredProjects.map((p: any) => [
      `"${p.name}"`,
      `"${p.location?.city || ''}"`,
      `"${p.location?.state || ''}"`,
      p.status,
      p.budget ? (p.budget / 100).toFixed(2) : '0.00',
      new Date(p.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "projects_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title={vocabulary.projectListTitle}
        description={vocabulary.projectListDescription}
        icon={<HardHat className="w-6 h-6" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {vocabulary.newProject}
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: `Active ${vocabulary.projectListTitle}`, value: activeProjects.toString() },
          { label: "Total Budget", value: formattedBudget },
          { label: `${vocabulary.projectListTitle} On Hold`, value: projectsOnHold.toString() },
          { label: `Total ${vocabulary.projectListTitle}`, value: totalProjects.toString() },
        ]}
      />

      <div className="glass p-6">
        <FilterBar searchPlaceholder="Search projects..." onSearchChange={setSearch}>
          <Button variant="outline" className="hidden sm:flex" onClick={handleExport} disabled={filteredProjects.length === 0}>
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
        title={vocabulary.addProjectTitle}
        description={vocabulary.addProjectDesc}
      >
        <ProjectForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
