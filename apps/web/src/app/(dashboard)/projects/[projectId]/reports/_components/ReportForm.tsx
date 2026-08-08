'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDailyReportSchema, CreateDailyReportInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { ExtensionFieldRenderer } from '@/components/ui/ExtensionFieldRenderer';
import { useParams } from 'next/navigation';

interface ReportFormProps {
  initialData?: any;
  onSubmit: (data: CreateDailyReportInput) => void;
  isLoading?: boolean;
}

export function ReportForm({ initialData, onSubmit, isLoading }: ReportFormProps) {
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = params?.projectId || initialData?.projectId;

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData|| [];

  const form = useForm<CreateDailyReportInput>({
    resolver: zodResolver(createDailyReportSchema),
    defaultValues: {
      projectId: activeProjectId || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16),
      activitiesDescription: initialData?.activitiesDescription || '',
      totalWorkerCount: initialData?.totalWorkerCount || undefined,
      notes: initialData?.notes || '',
      extensions: initialData?.extensions || {},
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      date: new Date(data.date).toISOString(),
    };
    onSubmit(formattedData);
  });

  return (
    <form id="report-form" onSubmit={handleSubmit} className="space-y-6">
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

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" error={errors.date?.message} required>
          <Input 
            {...form.register('date')} 
            type="datetime-local"
            error={!!errors.date}
          />
        </FormField>
        
        <FormField label="Total Workers" error={errors.totalWorkerCount?.message}>
          <Input 
            {...form.register('totalWorkerCount', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.totalWorkerCount}
          />
        </FormField>
      </div>

      <FormField label="Activities Description" error={errors.activitiesDescription?.message}>
        <Textarea 
          {...form.register('activitiesDescription')} 
          placeholder="What happened today?"
          error={!!errors.activitiesDescription}
        />
      </FormField>
      
      <FormField label="Additional Notes" error={errors.notes?.message}>
        <Textarea 
          {...form.register('notes')} 
          placeholder="Any other notes..."
          error={!!errors.notes}
        />
      </FormField>

      <ExtensionFieldRenderer
        industry="CONSTRUCTION" // Placeholder for Phase 2
        entityType="daily_report"
        extensions={form.watch('extensions') || {}}
        onChange={(ext) => form.setValue('extensions', ext, { shouldDirty: true })}
      />

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Report' : 'Create Report'}
        </Button>
      </div>
    </form>
  );
}
