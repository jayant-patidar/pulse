'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { HardHat } from 'lucide-react';

export default function CompliancePage() {
  const { project, isLoading } = useProject();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Compliance & Safety"
        description="Insurance, policies, and government approvals."
        icon={<HardHat className="w-6 h-6" />}
      />
      <div className="glass p-6">
        <p className="text-brand-500">Compliance module placeholder.</p>
      </div>
    </div>
  );
}
