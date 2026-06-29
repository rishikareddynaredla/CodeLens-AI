import React from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Star, GitFork, Clock, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Overview() {
  const { analysisData } = useAnalysis();
  const repo = analysisData?.repo;

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-secondary-text text-lg">Repository data is not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-4">{repo.name}</h1>
        <p className="text-xl text-secondary-text leading-relaxed max-w-3xl">
          {repo.description}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Star, label: "Stars", value: repo.stars.toLocaleString() },
          { icon: GitFork, label: "Forks", value: repo.forks.toLocaleString() },
          { icon: Code2, label: "Language", value: repo.language },
          { icon: Clock, label: "Updated", value: new Date(repo.updatedAt).toLocaleDateString() },
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 p-4 border-border/50 bg-card/40">
            <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center text-primary">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-text">{stat.label}</p>
              <p className="text-lg font-semibold text-primary">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {repo.topics.map(topic => (
          <span key={topic} className="px-3 py-1 rounded-full border border-border bg-transparent text-sm text-secondary-text">
            {topic}
          </span>
        ))}
      </div>

      <Card className="mt-12 bg-white">
        <CardHeader>
          <CardTitle className="font-serif">README Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-p:text-secondary-text">
            <p>{analysisData.readmeSummary}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
