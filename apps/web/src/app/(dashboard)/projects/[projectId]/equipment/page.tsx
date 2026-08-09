'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tractor, Wrench, AlertCircle, Fuel, Clock, MapPin, Gauge, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { SlideOver } from '@/components/ui/SlideOver';
import { AssignAssetForm } from './_components/AssignAssetForm';
import { CreateEquipmentInput } from '@pulse/validators';
import { toast } from 'sonner';
import { useState } from 'react';

export default function EquipmentPage() {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const params = useParams<{ projectId: string }>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: eqData } = useQuery({
    queryKey: ['equipment', params.projectId],
    queryFn: () => api.get<any>(`/trunk/equipment?projectId=${params.projectId}`),
    enabled: !!params.projectId,
  });

  const assignMutation = useMutation({
    mutationFn: (equipmentId: string) => api.post(`/trunk/equipment/${equipmentId}/assign`, { projectId: params.projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', params.projectId] });
      queryClient.invalidateQueries({ queryKey: ['equipment', 'available'] });
      setIsDrawerOpen(false);
      toast.success('Asset assigned successfully!');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to assign asset'),
  });

  const createAndAssignMutation = useMutation({
    mutationFn: async (data: CreateEquipmentInput) => {
      // 1. Create global equipment
      const newEq = await api.post<any>('/trunk/equipment', data);
      // 2. Assign to project
      await api.post(`/trunk/equipment/${newEq._id}/assign`, { projectId: params.projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', params.projectId] });
      setIsDrawerOpen(false);
      toast.success('Asset created and assigned successfully!');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create asset'),
  });

  const rawEquipment = Array.isArray(eqData) ? eqData : (eqData?.data || []);

  const equipment = rawEquipment.map((eq: any) => ({
    id: eq.assetTag || eq._id.substring(eq._id.length - 6).toUpperCase(),
    name: eq.name,
    status: eq.status === 'IN_USE' ? 'ACTIVE' : eq.status === 'AVAILABLE' ? 'IDLE' : 'MAINTENANCE',
    operator: eq.extensions?.operatorName || '--',
    fuel: eq.extensions?.fuelLevel || 0,
    hours: eq.extensions?.engineHours || 0,
    location: eq.extensions?.currentLocation || 'Site Zone',
    lastMaintenanceDate: eq.lastMaintenanceDate,
  }));

  const activeEquipmentCount = equipment.filter((eq: any) => eq.status === 'ACTIVE').length;
  const maintenanceAlertsCount = equipment.filter((eq: any) => eq.status === 'MAINTENANCE').length;
  
  // Calculate average daily usage (mocked calculation based on engine hours for visual purposes)
  const totalHours = equipment.reduce((sum: number, eq: any) => sum + eq.hours, 0);
  const avgDailyUsage = equipment.length > 0 ? (totalHours / equipment.length / 365).toFixed(1) : '0.0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active</span>;
      case 'IDLE': return <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-semibold">Idle</span>;
      case 'MAINTENANCE': return <span className="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-xs font-semibold flex items-center gap-1.5"><Wrench className="w-3 h-3" /> Shop</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Project Fleet"
        description="Telematics, assignments, and maintenance for heavy machinery."
        icon={<Tractor className="w-6 h-6 text-brand-500" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        }
      />

      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Project Fleet Asset"
      >
        <AssignAssetForm 
          projectId={params.projectId} 
          onAssign={(id) => assignMutation.mutate(id)}
          onCreateAndAssign={(data) => createAndAssignMutation.mutate(data)}
          isLoading={assignMutation.isPending || createAndAssignMutation.isPending}
        />
      </SlideOver>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <div className="flex items-center gap-2 mb-2 text-brand-500 dark:text-brand-400">
            <Tractor className="w-5 h-5" />
            <p className="text-sm font-medium">Assigned Assets</p>
          </div>
          <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{equipment.length}</h3>
        </div>

        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <div className="flex items-center gap-2 mb-2 text-brand-500 dark:text-brand-400">
            <Gauge className="w-5 h-5 text-emerald-500" />
            <p className="text-sm font-medium">Active Now</p>
          </div>
          <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{activeEquipmentCount}</h3>
        </div>

        <div className="glass p-5 rounded-2xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
          <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">Maintenance Alerts</p>
          </div>
          <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-500">{maintenanceAlertsCount}</h3>
        </div>
        
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <div className="flex items-center gap-2 mb-2 text-brand-500 dark:text-brand-400">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-medium">Avg Daily Usage</p>
          </div>
          <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{avgDailyUsage} <span className="text-sm text-brand-500 font-normal">hrs</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Telematics Grid */}
        <div className="lg:col-span-2 glass rounded-2xl border border-brand-200 dark:border-brand-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-brand-200 dark:border-brand-800">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100">Live Telematics</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-500 bg-brand-50/50 dark:bg-brand-900/20 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Fuel</th>
                  <th className="px-6 py-4 text-right">Engine Hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 dark:divide-brand-800/50">
                {equipment.map((eq: any) => (
                  <tr key={eq.id} className="hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-900 dark:text-brand-100">{eq.name}</div>
                      <div className="text-xs text-brand-500">{eq.id} • {eq.location}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(eq.status)}</td>
                    <td className="px-6 py-4 text-brand-700 dark:text-brand-300">{eq.operator}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Fuel className={`w-4 h-4 ${eq.fuel < 20 ? 'text-rose-500' : 'text-brand-400'}`} />
                        <span className="font-medium text-brand-700 dark:text-brand-300">{eq.fuel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-brand-900 dark:text-brand-100">{eq.hours.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action / Map Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-6">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-500" />
              Asset Locations
            </h3>
            <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-brand-900/50 flex flex-col items-center justify-center text-brand-400 dark:text-brand-600 border border-brand-200 dark:border-brand-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/auth-bg.png')] opacity-10 bg-cover bg-center" />
              <MapPin className="w-8 h-8 mb-2 z-10" />
              <p className="text-sm font-medium z-10">Live Map Disabled (Mock)</p>
            </div>
          </div>

          <div className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-6">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-500" />
              Service Required
            </h3>
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-rose-900 dark:text-rose-100">Bobcat T76 Loader</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400">EQ-105</p>
                </div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2 py-1 rounded-md">OVERDUE</span>
              </div>
              <p className="text-sm text-rose-700 dark:text-rose-300 mt-2">Routine 500-hour hydraulic service is overdue by 45 hours.</p>
              <button className="mt-4 w-full py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-sm font-semibold rounded-lg transition-colors">
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
