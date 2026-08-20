'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCertificationInput, createCertificationSchema } from '@pulse/validators';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

interface CertificationFormProps {
  projectId: string;
  initialData?: any;
  onSubmit: (data: CreateCertificationInput) => void;
  isLoading?: boolean;
}

export function CertificationForm({ projectId, initialData, onSubmit, isLoading }: CertificationFormProps) {
  const form = useForm<CreateCertificationInput>({
    resolver: zodResolver(createCertificationSchema),
    defaultValues: {
      projectId: projectId,
      certificationType: initialData?.certificationType || 'OCCUPANCY_PERMIT',
      certificationNumber: initialData?.certificationNumber || '',
      issuedBy: initialData?.issuedBy || '',
      issuedDate: initialData?.issuedDate ? new Date(initialData.issuedDate).toISOString() : new Date().toISOString(),
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString() : '',
      conditions: initialData?.conditions || '',
      status: initialData?.status || 'ACTIVE',
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    const cleanedData = { ...data };
    if (!cleanedData.expiryDate) {
      delete cleanedData.expiryDate;
    }
    onSubmit(cleanedData);
  });

  return (
    <form id="certification-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Certification Type" error={errors.certificationType?.message} required>
          <Select {...form.register('certificationType')} error={!!errors.certificationType}>
            <option value="OCCUPANCY_PERMIT">Occupancy Permit</option>
            <option value="FIRE_CLEARANCE">Fire Clearance</option>
            <option value="HEALTH_PERMIT">Health Permit</option>
            <option value="ELEVATOR_CERT">Elevator Cert</option>
            <option value="ENVIRONMENTAL_CLEARANCE">Environmental Clearance</option>
            <option value="CODE_COMPLIANCE">Code Compliance</option>
            <option value="OTHER">Other</option>
          </Select>
        </FormField>
        
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...form.register('status')} error={!!errors.status}>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REVOKED">Revoked</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Certification/Permit #" error={errors.certificationNumber?.message}>
          <Input 
            {...form.register('certificationNumber')} 
            placeholder="e.g. PERM-2026-991" 
            error={!!errors.certificationNumber}
          />
        </FormField>

        <FormField label="Issued By (Authority)" error={errors.issuedBy?.message} required>
          <Input 
            {...form.register('issuedBy')} 
            placeholder="e.g. City Fire Dept" 
            error={!!errors.issuedBy}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Issued Date" error={errors.issuedDate?.message} required>
          <Controller
            control={form.control}
            name="issuedDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? date.toISOString() : '')}
                dateFormat="MMMM d, yyyy"
                className={`input-base ${errors.issuedDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                wrapperClassName="w-full"
                placeholderText="Select issue date"
              />
            )}
          />
        </FormField>
        
        <FormField label="Expiry Date (Optional)" error={errors.expiryDate?.message}>
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
                placeholderText="Select expiry date"
                isClearable
              />
            )}
          />
        </FormField>
      </div>

      <FormField label="Conditions / Remarks" error={errors.conditions?.message}>
        <Textarea 
          {...form.register('conditions')} 
          placeholder="Any special conditions attached to this permit..."
          error={!!errors.conditions}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Certification' : 'Add Certification'}
        </Button>
      </div>
    </form>
  );
}
