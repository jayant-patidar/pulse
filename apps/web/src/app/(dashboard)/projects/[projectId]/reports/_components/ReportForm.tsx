'use client';

import { Button } from '@/components/ui/Button';
import { ExtensionFieldRenderer } from '@/components/ui/ExtensionFieldRenderer';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/core/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateDailyReportInput, createDailyReportSchema } from '@pulse/validators';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

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
      date: initialData?.date ? new Date(initialData.date).toISOString() : new Date().toISOString(),
      activitiesDescription: initialData?.activitiesDescription || '',
      totalWorkerCount: initialData?.totalWorkerCount || undefined,
      notes: initialData?.notes || '',
      extensions: initialData?.extensions || {},
    },
  });

  const { formState: { errors } } = form;

  const selectedProjectId = form.watch('projectId');
  const activeProject = projects.find((p: any) => p._id === selectedProjectId);
  const activeIndustry = activeProject?.industry || 'CONSTRUCTION';

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
            value={projects.find((p: any) => p._id === activeProjectId)?.name || 'Loading / Unknown Project'} 
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
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                showTimeSelect
                timeFormat="h:mm aa"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`input-base ${errors.date ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date and time"
              />
            )}
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
        industry={activeIndustry}
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
