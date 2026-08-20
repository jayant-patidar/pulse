'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SlideOver } from '@/components/ui/SlideOver';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/core/lib/api-client';
import { CreateScoutingReportInput, UpdateScoutingReportInput } from '@pulse/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ScoutingForm } from './_components/ScoutingForm';

export default function ScoutingPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId || '';
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: scoutingData, isLoading } = useQuery({
    queryKey: ['scouting', projectId],
    queryFn: () => api.get<any>(`/branches/agriculture/scouting?projectId=${projectId}`),
    enabled: !!projectId,
  });

  const reports = Array.isArray(scoutingData) ? scoutingData : (scoutingData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: CreateScoutingReportInput) => api.post('/branches/agriculture/scouting', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scouting', projectId] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateScoutingReportInput }) => api.patch(`/branches/agriculture/scouting/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scouting', projectId] });
      setIsDrawerOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/branches/agriculture/scouting/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scouting', projectId] });
    },
  });

  // Filter for active alerts (HIGH or CRITICAL)
  const alerts = reports.filter((r: any) => 
    (r.severity === 'HIGH' || r.severity === 'CRITICAL') && r.status === 'OPEN'
  ).slice(0, 5); // top 5 recent alerts

  const columns = [
    {
      header: 'Date',
      accessorKey: 'scoutDate',
      cell: (item: any) => <span className="font-medium">{new Date(item.scoutDate).toLocaleDateString()}</span>
    },
    {
      header: 'Type',
      accessorKey: 'observationType',
      cell: (item: any) => <span className="capitalize">{item.observationType?.replace(/_/g, ' ').toLowerCase()}</span>
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: (item: any) => (
        <StatusBadge 
          status={item.severity} 
        />
      ),
    },
    {
      header: 'Location',
      accessorKey: 'fieldZone',
      cell: (item: any) => <span>{item.fieldZone || '--'}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : item.status === 'TREATED' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>
          {item.status}
        </span>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (item: any) => <span className="text-sm truncate max-w-xs inline-block">{item.description}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditingItem(item);
              setIsDrawerOpen(true);
            }}
            className="p-1 hover:bg-brand-100 dark:hover:bg-brand-800 rounded transition-colors text-brand-600 dark:text-brand-400"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteMutation.mutate(item._id)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-colors text-rose-600 dark:text-rose-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Field Scouting"
        description="Log and monitor pests, diseases, and other field observations."
        actions={
          <Button variant="primary" onClick={() => {
            setEditingItem(null);
            setIsDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Scouting Report
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Field Map Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-video bg-brand-50 dark:bg-brand-900/30 rounded-xl border border-brand-200 dark:border-brand-800 relative overflow-hidden flex items-center justify-center p-4">
                {/* SVG Field Grid Mockup */}
                <svg className="w-full h-full text-brand-200 dark:text-brand-800" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="10" width="120" height="80" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                  <rect x="140" y="10" width="120" height="80" rx="4" stroke="currentColor" strokeWidth="2" className={alerts.length > 0 ? "text-amber-500" : ""} fill="currentColor" fillOpacity="0.2" />
                  <rect x="270" y="10" width="120" height="80" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                  
                  <rect x="10" y="100" width="180" height="90" rx="4" stroke="currentColor" strokeWidth="2" className={alerts.some((a: any) => a.severity === 'CRITICAL') ? "text-rose-500" : ""} fill="currentColor" fillOpacity="0.2" />
                  <rect x="200" y="100" width="190" height="90" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />

                  {/* Hotspot Markers (mocked dynamically) */}
                  {alerts.length > 0 && <circle cx="200" cy="50" r="6" fill="#f59e0b" className="animate-pulse" />}
                  {alerts.some((a: any) => a.severity === 'CRITICAL') && <circle cx="100" cy="145" r="6" fill="#f43f5e" className="animate-pulse" />}
                </svg>
                <div className="absolute bottom-4 left-4 flex gap-3 text-xs font-medium text-brand-500 bg-white/80 dark:bg-brand-950/80 backdrop-blur px-3 py-2 rounded-lg border border-brand-200 dark:border-brand-800">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-300" /> Normal</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Critical</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center p-6 bg-brand-50 dark:bg-brand-900/50 rounded-xl border border-dashed border-brand-200 dark:border-brand-800">
                  <p className="text-sm text-brand-500">No active high or critical alerts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <div key={alert._id} className="p-4 rounded-xl border border-brand-100 dark:border-brand-800 bg-white dark:bg-brand-900/50 shadow-sm">
                      <div className="flex items-start gap-3">
                        {alert.severity === 'CRITICAL' ? (
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-brand-900 dark:text-brand-100 capitalize">{alert.observationType?.replace(/_/g, ' ').toLowerCase()}</h4>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-brand-600 dark:text-brand-300 mb-2 truncate max-w-[14rem]">{alert.description}</p>
                          <div className="flex items-center gap-1 text-xs text-brand-500 font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            {alert.fieldZone || 'Unknown Field'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scouting Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={reports}
            columns={columns}
            keyExtractor={(item: any) => item._id}
            isLoading={isLoading}
            emptyMessage="No scouting reports found. Add your first report."
          />
        </CardContent>
      </Card>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Scouting Report" : "New Scouting Report"}
        description="Log a field observation, pest issue, or disease outbreak."
      >
        <ScoutingForm
          projectId={projectId}
          initialData={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              updateMutation.mutate({ id: editingItem._id, payload: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
