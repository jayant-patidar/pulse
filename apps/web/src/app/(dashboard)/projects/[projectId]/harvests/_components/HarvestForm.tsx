'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHarvestLogSchema, CreateHarvestLogInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Textarea';
import DatePicker from 'react-datepicker';

interface HarvestFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateHarvestLogInput) => void;
  isLoading?: boolean;
}

export function HarvestForm({ projectId, initialData, onSubmit, isLoading }: HarvestFormProps) {
  const form = useForm<CreateHarvestLogInput>({
    resolver: zodResolver(createHarvestLogSchema),
    defaultValues: {
      projectId: projectId,
      cropCycleId: initialData?.cropCycleId || '',
      harvestDate: initialData?.harvestDate ? new Date(initialData.harvestDate).toISOString() : new Date().toISOString(),
      fieldZone: initialData?.fieldZone || '',
      acresHarvested: initialData?.acresHarvested || 0,
      yieldBushelsPerAcre: initialData?.yieldBushelsPerAcre || undefined,
      moisturePercent: initialData?.moisturePercent || undefined,
      grainQualityGrade: initialData?.grainQualityGrade || '',
      storageLocation: initialData?.storageLocation || '',
      notes: initialData?.notes || '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const cleanedData = { ...data };
    if (!cleanedData.cropCycleId) {
      delete cleanedData.cropCycleId;
    }
    onSubmit(cleanedData);
  });

  return (
    <form id="harvest-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Harvest Date" error={errors.harvestDate?.message} required>
          <Controller
            control={form.control}
            name="harvestDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.harvestDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date"
              />
            )}
          />
        </FormField>
        
        <FormField label="Field/Zone" error={errors.fieldZone?.message}>
          <Input 
            {...form.register('fieldZone')} 
            placeholder="e.g. South 80" 
            error={!!errors.fieldZone}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Acres Harvested" error={errors.acresHarvested?.message} required>
          <Input 
            {...form.register('acresHarvested', { valueAsNumber: true })} 
            type="number"
            step="0.1"
            placeholder="0" 
            error={!!errors.acresHarvested}
          />
        </FormField>

        <FormField label="Yield (bu/acre)" error={errors.yieldBushelsPerAcre?.message}>
          <Input 
            {...form.register('yieldBushelsPerAcre', { valueAsNumber: true })} 
            type="number"
            step="0.1"
            placeholder="0" 
            error={!!errors.yieldBushelsPerAcre}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Moisture (%)" error={errors.moisturePercent?.message}>
          <Input 
            {...form.register('moisturePercent', { valueAsNumber: true })} 
            type="number"
            step="0.1"
            placeholder="e.g. 14.5" 
            error={!!errors.moisturePercent}
          />
        </FormField>

        <FormField label="Quality Grade" error={errors.grainQualityGrade?.message}>
          <Input 
            {...form.register('grainQualityGrade')} 
            placeholder="e.g. Grade 1" 
            error={!!errors.grainQualityGrade}
          />
        </FormField>
      </div>

      <FormField label="Crop Cycle ID (Optional)" error={errors.cropCycleId?.message}>
        <Input 
          {...form.register('cropCycleId')} 
          placeholder="Link to a specific crop cycle" 
          error={!!errors.cropCycleId}
        />
      </FormField>

      <FormField label="Storage Location" error={errors.storageLocation?.message}>
        <Input 
          {...form.register('storageLocation')} 
          placeholder="e.g. Silo B, Elevator" 
          error={!!errors.storageLocation}
        />
      </FormField>

      <FormField label="Notes" error={errors.notes?.message}>
        <Textarea 
          {...form.register('notes')} 
          placeholder="Weather conditions, machinery used, etc."
          error={!!errors.notes}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Harvest' : 'Log Harvest'}
        </Button>
      </div>
    </form>
  );
}
