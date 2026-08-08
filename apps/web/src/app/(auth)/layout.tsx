'use client';

import { AuthProvider } from '@/core/providers/auth-provider';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen flex bg-white dark:bg-slate-950">
        {/* Left panel — beautiful visual */}
        <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden">
          {/* Background Image */}
          <Image
            src="/auth-bg.png"
            alt="Construction Architecture"
            fill
            className="object-cover object-center"
            priority
          />
          
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full h-full">
            <div>
              <Logo forceDark={true} />
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-white leading-tight drop-shadow-md">
                The Operating System
                <br />
                for <span className="text-brand-400">Field Operations</span>
              </h2>
              <p className="text-slate-200 text-lg leading-relaxed max-w-md drop-shadow">
                Manage your projects, teams, and documents from one intelligent platform.
                Built for construction. Designed for the future.
              </p>

              {/* Glassmorphic testimonial/feature card */}
              <div className="mt-8 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-md">
                <p className="text-white italic">
                  "Pulse completely transformed how we manage our jobsites. 
                  The transparency and real-time syncing across teams is unparalleled."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Sarah Jenkins</p>
                    <p className="text-xs text-slate-300">Project Manager, BuildCorp</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 drop-shadow">
              © {new Date().getFullYear()} Pulse. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right panel — Authentication Forms */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
