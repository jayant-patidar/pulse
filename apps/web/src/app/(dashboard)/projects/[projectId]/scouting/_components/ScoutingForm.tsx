'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createScoutingReportSchema, CreateScoutingReportInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Textarea';
import DatePicker from 'react-datepicker';

interface ScoutingFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateScoutingReportInput) => void;
  isLoading?: boolean;
}

export function ScoutingForm({ projectId, initialData, onSubmit, isLoading }: ScoutingFormProps) {
  const form = useForm<CreateScoutingReportInput>({
    resolver: zodResolver(createScoutingReportSchema),
    defaultValues: {
      projectId: projectId,
      cropCycleId: initialData?.cropCycleId || '',
      scoutDate: initialData?.scoutDate ? new Date(initialData.scoutDate).toISOString() : new Date().toISOString(),
      fieldZone: initialData?.fieldZone || '',
      observationType: initialData?.observationType || 'PEST',
      severity: initialData?.severity || 'LOW',
      description: initialData?.description || '',
      recommendation: initialData?.recommendation || '',
      status: initialData?.status || 'OPEN',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form id="scouting-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Observation Type" error={errors.observationType?.message} required>
          <Select {...form.register('observationType')} error={!!errors.observationType}>
            <option value="PEST">Pest</option>
            <option value="DISEASE">Disease</option>
            <option value="WEED">Weed</option>
            <option value="NUTRIENT_DEFICIENCY">Nutrient Deficiency</option>
            <option value="WEATHER_DAMAGE">Weather Damage</option>
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
        <FormField label="Scout Date" error={errors.scoutDate?.message} required>
          <Controller
            control={form.control}
            name="scoutDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy h:mm aa"
                showTimeSelect
                className={`input-base ${errors.scoutDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date and time"
              />
            )}
          />
        </FormField>
        
        <FormField label="Status" error={errors.status?.message}>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="OPEN">Open</option>
            <option value="TREATED">Treated</option>
            <option value="RESOLVED">Resolved</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Field/Zone" error={errors.fieldZone?.message}>
          <Input 
            {...form.register('fieldZone')} 
            placeholder="e.g. North-East 40" 
            error={!!errors.fieldZone}
          />
        </FormField>

        <FormField label="Crop Cycle ID (Optional)" error={errors.cropCycleId?.message}>
          <Input 
            {...form.register('cropCycleId')} 
            placeholder="Link to crop cycle" 
            error={!!errors.cropCycleId}
          />
        </FormField>
      </div>

      <FormField label="Description" error={errors.description?.message} required>
        <Textarea 
          {...form.register('description')} 
          placeholder="Describe the issue found..."
          error={!!errors.description}
        />
      </FormField>

      <FormField label="Recommendation / Action Taken" error={errors.recommendation?.message}>
        <Textarea 
          {...form.register('recommendation')} 
          placeholder="e.g. Apply fungicide immediately"
          error={!!errors.recommendation}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Report' : 'Log Report'}
        </Button>
      </div>
    </form>
  );
}
