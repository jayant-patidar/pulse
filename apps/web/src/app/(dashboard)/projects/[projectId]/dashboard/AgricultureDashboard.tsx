'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { Activity, AlertTriangle, Beaker, ChevronRight, CloudRain, Sprout } from 'lucide-react';
import Link from 'next/link';

export function AgricultureDashboard({ project, pId }: { project: any, pId: string }) {
  // Mock data for visual richness
  const activeCycles = [
    { id: '1', crop: 'Winter Wheat', field: 'North-East 40', stage: 'Tillering', progress: 65, health: 'Good' },
    { id: '2', crop: 'Soybeans', field: 'South 80', stage: 'Emergence', progress: 15, health: 'Warning' },
  ];

  const recentAlerts = [
    { id: '1', type: 'Pest', severity: 'High', message: 'Aphid activity detected above threshold', field: 'South 80', time: '2 hours ago' },
    { id: '2', type: 'Disease', severity: 'Low', message: 'Early signs of rust', field: 'North-East 40', time: '1 day ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title={project?.name || 'Farm Overview'}
        description={`Command center for ${project?.name || 'this farm'}.`}
        icon={<Sprout className="w-6 h-6 text-emerald-500" />}
      />

      {/* Top Row: Weather & High-Level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            title="Active Crop Cycles"
            value="12"
            icon={<Sprout className="w-6 h-6" />}
            trend={{ value: 2, label: 'vs last season', isPositive: true }}
          />
          <StatCard
            title="Estimated Yield"
            value="4,250 bu"
            icon={<Activity className="w-6 h-6" />}
            trend={{ value: 5.4, label: 'above target', isPositive: true }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Cycles Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-500" />
                Active Crop Cycles
              </CardTitle>
              <Link href={`/projects/${pId}/crop-cycles`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCycles.map((cycle) => (
                  <div key={cycle.id} className="p-4 rounded-xl border border-brand-100 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-900/10">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-semibold text-brand-900 dark:text-brand-100">{cycle.crop}</h4>
                        <p className="text-sm text-brand-500">{cycle.field} • {cycle.stage}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cycle.health === 'Good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {cycle.health}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-brand-200 dark:bg-brand-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${cycle.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl border border-brand-100 dark:border-brand-800 bg-white dark:bg-brand-900">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${alert.severity === 'High' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-brand-900 dark:text-white">{alert.message}</p>
                      <p className="text-xs text-brand-500 mt-1">{alert.field} • {alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/projects/${pId}/scouting`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-white dark:hover:bg-brand-800 hover:border-brand-200 hover:shadow-sm transition-all group">
                <Beaker className="w-4 h-4 text-emerald-500 group-hover:text-amber-500" />
                Log Scouting Report
                <ChevronRight className="w-4 h-4 ml-auto text-brand-400 group-hover:text-amber-500" />
              </Link>
              
              <Link href={`/projects/${pId}/harvests`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-white dark:hover:bg-brand-800 hover:border-brand-200 hover:shadow-sm transition-all group">
                <CloudRain className="w-4 h-4 text-emerald-500 group-hover:text-amber-500" />
                Record Harvest Yield
                <ChevronRight className="w-4 h-4 ml-auto text-brand-400 group-hover:text-amber-500" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
