'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

interface InviteMemberFormProps {
  onSubmit: (data: { firstName: string; lastName: string; role: string; employmentType: string; reportsTo?: string }) => void;
  isLoading?: boolean;
  managers: any[];
}

export function InviteMemberForm({ onSubmit, isLoading, managers }: InviteMemberFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('WORKER');
  const [employmentType, setEmploymentType] = useState('PERMANENT');
  const [reportsTo, setReportsTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    onSubmit({ 
      firstName, 
      lastName, 
      role, 
      employmentType,
      ...(reportsTo ? { reportsTo } : {})
    });
  };

  const eligibleManagers = managers.filter(m => m.role === 'OWNER' || m.role === 'ADMIN' || m.role === 'MANAGER' || m.role === 'SUPERVISOR');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" required>
          <Input 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            placeholder="John" 
            required
          />
        </FormField>
        <FormField label="Last Name" required>
          <Input 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            placeholder="Doe" 
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="System Role" required>
          <select 
            className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="WORKER">Worker</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
            <option value="CONTRACTOR">Contractor</option>
          </select>
        </FormField>

        <FormField label="Employment Type" required>
          <select 
            className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="PERMANENT">Permanent (FTE)</option>
            <option value="FIXED_CONTRACT">Fixed Contract</option>
            <option value="TEMP_HOURLY">Temp Hourly</option>
            <option value="DAILY_WAGE">Daily Wage</option>
          </select>
        </FormField>
      </div>

      <FormField label="Reports To (Manager)">
        <select 
          className="w-full h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          value={reportsTo}
          onChange={(e) => setReportsTo(e.target.value)}
        >
          <option value="">-- No Direct Manager --</option>
          {eligibleManagers.map(m => (
            <option key={m._id} value={m._id}>
              {m.user?.firstName} {m.user?.lastName} ({m.role})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-brand-500">Determines timesheet approval and chain of command.</p>
      </FormField>

      <div className="pt-4 flex justify-end gap-3 border-t border-brand-200 dark:border-brand-800">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={!firstName || !lastName || isLoading}
          isLoading={isLoading}
        >
          Onboard Employee
        </Button>
      </div>
    </form>
  );
}
