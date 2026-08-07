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
  // Placeholder: In the future, fetch `schema` from `/api/v1/root/plugins/${industry}/${entityType}/schema`
  // and use a library like react-jsonschema-form or custom mapping to render it.

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
          Dynamic Fields
        </span>
      </div>
      <p className="text-xs text-brand-600 dark:text-brand-400">
        Industry-specific fields injected by the active Extension Plugin.
      </p>
      
      <FormField label="Raw JSON Data (Phase 2 Mock)">
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
