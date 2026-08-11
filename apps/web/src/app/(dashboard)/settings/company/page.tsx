'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { useAuth } from '@/core/providers/auth-provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Building2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', user?.orgId],
    queryFn: () => api.get<any>(`/root/organizations/${user?.orgId}`),
    enabled: !!user?.orgId,
  });

  const [formData, setFormData] = useState({
    taxId: '',
    foundedYear: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialties: '',
  });

  useEffect(() => {
    if (org) {
      setFormData({
        taxId: org.taxId || '',
        foundedYear: org.foundedYear?.toString() || '',
        website: org.website || '',
        address: org.headquarters?.address || '',
        city: org.headquarters?.city || '',
        state: org.headquarters?.state || '',
        zip: org.headquarters?.zip || '',
        specialties: (org.specialties || []).join(', '),
      });
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch('/root/organizations/current', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', user?.orgId] });
      toast.success('Company profile updated successfully');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update company profile'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      taxId: formData.taxId,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear, 10) : undefined,
      website: formData.website,
      headquarters: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        title="Company Profile"
        description="Manage your organization's identity, tax information, and specialties."
        icon={<Building2 className="w-6 h-6 text-brand-500" />}
      />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-8">
          
          {/* Identity Section */}
          <div>
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-4 border-b border-brand-100 dark:border-brand-800 pb-2">
              Corporate Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Organization Name">
                <Input value={org?.name || ''} disabled className="bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed" />
              </FormField>
              <FormField label="Tax ID (EIN)">
                <Input 
                  value={formData.taxId} 
                  onChange={e => setFormData(f => ({ ...f, taxId: e.target.value }))} 
                  placeholder="XX-XXXXXXX" 
                />
              </FormField>
              <FormField label="Founded Year">
                <Input 
                  type="number"
                  value={formData.foundedYear} 
                  onChange={e => setFormData(f => ({ ...f, foundedYear: e.target.value }))} 
                  placeholder="2010" 
                />
              </FormField>
              <FormField label="Website">
                <Input 
                  type="url"
                  value={formData.website} 
                  onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} 
                  placeholder="https://www.company.com" 
                />
              </FormField>
            </div>
          </div>

          {/* Headquarters Section */}
          <div>
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-4 border-b border-brand-100 dark:border-brand-800 pb-2">
              Headquarters
            </h3>
            <div className="space-y-6">
              <FormField label="Street Address">
                <Input 
                  value={formData.address} 
                  onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} 
                  placeholder="123 Main St" 
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="City">
                  <Input 
                    value={formData.city} 
                    onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} 
                  />
                </FormField>
                <FormField label="State">
                  <Input 
                    value={formData.state} 
                    onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} 
                  />
                </FormField>
                <FormField label="ZIP Code">
                  <Input 
                    value={formData.zip} 
                    onChange={e => setFormData(f => ({ ...f, zip: e.target.value }))} 
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Industry Specialties */}
          <div>
            <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-4 border-b border-brand-100 dark:border-brand-800 pb-2">
              Industry Information
            </h3>
            <FormField label="Specialties (comma separated)">
              <Input 
                value={formData.specialties} 
                onChange={e => setFormData(f => ({ ...f, specialties: e.target.value }))} 
                placeholder="Concrete, Roofing, HVAC" 
              />
            </FormField>
          </div>

        </div>

        <div className="px-6 py-4 bg-brand-50/50 dark:bg-brand-900/10 border-t border-brand-200 dark:border-brand-800 flex justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            className="flex items-center gap-2"
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
