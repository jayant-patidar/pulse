import { CloudRain, Droplets, Sun, Wind } from 'lucide-react';

export function WeatherWidget() {
  return (
    <div className="glass overflow-hidden relative">
      {/* Decorative sun flare */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-display font-semibold text-brand-900 dark:text-white">Field Conditions</h3>
            <p className="text-sm text-brand-500">Current weather & soil status</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-amber-500">
              <Sun className="w-8 h-8" />
              <span className="text-3xl font-display font-bold">72°</span>
            </div>
            <span className="text-sm text-brand-500 font-medium">Clear Skies</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-brand-50 dark:bg-brand-800/50 border border-brand-100 dark:border-brand-700">
            <Droplets className="w-5 h-5 text-blue-500 mb-2" />
            <span className="text-xs text-brand-500 uppercase font-semibold tracking-wider">Soil Moisture</span>
            <span className="text-lg font-bold text-brand-900 dark:text-white">45%</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-brand-50 dark:bg-brand-800/50 border border-brand-100 dark:border-brand-700">
            <Wind className="w-5 h-5 text-teal-500 mb-2" />
            <span className="text-xs text-brand-500 uppercase font-semibold tracking-wider">Wind Speed</span>
            <span className="text-lg font-bold text-brand-900 dark:text-white">12 mph</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-brand-50 dark:bg-brand-800/50 border border-brand-100 dark:border-brand-700">
            <CloudRain className="w-5 h-5 text-indigo-500 mb-2" />
            <span className="text-xs text-brand-500 uppercase font-semibold tracking-wider">Precip (24h)</span>
            <span className="text-lg font-bold text-brand-900 dark:text-white">0.2"</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Optimal conditions for scheduled spraying today.
        </div>
      </div>
    </div>
  );
}
