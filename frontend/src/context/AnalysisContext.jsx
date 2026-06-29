import React, { createContext, useContext, useState } from 'react';
import { analyzeRepo } from '../services/api';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const performAnalysis = async (repoUrl) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeRepo(repoUrl);
      
      // Map the real backend response to the shape our frontend components expect
      setAnalysisData({
        repo: {
          name: data.name,
          owner: data.owner,
          description: data.description,
          stars: data.stars,
          forks: data.forks,
          language: data.language,
          url: data.url,
          updatedAt: new Date().toISOString(), // Mock as backend doesn't provide
          topics: [], // Mock as backend doesn't provide
        },
        readmeSummary: data.summary,
        architecture: data.architecture,
        files: data.fileSummaries?.map(fs => ({ path: fs.file, summary: fs.summary })) || [],
        structure: {
          folders: data.folders || [],
          files: data.files || []
        },
        // Dependencies are not returned by the backend yet, use placeholder
        dependencies: [
            { name: "Placeholder Dependency", version: "^1.0.0", type: "core" }
        ]
      });
    } catch (err) {
      console.error("Analysis Error:", err);
      // Fallback dummy data for presentation if backend is failing/missing
      setError(err.message || 'Failed to analyze repository. Displaying fallback data.');
      
      // We still set some mock data so the UI can be showcased without a real backend
      setTimeout(() => {
        setAnalysisData({
          repo: {
            name: "CodeLens-AI",
            owner: "frontend-demo",
            description: "An AI-powered repository intelligence platform that helps developers understand unfamiliar codebases.",
            stars: 1204,
            forks: 342,
            language: "JavaScript",
            updatedAt: new Date().toISOString(),
            topics: ["ai", "devtools", "react", "nodejs"],
          },
          readmeSummary: "CodeLens AI automatically analyzes entire repositories to provide architectural insights, file summaries, and an interactive chat interface for exploring the codebase. This tool significantly reduces developer onboarding time.",
          architecture: `## CodeLens AI Architecture\n\n**Frontend**\n- React\n- Vite\n- Tailwind CSS\n\n**Backend**\n- Node.js\n- Express\n- OpenRouter\n\n**Database**\n- PostgreSQL\n- Redis`,
          structure: {
            folders: ["src", "src/components", "src/pages", "src/context", "src/services", "src/utils"],
            files: ["src/App.jsx", "src/main.jsx", "src/index.css", "package.json", "README.md", "vite.config.js"]
          },
          dependencies: [
            { name: "react", version: "^18.2.0", type: "core" },
            { name: "framer-motion", version: "^11.0.0", type: "ui" },
            { name: "tailwindcss", version: "^4.0.0", type: "ui" },
          ],
          files: [
            { path: "src/App.jsx", summary: "Main application entry point with routing configuration." },
            { path: "src/services/api.js", summary: "Axios integration for backend communication." },
          ]
        });
        setIsLoading(false);
      }, 1500);
      return; // Exit early so we don't clear loading state incorrectly
    }
    setIsLoading(false);
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
