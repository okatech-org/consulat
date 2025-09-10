'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggleIntel() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder pendant le chargement - style conforme DGSS
    return (
      <div 
        className="w-20 h-8 rounded-lg animate-pulse" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }} 
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 w-full"
      style={{ 
        color: 'var(--text-secondary)',
        background: 'var(--bg-glass-light)',
        border: '1px solid var(--border-glass-secondary)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--interactive-hover)';
        e.currentTarget.style.borderColor = 'var(--border-glass-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-glass-light)';
        e.currentTarget.style.borderColor = 'var(--border-glass-secondary)';
      }}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-xs">Mode clair</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="text-xs">Mode sombre</span>
        </>
      )}
    </button>
  );
}