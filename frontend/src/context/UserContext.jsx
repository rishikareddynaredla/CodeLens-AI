import React, { createContext, useContext, useState } from 'react';

const PROFILE_KEY = 'codelens.user.profile';
const SKIPPED_KEY = 'codelens.user.skipped';
const REPOS_KEY = 'codelens.user.repos';

const UserContext = createContext();

const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => (word[0] || '').toUpperCase())
    .join('') || 'U';

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => read(PROFILE_KEY, null));
  const [skipped, setSkipped] = useState(() => read(SKIPPED_KEY, false));
  const [recentRepos, setRecentRepos] = useState(() => read(REPOS_KEY, []));
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const openProfile = () => setProfileModalOpen(true);
  const closeProfile = () => setProfileModalOpen(false);

  const saveProfile = (name) => {
    const next = {
      name: name.trim(),
      initials: initialsOf(name),
      setupAt: new Date().toISOString(),
    };
    setProfile(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  };

  const skipSetup = () => {
    setSkipped(true);
    setProfileModalOpen(false);
    localStorage.setItem(SKIPPED_KEY, JSON.stringify(true));
  };

  const addRecentRepo = (entry) => {
    setRecentRepos((prev) => {
      const key = `${entry.owner}/${entry.name}`;
      const next = [
        { ...entry, analyzedAt: new Date().toISOString() },
        ...prev.filter((repo) => `${repo.owner}/${repo.name}` !== key),
      ].slice(0, 6);
      localStorage.setItem(REPOS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem(PROFILE_KEY);
  };

  const clearAll = () => {
    clearProfile();
    setSkipped(false);
    localStorage.removeItem(SKIPPED_KEY);
    setRecentRepos([]);
    localStorage.removeItem(REPOS_KEY);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        skipped,
        saveProfile,
        skipSetup,
        recentRepos,
        addRecentRepo,
        clearProfile,
        clearAll,
        profileModalOpen,
        openProfile,
        closeProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};