import React from 'react';
import { FormField } from './FormField';
import { Input } from './Input';

interface ExtensionFieldRendererProps {
  industry: string;
  entityType: 'project' | 'task' | 'daily_report' | 'equipment';
  extensions: Record<string, any>;
  onChange: (newExtensions: Record<string, any>) => void;
}

/**
 * ExtensionFieldRenderer
 * 
 * In Phase 3, this component will dynamically fetch the JSON schema for the active
 * industry plugin (e.g. CONSTRUCTION) from the API and render the appropriate form fields.
 * 
 * For Phase 2, it provides a simple key-value/JSON interface to inject arbitrary data
 * into the `extensions` subdocument to prove the Tree Architecture works.
 */
export function ExtensionFieldRenderer({ industry, entityType, extensions, onChange }: ExtensionFieldRendererProps) {
  
  const updateField = (key: string, value: any) => {
    onChange({ ...extensions, [key]: value });
  };

  // Phase 3: Construction specific UI
  if (industry === 'CONSTRUCTION') {
    if (entityType === 'project') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🏗️ Construction Project Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Building Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.buildingType || ''} 
                onChange={(e) => updateField('buildingType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
              </select>
            </FormField>
            <FormField label="Contract Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.contractType || ''} 
                onChange={(e) => updateField('contractType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="LUMP_SUM">Lump Sum</option>
                <option value="GMP">GMP</option>
                <option value="COST_PLUS">Cost Plus</option>
                <option value="UNIT_PRICE">Unit Price</option>
              </select>
            </FormField>
            <FormField label="Total Area (Sq Ft)">
              <Input 
                type="number" 
                value={extensions?.totalAreaSqFt || ''} 
                onChange={(e) => updateField('totalAreaSqFt', Number(e.target.value))} 
                placeholder="e.g. 15000"
              />
            </FormField>
          </div>
        </div>
      );
    }
    
    // Add additional entityType renders for 'task', 'daily_report', etc. here...
    if (entityType === 'task') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🏗️ Construction Task Extensions
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Task Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.taskType || ''} 
                onChange={(e) => updateField('taskType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="RFI">RFI</option>
                <option value="SUBMITTAL">Submittal</option>
                <option value="PUNCH_LIST">Punch List</option>
                <option value="INSPECTION">Inspection</option>
              </select>
            </FormField>
            <FormField label="Trade Responsible">
              <Input 
                value={extensions?.tradeResponsible || ''} 
                onChange={(e) => updateField('tradeResponsible', e.target.value)} 
                placeholder="e.g. Electrical"
              />
            </FormField>
          </div>
        </div>
      );
    }
  }

  // Fallback to JSON editor for unknown industries
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      onChange(parsed);
    } catch (err) {
      // Ignore invalid JSON while typing
    }
  };

  return (
    <div className="space-y-4 p-4 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/50">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100">
          {industry} Extensions
        </h4>
        <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-1 rounded-full">
          Raw JSON Fallback
        </span>
      </div>
      <FormField label="JSON Data">
        <textarea
          className="w-full h-32 p-3 text-sm font-mono bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
          defaultValue={JSON.stringify(extensions || {}, null, 2)}
          onChange={handleJsonChange}
          placeholder="{}"
        />
      </FormField>
    </div>
  );
}
