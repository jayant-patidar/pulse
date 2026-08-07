import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, Plus, ClipboardList, UploadCloud, Tractor, HardHat, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening today."
        icon={<LayoutDashboard className="w-6 h-6" />}
      />

      <StatsGrid
        stats={[
          { label: 'Active Projects', value: '12', trend: '+2', trendDirection: 'up' },
          { label: 'Open Tasks', value: '8', trend: '-3', trendDirection: 'down' },
          { label: 'Reports Today', value: '4', trend: 'Pending', trendDirection: 'neutral' },
          { label: 'Team Members', value: '24' },
        ]}
      />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-brand-100 dark:border-brand-800 last:border-0">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-brand-600 dark:text-brand-300">U{i}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-brand-900 dark:text-brand-100 truncate">
                    User {i} updated a task
                  </div>
                  <div className="text-xs text-brand-500 dark:text-brand-400 truncate mt-0.5">
                    2 hours ago
                  </div>
                </div>
                <div className="text-xs font-medium text-brand-400 dark:text-brand-300 bg-brand-50 dark:bg-brand-900 px-2 py-1 rounded">
                  Project {i}
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm">View all activity</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Create Project', icon: <HardHat className="w-4 h-4" /> },
              { label: 'Submit Daily Report', icon: <ClipboardList className="w-4 h-4" /> },
              { label: 'Upload Document', icon: <UploadCloud className="w-4 h-4" /> },
              { label: 'Add Equipment', icon: <Tractor className="w-4 h-4" /> },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-white dark:hover:bg-brand-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm hover:text-brand-900 dark:hover:text-brand-100 active:scale-[0.98] transition-all duration-200 group"
              >
                <div className="text-brand-500 dark:text-brand-400 group-hover:text-accent-500 transition-colors">
                  {action.icon}
                </div>
                <span className="truncate">{action.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-brand-400 dark:text-brand-500 group-hover:text-accent-500 transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
