/**
 * useTheme Hook
 * Manages dark/light theme with localStorage persistence
 */

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Get from localStorage or default to 'dark'
        const stored = localStorage.getItem('theme') as Theme;
        return stored || 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Determine actual theme to apply
        let actualTheme: 'light' | 'dark' = 'dark';

        if (theme === 'auto') {
            // Use system preference
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            actualTheme = theme;
        }

        setResolvedTheme(actualTheme);

        // Apply theme to document
        const root = document.documentElement;
        if (actualTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system theme changes when in auto mode
    useEffect(() => {
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setResolvedTheme(e.matches ? 'dark' : 'light');
            const root = document.documentElement;
            if (e.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return { theme, setTheme, resolvedTheme };
}
