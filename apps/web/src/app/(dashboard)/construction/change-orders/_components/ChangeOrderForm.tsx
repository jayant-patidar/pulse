'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/core/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateChangeOrderInput, createChangeOrderSchema } from '@pulse/validators';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

interface ChangeOrderFormProps {
  initialData?: any;
  onSubmit: (data: CreateChangeOrderInput) => void;
  isLoading?: boolean;
}

export function ChangeOrderForm({ initialData, onSubmit, isLoading }: ChangeOrderFormProps) {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData|| [];

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<any>('/root/memberships'),
  });
  const users = usersData || [];

  const form = useForm<CreateChangeOrderInput>({
    resolver: zodResolver(createChangeOrderSchema),
    defaultValues: {
      projectId: initialData?.projectId || '',
      coNumber: initialData?.coNumber || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      reasonCode: initialData?.reasonCode || 'OWNER_REQUEST',
      costImpactCents: initialData?.costImpactCents || 0,
      scheduleImpactDays: initialData?.scheduleImpactDays || 0,
      requestedBy: initialData?.requestedBy || '',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form id="change-order-form" onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Project" error={errors.projectId?.message} required>
        <Select 
          {...form.register('projectId')} 
          error={!!errors.projectId}
        >
          <option value="" disabled>Select a project</option>
          {projects.map((p: any) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="CO Number" error={errors.coNumber?.message} required>
          <Input 
            {...form.register('coNumber')} 
            placeholder="e.g. CO-001" 
            error={!!errors.coNumber}
          />
        </FormField>
        
        <FormField label="Reason" error={errors.reasonCode?.message} required>
          <Select {...form.register('reasonCode')} error={!!errors.reasonCode}>
            <option value="OWNER_REQUEST">Owner Request</option>
            <option value="DESIGN_CHANGE">Design Change</option>
            <option value="UNFORESEEN_CONDITION">Unforeseen Condition</option>
            <option value="CODE_REQUIREMENT">Code Requirement</option>
            <option value="ERROR_OMISSION">Error / Omission</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Title" error={errors.title?.message} required>
        <Input 
          {...form.register('title')} 
          placeholder="e.g. Additional electrical outlets in lobby" 
          error={!!errors.title}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Cost Impact (Cents)" error={errors.costImpactCents?.message}>
          <Input 
            {...form.register('costImpactCents', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.costImpactCents}
          />
        </FormField>

        <FormField label="Schedule Impact (Days)" error={errors.scheduleImpactDays?.message}>
          <Input 
            {...form.register('scheduleImpactDays', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.scheduleImpactDays}
          />
        </FormField>
      </div>

      <FormField label="Requested By" error={errors.requestedBy?.message} required>
        <Select 
          {...form.register('requestedBy')} 
          error={!!errors.requestedBy}
        >
          <option value="" disabled>Select a user</option>
          {users.map((u: any) => (
            <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea 
          {...form.register('description')} 
          placeholder="Detailed description of the change..."
          error={!!errors.description}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Change Order' : 'Create Change Order'}
        </Button>
      </div>
    </form>
  );
}
