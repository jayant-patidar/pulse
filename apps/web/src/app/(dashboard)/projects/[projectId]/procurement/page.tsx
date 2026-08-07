'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { ClipboardList } from 'lucide-react';

export default function ProcurementPage() {
  const { project, isLoading } = useProject();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Procurement"
        description="Purchase orders, vendors, and contracts."
        icon={<ClipboardList className="w-6 h-6" />}
      />
      <div className="glass p-6">
        <p className="text-brand-500">Procurement module placeholder.</p>
      </div>
    </div>
  );
}
