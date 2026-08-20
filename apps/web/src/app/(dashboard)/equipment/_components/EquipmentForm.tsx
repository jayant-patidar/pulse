'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEquipmentInput, createEquipmentSchema } from '@pulse/validators';
import { useForm } from 'react-hook-form';

interface EquipmentFormProps {
  initialData?: any;
  onSubmit: (data: CreateEquipmentInput) => void;
  isLoading?: boolean;
}

export function EquipmentForm({ initialData, onSubmit, isLoading }: EquipmentFormProps) {
  const form = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      name: initialData?.name || '',
      assetTag: initialData?.assetTag || '',
      make: initialData?.make || '',
      modelName: initialData?.modelName || '',
      year: initialData?.year || undefined,
      serialNumber: initialData?.serialNumber || '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form id="equipment-form" onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Equipment Name" error={errors.name?.message} required>
        <Input 
          {...form.register('name')} 
          placeholder="e.g. Excavator 320" 
          error={!!errors.name}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Asset Tag" error={errors.assetTag?.message}>
          <Input 
            {...form.register('assetTag')} 
            placeholder="e.g. EQ-1042" 
            error={!!errors.assetTag}
          />
        </FormField>
        
        <FormField label="Year" error={errors.year?.message}>
          <Input 
            {...form.register('year', { valueAsNumber: true })} 
            type="number"
            placeholder="e.g. 2023"
            error={!!errors.year}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Make" error={errors.make?.message}>
          <Input 
            {...form.register('make')} 
            placeholder="e.g. Caterpillar" 
            error={!!errors.make}
          />
        </FormField>

        <FormField label="Model" error={errors.modelName?.message}>
          <Input 
            {...form.register('modelName')} 
            placeholder="e.g. 320 GC" 
            error={!!errors.modelName}
          />
        </FormField>
      </div>

      <FormField label="Serial Number" error={errors.serialNumber?.message}>
        <Input 
          {...form.register('serialNumber')} 
          placeholder="Serial Number / VIN" 
          error={!!errors.serialNumber}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Equipment' : 'Add Equipment'}
        </Button>
      </div>
    </form>
  );
}
