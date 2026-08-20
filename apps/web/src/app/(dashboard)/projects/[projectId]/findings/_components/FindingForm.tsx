'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/core/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFindingInput, createFindingSchema } from '@pulse/validators';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

interface FindingFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateFindingInput) => void;
  isLoading?: boolean;
}

export function FindingForm({ projectId, initialData, onSubmit, isLoading }: FindingFormProps) {
  const { data: inspections } = useQuery({
    queryKey: ['inspections', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/branches/inspection/inspections?projectId=${projectId}`);
      return res;
    },
  });

  const form = useForm<CreateFindingInput>({
    resolver: zodResolver(createFindingSchema),
    defaultValues: {
      projectId: projectId,
      inspectionId: initialData?.inspectionId || '',
      findingType: initialData?.findingType || 'OBSERVATION',
      severity: initialData?.severity || 'INFO',
      codeReference: initialData?.codeReference || '',
      location: initialData?.location || '',
      description: initialData?.description || '',
      status: initialData?.status || 'OPEN',
    },
  });

  const { formState: { errors } } = form;

  return (
    <form id="finding-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Related Inspection" error={errors.inspectionId?.message} required>
        <Select {...form.register('inspectionId')} error={!!errors.inspectionId}>
          <option value="">Select an inspection...</option>
          {inspections?.map(insp => (
            <option key={insp._id} value={insp._id}>
              {insp.inspectionType} - {new Date(insp.scheduledDate).toLocaleDateString()}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Finding Type" error={errors.findingType?.message} required>
          <Select {...form.register('findingType')} error={!!errors.findingType}>
            <option value="VIOLATION">Violation</option>
            <option value="DEFICIENCY">Deficiency</option>
            <option value="OBSERVATION">Observation</option>
            <option value="RECOMMENDATION">Recommendation</option>
          </Select>
        </FormField>
        
        <FormField label="Severity" error={errors.severity?.message} required>
          <Select {...form.register('severity')} error={!!errors.severity}>
            <option value="INFO">Info</option>
            <option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Code Reference" error={errors.codeReference?.message}>
          <Input 
            {...form.register('codeReference')} 
            placeholder="e.g. NEC 250.114" 
            error={!!errors.codeReference}
          />
        </FormField>
        
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="OPEN">Open</option>
            <option value="IN_REMEDIATION">In Remediation</option>
            <option value="REINSPECTION_NEEDED">Re-inspection Needed</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WAIVED">Waived</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Location on Site" error={errors.location?.message}>
        <Input 
          {...form.register('location')} 
          placeholder="e.g. 3rd Floor Utility Room" 
          error={!!errors.location}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message} required>
        <Textarea 
          {...form.register('description')} 
          placeholder="Detailed description of the finding..."
          error={!!errors.description}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Finding' : 'Log Finding'}
        </Button>
      </div>
    </form>
  );
}
