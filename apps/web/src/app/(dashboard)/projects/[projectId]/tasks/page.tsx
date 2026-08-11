'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, ListTodo, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { SlideOver } from '@/components/ui/SlideOver';
import { TaskForm } from './_components/TaskForm';
import { CreateTaskInput } from '@pulse/validators';

import { useParams } from 'next/navigation';

export default function TasksPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', projectId, page],
    queryFn: () => api.get<any>(`/trunk/tasks?projectId=${projectId}&page=${page}&limit=20`),
  });
  
  const tasks = data|| [];

  const createMutation = useMutation({
    mutationFn: (newTask: CreateTaskInput) => api.post('/trunk/tasks', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/trunk/tasks/${data.id}`, { status: data.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/trunk/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
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
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-7">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredTasks = tasks?.filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase())) || [];

  const openTasks = tasks?.filter((t: any) => ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(t.status)).length || 0;
  const overdueTasks = tasks?.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === 'DONE').length || 0;
  const totalTasks = tasks?.length || 0;

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
          { label: "Total Tasks", value: totalTasks.toString() },
          { label: "Open Tasks", value: openTasks.toString() },
          { label: "Completed", value: completedTasks.toString() },
          { label: "Overdue", value: overdueTasks.toString(), trend: overdueTasks > 0 ? "Urgent" : "None", trendDirection: overdueTasks > 0 ? "down" : "neutral" },
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
