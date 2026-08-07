'use client';

import { useState, useEffect } from 'react';
import { api } from '@/core/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HardHat, Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { SafetyIncident } from '@pulse/types';

export default function SafetyIncidentsPage() {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await api.get<SafetyIncident[]>('/construction/safety');
      setIncidents(data);
    } catch (error) {
      console.error('Failed to fetch safety incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoIncident = async () => {
    try {
      // Need a valid project ID, but for demo we can mock or use a known one.
      // Better yet, just show a blank state since creating requires a project ID.
      // For now, let's assume there's an API error if no project.
      alert('Create Incident Form would open here.');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-900 dark:text-brand-100">
            Safety Incidents
          </h1>
          <p className="text-sm text-brand-500">Track and manage OSHA recordable incidents.</p>
        </div>
        <Button onClick={createDemoIncident} className="gap-2 bg-red-600 hover:bg-red-700 text-white border-none">
          <Plus className="w-4 h-4" />
          Report Incident
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-brand-100 dark:bg-brand-900 rounded-xl" />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-brand-900 dark:text-brand-100 mb-1">
              Zero Incidents
            </h3>
            <p className="text-sm text-brand-500 max-w-sm mb-6">
              Your site is currently reporting zero active safety incidents. Great job keeping the team safe!
            </p>
            <Button onClick={createDemoIncident} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Report New Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident) => (
            <Card key={incident._id} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                      incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold">{incident.incidentType}</CardTitle>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300">
                    {incident.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">
                  {incident.description}
                </CardDescription>
                <div className="flex items-center justify-between text-xs text-brand-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.dateOccurred).toLocaleDateString()}
                  </span>
                  {incident.oshaRecordable && (
                    <span className="text-red-600 dark:text-red-400 font-semibold border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded">
                      OSHA
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
