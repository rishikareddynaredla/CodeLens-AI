import React from 'react';
import { useAnalysis } from '../../context/AnalysisContext';

export function TopBar() {
  const { analysisData } = useAnalysis();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {analysisData?.repo ? (
          <>
            <span className="text-sm font-medium text-secondary-text">{analysisData.repo.owner}</span>
            <span className="text-secondary-text">/</span>
            <span className="font-semibold text-primary">{analysisData.repo.name}</span>
          </>
        ) : (
          <span className="text-sm text-secondary-text">No repository loaded</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for future topbar actions */}
        <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-medium">
          U
        </div>
      </div>
    </header>
  );
}
