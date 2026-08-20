'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SlideOver } from '@/components/ui/SlideOver';
import { api } from '@/core/lib/api-client';
import type { ChangeOrder } from '@pulse/types';
import { CreateChangeOrderInput } from '@pulse/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, DollarSign, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { ChangeOrderForm } from './_components/ChangeOrderForm';

export default function ChangeOrdersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: changeOrders = [], isLoading } = useQuery({
    queryKey: ['change-orders'],
    queryFn: () => api.get<ChangeOrder[]>('/construction/change-orders'),
  });

  const createMutation = useMutation({
    mutationFn: (newCO: CreateChangeOrderInput) => api.post('/construction/change-orders', newCO),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      setIsDrawerOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-900 dark:text-brand-100">
            Change Orders
          </h1>
          <p className="text-sm text-brand-500">Manage budget and schedule impacts.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="gap-2 bg-brand-900 text-white hover:bg-brand-800 dark:bg-white dark:text-brand-900 dark:hover:bg-brand-100">
          <Plus className="w-4 h-4" />
          Create CO
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-brand-100 dark:bg-brand-900 rounded-xl" />
          ))}
        </div>
      ) : changeOrders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center mb-4 text-brand-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-brand-900 dark:text-brand-100 mb-1">
              No Change Orders
            </h3>
            <p className="text-sm text-brand-500 max-w-sm mb-6">
              There are no change orders recorded yet. Create one to track scope or budget changes.
            </p>
            <Button onClick={() => setIsDrawerOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create CO
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {changeOrders.map((co) => (
            <Card key={co._id} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-brand-500">{co.coNumber}</span>
                    <CardTitle className="text-sm font-semibold mt-1">{co.title}</CardTitle>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    co.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    co.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    co.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-300'
                  }`}>
                    {co.status.replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                    <DollarSign className="w-4 h-4 text-brand-400" />
                    <span>{(co.costImpactCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                    <CalendarClock className="w-4 h-4 text-brand-400" />
                    <span>{co.scheduleImpactDays} Days Impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Change Order"
        description="Submit a new change order for approval."
      >
        <ChangeOrderForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
