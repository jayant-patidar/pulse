'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/core/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

export default function SecuritySettingsPage() {
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: SecurityFormValues) => api.patch('/root/users/me/password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      form.reset();
      toast.success('Password updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update password');
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    updatePasswordMutation.mutate(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="max-w-md space-y-6">
          <FormField label="Current Password" error={form.formState.errors.currentPassword?.message} required>
            <Input 
              type="password"
              {...form.register('currentPassword')} 
              placeholder="Enter current password" 
              error={!!form.formState.errors.currentPassword} 
            />
          </FormField>

          <FormField label="New Password" error={form.formState.errors.newPassword?.message} required>
            <Input 
              type="password"
              {...form.register('newPassword')} 
              placeholder="Enter new password" 
              error={!!form.formState.errors.newPassword} 
            />
          </FormField>

          <FormField label="Confirm New Password" error={form.formState.errors.confirmPassword?.message} required>
            <Input 
              type="password"
              {...form.register('confirmPassword')} 
              placeholder="Confirm new password" 
              error={!!form.formState.errors.confirmPassword} 
            />
          </FormField>

          <div className="pt-2 flex justify-between items-center">
            <p className="text-xs text-brand-500 dark:text-brand-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Password must be at least 8 characters.
            </p>
            <Button type="submit" variant="primary" disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Update Password
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
