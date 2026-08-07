'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Settings } from 'lucide-react';

export default function FinancePage() {
  const { project, isLoading } = useProject();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Finance"
        description="Budgets, expenses, and invoices."
        icon={<Settings className="w-6 h-6" />}
      />
      <div className="glass p-6">
        <p className="text-brand-500">Integration with QuickBooks/Procore placeholders coming soon.</p>
      </div>
    </div>
  );
}
