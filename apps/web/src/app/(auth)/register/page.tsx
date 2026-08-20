'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/core/providers/auth-provider';
import { Logo } from '@/components/ui/Logo';

const INDUSTRIES = [
  { value: 'CONSTRUCTION', label: 'Construction', icon: '🏗️', disabled: false },
  { value: 'AGRICULTURE', label: 'Agriculture', icon: '🌾', disabled: false },
  { value: 'INSPECTION_SERVICES', label: 'Inspection Services', icon: '🔍', disabled: false },
  { value: 'ENERGY', label: 'Energy', icon: '⚡', disabled: true },
  { value: 'HVAC', label: 'HVAC', icon: '❄️', disabled: true },
] as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 fields
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('CONSTRUCTION');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password validation (Doc 01 R1.1)
    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must include an uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must include a lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must include a number');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must include a special character');
      return;
    }

    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({ email, password, firstName, lastName, organizationName, industry });
    } catch (err: unknown) {
      const apiErr = err as { detail?: string; message?: string };
      setError(apiErr?.detail || apiErr?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden mb-4">
        <Logo />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-zinc-500">
          {step === 1 ? 'Start with your personal details' : 'Set up your organization'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-brand-500' : 'bg-zinc-800'}`} />
        <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-brand-500' : 'bg-zinc-800'}`} />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-firstName" className="text-sm font-medium text-zinc-400">First name</label>
              <input
                id="reg-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-base"
                placeholder="John"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-lastName" className="text-sm font-medium text-zinc-400">Last name</label>
              <input
                id="reg-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-base"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-sm font-medium text-zinc-400">Work email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-sm font-medium text-zinc-400">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder="Min 12 chars, upper, lower, number, special"
              required
              autoComplete="new-password"
            />
            {/* Password strength indicator */}
            <div className="flex gap-1 mt-2">
              {[
                password.length >= 12,
                /[A-Z]/.test(password),
                /[a-z]/.test(password),
                /[0-9]/.test(password),
                /[^A-Za-z0-9]/.test(password),
              ].map((met, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    met ? 'bg-emerald-500' : password.length > 0 ? 'bg-zinc-700' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">Continue</button>
        </form>
      ) : (
        <form onSubmit={handleStep2} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="reg-orgName" className="text-sm font-medium text-zinc-400">Organization name</label>
            <input
              id="reg-orgName"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="input-base"
              placeholder="Acme Construction LLC"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Industry</label>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.value}
                  type="button"
                  disabled={ind.disabled}
                  onClick={() => !ind.disabled && setIndustry(ind.value)}
                  className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${
                    industry === ind.value
                      ? 'border-brand-500/50 bg-brand-500/10 text-white'
                      : ind.disabled
                        ? 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
                        : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200'
                  }`}
                >
                  <span className="text-lg">{ind.icon}</span>
                  <span>{ind.label}</span>
                  {ind.disabled && (
                    <span className="absolute top-1.5 right-2 text-[10px] text-zinc-600 font-normal">Soon</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-ghost flex-shrink-0"
            >
              Back
            </button>
            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create organization'
              )}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
