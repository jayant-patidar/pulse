'use client';

import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSafetyIncidentSchema, CreateSafetyIncidentInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

interface SafetyIncidentFormProps {
  projectId: string;
  onSubmit: (data: CreateSafetyIncidentInput) => void;
  isLoading?: boolean;
}

export function SafetyIncidentForm({ projectId, onSubmit, isLoading }: SafetyIncidentFormProps) {
  const form = useForm<CreateSafetyIncidentInput>({
    resolver: zodResolver(createSafetyIncidentSchema),
    defaultValues: {
      projectId,
      incidentType: 'NEAR_MISS',
      severity: 'LOW',
      dateOccurred: new Date().toISOString(),
      description: '',
      immediateActionsTaken: '',
      locationOnSite: '',
      timeOccurred: '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Incident Type" error={errors.incidentType?.message} required>
        <select 
          {...form.register('incidentType')}
          className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          <option value="NEAR_MISS">Near Miss</option>
          <option value="INJURY">Injury</option>
          <option value="PROPERTY_DAMAGE">Property Damage</option>
          <option value="ENVIRONMENTAL">Environmental</option>
          <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
        </select>
      </FormField>

      <FormField label="Severity" error={errors.severity?.message} required>
        <select 
          {...form.register('severity')}
          className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </FormField>

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

      <FormField label="Description" error={errors.description?.message} required>
        <textarea 
          {...form.register('description')} 
          placeholder="Describe what happened..."
          className="w-full p-3 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Log Incident
        </Button>
      </div>
    </form>
  );
}
