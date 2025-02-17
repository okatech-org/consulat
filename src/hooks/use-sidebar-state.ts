'use client';

import { useState, useEffect } from 'react';

const SIDEBAR_STATE_KEY = 'sidebar-collapsed';

export function useSidebarState(defaultCollapsed: boolean = false) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    // Load initial state from localStorage
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const toggleCollapsed = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem(SIDEBAR_STATE_KEY, String(value));
  };

  return {
    isCollapsed,
    toggleCollapsed,
  };
}
