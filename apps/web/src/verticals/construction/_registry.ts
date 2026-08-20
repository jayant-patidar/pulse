// ============================================================
// Construction Branch Registry (Frontend)
// ============================================================
// This file registers construction-specific extension fields
// that get injected into Trunk forms (e.g., Daily Reports, Projects).
// It acts as the frontend equivalent to the API plugins.

import { FormFieldDefinition } from '@/core/types/forms';

export const constructionProjectFields: FormFieldDefinition[] = [
  {
    name: 'extensions.buildingType',
    label: 'Building Type',
    type: 'select',
    options: [
      { label: 'Commercial', value: 'COMMERCIAL' },
      { label: 'Residential', value: 'RESIDENTIAL' },
      { label: 'Industrial', value: 'INDUSTRIAL' },
      { label: 'Infrastructure', value: 'INFRASTRUCTURE' },
    ],
    required: false,
  },
  {
    name: 'extensions.permitNumber',
    label: 'Permit Number',
    type: 'text',
    required: false,
  }
];

export const constructionReportFields: FormFieldDefinition[] = [
  {
    name: 'extensions.concretePouredVolumeYd3',
    label: 'Concrete Poured (Cubic Yards)',
    type: 'number',
    required: false,
  },
  {
    name: 'extensions.craneHours',
    label: 'Crane Operating Hours',
    type: 'number',
    required: false,
  }
];
