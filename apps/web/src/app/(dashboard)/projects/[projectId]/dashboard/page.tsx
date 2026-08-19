'use client';

import { useProject } from '@/core/providers/project-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LayoutDashboard, Clock, ClipboardList, HardHat, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, CloudSun, MapPin, Search } from 'lucide-react';
import { PulseLoader } from '@/components/ui/PulseLoader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useVocabulary } from '@/core/lib/vocabulary';
import { AgricultureDashboard } from './AgricultureDashboard';

export default function ProjectDashboardPage() {
  const { project, isLoading: isProjectLoading } = useProject();
  const params = useParams<{ projectId: string }>();
  const pId = params?.projectId;
  const vocabulary = useVocabulary();

  const { data: tasksData } = useQuery({ queryKey: ['tasks', pId], queryFn: () => api.get<any>(`/trunk/tasks?projectId=${pId}&limit=100`), enabled: !!pId });
  const { data: reportsData } = useQuery({ queryKey: ['reports', pId], queryFn: () => api.get<any>(`/trunk/daily-reports?projectId=${pId}&limit=100`), enabled: !!pId });
  const { data: coData } = useQuery({ queryKey: ['change-orders', pId], queryFn: () => api.get<any>(`/construction/change-orders?projectId=${pId}`), enabled: !!pId });
  const { data: poData } = useQuery({ queryKey: ['purchase-orders', pId], queryFn: () => api.get<any>(`/construction/purchase-orders?projectId=${pId}`), enabled: !!pId });
  const { data: safetyData } = useQuery({ queryKey: ['safety', pId], queryFn: () => api.get<any>(`/construction/safety?projectId=${pId}`), enabled: !!pId });

  if (isProjectLoading) return <PulseLoader size="lg" text="Loading project..." />;

  if (project?.industry === 'AGRICULTURE') {
    return <AgricultureDashboard project={project} pId={pId as string} />;
  }

  const tasks = tasksData || [];
  const reports = reportsData || [];
  const changeOrders = Array.isArray(coData) ? coData : (coData?.data || []);
  const purchaseOrders = Array.isArray(poData) ? poData : (poData?.data || []);
  const safetyIncidents = Array.isArray(safetyData) ? safetyData : (safetyData?.data || []);

  const openTasks = tasks.filter((t: any) => ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(t.status));
  const overdueTasks = openTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date());
  const dueSoonTasks = openTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) >= new Date() && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const budget = project?.budget ? project.budget / 100 : 25000000;
  const baseCommitted = project?.committedCost ? project.committedCost / 100 : 18500000;
  
  const committedCOs = changeOrders.filter((co: any) => co.status === 'APPROVED').reduce((sum: number, co: any) => sum + (co.costImpactCents / 100), 0);
  const committedPOs = purchaseOrders.filter((po: any) => ['ISSUED', 'PARTIALLY_RECEIVED', 'CLOSED'].includes(po.status)).reduce((sum: number, po: any) => sum + (po.totalAmountCents / 100), 0);
  
  const totalCommitted = baseCommitted + committedCOs + committedPOs;
  const budgetRemaining = budget - totalCommitted;

  const latestReport = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const openIncidentsCount = safetyIncidents.filter((inc: any) => inc.status === 'OPEN').length;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title={project?.name || vocabulary.projectDashboard}
        description={`Dashboard and high-level metrics for ${project?.name || `this ${vocabulary.project.toLowerCase()}`}.`}
        icon={<LayoutDashboard className="w-6 h-6 text-brand-500" />}
      />

      <StatsGrid
        stats={[
          { label: 'Schedule', value: overdueTasks.length > 0 ? `${overdueTasks.length} Overdue` : 'On Track', trend: overdueTasks.length > 0 ? 'Critical' : 'Good', trendDirection: overdueTasks.length > 0 ? 'down' : 'up' },
          { label: 'Budget Remaining', value: formatCurrency(budgetRemaining), trend: budgetRemaining < 0 ? 'Over Budget' : 'On Budget', trendDirection: budgetRemaining < 0 ? 'down' : 'up' },
          { label: 'Today\'s Weather', value: latestReport?.weather?.conditions || 'Unknown', trend: latestReport?.weather?.temperature ? `${latestReport.weather.temperature}°` : '--', trendDirection: 'neutral' },
          { label: 'Open Safety Issues', value: openIncidentsCount.toString(), trend: openIncidentsCount > 0 ? 'Action Req' : 'Clear', trendDirection: openIncidentsCount > 0 ? 'down' : 'up' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" />
                Upcoming & Overdue Tasks
              </CardTitle>
              <Link href={`/projects/${pId}/tasks`} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...overdueTasks, ...dueSoonTasks].slice(0, 5).map((task: any) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task._id} className="flex items-center justify-between p-3 rounded-xl border border-brand-100 dark:border-brand-800 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                        <div>
                          <p className="font-medium text-sm text-brand-900 dark:text-brand-100">{task.title}</p>
                          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-rose-500 font-semibold' : 'text-brand-500 dark:text-brand-400'}`}>
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={task.priority} />
                    </div>
                  );
                })}
                {[...overdueTasks, ...dueSoonTasks].length === 0 && (
                  <div className="text-center py-6 text-brand-500 dark:text-brand-400 text-sm">
                    No upcoming deadlines in the next 7 days.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Field Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-brand-500" />
                Recent Field Logs
              </CardTitle>
              <Link href={`/projects/${pId}/reports`} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map((report: any) => (
                  <div key={report._id} className="p-4 rounded-xl border border-brand-100 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-900/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-brand-900 dark:text-brand-100">{new Date(report.date).toLocaleDateString()}</h4>
                      {report.weather && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-300 bg-brand-100 dark:bg-brand-800 px-2 py-1 rounded-full">
                          <CloudSun className="w-3.5 h-3.5" />
                          {report.weather.temperature}° • {report.weather.conditions}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-brand-600 dark:text-brand-300 line-clamp-2">
                      {report.notes || 'No notes provided for this log.'}
                    </p>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-6 text-brand-500 dark:text-brand-400 text-sm">
                    No daily reports have been submitted yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/projects/${pId}/tasks`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-white dark:hover:bg-brand-800 hover:border-brand-200 hover:shadow-sm transition-all group">
              <ClipboardList className="w-4 h-4 text-brand-500 group-hover:text-accent-500" />
              Manage Tasks
              <ChevronRight className="w-4 h-4 ml-auto text-brand-400 group-hover:text-accent-500" />
            </Link>
            
            <Link href={`/projects/${pId}/reports`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-white dark:hover:bg-brand-800 hover:border-brand-200 hover:shadow-sm transition-all group">
              <HardHat className="w-4 h-4 text-brand-500 group-hover:text-accent-500" />
              Submit Daily Report
              <ChevronRight className="w-4 h-4 ml-auto text-brand-400 group-hover:text-accent-500" />
            </Link>
            
            <Link href={`/projects/${pId}/reports/safety`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:border-rose-200 hover:shadow-sm transition-all group">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Log Safety Incident
              <ChevronRight className="w-4 h-4 ml-auto text-rose-400 group-hover:text-rose-500" />
            </Link>

            <Link href={`/projects/${pId}/procurement/purchase-orders`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-white dark:hover:bg-brand-800 hover:border-brand-200 hover:shadow-sm transition-all group">
              <Search className="w-4 h-4 text-brand-500 group-hover:text-accent-500" />
              View Purchase Orders
              <ChevronRight className="w-4 h-4 ml-auto text-brand-400 group-hover:text-accent-500" />
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
