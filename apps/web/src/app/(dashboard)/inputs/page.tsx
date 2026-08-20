'use client';

import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SlideOver } from '@/components/ui/SlideOver';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/core/lib/api-client';
import { CreateInputInventoryInput, UpdateInputInventoryInput } from '@pulse/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, DollarSign, Droplet, Edit, Fuel, Package, Plus, Sprout, TestTubes, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { InventoryForm } from './_components/InventoryForm';

export default function InputsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inputs'],
    queryFn: () => api.get<any>('/branches/agriculture/inputs'),
  });

  const inputs = Array.isArray(inventoryData) ? inventoryData : (inventoryData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: CreateInputInventoryInput) => api.post('/branches/agriculture/inputs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inputs'] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateInputInventoryInput }) => api.patch(`/branches/agriculture/inputs/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inputs'] });
      setIsDrawerOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/branches/agriculture/inputs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inputs'] });
    },
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'SEED': return <Sprout className="w-4 h-4 text-emerald-500" />;
      case 'FERTILIZER': return <Droplet className="w-4 h-4 text-amber-500" />;
      case 'HERBICIDE':
      case 'INSECTICIDE':
      case 'FUNGICIDE': return <TestTubes className="w-4 h-4 text-purple-500" />;
      case 'FUEL': return <Fuel className="w-4 h-4 text-rose-500" />;
      default: return <Package className="w-4 h-4 text-brand-500" />;
    }
  };

  const columns = [
    {
      header: 'Product',
      accessorKey: 'productName',
      cell: (item: any) => (
        <div>
          <p className="font-medium text-brand-900 dark:text-brand-100">{item.productName}</p>
          <p className="text-xs text-brand-500">{item.manufacturer}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'inputType',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          {getCategoryIcon(item.inputType)}
          <span className="text-sm text-brand-700 dark:text-brand-300 capitalize">{item.inputType.toLowerCase()}</span>
        </div>
      ),
    },
    {
      header: 'Quantity',
      accessorKey: 'quantityOnHand',
      cell: (item: any) => (
        <span className="text-sm font-medium">
          {item.quantityOnHand} {item.unit}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => (
        <StatusBadge 
          status={item.status} 
        />
      ),
    },
    {
      header: 'EPA Reg',
      accessorKey: 'epaRegistrationNumber',
      cell: (item: any) => <span className="text-xs text-brand-500">{item.epaRegistrationNumber || '--'}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditingItem(item);
              setIsDrawerOpen(true);
            }}
            className="p-1 hover:bg-brand-100 dark:hover:bg-brand-800 rounded transition-colors text-brand-600 dark:text-brand-400"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteMutation.mutate(item._id)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-colors text-rose-600 dark:text-rose-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalValue = inputs.reduce((sum: number, item: any) => sum + ((item.quantityOnHand * (item.costPerUnitCents || 0)) / 100), 0);
  const lowStockCount = inputs.filter((item: any) => item.status === 'LOW_STOCK').length;
  const outOfStockCount = inputs.filter((item: any) => item.status === 'OUT_OF_STOCK').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Inputs Inventory"
        description="Manage seed, fertilizer, fuel, and chemical inventory levels."
        icon={<Package className="w-6 h-6 text-brand-500" />}
        actions={
          <Button variant="primary" onClick={() => {
            setEditingItem(null);
            setIsDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory Item
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Total Unique Items", value: inputs.length.toString(), icon: <Package className="w-4 h-4" /> },
          { label: "Total Inventory Value", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue), icon: <DollarSign className="w-4 h-4" /> },
          { label: "Low Stock Items", value: lowStockCount.toString(), icon: <AlertTriangle className="w-4 h-4" />, trend: lowStockCount > 0 ? 'Needs Attention' : 'Good', trendDirection: lowStockCount > 0 ? 'down' : 'up' },
          { label: "Out of Stock", value: outOfStockCount.toString(), icon: <AlertTriangle className="w-4 h-4" />, trend: outOfStockCount > 0 ? 'Critical' : 'Good', trendDirection: outOfStockCount > 0 ? 'down' : 'up' },
        ]}
      />

      <DataTable
        data={inputs}
        columns={columns}
        keyExtractor={(item: any) => item._id}
        isLoading={isLoading}
        emptyMessage="No inventory items found. Add your first item to get started."
      />

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
        description="Enter the product details, stock levels, and EPA compliance info."
      >
        <InventoryForm
          initialData={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              updateMutation.mutate({ id: editingItem._id, payload: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
