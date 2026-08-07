'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UploadCloud, FileText, Download } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { SlideOver } from '@/components/ui/SlideOver';
import { DocumentForm } from './_components/DocumentForm';
import { CreateDocumentInput } from '@pulse/validators';

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page],
    queryFn: () => api.get<any>(`/trunk/documents?page=${page}&limit=20`),
  });
  
  const documents = data|| [];

  const createMutation = useMutation({
    mutationFn: (newDoc: CreateDocumentInput) => api.post('/trunk/documents', newDoc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsDrawerOpen(false);
    },
  });

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const columns = [
    {
      header: 'File Name',
      accessorKey: 'name',
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 dark:bg-brand-900/50 text-brand-400 rounded-lg border border-brand-100 dark:border-brand-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-brand-900 dark:text-brand-100">{item.name}</div>
            <div className="text-sm text-brand-500 dark:text-brand-400">{item.originalFilename}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Size',
      accessorKey: 'sizeBytes',
      cell: (item: any) => <span className="text-brand-500 dark:text-brand-400">{formatBytes(item.sizeBytes)}</span>,
    },
    {
      header: 'Approval',
      accessorKey: 'status',
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (item: any) => (
        <Button variant="ghost" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      ),
    },
  ];

  const filteredDocuments = documents?.filter((d: any) => d.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Documents"
        description="Centralized storage for drawings, RFIs, and photos."
        icon={<FileText className="w-6 h-6" />}
        actions={
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Total Files", value: "1,248" },
          { label: "Pending Approval", value: "12", trend: "Needs Review", trendDirection: "down" },
          { label: "Storage Used", value: "4.2 GB", trend: "15% of Quota", trendDirection: "neutral" },
          { label: "Recent Uploads", value: "24", trendDirection: "up" },
        ]}
      />

      <div className="glass p-6">
        <FilterBar searchPlaceholder="Search files..." onSearchChange={setSearch} />

        <DataTable
          columns={columns}
          data={filteredDocuments}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
      </div>

      <SlideOver
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Upload Document"
        description="Add a new file to the project repository."
      >
        <DocumentForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
