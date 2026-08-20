'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/core/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSafetyIncidentInput, createSafetyIncidentSchema } from '@pulse/validators';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

interface IncidentFormProps {
  initialData?: any;
  onSubmit: (data: CreateSafetyIncidentInput) => void;
  isLoading?: boolean;
  projectId?: string;
}

export function IncidentForm({ initialData, onSubmit, isLoading, projectId }: IncidentFormProps) {
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = projectId || params?.projectId || initialData?.projectId;

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData || [];

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<any>('/root/memberships'),
  });
  const users = usersData || [];

  const form = useForm<CreateSafetyIncidentInput>({
    resolver: zodResolver(createSafetyIncidentSchema),
    defaultValues: {
      projectId: activeProjectId || '',
      incidentType: initialData?.incidentType || 'INJURY',
      severity: initialData?.severity || 'MEDIUM',
      dateOccurred: initialData?.dateOccurred ? new Date(initialData.dateOccurred).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      locationOnSite: initialData?.locationOnSite || '',
      description: initialData?.description || '',
      immediateActionsTaken: initialData?.immediateActionsTaken || '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      dateOccurred: new Date(data.dateOccurred).toISOString(),
    };
    onSubmit(formattedData);
  });

  return (
    <form id="incident-form" onSubmit={handleSubmit} className="space-y-6">
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
        <FormField label="Incident Type" error={errors.incidentType?.message} required>
          <Select {...form.register('incidentType')} error={!!errors.incidentType}>
            <option value="INJURY">Injury</option>
            <option value="NEAR_MISS">Near Miss</option>
            <option value="PROPERTY_DAMAGE">Property Damage</option>
            <option value="ENVIRONMENTAL">Environmental</option>
            <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
          </Select>
        </FormField>
        
        <FormField label="Severity" error={errors.severity?.message} required>
          <Select {...form.register('severity')} error={!!errors.severity}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date Occurred" error={errors.dateOccurred?.message} required>
          <Controller
            control={form.control}
            name="dateOccurred"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholderText="Select date and time"
                wrapperClassName="w-full"
              />
            )}
          />
        </FormField>

        <FormField label="Location on Site" error={errors.locationOnSite?.message}>
          <Input 
            {...form.register('locationOnSite')} 
            placeholder="e.g. West Wing 2nd Floor"
            error={!!errors.locationOnSite}
          />
        </FormField>
      </div>

      <FormField label="Description" error={errors.description?.message} required>
        <Textarea 
          {...form.register('description')} 
          placeholder="Detailed account of what happened..."
          error={!!errors.description}
        />
      </FormField>

      <FormField label="Immediate Actions Taken" error={errors.immediateActionsTaken?.message}>
        <Textarea 
          {...form.register('immediateActionsTaken')} 
          placeholder="What was done immediately following the incident?"
          error={!!errors.immediateActionsTaken}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Incident' : 'Report Incident'}
        </Button>
      </div>
    </form>
  );
}
