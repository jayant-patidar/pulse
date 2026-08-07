'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCoiSchema, CreateCoiInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';

interface COIFormProps {
  initialData?: any;
  onSubmit: (data: CreateCoiInput) => void;
  isLoading?: boolean;
}

export function COIForm({ initialData, onSubmit, isLoading }: COIFormProps) {
  const form = useForm<CreateCoiInput>({
    resolver: zodResolver(createCoiSchema),
    defaultValues: {
      subcontractorName: initialData?.subcontractorName || '',
      policyType: initialData?.policyType || 'GENERAL_LIABILITY',
      carrierName: initialData?.carrierName || '',
      policyNumber: initialData?.policyNumber || '',
      perOccurrenceLimitCents: initialData?.perOccurrenceLimitCents || undefined,
      aggregateLimitCents: initialData?.aggregateLimitCents || undefined,
      effectiveDate: initialData?.effectiveDate ? new Date(initialData.effectiveDate).toISOString().slice(0, 16) : '',
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().slice(0, 16) : '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      effectiveDate: new Date(data.effectiveDate).toISOString(),
      expiryDate: new Date(data.expiryDate).toISOString(),
    };
    onSubmit(formattedData);
  });

  return (
    <form id="coi-form" onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Subcontractor Name" error={errors.subcontractorName?.message}>
        <Input 
          {...form.register('subcontractorName')} 
          placeholder="e.g. Smith Plumbing" 
          error={!!errors.subcontractorName}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Policy Type" error={errors.policyType?.message} required>
          <Select {...form.register('policyType')} error={!!errors.policyType}>
            <option value="GENERAL_LIABILITY">General Liability</option>
            <option value="WORKERS_COMP">Workers Comp</option>
            <option value="AUTO">Auto</option>
            <option value="UMBRELLA">Umbrella</option>
            <option value="PROFESSIONAL">Professional</option>
          </Select>
        </FormField>
        
        <FormField label="Policy Number" error={errors.policyNumber?.message} required>
          <Input 
            {...form.register('policyNumber')} 
            placeholder="e.g. GL-102030" 
            error={!!errors.policyNumber}
          />
        </FormField>
      </div>

      <FormField label="Carrier Name" error={errors.carrierName?.message} required>
        <Input 
          {...form.register('carrierName')} 
          placeholder="e.g. Travelers Insurance" 
          error={!!errors.carrierName}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Per Occurrence Limit (Cents)" error={errors.perOccurrenceLimitCents?.message}>
          <Input 
            {...form.register('perOccurrenceLimitCents', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.perOccurrenceLimitCents}
          />
        </FormField>

        <FormField label="Aggregate Limit (Cents)" error={errors.aggregateLimitCents?.message}>
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
          <Input 
            {...form.register('effectiveDate')} 
            type="datetime-local"
            error={!!errors.effectiveDate}
          />
        </FormField>

        <FormField label="Expiry Date" error={errors.expiryDate?.message} required>
          <Input 
            {...form.register('expiryDate')} 
            type="datetime-local"
            error={!!errors.expiryDate}
          />
        </FormField>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update COI' : 'Record COI'}
        </Button>
      </div>
    </form>
  );
}
