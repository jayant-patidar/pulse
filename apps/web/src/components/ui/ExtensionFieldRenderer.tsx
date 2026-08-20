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

  // Phase 3: Agriculture specific UI
  if (industry === 'AGRICULTURE') {
    if (entityType === 'project') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🌱 Agriculture Facility Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Facility Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.facilityType || ''} 
                onChange={(e) => updateField('facilityType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="FARM">Farm</option>
                <option value="PROCESSING_PLANT">Processing Plant</option>
                <option value="STORAGE">Storage / Silo</option>
                <option value="GREENHOUSE">Greenhouse</option>
              </select>
            </FormField>
            <FormField label="Total Acres">
              <Input 
                type="number" 
                value={extensions?.totalAcres || ''} 
                onChange={(e) => updateField('totalAcres', Number(e.target.value))} 
                placeholder="e.g. 1500"
              />
            </FormField>
            <FormField label="Primary Crop Focus">
              <Input 
                value={extensions?.primaryCropFocus || ''} 
                onChange={(e) => updateField('primaryCropFocus', e.target.value)} 
                placeholder="e.g. Corn, Soybeans"
              />
            </FormField>
          </div>
        </div>
      );
    }
    
    if (entityType === 'task') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🌱 Agriculture Task Extensions
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Task Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.taskType || ''} 
                onChange={(e) => updateField('taskType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="PLANTING">Planting</option>
                <option value="SPRAYING">Spraying</option>
                <option value="HARVESTING">Harvesting</option>
                <option value="SCOUTING">Scouting</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </FormField>
            <FormField label="Crop Cycle ID (Optional)">
              <Input 
                value={extensions?.cropCycleId || ''} 
                onChange={(e) => updateField('cropCycleId', e.target.value)} 
                placeholder="e.g. CC-2026-WHEAT"
              />
            </FormField>
            <FormField label="Field Name">
              <Input 
                value={extensions?.fieldName || ''} 
                onChange={(e) => updateField('fieldName', e.target.value)} 
                placeholder="e.g. North-East 40"
              />
            </FormField>
          </div>
        </div>
      );
    }

    if (entityType === 'daily_report') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🌱 Field Conditions (Agriculture)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Soil Moisture">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.soilMoisture || ''} 
                onChange={(e) => updateField('soilMoisture', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="DRY">Dry</option>
                <option value="OPTIMAL">Optimal</option>
                <option value="SATURATED">Saturated</option>
              </select>
            </FormField>
            <FormField label="Pest Pressure">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.pestPressure || ''} 
                onChange={(e) => updateField('pestPressure', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
              </select>
            </FormField>
          </div>
        </div>
      );
    }
  }

  // Phase 3: Inspection Services specific UI
  if (industry === 'INSPECTION_SERVICES') {
    if (entityType === 'project') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🔍 Property / Site Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Property Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.propertyType || ''} 
                onChange={(e) => updateField('propertyType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="GOVERNMENT">Government</option>
                <option value="MIXED_USE">Mixed Use</option>
              </select>
            </FormField>
            <FormField label="Year Built">
              <Input 
                type="number" 
                value={extensions?.yearBuilt || ''} 
                onChange={(e) => updateField('yearBuilt', Number(e.target.value))} 
                placeholder="e.g. 1995"
              />
            </FormField>
            <FormField label="Square Footage">
              <Input 
                type="number" 
                value={extensions?.licensedSquareFootage || ''} 
                onChange={(e) => updateField('licensedSquareFootage', Number(e.target.value))} 
                placeholder="e.g. 50000"
              />
            </FormField>
          </div>
        </div>
      );
    }
    
    if (entityType === 'task') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🔍 Work Order Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assignment Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.assignmentType || ''} 
                onChange={(e) => updateField('assignmentType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="ROUTINE">Routine Inspection</option>
                <option value="FOLLOW_UP">Follow-up / Re-inspection</option>
                <option value="COMPLAINT">Complaint Driven</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="PERMIT_REVIEW">Permit Review</option>
              </select>
            </FormField>
            <FormField label="Inspector Cert Level">
              <Input 
                value={extensions?.inspectorCertLevel || ''} 
                onChange={(e) => updateField('inspectorCertLevel', e.target.value)} 
                placeholder="e.g. Level III"
              />
            </FormField>
          </div>
        </div>
      );
    }

    if (entityType === 'daily_report') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🔍 Inspector Field Log
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Inspections Completed">
              <Input 
                type="number"
                value={extensions?.inspectionCount || ''} 
                onChange={(e) => updateField('inspectionCount', Number(e.target.value))}
                placeholder="e.g. 5"
              />
            </FormField>
            <FormField label="Access Issues?">
              <Input 
                value={extensions?.accessIssues || ''} 
                onChange={(e) => updateField('accessIssues', e.target.value)} 
                placeholder="e.g. Roof access blocked"
              />
            </FormField>
          </div>
        </div>
      );
    }

    if (entityType === 'equipment') {
      return (
        <div className="space-y-4 p-4 border border-brand-200 dark:border-brand-800 rounded-xl bg-brand-50/30 dark:bg-brand-900/10">
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
            🔍 Inspection Kit Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Instrument Type">
              <select 
                className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={extensions?.instrumentType || ''} 
                onChange={(e) => updateField('instrumentType', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="THERMAL_CAMERA">Thermal Camera</option>
                <option value="MOISTURE_METER">Moisture Meter</option>
                <option value="GAS_DETECTOR">Gas Detector</option>
                <option value="LOAD_TESTER">Load Tester</option>
                <option value="MANOMETER">Manometer</option>
                <option value="MULTIMETER">Multimeter</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>
            <FormField label="Accuracy Rating">
              <Input 
                value={extensions?.accuracyRating || ''} 
                onChange={(e) => updateField('accuracyRating', e.target.value)} 
                placeholder="e.g. ±1% Full Scale"
              />
            </FormField>
            <FormField label="Calibration Date">
              <Input 
                type="date"
                value={extensions?.calibrationDate || ''} 
                onChange={(e) => updateField('calibrationDate', e.target.value)} 
              />
            </FormField>
            <FormField label="Calibration Due Date">
              <Input 
                type="date"
                value={extensions?.calibrationDueDate || ''} 
                onChange={(e) => updateField('calibrationDueDate', e.target.value)} 
              />
            </FormField>
            <FormField label="Certification / Serial #" className="col-span-2">
              <Input 
                value={extensions?.certificationNumber || ''} 
                onChange={(e) => updateField('certificationNumber', e.target.value)} 
                placeholder="e.g. CERT-2026-999"
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
