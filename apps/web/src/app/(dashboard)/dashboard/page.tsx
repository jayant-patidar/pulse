'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, Plus, ClipboardList, UploadCloud, Tractor, HardHat, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: projectsData } = useQuery({ queryKey: ['projects', 1], queryFn: () => api.get<any>(`/trunk/projects?page=1&limit=100`) });
  const { data: tasksData } = useQuery({ queryKey: ['tasks', 1], queryFn: () => api.get<any>(`/trunk/tasks?page=1&limit=100`) });
  const { data: reportsData } = useQuery({ queryKey: ['daily-reports', 1], queryFn: () => api.get<any>(`/trunk/daily-reports?page=1&limit=100`) });
  const { data: poData } = useQuery({ queryKey: ['purchase-orders'], queryFn: () => api.get<any>('/construction/purchase-orders') });
  const { data: coData } = useQuery({ queryKey: ['change-orders'], queryFn: () => api.get<any>('/construction/change-orders') });
  const { data: safetyData } = useQuery({ queryKey: ['safety-incidents'], queryFn: () => api.get<any>('/construction/safety') });

  const projects = projectsData || [];
  const tasks = tasksData || [];
  const reports = reportsData || [];
  const purchaseOrders = Array.isArray(poData) ? poData : (poData?.data || []);
  const changeOrders = Array.isArray(coData) ? coData : (coData?.data || []);
  const safetyIncidents = Array.isArray(safetyData) ? safetyData : (safetyData?.data || []);

  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length || 0;
  
  // Calculate Global Budget & Committed Costs
  const totalPortfolioBudget = projects.reduce((sum: number, p: any) => sum + (p.budget ? p.budget / 100 : 25000000), 0);
  
  const committedCOs = changeOrders
    .filter((co: any) => co.status === 'APPROVED')
    .reduce((sum: number, co: any) => sum + (co.costImpactCents / 100), 0);
    
  const committedPOs = purchaseOrders
    .filter((po: any) => ['ISSUED', 'PARTIALLY_RECEIVED', 'CLOSED'].includes(po.status))
    .reduce((sum: number, po: any) => sum + (po.totalAmountCents / 100), 0);

  const baseCommitted = projects.reduce((sum: number, p: any) => sum + (p.committedCost ? p.committedCost / 100 : 18500000), 0);
  const totalCommittedCosts = baseCommitted + committedCOs + committedPOs;

  const openSafetyIncidents = safetyIncidents.filter((inc: any) => inc.status === 'OPEN').length || 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening today."
        icon={<LayoutDashboard className="w-6 h-6" />}
      />

      <StatsGrid
        stats={[
          { label: 'Active Projects', value: activeProjects.toString() },
          { label: 'Portfolio Budget', value: formatCurrency(totalPortfolioBudget) },
          { label: 'Committed Costs', value: formatCurrency(totalCommittedCosts), trend: totalCommittedCosts > totalPortfolioBudget ? 'Over Budget' : 'On Track', trendDirection: totalCommittedCosts > totalPortfolioBudget ? 'down' : 'up' },
          { label: 'Open Safety Incidents', value: openSafetyIncidents.toString(), trend: openSafetyIncidents > 0 ? 'Action Required' : 'All Clear', trendDirection: openSafetyIncidents > 0 ? 'down' : 'up' },
        ]}
      />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Financial Health & Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Financial Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-brand-700 dark:text-brand-300">Committed Costs: {formatCurrency(totalCommittedCosts)}</span>
                  <span className="text-brand-500 dark:text-brand-400">Budget: {formatCurrency(totalPortfolioBudget)}</span>
                </div>
                <div className="w-full h-4 bg-brand-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${totalCommittedCosts > totalPortfolioBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((totalCommittedCosts / (totalPortfolioBudget || 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-brand-500 dark:text-brand-400 text-right mt-1">
                  {((totalCommittedCosts / (totalPortfolioBudget || 1)) * 100).toFixed(1)}% Utilization
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Projects Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.filter((p: any) => p.status === 'ACTIVE').slice(0, 5).map((project: any) => {
                  const pCommitted = project.committedCost ? project.committedCost / 100 : 18500000;
                  const pBudget = project.budget ? project.budget / 100 : 25000000;
                  const util = ((pCommitted / (pBudget || 1)) * 100).toFixed(0);
                  
                  return (
                    <div key={project._id} className="flex items-center justify-between p-4 rounded-xl border border-brand-100 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20 hover:bg-white dark:hover:bg-brand-800 transition-colors">
                      <div>
                        <h4 className="font-semibold text-brand-900 dark:text-brand-100">{project.name}</h4>
                        <p className="text-xs text-brand-500 dark:text-brand-400">{project.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-brand-900 dark:text-brand-100">{util}% Utilized</div>
                        <div className={`text-xs ${pCommitted > pBudget ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {formatCurrency(pCommitted)} / {formatCurrency(pBudget)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Global Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Global Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Combine Tasks and Reports */}
            {[
              ...tasks.slice(0, 4).map((t: any) => ({ type: 'task', id: t._id, title: `Task: ${t.title}`, date: t.createdAt, pId: t.projectId })),
              ...reports.slice(0, 3).map((r: any) => ({ type: 'report', id: r._id, title: `Report submitted by ${r.submittedBy?.firstName || 'User'}`, date: r.createdAt, pId: r.projectId }))
            ]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7)
            .map((item: any) => {
              const project = projects.find((p: any) => p._id === item.pId);
              return (
                <div key={item.id} className="flex gap-4 border-b border-brand-100 dark:border-brand-800 pb-3 last:border-0 last:pb-0">
                  <div className="mt-1">
                    {item.type === 'task' ? (
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <HardHat className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900 dark:text-brand-100 leading-tight">{item.title}</p>
                    <p className="text-xs text-brand-500 dark:text-brand-400 mt-1">{project?.name || 'Unknown Project'}</p>
                    <p className="text-xs text-brand-400 dark:text-brand-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
