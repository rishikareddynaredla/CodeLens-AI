import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { X } from 'lucide-react';

function ProfileForm({ isFirstRun }) {
  const { profile, saveProfile, skipSetup, closeProfile } = useUser();
  const [name, setName] = useState(profile?.name || '');

  const submit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile(name);
      closeProfile();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={profile ? closeProfile : undefined}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-mono font-bold">C</span>
          </div>
          {profile && (
            <button
              type="button"
              onClick={closeProfile}
              className="text-secondary-text hover:text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
          {isFirstRun ? 'Welcome to CodeLens' : 'Your profile'}
        </h2>
        <p className="text-secondary-text mb-6">
          {isFirstRun
            ? 'Add your name so we can personalize your workspace. It only takes a second.'
            : 'Update your display name. Your initials update automatically.'}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-primary-bg"
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            {isFirstRun ? 'Get started' : 'Save changes'}
          </Button>
          {isFirstRun && (
            <button
              type="button"
              onClick={skipSetup}
              className="w-full text-sm text-secondary-text hover:text-primary transition-colors"
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export function ProfileModal() {
  const { profile, skipped, profileModalOpen } = useUser();

  const show = profileModalOpen || (!profile && !skipped);
  if (!show) return null;

  return <ProfileForm key={profile ? 'edit' : 'first-run'} isFirstRun={!profile} />;
}