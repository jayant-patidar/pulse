'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/core/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCorrectiveActionInput, createCorrectiveActionSchema } from '@pulse/validators';
import { useQuery } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

interface CorrectiveActionFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateCorrectiveActionInput) => void;
  isLoading?: boolean;
}

export function CorrectiveActionForm({ projectId, initialData, onSubmit, isLoading }: CorrectiveActionFormProps) {
  const { data: findings } = useQuery({
    queryKey: ['findings', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/branches/inspection/findings?projectId=${projectId}`);
      // Filter out findings that are already resolved or waived
      return res.filter(f => f.status !== 'RESOLVED' && f.status !== 'WAIVED');
    },
  });

  const form = useForm<CreateCorrectiveActionInput>({
    resolver: zodResolver(createCorrectiveActionSchema),
    defaultValues: {
      projectId: projectId,
      findingId: initialData?.findingId || '',
      inspectionId: initialData?.inspectionId || '', // We'll set this when finding is selected
      assignedTo: initialData?.assignedTo || '',
      description: initialData?.description || '',
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString() : new Date().toISOString(),
      status: initialData?.status || 'PENDING',
      resolutionNotes: initialData?.resolutionNotes || '',
    },
  });

  const { formState: { errors } } = form;

  // Auto-fill inspectionId when finding is selected
  const handleFindingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const findingId = e.target.value;
    form.setValue('findingId', findingId);
    
    if (findingId && findings) {
      const selectedFinding = findings.find(f => f._id === findingId);
      if (selectedFinding) {
        form.setValue('inspectionId', selectedFinding.inspectionId);
      }
    } else {
      form.setValue('inspectionId', '');
    }
  };

  return (
    <form id="corrective-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Related Finding / Violation" error={errors.findingId?.message} required>
        <Select 
          {...form.register('findingId')} 
          error={!!errors.findingId}
          onChange={handleFindingChange}
          disabled={!!initialData} // Don't allow changing the finding after creation
        >
          <option value="">Select an open finding...</option>
          {findings?.map(f => (
            <option key={f._id} value={f._id}>
              {f.findingType} - {f.description.substring(0, 50)}...
            </option>
          ))}
          {/* If editing an action for a resolved finding, make sure it's in the list */}
          {initialData && !findings?.find(f => f._id === initialData.findingId) && (
            <option value={initialData.findingId}>Finding ID: {initialData.findingId}</option>
          )}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Assign To" error={errors.assignedTo?.message}>
          <Input 
            {...form.register('assignedTo')} 
            placeholder="e.g. John Smith (Contractor)" 
            error={!!errors.assignedTo}
          />
        </FormField>
        
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="WAIVED">Waived</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Deadline" error={errors.deadline?.message} required>
        <Controller
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
              dateFormat="MMMM d, yyyy"
              className={`input-base ${errors.deadline ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              wrapperClassName="w-full"
              placeholderText="Select remediation deadline"
            />
          )}
        />
      </FormField>

      <FormField label="Corrective Action Required" error={errors.description?.message} required>
        <Textarea 
          {...form.register('description')} 
          placeholder="Describe what needs to be done to resolve the finding..."
          error={!!errors.description}
        />
      </FormField>

      <FormField label="Resolution Notes" error={errors.resolutionNotes?.message}>
        <Textarea 
          {...form.register('resolutionNotes')} 
          placeholder="Notes added upon completion..."
          error={!!errors.resolutionNotes}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Action' : 'Assign Action'}
        </Button>
      </div>
    </form>
  );
}
