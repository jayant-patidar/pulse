'use client';

import { Button } from '@/components/ui/Button';
import { api } from '@/core/lib/api-client';
import { CreateEquipmentInput } from '@pulse/validators';
import { useQuery } from '@tanstack/react-query';
import { Link as LinkIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { EquipmentForm } from '../../../../equipment/_components/EquipmentForm';

interface AssignAssetFormProps {
  projectId: string;
  onAssign: (equipmentId: string) => void;
  onCreateAndAssign: (data: CreateEquipmentInput) => void;
  isLoading?: boolean;
}

export function AssignAssetForm({ projectId, onAssign, onCreateAndAssign, isLoading }: AssignAssetFormProps) {
  const [mode, setMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [selectedEqId, setSelectedEqId] = useState<string>('');

  const { data: availableEq, isLoading: isLoadingEq } = useQuery({
    queryKey: ['equipment', 'available'],
    queryFn: () => api.get<any>('/trunk/equipment?status=AVAILABLE'),
  });

  const equipmentList = Array.isArray(availableEq) ? availableEq : (availableEq?.data || []);

  if (mode === 'CREATE') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-brand-100 dark:border-brand-800 pb-4">
          <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100">Create New Asset</h3>
          <Button variant="outline" size="sm" onClick={() => setMode('SELECT')}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Assign Existing
          </Button>
        </div>
        <EquipmentForm 
          onSubmit={(data) => onCreateAndAssign(data)} 
          isLoading={isLoading} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-brand-100 dark:border-brand-800 pb-4">
        <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100">Assign Existing Asset</h3>
        <Button variant="outline" size="sm" onClick={() => setMode('CREATE')}>
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
            Select from Global Fleet
          </label>
          <select 
            className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={selectedEqId}
            onChange={(e) => setSelectedEqId(e.target.value)}
          >
            <option value="" disabled>Select an available asset...</option>
            {isLoadingEq ? (
              <option disabled>Loading...</option>
            ) : equipmentList.length === 0 ? (
              <option disabled>No available equipment found.</option>
            ) : (
              equipmentList.map((eq: any) => (
                <option key={eq._id} value={eq._id}>
                  {eq.name} {eq.assetTag ? `(${eq.assetTag})` : ''}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
          <Button 
            type="button" 
            variant="primary" 
            disabled={!selectedEqId || isLoading}
            isLoading={isLoading}
            onClick={() => onAssign(selectedEqId)}
          >
            Assign to Project
          </Button>
        </div>
      </div>
    </div>
  );
}
