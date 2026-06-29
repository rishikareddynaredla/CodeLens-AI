import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAnalysis } from '../../context/AnalysisContext';

export function AppLayout() {
  const { analysisData, isLoading } = useAnalysis();

  if (!analysisData && !isLoading) {
    // If there's no data and not loading, redirect to landing to input repo
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-primary-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-3">
                  <div className="h-10 bg-border/50 rounded-lg w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-border/50 rounded-lg w-2/3 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-border/50 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
                <div className="h-64 bg-border/50 rounded-2xl animate-pulse mt-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-secondary-text font-medium animate-pulse">Analyzing repository with CodeLens AI...</p>
                  <p className="text-sm text-secondary-text/70">This may take up to a minute depending on repository size.</p>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
