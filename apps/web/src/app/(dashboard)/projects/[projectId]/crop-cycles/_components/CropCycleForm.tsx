'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCropCycleInput, createCropCycleSchema } from '@pulse/validators';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

interface CropCycleFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateCropCycleInput) => void;
  isLoading?: boolean;
}

export function CropCycleForm({ projectId, initialData, onSubmit, isLoading }: CropCycleFormProps) {
  const form = useForm<CreateCropCycleInput>({
    resolver: zodResolver(createCropCycleSchema),
    defaultValues: {
      projectId: projectId,
      fieldName: initialData?.fieldName || '',
      cropType: initialData?.cropType || '',
      variety: initialData?.variety || '',
      plantingDate: initialData?.plantingDate ? new Date(initialData.plantingDate).toISOString() : new Date().toISOString(),
      expectedHarvestDate: initialData?.expectedHarvestDate ? new Date(initialData.expectedHarvestDate).toISOString() : undefined,
      acreage: initialData?.acreage || undefined,
      seedRatePerAcre: initialData?.seedRatePerAcre || undefined,
      rowSpacingInches: initialData?.rowSpacingInches || undefined,
      status: initialData?.status || 'PLANNED',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form id="crop-cycle-form" onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Field Name" error={errors.fieldName?.message} required>
        <Input 
          {...form.register('fieldName')} 
          placeholder="e.g. North-East 40" 
          error={!!errors.fieldName}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Crop Type" error={errors.cropType?.message} required>
          <Input 
            {...form.register('cropType')} 
            placeholder="e.g. Soybeans" 
            error={!!errors.cropType}
          />
        </FormField>
        <FormField label="Variety" error={errors.variety?.message}>
          <Input 
            {...form.register('variety')} 
            placeholder="e.g. Roundup Ready 2" 
            error={!!errors.variety}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="PLANNED">Planned</option>
            <option value="PLANTED">Planted</option>
            <option value="GROWING">Growing</option>
            <option value="HARVESTING">Harvesting</option>
            <option value="COMPLETED">Completed</option>
            <option value="ABANDONED">Abandoned</option>
          </Select>
        </FormField>

        <FormField label="Acreage" error={errors.acreage?.message}>
          <Input 
            {...form.register('acreage', { valueAsNumber: true })} 
            type="number"
            step="0.1"
            placeholder="0" 
            error={!!errors.acreage}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Planting Date" error={errors.plantingDate?.message} required>
          <Controller
            control={form.control}
            name="plantingDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.plantingDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date"
              />
            )}
          />
        </FormField>
        
        <FormField label="Expected Harvest" error={errors.expectedHarvestDate?.message}>
          <Controller
            control={form.control}
            name="expectedHarvestDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : undefined)}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.expectedHarvestDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date"
                isClearable
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Seed Rate per Acre" error={errors.seedRatePerAcre?.message}>
          <Input 
            {...form.register('seedRatePerAcre', { valueAsNumber: true })} 
            type="number"
            step="0.1"
            placeholder="lbs or seeds" 
            error={!!errors.seedRatePerAcre}
          />
        </FormField>
        <FormField label="Row Spacing (Inches)" error={errors.rowSpacingInches?.message}>
          <Input 
            {...form.register('rowSpacingInches', { valueAsNumber: true })} 
            type="number"
            step="1"
            placeholder="e.g. 30" 
            error={!!errors.rowSpacingInches}
          />
        </FormField>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Cycle' : 'Create Cycle'}
        </Button>
      </div>
    </form>
  );
}
