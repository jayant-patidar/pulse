'use client';

import { useState } from 'react';
import { useProject } from '@/core/providers/project-provider';
import { useAuth } from '@/core/providers/auth-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Clock, Plus, CheckCircle, XCircle, Edit2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

export default function TimesheetsPage({ params }: { params: { projectId: string } }) {
  const { project, isLoading: isProjectLoading } = useProject();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] as string);
  const [hours, setHours] = useState('');
  const [costCode, setCostCode] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: timesheetsData, isLoading } = useQuery({
    queryKey: ['timesheets', params.projectId],
    queryFn: () => api.get<any[]>(`/branches/construction/timesheets?projectId=${params.projectId}`),
  });

  const logTimeMutation = useMutation({
    mutationFn: (data: { projectId: string; date: string; hoursWorked: number; costCode?: string }) => 
      api.post('/branches/construction/timesheets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', params.projectId] });
      setHours('');
      setCostCode('');
      toast.success('Time logged successfully!');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to log time'),
  });

  const updateTimeMutation = useMutation({
    mutationFn: (data: { timesheetId: string; date: string; hoursWorked: number; costCode?: string }) => 
      api.patch(`/branches/construction/timesheets/${data.timesheetId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', params.projectId] });
      setEditingId(null);
      setHours('');
      setCostCode('');
      toast.success('Timesheet updated successfully!');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update timesheet'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { timesheetId: string; status: string }) => 
      api.patch(`/branches/construction/timesheets/${data.timesheetId}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', params.projectId] });
      toast.success('Timesheet status updated');
    },
  });

  if (isProjectLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const isManager = user?.role === 'OWNER' || user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPERVISOR';
  const timesheets = Array.isArray(timesheetsData) ? timesheetsData : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Timesheets"
        description="Log and review daily hours and cost codes."
        icon={<Clock className="w-6 h-6 text-brand-500" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Log Time Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-2xl overflow-hidden p-5 shadow-sm relative">
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setHours('');
                  setCostCode('');
                }}
                className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-semibold text-brand-900 dark:text-brand-100 mb-4">
              {editingId ? 'Edit Timesheet' : 'Log Daily Hours'}
            </h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!hours || isNaN(Number(hours))) return;
                
                if (editingId) {
                  updateTimeMutation.mutate({
                    timesheetId: editingId,
                    date,
                    hoursWorked: Number(hours),
                    costCode
                  });
                } else {
                  logTimeMutation.mutate({
                    projectId: params.projectId as string,
                    date,
                    hoursWorked: Number(hours),
                    costCode
                  });
                }
              }}
              className="space-y-4"
            >
              <FormField label="Date">
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </FormField>
              <FormField label="Hours Worked">
                <Input type="number" step="0.5" min="0.5" max="24" value={hours} onChange={e => setHours(e.target.value)} placeholder="8.0" required />
              </FormField>
              <FormField label="Cost Code (Optional)">
                <Input type="text" value={costCode} onChange={e => setCostCode(e.target.value)} placeholder="e.g. 03-3000 Concrete" />
              </FormField>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full" 
                isLoading={logTimeMutation.isPending || updateTimeMutation.isPending} 
                disabled={!hours || logTimeMutation.isPending || updateTimeMutation.isPending}
              >
                {editingId ? 'Save Changes' : 'Submit Timesheet'}
              </Button>
            </form>
          </div>
        </div>

        {/* Timesheets List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-brand-200 dark:border-brand-800">
              <h3 className="font-semibold text-brand-900 dark:text-brand-100">Recent Timesheets</h3>
            </div>
            {timesheets.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                No timesheets recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-200 dark:divide-brand-800 max-h-[600px] overflow-y-auto">
                {timesheets.map((ts) => (
                  <div key={ts._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-brand-900 dark:text-brand-100">
                        {isManager ? `${ts.membershipId?.userId?.firstName} ${ts.membershipId?.userId?.lastName}` : new Date(ts.date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-3 text-sm text-zinc-500 mt-1">
                        {isManager && <span>{new Date(ts.date).toLocaleDateString()}</span>}
                        <span>{ts.hoursWorked} hours</span>
                        {ts.costCode && <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">{ts.costCode}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ts.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        ts.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {ts.status}
                      </span>
                      
                      {ts.membershipId?.userId?._id === (user as any)?.id && ts.status !== 'APPROVED' && (
                        <button 
                          onClick={() => {
                            setEditingId(ts._id as string);
                            setDate(new Date(ts.date).toISOString().split('T')[0] as string);
                            setHours(String(ts.hoursWorked));
                            setCostCode((ts.costCode as string) || '');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors ml-2"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {isManager && ts.status === 'PENDING' && ts.membershipId?.userId?._id !== (user as any)?.id && (
                        <div className="flex gap-1 ml-2 border-l pl-3 border-zinc-200 dark:border-zinc-700">
                          <button 
                            onClick={() => updateStatusMutation.mutate({ timesheetId: ts._id, status: 'APPROVED' })}
                            className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ timesheetId: ts._id, status: 'REJECTED' })}
                            className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
