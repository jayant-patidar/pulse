import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Beaker, ShieldCheck } from 'lucide-react';

export default function CompliancePage() {
  const certifications = [
    { id: 1, name: 'USDA Organic Certification', status: 'ACTIVE', expires: '2027-12-31', body: 'USDA' },
    { id: 2, name: 'GlobalG.A.P.', status: 'RENEWAL_DUE', expires: '2026-09-30', body: 'FoodPLUS GmbH' },
    { id: 3, name: 'Worker Protection Standard (WPS)', status: 'ACTIVE', expires: '2028-01-15', body: 'EPA' },
  ];

  const chemicalLogs = [
    { id: 1, date: 'May 25, 2026', chemical: 'Glyphosate 41%', epaReg: '524-475', field: 'South 80', applicator: 'John Doe', rate: '32 oz/acre' },
    { id: 2, date: 'Jun 10, 2026', chemical: 'Fungicide Rx', epaReg: '123-456', field: 'North-East 40', applicator: 'Jane Smith', rate: '14 oz/acre' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Certifications"
        description="Manage farm certifications and track chemical application logs for regulatory compliance."
        actions={<Button>Log Application</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.map(cert => (
                  <div key={cert.id} className="p-3 rounded-xl border border-brand-100 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-brand-900 dark:text-brand-100 text-sm">{cert.name}</h4>
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${cert.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {cert.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-brand-500 mb-1">Issued by: {cert.body}</p>
                    <p className={`text-xs font-medium ${cert.status === 'RENEWAL_DUE' ? 'text-amber-600 dark:text-amber-500' : 'text-brand-600 dark:text-brand-400'}`}>
                      Expires: {new Date(cert.expires).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-emerald-500" />
                Chemical Application Logs (EPA WPS)
              </CardTitle>
              <Button variant="outline" size="sm">Export Report</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-brand-500 uppercase bg-brand-50/50 dark:bg-brand-900/20 border-y border-brand-200 dark:border-brand-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Chemical</th>
                      <th className="px-4 py-3 font-medium">EPA Reg #</th>
                      <th className="px-4 py-3 font-medium">Field</th>
                      <th className="px-4 py-3 font-medium">Applicator</th>
                      <th className="px-4 py-3 font-medium text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100 dark:divide-brand-800">
                    {chemicalLogs.map(log => (
                      <tr key={log.id} className="hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-brand-900 dark:text-brand-100">{log.date}</td>
                        <td className="px-4 py-3 text-brand-600 dark:text-brand-300 font-medium">{log.chemical}</td>
                        <td className="px-4 py-3 text-brand-500 font-mono text-xs">{log.epaReg}</td>
                        <td className="px-4 py-3 text-brand-600 dark:text-brand-300">{log.field}</td>
                        <td className="px-4 py-3 text-brand-600 dark:text-brand-300">{log.applicator}</td>
                        <td className="px-4 py-3 font-medium text-brand-900 dark:text-brand-100 text-right">{log.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
