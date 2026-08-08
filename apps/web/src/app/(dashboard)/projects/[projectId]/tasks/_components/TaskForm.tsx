'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, CreateTaskInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { ExtensionFieldRenderer } from '@/components/ui/ExtensionFieldRenderer';
import { useParams } from 'next/navigation';

interface TaskFormProps {
  initialData?: any;
  onSubmit: (data: CreateTaskInput) => void;
  isLoading?: boolean;
}

export function TaskForm({ initialData, onSubmit, isLoading }: TaskFormProps) {
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = params?.projectId || initialData?.projectId;

  // Fetch projects to populate the Project Select dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData|| [];

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId: activeProjectId || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'MEDIUM',
      estimatedHours: initialData?.estimatedHours || undefined,
      extensions: initialData?.extensions || {},
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
      {activeProjectId ? (
        <FormField label="Project" required>
          <Input 
            value={projects.find((p: any) => p._id === activeProjectId)?.name || 'Loading...'} 
            disabled 
            className="bg-slate-50 dark:bg-brand-900/50 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
          />
          <input type="hidden" {...form.register('projectId')} value={activeProjectId} />
        </FormField>
      ) : (
        <FormField label="Project" error={errors.projectId?.message} required>
          <Select 
            {...form.register('projectId')} 
            error={!!errors.projectId}
          >
            <option value="" disabled>Select a project</option>
            {projects.map((p: any) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Task Title" error={errors.title?.message} required>
        <Input 
          {...form.register('title')} 
          placeholder="e.g. Excavation Phase 1" 
          error={!!errors.title}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea 
          {...form.register('description')} 
          placeholder="Provide detailed instructions..."
          error={!!errors.description}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Priority" error={errors.priority?.message}>
          <Select {...form.register('priority')} error={!!errors.priority}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </FormField>

        <FormField label="Est. Hours" error={errors.estimatedHours?.message}>
          <Input 
            {...form.register('estimatedHours', { valueAsNumber: true })} 
            type="number"
            placeholder="0" 
            error={!!errors.estimatedHours}
          />
        </FormField>
      </div>

      <ExtensionFieldRenderer
        industry="CONSTRUCTION" // Placeholder for Phase 2
        entityType="task"
        extensions={form.watch('extensions') || {}}
        onChange={(ext) => form.setValue('extensions', ext, { shouldDirty: true })}
      />

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
