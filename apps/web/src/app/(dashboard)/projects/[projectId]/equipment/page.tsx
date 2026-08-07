'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tractor } from 'lucide-react';

export default function ProjectEquipmentPage() {
  const { project, isLoading } = useProject();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Project Fleet"
        description="Equipment leased, rented, or assigned specifically to this project."
        icon={<Tractor className="w-6 h-6" />}
      />
      <div className="glass p-6">
        <p className="text-brand-500">Project equipment tracking placeholder.</p>
      </div>
    </div>
  );
}
