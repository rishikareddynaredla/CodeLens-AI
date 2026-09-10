import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../../context/AnalysisContext';
import { useUser } from '../../context/UserContext';
import { Settings, Trash2, History } from 'lucide-react';

export function TopBar() {
  const { analysisData, performAnalysis } = useAnalysis();
  const { profile, recentRepos, clearAll } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const reanalyze = (repo) => {
    setMenuOpen(false);
    navigate('/analysis/overview');
    performAnalysis(repo.url);
  };

  const initials = profile?.initials || 'U';

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
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          title={profile?.name || 'Profile'}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium hover:opacity-90 transition-opacity"
        >
          {initials}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 w-72 bg-white rounded-xl border border-border shadow-lg p-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-semibold text-primary">{profile?.name || 'Guest'}</p>
              <p className="text-xs text-secondary-text">
                {recentRepos.length} recent {recentRepos.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>

            {recentRepos.length > 0 && (
              <div className="py-1 border-b border-border">
                <p className="px-3 py-1 text-xs font-medium text-secondary-text flex items-center gap-1.5">
                  <History className="w-3 h-3" /> Recent repositories
                </p>
                {recentRepos.slice(0, 4).map((repo) => (
                  <button
                    key={`${repo.owner}/${repo.name}`}
                    onClick={() => reanalyze(repo)}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-border/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-primary">
                      {repo.owner}/{repo.name}
                    </span>
                    {repo.language && (
                      <span className="ml-2 text-xs text-secondary-text">{repo.language}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/analysis/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary hover:bg-border/50 transition-colors"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  clearAll();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear all data
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}