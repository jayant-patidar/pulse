'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInputInventorySchema, CreateInputInventoryInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import DatePicker from 'react-datepicker';

interface InventoryFormProps {
  initialData?: any;
  onSubmit: (data: CreateInputInventoryInput) => void;
  isLoading?: boolean;
}

export function InventoryForm({ initialData, onSubmit, isLoading }: InventoryFormProps) {
  const form = useForm<CreateInputInventoryInput>({
    resolver: zodResolver(createInputInventorySchema),
    defaultValues: {
      inputType: initialData?.inputType || 'SEED',
      productName: initialData?.productName || '',
      manufacturer: initialData?.manufacturer || '',
      quantityOnHand: initialData?.quantityOnHand || 0,
      unit: initialData?.unit || '',
      costPerUnitCents: initialData?.costPerUnitCents ? initialData.costPerUnitCents / 100 : undefined,
      expirationDate: initialData?.expirationDate ? new Date(initialData.expirationDate).toISOString() : undefined,
      epaRegistrationNumber: initialData?.epaRegistrationNumber || '',
      status: initialData?.status || 'IN_STOCK',
      notes: initialData?.notes || '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    // Convert cost to cents
    const formattedData = {
      ...data,
      costPerUnitCents: data.costPerUnitCents ? Math.round(data.costPerUnitCents * 100) : undefined,
    };
    onSubmit(formattedData);
  });

  return (
    <form id="inventory-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category" error={errors.inputType?.message} required>
          <Select {...form.register('inputType')} error={!!errors.inputType}>
            <option value="SEED">Seed</option>
            <option value="FERTILIZER">Fertilizer</option>
            <option value="HERBICIDE">Herbicide</option>
            <option value="INSECTICIDE">Insecticide</option>
            <option value="FUNGICIDE">Fungicide</option>
            <option value="FUEL">Fuel</option>
            <option value="OTHER">Other</option>
          </Select>
        </FormField>

        <FormField label="Status" error={errors.status?.message} required>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Product Name" error={errors.productName?.message} required>
        <Input 
          {...form.register('productName')} 
          placeholder="e.g. Pioneer 1197AMX Corn Seed" 
          error={!!errors.productName}
        />
      </FormField>

      <FormField label="Manufacturer" error={errors.manufacturer?.message}>
        <Input 
          {...form.register('manufacturer')} 
          placeholder="e.g. Corteva" 
          error={!!errors.manufacturer}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Quantity on Hand" error={errors.quantityOnHand?.message} required>
          <Input 
            {...form.register('quantityOnHand', { valueAsNumber: true })} 
            type="number"
            step="0.01"
            placeholder="0" 
            error={!!errors.quantityOnHand}
          />
        </FormField>

        <FormField label="Unit of Measure" error={errors.unit?.message} required>
          <Input 
            {...form.register('unit')} 
            placeholder="e.g. Gallons, Bags, Tons" 
            error={!!errors.unit}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Cost per Unit (USD)" error={errors.costPerUnitCents?.message} required>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-brand-500 sm:text-sm">$</span>
            </div>
            <Input 
              {...form.register('costPerUnitCents', { valueAsNumber: true })} 
              type="number"
              step="0.01"
              className="pl-7"
              placeholder="0.00" 
              error={!!errors.costPerUnitCents}
            />
          </div>
        </FormField>

        <FormField label="Expiration Date" error={errors.expirationDate?.message}>
          <Controller
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : undefined)}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.expirationDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date"
                isClearable
              />
            )}
          />
        </FormField>
      </div>

      <FormField label="EPA Registration Number" error={errors.epaRegistrationNumber?.message}>
        <Input 
          {...form.register('epaRegistrationNumber')} 
          placeholder="Required for restricted chemicals" 
          error={!!errors.epaRegistrationNumber}
        />
      </FormField>

      <FormField label="Notes" error={errors.notes?.message}>
        <Textarea 
          {...form.register('notes')} 
          placeholder="Storage location or other notes..."
          error={!!errors.notes}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
