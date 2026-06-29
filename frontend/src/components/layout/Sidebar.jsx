import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, FolderTree, Package, FileText, MessageSquare, BookOpen, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Overview', path: '/analysis/overview', icon: LayoutDashboard },
  { name: 'Architecture', path: '/analysis/architecture', icon: Network },
  { name: 'Structure', path: '/analysis/structure', icon: FolderTree },
  { name: 'Dependencies', path: '/analysis/dependencies', icon: Package },
  { name: 'File Summaries', path: '/analysis/files', icon: FileText },
  { name: 'Chat', path: '/analysis/chat', icon: MessageSquare },
  { name: 'Onboarding Guide', path: '/analysis/onboarding', icon: BookOpen },
];

export function Sidebar() {
  return (
    <div className="w-64 border-r border-border bg-primary-bgSecondary h-screen sticky top-0 flex flex-col hidden md:flex shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-white text-xs font-mono">C</span>
          </div>
          CodeLens
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-border text-primary font-medium" 
                  : "text-secondary-text hover:bg-border/50 hover:text-primary"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <NavLink
          to="/analysis/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive 
                ? "bg-border text-primary font-medium" 
                : "text-secondary-text hover:bg-border/50 hover:text-primary"
            )
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
