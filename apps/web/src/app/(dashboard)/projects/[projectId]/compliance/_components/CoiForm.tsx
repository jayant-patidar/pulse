'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCoiInput, createCoiSchema } from '@pulse/validators';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

interface CoiFormProps {
  onSubmit: (data: CreateCoiInput) => void;
  isLoading?: boolean;
}

export function CoiForm({ onSubmit, isLoading }: CoiFormProps) {
  const form = useForm<CreateCoiInput>({
    resolver: zodResolver(createCoiSchema),
    defaultValues: {
      subcontractorName: '',
      policyType: 'GENERAL_LIABILITY',
      carrierName: '',
      policyNumber: '',
      perOccurrenceLimitCents: 0,
      aggregateLimitCents: 0,
      effectiveDate: new Date().toISOString(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    },
  });

  const { formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Subcontractor Name" error={errors.subcontractorName?.message}>
        <Input 
          {...form.register('subcontractorName')} 
          placeholder="e.g. Acme Construction"
          error={!!errors.subcontractorName}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Carrier Name" error={errors.carrierName?.message} required>
          <Input 
            {...form.register('carrierName')} 
            placeholder="e.g. State Farm"
            error={!!errors.carrierName}
          />
        </FormField>
        
        <FormField label="Policy Number" error={errors.policyNumber?.message} required>
          <Input 
            {...form.register('policyNumber')} 
            placeholder="e.g. POL-123456"
            error={!!errors.policyNumber}
          />
        </FormField>
      </div>

      <FormField label="Policy Type" error={errors.policyType?.message} required>
        <Select 
          {...form.register('policyType')} 
          error={!!errors.policyType}
        >
          <option value="GENERAL_LIABILITY">General Liability</option>
          <option value="WORKERS_COMP">Workers Compensation</option>
          <option value="AUTO">Auto</option>
          <option value="UMBRELLA">Umbrella</option>
          <option value="PROFESSIONAL">Professional Liability</option>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Per Occurrence Limit ($)" error={errors.perOccurrenceLimitCents?.message}>
          <Input 
            {...form.register('perOccurrenceLimitCents', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.perOccurrenceLimitCents}
          />
        </FormField>
        
        <FormField label="Aggregate Limit ($)" error={errors.aggregateLimitCents?.message}>
          <Input 
            {...form.register('aggregateLimitCents', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.aggregateLimitCents}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Effective Date" error={errors.effectiveDate?.message} required>
          <Controller
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.effectiveDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date"
              />
            )}
          />
        </FormField>
        
        <FormField label="Expiry Date" error={errors.expiryDate?.message} required>
          <Controller
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.expiryDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select date"
              />
            )}
          />
        </FormField>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Request COI
        </Button>
      </div>
    </form>
  );
}
