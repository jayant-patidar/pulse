import React from 'react';
import { ProjectProvider } from '@/core/providers/project-provider';

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <ProjectProvider projectId={params.projectId}>
      {children}
    </ProjectProvider>
  );
}
