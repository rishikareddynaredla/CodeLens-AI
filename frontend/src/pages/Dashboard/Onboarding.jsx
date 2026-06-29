import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Terminal, Download, Book, Rocket } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';

export function Onboarding() {
  const { analysisData } = useAnalysis();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Developer Onboarding</h2>
        <p className="text-secondary-text">Generated guide to help you start contributing immediately.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-accent" />
              1. Local Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary-bg p-4 rounded-lg font-mono text-sm text-primary mb-4 space-y-2">
              <p>git clone {analysisData?.repo?.url || "https://github.com/..."}</p>
              <p>cd {analysisData?.repo?.name || "repo-name"}</p>
              <p>npm install</p>
            </div>
            <p className="text-secondary-text text-sm">
              Make sure you have Node.js and npm installed before running these commands.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              2. Running Locally
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary-bg p-4 rounded-lg font-mono text-sm text-primary mb-4">
              npm run dev
            </div>
            <p className="text-secondary-text text-sm">
              This will start the development server on localhost.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-secondary-text" />
              Important Files to Know
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex gap-4 pb-4 border-b border-border/50">
                <span className="font-mono text-sm bg-primary-bgSecondary px-2 py-1 rounded self-start shrink-0">
                  src/App.jsx
                </span>
                <span className="text-secondary-text">Main entry point and routing configuration for the application.</span>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-sm bg-primary-bgSecondary px-2 py-1 rounded self-start shrink-0">
                  src/services/api.js
                </span>
                <span className="text-secondary-text">Centralized API client for all backend communication.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-primary text-white md:col-span-2 shadow-xl border-none">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-2">Ready to contribute?</h3>
              <p className="text-white/70">Check out the good first issues on GitHub and submit a PR.</p>
            </div>
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 shrink-0">
              <Rocket className="w-5 h-5" />
              Start Building
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
