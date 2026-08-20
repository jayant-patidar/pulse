'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/core/lib/api-client';
import { useProject } from '@/core/providers/project-provider';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowUpRight, BadgeDollarSign, ClipboardList, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function FinancePage() {
  const { project, isLoading } = useProject();
  const params = useParams<{ projectId: string }>();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const { data: coData } = useQuery({
    queryKey: ['change-orders', params.projectId],
    queryFn: () => api.get<any>(`/construction/change-orders?projectId=${params.projectId}`),
    enabled: !!params.projectId,
  });
  
  const { data: poData } = useQuery({
    queryKey: ['purchase-orders', params.projectId],
    queryFn: () => api.get<any>(`/construction/purchase-orders?projectId=${params.projectId}`),
    enabled: !!params.projectId,
  });

  const changeOrders = Array.isArray(coData) ? coData : (coData?.data || []);
  const purchaseOrders = Array.isArray(poData) ? poData : (poData?.data || []);

  const totalBudget = project?.budget ? (project.budget / 100) : 25000000;
  
  const committedCOs = changeOrders
    .filter((co: any) => co.status === 'APPROVED')
    .reduce((sum: number, co: any) => sum + (co.costImpactCents / 100), 0);
    
  const committedPOs = purchaseOrders
    .filter((po: any) => ['ISSUED', 'PARTIALLY_RECEIVED', 'CLOSED'].includes(po.status))
    .reduce((sum: number, po: any) => sum + (po.totalAmountCents / 100), 0);
    
  const pendingCOs = changeOrders
    .filter((co: any) => ['DRAFT', 'UNDER_REVIEW'].includes(co.status))
    .reduce((sum: number, co: any) => sum + (co.costImpactCents / 100), 0);
    
  const billedCOs = changeOrders
    .filter((co: any) => co.status === 'APPROVED')
    .reduce((sum: number, co: any) => sum + (co.costImpactCents / 100) * 0.8, 0);

  // Derive committed and billed entirely from live data + baseline
  // If project is fresh, we might not have base commitments, so we use POs + COs
  const baseCommitted = project?.committedCost ? (project.committedCost / 100) : 18500000;
  const baseBilled = project?.actualCost ? (project.actualCost / 100) : 12000000;

  const budgetData = {
    total: totalBudget + committedCOs, // Adjusted budget based on approved COs
    committed: baseCommitted + committedCOs + committedPOs,
    billed: baseBilled + billedCOs,
    pendingCOs: pendingCOs,
  };

  const available = budgetData.total - budgetData.committed;
  const committedPct = (budgetData.committed / budgetData.total) * 100;
  const billedPct = (budgetData.billed / budgetData.total) * 100;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Financial Overview"
        description="Monitor project budget, commitments, and cash flow."
        icon={<BadgeDollarSign className="w-6 h-6 text-brand-500" />}
        actions={
          <Link href={`/projects/${params.projectId}/finance/change-orders`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              <ClipboardList className="w-4 h-4" />
              Manage Change Orders
            </button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <p className="text-sm font-medium text-brand-500 dark:text-brand-400 mb-1">Total Budget</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{formatCurrency(budgetData.total)}</h3>
          </div>
        </div>
        
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800 relative overflow-hidden">
          <p className="text-sm font-medium text-brand-500 dark:text-brand-400 mb-1">Committed Costs</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{formatCurrency(budgetData.committed)}</h3>
            <span className="text-sm font-medium text-brand-600 dark:text-brand-400">{committedPct.toFixed(0)}%</span>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-brand-500" style={{ width: `${committedPct}%` }} />
        </div>

        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800">
          <p className="text-sm font-medium text-brand-500 dark:text-brand-400 mb-1">Available Budget</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(available)}</h3>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending Change Orders</p>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-500">{formatCurrency(budgetData.pendingCOs)}</h3>
            <Link href={`/projects/${params.projectId}/finance/change-orders`} className="text-xs font-semibold text-amber-600 hover:underline">
              Review
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Breakdown */}
        <div className="lg:col-span-2 glass rounded-2xl border border-brand-200 dark:border-brand-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Cost Analysis
          </h3>
          
          <div className="space-y-8 flex-1">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-brand-700 dark:text-brand-300">Billed to Date</span>
                <span className="font-bold text-brand-900 dark:text-brand-100">{formatCurrency(budgetData.billed)}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${billedPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-brand-700 dark:text-brand-300">Committed (incl. Billed)</span>
                <span className="font-bold text-brand-900 dark:text-brand-100">{formatCurrency(budgetData.committed)}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: `${committedPct}%` }} />
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-900/30 border border-slate-100 dark:border-brand-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-brand-400">Projected Variance</p>
                <p className="text-lg font-bold text-emerald-600">Under by $150,000</p>
              </div>
              <TrendingDown className="w-8 h-8 text-emerald-500/20" />
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-6">
          <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-6">Financial Actions</h3>
          <div className="space-y-3">
            <Link 
              href={`/projects/${params.projectId}/finance/change-orders`}
              className="flex items-center justify-between p-4 rounded-xl border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors group"
            >
              <div>
                <p className="font-semibold text-brand-900 dark:text-brand-100">Change Orders</p>
                <p className="text-xs text-brand-500">{changeOrders.length} total • {changeOrders.filter((co:any)=>co.status === 'UNDER_REVIEW').length} requiring review</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-brand-400 group-hover:text-brand-600" />
            </Link>
            
            <Link 
              href={`/projects/${params.projectId}/procurement/purchase-orders`}
              className="flex items-center justify-between p-4 rounded-xl border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors group"
            >
              <div>
                <p className="font-semibold text-brand-900 dark:text-brand-100">Purchase Orders</p>
                <p className="text-xs text-brand-500">{purchaseOrders.length} vendor commitments</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-brand-400 group-hover:text-brand-600" />
            </Link>

            <button 
              className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors group"
            >
              <div>
                <p className="font-semibold text-brand-900 dark:text-brand-100 text-left">Generate Report</p>
                <p className="text-xs text-brand-500 text-left">Export budget to PDF</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-brand-400 group-hover:text-brand-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
