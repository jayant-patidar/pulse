'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDocumentSchema, CreateDocumentInput } from '@pulse/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';

interface DocumentFormProps {
  initialData?: any;
  onSubmit: (data: CreateDocumentInput) => void;
  isLoading?: boolean;
}

export function DocumentForm({ initialData, onSubmit, isLoading }: DocumentFormProps) {
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = params?.projectId || initialData?.projectId;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<any>('/trunk/projects?limit=100'),
  });
  const projects = projectsData|| [];

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      projectId: activeProjectId || '',
      name: initialData?.name || '',
      originalFilename: initialData?.originalFilename || 'dummy_file.pdf',
      fileType: initialData?.fileType || 'application/pdf',
      sizeBytes: initialData?.sizeBytes || 1024,
    },
  });

  const { formState: { errors } } = form;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) return;
      
      setSelectedFile(file);
      form.setValue('originalFilename', file.name);
      form.setValue('fileType', file.type || 'application/octet-stream');
      form.setValue('sizeBytes', file.size);
      
      // Auto-fill name if empty
      if (!form.getValues('name')) {
        form.setValue('name', file.name);
      }
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form id="document-form" onSubmit={handleSubmit} className="space-y-6">
      {activeProjectId ? (
        <FormField label="Project">
          <Input 
            value={projects.find((p: any) => p._id === activeProjectId)?.name || 'Loading...'} 
            disabled 
            className="bg-slate-50 dark:bg-brand-900/50 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
          />
          <input type="hidden" {...form.register('projectId')} value={activeProjectId} />
        </FormField>
      ) : (
        <FormField label="Project" error={errors.projectId?.message}>
          <Select 
            {...form.register('projectId')} 
            error={!!errors.projectId}
          >
            <option value="">No Project (General)</option>
            {projects.map((p: any) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Upload File" error={errors.originalFilename?.message} required>
        <div className="mt-2 flex justify-center rounded-xl border border-dashed border-brand-300 dark:border-brand-700 px-6 py-10">
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-brand-400" aria-hidden="true" />
            <div className="mt-4 flex text-sm leading-6 text-brand-600 dark:text-brand-400 justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-transparent font-semibold text-accent-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-600 focus-within:ring-offset-2 hover:text-accent-500"
              >
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-brand-500 dark:text-brand-500">
              {selectedFile ? selectedFile.name : 'PDF, PNG, JPG, DOC up to 50MB'}
            </p>
          </div>
        </div>
      </FormField>

      <FormField label="Document Name" error={errors.name?.message} required>
        <Input 
          {...form.register('name')} 
          placeholder="e.g. Site Plan v2" 
          error={!!errors.name}
        />
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Document' : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
}
