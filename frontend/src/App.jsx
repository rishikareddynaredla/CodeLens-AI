import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { AnalysisProvider } from './context/AnalysisContext';

// Import Dashboard components
import { Overview } from './pages/Dashboard/Overview';
import { Architecture } from './pages/Dashboard/Architecture';
import { Structure } from './pages/Dashboard/Structure';
import { Dependencies } from './pages/Dashboard/Dependencies';
import { FileSummaries } from './pages/Dashboard/FileSummaries';
import { ChatInterface } from './pages/Dashboard/ChatInterface';
import { Onboarding } from './pages/Dashboard/Onboarding';

export default function App() {
  return (
    <AnalysisProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/analysis" element={<AppLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="structure" element={<Structure />} />
          <Route path="dependencies" element={<Dependencies />} />
          <Route path="files" element={<FileSummaries />} />
          <Route path="chat" element={<ChatInterface />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="settings" element={<div className="p-8 text-secondary-text">Settings placeholder</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnalysisProvider>
  );
}
