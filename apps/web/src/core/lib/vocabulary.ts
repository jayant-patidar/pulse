'use client';

import { useEffect, useState } from 'react';

type IndustryType = 'CONSTRUCTION' | 'AGRICULTURE' | 'ENERGY' | 'HVAC';

export const VOCABULARY = {
  CONSTRUCTION: {
    project: 'Project',
    projects: 'All Projects',
    projectListTitle: 'Projects',
    projectListDescription: 'Manage all construction projects and their lifecycles.',
    newProject: 'New Project',
    projectName: 'Project Name',
    addProjectTitle: 'Create New Project',
    addProjectDesc: 'Enter the basic details to initialize a new project workspace.',
    projectDashboard: 'Project Dashboard',
    projectFleet: 'Project Fleet',
    projectSettings: 'Project Settings'
  },
  AGRICULTURE: {
    project: 'Facility',
    projects: 'Farms & Facilities',
    projectListTitle: 'Farms & Facilities',
    projectListDescription: 'Manage your permanent sites, farms, processing plants, and operational facilities.',
    newProject: 'Add Facility',
    projectName: 'Facility Name',
    addProjectTitle: 'Add New Facility',
    addProjectDesc: 'Register a new farm, warehouse, or operational site to your organization.',
    projectDashboard: 'Facility Overview',
    projectFleet: 'Facility Fleet',
    projectSettings: 'Facility Settings'
  },
  // Default fallbacks for unconfigured industries
  ENERGY: null,
  HVAC: null,
} as const;

export function useVocabulary() {
  const [industry, setIndustry] = useState<IndustryType>('CONSTRUCTION');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        const currentIndustry = document.documentElement.getAttribute('data-industry') as IndustryType;
        if (currentIndustry && currentIndustry !== industry) {
          setIndustry(currentIndustry);
        }
      });

      // Initial read
      const initialIndustry = document.documentElement.getAttribute('data-industry') as IndustryType;
      if (initialIndustry && initialIndustry !== industry) {
        setIndustry(initialIndustry);
      }

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-industry'],
      });

      return () => observer.disconnect();
    }
  }, [industry]);

  const dict = VOCABULARY[industry] || VOCABULARY.CONSTRUCTION;
  return dict;
}
