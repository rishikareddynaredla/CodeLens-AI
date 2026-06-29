import React from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Layers, Database, Globe, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export function Architecture() {
  const { analysisData } = useAnalysis();
  const arch = analysisData?.architecture;

  if (!arch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-secondary-text text-lg">Architecture data is not available for this repository.</p>
        <p className="text-sm text-secondary-text/70 mt-2">The backend may have failed to generate the architecture summary.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Architecture Overview</h2>
        <p className="text-secondary-text">High-level architectural visualization of the repository.</p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-pre:bg-primary-bgSecondary prose-pre:text-primary">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 rounded-xl">
              {arch}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
