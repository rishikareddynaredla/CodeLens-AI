import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, GitBranch, Shield, Zap, BookOpen, Link as LinkIcon, FileText, MessageSquare } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAnalysis } from '../context/AnalysisContext';
import { useUser } from '../context/UserContext';

export function LandingPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();
  const { performAnalysis, isLoading, error } = useAnalysis();
  const { profile, openProfile } = useUser();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    // Fire off the analysis
    performAnalysis(repoUrl);
    // Navigate immediately to the dashboard to show loading state
    navigate('/analysis/overview');
  };

  const scrollToAnalyze = (e) => {
    e.preventDefault();
    document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const firstName = profile?.name?.trim().split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col font-sans">
      <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-mono font-bold">C</span>
          </div>
          <span className="text-xl font-serif font-bold text-primary">CodeLens AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary-text">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <Button variant="ghost" onClick={openProfile}>
            {profile ? `Hi, ${firstName}` : 'Sign In'}
          </Button>
          <Button onClick={scrollToAnalyze}>Get Started</Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl text-center space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-primary leading-[1.1]">
            Understand any codebase in seconds.
          </h1>
          <p className="text-xl text-secondary-text max-w-2xl mx-auto leading-relaxed">
            CodeLens AI uses advanced repository intelligence to generate architectural diagrams, file summaries, and contextual onboarding guides automatically.
          </p>

          <form onSubmit={handleAnalyze} id="analyze" className="max-w-xl mx-auto mt-12 relative group scroll-mt-24">
            <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl transition-all duration-500 group-hover:bg-accent/10"></div>
            <div className="relative flex items-center bg-card p-2 rounded-2xl border border-border shadow-soft">
              <GitBranch className="w-5 h-5 ml-4 text-secondary-text shrink-0" />
              <Input
                type="url"
                required
                placeholder="https://github.com/owner/repo"
                className="border-none shadow-none focus-visible:ring-0 bg-transparent text-lg h-14 placeholder:text-secondary-text/50"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <Button type="submit" size="lg" className="rounded-xl px-8" isLoading={isLoading}>
                Analyze
              </Button>
            </div>
            {error && (
              <p className="relative mt-3 text-sm text-red-500 text-center" role="alert">
                {error}
              </p>
            )}
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          id="features"
        >
          {[
            { icon: Shield, title: "Architectural Clarity", desc: "Instantly visualize the structural dependencies and tech stack." },
            { icon: Zap, title: "AI-Powered Chat", desc: "Ask questions about the code and get precise, contextual answers." },
            { icon: BookOpen, title: "Instant Onboarding", desc: "Generated contribution guides so new developers can start shipping on day one." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-border/50 flex items-center justify-center text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
              <p className="text-secondary-text leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <section id="how-it-works" className="mt-32 max-w-5xl mx-auto w-full scroll-mt-24">
          <h2 className="text-3xl font-serif font-bold text-primary text-center mb-4">How it Works</h2>
          <p className="text-secondary-text text-center mb-12">
            Get from a repository URL to a full understanding in four steps.
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: LinkIcon, title: "Paste a repository", desc: "Drop in any public GitHub URL — no account needed." },
              { step: 2, icon: Search, title: "CodeLens analyzes", desc: "We read the metadata, README, file tree, and dependency manifests." },
              { step: 3, icon: FileText, title: "Explore the dashboard", desc: "Architecture, structure, dependencies, and file summaries on one page." },
              { step: 4, icon: MessageSquare, title: "Ask questions", desc: "Chat with AI about how the codebase works." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <li key={step} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card/50">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-mono text-sm mb-4">
                  {step}
                </div>
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-primary mb-2">{title}</h3>
                <p className="text-secondary-text text-sm leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
          <div className="text-center mt-12">
            <Button size="lg" onClick={scrollToAnalyze}>
              Start analyzing
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 text-center text-secondary-text text-sm">
        <p>&copy; {new Date().getFullYear()} CodeLens AI. Crafted for developers.</p>
      </footer>
    </div>
  );
}