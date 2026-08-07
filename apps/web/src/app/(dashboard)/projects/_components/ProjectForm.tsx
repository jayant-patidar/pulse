'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: CreateProjectInput) => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      budget: initialData?.budget ? initialData.budget / 100 : undefined,
      location: {
        city: initialData?.location?.city || '',
        state: initialData?.location?.state || '',
      },
    },
  });

  const { formState: { errors } } = form;

  const handleSubmit = form.handleSubmit((data) => {
    // Budget needs to be cents if we handle it that way in the backend
    const formattedData = {
      ...data,
      budget: data.budget ? Math.round(data.budget * 100) : undefined,
    };
    onSubmit(formattedData);
  });

  return (
    <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Project Name" error={errors.name?.message} required>
        <Input 
          {...form.register('name')} 
          placeholder="e.g. Downtown Commercial High-Rise" 
          error={!!errors.name}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea 
          {...form.register('description')} 
          placeholder="Brief description of the project..."
          error={!!errors.description}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" error={errors.location?.city?.message}>
          <Input 
            {...form.register('location.city')} 
            placeholder="e.g. New York" 
            error={!!errors.location?.city}
          />
        </FormField>

        <FormField label="State" error={errors.location?.state?.message}>
          <Input 
            {...form.register('location.state')} 
            placeholder="e.g. NY" 
            error={!!errors.location?.state}
          />
        </FormField>
      </div>

      <FormField label="Budget (USD)" error={errors.budget?.message}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-brand-500 sm:text-sm">$</span>
          </div>
          <Input 
            {...form.register('budget', { valueAsNumber: true })} 
            type="number"
            className="pl-7"
            placeholder="0.00" 
            error={!!errors.budget}
          />
        </div>
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
