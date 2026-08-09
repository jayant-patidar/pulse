'use client';

import { useState } from 'react';
import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { HardHat, ShieldAlert, FileWarning, CheckCircle2, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { SlideOver } from '@/components/ui/SlideOver';
import { CoiForm } from './_components/CoiForm';
import { SafetyIncidentForm } from './_components/SafetyIncidentForm';
import { CreateCoiInput, CreateSafetyIncidentInput } from '@pulse/validators';
import { toast } from 'sonner';

export default function CompliancePage() {
  const { project, isLoading } = useProject();
  const queryClient = useQueryClient();
  const [drawerMode, setDrawerMode] = useState<'NONE' | 'COI' | 'INCIDENT'>('NONE');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const params = useParams<{ projectId: string }>();

  const { data: coiData } = useQuery({
    queryKey: ['cois', params.projectId],
    queryFn: () => api.get<any>(`/construction/coi?projectId=${params.projectId}`),
    enabled: !!params.projectId,
  });

  const { data: safetyData } = useQuery({
    queryKey: ['safety', params.projectId],
    queryFn: () => api.get<any>(`/construction/safety?projectId=${params.projectId}`),
    enabled: !!params.projectId,
  });

  const rawCOIs = Array.isArray(coiData) ? coiData : (coiData?.data || []);
  const rawIncidents = Array.isArray(safetyData) ? safetyData : (safetyData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: CreateCoiInput) => api.post('/construction/coi', { ...data, projectId: params.projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cois', params.projectId] });
      setDrawerMode('NONE');
      toast.success('COI requested successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to request COI');
    }
  });

  const incidentMutation = useMutation({
    mutationFn: (data: CreateSafetyIncidentInput) => {
      // Ensure dateOccurred is valid ISO-8601 for the backend validator
      const payload = { ...data, projectId: params.projectId };
      if (!payload.dateOccurred.endsWith('Z')) {
        payload.dateOccurred = new Date(payload.dateOccurred).toISOString();
      }
      return api.post('/construction/safety', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety', params.projectId] });
      setDrawerMode('NONE');
      toast.success('Safety incident logged successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to log safety incident');
    }
  });

  const cois = rawCOIs.map((c: any) => ({
    id: c._id,
    vendor: c.subcontractorName,
    type: c.policyType?.replace('_', ' ') || 'Unknown',
    status: c.status,
    expiration: new Date(c.expiryDate || Date.now()).toISOString().split('T')[0],
  }));

  const incidents = rawIncidents.map((inc: any) => ({
    id: inc._id.substring(inc._id.length - 6).toUpperCase(),
    type: inc.incidentType,
    date: new Date(inc.dateOccurred || Date.now()).toISOString().split('T')[0],
    desc: inc.description,
    status: inc.status,
  }));

  const openIncidentsCount = incidents.filter((inc: any) => inc.status === 'OPEN').length;
  const expiredCOIsCount = cois.filter((c: any) => c.status === 'EXPIRED').length;

  const healthScore = Math.max(0, 100 - (openIncidentsCount * 10) - (expiredCOIsCount * 5));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold">Valid</span>;
      case 'EXPIRING_SOON': return <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-semibold">Expiring Soon</span>;
      case 'EXPIRED': return <span className="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-xs font-semibold">Expired</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'NEAR_MISS': return <Activity className="w-5 h-5 text-amber-500" />;
      case 'INJURY': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'PROPERTY_DAMAGE': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <FileWarning className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Compliance & Safety"
        description="Monitor vendor compliance, certificates, and safety incidents."
        icon={<ShieldAlert className="w-6 h-6 text-brand-500" />}
        actions={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDrawerMode('INCIDENT')}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Log Incident
            </button>
            <button 
              onClick={() => setDrawerMode('COI')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <FileWarning className="w-4 h-4" />
              Request COI
            </button>
          </div>
        }
      />

      <SlideOver 
        isOpen={drawerMode === 'COI'} 
        onClose={() => setDrawerMode('NONE')} 
        title="Request Certificate of Insurance"
      >
        <CoiForm 
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>

      <SlideOver 
        isOpen={drawerMode === 'INCIDENT'} 
        onClose={() => setDrawerMode('NONE')} 
        title="Log Safety Incident"
      >
        <SafetyIncidentForm 
          projectId={params.projectId} 
          onSubmit={(data) => incidentMutation.mutate(data)}
          isLoading={incidentMutation.isPending}
        />
      </SlideOver>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-brand-500 dark:text-brand-400">Health Score</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{healthScore}</h3>
            <span className="text-sm font-medium text-brand-400 mb-1">/ 100</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Open Incidents</p>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-500">{openIncidentsCount}</h3>
        </div>

        <div className="glass p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Missing/Expired COIs</p>
            <FileWarning className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-500">{expiredCOIsCount}</h3>
        </div>
        
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-brand-500 dark:text-brand-400">Days Incident Free</p>
            <Activity className="w-5 h-5 text-brand-400" />
          </div>
          <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">10 <span className="text-sm font-normal text-brand-500">days</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COI Tracking Table */}
        <div className="glass rounded-2xl border border-brand-200 dark:border-brand-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-brand-200 dark:border-brand-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100">Certificates of Insurance</h3>
            <button onClick={() => setDrawerMode('COI')} className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">Request COI</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-500 bg-brand-50/50 dark:bg-brand-900/20 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Policy Type</th>
                  <th className="px-6 py-4">Expiration</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 dark:divide-brand-800/50">
                {cois.map((coi: any) => (
                  <tr key={coi.id} className="hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-900 dark:text-brand-100">{coi.vendor}</td>
                    <td className="px-6 py-4 text-brand-700 dark:text-brand-300">{coi.type}</td>
                    <td className="px-6 py-4 font-medium">{coi.expiration}</td>
                    <td className="px-6 py-4">{getStatusBadge(coi.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Incidents Log */}
        <div className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100">Recent Incidents</h3>
            <Link href="/construction/safety" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">View Log</Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {incidents.map((inc: any) => (
              <div key={inc.id} className="flex gap-4 p-4 rounded-xl border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center shrink-0">
                  {getIncidentIcon(inc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-brand-900 dark:text-brand-100 truncate">{inc.id} - {inc.type.replace('_', ' ')}</h4>
                    <span className="text-xs font-medium text-brand-500 whitespace-nowrap">{inc.date}</span>
                  </div>
                  <p className="text-sm text-brand-600 dark:text-brand-400 line-clamp-2 mb-2">{inc.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      inc.status === 'OPEN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' :
                      inc.status === 'REVIEWED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-300 group-hover:text-brand-500 self-center shrink-0 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
