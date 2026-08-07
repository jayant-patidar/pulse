'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, ListTodo } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { SlideOver } from '@/components/ui/SlideOver';
import { TaskForm } from './_components/TaskForm';
import { CreateTaskInput } from '@pulse/validators';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page],
    queryFn: () => api.get<any>(`/trunk/tasks?page=${page}&limit=20`),
  });
  
  const tasks = data|| [];

  const createMutation = useMutation({
    mutationFn: (newTask: CreateTaskInput) => api.post('/trunk/tasks', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsDrawerOpen(false);
    },
  });

  const columns = [
    {
      header: 'Task Title',
      accessorKey: 'title',
      cell: (item: any) => (
        <div className="font-medium text-brand-900 dark:text-brand-100">{item.title}</div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (item: any) => <StatusBadge status={item.priority} />,
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (item: any) => (
        <span className={item.dueDate && new Date(item.dueDate) < new Date() ? 'text-red-600 font-semibold dark:text-red-400' : 'text-brand-500 dark:text-brand-400'}>
          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const filteredTasks = tasks?.filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Tasks"
        description="Track and assign work across your projects."
        icon={<ListTodo className="w-6 h-6" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "My Open Tasks", value: "8" },
          { label: "Overdue", value: "3", trend: "Urgent", trendDirection: "down" },
          { label: "Completed This Week", value: "24", trend: "+12%", trendDirection: "up" },
          { label: "Blocked", value: "1", trendDirection: "down" },
        ]}
      />

      <div className="glass p-6">
        <FilterBar searchPlaceholder="Search tasks..." onSearchChange={setSearch}>
          <Button variant="outline" className="hidden sm:flex">
            Filter by Project
          </Button>
        </FilterBar>

        <DataTable
          columns={columns}
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create New Task"
        description="Assign a new task to a project."
      >
        <TaskForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
