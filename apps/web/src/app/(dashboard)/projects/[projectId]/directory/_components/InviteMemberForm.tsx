'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

interface InviteMemberFormProps {
  onSubmit: (data: { email: string; role: string }) => void;
  isLoading?: boolean;
}

export function InviteMemberForm({ onSubmit, isLoading }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubmit({ email, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Email Address" required>
        <Input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="colleague@example.com" 
          required
        />
      </FormField>

      <FormField label="System Role" required>
        <select 
          className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="MEMBER">Member (Standard Access)</option>
          <option value="ADMIN">Admin (Full Access)</option>
          <option value="SUBCONTRACTOR">Subcontractor (Limited Access)</option>
        </select>
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={!email || isLoading}
          isLoading={isLoading}
        >
          Send Invitation
        </Button>
      </div>
    </form>
  );
}
