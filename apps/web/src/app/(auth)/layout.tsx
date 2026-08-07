'use client';

import { AuthProvider } from '@/core/providers/auth-provider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen flex">
        {/* Left panel — branding + ambient illustration */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-zinc-900">
          {/* Gradient mesh background */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600/20 blur-[128px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[128px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-500/10 blur-[96px]" />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Pulse</span>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                The Operating System
                <br />
                for <span className="text-gradient">Field Operations</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                Manage your projects, teams, and documents from one intelligent platform.
                Built for construction. Designed for the future.
              </p>

              {/* Social proof */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-zinc-900"
                      style={{
                        background: `hsl(${220 + i * 30}, 70%, ${50 + i * 5}%)`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-zinc-500">
                  Trusted by field teams everywhere
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Pulse. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right panel — form content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[420px] animate-in">
            {children}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
