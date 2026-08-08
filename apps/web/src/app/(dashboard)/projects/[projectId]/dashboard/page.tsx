'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LayoutDashboard } from 'lucide-react';
import { PulseLoader } from '@/components/ui/PulseLoader';

export default function ProjectDashboardPage() {
  const { project, isLoading } = useProject();

  if (isLoading) return <PulseLoader size="lg" text="Loading project..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title={project?.name || 'Project Overview'}
        description={`Dashboard and high-level metrics for ${project?.name || 'this project'}.`}
        icon={<LayoutDashboard className="w-6 h-6" />}
      />
      <div className="glass p-6">
        <p className="text-brand-500">More widgets coming soon...</p>
      </div>
    </div>
  );
}
