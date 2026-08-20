'use client';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useVocabulary } from '@/core/lib/vocabulary';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectInput, createProjectSchema } from '@pulse/validators';
import { useForm } from 'react-hook-form';

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: CreateProjectInput) => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const vocabulary = useVocabulary();
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
      industry: initialData?.industry || 'CONSTRUCTION',
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
      <FormField label={vocabulary.projectName} error={errors.name?.message} required>
        <Input 
          {...form.register('name')} 
          placeholder={vocabulary.projectName} 
          error={!!errors.name}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea 
          {...form.register('description')} 
          placeholder="Brief description..."
          error={!!errors.description}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Industry" error={errors.industry?.message} required>
          <select 
            {...form.register('industry')} 
            className={`w-full rounded-xl border border-brand-200 dark:border-brand-800 bg-transparent px-3 py-2 text-sm outline-none transition-all placeholder:text-brand-400 dark:placeholder:text-brand-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 dark:focus:border-accent-400 dark:focus:ring-accent-400 ${errors.industry ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="CONSTRUCTION">Construction</option>
            <option value="AGRICULTURE">Agriculture</option>
            <option value="ENERGY">Energy</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="GOVERNMENT">Government</option>
            <option value="INSPECTION">Inspection</option>
          </select>
        </FormField>
      </div>

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
          {initialData ? `Update` : vocabulary.newProject}
        </Button>
      </div>
    </form>
  );
}
