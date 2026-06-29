import React from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { PackageOpen } from 'lucide-react';

export function Dependencies() {
  const { analysisData } = useAnalysis();
  const deps = analysisData?.dependencies || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Dependencies</h2>
        <p className="text-secondary-text">Core packages and libraries powering this project.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deps.map((dep, i) => (
          <Card key={i} className="hover:border-primary/20 transition-colors">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-border/50 flex items-center justify-center shrink-0">
                <PackageOpen className="w-5 h-5 text-secondary-text" />
              </div>
              <div className="min-w-0">
                <h4 className="font-mono font-semibold text-primary truncate">{dep.name}</h4>
                <p className="text-sm text-secondary-text mt-1">{dep.version}</p>
                <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-border text-secondary-text capitalize">
                  {dep.type}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
