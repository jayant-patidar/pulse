'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Package, Truck, ClipboardList, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PurchaseOrder } from '@pulse/types';
import { SlideOver } from '@/components/ui/SlideOver';
import { PurchaseOrderForm } from './_components/PurchaseOrderForm';
import { CreatePurchaseOrderInput } from '@pulse/validators';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export default function PurchaseOrdersPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: poResponse = { data: [] }, isLoading } = useQuery({
    queryKey: ['purchase-orders', params.projectId],
    queryFn: () => api.get<{ data: PurchaseOrder[] }>(`/construction/purchase-orders?projectId=${params.projectId}`),
  });

  const purchaseOrders = Array.isArray(poResponse) ? poResponse : (poResponse.data || []);

  const createMutation = useMutation({
    mutationFn: (newPO: CreatePurchaseOrderInput) => api.post('/construction/purchase-orders', { ...newPO, projectId: params.projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', params.projectId] });
      setIsDrawerOpen(false);
      toast.success('Purchase order created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create purchase order');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/construction/purchase-orders/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', params.projectId] });
      toast.success('Purchase order status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/construction/purchase-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', params.projectId] });
      toast.success('Purchase order deleted');
    },
  });

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Go Back
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-900 dark:text-brand-100">
            Purchase Orders
          </h1>
          <p className="text-sm text-brand-500">Track material procurement and deliveries.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="gap-2 bg-brand-900 text-white hover:bg-brand-800 dark:bg-white dark:text-brand-900 dark:hover:bg-brand-100">
          <Plus className="w-4 h-4" />
          Create PO
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-brand-100 dark:bg-brand-900 rounded-xl" />
          ))}
        </div>
      ) : purchaseOrders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center mb-4 text-brand-400">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-brand-900 dark:text-brand-100 mb-1">
              No Purchase Orders
            </h3>
            <p className="text-sm text-brand-500 max-w-sm mb-6">
              Manage your materials and supplies by creating your first purchase order.
            </p>
            <Button onClick={() => setIsDrawerOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create PO
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchaseOrders.map((po) => (
            <Card key={po._id} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-brand-500">{po.poNumber}</span>
                    <CardTitle className="text-sm font-semibold mt-1">{po.supplierName}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select 
                      value={po.status} 
                      onChange={(e) => updateMutation.mutate({ id: po._id, status: e.target.value })}
                      className="text-xs rounded-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-1 pl-2 pr-6 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ISSUED">Issued</option>
                      <option value="PARTIALLY_RECEIVED">Partially Received</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(po._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-6">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                    <Package className="w-4 h-4 text-brand-400" />
                    <span>{po.lineItems?.length || 0} Items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                      <Truck className="w-4 h-4 text-brand-400" />
                      <span>{po.deliveryDateExpected ? new Date(po.deliveryDateExpected).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <span className="font-semibold text-brand-900 dark:text-brand-100">
                      {(po.totalAmountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
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
        title="Create Purchase Order"
        description="Enter the details of the new purchase order."
      >
        <PurchaseOrderForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
