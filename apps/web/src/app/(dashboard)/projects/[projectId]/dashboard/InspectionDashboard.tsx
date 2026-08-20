'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, AlertTriangle, ShieldCheck, ListTodo, ChevronRight, Calendar, AlertOctagon } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { format, isPast, isToday } from 'date-fns';

export function InspectionDashboard({ project, pId }: { project: any, pId: string }) {
  // Fetch real data for this project
  const { data: inspectionsData } = useQuery({ 
    queryKey: ['inspections', pId], 
    queryFn: () => api.get<any[]>(`/branches/inspection/inspections?projectId=${pId}`) 
  });
  
  const { data: findingsData } = useQuery({ 
    queryKey: ['findings', pId], 
    queryFn: () => api.get<any[]>(`/branches/inspection/findings?projectId=${pId}`) 
  });
  
  const { data: actionsData } = useQuery({ 
    queryKey: ['corrective-actions', pId], 
    queryFn: () => api.get<any[]>(`/branches/inspection/corrective-actions?projectId=${pId}`) 
  });
  
  const { data: certsData } = useQuery({ 
    queryKey: ['certifications', pId], 
    queryFn: () => api.get<any[]>(`/branches/inspection/certifications?projectId=${pId}`) 
  });

  const inspections = inspectionsData || [];
  const findings = findingsData || [];
  const actions = actionsData || [];
  const certs = certsData || [];

  // Calculate Stats
  const openFindings = findings.filter(f => f.status === 'OPEN' || f.status === 'IN_REMEDIATION');
  const criticalFindings = openFindings.filter(f => f.severity === 'CRITICAL');
  
  const overdueActions = actions.filter(a => 
    a.status !== 'COMPLETED' && a.status !== 'WAIVED' && a.deadline && isPast(new Date(a.deadline)) && !isToday(new Date(a.deadline))
  );

  const scheduledInspections = inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS');
  const activeCerts = certs.filter(c => c.status === 'ACTIVE');

  // Sort lists
  const upcomingInspections = [...scheduledInspections].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()).slice(0, 5);
  const criticalList = [...criticalFindings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title={project?.name || 'Inspection Overview'}
        description={`Inspection and compliance dashboard for ${project?.name || 'this property'}.`}
        icon={<Search className="w-6 h-6 text-blue-500" />}
      />

      {/* Top Row: High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Findings"
          value={openFindings.length.toString()}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={criticalFindings.length > 0 ? { value: criticalFindings.length, label: 'critical issues', isPositive: false } : undefined}
        />
        <StatCard
          title="Overdue Actions"
          value={overdueActions.length.toString()}
          icon={<ListTodo className="w-6 h-6" />}
          trend={overdueActions.length > 0 ? { value: overdueActions.length, label: 'needs attention', isPositive: false } : undefined}
        />
        <StatCard
          title="Scheduled Inspections"
          value={scheduledInspections.length.toString()}
          icon={<Calendar className="w-6 h-6" />}
        />
        <StatCard
          title="Active Certifications"
          value={activeCerts.length.toString()}
          icon={<ShieldCheck className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Inspections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Inspections
            </CardTitle>
            <Link href={`/projects/${pId}/inspections`} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingInspections.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No upcoming inspections scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingInspections.map((insp: any) => (
                  <div key={insp._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {insp.inspectionType.replace('_', ' ')}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {insp.scope}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {insp.scheduledDate ? format(new Date(insp.scheduledDate), 'MMM d, yyyy') : 'TBD'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {insp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Critical Findings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-500" />
              Critical Findings
            </CardTitle>
            <Link href={`/projects/${pId}/findings`} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {criticalList.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No critical findings reported. All clear!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalList.map((finding: any) => (
                  <div key={finding._id} className="flex items-start justify-between p-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        <AlertOctagon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                          {finding.findingType.replace('_', ' ')}
                        </h4>
                        <p className="text-xs text-red-700/80 dark:text-red-300 mt-1 line-clamp-2">
                          {finding.description}
                        </p>
                        {finding.codeReference && (
                          <span className="inline-block mt-2 text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                            Code: {finding.codeReference}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 whitespace-nowrap">
                      {finding.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
