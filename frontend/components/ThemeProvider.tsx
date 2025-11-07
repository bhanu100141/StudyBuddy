'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/frontend/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
  }, []);

  return <>{children}</>;
}
