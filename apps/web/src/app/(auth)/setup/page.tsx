'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/lib/api-client';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function SetupPage() {
  const router = useRouter();
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('setupToken');
    if (!token) {
      router.push('/login');
    } else {
      setSetupToken(token);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/root/auth/reset-temp-password', {
        setupToken,
        newPassword,
      });
      sessionStorage.removeItem('setupToken');
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!setupToken) return null;

  return (
    <div className="space-y-8 max-w-md w-full mx-auto">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-4">
        <Logo />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Welcome to Pulse</h1>
        <p className="mt-2 text-zinc-500">
          Your account was created with a temporary password. Please set a new secure password to continue.
        </p>
      </div>

      {success ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">
          <p className="font-medium">Password updated successfully!</p>
          <p className="text-sm mt-1 text-emerald-500/80">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••••••"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={isLoading || !newPassword || !confirmPassword}
              isLoading={isLoading}
            >
              Update Password & Continue
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
