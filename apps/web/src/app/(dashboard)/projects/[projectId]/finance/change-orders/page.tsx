'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { PulseLoader } from '@/components/ui/PulseLoader';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function ChangeOrdersPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const { data: coData, isLoading } = useQuery({
    queryKey: ['change-orders', params.projectId],
    queryFn: () => api.get<any>(`/construction/change-orders?projectId=${params.projectId}`),
  });

  const changeOrders = Array.isArray(coData) ? coData : (coData?.data || []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Go Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Change Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage financial and schedule impacts.</p>
          </div>
          <Button variant="primary">Create Change Order</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[300px]">
        {isLoading ? (
          <PulseLoader size="lg" text="Loading change orders..." />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">CO Number</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Cost Impact</th>
                <th className="p-4 font-medium">Schedule Impact</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-sm">
              {changeOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No change orders found for this project.
                  </td>
                </tr>
              ) : (
                changeOrders?.map((co: any) => (
                  <tr key={co._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-brand-600 dark:text-brand-400">{co.coNumber}</td>
                    <td className="p-4">{co.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        co.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        co.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {co.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {co.costImpactCents > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          +${(co.costImpactCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-500">$0.00</span>
                      )}
                    </td>
                    <td className="p-4">
                      {co.scheduleImpactDays > 0 ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">+{co.scheduleImpactDays} days</span>
                      ) : (
                        <span className="text-gray-500">0 days</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Review</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
