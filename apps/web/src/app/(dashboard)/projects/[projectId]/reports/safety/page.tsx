'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HardHat, Plus, AlertTriangle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import type { SafetyIncident } from '@pulse/types';
import { SlideOver } from '@/components/ui/SlideOver';
import { IncidentForm } from './_components/IncidentForm';
import { CreateSafetyIncidentInput } from '@pulse/validators';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function SafetyIncidentsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: incidentResponse = { data: [] }, isLoading } = useQuery({
    queryKey: ['safety-incidents', params.projectId],
    queryFn: () => api.get<{ data: SafetyIncident[] }>(`/construction/safety?projectId=${params.projectId}`),
  });

  const incidents = Array.isArray(incidentResponse) ? incidentResponse : (incidentResponse.data || []);

  const createMutation = useMutation({
    mutationFn: (newIncident: CreateSafetyIncidentInput) => api.post('/construction/safety', { ...newIncident, projectId: params.projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents', params.projectId] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/construction/safety/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents', params.projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/construction/safety/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents', params.projectId] });
    },
  });

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Field Operations
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-900 dark:text-brand-100">
            Safety Incidents
          </h1>
          <p className="text-sm text-brand-500">Track and manage OSHA recordable incidents.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="gap-2 bg-red-600 hover:bg-red-700 text-white border-none">
          <Plus className="w-4 h-4" />
          Report Incident
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-brand-100 dark:bg-brand-900 rounded-xl" />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-brand-900 dark:text-brand-100 mb-1">
              Zero Incidents
            </h3>
            <p className="text-sm text-brand-500 max-w-sm mb-6">
              Your site is currently reporting zero active safety incidents. Great job keeping the team safe!
            </p>
            <Button onClick={() => setIsDrawerOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Report New Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident) => (
            <Card key={incident._id} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                      incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold">{incident.incidentType}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <select 
                      value={incident.status} 
                      onChange={(e) => updateMutation.mutate({ id: incident._id, status: e.target.value })}
                      className="text-xs font-medium px-2 py-1 rounded-md border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-brand-300 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="OPEN">Open</option>
                      <option value="UNDER_INVESTIGATION">Investigating</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(incident._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-7">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">
                  {incident.description}
                </CardDescription>
                <div className="flex items-center justify-between text-xs text-brand-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.dateOccurred).toLocaleDateString()}
                  </span>
                  {incident.oshaRecordable && (
                    <span className="text-red-600 dark:text-red-400 font-semibold border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded">
                      OSHA
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Report Safety Incident"
        description="Log a new safety incident or near miss."
      >
        <IncidentForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          projectId={params.projectId}
        />
      </SlideOver>
    </div>
  );
}
