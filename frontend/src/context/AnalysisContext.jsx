import React, { createContext, useContext, useState } from 'react';
import { analyzeRepo } from '../services/api';
import { useUser } from './UserContext';

const AnalysisContext = createContext();

const LAST_ANALYSIS_KEY = 'codelens.lastAnalysis';

const restoreLastAnalysis = () => {
  try {
    const raw = localStorage.getItem(LAST_ANALYSIS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AnalysisProvider = ({ children }) => {
  const { addRecentRepo } = useUser();
  const [analysisData, setAnalysisData] = useState(restoreLastAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistLastAnalysis = (data) => {
    try {
      localStorage.setItem(LAST_ANALYSIS_KEY, JSON.stringify(data));
    } catch {
      // Storage can be unavailable (private mode); analysis still works.
    }
  };

  const performAnalysis = async (repoUrl) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeRepo(repoUrl);

      // Map the real backend response to the shape our frontend components expect
      const mapped = {
        repo: {
          name: data.name,
          owner: data.owner,
          description: data.description,
          stars: data.stars,
          forks: data.forks,
          language: data.language,
          url: data.url,
          updatedAt: data.updatedAt,
          topics: data.topics || [],
        },
        readmeSummary: data.summary,
        architecture: data.architecture,
        files: data.fileSummaries?.map(fs => ({ path: fs.file, summary: fs.summary })) || [],
        structure: {
          folders: data.folders || [],
          files: data.files || []
        },
        tree: data.tree || [],
        // Real dependencies returned by the backend dependency service
        dependencies: data.dependencies || [],
        manifests: data.manifests || [],
        packageManager: data.packageManager || null,
        devScript: data.devScript || null,
      };

      setAnalysisData(mapped);
      persistLastAnalysis(mapped);
      addRecentRepo({
        url: data.url,
        name: data.name,
        owner: data.owner,
        description: data.description,
        language: data.language,
        stars: data.stars,
        forks: data.forks,
        topics: data.topics || [],
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Analysis Error:", err);
      // Surface the real backend error instead of injecting mock data,
      // so the UI reflects the actual result of the analysis request.
      setError(err.message || 'Failed to analyze repository');
      setAnalysisData(null);
      setIsLoading(false);
    }
  };

  return (
    <AnalysisContext.Provider value={{ analysisData, isLoading, error, performAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};