'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/core/lib/api-client';
import { useProject } from '@/core/providers/project-provider';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Building2, Calendar, ClipboardList, FileText, Plus, Truck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProcurementPage() {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const params = useParams<{ projectId: string }>();

  const { data: poData } = useQuery({
    queryKey: ['purchase-orders', params.projectId],
    queryFn: () => api.get<any>(`/construction/purchase-orders?projectId=${params.projectId}`),
    enabled: !!params.projectId,
  });

  const rawPurchaseOrders = Array.isArray(poData) ? poData : (poData?.data || []);

  const purchaseOrders = rawPurchaseOrders.map((po: any) => ({
    id: po.poNumber,
    vendor: po.supplierName,
    amount: po.totalAmountCents / 100,
    status: po.status,
    date: new Date(po.createdAt || Date.now()).toISOString().split('T')[0],
  }));

  const activePOs = purchaseOrders.filter((po: any) => po.status !== 'CLOSED' && po.status !== 'CANCELLED');
  const uniqueVendors = new Set(purchaseOrders.map((po: any) => po.vendor)).size;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold">Delivered</span>;
      case 'IN_TRANSIT': return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">In Transit</span>;
      case 'PENDING_APPROVAL': return <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-semibold">Pending Approval</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-semibold">{status.replace('_', ' ')}</span>;
    }
  };

  const deliveries = purchaseOrders
    .filter((po: any) => po.deliveryDateExpected && !['DELIVERED', 'CANCELLED', 'CLOSED'].includes(po.status))
    .map((po: any, index: number) => {
      const expectedDate = new Date(po.deliveryDateExpected);
      const isLate = expectedDate < new Date();
      
      return {
        id: po._id || index,
        item: po.poNumber + ' Delivery',
        date: expectedDate.toLocaleDateString(),
        status: isLate ? 'Delayed' : 'Scheduled',
        warning: isLate,
      };
    })
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Only show top 5 upcoming/delayed deliveries

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Procurement"
        description="Manage vendors, purchase orders, and material deliveries."
        icon={<ClipboardList className="w-6 h-6 text-brand-500" />}
        actions={
          <Link href={`/projects/${params.projectId}/procurement/purchase-orders`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Create PO
            </button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-500 dark:text-brand-400 mb-0.5">Active POs</p>
            <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{activePOs.length}</h3>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-brand-200 dark:border-brand-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-500 dark:text-brand-400 mb-0.5">Active Vendors</p>
            <h3 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{uniqueVendors}</h3>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-0.5">Late Deliveries</p>
            <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-500">1</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PO Grid */}
        <div className="lg:col-span-2 glass rounded-2xl border border-brand-200 dark:border-brand-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-brand-200 dark:border-brand-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100">Recent Purchase Orders</h3>
            <Link href={`/projects/${params.projectId}/procurement/purchase-orders`} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-500 bg-brand-50/50 dark:bg-brand-900/20 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 dark:divide-brand-800/50">
                {purchaseOrders.map((po: any) => (
                  <tr key={po.id} className="hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-900 dark:text-brand-100">{po.id}</td>
                    <td className="px-6 py-4 text-brand-700 dark:text-brand-300">{po.vendor}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(po.amount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="glass rounded-2xl border border-brand-200 dark:border-brand-800 p-6">
          <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-500" />
            Delivery Schedule
          </h3>
          
          <div className="space-y-6">
            {deliveries.map((delivery: any) => (
              <div key={delivery.id} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full z-10 ${delivery.warning ? 'bg-amber-500' : 'bg-brand-500'}`} />
                  <div className="w-0.5 h-full bg-brand-200 dark:bg-brand-800 absolute top-3 left-1.5 -z-10" />
                </div>
                <div className="pb-6">
                  <p className="text-sm font-bold text-brand-900 dark:text-brand-100 mb-1">{delivery.item}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-brand-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {delivery.date}
                    </span>
                    <span className={`font-semibold ${delivery.warning ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {delivery.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
