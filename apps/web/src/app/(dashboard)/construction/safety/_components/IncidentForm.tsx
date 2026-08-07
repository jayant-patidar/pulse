'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSafetyIncidentSchema, CreateSafetyIncidentInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';

interface IncidentFormProps {
  initialData?: any;
  onSubmit: (data: CreateSafetyIncidentInput) => void;
  isLoading?: boolean;
}

export function IncidentForm({ initialData, onSubmit, isLoading }: IncidentFormProps) {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData|| [];

  const form = useForm<CreateSafetyIncidentInput>({
    resolver: zodResolver(createSafetyIncidentSchema),
    defaultValues: {
      projectId: initialData?.projectId || '',
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
          <Input 
            {...form.register('dateOccurred')} 
            type="datetime-local"
            error={!!errors.dateOccurred}
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
