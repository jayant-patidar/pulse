'use client';

import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';

interface ProjectContextType {
  project: any | null;
  isLoading: boolean;
  error: any;
}

const ProjectContext = createContext<ProjectContextType>({
  project: null,
  isLoading: true,
  error: null,
});

export function ProjectProvider({ children, projectId }: { children: React.ReactNode, projectId: string }) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/trunk/projects/${projectId}`);
      return res;
    },
    enabled: !!projectId,
  });

  return (
    <ProjectContext.Provider value={{ project, isLoading, error }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
