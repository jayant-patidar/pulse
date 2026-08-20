'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInspectionInput, createInspectionSchema } from '@pulse/validators';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

interface InspectionFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateInspectionInput) => void;
  isLoading?: boolean;
}

export function InspectionForm({ projectId, initialData, onSubmit, isLoading }: InspectionFormProps) {
  const form = useForm<CreateInspectionInput>({
    resolver: zodResolver(createInspectionSchema),
    defaultValues: {
      projectId: projectId,
      inspectionType: initialData?.inspectionType || 'STRUCTURAL',
      scheduledDate: initialData?.scheduledDate ? new Date(initialData.scheduledDate).toISOString() : new Date().toISOString(),
      scope: initialData?.scope || '',
      inspectorNotes: initialData?.inspectorNotes || '',
      checklistId: initialData?.checklistId || '',
      overallResult: initialData?.overallResult || 'PENDING',
      status: initialData?.status || 'SCHEDULED',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const cleanedData = { ...data };
    if (!cleanedData.checklistId) {
      delete cleanedData.checklistId;
    }
    onSubmit(cleanedData);
  });

  return (
    <form id="inspection-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Inspection Type" error={errors.inspectionType?.message} required>
          <Select {...form.register('inspectionType')} error={!!errors.inspectionType}>
            <option value="STRUCTURAL">Structural</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="FIRE_SAFETY">Fire Safety</option>
            <option value="ENVIRONMENTAL">Environmental</option>
            <option value="ELEVATOR">Elevator</option>
            <option value="HEALTH">Health</option>
            <option value="CODE_ENFORCEMENT">Code Enforcement</option>
          </Select>
        </FormField>
        
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Scheduled Date" error={errors.scheduledDate?.message} required>
          <Controller
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy h:mm aa"
                showTimeSelect
                className={`input-base ${errors.scheduledDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date and time"
              />
            )}
          />
        </FormField>
        
        <FormField label="Overall Result" error={errors.overallResult?.message}>
          <Select {...form.register('overallResult')} error={!!errors.overallResult}>
            <option value="PENDING">Pending</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
            <option value="CONDITIONAL">Conditional Pass</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Scope" error={errors.scope?.message}>
        <Input 
          {...form.register('scope')} 
          placeholder="e.g. Inspect all HVAC units on roof" 
          error={!!errors.scope}
        />
      </FormField>

      <FormField label="Inspector Notes" error={errors.inspectorNotes?.message}>
        <Textarea 
          {...form.register('inspectorNotes')} 
          placeholder="Detailed notes from the inspection..."
          error={!!errors.inspectorNotes}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Inspection' : 'Schedule Inspection'}
        </Button>
      </div>
    </form>
  );
}
