'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChangeOrderSchema, CreateChangeOrderInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useParams } from 'next/navigation';

interface ChangeOrderFormProps {
  onSubmit: (data: CreateChangeOrderInput) => void;
  isLoading?: boolean;
}

export function ChangeOrderForm({ onSubmit, isLoading }: ChangeOrderFormProps) {
  const params = useParams<{ projectId?: string }>();
  
  const form = useForm<CreateChangeOrderInput>({
    resolver: zodResolver(createChangeOrderSchema),
    defaultValues: {
      projectId: params?.projectId || '',
      coNumber: '',
      title: '',
      description: '',
      reasonCode: 'OWNER_REQUEST',
      costImpactCents: 0,
      scheduleImpactDays: 0,
      requestedBy: '',
    },
  });

  const { formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...form.register('projectId')} value={params?.projectId || ''} />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="CO Number" error={errors.coNumber?.message} required>
          <Input 
            {...form.register('coNumber')} 
            placeholder="e.g. CO-001"
            error={!!errors.coNumber}
          />
        </FormField>
        
        <FormField label="Requested By" error={errors.requestedBy?.message} required>
          <Input 
            {...form.register('requestedBy')} 
            placeholder="e.g. John Doe (Owner)"
            error={!!errors.requestedBy}
          />
        </FormField>
      </div>

      <FormField label="Title" error={errors.title?.message} required>
        <Input 
          {...form.register('title')} 
          placeholder="Brief title of the change"
          error={!!errors.title}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea 
          {...form.register('description')} 
          placeholder="Detailed explanation of the change order..."
          error={!!errors.description}
          rows={3}
        />
      </FormField>

      <FormField label="Reason Code" error={errors.reasonCode?.message} required>
        <Select 
          {...form.register('reasonCode')} 
          error={!!errors.reasonCode}
        >
          <option value="OWNER_REQUEST">Owner Request</option>
          <option value="DESIGN_CHANGE">Design Change</option>
          <option value="UNFORESEEN_CONDITION">Unforeseen Condition</option>
          <option value="CODE_REQUIREMENT">Code Requirement</option>
          <option value="ERROR_OMISSION">Error / Omission</option>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Cost Impact (Cents)" error={errors.costImpactCents?.message} required>
          <Input 
            {...form.register('costImpactCents', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.costImpactCents}
          />
        </FormField>
        
        <FormField label="Schedule Impact (Days)" error={errors.scheduleImpactDays?.message} required>
          <Input 
            {...form.register('scheduleImpactDays', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.scheduleImpactDays}
          />
        </FormField>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create Change Order
        </Button>
      </div>
    </form>
  );
}
