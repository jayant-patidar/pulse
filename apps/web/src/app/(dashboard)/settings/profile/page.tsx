'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PulseLoader } from '@/components/ui/PulseLoader';
import { api } from '@/core/lib/api-client';
import { useAuth } from '@/core/providers/auth-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Upload, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get<any>('/root/users/me'),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    }
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile, form]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => api.patch('/root/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      refetchUser();
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update profile');
    }
  });

  if (isLoading) {
    return <PulseLoader size="md" text="Loading profile..." />;
  }

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-brand-100 dark:border-brand-800">
            <div className="w-24 h-24 rounded-2xl bg-brand-100 dark:bg-brand-900 border border-brand-200 dark:border-brand-800 flex items-center justify-center overflow-hidden relative group shrink-0">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-brand-400 dark:text-brand-600" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-medium text-brand-900 dark:text-brand-100 mb-1">Profile Photo</h3>
              <p className="text-sm text-brand-500 dark:text-brand-400 mb-3 max-w-sm">
                We recommend an image of at least 400x400px.
              </p>
              <Button type="button" variant="outline" size="sm">
                Change Photo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="First Name" error={form.formState.errors.firstName?.message} required>
              <Input {...form.register('firstName')} placeholder="John" error={!!form.formState.errors.firstName} />
            </FormField>

            <FormField label="Last Name" error={form.formState.errors.lastName?.message} required>
              <Input {...form.register('lastName')} placeholder="Doe" error={!!form.formState.errors.lastName} />
            </FormField>

            <FormField label="Email Address">
              <Input value={userProfile?.email || ''} disabled className="bg-slate-50 dark:bg-brand-900/50 cursor-not-allowed text-brand-500" />
            </FormField>

            <FormField label="Phone Number" error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} placeholder="+1 (555) 000-0000" error={!!form.formState.errors.phone} />
            </FormField>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={updateMutation.isPending || !form.formState.isDirty}>
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
