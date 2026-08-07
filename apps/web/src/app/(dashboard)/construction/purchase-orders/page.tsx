'use client';

import { useState, useEffect } from 'react';
import { api } from '@/core/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClipboardList, Plus, Truck, Package } from 'lucide-react';
import type { PurchaseOrder } from '@pulse/types';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const data = await api.get<PurchaseOrder[]>('/construction/purchase-orders');
      setPurchaseOrders(data);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoPO = async () => {
    alert('Create Purchase Order form would open here.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-900 dark:text-brand-100">
            Purchase Orders
          </h1>
          <p className="text-sm text-brand-500">Track material procurement and deliveries.</p>
        </div>
        <Button onClick={createDemoPO} className="gap-2 bg-brand-900 text-white hover:bg-brand-800 dark:bg-white dark:text-brand-900 dark:hover:bg-brand-100">
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
            <Button onClick={createDemoPO} variant="outline" className="gap-2">
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
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    po.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    po.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {po.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                    <Package className="w-4 h-4 text-brand-400" />
                    <span>{po.lineItems.length} Items</span>
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
    </div>
  );
}
