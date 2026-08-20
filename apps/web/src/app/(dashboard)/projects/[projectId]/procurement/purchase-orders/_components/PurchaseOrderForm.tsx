'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPurchaseOrderSchema, CreatePurchaseOrderInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';

interface PurchaseOrderFormProps {
  initialData?: any;
  onSubmit: (data: CreatePurchaseOrderInput) => void;
  isLoading?: boolean;
}

export function PurchaseOrderForm({ initialData, onSubmit, isLoading }: PurchaseOrderFormProps) {
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = params?.projectId || initialData?.projectId;

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData|| [];

  const form = useForm<CreatePurchaseOrderInput>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      projectId: activeProjectId || '',
      poNumber: initialData?.poNumber || '',
      supplierName: initialData?.supplierName || '',
      supplierContact: initialData?.supplierContact || '',
      totalAmountCents: initialData?.totalAmountCents || 0,
      deliveryDateExpected: initialData?.deliveryDateExpected ? new Date(initialData.deliveryDateExpected).toISOString().slice(0, 16) : '',
      deliveryLocation: initialData?.deliveryLocation || '',
      paymentTerms: initialData?.paymentTerms || 'Net 30',
      lineItems: initialData?.lineItems || [],
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      deliveryDateExpected: data.deliveryDateExpected ? new Date(data.deliveryDateExpected).toISOString() : undefined,
    };
    onSubmit(formattedData);
  });

  return (
    <form id="purchase-order-form" onSubmit={handleSubmit} className="space-y-6">
      {activeProjectId ? (
        <FormField label="Project" required>
          <Input 
            value={projects.find((p: any) => p._id === activeProjectId)?.name || 'Loading / Unknown Project'} 
            disabled 
            className="bg-slate-50 dark:bg-brand-900/50 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
          />
          <input type="hidden" {...form.register('projectId')} value={activeProjectId} />
        </FormField>
      ) : (
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
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="PO Number" error={errors.poNumber?.message} required>
          <Input 
            {...form.register('poNumber')} 
            placeholder="e.g. PO-10293" 
            error={!!errors.poNumber}
          />
        </FormField>
        
        <FormField label="Total Amount (Cents)" error={errors.totalAmountCents?.message} required>
          <Input 
            {...form.register('totalAmountCents', { valueAsNumber: true })} 
            type="number"
            placeholder="0"
            error={!!errors.totalAmountCents}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Supplier Name" error={errors.supplierName?.message} required>
          <Input 
            {...form.register('supplierName')} 
            placeholder="e.g. Acme Materials" 
            error={!!errors.supplierName}
          />
        </FormField>

        <FormField label="Supplier Contact" error={errors.supplierContact?.message}>
          <Input 
            {...form.register('supplierContact')} 
            placeholder="e.g. john@acme.com" 
            error={!!errors.supplierContact}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Expected Delivery Date" error={errors.deliveryDateExpected?.message}>
          <Input 
            {...form.register('deliveryDateExpected')} 
            type="datetime-local"
            error={!!errors.deliveryDateExpected}
          />
        </FormField>

        <FormField label="Payment Terms" error={errors.paymentTerms?.message}>
          <Select {...form.register('paymentTerms')} error={!!errors.paymentTerms}>
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="Due on Receipt">Due on Receipt</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Delivery Location" error={errors.deliveryLocation?.message}>
        <Input 
          {...form.register('deliveryLocation')} 
          placeholder="e.g. Site Entrance B" 
          error={!!errors.deliveryLocation}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update PO' : 'Create PO'}
        </Button>
      </div>
    </form>
  );
}
